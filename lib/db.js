const { Pool } = require('pg');
const seedData = require('./seed-data');

let pool = null;
let dbReady = false;

function getPool() {
  const url = process.env.DATABASE_URL;
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
  const p = getPool();
  if (!p) {
    console.log('No DATABASE_URL — running without PostgreSQL');
    return false;
  }
  await p.query(`
    CREATE TABLE IF NOT EXISTS store_snapshot (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const existing = await p.query('SELECT 1 FROM store_snapshot WHERE id = 1');
  if (existing.rowCount === 0) {
    await p.query('INSERT INTO store_snapshot (id, data) VALUES (1, $1)', [seedData]);
    console.log('PostgreSQL seeded with default store data');
  }
  dbReady = true;
  console.log('PostgreSQL connected');
  return true;
}

async function getStore() {
  const p = getPool();
  if (!p || !dbReady) return null;
  const { rows } = await p.query('SELECT data FROM store_snapshot WHERE id = 1');
  return rows[0]?.data || null;
}

async function saveStore(data) {
  const p = getPool();
  if (!p || !dbReady) return false;
  await p.query(
    'UPDATE store_snapshot SET data = $1, updated_at = NOW() WHERE id = 1',
    [data]
  );
  return true;
}

function isDbReady() {
  return dbReady;
}

module.exports = { initDb, getStore, saveStore, isDbReady, getPool };
