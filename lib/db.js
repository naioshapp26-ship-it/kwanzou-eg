const { Pool } = require('pg');
const seedData = require('./seed-data');
const { ensureMediaTable } = require('./media-store');
const { prepareStoreForSave, runStartupMigration } = require('./store-persist');

let pool = null;
let dbReady = false;
let lastError = null;

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRESQL_URL ||
    null
  );
}

function getPool() {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function initDb() {
  lastError = null;
  const url = getDatabaseUrl();
  if (!url) {
    console.log('No database URL — set DATABASE_URL (reference Postgres on Railway)');
    return false;
  }
  try {
    const p = getPool();
    if (!p) return false;
    await p.query(`
      CREATE TABLE IF NOT EXISTS store_snapshot (
        id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await ensureMediaTable(p);
    await p.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const existing = await p.query('SELECT 1 FROM store_snapshot WHERE id = 1');
    if (existing.rowCount === 0) {
      const prepared = await prepareStoreForSave(seedData, p);
      await p.query('INSERT INTO store_snapshot (id, data) VALUES (1, $1)', [prepared]);
      console.log('PostgreSQL seeded with default store data');
    } else {
      const { rows } = await p.query('SELECT data FROM store_snapshot WHERE id = 1');
      const current = rows[0]?.data;
      const { data: migrated, changed, reason } = await runStartupMigration(current, p);
      if (changed) {
        await p.query('UPDATE store_snapshot SET data = $1, updated_at = NOW() WHERE id = 1', [migrated]);
        console.log('PostgreSQL store updated on startup:', reason || 'migration');
      }
    }
    dbReady = true;
    console.log('PostgreSQL connected (store + media tables ready)');
    return true;
  } catch (err) {
    lastError = err.message;
    console.error('PostgreSQL init failed:', err.message);
    return false;
  }
}

function getDbStatus() {
  return {
    ready: dbReady,
    configured: !!getDatabaseUrl(),
    error: lastError
  };
}

async function getStore() {
  const p = getPool();
  if (!p || !dbReady) return null;
  const { rows } = await p.query('SELECT data FROM store_snapshot WHERE id = 1');
  return rows[0]?.data || null;
}

async function saveStore(data) {
  const p = getPool();
  if (!p || !dbReady) return { ok: false, error: 'Database not connected' };
  try {
    const prepared = await prepareStoreForSave(data, p);
    await p.query(
      'UPDATE store_snapshot SET data = $1, updated_at = NOW() WHERE id = 1',
      [prepared]
    );
    return { ok: true };
  } catch (err) {
    console.error('saveStore failed:', err.message);
    return { ok: false, error: err.message };
  }
}

function isDbReady() {
  return dbReady;
}

module.exports = { initDb, getStore, saveStore, isDbReady, getPool, getDbStatus, getDatabaseUrl };
