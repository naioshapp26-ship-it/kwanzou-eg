const { getStore, saveStore } = require('./db');
const { stripPassword } = require('./store-sanitize');
const { verifyAdminCredentials } = require('./admin-auth');
const { notifyNewOrder, notifyNewCustomer } = require('./admin-notifications');
const { validateOrderPayload, deductStock } = require('./order-pricing');

function buildCustomerOrders(store, userId) {
  return (store.orders || [])
    .filter(o => o.userId === userId)
    .map(o => ({
      id: o.id,
      date: o.date,
      total: o.total,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      status: o.status,
      paymentMethodLabel: o.paymentMethodLabel,
      shippingAddress: o.shippingAddress || {},
      items: (o.items || []).map(i => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        image: i.image,
        color: i.color || null
      }))
    }));
}

function syncUserOrdersFromStore(store, user) {
  const orders = buildCustomerOrders(store, user.id);
  user.orders = orders;
  return orders;
}

async function loginCustomer(email, password) {
  if (verifyAdminCredentials(email, password)) {
    return { ok: false, error: 'admin_use_portal' };
  }
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const normalized = String(email).trim().toLowerCase();
  if ((store.staffAdmins || []).some(a => a.email.toLowerCase() === normalized && a.password === password)) {
    return { ok: false, error: 'admin_use_portal' };
  }
  const user = (store.users || []).find(u => u.email.toLowerCase() === normalized);
  if (!user || user.password !== password) return { ok: false, error: 'login_error' };
  if (user.role === 'superadmin' || user.role === 'admin') return { ok: false, error: 'admin_use_portal' };
  syncUserOrdersFromStore(store, user);
  return { ok: true, user: stripPassword(user) };
}

async function registerCustomer({ name, email, password, phone }) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const normalized = String(email).trim().toLowerCase();
  if (!name || !normalized || !password) return { ok: false, error: 'register_error_required' };
  if (password.length < 6) return { ok: false, error: 'register_error_pass' };
  if ((store.users || []).some(u => u.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'register_error_exists' };
  }
  const user = {
    id: 'u-' + Date.now(),
    name: String(name).trim(),
    email: normalized,
    password,
    phone: phone || '',
    role: 'customer',
    createdAt: new Date().toISOString().split('T')[0],
    wishlist: [],
    orders: [],
    shippingProfile: null
  };
  store.users = store.users || [];
  store.users.push(user);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  await notifyNewCustomer(stripPassword(user));
  return { ok: true, user: stripPassword(user) };
}

async function getCustomerAccount(userId) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const user = (store.users || []).find(u => u.id === userId && u.role === 'customer');
  if (!user) return { ok: false, error: 'unauthorized' };
  syncUserOrdersFromStore(store, user);
  return { ok: true, user: stripPassword({ ...user, orders: user.orders }) };
}

async function placeOrder(payload) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };

  const validation = validateOrderPayload(store, payload);
  if (!validation.ok) return validation;

  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    subtotal: validation.subtotal,
    shippingFee: validation.shippingFee,
    total: validation.total,
    status: (payload.paymentMethod === 'instapay'
      || payload.paymentMethod === 'deposit_cod'
      || payload.status === 'Awaiting Payment')
      ? 'Awaiting Payment'
      : 'Pending',
    paymentStatus: payload.paymentStatus
      || (payload.paymentMethod === 'instapay' || payload.paymentMethod === 'deposit_cod'
        ? 'awaiting_confirmation'
        : 'cod'),
    customerName: payload.customerName,
    customerEmail: payload.customerEmail || '',
    customerPhone: payload.customerPhone || '',
    customerPhone2: payload.customerPhone2 || '',
    shippingAddress: payload.shippingAddress || {},
    paymentMethod: payload.paymentMethod || 'cod',
    paymentMethodLabel: payload.paymentMethodLabel || '',
    userId: payload.userId || null,
    items: validation.items
  };

  deductStock(store, validation.stockNeeds);

  store.orders = store.orders || [];
  store.orders.unshift(order);

  if (order.userId) {
    const user = (store.users || []).find(u => u.id === order.userId);
    if (user) {
      if (payload.shippingAddress) {
        user.shippingProfile = {
          country: payload.shippingAddress.country || '',
          governorate: payload.shippingAddress.governorate || '',
          city: payload.shippingAddress.city || '',
          address: payload.shippingAddress.address || '',
          landmark: payload.shippingAddress.landmark || '',
          notes: payload.shippingAddress.notes || '',
          phone: order.customerPhone,
          phone2: order.customerPhone2
        };
      }
      if (payload.customerName) user.name = String(payload.customerName).trim();
      if (payload.customerPhone) user.phone = String(payload.customerPhone).trim();
      syncUserOrdersFromStore(store, user);
    }
  }

  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };

  await notifyNewOrder(order);
  return { ok: true, order };
}

