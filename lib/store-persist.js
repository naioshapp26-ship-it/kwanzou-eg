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

const TRIAL_LOGO_RE = /^assets\/logo(-.*)?\.svg$/i;

function normalizeBrandLogo(data) {
  if (!data?.settings) return false;
  const logo = data.settings.logo;
  if (typeof logo === 'string' && (TRIAL_LOGO_RE.test(logo) || logo.includes('logo-v'))) {
    data.settings.logo = 'assets/logo.png';
    return true;
  }
  return false;
}

async function runStartupMigration(current, pool) {
  let data = current;
  let changed = false;

  if (normalizeBrandLogo(data)) {
    data = JSON.parse(JSON.stringify(data));
    changed = true;
  }

  if (!needsCatalogMigration(data)) {
    const hasEmbeddedImages = JSON.stringify(data || {}).includes('data:image');
    if (hasEmbeddedImages) {
      data = await migrateEmbeddedMediaInStore(data, pool);
      data.updatedAt = new Date().toISOString();
      return { data, changed: true, reason: 'media-extract' };
    }
    return { data, changed, reason: changed ? 'logo-restore' : undefined };
  }

  const { data: migrated, changed: catalogChanged } = applyCatalogMigration(data);
  normalizeBrandLogo(migrated);
  const withMedia = await migrateEmbeddedMediaInStore(migrated, pool);
  withMedia.updatedAt = new Date().toISOString();
  return { data: withMedia, changed: catalogChanged || changed || true, reason: 'catalog-migrate' };
}

module.exports = {
  prepareStoreForSave,
  runStartupMigration,
  stampStore
};
