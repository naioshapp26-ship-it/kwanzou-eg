const crypto = require('crypto');

const MEDIA_PREFIX = '/api/media/';

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function isMediaRef(value) {
  return typeof value === 'string' && value.startsWith(MEDIA_PREFIX);
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

function hashId(base64, mimeType) {
  return crypto.createHash('sha256').update(`${mimeType}:${base64}`).digest('hex').slice(0, 20);
}

async function ensureMediaTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_media (
      id TEXT PRIMARY KEY,
      mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
      data_base64 TEXT NOT NULL,
      byte_size INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function upsertMedia(pool, dataUrl) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return dataUrl;
  const id = hashId(parsed.base64, parsed.mimeType);
  const byteSize = Buffer.byteLength(parsed.base64, 'utf8');
  await pool.query(
    `INSERT INTO store_media (id, mime_type, data_base64, byte_size, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (id) DO UPDATE SET
       mime_type = EXCLUDED.mime_type,
       data_base64 = EXCLUDED.data_base64,
       byte_size = EXCLUDED.byte_size,
       updated_at = NOW()`,
    [id, parsed.mimeType, parsed.base64, byteSize]
  );
  return `${MEDIA_PREFIX}${id}`;
}

async function replaceDataUrls(value, pool) {
  if (isDataUrl(value)) return upsertMedia(pool, value);
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await replaceDataUrls(item, pool));
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = await replaceDataUrls(item, pool);
    }
    return out;
  }
  return value;
}

async function persistMediaInStore(data, pool) {
  const copy = JSON.parse(JSON.stringify(data));
  return replaceDataUrls(copy, pool);
}

async function getMedia(pool, id) {
  const { rows } = await pool.query(
    'SELECT mime_type, data_base64 FROM store_media WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function migrateEmbeddedMediaInStore(data, pool) {
  return persistMediaInStore(data, pool);
}

module.exports = {
  MEDIA_PREFIX,
  isDataUrl,
  isMediaRef,
  ensureMediaTable,
  persistMediaInStore,
  migrateEmbeddedMediaInStore,
  getMedia
};
