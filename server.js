const express = require('express');
const path = require('path');
const { initDb, getStore, saveStore, isDbReady, getDbStatus } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

app.use(express.json({ limit: '15mb' }));

app.get('/api/health', async (_req, res) => {
  const status = getDbStatus();
  res.json({
    ok: true,
    database: status.ready ? 'connected' : 'offline',
    dbConfigured: status.configured,
    dbError: status.error || null,
    time: new Date().toISOString()
  });
});

app.get('/api/store', async (_req, res) => {
  try {
    const data = await getStore();
    if (data) return res.json(data);
    res.status(503).json({ error: 'Database not connected' });
  } catch (err) {
    console.error('GET /api/store', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/store', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid body' });
    }
    const ok = await saveStore(req.body);
    if (!ok) return res.status(503).json({ error: 'Database not connected' });
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/store', err);
    res.status(500).json({ error: 'Server error' });
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kwanzou EG → http://0.0.0.0:${PORT} (db: ${isDbReady() ? 'yes' : 'no'})`);
  });
}

start();
