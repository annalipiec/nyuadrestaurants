// AD Bites team members ("admins") are configured by email, not stored in the DB:
// ADMIN_EMAILS="a@nyu.edu,b@nyu.edu" (Vercel env var / server/.env). Admins approve or reject
// restaurants students suggest, and get an email when a new one comes in.
import db from '../db/index.js';

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  return Boolean(email) && adminEmails().includes(String(email).toLowerCase());
}

// Use after requireAuth. Checks the DB email (not just the JWT) so removing someone from
// ADMIN_EMAILS takes effect immediately.
export async function requireAdmin(req, res, next) {
  const user = await db.get('SELECT email FROM users WHERE id = ?', req.user.id);
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ error: 'Only the AD Bites team can do that.' });
  }
  next();
}
