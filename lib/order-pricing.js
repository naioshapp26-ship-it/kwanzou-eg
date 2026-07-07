/**
 * Server-side order pricing, shipping, stock validation
 */

const DEFAULT_SHIPPING = {
  freeThreshold: 1500,
  countries: [
    {
      code: 'EG',
      zones: [
        { id: 'cairo', fee: 50 }, { id: 'giza', fee: 50 }, { id: 'alex', fee: 60 },
        { id: 'qalyubia', fee: 60 }, { id: 'sharqia', fee: 65 }, { id: 'dakahlia', fee: 65 },
        { id: 'gharbia', fee: 65 }, { id: 'monufia', fee: 65 }, { id: 'beheira', fee: 70 },
        { id: 'ismailia', fee: 70 }, { id: 'suez', fee: 70 }, { id: 'port-said', fee: 70 },
        { id: 'damietta', fee: 70 }, { id: 'kafr-el-sheikh', fee: 70 }, { id: 'fayoum', fee: 75 },
        { id: 'beni-suef', fee: 80 }, { id: 'minya', fee: 80 }, { id: 'assiut', fee: 85 },
        { id: 'sohag', fee: 85 }, { id: 'qena', fee: 90 }, { id: 'luxor', fee: 90 },
        { id: 'aswan', fee: 95 }, { id: 'red-sea', fee: 100 }, { id: 'matrouh', fee: 100 },
        { id: 'north-sinai', fee: 100 }, { id: 'south-sinai', fee: 100 }, { id: 'new-valley', fee: 110 }
      ]
    },
    {
      code: 'SA',
      zones: [
        { id: 'sa-riyadh', fee: 250 }, { id: 'sa-jeddah', fee: 250 }, { id: 'sa-other', fee: 300 }
      ]
    },
    {
      code: 'AE',
      zones: [
        { id: 'ae-dubai', fee: 250 }, { id: 'ae-abu', fee: 250 }, { id: 'ae-other', fee: 300 }
      ]
    },
    {
      code: 'OTHER',
      zones: [{ id: 'intl', fee: 400 }]
    }
  ]
};

function effectivePrice(product) {
  if (!product) return 0;
  if (product.salePrice && product.salePrice < product.price) return product.salePrice;
  if (product.discount && product.discount > 0) {
    return Math.round(product.price * (1 - product.discount / 100));
  }
  return product.price;
}

function getShippingConfig(settings) {
  const s = settings || {};
  return {
    freeThreshold: s.freeShippingThreshold ?? DEFAULT_SHIPPING.freeThreshold,
    countries: s.shippingCountries?.length ? s.shippingCountries : DEFAULT_SHIPPING.countries
  };
}

function findZone(settings, countryCode, zoneId) {
  const config = getShippingConfig(settings);
  const country = config.countries.find(c => c.code === countryCode);
  return country?.zones?.find(z => z.id === zoneId) || null;
}

function calcShipping(settings, subtotal, countryCode, zoneId) {
  const config = getShippingConfig(settings);
  const zone = findZone(settings, countryCode, zoneId);
  if (!zone) return { fee: 0, free: false };
  const free = subtotal >= config.freeThreshold;
  return { fee: free ? 0 : (zone.fee || 0), free };
}

function validateOrderPayload(store, payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) return { ok: false, error: 'empty_cart' };

  const validatedItems = [];
  let subtotal = 0;
  const stockNeeds = {};

  for (const item of items) {
    const productId = item.id || item.productId;
    const product = (store.products || []).find(p => p.id === productId);
    if (!product) return { ok: false, error: 'product_not_found', productId };

    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    const stock = product.stock != null ? product.stock : 999;
    stockNeeds[productId] = (stockNeeds[productId] || 0) + qty;
    if (stockNeeds[productId] > stock) {
      return { ok: false, error: 'insufficient_stock', productId, name: product.nameAr || product.name };
    }

    const unitPrice = effectivePrice(product);
    subtotal += unitPrice * qty;
    validatedItems.push({
      productId: product.id,
      name: item.name || product.nameAr || product.name,
      qty,
      price: unitPrice,
      image: item.image || product.image || ''
    });
  }

  const addr = payload.shippingAddress || {};
  const { fee: shippingFee } = calcShipping(store.settings, subtotal, addr.country, addr.governorate);
  const total = subtotal + shippingFee;

  const tol = 1;
  const clientSubtotal = Number(payload.subtotal);
  const clientShipping = Number(payload.shippingFee ?? 0);
  const clientTotal = Number(payload.total);

  if (!Number.isFinite(clientSubtotal) || Math.abs(clientSubtotal - subtotal) > tol) {
    return { ok: false, error: 'price_mismatch', expected: subtotal };
  }
  if (!Number.isFinite(clientShipping) || Math.abs(clientShipping - shippingFee) > tol) {
    return { ok: false, error: 'shipping_mismatch', expected: shippingFee };
  }
  if (!Number.isFinite(clientTotal) || Math.abs(clientTotal - total) > tol) {
    return { ok: false, error: 'total_mismatch', expected: total };
  }

  return { ok: true, subtotal, shippingFee, total, items: validatedItems, stockNeeds };
}

function deductStock(store, stockNeeds) {
  for (const [productId, qty] of Object.entries(stockNeeds)) {
    const product = (store.products || []).find(p => p.id === productId);
    if (!product) continue;
    const stock = product.stock != null ? product.stock : 999;
    product.stock = Math.max(0, stock - qty);
  }
}

module.exports = {
  effectivePrice,
  calcShipping,
  validateOrderPayload,
  deductStock
};
