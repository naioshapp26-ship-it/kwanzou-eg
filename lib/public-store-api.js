const { getStore, saveStore } = require('./db');
const { stripPassword } = require('./store-sanitize');

async function loginCustomer(email, password) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const user = (store.users || []).find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user || user.password !== password) return { ok: false, error: 'login_error' };
  if (user.role === 'superadmin') return { ok: false, error: 'admin_use_portal' };
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
    orders: []
  };
  store.users = store.users || [];
  store.users.push(user);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true, user: stripPassword(user) };
}

async function placeOrder(payload) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };

  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    subtotal: payload.subtotal ?? payload.total,
    shippingFee: payload.shippingFee ?? 0,
    total: payload.total,
    status: 'Pending',
    customerName: payload.customerName,
    customerEmail: payload.customerEmail || '',
    customerPhone: payload.customerPhone || '',
    customerPhone2: payload.customerPhone2 || '',
    shippingAddress: payload.shippingAddress || {},
    paymentMethod: payload.paymentMethod || 'cod',
    paymentMethodLabel: payload.paymentMethodLabel || '',
    userId: payload.userId || null,
    items: (payload.items || []).map(i => ({
      productId: i.id,
      name: i.name,
      qty: i.qty,
      price: i.price
    }))
  };

  store.orders = store.orders || [];
  store.orders.unshift(order);

  if (order.userId) {
    const user = (store.users || []).find(u => u.id === order.userId);
    if (user) {
      user.orders = user.orders || [];
      user.orders.unshift({
        id: order.id,
        date: order.date,
        total: order.total,
        status: order.status,
        items: order.items.map(i => ({ name: i.name, qty: i.qty }))
      });
    }
  }

  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
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
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true, user: stripPassword(user) };
}

module.exports = {
  loginCustomer,
  registerCustomer,
  placeOrder,
  subscribeNewsletter,
  updateCustomerProfile
};
