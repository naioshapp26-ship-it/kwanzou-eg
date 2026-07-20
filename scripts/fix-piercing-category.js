/**
 * Fix piercing category: slug eeee → piercing, remap products from Arabic slug
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
  const cat = (store.categories || []).find(c => c.id === 'cat-1782794065216');
  if (!cat) {
    console.error('CAT_NOT_FOUND');
    process.exit(1);
  }

  console.log('before:', { slug: cat.slug, name: cat.name, nameAr: cat.nameAr });

  const ARABIC_SLUG = 'بيرسينج';
  const NEW_SLUG = 'piercing';

  cat.slug = NEW_SLUG;
  cat.name = 'Piercing';
  cat.nameAr = cat.nameAr || ARABIC_SLUG;

  let fixed = 0;
  for (const p of store.products || []) {
    const slug = p.categorySlug || '';
    const catName = p.category || '';
    if (slug === ARABIC_SLUG || slug === 'eeee' || catName === ARABIC_SLUG || catName === 'بيرسينج') {
      p.categorySlug = NEW_SLUG;
      p.category = 'Piercing';
      fixed++;
    }
  }

  console.log('products remapped:', fixed);

  const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  if (put.status !== 200 || !put.body?.ok) {
    console.error('PUT_FAIL', put.status, put.body);
    process.exit(1);
  }

  const pub = await req('/api/store');
  const c2 = (pub.body?.categories || []).find(c => c.id === 'cat-1782794065216');
  const n = (pub.body?.products || []).filter(p => p.categorySlug === NEW_SLUG).length;
  const leftover = (pub.body?.products || []).filter(p => p.categorySlug === ARABIC_SLUG || p.categorySlug === 'eeee').length;
  console.log('after:', { slug: c2?.slug, name: c2?.name, products: n, leftoverArabicOrEeee: leftover });
  console.log('shop_url:', `${BASE}/shop.html?cat=${NEW_SLUG}`);
  console.log('PIERCING_FIX_OK');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
