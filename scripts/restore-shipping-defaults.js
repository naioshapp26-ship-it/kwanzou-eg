/**
 * Restore full default shipping config on production (or any BASE URL).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'hello@kwanzou-eg.com';
const PASS = process.env.ADMIN_PASSWORD || '';

function loadDefaults() {
  const code = fs.readFileSync(path.join(__dirname, '../js/checkout-shipping.js'), 'utf8') +
    '\nthis.CheckoutShipping = CheckoutShipping;';
  const sandbox = { LumiereStore: { get: () => ({ settings: {} }) }, LumiereI18n: { getLang: () => 'ar' } };
  vm.runInNewContext(code, sandbox);
  return sandbox.CheckoutShipping.DEFAULT_CONFIG;
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

async function req(urlPath, opts = {}) {
  const res = await fetch(`${BASE}${urlPath}`, {
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

async function main() {
  if (!PASS) {
    console.error('Set ADMIN_PASSWORD');
    process.exit(1);
  }
  const defaults = loadDefaults();
  const login = await req('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASS })
  });
  if (login.status !== 200 || !login.body?.ok) {
    console.error('LOGIN_FAIL', login.status, login.body);
    process.exit(1);
  }
  const admin = await req('/api/store/admin');
  const store = admin.body;
  store.settings = store.settings || {};
  store.settings.freeShippingThreshold = defaults.freeThreshold;
  store.settings.shippingCountries = JSON.parse(JSON.stringify(defaults.countries));
  store.settings.paymentMethods = JSON.parse(JSON.stringify(defaults.paymentMethods));
  const put = await req('/api/store', { method: 'PUT', body: JSON.stringify(store) });
  if (put.status !== 200 || !put.body?.ok) {
    console.error('PUT_FAIL', put.status, put.body);
    process.exit(1);
  }
  const egZones = store.settings.shippingCountries.find(c => c.code === 'EG')?.zones?.length;
  console.log('RESTORED', 'eg_zones=' + egZones, 'countries=' + store.settings.shippingCountries.length);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
