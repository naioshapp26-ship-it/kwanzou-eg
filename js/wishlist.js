/**
 * Customer wishlist — local for guests, synced when logged in
 */
const KwanzouWishlist = (() => {
  const LOCAL_KEY = 'kwanzou_wishlist_local';

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function writeLocal(ids) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  }

  function getIds() {
    const user = typeof LumiereStore !== 'undefined' ? LumiereStore.getPrivateUser?.() : null;
    if (user?.wishlist?.length) return [...user.wishlist];
    if (typeof LumiereAuth !== 'undefined' && LumiereAuth.isLoggedIn()) {
      const cached = LumiereStore.getPrivateUser?.();
      if (cached?.wishlist) return [...cached.wishlist];
    }
    return readLocal();
  }

  function has(productId) {
    return getIds().includes(productId);
  }

  async function sync(ids) {
    if (typeof LumiereStore !== 'undefined' && LumiereStore.isApiMode?.() && LumiereAuth.isLoggedIn()) {
      const result = await LumiereStore.updateWishlistRemote(ids);
      if (!result.ok) return result;
      writeLocal([]);
      return { ok: true, wishlist: result.user?.wishlist || ids };
    }
    const user = LumiereStore?.findUserById?.(LumiereAuth.getSession()?.id);
    if (user) {
      LumiereStore.updateUser(user.id, { wishlist: ids });
      LumiereStore.setPrivateUser?.({ ...user, wishlist: ids });
      writeLocal([]);
    } else {
      writeLocal(ids);
    }
    return { ok: true, wishlist: ids };
  }

  async function mergeLocalOnLogin() {
    const local = readLocal();
    if (!local.length || !LumiereAuth.isLoggedIn()) return;
    const current = getIds();
    const merged = [...new Set([...current, ...local])];
    await sync(merged);
  }

  async function toggle(productId) {
    if (!productId) return { ok: false, error: 'invalid' };
    const ids = getIds();
    const next = ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId];
    const result = await sync(next);
    if (!result.ok) return result;
    document.dispatchEvent(new CustomEvent('kwanzou:wishlistchange', { detail: { productId, wishlist: result.wishlist } }));
    return { ok: true, added: !ids.includes(productId), wishlist: result.wishlist, guest: !LumiereAuth.isLoggedIn() };
  }

  function bindButtons(root = document) {
    root.querySelectorAll('.btn-wishlist').forEach(btn => {
      const id = btn.dataset.id;
      btn.classList.toggle('active', has(id));
      btn.setAttribute('aria-pressed', has(id) ? 'true' : 'false');
      btn.onclick = async e => {
        e.preventDefault();
        e.stopPropagation();
        const result = await toggle(id);
        if (!result.ok) {
          if (typeof showToast === 'function') showToast(LumiereI18n.t('account_save_failed'));
          return;
        }
        btn.classList.toggle('active', result.added);
        btn.setAttribute('aria-pressed', result.added ? 'true' : 'false');
        const msg = result.added
          ? (result.guest ? LumiereI18n.t('wishlist_add_guest') : LumiereI18n.t('wishlist_add'))
          : LumiereI18n.t('wishlist_remove');
        if (typeof showToast === 'function') showToast(msg);
      };
    });
  }

  return { getIds, has, toggle, sync, mergeLocalOnLogin, bindButtons };
})();
