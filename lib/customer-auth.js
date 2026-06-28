const crypto = require('crypto');
const { parseCookies } = require('./admin-auth');

const COOKIE_NAME = 'kwanzou_customer';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.DATABASE_URL ||
    'kwanzou-customer-dev-secret'
  );
}

function signCustomerSession(userId, email) {
  const payload = {
    userId: String(userId),
    email: String(email).trim().toLowerCase(),
    exp: Date.now() + SESSION_TTL_MS
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function readCustomerSessionToken(token) {
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
    if (!payload?.userId || !payload?.email || !payload?.exp || payload.exp < Date.now()) return null;
    return {
      userId: payload.userId,
      email: payload.email,
      token
    };
  } catch (_) {
    return null;
  }
}

function createCustomerSession(userId, email) {
  return signCustomerSession(userId, email);
}

function getCustomerSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  return readCustomerSessionToken(token);
}

function setCustomerCookie(res, token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
  );
}

function clearCustomerCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

function requireCustomer(req, res, next) {
  const session = getCustomerSession(req);
  if (!session) return res.status(401).json({ ok: false, error: 'unauthorized' });
  req.customerSession = session;
  next();
}

module.exports = {
  COOKIE_NAME,
  createCustomerSession,
  getCustomerSession,
  setCustomerCookie,
  clearCustomerCookie,
  requireCustomer
};
