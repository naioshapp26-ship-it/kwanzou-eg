const nodemailer = require('nodemailer');

function isPlaceholderPass(pass) {
  const p = String(pass || '').trim().toLowerCase();
  if (!p || p.length < 8) return true;
  return /x{3,}|placeholder|your[- ]?app[- ]?password|app password|changeme|example|replace|xxxx/.test(p);
}

function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = process.env.SMTP_PASS || '';
  const from = (process.env.SMTP_FROM || user || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass || !from) {
    return { configured: false, reason: 'missing' };
  }
  if (isPlaceholderPass(pass)) {
    return { configured: false, reason: 'placeholder_pass' };
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

function getResendConfig() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM || process.env.SMTP_FROM || '').trim();
  if (!apiKey || !from) return { configured: false };
  return { configured: true, apiKey, from };
}

function isMailConfigured() {
  return getMailStatus().configured;
}

function getMailStatus() {
  const resend = getResendConfig();
  const smtp = getSmtpConfig();
  if (resend.configured) {
    return { configured: true, provider: 'resend' };
  }
  if (smtp.configured) {
    return { configured: true, provider: 'smtp' };
  }
  return {
    configured: false,
    provider: smtp.reason === 'placeholder_pass' ? 'smtp_invalid' : 'none',
    reason: smtp.reason || 'missing'
  };
}

function getAppUrl() {
  return (process.env.APP_URL || process.env.SITE_URL || 'https://kwanzou-eg-production.up.railway.app').replace(/\/$/, '');
}

function buildResetEmail(resetUrl) {
  const subject = 'Reset your Kwanzou EG password | استعادة كلمة المرور';
  const text = [
    'Hello,',
    '',
    'We received a request to reset your Kwanzou EG password.',
    `Open this link within 1 hour: ${resetUrl}`,
    '',
    'If you did not request this, ignore this email.',
    '',
    'Kwanzou EG — hello@kwanzou-eg.com'
  ].join('\n');

  const html = `
    <div style="font-family:Cairo,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1A1208;line-height:1.6">
      <h2 style="color:#FF6B00;margin-bottom:8px">Kwanzou EG</h2>
      <p>We received a request to reset your password.</p>
      <p dir="rtl">استلمنا طلب لإعادة تعيين كلمة المرور.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#FF6B00;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password / إعادة التعيين</a>
      </p>
      <p style="font-size:13px;color:#6B5348">Link expires in 1 hour. / الرابط صالح لمدة ساعة.</p>
    </div>`;

  return { subject, text, html };
}

async function sendViaResend({ to, from, subject, html, text, apiKey }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [to], subject, html, text })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Resend API error:', data?.message || res.status);
    return { ok: false, error: 'mail_failed', detail: data?.message || `HTTP ${res.status}` };
  }
  console.log('Password reset email sent via Resend to', to, 'id:', data.id);
  return { ok: true, provider: 'resend' };
}

async function sendViaSmtp({ to, from, subject, html, text, smtp }) {
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 15000,
    greetingTimeout: 15000
  });

  await transporter.sendMail({ from, to, subject, text, html });
  console.log('Password reset email sent via SMTP to', to);
  return { ok: true, provider: 'smtp' };
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const { subject, text, html } = buildResetEmail(resetUrl);
  const resend = getResendConfig();
  const smtp = getSmtpConfig();

  if (!resend.configured && !smtp.configured) {
    console.warn('Mail not configured — set RESEND_API_KEY + RESEND_FROM or SMTP_* on Railway.');
    return { ok: false, error: 'mail_not_configured' };
  }

  try {
    if (resend.configured) {
      return await sendViaResend({
        to,
        from: resend.from,
        subject,
        html,
        text,
        apiKey: resend.apiKey
      });
    }
    return await sendViaSmtp({
      to,
      from: smtp.from,
      subject,
      html,
      text,
      smtp
    });
  } catch (err) {
    console.error('Password reset email failed:', err.message);
    return { ok: false, error: 'mail_failed', detail: err.message };
  }
}

module.exports = {
  getSmtpConfig,
  getResendConfig,
  isMailConfigured,
  getMailStatus,
  getAppUrl,
  sendPasswordResetEmail
};
