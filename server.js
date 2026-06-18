const express = require('express');
const path = require('path');
const { initDb, getStore, saveStore, isDbReady, getDbStatus, getPool } = require('./lib/db');
const { getMedia } = require('./lib/media-store');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

app.use(express.json({ limit: '50mb' }));

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
