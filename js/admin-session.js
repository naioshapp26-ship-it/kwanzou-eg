/**
 * Admin session — server-authenticated via httpOnly cookie
 */
const AdminSession = (() => {
  async function check() {
    try {
      const res = await fetch('/api/admin/session', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    } catch (_) {
      return null;
    }
  }

  async function require() {
    const session = await check();
    if (!session?.ok) {
      window.location.href = 'login.html';
      return null;
    }
    return session;
  }

  async function login(email, password) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || 'login_error' };
    return { ok: true, email: data.email, role: data.role || 'admin' };
  }

  async function logout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = 'login.html';
  }

  return { check, require, login, logout };
})();
