const { getStore, saveStore } = require('./db');
const { getAdminCredentials } = require('./admin-auth');

function stripStaffRecord(admin) {
  const { password, ...safe } = admin;
  return safe;
}

async function listStaffAdmins() {
  const store = await getStore();
  const env = getAdminCredentials();
  const list = [];
  if (env.configured) {
    list.push({
      id: 'env-super',
      email: env.email,
      name: 'Super Admin',
      role: 'superadmin',
      protected: true,
      createdAt: '—'
    });
  }
  (store?.staffAdmins || []).forEach(admin => {
    list.push({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
      protected: false,
      createdAt: admin.createdAt || '—'
    });
  });
  return list;
}

async function addStaffAdmin({ name, email, password }) {
  const normalized = String(email || '').trim().toLowerCase();
  const adminName = String(name || '').trim();
  if (!adminName || !normalized || !password) {
    return { ok: false, error: 'register_error_required' };
  }
  if (password.length < 6) return { ok: false, error: 'register_error_pass' };

  const env = getAdminCredentials();
  if (env.configured && normalized === env.email) {
    return { ok: false, error: 'admin_staff_exists' };
  }

  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  store.staffAdmins = store.staffAdmins || [];

  if (store.staffAdmins.some(a => a.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'admin_staff_exists' };
  }
  if ((store.users || []).some(u => u.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'admin_staff_exists' };
  }

  const admin = {
    id: 'staff-' + Date.now(),
    name: adminName,
    email: normalized,
    password: String(password),
    role: 'admin',
    createdAt: new Date().toISOString().split('T')[0]
  };
  store.staffAdmins.push(admin);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true, admin: stripStaffRecord(admin) };
}

async function deleteStaffAdmin(id) {
  if (!id || id === 'env-super') {
    return { ok: false, error: 'admin_staff_protected' };
  }
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const before = (store.staffAdmins || []).length;
  store.staffAdmins = (store.staffAdmins || []).filter(a => a.id !== id);
  if (store.staffAdmins.length === before) {
    return { ok: false, error: 'admin_staff_not_found' };
  }
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return { ok: true };
}

module.exports = { listStaffAdmins, addStaffAdmin, deleteStaffAdmin };
