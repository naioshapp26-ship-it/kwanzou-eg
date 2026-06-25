const crypto = require('crypto');

const COOKIE_NAME = 'kwanzou_admin';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

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

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.DATABASE_URL ||
    'kwanzou-dev-secret-change-me'
  );
}

function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD || '').trim();
  return { email, password, configured: !!(email && password) };
}

function verifyAdminCredentials(email, password) {
  const { email: adminEmail, password: adminPassword, configured } = getAdminCredentials();
  if (!configured) return false;
  return String(email).trim().toLowerCase() === adminEmail && String(password) === adminPassword;
}

function signSession(email) {
  const payload = {
    email: String(email).trim().toLowerCase(),
    exp: Date.now() + SESSION_TTL_MS
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function readSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
  try {
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch (_) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload?.email || !payload?.exp || payload.exp < Date.now()) return null;
    return { email: payload.email, token };
  } catch (_) {
    return null;
  }
}

function createSession(email) {
  return signSession(email);
}

function destroySession(_token) {
  // Stateless cookie — cleared client-side.
}

function getSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  return readSessionToken(token);
}

function setAdminCookie(res, token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
  );
}

function clearAdminCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
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
