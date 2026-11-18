import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import {
  generateVerificationCode,
  VERIFICATION_EXPIRY_MINUTES,
  VERIFICATION_MAX_ATTEMPTS,
  VERIFICATION_RESEND_COOLDOWN_SECONDS,
} from '../constants.js';
import { devCodeFallback, sendVerificationEmail } from '../utils/email.js';

const router = Router();

function isNyuEmail(email) {
  return /^[^\s@]+@nyu\.edu$/i.test(email);
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    class_year: user.class_year,
    email_verified: !!user.email_verified,
  };
}

function expiryTimestamp() {
  return new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000).toISOString();
}

// Emails the code (see utils/email.js). Returns what the API response should include:
// { email_sent: true } normally, or { dev_verification_code } in local dev without SMTP.
// Never throws — if sending fails, the user can hit "send a new code" to retry.
async function deliverVerificationCode(user, code) {
  if (devCodeFallback()) {
    console.log(`[DEV] Verification code for ${user.email}: ${code} (expires in ${VERIFICATION_EXPIRY_MINUTES}m)`);
    return { dev_verification_code: code };
  }
  try {
    await sendVerificationEmail({ to: user.email, name: user.name, code });
    return { email_sent: true };
  } catch (err) {
    console.error(`Failed to send verification email to ${user.email}:`, err);
    return { email_sent: false };
  }
}

router.post('/signup', async (req, res) => {
  const { email, name, password, class_year } = req.body || {};
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Name, NYU email, and password are required.' });
  }
  if (!isNyuEmail(email)) {
    return res.status(400).json({ error: 'Please sign up with your @nyu.edu email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existing = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const code = generateVerificationCode();
  const info = await db.run(`INSERT INTO users (email, name, password_hash, class_year, verification_code, verification_expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`, email.toLowerCase(), name, password_hash, class_year || null, code, expiryTimestamp());
  const user = await db.get('SELECT * FROM users WHERE id = ?', info.lastInsertRowid);
  const token = signToken(user);
  const delivery = await deliverVerificationCode(user, code);
  res.status(201).json({ token, user: publicUser(user), ...delivery });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
});

router.post('/verify', requireAuth, async (req, res) => {
  const { code } = req.body || {};
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.email_verified) {
    return res.json({ user: publicUser(user), message: 'Already verified.' });
  }
  if (!code || !user.verification_code) {
    return res.status(400).json({ error: 'Enter the verification code sent to your email.' });
  }
  if (new Date(user.verification_expires_at) < new Date()) {
    return res.status(400).json({ error: 'That code expired. Request a new one.' });
  }
  if (String(code).trim() !== user.verification_code) {
    const attempts = (user.verification_attempts || 0) + 1;
    if (attempts >= VERIFICATION_MAX_ATTEMPTS) {
      await db.run(
        'UPDATE users SET verification_code = NULL, verification_expires_at = NULL, verification_attempts = 0 WHERE id = ?',
        user.id
      );
      return res.status(400).json({ error: 'Too many incorrect tries. Send yourself a new code.' });
    }
    await db.run('UPDATE users SET verification_attempts = ? WHERE id = ?', attempts, user.id);
    const left = VERIFICATION_MAX_ATTEMPTS - attempts;
    return res.status(400).json({ error: `Incorrect code. ${left} ${left === 1 ? 'try' : 'tries'} left.` });
  }

  await db.run('UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires_at = NULL, verification_attempts = 0 WHERE id = ?', user.id);
  const updated = await db.get('SELECT * FROM users WHERE id = ?', user.id);
  res.json({ user: publicUser(updated) });
});

router.post('/resend-verification', requireAuth, async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.email_verified) {
    return res.status(400).json({ error: 'This account is already verified.' });
  }

  // Codes are issued with a fixed lifetime, so issue time = expiry - lifetime.
  if (user.verification_expires_at) {
    const issuedAt = new Date(user.verification_expires_at).getTime() - VERIFICATION_EXPIRY_MINUTES * 60 * 1000;
    const waitSeconds = Math.ceil(VERIFICATION_RESEND_COOLDOWN_SECONDS - (Date.now() - issuedAt) / 1000);
    if (waitSeconds > 0) {
      return res.status(429).json({ error: `Please wait ${waitSeconds}s before requesting another code.` });
    }
  }

  const code = generateVerificationCode();
  await db.run(
    'UPDATE users SET verification_code = ?, verification_expires_at = ?, verification_attempts = 0 WHERE id = ?',
    code,
    expiryTimestamp(),
    user.id
  );
  const delivery = await deliverVerificationCode(user, code);
  if (delivery.email_sent === false) {
    return res.status(502).json({ error: "We couldn't send the email. Please try again in a minute." });
  }
  res.json(delivery);
});

export default router;
