const { getStore, saveStore } = require('./db');
const { notifyNewContact } = require('./admin-notifications');

async function submitContactMessage({ name, email, phone, subject, message }) {
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };

  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedMessage = String(message || '').trim();

  if (!trimmedName || !trimmedMessage) return { ok: false, error: 'contact_required' };
  if (trimmedEmail && !trimmedEmail.includes('@')) return { ok: false, error: 'invalid_email' };

  const entry = {
    id: 'msg-' + Date.now(),
    name: trimmedName,
    email: trimmedEmail,
    phone: String(phone || '').trim(),
    subject: String(subject || '').trim() || 'general',
    message: trimmedMessage,
    createdAt: new Date().toISOString(),
    read: false
  };

  store.contactMessages = store.contactMessages || [];
  store.contactMessages.unshift(entry);
  if (store.contactMessages.length > 200) store.contactMessages.length = 200;

  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  await notifyNewContact(entry);
  return { ok: true };
}

module.exports = { submitContactMessage };
