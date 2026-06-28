const { getStore, saveStore } = require('./db');
const { getAdminCredentials } = require('./admin-auth');
const { sendAdminAlertEmail } = require('./mail');

function buildNotification({ type, title, message, orderId, userId, meta }) {
  return {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: type || 'info',
    title: String(title || '').trim(),
    message: String(message || '').trim(),
    orderId: orderId || null,
    userId: userId || null,
    meta: meta || {},
    read: false,
    createdAt: new Date().toISOString()
  };
}

async function addAdminNotification(payload) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };

  const notification = buildNotification(payload);
  store.adminNotifications = store.adminNotifications || [];
  store.adminNotifications.unshift(notification);
  if (store.adminNotifications.length > 200) {
    store.adminNotifications = store.adminNotifications.slice(0, 200);
  }

  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };

  sendAdminAlertEmail({
    subject: notification.title,
    text: notification.message,
    html: `<p>${notification.message}</p>${notification.orderId ? `<p><strong>Order:</strong> ${notification.orderId}</p>` : ''}`
  }).catch(err => console.warn('Admin alert email skipped:', err.message));

  return { ok: true, notification };
}

async function listAdminNotifications(limit = 50) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const notifications = (store.adminNotifications || []).slice(0, limit);
  const unreadCount = notifications.filter(n => !n.read).length;
  return { ok: true, notifications, unreadCount };
}

async function markNotificationRead(id) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const item = (store.adminNotifications || []).find(n => n.id === id);
  if (!item) return { ok: false, error: 'not_found' };
  item.read = true;
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true };
}

async function markAllNotificationsRead() {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  (store.adminNotifications || []).forEach(n => { n.read = true; });
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true };
}

async function notifyNewOrder(order) {
  const customer = order.customerName || 'عميل';
  const total = order.total != null ? `${Number(order.total).toLocaleString()} ج.م` : '';
  return addAdminNotification({
    type: 'new_order',
    title: `طلب جديد ${order.id}`,
    message: `${customer} — ${total} — ${(order.items || []).length} منتج`,
    orderId: order.id,
    userId: order.userId || null,
    meta: { total: order.total, phone: order.customerPhone || '' }
  });
}

async function notifyNewCustomer(user) {
  return addAdminNotification({
    type: 'new_customer',
    title: 'عميل جديد',
    message: `${user.name} — ${user.email}`,
    userId: user.id,
    meta: { email: user.email, phone: user.phone || '' }
  });
}

module.exports = {
  addAdminNotification,
  listAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  notifyNewOrder,
  notifyNewCustomer
};
