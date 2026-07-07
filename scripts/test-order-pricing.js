const { validateOrderPayload, deductStock, effectivePrice } = require('../lib/order-pricing');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const store = {
  settings: { freeShippingThreshold: 1500 },
  products: [
    { id: 'p1', name: 'Test', price: 1000, stock: 5 },
    { id: 'p2', name: 'Sale', price: 500, salePrice: 400, stock: 2 }
  ]
};

const payload = {
  subtotal: 1400,
  shippingFee: 50,
  total: 1450,
  shippingAddress: { country: 'EG', governorate: 'cairo' },
  items: [
    { id: 'p1', name: 'Test', qty: 1, price: 1000 },
    { id: 'p2', name: 'Sale', qty: 1, price: 400 }
  ]
};

const valid = validateOrderPayload(store, payload);
assert(valid.ok, 'valid order should pass');
assert(valid.subtotal === 1400, 'subtotal');
assert(valid.total === 1450, 'total');

const tampered = validateOrderPayload(store, { ...payload, total: 100 });
assert(!tampered.ok && tampered.error === 'total_mismatch', 'tampered total rejected');

const overStock = validateOrderPayload(store, {
  ...payload,
  subtotal: 2000,
  total: 2050,
  items: [{ id: 'p2', name: 'Sale', qty: 10, price: 400 }]
});
assert(!overStock.ok && overStock.error === 'insufficient_stock', 'stock guard');

deductStock(store, { p1: 1, p2: 1 });
assert(store.products[0].stock === 4, 'p1 stock');
assert(store.products[1].stock === 1, 'p2 stock');
assert(effectivePrice(store.products[1]) === 400, 'sale price');

console.log('ORDER_PRICING_UNIT_PASS');
