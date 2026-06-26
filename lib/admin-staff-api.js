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
      createdAt: '—',
      isCustomer: false
    });
  }
  (store?.staffAdmins || []).forEach(admin => {
    const isCustomer = (store.users || []).some(u => u.email.toLowerCase() === admin.email.toLowerCase());
    list.push({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
      protected: false,
      createdAt: admin.createdAt || '—',
      isCustomer
    });
  });
  return list;
}

async function getStaffAdminById(id) {
  if (!id || id === 'env-super') {
    const env = getAdminCredentials();
    if (!env.configured) return null;
    return {
      id: 'env-super',
      email: env.email,
      name: 'Super Admin',
      role: 'superadmin',
      protected: true,
      createdAt: '—',
      isCustomer: false
    };
  }
  const store = await getStore();
  if (!store) return null;
  const admin = (store.staffAdmins || []).find(a => a.id === id);
  if (!admin) return null;
  const isCustomer = (store.users || []).some(u => u.email.toLowerCase() === admin.email.toLowerCase());
  return { ...stripStaffRecord(admin), protected: false, isCustomer };
}

async function addStaffAdmin({ name, email, password }) {
  const normalized = String(email || '').trim().toLowerCase();
  let adminName = String(name || '').trim();
  if (!normalized || !password) {
    return { ok: false, error: 'register_error_required' };
  }
  if (password.length < 6) return { ok: false, error: 'register_error_pass' };

  const env = getAdminCredentials();
  if (env.configured && normalized === env.email) {
    return { ok: false, error: 'admin_staff_super_email' };
  }

  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  store.staffAdmins = store.staffAdmins || [];

  if (store.staffAdmins.some(a => a.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'admin_staff_already_admin' };
  }

  const existingCustomer = (store.users || []).find(u => u.email.toLowerCase() === normalized);
  if (!adminName && existingCustomer) adminName = existingCustomer.name;
  if (!adminName) adminName = normalized.split('@')[0];

  const admin = {
    id: 'staff-' + Date.now(),
    name: adminName,
    email: normalized,
    password: String(password),
    role: 'admin',
    createdAt: new Date().toISOString().split('T')[0],
    promotedFromCustomer: !!existingCustomer
  };
  store.staffAdmins.push(admin);
  const saved = await saveStore(store);
  if (!saved.ok) return { ok: false, error: 'save_failed' };
  return {
    ok: true,
    admin: stripStaffRecord(admin),
    promoted: !!existingCustomer
  };
}

async function updateStaffAdmin(id, { name, password }) {
  if (!id || id === 'env-super') {
    return { ok: false, error: 'admin_staff_protected' };
  }
  const store = await getStore();
  if (!store) return { ok: false, error: 'offline' };
  const admin = (store.staffAdmins || []).find(a => a.id === id);
  if (!admin) return { ok: false, error: 'admin_staff_not_found' };

  if (name && String(name).trim()) admin.name = String(name).trim();
  if (password) {
    if (String(password).length < 6) return { ok: false, error: 'register_error_pass' };
    admin.password = String(password);
  }

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

module.exports = {
  listStaffAdmins,
  getStaffAdminById,
  addStaffAdmin,
  updateStaffAdmin,
  deleteStaffAdmin
};
