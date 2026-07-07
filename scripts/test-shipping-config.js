/**
 * Validates shipping config round-trip (no server required).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadCheckoutShipping(settings = {}) {
  const code = fs.readFileSync(path.join(__dirname, '../js/checkout-shipping.js'), 'utf8') +
    '\nthis.CheckoutShipping = CheckoutShipping;';
  const sandbox = {
    LumiereStore: { get: () => ({ settings }) },
    LumiereI18n: { getLang: () => 'ar' }
  };
  vm.runInNewContext(code, sandbox);
  return sandbox.CheckoutShipping;
}
const CS = loadCheckoutShipping();
const defaults = CS.DEFAULT_CONFIG;
console.assert(defaults.countries[0].zones.length >= 20, 'EG zones');

const custom = loadCheckoutShipping({
  freeShippingThreshold: 2000,
  shippingCountries: [
    {
      code: 'EG',
      nameAr: 'مصر',
      nameEn: 'Egypt',
      zones: [{ id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', fee: 77 }]
    }
  ],
  paymentMethods: [{ id: 'cod', nameAr: 'COD', nameEn: 'COD', enabled: true }]
});

const cfg = custom.getConfig();
console.assert(cfg.freeThreshold === 2000, 'custom threshold');
console.assert(cfg.countries[0].zones[0].fee === 77, 'custom cairo fee');

const ship = custom.calcShipping(100, 'EG', 'cairo');
console.assert(ship.fee === 77, 'calc fee');
const free = custom.calcShipping(2500, 'EG', 'cairo');
console.assert(free.fee === 0 && free.free, 'free shipping');

const sanitize = require('../lib/store-sanitize');
const pub = sanitize.sanitizeStoreForPublic({
  settings: {
    shippingCountries: cfg.countries,
    paymentMethods: cfg.paymentMethods,
    freeShippingThreshold: 2000
  },
  users: [{ email: 'x' }],
  orders: []
});
console.assert(pub.settings.shippingCountries[0].zones[0].fee === 77, 'public API keeps shipping');
console.assert(!pub.users, 'users stripped');

console.log('OK — shipping config flow validated');
