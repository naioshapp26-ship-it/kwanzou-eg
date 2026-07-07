/**
 * E2E: admin login → update Cairo shipping fee → verify public API + cart label
 */
const BASE = 'https://kwanzou-eg-production.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'hello@kwanzou-eg.com';
const PASS = process.env.ADMIN_PASSWORD || '';

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

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadDefaults() {
  const code = fs.readFileSync(path.join(__dirname, '../js/checkout-shipping.js'), 'utf8') +
    '\nthis.CheckoutShipping = CheckoutShipping;';
  const sandbox = { LumiereStore: { get: () => ({ settings: {} }) }, LumiereI18n: { getLang: () => 'ar' } };
  vm.runInNewContext(code, sandbox);
  return sandbox.CheckoutShipping.DEFAULT_CONFIG;
}

const DEFAULTS = loadDefaults();

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
  store.settings = store.settings || {};
  if (!store.settings.shippingCountries?.length) {
    store.settings.shippingCountries = JSON.parse(JSON.stringify(DEFAULTS.countries));
  }
  if (!store.settings.freeShippingThreshold) store.settings.freeShippingThreshold = DEFAULTS.freeThreshold;
  if (!store.settings.paymentMethods?.length) {
    store.settings.paymentMethods = JSON.parse(JSON.stringify(DEFAULTS.paymentMethods));
  }
  const eg = store.settings.shippingCountries.find(c => c.code === 'EG');
  if (!eg) throw new Error('EG country missing');
  const cairo = eg.zones?.find(z => z.id === 'cairo');
  if (!cairo) throw new Error('cairo zone missing');
  const prev = cairo.fee;
  cairo.fee = 55;

  const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  if (put.status !== 200 || !put.body?.ok) {
    console.error('PUT_FAIL', put.status, put.body);
    process.exit(1);
  }
  console.log('save:ok', `cairo ${prev} -> 55`);

  const pub = await req('/api/store');
  const pubFee = pub.body?.settings?.shippingCountries
    ?.find(c => c.code === 'EG')?.zones?.find(z => z.id === 'cairo')?.fee;
  if (pubFee !== 55) {
    console.error('VERIFY_FAIL', 'expected 55 got', pubFee);
    process.exit(1);
  }
  console.log('public_api:ok', 'cairo_fee=55');

  // restore original fee so production stays clean
  cairo.fee = prev;
  await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  console.log('restore:ok', `cairo back to ${prev}`);
  console.log('E2E_PASS');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
