/**
 * Keep products linked to the real category slug.
 * Runs on every store save / startup so Arabic-name orphans cannot linger.
 */

const AR_SLUG_MAP = {
  بيرسينج: 'piercing',
  بروش: 'brooch',
  سلاسل: 'necklaces',
  أساور: 'bracelets',
  اساور: 'bracelets',
  حلقان: 'earrings',
  خواتم: 'rings',
  خلخال: 'anklet',
  ساعات: 'watches',
  ميداليه: 'medallion',
  مديليه: 'medallion',
  'منتجات اخرى': 'other',
  'منتجات أخرى': 'other',
  eeee: 'piercing',
  // Historical earrings parent slug before rename to "earrings".
  accessories: 'earrings'
};

const PRODUCT_SLUG_ALIASES = {
  ...AR_SLUG_MAP,
  'bracelets-hand chain': 'bracelets-hand-chain',
  Accessories: 'earrings',
  accessories: 'earrings'
};

function hasArabic(value) {
  return /[\u0600-\u06FF]/.test(String(value || ''));
}

function isJunkSlug(value) {
  const s = String(value || '');
  if (!s) return true;
  if (/^(.)\1{2,}$/.test(s)) return true; // eeee, aaa, ----
  if (/\s/.test(s)) return true;
  return false;
}

function slugifyLatin(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeCategorySlugs(categories) {
  if (!Array.isArray(categories)) return false;
  let changed = false;
  const used = new Set(categories.map(c => c.slug).filter(Boolean));

  for (const cat of categories) {
    if (!cat || typeof cat !== 'object') continue;
    const current = String(cat.slug || '');
    const preferred =
      AR_SLUG_MAP[current] ||
      AR_SLUG_MAP[cat.nameAr] ||
      slugifyLatin(cat.name) ||
      '';

    const needsFix = !current || isJunkSlug(current) || hasArabic(current);
    if (!needsFix) continue;
    if (!preferred || preferred === current) continue;
    if (used.has(preferred) && preferred !== current) continue;

    used.delete(current);
    used.add(preferred);
    cat.slug = preferred;
    changed = true;
  }
  return changed;
}

function repairProductCategoryLinks(products, categories) {
  if (!Array.isArray(products) || !Array.isArray(categories)) return false;

  const bySlug = new Map();
  const byNameAr = new Map();
  const byName = new Map();
  categories.forEach(c => {
    if (!c) return;
    if (c.slug) bySlug.set(c.slug, c);
    if (c.nameAr) byNameAr.set(c.nameAr, c);
    if (c.name) byName.set(c.name, c);
  });

  let changed = false;
  products.forEach(p => {
    if (!p || typeof p !== 'object') return;
    const slug = p.categorySlug || '';
    let cat = bySlug.get(slug);
    if (!cat && PRODUCT_SLUG_ALIASES[slug]) cat = bySlug.get(PRODUCT_SLUG_ALIASES[slug]);
    if (!cat) cat = byNameAr.get(slug) || byName.get(slug);
    if (!cat && p.category) {
      cat = byNameAr.get(p.category) || byName.get(p.category) || bySlug.get(p.category);
      if (!cat && PRODUCT_SLUG_ALIASES[p.category]) cat = bySlug.get(PRODUCT_SLUG_ALIASES[p.category]);
    }
    if (!cat) return;
    if (p.categorySlug === cat.slug && (p.category === cat.name || p.category === cat.nameAr)) return;
    p.categorySlug = cat.slug;
    p.category = cat.name || cat.nameAr;
    changed = true;
  });
  return changed;
}

function repairCategoryProductLinks(data) {
  if (!data || typeof data !== 'object') return { changed: false, data };
  const next = data;
  next.categories = Array.isArray(next.categories) ? next.categories : [];
  next.products = Array.isArray(next.products) ? next.products : [];
  const catChanged = normalizeCategorySlugs(next.categories);
  const prodChanged = repairProductCategoryLinks(next.products, next.categories);
  return { changed: catChanged || prodChanged, data: next };
}

module.exports = {
  AR_SLUG_MAP,
  PRODUCT_SLUG_ALIASES,
  hasArabic,
  isJunkSlug,
  slugifyLatin,
  normalizeCategorySlugs,
  repairProductCategoryLinks,
  repairCategoryProductLinks
};
