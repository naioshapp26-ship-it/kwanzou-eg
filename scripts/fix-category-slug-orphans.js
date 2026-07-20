/**
 * Remap products stuck on Arabic/legacy category names onto the real category slug.
 * Safe to re-run.
 */
const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'hello@kwanzou-eg.com';
const PASS = process.env.ADMIN_PASSWORD || '';

if (!PASS) {
  console.error('Set ADMIN_PASSWORD');
  process.exit(1);
}

const jar = new Map();
function parseSetCookie(header) {
  if (!header) return;
  const parts = Array.isArray(header) ? header : [header];
  for (const line of parts) {
    const [pair] = line.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
}
function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}
async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(opts.headers || {}),
      ...(jar.size ? { Cookie: cookieHeader() } : {})
    }
  });
  const set = res.headers.getSetCookie?.() || [];
  if (!set.length) {
    const raw = res.headers.get('set-cookie');
    if (raw) parseSetCookie(raw);
  } else set.forEach(parseSetCookie);
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

/** Extra known mismatches (product slug → category slug) */
const EXTRA_ALIASES = {
  'بروش': 'brooch',
  'بيرسينج': 'piercing',
  'خلخال': 'anklet',
  'eeee': 'piercing',
  'bracelets-hand chain': 'bracelets-hand-chain',
  'اساور': 'اساور', // keep if category slug is Arabic
};

async function main() {
  const login = await req('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASS })
  });
  if (login.status !== 200 || !login.body?.ok) {
    console.error('LOGIN_FAIL', login.status, login.body);
    process.exit(1);
  }

  const admin = await req('/api/store/admin');
  if (admin.status !== 200) {
    console.error('GET_FAIL', admin.status);
    process.exit(1);
  }
  const store = admin.body;
  const cats = store.categories || [];
  const bySlug = new Map(cats.map(c => [c.slug, c]));
  const byNameAr = new Map();
  const byName = new Map();
  cats.forEach(c => {
    if (c.nameAr) byNameAr.set(c.nameAr, c);
    if (c.name) byName.set(c.name, c);
  });

  let fixed = 0;
  const report = {};

  for (const p of store.products || []) {
    const slug = p.categorySlug || '';
    let cat = bySlug.get(slug);
    if (!cat) {
      const alias = EXTRA_ALIASES[slug];
      if (alias) cat = bySlug.get(alias);
    }
    if (!cat) cat = byNameAr.get(slug) || byName.get(slug);
    if (!cat && p.category) {
      cat = byNameAr.get(p.category) || byName.get(p.category) || bySlug.get(p.category);
    }
    if (!cat) continue;
    if (p.categorySlug === cat.slug && (p.category === cat.name || p.category === cat.nameAr)) continue;

    const from = p.categorySlug;
    p.categorySlug = cat.slug;
    p.category = cat.name || cat.nameAr;
    fixed++;
    report[`${from} → ${cat.slug}`] = (report[`${from} → ${cat.slug}`] || 0) + 1;
  }

  // Normalize broken category slugs that are Arabic spaces / junk for known names
  const CAT_SLUG_FIX = {
    'بروش': 'brooch',
    'بيرسينج': 'piercing',
    'خلخال': 'anklet',
    'eeee': 'piercing'
  };
  let catFixed = 0;
  for (const c of cats) {
    const want = CAT_SLUG_FIX[c.slug] || CAT_SLUG_FIX[c.nameAr];
    if (want && c.slug !== want && !bySlug.has(want)) {
      console.log('category slug fix:', c.slug, '→', want, `(${c.nameAr})`);
      c.slug = want;
      if (!c.name || c.name === c.nameAr) {
        if (want === 'brooch') c.name = 'Brooch';
        if (want === 'piercing') c.name = 'Piercing';
        if (want === 'anklet') c.name = 'Anklet';
      }
      catFixed++;
      bySlug.set(want, c);
    }
  }

  console.log('products remapped:', fixed);
  console.log('categories remapped:', catFixed);
  console.log('details:', report);

  if (fixed || catFixed) {
    const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
    if (put.status !== 200 || !put.body?.ok) {
      console.error('PUT_FAIL', put.status, put.body);
      process.exit(1);
    }
  }

  const pub = await req('/api/store');
  const check = ['brooch', 'anklet', 'piercing', 'bracelets-hand-chain'];
  for (const s of check) {
    const n = (pub.body.products || []).filter(p => p.categorySlug === s).length;
    const c = (pub.body.categories || []).find(x => x.slug === s);
    console.log(`verify ${s}: category=${c ? 'yes' : 'NO'} products=${n}`);
  }

  // orphan count
  const slugs = new Set((pub.body.categories || []).map(c => c.slug));
  const orphans = {};
  for (const p of pub.body.products || []) {
    if (!slugs.has(p.categorySlug)) {
      orphans[p.categorySlug] = (orphans[p.categorySlug] || 0) + 1;
    }
  }
  console.log('remaining orphans:', orphans);
  console.log('CATEGORY_SLUG_REPAIR_OK');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
