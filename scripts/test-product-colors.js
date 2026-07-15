const { validateOrderPayload, sanitizeColor } = require('../lib/order-pricing');
const { buildCustomerOrders } = require('../lib/public-store-api');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const store = {
  settings: { freeShippingThreshold: 1500 },
  products: [
    {
      id: 'p1',
      name: 'Colored Bag',
      nameAr: 'شنطة ملونة',
      price: 1000,
      stock: 5,
      colors: [
        { name: 'Black', nameAr: 'أسود', hex: '#000000' },
        { name: 'Red', nameAr: 'أحمر', hex: '#ff0000' }
      ]
    },
    { id: 'p2', name: 'Plain Ring', price: 500, stock: 3 }
  ]
};

/* sanitizeColor -------------------------------------------------- */

// Match by English name -> returns canonical entry with both languages
const c1 = sanitizeColor({ name: 'Black' }, store.products[0]);
assert(c1 && c1.name === 'Black' && c1.nameAr === 'أسود' && c1.hex === '#000000', 'sanitize by en name');

// Match by Arabic name
const c2 = sanitizeColor({ nameAr: 'أحمر' }, store.products[0]);
assert(c2 && c2.name === 'Red', 'sanitize by ar name');

// Match by hex (case-insensitive)
const c3 = sanitizeColor({ hex: '#FF0000' }, store.products[0]);
assert(c3 && c3.name === 'Red', 'sanitize by hex');

// Color not offered by the product -> rejected (null)
const c4 = sanitizeColor({ name: 'Purple' }, store.products[0]);
assert(c4 === null, 'reject unknown color');

// Product has no colors -> always null even if a color is submitted
const c5 = sanitizeColor({ name: 'Black' }, store.products[1]);
assert(c5 === null, 'no-color product ignores submitted color');

// No color submitted -> null
const c6 = sanitizeColor(null, store.products[0]);
assert(c6 === null, 'no submitted color');

/* validateOrderPayload carries sanitized color ------------------- */

const payload = {
  subtotal: 1500,
  shippingFee: 0,
  total: 1500,
  shippingAddress: { country: 'EG', governorate: 'cairo' },
  items: [
    { id: 'p1', name: 'Colored Bag', qty: 1, price: 1000, color: { name: 'Red', hex: '#ff0000' } },
    { id: 'p2', name: 'Plain Ring', qty: 1, price: 500, color: { name: 'Gold' } }
  ]
};

const result = validateOrderPayload(store, payload);
assert(result.ok, 'order with colors should pass: ' + JSON.stringify(result));
assert(result.items[0].color && result.items[0].color.name === 'Red', 'item1 keeps valid color');
assert(result.items[0].color.nameAr === 'أحمر', 'item1 color localized backfilled');
assert(result.items[1].color === null, 'item2 (no product colors) color stripped');

/* free shipping preserved with colored order --------------------- */
assert(result.shippingFee === 0 && result.subtotal === 1500, 'free shipping over threshold');

/* buildCustomerOrders exposes color to the customer account ------- */
const storeWithOrder = {
  orders: [
    {
      id: 'ORD-1', userId: 'u-1', date: '2026-07-15', total: 1000, status: 'Pending',
      items: [
        { productId: 'p1', name: 'Colored Bag', qty: 1, price: 1000, color: { name: 'Red', nameAr: 'أحمر', hex: '#ff0000' } }
      ]
    }
  ]
};
const custOrders = buildCustomerOrders(storeWithOrder, 'u-1');
assert(custOrders.length === 1, 'customer order returned');
assert(custOrders[0].items[0].color && custOrders[0].items[0].color.name === 'Red', 'customer order keeps color');

console.log('PRODUCT_COLORS_UNIT_PASS');
