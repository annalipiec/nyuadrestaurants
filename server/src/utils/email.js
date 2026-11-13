// Sends verification emails over SMTP. Defaults to Gmail (smtp.gmail.com:465), using a Google
// "app password" — set SMTP_USER (the Gmail address) and SMTP_PASS (the 16-char app password).
// SMTP_HOST / SMTP_PORT / EMAIL_FROM override the defaults if you switch providers later.
//
// With SMTP unset, local dev falls back to showing the code on screen (see routes/auth.js);
// on Vercel that fallback is disabled, so a missing config fails loudly instead of leaking codes.
import nodemailer from 'nodemailer';
import { VERIFICATION_EXPIRY_MINUTES } from '../constants.js';

export function emailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// True only for local development without SMTP — the one case where the code is returned
// in the API response instead of being emailed.
export function devCodeFallback() {
  return !emailConfigured() && !process.env.VERCEL;
}

let transporter;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendVerificationEmail({ to, name, code }) {
  if (!emailConfigured()) {
    throw new Error('Email is not configured: set SMTP_USER and SMTP_PASS.');
  }
  const from = process.env.EMAIL_FROM || `"AD Bites" <${process.env.SMTP_USER}>`;
  const firstName = (name || '').split(' ')[0] || 'there';

  await getTransporter().sendMail({
    from,
    to,
    subject: `${code} is your AD Bites verification code`,
    text: [
      `Hi ${firstName},`,
      '',
      `Your AD Bites verification code is: ${code}`,
      '',
      `It expires in ${VERIFICATION_EXPIRY_MINUTES} minutes. Enter it in the app to start leaving tips and adding restaurants.`,
      '',
      "If you didn't sign up for AD Bites, you can ignore this email.",
    ].join('\n'),
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 420px; margin: 0 auto; color: #1a022a;">
        <h2 style="color: #57068c; margin-bottom: 4px;">AD Bites</h2>
        <p>Hi ${escapeHtml(firstName)},</p>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; background: #f1e9f7; color: #57068c; padding: 12px 16px; border-radius: 12px; text-align: center;">${code}</p>
        <p>It expires in ${VERIFICATION_EXPIRY_MINUTES} minutes. Enter it in the app to start leaving tips and adding restaurants.</p>
        <p style="color: #4e057e; font-size: 13px;">If you didn't sign up for AD Bites, you can ignore this email.</p>
      </div>`,
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
