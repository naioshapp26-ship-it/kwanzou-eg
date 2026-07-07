/**
 * Storefront flow E2E — announcement, collections, contact, order validation.
 */
const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';

async function get(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, text, json };
}

async function post(path, body, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: opts.credentials || 'omit',
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, text, json };
}

async function main() {
  const failures = [];

  const home = await get('/index.html');
  if (home.status !== 200) failures.push(`home status ${home.status}`);
  if (!home.text.includes('newArrivals')) failures.push('homepage missing product sections');
  console.log('homepage_structure:', home.text.includes('newArrivals') ? 'ok' : 'FAIL');

  const layout = await get('/js/layout.js?v=21');
  if (!layout.text.includes('announcement-bar__track')) failures.push('layout missing marquee announcement');
  if (!layout.text.includes('support-fab')) failures.push('layout missing whatsapp support fab');
  if (!layout.text.includes('contact.html')) failures.push('layout missing contact link');
  console.log('layout_features:', layout.text.includes('announcement-bar__track') && layout.text.includes('support-fab') && layout.text.includes('contact.html') ? 'ok' : 'FAIL');

  const contact = await get('/contact.html');
  if (contact.status !== 200) failures.push(`contact status ${contact.status}`);
  if (!contact.text.includes('contactForm')) failures.push('contact form missing');
  console.log('contact_page:', contact.status === 200 ? 'ok' : 'FAIL');

  const contactPost = await post('/api/contact', {
    name: 'E2E Test',
    email: 'e2e.flow@test.local',
    message: 'Automated flow test message'
  });
  if (!contactPost.json?.ok) failures.push(`contact api: ${contactPost.json?.error || contactPost.status}`);
  console.log('contact_api:', contactPost.json?.ok ? 'ok' : 'FAIL');

  const store = await get('/api/store');
  const product = store.json?.products?.[0];
  if (!product) failures.push('no products in store');
  else {
    const tampered = await post('/api/orders', {
      customerName: 'E2E Tamper',
      customerPhone: '01000000000',
      shippingAddress: { country: 'EG', governorate: 'cairo', city: 'Cairo', address: 'Test' },
      paymentMethod: 'cod',
      subtotal: 1,
      shippingFee: 0,
      total: 1,
      items: [{ id: product.id, name: product.name, qty: 1, price: 1 }]
    });
    if (tampered.json?.ok) failures.push('tampered order was accepted');
    if (!['price_mismatch', 'shipping_mismatch', 'total_mismatch'].includes(tampered.json?.error)) {
      failures.push(`expected price error got ${tampered.json?.error}`);
    }
    console.log('order_price_guard:', !tampered.json?.ok ? 'ok' : 'FAIL');
  }

  const reviewsBlocked = await post('/api/reviews', {
    orderId: 'ORD-fake',
    productId: 'p-fake',
    rating: 5,
    text: 'test'
  });
  if (reviewsBlocked.status !== 401) failures.push(`reviews without login expected 401 got ${reviewsBlocked.status}`);
  console.log('reviews_auth:', reviewsBlocked.status === 401 ? 'ok' : 'FAIL');

  const store2 = await get('/api/store');
  if (store2.json?.contactMessages) failures.push('public store leaks contactMessages');
  if (store2.json?.users) failures.push('public store leaks users');
  console.log('public_sanitize:', !(store2.json?.contactMessages || store2.json?.users) ? 'ok' : 'FAIL');

  if (failures.length) {
    console.error('FAILURES:', failures);
    process.exit(1);
  }
  console.log('FLOW_E2E_PASS');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
