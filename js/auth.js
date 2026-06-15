/**
 * LUMIÈRE — Authentication
 */
const LumiereAuth = (() => {
  const SESSION_KEY = 'lumiere_session';

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setSession(user) {
    const session = { id: user.id, email: user.email, name: user.name, role: user.role };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function login(email, password) {
    const user = LumiereStore.findUser(email);
    if (!user || user.password !== password) {
      return { ok: false, error: 'login_error' };
    }
    const session = setSession(user);
    return { ok: true, user: session };
  }

  function register({ name, email, password, phone }) {
    if (!name || !email || !password) {
      return { ok: false, error: 'register_error_required' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'register_error_pass' };
    }
    if (LumiereStore.findUser(email)) {
      return { ok: false, error: 'register_error_exists' };
    }
    LumiereStore.addUser({ name, email, password, phone: phone || '' });
    const user = LumiereStore.findUser(email);
    const session = setSession(user);
    return { ok: true, user: session };
  }

  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  function requireAuth(redirect = 'login.html') {
    const session = getSession();
    if (!session) {
      window.location.href = redirect + '?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
      return null;
    }
    return session;
  }

  function requireRole(role, redirect = 'index.html') {
    const session = requireAuth();
    if (!session) return null;
    if (session.role !== role && session.role !== 'superadmin') {
      window.location.href = redirect;
      return null;
    }
    return session;
  }

  function requireSuperAdmin() {
    const session = requireAuth('login.html');
    if (!session) return null;
    if (session.role !== 'superadmin') {
      window.location.href = 'account.html';
      return null;
    }
    return session;
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    return LumiereStore.findUserById(session.id);
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function isSuperAdmin() {
    const s = getSession();
    return s && s.role === 'superadmin';
  }

  return {
    getSession, login, register, logout,
    requireAuth, requireRole, requireSuperAdmin,
    getCurrentUser, isLoggedIn, isSuperAdmin
  };
})();
