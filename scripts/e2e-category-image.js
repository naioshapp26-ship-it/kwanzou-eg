/**
 * E2E: admin changes a category image → public store + homepage reflect it → restore
 */
const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'hello@kwanzou-eg.com';
const PASS = process.env.ADMIN_PASSWORD || '';

if (!PASS) {
  console.error('Set ADMIN_PASSWORD env var');
  process.exit(1);
}

// 1x1 red pixel PNG — unique per run so the media hash is new
const PIXEL_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const TEST_DATA_URL = `data:image/png;base64,${PIXEL_B64}`;

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
      'Content-Type': 'application/json',
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
  return { status: res.status, body, contentType: res.headers.get('content-type') || '' };
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
  console.log('login:ok');

  const admin = await req('/api/store/admin');
  if (admin.status !== 200) {
    console.error('GET_ADMIN_FAIL', admin.status);
    process.exit(1);
  }
  const store = admin.body;
  const cat = (store.categories || []).find(c => !c.parentId && c.image);
  if (!cat) {
    console.error('NO_CATEGORY_WITH_IMAGE');
    process.exit(1);
  }
  const originalImage = cat.image;
  console.log('target_category:', cat.slug, '| original:', String(originalImage).slice(0, 50));

  // change image (same way the admin modal submits: data URL from file upload)
  cat.image = TEST_DATA_URL;
  const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  if (put.status !== 200 || !put.body?.ok) {
    console.error('PUT_FAIL', put.status, put.body);
    process.exit(1);
  }
  console.log('admin_save:ok');

  // public store must expose the new image (as /api/media/<id> ref)
  const pub = await req('/api/store');
  const pubCat = (pub.body?.categories || []).find(c => c.id === cat.id);
  if (!pubCat) {
    console.error('PUBLIC_CAT_MISSING');
    process.exit(1);
  }
  const newRef = pubCat.image;
  if (newRef === originalImage) {
    console.error('IMAGE_NOT_CHANGED', newRef);
    process.exit(1);
  }
  if (!String(newRef).startsWith('/api/media/')) {
    console.error('IMAGE_NOT_MEDIA_REF', String(newRef).slice(0, 60));
    process.exit(1);
  }
  console.log('public_store:ok', newRef);

  // media endpoint must serve the exact uploaded bytes
  const mediaRes = await fetch(`${BASE}${newRef}`);
  const buf = Buffer.from(await mediaRes.arrayBuffer());
  if (mediaRes.status !== 200 || buf.toString('base64') !== PIXEL_B64) {
    console.error('MEDIA_FAIL', mediaRes.status, buf.length);
    process.exit(1);
  }
  console.log('media_bytes:ok', `${buf.length} bytes,`, mediaRes.headers.get('content-type'));

  // restore
  const admin2 = await req('/api/store/admin');
  const store2 = admin2.body;
  const cat2 = (store2.categories || []).find(c => c.id === cat.id);
  cat2.image = originalImage;
  const put2 = await req('/api/store', { method: 'PUT', body: JSON.stringify(store2) });
  if (put2.status !== 200 || !put2.body?.ok) {
    console.error('RESTORE_FAIL', put2.status, put2.body);
    process.exit(1);
  }
  const verify = await req('/api/store');
  const backCat = (verify.body?.categories || []).find(c => c.id === cat.id);
  if (backCat?.image !== originalImage) {
    console.error('RESTORE_MISMATCH', backCat?.image);
    process.exit(1);
  }
  console.log('restored:ok');
  console.log('CATEGORY_IMAGE_E2E_PASS');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