async function subscribeNewsletter(email) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const normalized = String(email).trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return { ok: false, error: 'invalid_email' };
  store.newsletter = store.newsletter || [];
  if (!store.newsletter.includes(normalized)) store.newsletter.push(normalized);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true };
}

async function updateCustomerProfile({ userId, email, password, patch }) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const user = (store.users || []).find(u => u.id === userId);
  if (!user || user.email.toLowerCase() !== String(email).trim().toLowerCase()) {
    return { ok: false, error: 'unauthorized' };
  }
  if (user.password !== password) return { ok: false, error: 'login_error' };
  if (patch.name) user.name = String(patch.name).trim();
  if (patch.phone !== undefined) user.phone = String(patch.phone).trim();
  if (patch.shippingProfile && typeof patch.shippingProfile === 'object') {
    user.shippingProfile = { ...(user.shippingProfile || {}), ...patch.shippingProfile };
  }
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  syncUserOrdersFromStore(store, user);
  return { ok: true, user: stripPassword(user) };
}

async function changeCustomerPassword({ userId, email, currentPassword, newPassword }) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, error: 'register_error_pass' };
  }
  const user = (store.users || []).find(u => u.id === userId);
  if (!user || user.email.toLowerCase() !== String(email).trim().toLowerCase()) {
    return { ok: false, error: 'unauthorized' };
  }
  if (user.password !== currentPassword) return { ok: false, error: 'login_error' };
  user.password = String(newPassword);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true };
}

async function updateCustomerWishlist({ userId, email, wishlist }) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const user = (store.users || []).find(u => u.id === userId);
  if (!user || user.email.toLowerCase() !== String(email).trim().toLowerCase()) {
    return { ok: false, error: 'unauthorized' };
  }
  user.wishlist = Array.isArray(wishlist) ? wishlist.filter(Boolean) : [];
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  syncUserOrdersFromStore(store, user);
  return { ok: true, user: stripPassword(user) };
}

function updateProductRating(store, productId) {
  const reviews = (store.productReviews || []).filter(r => r.productId === productId && r.approved !== false);
  const product = (store.products || []).find(p => p.id === productId);
  if (!product) return;
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviews = reviews.length;
}

async function submitProductReview({ userId, orderId, productId, rating, text }) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  if (!userId || !orderId || !productId) return { ok: false, error: 'review_required' };

  const stars = Math.min(5, Math.max(1, parseInt(rating, 10) || 0));
  const comment = String(text || '').trim();
  if (!stars || !comment) return { ok: false, error: 'review_required' };

  const user = (store.users || []).find(u => u.id === userId);
  if (!user) return { ok: false, error: 'unauthorized' };

  const order = (store.orders || []).find(o => o.id === orderId && o.userId === userId);
  if (!order) return { ok: false, error: 'order_not_found' };
  if (order.status !== 'Delivered') return { ok: false, error: 'order_not_delivered' };

  const line = (order.items || []).find(i => i.productId === productId);
  if (!line) return { ok: false, error: 'product_not_in_order' };

  store.productReviews = store.productReviews || [];
  const exists = store.productReviews.some(r =>
    r.userId === userId && r.orderId === orderId && r.productId === productId
  );
  if (exists) return { ok: false, error: 'review_exists' };

  const review = {
    id: 'rev-' + Date.now(),
    productId,
    userId,
    orderId,
    rating: stars,
    text: comment,
    name: user.name,
    date: new Date().toISOString().split('T')[0],
    approved: true
  };
  store.productReviews.unshift(review);
  updateProductRating(store, productId);

  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true, review };
}

module.exports = {
  loginCustomer,
  registerCustomer,
  getCustomerAccount,
  placeOrder,
  subscribeNewsletter,
  updateCustomerProfile,
  changeCustomerPassword,
  updateCustomerWishlist,
  submitProductReview,
  buildCustomerOrders
};
