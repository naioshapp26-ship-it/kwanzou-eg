const { applyCatalogMigration, needsCatalogMigration, CATALOG_VERSION } = require('./catalog-defaults');
const { persistMediaInStore, migrateEmbeddedMediaInStore } = require('./media-store');

function stampStore(data) {
  const next = JSON.parse(JSON.stringify(data || {}));
  next.catalogVersion = next.catalogVersion || CATALOG_VERSION;
  next.updatedAt = new Date().toISOString();
  return next;
}

async function prepareStoreForSave(data, pool) {
  const stamped = stampStore(data);
  return persistMediaInStore(stamped, pool);
}

async function runStartupMigration(current, pool) {
  if (!needsCatalogMigration(current)) {
    const hasEmbeddedImages = JSON.stringify(current || {}).includes('data:image');
    if (hasEmbeddedImages) {
      const migrated = await migrateEmbeddedMediaInStore(current, pool);
      migrated.updatedAt = new Date().toISOString();
      return { data: migrated, changed: true, reason: 'media-extract' };
    }
    return { data: current, changed: false };
  }

  const { data: migrated, changed } = applyCatalogMigration(current);
  const withMedia = await migrateEmbeddedMediaInStore(migrated, pool);
  withMedia.updatedAt = new Date().toISOString();
  return { data: withMedia, changed: changed || true, reason: 'catalog-migrate' };
}

module.exports = {
  prepareStoreForSave,
  runStartupMigration,
  stampStore
};
