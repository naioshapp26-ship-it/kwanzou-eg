/**
 * LUMIÈRE — Authentication (customers only; admin uses AdminSession)
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
    const session = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone || '' };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    if (typeof LumiereStore !== 'undefined') LumiereStore.setPrivateUser(null);
  }

  async function login(email, password) {
    if (LumiereStore.isApiMode()) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || 'login_error' };
        }
        LumiereStore.cacheUser(data.user);
        return { ok: true, user: setSession(data.user) };
      } catch (_) {
        return { ok: false, error: 'login_error' };
      }
    }

    const user = LumiereStore.findUser(email);
    if (!user || user.password !== password) {
      return { ok: false, error: 'login_error' };
    }
    if (user.role === 'superadmin') {
      return { ok: false, error: 'admin_use_portal' };
    }
    return { ok: true, user: setSession(user) };
  }

  async function register({ name, email, password, phone }) {
    if (!name || !email || !password) {
      return { ok: false, error: 'register_error_required' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'register_error_pass' };
    }

    if (LumiereStore.isApiMode()) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password, phone: phone || '' })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || 'register_error_exists' };
        }
        LumiereStore.cacheUser(data.user);
        return { ok: true, user: setSession(data.user) };
      } catch (_) {
        return { ok: false, error: 'register_error_exists' };
      }
    }

    if (LumiereStore.findUser(email)) {
      return { ok: false, error: 'register_error_exists' };
    }
    LumiereStore.addUser({ name, email, password, phone: phone || '' });
    const user = LumiereStore.findUser(email);
    return { ok: true, user: setSession(user) };
  }

  async function logout() {
    if (LumiereStore.isApiMode()) {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (_) {}
    }
    clearSession();
    const base = window.location.pathname.includes('/admin/') ? '../' : '';
    window.location.href = `${base}index.html`;
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
    if (session.role !== role) {
      window.location.href = redirect;
      return null;
    }
    return session;
  }

  async function refreshCurrentUser() {
    const session = getSession();
    if (!session) return null;
    if (LumiereStore.isApiMode()) {
      const result = await LumiereStore.fetchAccountMe();
      if (!result.ok || !result.user) return null;
      setSession(result.user);
      return result.user;
    }
    return LumiereStore.findUserById(session.id) || session;
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    return LumiereStore.findUserById(session.id) || session;
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function mediaSrc(url) {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/api/media/')) {
      return url;
    }
    if (url === 'assets/logo-brand.svg' || url === 'assets/logo.png') return `${url}?v=6`;
    return url;
  }

  function initAuthBranding() {
    const s = LumiereStore.get()?.settings || {};
    const authImg = document.getElementById('authVisualImage');
    if (authImg && s.authVisualImage) authImg.src = mediaSrc(s.authVisualImage);
    const logo = document.querySelector('.auth-logo');
    if (logo && s.logo) logo.src = mediaSrc(s.logo);
  }

  async function requestPasswordReset(email) {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return { ok: false, error: data.error || 'reset_failed' };
      return { ok: true, message: data.message || 'reset_email_sent' };
    } catch (_) {
      return { ok: false, error: 'reset_failed' };
    }
  }

  async function resetPassword(token, password) {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return { ok: false, error: data.error || 'reset_invalid' };
      return { ok: true, message: data.message || 'reset_password_done' };
    } catch (_) {
      return { ok: false, error: 'reset_failed' };
    }
  }

  async function validateResetToken(token) {
    try {
      const res = await fetch(`/api/auth/reset-token?token=${encodeURIComponent(token)}`);
      const data = await res.json().catch(() => ({}));
      return !!(res.ok && data.ok);
    } catch (_) {
      return false;
    }
  }

  return {
    getSession, login, register, logout,
    requireAuth, requireRole,
    getCurrentUser, refreshCurrentUser, isLoggedIn,
    requestPasswordReset, resetPassword, validateResetToken,
    initAuthBranding, mediaSrc
  };
})();
