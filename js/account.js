/**
 * Customer account page
 */
document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  const session = LumiereAuth.requireAuth();
  if (!session) return;
  if (session.role === 'superadmin') {
    window.location.href = 'admin/index.html';
    return;
  }

  refreshAccount();
  window.addEventListener('lumiere:langchange', refreshAccount);

  if (location.hash === '#wishlist') switchTab('wishlist');
});

function refreshAccount() {
  LumiereLayout.init();
  LumiereI18n.applyTranslations();
  const user = LumiereAuth.getCurrentUser();
  if (!user) return;

  document.getElementById('welcomeName').textContent = LumiereI18n.getLang() === 'ar'
    ? `${LumiereI18n.t('account_welcome')}، ${user.name.split(' ')[0]}`
    : `${LumiereI18n.t('account_welcome')}, ${user.name.split(' ')[0]}`;
  document.getElementById('statOrders').textContent = user.orders?.length || 0;
  document.getElementById('statWishlist').textContent = user.wishlist?.length || 0;
  document.getElementById('statMember').textContent = user.createdAt || '—';

  renderOrders(user);
  renderWishlist(user);
  renderProfile(user);
  bindTabs();
  bindLogout();
}

function formatOrderTotal(total) {
  return KwanzouCart.formatPrice(total || 0);
}

function renderOrders(user) {
  const orders = user.orders || [];
  const tbody = document.getElementById('ordersTableBody');
  const recent = document.getElementById('recentOrders');
  const shopLink = `<a href="shop.html">${LumiereI18n.t('account_shop')}</a>`;

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">${LumiereI18n.t('account_no_orders')} ${shopLink}</td></tr>`;
    recent.innerHTML = `<p class="empty-msg">${LumiereI18n.t('account_no_orders')} ${shopLink}</p>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.date}</td>
      <td>${(o.items || []).map(i => i.name).join('، ')}</td>
      <td>${formatOrderTotal(o.total)}</td>
      <td><span class="status-badge status-badge--${(o.status || 'pending').toLowerCase()}">${LumiereI18n.translateStatus(o.status)}</span></td>
    </tr>
  `).join('');

  recent.innerHTML = orders.slice(0, 3).map(o => `
    <div class="order-card">
      <div class="order-card__meta">
        <span class="order-card__id">${o.id}</span>
        <span class="order-card__date">${o.date}</span>
      </div>
      <div class="order-card__items">${(o.items || []).map(i => i.name).join('، ')}</div>
      <span class="status-badge status-badge--${(o.status || 'pending').toLowerCase()}">${LumiereI18n.translateStatus(o.status)}</span>
    </div>
  `).join('');
}

function renderWishlist(user) {
  const grid = document.getElementById('wishlistGrid');
  const products = LumiereStore.get().products;
  const wishlist = (user.wishlist || []).map(id => products.find(p => p.id === id)).filter(Boolean);

  if (!wishlist.length) {
    grid.innerHTML = `<p class="empty-msg">${LumiereI18n.t('account_empty_wishlist')} <a href="index.html">${LumiereI18n.t('account_shop')}</a></p>`;
    return;
  }

  grid.innerHTML = wishlist.map(p => ProductUI.cardHTML(p)).join('');
  ProductUI.bindCartButtons(grid);
}

function renderProfile(user) {
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileEmail').value = user.email;
  document.getElementById('profilePhone').value = user.phone || '';

  const form = document.getElementById('profileForm');
  form.onsubmit = e => {
    e.preventDefault();
    LumiereStore.updateUser(user.id, {
      name: document.getElementById('profileName').value,
      phone: document.getElementById('profilePhone').value
    });
    showToast(LumiereI18n.t('account_saved'));
  };
}

function switchTab(tab) {
  document.querySelectorAll('.account-nav__item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.account-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindTabs() {
  document.querySelectorAll('.account-nav__item').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });
}

function bindLogout() {
  document.getElementById('logoutBtn').onclick = () => LumiereAuth.logout();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
