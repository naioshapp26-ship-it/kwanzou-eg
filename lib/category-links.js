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

/** Prefer these unique child slugs when a child wrongly reuses the parent slug. */
const CHILD_NAME_SLUGS = {
  'سلاسل كوين': 'necklaces-queen',
  'سلاسل كوين ': 'necklaces-queen',
  'drop necklace': 'necklaces-drop',
  'سلاسل فرعوني و اسلامي': 'necklaces-pharaonic',
  'اسماء-حروف': 'necklaces-letters',
  'Long necklace': 'long-necklace',
  'Statement Necklaces': 'necklaces-statement',
  دبله: 'rings-band',
  'pinky ring': 'rings-pinky',
  'انسيالات صيفي': 'bracelets-summer',
  'انسيالات ب 40': 'bracelets-40',
  اساور: 'bracelets-asawer',
  انسيالات: 'fences',
  'FREE SIZE BRACELET': 'a-bracelet',
  'hand chain': 'bracelets-hand-chain'
};

const PRODUCT_SLUG_ALIASES = {
  ...AR_SLUG_MAP,
  'bracelets-hand chain': 'bracelets-hand-chain',
  Accessories: 'earrings',
  accessories: 'earrings',
  'necklaces-trendy': 'necklaces-queen',
  'necklaces-pendant': 'necklaces-letters'
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

function isNumericSlug(value) {
  return /^\d+$/.test(String(value || ''));
}

function uniqueSlug(base, used) {
  let slug = base || 'category';
  if (!used.has(slug)) return slug;
  let i = 2;
  while (used.has(`${slug}-${i}`)) i += 1;
  return `${slug}-${i}`;
}

function preferredChildSlug(cat) {
  const name = String(cat?.name || '').trim();
  const nameAr = String(cat?.nameAr || '').trim();
  return (
    CHILD_NAME_SLUGS[name] ||
    CHILD_NAME_SLUGS[nameAr] ||
    CHILD_NAME_SLUGS[`${name} `] ||
    slugifyLatin(name) ||
    slugifyLatin(nameAr) ||
    ''
  );
}

function normalizeCategorySlugs(categories) {
  if (!Array.isArray(categories)) return false;
  let changed = false;
  const used = new Set(categories.map(c => c.slug).filter(Boolean));

  // 1) Fix Arabic / junk / alias / spaced / numeric slugs on any category.
  for (const cat of categories) {
    if (!cat || typeof cat !== 'object') continue;
    const current = String(cat.slug || '');
    const preferred =
      CHILD_NAME_SLUGS[String(cat.name || '').trim()] ||
      CHILD_NAME_SLUGS[String(cat.nameAr || '').trim()] ||
      AR_SLUG_MAP[current] ||
      AR_SLUG_MAP[cat.nameAr] ||
      slugifyLatin(cat.name) ||
      slugifyLatin(current) ||
      '';

    const needsFix =
      !current ||
      isJunkSlug(current) ||
      hasArabic(current) ||
      isNumericSlug(current) ||
      /\s/.test(current);
    if (!needsFix) continue;
    if (!preferred || preferred === current) continue;
    // Don't collapse a child onto an existing unrelated slug unless mapped explicitly.
    if (used.has(preferred) && preferred !== current) {
      const parent = categories.find(c => c.id === cat.parentId);
      if (parent && preferred === parent.slug) {
        // handled in step 2
        continue;
      }
      // If preferred taken, uniquify below after assigning base.
      const next = uniqueSlug(preferred, used);
      if (next === current) continue;
      used.delete(current);
      used.add(next);
      cat.slug = next;
      changed = true;
      continue;
    }

    used.delete(current);
    used.add(preferred);
    cat.slug = preferred;
    changed = true;
  }

  // 2) Children must not reuse a parent's slug (or any sibling / junk slug).
  const byId = new Map(categories.map(c => [c.id, c]));
  for (const cat of categories) {
    if (!cat?.parentId) continue;
    const parent = byId.get(cat.parentId);
    if (!parent) continue;
    const current = String(cat.slug || '');
    const collidesWithParent = current && current === parent.slug;
    const duplicates = categories.filter(c => c.slug === current);
    const collidesWithSibling = duplicates.length > 1;
    const badChildSlug = isJunkSlug(current) || isNumericSlug(current) || hasArabic(current) || /\s/.test(current);
    if (!collidesWithParent && !collidesWithSibling && !badChildSlug) continue;

    const base = preferredChildSlug(cat) || slugifyLatin(current) || `${parent.slug}-item`;
    // Don't keep a slug that still equals the parent.
    const nextBase = base === parent.slug ? `${parent.slug}-item` : base;
    used.delete(current);
    const next = uniqueSlug(nextBase, used);
    used.add(next);
    if (next !== current) {
      cat.slug = next;
      changed = true;
    }
  }

  // 3) Ensure statement-necklaces category exists if products need it.
  const hasStatement = categories.some(c => c.slug === 'necklaces-statement');
  const neckParent = categories.find(c => c.slug === 'necklaces' && !c.parentId);
  if (!hasStatement && neckParent) {
    categories.push({
      id: 'cat-necklaces-statement',
      name: 'Statement Necklaces',
      nameAr: 'سلاسل استرس',
      slug: 'necklaces-statement',
      sort: 20,
      featured: false,
      parentId: neckParent.id
    });
    changed = true;
  }

  return changed;
}

function repairProductCategoryLinks(products, categories) {
  if (!Array.isArray(products) || !Array.isArray(categories)) return false;

  const bySlug = new Map();
  const byNameAr = new Map();
  const byName = new Map();
  const byId = new Map();
  categories.forEach(c => {
    if (!c) return;
    if (c.id) byId.set(c.id, c);
    // Prefer child (more specific) when names collide — last write wins only for unique names.
    if (c.slug) bySlug.set(c.slug, c);
    if (c.nameAr) byNameAr.set(String(c.nameAr).trim(), c);
    if (c.name) byName.set(String(c.name).trim(), c);
  });

  let changed = false;
  products.forEach(p => {
    if (!p || typeof p !== 'object') return;

    // 1) Prefer exact category name match (survives duplicate-slug history).
    let cat = null;
    const catName = String(p.category || '').trim();
    if (catName) {
      cat = byNameAr.get(catName) || byName.get(catName);
    }

    // 2) Fall back to slug / aliases.
    const slug = p.categorySlug || '';
    if (!cat && slug) {
      cat = bySlug.get(slug);
      if (!cat && PRODUCT_SLUG_ALIASES[slug]) cat = bySlug.get(PRODUCT_SLUG_ALIASES[slug]);
      if (!cat) cat = byNameAr.get(slug) || byName.get(slug);
    }

    // 3) categoryId if present.
    if (!cat && p.categoryId) cat = byId.get(p.categoryId);

    if (!cat) return;
    if (p.categorySlug === cat.slug && (p.category === cat.name || p.category === cat.nameAr)) return;
    p.categorySlug = cat.slug;
    p.category = cat.name || cat.nameAr;
    p.categoryId = cat.id;
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
  CHILD_NAME_SLUGS,
  hasArabic,
  isJunkSlug,
  isNumericSlug,
  slugifyLatin,
  normalizeCategorySlugs,
  repairProductCategoryLinks,
  repairCategoryProductLinks
};
