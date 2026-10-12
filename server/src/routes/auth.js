import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { generateVerificationCode, VERIFICATION_EXPIRY_MINUTES } from '../constants.js';

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

// No email provider is wired up yet, so the verification code is handed back in the
// response and logged server-side instead of actually being emailed. Swap this out for
// a real send (e.g. Resend/SendGrid) before relying on this for a real launch.
function issueDevVerificationCode(email) {
  const code = generateVerificationCode();
  console.log(`[DEV] Verification code for ${email}: ${code} (expires in ${VERIFICATION_EXPIRY_MINUTES}m)`);
  return code;
}

router.post('/signup', (req, res) => {
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

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const code = issueDevVerificationCode(email.toLowerCase());
  const info = db
    .prepare(
      `INSERT INTO users (email, name, password_hash, class_year, verification_code, verification_expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(email.toLowerCase(), name, password_hash, class_year || null, code, expiryTimestamp());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user), dev_verification_code: code });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
});

router.post('/verify', requireAuth, (req, res) => {
  const { code } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
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
  if (code !== user.verification_code) {
    return res.status(400).json({ error: 'Incorrect code. Please try again.' });
  }

  db.prepare(
    'UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?'
  ).run(user.id);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  res.json({ user: publicUser(updated) });
});

router.post('/resend-verification', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.email_verified) {
    return res.status(400).json({ error: 'This account is already verified.' });
  }

  const code = issueDevVerificationCode(user.email);
  db.prepare('UPDATE users SET verification_code = ?, verification_expires_at = ? WHERE id = ?').run(
    code,
    expiryTimestamp(),
    user.id
  );
  res.json({ dev_verification_code: code });
});

export default router;
