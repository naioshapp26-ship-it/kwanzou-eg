const crypto = require('crypto');
const { getPool, isDbReady, getStore, saveStore } = require('./db');
const { getAppUrl, sendPasswordResetEmail } = require('./mail');

const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

async function ensureResetTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens (email)');
}

async function findCustomerByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  const store = await getStore();
  if (!store) return null;
  const user = (store.users || []).find(u => u.email.toLowerCase() === normalized);
  if (!user || user.role === 'superadmin' || user.role === 'admin') return null;
  if ((store.staffAdmins || []).some(a => a.email.toLowerCase() === normalized)) return null;
  return user;
}

async function requestPasswordReset(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    return { ok: true, message: 'reset_email_sent' };
  }

  const pool = getPool();
  if (!pool || !isDbReady()) return { ok: false, error: 'offline' };

  const user = await findCustomerByEmail(normalized);
  if (!user) {
    console.log('Password reset requested for unknown customer email:', normalized);
    return { ok: true, message: 'reset_email_sent', registered: false };
  }

  await ensureResetTable(pool);
  await pool.query('DELETE FROM password_reset_tokens WHERE email = $1 OR expires_at < NOW()', [normalized]);

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await pool.query(
    'INSERT INTO password_reset_tokens (email, token_hash, expires_at) VALUES ($1, $2, $3)',
    [normalized, tokenHash, expiresAt]
  );

  const resetUrl = `${getAppUrl()}/reset-password.html?token=${encodeURIComponent(token)}`;
  const mail = await sendPasswordResetEmail({ to: normalized, resetUrl });
  if (!mail.ok) {
    await pool.query('DELETE FROM password_reset_tokens WHERE token_hash = $1', [tokenHash]);
    console.error('Password reset mail failed for', normalized, mail.detail || mail.error);
    return { ok: false, error: mail.error || 'mail_failed' };
  }

  console.log('Password reset link created for', normalized);
  return { ok: true, message: 'reset_email_sent', registered: true };
}

async function validateResetToken(token) {
  const pool = getPool();
  if (!pool || !isDbReady() || !token) return { ok: false, error: 'reset_invalid' };
  await ensureResetTable(pool);
  const { rows } = await pool.query(
    'SELECT email, expires_at FROM password_reset_tokens WHERE token_hash = $1',
    [hashToken(token)]
  );
  const row = rows[0];
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: 'reset_invalid' };
  }
  return { ok: true, email: row.email };
}

async function resetPasswordWithToken(token, newPassword) {
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, error: 'register_error_pass' };
  }

  const check = await validateResetToken(token);
  if (!check.ok) return check;

  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };

  const user = (store.users || []).find(u => u.email.toLowerCase() === check.email);
  if (!user) return { ok: false, error: 'reset_invalid' };

  user.password = String(newPassword);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };

  const pool = getPool();
  await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [check.email]);

  return { ok: true, message: 'reset_password_done' };
}

module.exports = {
  requestPasswordReset,
  validateResetToken,
  resetPasswordWithToken
};
