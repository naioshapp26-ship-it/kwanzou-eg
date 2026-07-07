/**
 * Security + storefront E2E checks (production-safe, no credentials required).
 */
const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';

async function get(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, text, json, headers: res.headers };
}

async function main() {
  const failures = [];

  const store = await get('/api/store');
  if (store.status !== 200) failures.push(`store status ${store.status}`);
  if (store.json?.users) failures.push('public store leaks users');
  if (store.json?.staffAdmins) failures.push('public store leaks staffAdmins');
  if (store.json?.orders) failures.push('public store leaks orders');
  console.log('public_store:', failures.length ? 'FAIL' : 'ok');

  const adminStore = await get('/api/store/admin');
  if (adminStore.status !== 401) failures.push(`store/admin expected 401 got ${adminStore.status}`);
  console.log('admin_api_blocked:', adminStore.status === 401 ? 'ok' : 'FAIL');

  const putStore = await fetch(`${BASE}/api/store`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (putStore.status !== 401) failures.push(`PUT /api/store expected 401 got ${putStore.status}`);
  console.log('put_store_blocked:', putStore.status === 401 ? 'ok' : 'FAIL');

  const adminIndex = await get('/admin/');
  if (adminIndex.status !== 404) failures.push(`admin index expected 404 got ${adminIndex.status}`);
  console.log('admin_index_hidden:', adminIndex.status === 404 ? 'ok' : 'FAIL');

  const adminDash = await get('/admin/index.html');
  if (adminDash.status !== 404) failures.push(`admin dashboard expected 404 got ${adminDash.status}`);
  console.log('admin_dashboard_hidden:', adminDash.status === 404 ? 'ok' : 'FAIL');

  const adminLogin = await get('/admin/login.html');
  if (adminLogin.status !== 200) failures.push(`admin login expected 200 got ${adminLogin.status}`);
  console.log('admin_login_staff_only:', adminLogin.status === 200 ? 'ok' : 'FAIL');

  const home = await get('/index.html');
  if (home.text.includes('admin/login.html')) failures.push('homepage links to admin login');
  if (home.text.includes('nav_admin') || home.text.includes('لوحة التحكم')) failures.push('homepage has admin nav marker');
  console.log('homepage_no_admin_links:', !(home.text.includes('admin/login.html')) ? 'ok' : 'FAIL');

  const login = await get('/login.html');
  if (login.text.includes('admin/login.html')) failures.push('customer login links to admin');
  console.log('login_no_admin_link:', !login.text.includes('admin/login.html') ? 'ok' : 'FAIL');

  if (failures.length) {
    console.error('FAILURES:', failures);
    process.exit(1);
  }
  console.log('SECURITY_E2E_PASS');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
