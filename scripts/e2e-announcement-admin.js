/**
 * E2E: admin adds second announcement line → public store reflects it
 */
const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'hello@kwanzou-eg.com';
const PASS = process.env.ADMIN_PASSWORD || '';
const MARKER = `E2E_ANN_${Date.now()}`;

if (!PASS) {
  console.error('Set ADMIN_PASSWORD env var');
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
  return { status: res.status, body };
}

function announcementTextAr(settings) {
  const lines = settings.announcementLines || [];
  return lines.map(l => (l.ar || l.en || '').trim()).filter(Boolean).join('   •   ');
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
    console.error('GET_ADMIN_FAIL', admin.status);
    process.exit(1);
  }

  const store = admin.body;
  const s = store.settings || {};
  const originalLines = JSON.parse(JSON.stringify(s.announcementLines || [
    { en: s.announcementEn || s.announcement || '', ar: s.announcementAr || '' }
  ]));

  const lines = [...originalLines];
  if (lines.length < 2) lines.push({ en: '', ar: '' });
  lines[1] = { en: `${MARKER} EN`, ar: `${MARKER} عربي` };

  store.settings.announcementLines = lines;
  store.settings.announcementEn = lines[0]?.en || '';
  store.settings.announcement = lines[0]?.en || '';
  store.settings.announcementAr = lines[0]?.ar || '';

  const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  if (put.status !== 200 || !put.body?.ok) {
    console.error('PUT_FAIL', put.status, put.body);
    process.exit(1);
  }
  console.log('admin_save:ok');

  const pub = await req('/api/store');
  const text = announcementTextAr(pub.body?.settings || {});
  if (!text.includes(MARKER)) {
    console.error('PUBLIC_FAIL', text);
    process.exit(1);
  }
  console.log('public_store:ok', text.slice(0, 80) + '...');

  store.settings.announcementLines = originalLines;
  store.settings.announcementEn = originalLines[0]?.en || '';
  store.settings.announcement = originalLines[0]?.en || '';
  store.settings.announcementAr = originalLines[0]?.ar || '';
  await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  console.log('restored:ok');
  console.log('ANNOUNCEMENT_E2E_PASS');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
