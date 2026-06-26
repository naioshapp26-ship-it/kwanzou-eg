const express = require('express');
const path = require('path');
const { initDb, getStore, saveStore, isDbReady, getDbStatus, getPool } = require('./lib/db');
const { getMedia } = require('./lib/media-store');
const { sanitizeStoreForPublic } = require('./lib/store-sanitize');
const {
  verifyAdminCredentials,
  verifyAdminLogin,
  createSession,
  destroySession,
  getSession,
  setAdminCookie,
  clearAdminCookie,
  requireAdmin,
  requireSuperAdmin,
  protectAdminStatic,
  getAdminCredentials
} = require('./lib/admin-auth');
const {
  loginCustomer,
  registerCustomer,
  placeOrder,
  subscribeNewsletter,
  updateCustomerProfile,
  changeCustomerPassword
} = require('./lib/public-store-api');
const { listStaffAdmins, addStaffAdmin, deleteStaffAdmin } = require('./lib/admin-staff-api');
const { requestPasswordReset, validateResetToken, resetPasswordWithToken } = require('./lib/password-reset');
const { getSmtpConfig } = require('./lib/mail');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

app.use(express.json({ limit: '50mb' }));

app.get('/api/health', async (_req, res) => {
  const status = getDbStatus();
  const admin = getAdminCredentials();
  const mail = getSmtpConfig();
  res.json({
    ok: true,
    database: status.ready ? 'connected' : 'offline',
    dbConfigured: status.configured,
    dbError: status.error || null,
    adminConfigured: admin.configured,
    mailConfigured: mail.configured,
    time: new Date().toISOString()
  });
});

app.get('/api/media/:id', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool || !isDbReady()) return res.status(503).end();
    const media = await getMedia(pool, req.params.id);
    if (!media) return res.status(404).end();
    const buffer = Buffer.from(media.data_base64, 'base64');
    res.setHeader('Content-Type', media.mime_type || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (err) {
    console.error('GET /api/media', err);
    res.status(500).end();
  }
});

app.get('/api/store', async (_req, res) => {
  try {
    const data = await getStore();
    if (!data) return res.status(503).json({ error: 'Database not connected' });
    res.json(sanitizeStoreForPublic(data));
  } catch (err) {
    console.error('GET /api/store', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/store/admin', requireAdmin, async (_req, res) => {
  try {
    const data = await getStore();
    if (!data) return res.status(503).json({ error: 'Database not connected' });
    res.json(data);
  } catch (err) {
    console.error('GET /api/store/admin', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/store', requireAdmin, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid body' });
    }
    if (req.adminSession?.role !== 'superadmin') {
      const current = await getStore();
      if (current?.staffAdmins) req.body.staffAdmins = current.staffAdmins;
    }
    const result = await saveStore(req.body);
    if (!result.ok) {
      return res.status(result.error === 'Database not connected' ? 503 : 500).json({ error: result.error || 'Save failed' });
    }
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('PUT /api/store', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await verifyAdminLogin(email, password, getStore);
    if (!result.ok) {
      const configured = getAdminCredentials().configured;
      const store = await getStore();
      const hasStaff = (store?.staffAdmins || []).length > 0;
      if (!configured && !hasStaff) {
        return res.status(503).json({ ok: false, error: 'Admin credentials not configured on server' });
      }
      return res.status(401).json({ ok: false, error: 'login_error' });
    }
    const token = createSession(result.email, result.role);
    setAdminCookie(res, token);
    res.json({ ok: true, email: result.email, role: result.role });
  } catch (err) {
    console.error('POST /api/admin/login', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const session = getSession(req);
  destroySession(session?.token);
  clearAdminCookie(res);
  res.json({ ok: true });
});

app.get('/api/admin/session', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ ok: false });
  res.json({ ok: true, email: session.email, role: session.role });
});

app.get('/api/admin/staff', requireAdmin, async (_req, res) => {
  try {
    const staff = await listStaffAdmins();
    res.json({ ok: true, staff });
  } catch (err) {
    console.error('GET /api/admin/staff', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/admin/staff', requireSuperAdmin, async (req, res) => {
  try {
    const result = await addStaffAdmin(req.body || {});
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/admin/staff', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.delete('/api/admin/staff/:id', requireSuperAdmin, async (req, res) => {
  try {
    const result = await deleteStaffAdmin(req.params.id);
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 403;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('DELETE /api/admin/staff', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await loginCustomer(email, password);
    if (!result.ok) {
      const status = result.error === 'offline' ? 503 : 401;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await registerCustomer(req.body || {});
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/auth/register', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = req.body?.email;
    const result = await requestPasswordReset(email);
    if (!result.ok) {
      const status = result.error === 'offline' ? 503 : result.error === 'mail_not_configured' ? 503 : 500;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/auth/forgot-password', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.get('/api/auth/reset-token', async (req, res) => {
  try {
    const result = await validateResetToken(req.query.token);
    if (!result.ok) return res.status(400).json(result);
    res.json({ ok: true });
  } catch (err) {
    console.error('GET /api/auth/reset-token', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    const result = await resetPasswordWithToken(token, password);
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/auth/reset-password', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const result = await placeOrder(req.body || {});
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/orders', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const email = req.body?.email;
    const result = await subscribeNewsletter(email);
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/newsletter', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.patch('/api/account/password', async (req, res) => {
  try {
    const { userId, email, currentPassword, newPassword } = req.body || {};
    const result = await changeCustomerPassword({ userId, email, currentPassword, newPassword });
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 401;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('PATCH /api/account/password', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.patch('/api/account', async (req, res) => {
  try {
    const { userId, email, password, patch } = req.body || {};
    const result = await updateCustomerProfile({ userId, email, password, patch: patch || {} });
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 401;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('PATCH /api/account', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.use(protectAdminStatic);

app.use(express.static(ROOT, {
  maxAge: '1d',
  setHeaders(res, filePath) {
    if (/\.(html|js|css)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('Database init failed:', err.message);
  }
  const admin = getAdminCredentials();
  if (!admin.configured) {
    console.warn('WARNING: Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to enable admin access.');
  }
  if (!getSmtpConfig().configured) {
    console.warn('WARNING: Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM for password reset emails.');
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kwanzou EG → http://0.0.0.0:${PORT} (db: ${isDbReady() ? 'yes' : 'no'})`);
  });
}

start();
