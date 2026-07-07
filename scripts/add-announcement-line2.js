/**
 * Add second announcement line on production (if missing).
 */
const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'hello@kwanzou-eg.com';
const PASS = process.env.ADMIN_PASSWORD || '';

const LINE2 = {
  en: '316L stainless steel & gold accessories — made to last, made to shine',
  ar: 'إكسسوارات استالس 316L ودهب — جودة بتدوم وما بتصديش'
};

if (!PASS) {
  console.error('Set ADMIN_PASSWORD');
  process.exit(1);
}

const jar = new Map();
function parseSetCookie(header) {
  if (!header) return;
  (Array.isArray(header) ? header : [header]).forEach(line => {
    const [pair] = line.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  });
}
function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}
async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(jar.size ? { Cookie: cookieHeader() } : {}), ...(opts.headers || {}) }
  });
  const set = res.headers.getSetCookie?.() || [];
  if (!set.length) { const raw = res.headers.get('set-cookie'); if (raw) parseSetCookie(raw); }
  else set.forEach(parseSetCookie);
  const text = await res.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

async function main() {
  const login = await req('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASS }) });
  if (!login.body?.ok) { console.error('LOGIN_FAIL'); process.exit(1); }

  const admin = await req('/api/store/admin');
  const store = admin.body;
  const s = store.settings || {};
  let lines = Array.isArray(s.announcementLines) ? [...s.announcementLines] : [{
    en: s.announcementEn || s.announcement || '',
    ar: s.announcementAr || ''
  }];

  const hasSecond = lines.some((l, i) => i > 0 && (l.en || l.ar));
  if (!hasSecond) {
    if (lines.length < 2) lines.push(LINE2);
    else lines[1] = { ...lines[1], ...LINE2 };
  } else {
    lines[1] = { ...lines[1], en: LINE2.en, ar: lines[1].ar || LINE2.ar };
  }

  store.settings.announcementLines = lines;
  store.settings.announcementEn = lines[0]?.en || store.settings.announcementEn;
  store.settings.announcement = lines[0]?.en || store.settings.announcement;
  store.settings.announcementAr = lines[0]?.ar || store.settings.announcementAr;

  const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  if (!put.body?.ok) { console.error('PUT_FAIL', put.body); process.exit(1); }

  const pub = await req('/api/store');
  const pubLines = pub.body?.settings?.announcementLines || [];
  console.log('line2_en:', pubLines[1]?.en || 'missing');
  console.log('ANNOUNCEMENT_LINE2_OK');
}

main().catch(e => { console.error(e); process.exit(1); });
