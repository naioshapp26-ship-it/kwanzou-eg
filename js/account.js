/**
 * Customer account page
 */
document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  const session = LumiereAuth.requireAuth();
  if (!session) return;

  PasswordToggle.init();
  const user = await LumiereAuth.refreshCurrentUser();
  if (!user) {
    LumiereAuth.logout();
    return;
  }
  refreshAccount(user);
  window.addEventListener('lumiere:langchange', () => refreshAccount());

  if (location.hash === '#wishlist') switchTab('wishlist');
  document.addEventListener('kwanzou:wishlistchange', async () => {
    const user = await LumiereAuth.refreshCurrentUser();
    if (user) refreshAccount(user);
  });
});

function refreshAccount(userArg) {
  LumiereLayout.init();
  LumiereI18n.applyTranslations();
  const user = userArg || LumiereAuth.getCurrentUser();
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

  tbody.innerHTML = orders.map((o, idx) => `
    <tr class="orders-table__row" data-order-idx="${idx}" role="button" tabindex="0">
      <td><strong>${o.id}</strong></td>
      <td>${o.date}</td>
      <td>${(o.items || []).map(i => i.name).join('، ')}</td>
      <td>${formatOrderTotal(o.total)}</td>
      <td><span class="status-badge status-badge--${(o.status || 'pending').toLowerCase()}">${LumiereI18n.translateStatus(o.status)}</span></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.orders-table__row').forEach(row => {
    const open = () => showOrderDetail(orders[Number(row.dataset.orderIdx)]);
    row.addEventListener('click', open);
    row.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  });

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

function showOrderDetail(order) {
  if (!order) return;
  const addr = order.shippingAddress || {};
  const itemsHtml = (order.items || []).map(i =>
    `<li>${i.name} × ${i.qty} — ${formatOrderTotal((i.price || 0) * i.qty)}</li>`
  ).join('');
  const el = document.getElementById('orderDetailModal');
  if (!el) return;
  el.innerHTML = `
    <div class="order-detail-backdrop"></div>
    <div class="order-detail-card" role="dialog" aria-modal="true">
      <button type="button" class="order-detail-close" aria-label="Close">✕</button>
      <h3>${LumiereI18n.t('account_order_detail')}</h3>
      <p><strong>${LumiereI18n.t('account_order_id')}:</strong> ${order.id}</p>
      <p><strong>${LumiereI18n.t('account_date')}:</strong> ${order.date}</p>
      <p><strong>${LumiereI18n.t('account_status')}:</strong> ${LumiereI18n.translateStatus(order.status)}</p>
      ${addr.city ? `<p><strong>${LumiereI18n.t('checkout_city')}:</strong> ${addr.city}</p>` : ''}
      ${addr.address ? `<p><strong>${LumiereI18n.t('checkout_address')}:</strong> ${addr.address}</p>` : ''}
      <p><strong>${LumiereI18n.t('checkout_payment')}:</strong> ${order.paymentMethodLabel || LumiereI18n.t('checkout_payment_cod')}</p>
      <ul class="order-detail-items">${itemsHtml}</ul>
      <p><strong>${LumiereI18n.t('account_total')}:</strong> ${formatOrderTotal(order.total)}</p>
    </div>`;
  el.hidden = false;
  el.querySelector('.order-detail-close')?.addEventListener('click', () => { el.hidden = true; });
  el.querySelector('.order-detail-backdrop')?.addEventListener('click', () => { el.hidden = true; });
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
  if (typeof KwanzouWishlist !== 'undefined') KwanzouWishlist.bindButtons(grid);
}

function renderProfile(user) {
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileEmail').value = user.email;
  document.getElementById('profilePhone').value = user.phone || '';

  const form = document.getElementById('profileForm');
  form.onsubmit = async e => {
    e.preventDefault();
    const password = document.getElementById('profileConfirmPassword')?.value || '';
    if (!password) {
      showToast(LumiereI18n.t('account_confirm_password'));
      return;
    }
    const result = await LumiereStore.updateUserRemote(user.id, user.email, password, {
      name: document.getElementById('profileName').value,
      phone: document.getElementById('profilePhone').value
    });
    if (!result.ok) {
      showToast(LumiereI18n.t(result.error || 'account_save_failed'));
      return;
    }
    showToast(LumiereI18n.t('account_saved'));
  };

  const passwordForm = document.getElementById('passwordForm');
  passwordForm.onsubmit = async e => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword !== confirmPassword) {
      showToast(LumiereI18n.t('account_password_mismatch'));
      return;
    }
    const result = await LumiereStore.changePasswordRemote(
      user.id,
      user.email,
      currentPassword,
      newPassword
    );
    if (!result.ok) {
      showToast(LumiereI18n.t(result.error || 'account_save_failed'));
      return;
    }
    passwordForm.reset();
    showToast(LumiereI18n.t('account_password_changed'));
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
