const crypto = require('crypto');

const COOKIE_NAME = 'kwanzou_admin';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const sessions = new Map();

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  raw.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  return { email, password, configured: !!(email && password) };
}

function verifyAdminCredentials(email, password) {
  const { email: adminEmail, password: adminPassword, configured } = getAdminCredentials();
  if (!configured) return false;
  return email.trim().toLowerCase() === adminEmail && password === adminPassword;
}

function createSession(email) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { email, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function destroySession(token) {
  if (token) sessions.delete(token);
}

function getSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { ...session, token };
}

function setAdminCookie(res, token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`
  );
}

function clearAdminCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.adminSession = session;
  next();
}

function protectAdminStatic(req, res, next) {
  const path = req.path || '';
  if (!path.startsWith('/admin')) return next();
  if (path === '/admin/login.html') return next();
  const session = getSession(req);
  if (session) return next();
  if (path.endsWith('.html') || path === '/admin/' || path === '/admin') {
    return res.redirect(302, '/admin/login.html');
  }
  return res.status(401).send('Unauthorized');
}

module.exports = {
  COOKIE_NAME,
  parseCookies,
  getAdminCredentials,
  verifyAdminCredentials,
  createSession,
  destroySession,
  getSession,
  setAdminCookie,
  clearAdminCookie,
  requireAdmin,
  protectAdminStatic
};
