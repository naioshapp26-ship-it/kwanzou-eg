const nodemailer = require('nodemailer');

function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = process.env.SMTP_PASS || '';
  const from = (process.env.SMTP_FROM || user || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass || !from) {
    return { configured: false };
  }
  return {
    configured: true,
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from
  };
}

function getAppUrl() {
  return (process.env.APP_URL || process.env.SITE_URL || 'https://kwanzou-eg-production.up.railway.app').replace(/\/$/, '');
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const smtp = getSmtpConfig();
  if (!smtp.configured) {
    console.warn('SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM on Railway.');
    return { ok: false, error: 'mail_not_configured' };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth
  });

  const subject = 'Reset your Kwanzou EG password';
  const text = [
    'Hello,',
    '',
    'We received a request to reset your password.',
    `Open this link within 1 hour: ${resetUrl}`,
    '',
    'If you did not request this, ignore this email.',
    '',
    'Kwanzou EG'
  ].join('\n');

  const html = `
    <div style="font-family:Cairo,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1A1208">
      <h2 style="color:#FF6B00">Kwanzou EG</h2>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#FF6B00;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset Password</a></p>
      <p style="font-size:13px;color:#6B5348">This link expires in 1 hour. If you did not request this, ignore this email.</p>
    </div>`;

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    text,
    html
  });

  return { ok: true };
}

module.exports = { getSmtpConfig, getAppUrl, sendPasswordResetEmail };
