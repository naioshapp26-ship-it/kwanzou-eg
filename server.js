const express = require('express');
const path = require('path');
const fs = require('fs');
const { initDb, getStore, saveStore, isDbReady, getDbStatus, getPool } = require('./lib/db');
const { getMedia, upsertMedia, isDataUrl } = require('./lib/media-store');
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
  getCustomerAccount,
  placeOrder,
  subscribeNewsletter,
  updateCustomerProfile,
  changeCustomerPassword,
  updateCustomerWishlist,
  submitProductReview
} = require('./lib/public-store-api');
const { submitContactMessage } = require('./lib/contact-api');
const { listStaffAdmins, getStaffAdminById, addStaffAdmin, updateStaffAdmin, deleteStaffAdmin } = require('./lib/admin-staff-api');
const { requestPasswordReset, validateResetToken, resetPasswordWithToken } = require('./lib/password-reset');
const { getSmtpConfig, getResendConfig, isMailConfigured, getMailStatus } = require('./lib/mail');
const {
  createCustomerSession,
  getCustomerSession,
  setCustomerCookie,
  clearCustomerCookie,
  requireCustomer
} = require('./lib/customer-auth');
const {
  listAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('./lib/admin-notifications');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

app.use(express.json({ limit: '50mb' }));

app.get('/api/health', async (_req, res) => {
  const status = getDbStatus();
  const admin = getAdminCredentials();
  const mailStatus = getMailStatus();
  res.json({
    ok: true,
    database: status.ready ? 'connected' : 'offline',
    dbConfigured: status.configured,
    dbError: status.error || null,
    adminConfigured: admin.configured,
    mailConfigured: mailStatus.configured,
    mailProvider: mailStatus.provider,
    mailReason: mailStatus.reason || null,
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

// Upload a single image immediately (instead of embedding it in the store
// JSON) so saving the store stays a small, fast request.
app.post('/api/admin/media', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool || !isDbReady()) return res.status(503).json({ ok: false, error: 'Database not connected' });
    const dataUrl = req.body?.dataUrl;
    if (!isDataUrl(dataUrl)) return res.status(400).json({ ok: false, error: 'Invalid image' });
    const url = await upsertMedia(pool, dataUrl);
    res.json({ ok: true, url });
  } catch (err) {
    console.error('POST /api/admin/media', err);
    res.status(500).json({ ok: false, error: 'Server error' });
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

app.get('/api/admin/staff/:id', requireAdmin, async (req, res) => {
  try {
    const admin = await getStaffAdminById(req.params.id);
    if (!admin) return res.status(404).json({ ok: false, error: 'admin_staff_not_found' });
    res.json({ ok: true, admin });
  } catch (err) {
    console.error('GET /api/admin/staff/:id', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.patch('/api/admin/staff/:id', requireSuperAdmin, async (req, res) => {
  try {
    const result = await updateStaffAdmin(req.params.id, req.body || {});
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 403;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('PATCH /api/admin/staff/:id', err);
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
    const token = createCustomerSession(result.user.id, result.user.email);
    setCustomerCookie(res, token);
    res.json(result);
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearCustomerCookie(res);
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await registerCustomer(req.body || {});
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    const token = createCustomerSession(result.user.id, result.user.email);
    setCustomerCookie(res, token);
    res.json(result);
  } catch (err) {
    console.error('POST /api/auth/register', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.get('/api/account/me', requireCustomer, async (req, res) => {
  try {
    const result = await getCustomerAccount(req.customerSession.userId);
    if (!result.ok) {
      const status = result.error === 'offline' ? 503 : 401;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('GET /api/account/me', err);
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
    const body = { ...(req.body || {}) };
    const session = getCustomerSession(req);
    if (body.userId && session && body.userId !== session.userId) {
      return res.status(403).json({ ok: false, error: 'unauthorized' });
    }
    if (body.userId && !session) body.userId = null;
    if (session && !body.userId) body.userId = session.userId;
    const result = await placeOrder(body);
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

app.post('/api/contact', async (req, res) => {
  try {
    const result = await submitContactMessage(req.body || {});
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/contact', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/reviews', requireCustomer, async (req, res) => {
  try {
    const { orderId, productId, rating, text } = req.body || {};
    const result = await submitProductReview({
      userId: req.customerSession.userId,
      orderId,
      productId,
      rating,
      text
    });
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503
        : result.error === 'unauthorized' ? 401 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/reviews', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.patch('/api/account/password', requireCustomer, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const result = await changeCustomerPassword({
      userId: req.customerSession.userId,
      email: req.customerSession.email,
      currentPassword,
      newPassword
    });
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

app.patch('/api/account', requireCustomer, async (req, res) => {
  try {
    const { password, patch } = req.body || {};
    const result = await updateCustomerProfile({
      userId: req.customerSession.userId,
      email: req.customerSession.email,
      password,
      patch: patch || {}
    });
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

app.patch('/api/account/wishlist', requireCustomer, async (req, res) => {
  try {
    const { wishlist } = req.body || {};
    const result = await updateCustomerWishlist({
      userId: req.customerSession.userId,
      email: req.customerSession.email,
      wishlist
    });
    if (!result.ok) {
      const status = result.error === 'offline' || result.error === 'save_failed' ? 503 : 401;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('PATCH /api/account/wishlist', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.get('/api/admin/notifications', requireAdmin, async (_req, res) => {
  try {
    const result = await listAdminNotifications();
    if (!result.ok) return res.status(503).json(result);
    res.json(result);
  } catch (err) {
    console.error('GET /api/admin/notifications', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.patch('/api/admin/notifications/read-all', requireAdmin, async (_req, res) => {
  try {
    const result = await markAllNotificationsRead();
    if (!result.ok) return res.status(503).json(result);
    res.json(result);
  } catch (err) {
    console.error('PATCH /api/admin/notifications/read-all', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.patch('/api/admin/notifications/:id/read', requireAdmin, async (req, res) => {
  try {
    const result = await markNotificationRead(req.params.id);
    if (!result.ok) {
      const status = result.error === 'not_found' ? 404 : 503;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('PATCH /api/admin/notifications/:id/read', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.use(protectAdminStatic);

function requestOrigin(req) {
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost';
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http') || 'https';
  return `${proto}://${host}`;
}

function toAbsoluteUrl(req, value) {
  if (!value) return '';
  const s = String(value);
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${requestOrigin(req)}${path}`;
}

function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Inject Open Graph tags so WhatsApp / Facebook show the product image preview.
app.get('/product.html', async (req, res, next) => {
  try {
    const filePath = path.join(ROOT, 'product.html');
    let html = await fs.promises.readFile(filePath, 'utf8');
    const id = typeof req.query.id === 'string' ? req.query.id.trim() : '';
    if (id) {
      const store = await getStore();
      const product = (store?.products || []).find(p => p.id === id);
      if (product) {
        const name = product.nameAr || product.name || 'Kwanzou EG';
        const desc = (product.descAr || product.descEn || name).slice(0, 180);
        const image = toAbsoluteUrl(req, product.image || product.images?.[0] || '');
        const url = `${requestOrigin(req)}/product.html?id=${encodeURIComponent(id)}`;
        const meta = `
  <title>${escapeHtmlAttr(name)} | Kwanzou EG</title>
  <meta name="description" content="${escapeHtmlAttr(desc)}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Kwanzou EG">
  <meta property="og:title" content="${escapeHtmlAttr(name)}">
  <meta property="og:description" content="${escapeHtmlAttr(desc)}">
  <meta property="og:url" content="${escapeHtmlAttr(url)}">
  ${image ? `<meta property="og:image" content="${escapeHtmlAttr(image)}">` : ''}
  ${image ? `<meta property="og:image:alt" content="${escapeHtmlAttr(name)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtmlAttr(name)}">
  <meta name="twitter:description" content="${escapeHtmlAttr(desc)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtmlAttr(image)}">` : ''}
`;
        html = html.replace(/<title>[^<]*<\/title>/i, '');
        html = html.replace(/<\/head>/i, `${meta}</head>`);
      }
    }
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});

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
  if (!isMailConfigured()) {
    const mail = getMailStatus();
    if (mail.reason === 'placeholder_pass') {
      console.warn('WARNING: SMTP_PASS looks like a placeholder. Create a Gmail App Password and set SMTP_PASS on Railway.');
    } else {
      console.warn('WARNING: Set RESEND_API_KEY + RESEND_FROM or SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM for password reset emails.');
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kwanzou EG → http://0.0.0.0:${PORT} (db: ${isDbReady() ? 'yes' : 'no'})`);
  });
}

start();
