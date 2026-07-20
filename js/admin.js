/**
 * Super Admin Dashboard — full site control
 */
const ADMIN_BASE = '../';
let adminSessionRole = 'admin';
let _staffCache = [];
let _knownNotifIds = new Set();
let _adminNotifTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  LumiereI18n.bindLangSwitch();
  const session = await AdminSession.require();
  if (!session) return;

  try {
    await LumiereStore.initAdmin();
  } catch (_) {
    await AdminSession.logout();
    return;
  }

  adminSessionRole = session.role || 'admin';
  document.getElementById('adminUserName').textContent = session.email || 'Admin';
  applyAdminBranding();
  initNavigation();
  renderDashboard();
  renderOrders();
  renderContactMessages();
  renderProducts();
  renderCategories();
  renderCollections();
  renderAppearance();
  renderSettings();
  initAppearanceForm();
  initSettingsForm();
  initAnnouncementLineControls();
  AdminShipping.init();
  renderUsers();
  renderStaffAdmins();
  initStaffSection();
  renderTestimonials();
  renderNewsletter();
  initModals();
  initLogout();
  initAdminNotifications();
  AdminMedia.init(document, toast);
  switchSection('dashboard');

  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.goto));
  });

  window.addEventListener('lumiere:langchange', () => {
    LumiereI18n.applyTranslations();
    LumiereI18n.bindLangSwitch();
    const active = document.querySelector('.admin-nav__item.active')?.dataset.section || 'dashboard';
    switchSection(active);
  });
});

const INSTAGRAM_GALLERY_OPTS = { galleryId: 'instagramGallery', addBtnId: 'addInstagramImage' };

function renderInstagramGalleryAdmin() {
  const wrap = document.getElementById('instagramGalleryWrap');
  if (!wrap) return;
  const data = LumiereStore.get();
  const images = (data.instagramGallery || []).map(item => item.image).filter(Boolean);
  wrap.innerHTML = AdminMedia.galleryHTML(images, INSTAGRAM_GALLERY_OPTS);
  AdminMedia.bindGallery(wrap, toast, INSTAGRAM_GALLERY_OPTS);
  wrap.querySelectorAll('.gallery-preview').forEach((preview, i) => {
    const src = images[i];
    if (src) AdminMedia.setPreview(preview, imgSrc(src));
  });
}

function imgSrc(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/media/')) return url;
  const clean = url.replace(/^\//, '');
  if (clean === 'assets/logo-brand.svg' || clean === 'assets/logo.png') return `${ADMIN_BASE}assets/logo-brand.svg?v=6`;
  return ADMIN_BASE + clean;
}

async function persistAfterSave() {
  const ok = await LumiereStore.flush();
  if (!ok) {
    const detail = LumiereStore.getLastSyncError?.();
    toast(detail ? `${LumiereI18n.t('admin_save_failed')} (${detail})` : LumiereI18n.t('admin_save_failed'));
    return false;
  }
  toast(LumiereI18n.t('admin_saved'));
  return true;
}

function fieldValue(id, fallback = '') {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = el.value.trim();
  return v || fallback;
}

function currencySym() {
  return LumiereStore.get().settings.currencySymbol || 'ج.م';
}

function applyAdminBranding() {
  const s = LumiereStore.get().settings;
  const logoEl = document.querySelector('.admin-sidebar__brand img');
  if (logoEl && s.logo) logoEl.src = imgSrc(s.logo);
  LumiereTheme.apply(s);
}

function switchSection(section) {
  document.querySelectorAll('.admin-nav__item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('active', s.id === `sec-${section}`));
  const titles = {
    dashboard: 'admin_dashboard', orders: 'admin_orders', contact: 'admin_contact_messages',
    products: 'admin_products',
    categories: 'admin_categories', collections: 'admin_collections', appearance: 'admin_appearance',
    settings: 'admin_settings', shipping: 'admin_shipping', staff: 'admin_staff', users: 'admin_users', testimonials: 'admin_testimonials', newsletter: 'admin_newsletter'
  };
  document.getElementById('adminPageTitle').textContent = LumiereI18n.t(titles[section] || section);
  document.getElementById('adminSidebar')?.classList.remove('open');
  if (section === 'staff') renderStaffAdmins();
  if (section === 'orders') renderOrders();
  if (section === 'contact') renderContactMessages();
  if (section === 'dashboard') renderDashboard();
  if (section === 'appearance') renderAppearance();
  if (section === 'settings') {
    renderSettings();
    AdminMedia.init(document.getElementById('sec-settings'), toast);
  }
  if (section === 'shipping') AdminShipping.render();
}

function initNavigation() {
  document.querySelectorAll('.admin-nav__item').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.toggle('open');
  });
}

function imageUploadHTML(name, current, label) {
  const safe = current || '';
  const preview = current ? imgSrc(current) : '';
  return `
    <div class="image-upload-group">
      <label>${label}</label>
      <img class="image-preview" src="${preview}" alt="" ${preview ? '' : 'hidden'}>
      <input type="text" name="${name}" value="${safe.replace(/"/g, '&quot;')}" placeholder="https://...">
      <div class="image-upload-actions">
        <label class="btn btn-sm btn-outline image-upload-btn">${LumiereI18n.t('admin_upload_image')}<input type="file" accept="image/*" class="image-file-input" hidden></label>
      </div>
      <small>${LumiereI18n.t('admin_image_hint')}</small>
    </div>`;
}

function bindModalImageUploads() {
  AdminMedia.bindModalForm(document.getElementById('modalBody'), toast);
}

function renderDashboard() {
  const data = LumiereStore.get();
  const orders = LumiereStore.getAllOrders();
  document.getElementById('dashOrders').textContent = orders.length;
  document.getElementById('dashPending').textContent = orders.filter(o => o.status === 'Pending').length;
  document.getElementById('dashProducts').textContent = data.products.length;
  document.getElementById('dashCustomers').textContent = data.users.filter(u => u.role === 'customer').length;
  document.getElementById('dashRecentProducts').innerHTML = data.products.slice(-3).reverse().map(p =>
    `<div class="dash-product-row"><img src="${imgSrc(p.image)}" alt=""><span>${p.nameAr || p.name}</span><span>${p.price} ${currencySym()}</span></div>`
  ).join('');
  renderDashboardNotifications(data.adminNotifications || []);
}

function formatNotifTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(LumiereI18n.getLang() === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  } catch (_) {
    return iso;
  }
}

function renderNotificationItems(notifications, { clickable = true } = {}) {
  if (!notifications.length) {
    return `<p class="admin-hint">${LumiereI18n.t('admin_notif_empty')}</p>`;
  }
  return notifications.map(n => `
    <button type="button" class="admin-notif-item${n.read ? '' : ' unread'}" data-id="${n.id}" data-order="${n.orderId || ''}" ${clickable ? '' : 'disabled'}>
      <div class="admin-notif-item__title">${n.title}</div>
      <div class="admin-notif-item__msg">${n.message}</div>
      <div class="admin-notif-item__time">${formatNotifTime(n.createdAt)}</div>
    </button>
  `).join('');
}

function renderDashboardNotifications(notifications) {
  const el = document.getElementById('dashNotifications');
  if (!el) return;
  el.innerHTML = renderNotificationItems(notifications.slice(0, 5));
  el.querySelectorAll('.admin-notif-item').forEach(btn => {
    btn.onclick = () => handleAdminNotificationClick(btn.dataset.id, btn.dataset.order);
  });
}

function renderAdminNotificationPanel(notifications, unreadCount) {
  const badge = document.getElementById('adminNotifBadge');
  const list = document.getElementById('adminNotifList');
  if (badge) {
    badge.textContent = unreadCount;
    badge.hidden = unreadCount <= 0;
  }
  if (list) {
    list.innerHTML = renderNotificationItems(notifications.slice(0, 20));
    list.querySelectorAll('.admin-notif-item').forEach(btn => {
      btn.onclick = () => handleAdminNotificationClick(btn.dataset.id, btn.dataset.order);
    });
  }
}

async function handleAdminNotificationClick(id, orderId) {
  try {
    await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
  } catch (_) {}
  document.getElementById('adminNotifPanel')?.setAttribute('hidden', '');
  if (orderId) {
    switchSection('orders');
    viewOrder(orderId);
  }
  pollAdminNotifications();
}

function initAdminNotifications() {
  const btn = document.getElementById('adminNotifBtn');
  const panel = document.getElementById('adminNotifPanel');
  const readAll = document.getElementById('adminNotifReadAll');

  btn?.addEventListener('click', e => {
    e.stopPropagation();
    const open = panel?.hasAttribute('hidden');
    if (open) panel.removeAttribute('hidden');
    else panel?.setAttribute('hidden', '');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#adminNotifications')) panel?.setAttribute('hidden', '');
  });

  readAll?.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'PATCH', credentials: 'include' });
    } catch (_) {}
    pollAdminNotifications();
  });

  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }

  pollAdminNotifications();
  _adminNotifTimer = setInterval(pollAdminNotifications, 20000);
}

async function pollAdminNotifications() {
  try {
    const res = await fetch('/api/admin/notifications', { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return;
    const notifications = data.notifications || [];
    const unread = notifications.filter(n => !n.read);
    notifications.forEach(n => {
      if (!_knownNotifIds.has(n.id) && _knownNotifIds.size > 0 && !n.read) {
        toast(`${n.title} — ${n.message}`);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(n.title, { body: n.message, tag: n.id });
        }
      }
    });
    notifications.forEach(n => _knownNotifIds.add(n.id));
    renderAdminNotificationPanel(notifications, unread.length);
    renderDashboardNotifications(notifications);
  } catch (_) {}
}

function renderOrders() {
  const orders = LumiereStore.getAllOrders();
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="8">${LumiereI18n.t('admin_order_empty')}</td></tr>`;
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const itemsText = (o.items || []).map(i => {
      const c = orderItemColorLabel(i.color);
      return `${i.name}${c ? ` (${c})` : ''} ×${i.qty}`;
    }).join('، ');
    return `<tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customerName || '—'}<br><small>${o.customerEmail || ''}</small></td>
      <td>${o.customerPhone || '—'}</td>
      <td>${o.date}</td>
      <td>${itemsText}</td>
      <td>${o.total?.toLocaleString()} ${currencySym()}</td>
      <td>
        <select class="order-status-select" data-id="${o.id}">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>${LumiereI18n.t('status_pending')}</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>${LumiereI18n.t('status_shipped')}</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>${LumiereI18n.t('status_delivered')}</option>
        </select>
      </td>
      <td class="table-actions">
        <button class="btn-icon" onclick="viewOrder('${o.id}')" title="${LumiereI18n.t('admin_view')}">👁</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteOrder('${o.id}')" title="${LumiereI18n.t('admin_delete')}">🗑</button>
      </td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('.order-status-select').forEach(sel => {
    sel.onchange = () => {
      LumiereStore.updateOrderStatus(sel.dataset.id, sel.value);
      renderOrders();
      renderDashboard();
      toast(LumiereI18n.t('admin_saved'));
    };
  });
}

function orderItemColorLabel(color) {
  if (!color) return '';
  return LumiereI18n.localized(color, 'name') || color.name || color.nameAr || '';
}

function orderItemColorHtml(color) {
  const label = orderItemColorLabel(color);
  if (!label) return '';
  const hex = /^#?[0-9a-fA-F]{3,8}$/.test(color.hex || '') ? (color.hex.startsWith('#') ? color.hex : `#${color.hex}`) : '#ccc';
  return `<span class="order-item-color"><span class="order-item-color__dot" style="background:${hex}"></span>${label}</span>`;
}

function orderItemImageHtml(item) {
  const products = LumiereStore.get().products || [];
  const product = products.find(p => p.id === item.productId || p.id === item.id);
  const src = item.image || product?.image || '';
  if (!src) {
    return '<span class="order-item-thumb order-item-thumb--empty">—</span>';
  }
  return `<img class="order-item-thumb" src="${imgSrc(src)}" alt="">`;
}

window.viewOrder = function(id) {
  const o = LumiereStore.getAllOrders().find(x => x.id === id);
  if (!o) return;
  const sym = currencySym();
  const rows = (o.items || []).map(i => `
    <tr>
      <td class="order-item-cell">${orderItemImageHtml(i)}<span>${i.name}${orderItemColorHtml(i.color)}</span></td>
      <td>${i.qty}</td>
      <td>${i.price?.toLocaleString()} ${sym}</td>
      <td>${(i.price * i.qty).toLocaleString()} ${sym}</td>
    </tr>
  `).join('');
  showModal(LumiereI18n.t('admin_order_detail') + ' ' + o.id, `
    <div class="order-detail">
      <p><strong>${LumiereI18n.t('admin_order_customer')}:</strong> ${o.customerName}</p>
      <p><strong>${LumiereI18n.t('admin_order_phone')}:</strong> ${o.customerPhone || '—'}${o.customerPhone2 ? ` / ${o.customerPhone2}` : ''}</p>
      <p><strong>Email:</strong> ${o.customerEmail || '—'}</p>
      ${o.shippingAddress ? `
        <p><strong>${LumiereI18n.t('checkout_country')}:</strong> ${o.shippingAddress.countryName || o.shippingAddress.country || '—'}</p>
        <p><strong>${LumiereI18n.t('checkout_governorate')}:</strong> ${o.shippingAddress.governorateName || '—'}</p>
        <p><strong>${LumiereI18n.t('checkout_city')}:</strong> ${o.shippingAddress.city || '—'}</p>
        <p><strong>${LumiereI18n.t('checkout_address')}:</strong> ${o.shippingAddress.address || '—'}</p>
        ${o.shippingAddress.notes ? `<p><strong>${LumiereI18n.t('checkout_notes')}:</strong> ${o.shippingAddress.notes}</p>` : ''}
      ` : ''}
      <p><strong>${LumiereI18n.t('checkout_payment')}:</strong> ${o.paymentMethodLabel || o.paymentMethod || '—'}</p>
      <p><strong>${LumiereI18n.t('account_date')}:</strong> ${o.date}</p>
      <p><strong>${LumiereI18n.t('account_status')}:</strong> ${LumiereI18n.translateStatus(o.status)}</p>
      <table class="admin-table order-items-table">
        <thead><tr><th>${LumiereI18n.t('admin_product')}</th><th>${LumiereI18n.t('admin_qty')}</th><th>${LumiereI18n.t('admin_price')}</th><th>${LumiereI18n.t('admin_subtotal')}</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="3">${LumiereI18n.t('checkout_subtotal')}</td><td>${(o.subtotal ?? o.total)?.toLocaleString()} ${sym}</td></tr>
          <tr><td colspan="3">${LumiereI18n.t('checkout_shipping')}</td><td>${o.shippingFee ? `${o.shippingFee.toLocaleString()} ${sym}` : LumiereI18n.t('checkout_shipping_free')}</td></tr>
          <tr><td colspan="3"><strong>${LumiereI18n.t('account_total')}</strong></td><td><strong>${o.total?.toLocaleString()} ${sym}</strong></td></tr>
        </tfoot>
      </table>
    </div>
  `);
};

window.deleteOrder = function(id) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteOrder(id);
  renderOrders();
  renderDashboard();
  toast(LumiereI18n.t('admin_deleted'));
};

function renderProducts() {
  const { products, categories } = LumiereStore.get();
  document.getElementById('productsTableBody').innerHTML = products.map(p => `
    <tr>
      <td><img class="table-thumb" src="${imgSrc(p.image)}" alt=""></td>
      <td><strong>${p.nameAr || p.name}</strong>${p.badge ? `<br><small>${p.badge}</small>` : ''}</td>
      <td>${p.categorySlug ? (categories.find(c => c.slug === p.categorySlug)?.nameAr || p.category) : p.category}</td>
      <td>${p.price} ${currencySym()}</td>
      <td>${p.stock}</td>
      <td>${p.featured ? '✓' : '—'}</td>
      <td class="table-actions">
        <button class="btn-icon" onclick="editProduct('${p.id}')">✏️</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteProduct('${p.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

function renderCategories() {
  const cats = LumiereStore.get().categories;
  const rows = typeof CategoryTree !== 'undefined'
    ? CategoryTree.flattenForAdmin(cats)
    : cats.map(c => ({ category: c, depth: 0 }));

  document.getElementById('categoriesTableBody').innerHTML = rows.map(({ category: c, depth }) => {
    const parent = c.parentId ? cats.find(p => p.id === c.parentId) : null;
    const parentLabel = parent ? (parent.nameAr || parent.name) : '—';
    const nameCell = `${depth ? '<span class="cat-indent">↳ </span>' : ''}${c.nameAr || c.name}`;
    return `
    <tr>
      <td><img class="table-thumb" src="${imgSrc(c.image)}" alt=""></td>
      <td>${nameCell}</td>
      <td>${parentLabel}</td>
      <td>${c.slug}</td>
      <td>${c.featured ? '✓' : '—'}</td>
      <td class="table-actions">
        <button class="btn-icon" onclick="editCategory('${c.id}')">✏️</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteCategory('${c.id}')">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function renderCollections() {
  const cols = LumiereStore.get().collections;
  document.getElementById('collectionsAdminGrid').innerHTML = cols.length ? cols.map(c => `
    <div class="collection-admin-card">
      <img src="${imgSrc(c.image)}" alt="">
      <div class="collection-admin-card__info">
        <span>${c.labelAr || c.label}</span>
        <h4>${(c.titleAr || c.title).replace('\\n', ' ')}</h4>
        <div class="table-actions">
          <button class="btn btn-sm btn-outline" onclick="editCollection('${c.id}')">${LumiereI18n.t('admin_edit')}</button>
          <button class="btn btn-sm btn-outline btn-icon--danger" onclick="deleteCollection('${c.id}')">${LumiereI18n.t('admin_delete')}</button>
        </div>
      </div>
    </div>
  `).join('') : `<p class="empty-msg">${LumiereI18n.t('admin_empty')}</p>`;
}

function renderAppearance() {
  const s = LumiereStore.get().settings;
  const t = s.theme || {};
  document.getElementById('logoPreview').src = imgSrc(s.logo);
  document.getElementById('setLogoUrl').value = s.logo?.startsWith('data:') ? '' : (s.logo || '');
  document.getElementById('themeAccent').value = t.accent || '#FF6B00';
  document.getElementById('themeAccentDark').value = t.accentDark || '#E85D00';
  document.getElementById('themePrimary').value = t.primary || '#1A1208';
  document.getElementById('themeBackground').value = t.background || '#FFFFFF';
  document.getElementById('themeCream').value = t.cream || '#FFF5EF';
  document.getElementById('themeSecondary').value = t.textSecondary || '#6B5348';
  updateThemePreview();
}

function initAppearanceForm() {
  ['themeAccent', 'themeAccentDark', 'themePrimary', 'themeBackground', 'themeCream', 'themeSecondary'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateThemePreview);
  });

  document.getElementById('setLogoFile')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      toast(LumiereI18n.t('admin_image_uploading'));
      const url = await AdminMedia.readFile(file);
      document.getElementById('logoPreview').src = url;
      document.getElementById('setLogoUrl').value = url;
    } catch (_) {
      toast(LumiereI18n.t('admin_image_upload_failed'));
    }
  });

  document.getElementById('clearLogoBtn')?.addEventListener('click', () => {
    document.getElementById('setLogoUrl').value = '';
    document.getElementById('logoPreview').src = imgSrc('assets/logo-brand.svg');
  });

  document.getElementById('appearanceForm').onsubmit = async e => {
    e.preventDefault();
    const s = LumiereStore.get().settings;
    const logoVal = fieldValue('setLogoUrl', s.logo);
    LumiereStore.updateSettings({
      logo: logoVal || s.logo,
      theme: {
        accent: document.getElementById('themeAccent').value,
        accentDark: document.getElementById('themeAccentDark').value,
        accentLight: document.getElementById('themeAccent').value,
        primary: document.getElementById('themePrimary').value,
        background: document.getElementById('themeBackground').value,
        cream: document.getElementById('themeCream').value,
        textSecondary: document.getElementById('themeSecondary').value
      }
    });
    applyAdminBranding();
    await persistAfterSave();
  };
}

const DEFAULT_HERO_TYPO = {
  eyebrow: { font: 'cairo', size: 0.82, weight: 600 },
  brand: { font: 'cormorant', size: 3.25, weight: 600 },
  tagline: { font: 'cairo', size: 1.05, weight: 500 },
  subtitle: { font: 'cairo', size: 0.95, weight: 400 }
};

const HERO_TYPO_FIELDS = [
  { key: 'eyebrow', prefix: 'Eyebrow' },
  { key: 'brand', prefix: 'Brand' },
  { key: 'tagline', prefix: 'Tagline' },
  { key: 'subtitle', prefix: 'Subtitle' }
];

function fillHeroTypoForm(typo) {
  HERO_TYPO_FIELDS.forEach(({ key, prefix }) => {
    const t = { ...DEFAULT_HERO_TYPO[key], ...(typo?.[key] || {}) };
    const fontEl = document.getElementById(`heroTypo${prefix}Font`);
    const sizeEl = document.getElementById(`heroTypo${prefix}Size`);
    const weightEl = document.getElementById(`heroTypo${prefix}Weight`);
    if (fontEl) fontEl.value = t.font;
    if (sizeEl) sizeEl.value = t.size;
    if (weightEl) weightEl.value = String(t.weight);
  });
}

function readHeroTypoForm() {
  const out = {};
  HERO_TYPO_FIELDS.forEach(({ key, prefix }) => {
    out[key] = {
      font: document.getElementById(`heroTypo${prefix}Font`)?.value || DEFAULT_HERO_TYPO[key].font,
      size: parseFloat(document.getElementById(`heroTypo${prefix}Size`)?.value) || DEFAULT_HERO_TYPO[key].size,
      weight: parseInt(document.getElementById(`heroTypo${prefix}Weight`)?.value, 10) || DEFAULT_HERO_TYPO[key].weight
    };
  });
  return out;
}

function updateThemePreview() {
  const accent = document.getElementById('themeAccent')?.value;
  const bg = document.getElementById('themeBackground')?.value;
  const primary = document.getElementById('themePrimary')?.value;
  const pa = document.getElementById('previewAccent');
  const pb = document.getElementById('previewBg');
  const pp = document.getElementById('previewPrimary');
  if (pa) pa.style.background = accent;
  if (pb) pb.style.background = bg;
  if (pp) pp.style.background = primary;
}

function renderSettings() {
  const s = LumiereStore.get().settings;
  document.getElementById('setBrand').value = s.brandName || '';
  document.getElementById('setCurrency').value = s.currencySymbol || s.currency || 'ج.م';
  renderAnnouncementLines(s);
  document.getElementById('setTaglineAr').value = s.taglineAr || '';
  document.getElementById('setTaglineEn').value = s.taglineEn || s.tagline || '';
  document.getElementById('setHeroEyebrowCityAr').value = s.heroEyebrowCityAr || '';
  document.getElementById('setHeroEyebrowNoteAr').value = s.heroEyebrowNoteAr || '';
  document.getElementById('setHeroEyebrowCityEn').value = s.heroEyebrowCityEn || '';
  document.getElementById('setHeroEyebrowNoteEn').value = s.heroEyebrowNoteEn || '';
  document.getElementById('setSubtitleAr').value = s.subtitleAr || '';
  document.getElementById('setSubtitleEn').value = s.subtitleEn || s.subtitle || '';
  document.getElementById('setInstaHandle').value = s.instaHandle || '@kwanzou.eg';
  document.getElementById('setInstaUrl').value = s.instaUrl || 'https://instagram.com/kwanzou.eg';
  fillHeroTypoForm(s.heroTypography);

  const heroFields = [
    ['setHeroImage', 'heroBgPreview', s.heroImage],
    ['setHeroAccent1', 'heroA1Preview', s.heroAccent1],
    ['setHeroAccent2', 'heroA2Preview', s.heroAccent2],
    ['setPromoImage', 'promoPreview', s.promoImage],
    ['setAuthVisualImage', 'authPreview', s.authVisualImage]
  ];
  heroFields.forEach(([inputId, previewId, src]) => {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (input) input.value = src || '';
    AdminMedia.setPreview(preview, src ? imgSrc(src) : '');
  });
  renderInstagramGalleryAdmin();
}

function getAnnouncementLinesFromSettings(s) {
  if (Array.isArray(s?.announcementLines) && s.announcementLines.length) {
    return s.announcementLines.map(line => ({
      en: line?.en || '',
      ar: line?.ar || ''
    }));
  }
  return [{
    en: s?.announcementEn || s?.announcement || '',
    ar: s?.announcementAr || ''
  }];
}

function renderAnnouncementLines(settings) {
  const wrap = document.getElementById('announcementLinesWrap');
  if (!wrap) return;
  const lines = getAnnouncementLinesFromSettings(settings || {});
  wrap.innerHTML = lines.map((line, idx) => announcementLineRowHTML(line, idx, lines.length)).join('');
  bindAnnouncementLineControls();
}

function announcementLineRowHTML(line, idx, total) {
  const label = `${LumiereI18n.t('admin_announcement_line')} ${idx + 1}`;
  const en = String(line.en || '').replace(/"/g, '&quot;');
  const ar = String(line.ar || '').replace(/"/g, '&quot;');
  return `<div class="announcement-line-row" data-idx="${idx}">
    <div class="announcement-line-row__head">
      <strong>${label}</strong>
      ${total > 1 ? `<button type="button" class="btn btn-sm btn-outline ann-line-remove" data-i18n="admin_announcement_remove">${LumiereI18n.t('admin_announcement_remove')}</button>` : ''}
    </div>
    <div class="form-row">
      <div class="form-group"><label data-i18n="admin_announcement_ar">عربي</label><input type="text" class="ann-line-ar" value="${ar}" placeholder="توصيل مجاني..."></div>
      <div class="form-group"><label data-i18n="admin_announcement">English</label><input type="text" class="ann-line-en" value="${en}" placeholder="Free shipping..."></div>
    </div>
  </div>`;
}

function bindAnnouncementLineControls() {
  document.querySelectorAll('.ann-line-remove').forEach(btn => {
    btn.onclick = () => {
      btn.closest('.announcement-line-row')?.remove();
      reindexAnnouncementLines();
    };
  });
}

function initAnnouncementLineControls() {
  const addBtn = document.getElementById('addAnnouncementLine');
  if (!addBtn || addBtn.dataset.bound) return;
  addBtn.dataset.bound = '1';
  addBtn.addEventListener('click', () => {
    const wrap = document.getElementById('announcementLinesWrap');
    if (!wrap) return;
    const count = wrap.querySelectorAll('.announcement-line-row').length;
    wrap.insertAdjacentHTML('beforeend', announcementLineRowHTML({ en: '', ar: '' }, count, count + 1));
    reindexAnnouncementLines();
    bindAnnouncementLineControls();
  });
}

function reindexAnnouncementLines() {
  const wrap = document.getElementById('announcementLinesWrap');
  if (!wrap) return;
  const rows = [...wrap.querySelectorAll('.announcement-line-row')];
  rows.forEach((row, idx) => {
    row.dataset.idx = String(idx);
    const strong = row.querySelector('.announcement-line-row__head strong');
    if (strong) strong.textContent = `${LumiereI18n.t('admin_announcement_line')} ${idx + 1}`;
    const removeBtn = row.querySelector('.ann-line-remove');
    if (removeBtn) removeBtn.hidden = rows.length <= 1;
  });
}

function collectAnnouncementLines() {
  const wrap = document.getElementById('announcementLinesWrap');
  if (!wrap) return [];
  return [...wrap.querySelectorAll('.announcement-line-row')].map(row => ({
    ar: row.querySelector('.ann-line-ar')?.value?.trim() || '',
    en: row.querySelector('.ann-line-en')?.value?.trim() || ''
  })).filter(line => line.ar || line.en);
}

function initSettingsForm() {
  document.getElementById('settingsForm').onsubmit = async e => {
    e.preventDefault();
    const s = LumiereStore.get().settings;
    const instaUrl = fieldValue('setInstaUrl', s.instaUrl || 'https://instagram.com/kwanzou.eg');
    const galleryWrap = document.getElementById('instagramGalleryWrap');
    const galleryImages = galleryWrap ? AdminMedia.collectGallery(galleryWrap, 'instagramGallery') : [];
    const announcementLines = collectAnnouncementLines();
    const firstLine = announcementLines[0] || { en: '', ar: '' };

    LumiereStore.update(data => {
      Object.assign(data.settings, {
        brandName: document.getElementById('setBrand').value,
        currencySymbol: document.getElementById('setCurrency').value,
        currency: document.getElementById('setCurrency').value,
        announcementLines,
        announcementEn: firstLine.en,
        announcement: firstLine.en,
        announcementAr: firstLine.ar,
        taglineAr: document.getElementById('setTaglineAr').value,
        taglineEn: document.getElementById('setTaglineEn').value,
        tagline: document.getElementById('setTaglineEn').value,
        heroEyebrowCityAr: document.getElementById('setHeroEyebrowCityAr').value,
        heroEyebrowNoteAr: document.getElementById('setHeroEyebrowNoteAr').value,
        heroEyebrowCityEn: document.getElementById('setHeroEyebrowCityEn').value,
        heroEyebrowNoteEn: document.getElementById('setHeroEyebrowNoteEn').value,
        subtitleAr: document.getElementById('setSubtitleAr').value,
        subtitleEn: document.getElementById('setSubtitleEn').value,
        subtitle: document.getElementById('setSubtitleEn').value,
        heroTypography: readHeroTypoForm(),
        heroImage: fieldValue('setHeroImage', s.heroImage || ''),
        heroAccent1: fieldValue('setHeroAccent1', s.heroAccent1 || ''),
        heroAccent2: fieldValue('setHeroAccent2', s.heroAccent2 || ''),
        promoImage: fieldValue('setPromoImage', s.promoImage || s.heroAccent2 || ''),
        authVisualImage: fieldValue('setAuthVisualImage', s.authVisualImage || s.heroImage || ''),
        instaHandle: fieldValue('setInstaHandle', s.instaHandle || '@kwanzou.eg'),
        instaUrl
      });
      data.instagramGallery = galleryImages.map((image, i) => ({
        id: `ig-${i + 1}`,
        image,
        link: instaUrl
      }));
    });
    applyAdminBranding();
    await persistAfterSave();
    renderAnnouncementLines(LumiereStore.get().settings);
    renderInstagramGalleryAdmin();
  };
}

function renderUsers() {
  const users = LumiereStore.get().users.filter(u => u.role !== 'superadmin' && u.role !== 'admin');
  const orders = LumiereStore.getAllOrders();
  document.getElementById('usersTableBody').innerHTML = users.length ? users.map(u => {
    const orderCount = (u.orders || []).length || orders.filter(o => o.userId === u.id).length;
    return `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td>${orderCount}</td>
      <td>${u.createdAt}</td>
      <td class="table-actions">
        <button type="button" class="btn btn-sm btn-outline" onclick="viewCustomer('${u.id}')">${LumiereI18n.t('admin_view')}</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteUser('${u.id}')">🗑</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="6">${LumiereI18n.t('admin_empty')}</td></tr>`;
}

function viewCustomer(userId) {
  const user = LumiereStore.get().users.find(u => u.id === userId);
  if (!user) return;
  const orders = LumiereStore.getAllOrders().filter(o => o.userId === userId);
  const profile = user.shippingProfile || {};
  const ordersHtml = orders.length ? orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.date}</td>
      <td>${(o.items || []).map(i => {
        const img = orderItemImageHtml(i);
        return `<div class="order-item-cell">${img}<span>${i.name} ×${i.qty}</span></div>`;
      }).join('')}</td>
      <td>${o.total?.toLocaleString()} ${currencySym()}</td>
      <td>${LumiereI18n.translateStatus(o.status)}</td>
    </tr>
  `).join('') : `<tr><td colspan="5">${LumiereI18n.t('account_no_orders')}</td></tr>`;

  showModal(`${LumiereI18n.t('admin_customer_detail')} — ${user.name}`, `
    <div class="admin-form">
      <p><strong>${LumiereI18n.t('login_email')}:</strong> ${user.email}</p>
      <p><strong>${LumiereI18n.t('register_phone')}:</strong> ${user.phone || '—'}</p>
      <p><strong>${LumiereI18n.t('account_stat_member')}:</strong> ${user.createdAt || '—'}</p>
      ${profile.city || profile.address ? `
        <h4>${LumiereI18n.t('checkout_address_section')}</h4>
        <p>${profile.city || ''} ${profile.address || ''}</p>
        <p>${profile.phone || user.phone || ''}</p>
      ` : ''}
      <h4>${LumiereI18n.t('account_orders')}</h4>
      <table class="admin-table">
        <thead><tr>
          <th>${LumiereI18n.t('account_order_id')}</th>
          <th>${LumiereI18n.t('account_date')}</th>
          <th>${LumiereI18n.t('admin_order_items')}</th>
          <th>${LumiereI18n.t('account_total')}</th>
          <th>${LumiereI18n.t('account_status')}</th>
        </tr></thead>
        <tbody>${ordersHtml}</tbody>
      </table>
    </div>
  `);
}

window.viewCustomer = viewCustomer;

async function renderStaffAdmins() {
  const tbody = document.getElementById('staffTableBody');
  const addBtn = document.getElementById('addStaffBtn');
  if (!tbody) return;
  const isSuper = adminSessionRole === 'superadmin';
  if (addBtn) addBtn.hidden = !isSuper;

  try {
    const res = await fetch('/api/admin/staff', { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    const staff = data.ok ? data.staff : [];
    _staffCache = staff;
    tbody.innerHTML = staff.length ? staff.map(member => `
      <tr>
        <td>${member.name}</td>
        <td>${member.email}${member.isCustomer ? ` <span class="admin-tag">${LumiereI18n.t('admin_staff_customer')}</span>` : ''}</td>
        <td>${member.role === 'superadmin' ? LumiereI18n.t('admin_super') : LumiereI18n.t('admin_staff_role')}</td>
        <td>${member.createdAt || '—'}</td>
        <td class="table-actions">
          ${member.protected
            ? `<span class="admin-protected">${LumiereI18n.t('admin_staff_protected')}</span>`
            : `<div class="table-actions__group">
                <button type="button" class="btn btn-sm btn-outline" onclick="viewStaffAdmin('${member.id}')">${LumiereI18n.t('admin_view')}</button>
                ${isSuper ? `<button type="button" class="btn btn-sm btn-outline" onclick="editStaffAdmin('${member.id}')">${LumiereI18n.t('admin_edit')}</button>` : ''}
                ${isSuper ? `<button type="button" class="btn btn-sm btn-outline btn-danger-text" onclick="deleteStaffAdmin('${member.id}')">${LumiereI18n.t('admin_delete')}</button>` : ''}
              </div>`}
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5">${LumiereI18n.t('admin_empty')}</td></tr>`;
  } catch (_) {
    tbody.innerHTML = `<tr><td colspan="5">${LumiereI18n.t('admin_save_failed')}</td></tr>`;
  }
}

function initStaffSection() {
  document.getElementById('addStaffBtn')?.addEventListener('click', openAddStaffModal);
}

function openAddStaffModal() {
  if (adminSessionRole !== 'superadmin') {
    toast(LumiereI18n.t('admin_staff_forbidden'));
    return;
  }
  showModal(LumiereI18n.t('admin_add_staff'), `
    <form id="staffForm" class="admin-form">
      <div class="form-group"><label>${LumiereI18n.t('register_name')}</label><input name="name" required></div>
      <div class="form-group"><label>${LumiereI18n.t('login_email')}</label><input name="email" type="email" required></div>
      <div class="form-group password-field-wrap">
        <label>${LumiereI18n.t('login_password')}</label>
        <div class="password-field"><input name="password" type="password" required minlength="6"></div>
      </div>
      <p class="admin-hint">${LumiereI18n.t('admin_add_staff_hint')}</p>
      <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
    </form>
  `);
  PasswordToggle.init(document.getElementById('modalBody'));

  document.getElementById('staffForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        password: fd.get('password')
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      toast(LumiereI18n.t(data.error || 'admin_save_failed'));
      return;
    }
    closeModal();
    await LumiereStore.initAdmin();
    renderStaffAdmins();
    toast(LumiereI18n.t(data.promoted ? 'admin_staff_promoted' : 'admin_staff_added'));
  };
}

window.viewStaffAdmin = function(id) {
  const member = _staffCache.find(s => s.id === id);
  if (!member) return;
  showModal(LumiereI18n.t('admin_view_staff'), `
    <div class="admin-detail">
      <p><strong>${LumiereI18n.t('register_name')}:</strong> ${member.name}</p>
      <p><strong>${LumiereI18n.t('login_email')}:</strong> ${member.email}</p>
      <p><strong>${LumiereI18n.t('admin_role')}:</strong> ${member.role === 'superadmin' ? LumiereI18n.t('admin_super') : LumiereI18n.t('admin_staff_role')}</p>
      <p><strong>${LumiereI18n.t('admin_joined')}:</strong> ${member.createdAt || '—'}</p>
      ${member.isCustomer ? `<p class="admin-hint">${LumiereI18n.t('admin_staff_customer_note')}</p>` : ''}
      <p class="admin-hint">${LumiereI18n.t('admin_staff_login_hint')}</p>
    </div>
  `);
};

window.editStaffAdmin = function(id) {
  if (adminSessionRole !== 'superadmin') {
    toast(LumiereI18n.t('admin_staff_forbidden'));
    return;
  }
  const member = _staffCache.find(s => s.id === id);
  if (!member || member.protected) return;
  showModal(LumiereI18n.t('admin_edit_staff'), `
    <form id="staffEditForm" class="admin-form">
      <div class="form-group"><label>${LumiereI18n.t('register_name')}</label><input name="name" value="${member.name.replace(/"/g, '&quot;')}" required></div>
      <div class="form-group"><label>${LumiereI18n.t('login_email')}</label><input value="${member.email}" disabled></div>
      <div class="form-group password-field-wrap">
        <label>${LumiereI18n.t('admin_new_password_optional')}</label>
        <div class="password-field"><input name="password" type="password" minlength="6" placeholder="${LumiereI18n.t('admin_password_optional_ph')}"></div>
      </div>
      <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
    </form>
  `);
  PasswordToggle.init(document.getElementById('modalBody'));

  document.getElementById('staffEditForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { name: fd.get('name') };
    const pass = fd.get('password');
    if (pass) body.password = pass;
    const res = await fetch(`/api/admin/staff/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      toast(LumiereI18n.t(data.error || 'admin_save_failed'));
      return;
    }
    closeModal();
    await LumiereStore.initAdmin();
    renderStaffAdmins();
    toast(LumiereI18n.t('admin_saved'));
  };
};

window.deleteStaffAdmin = async function(id) {
  if (adminSessionRole !== 'superadmin') {
    toast(LumiereI18n.t('admin_staff_forbidden'));
    return;
  }
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  const res = await fetch(`/api/admin/staff/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    toast(LumiereI18n.t(data.error || 'admin_save_failed'));
    return;
  }
  await LumiereStore.initAdmin();
  renderStaffAdmins();
  toast(LumiereI18n.t('admin_deleted'));
};

function renderTestimonials() {
  const items = LumiereStore.get().testimonials;
  document.getElementById('testimonialsAdminList').innerHTML = items.map(t => `
    <div class="testimonial-admin-card">
      <p>"${t.textAr || t.text}"</p>
      <footer>— ${t.name}, ${t.location} ${t.featured ? '★' : ''}</footer>
      <div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="editTestimonial('${t.id}')">${LumiereI18n.t('admin_edit')}</button>
        <button class="btn btn-sm btn-outline btn-icon--danger" onclick="deleteTestimonial('${t.id}')">${LumiereI18n.t('admin_delete')}</button>
      </div>
    </div>
  `).join('');
}

function renderNewsletter() {
  const list = LumiereStore.get().newsletter;
  document.getElementById('newsletterList').innerHTML = list.length
    ? list.map(e => `<li>${e} <button class="btn-icon btn-icon--danger" onclick="deleteNewsletter('${e}')">🗑</button></li>`).join('')
    : `<li class="empty-msg">${LumiereI18n.t('admin_empty')}</li>`;
}

const CONTACT_SUBJECT_KEYS = {
  order: 'admin_contact_subject_order',
  product: 'admin_contact_subject_product',
  general: 'admin_contact_subject_general'
};

function formatContactDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(LumiereI18n.getLang() === 'ar' ? 'ar-EG' : 'en-GB', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  } catch {
    return iso;
  }
}

function renderContactMessages() {
  const el = document.getElementById('contactMessagesList');
  if (!el) return;
  const messages = [...(LumiereStore.get().contactMessages || [])].sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  );
  if (!messages.length) {
    el.innerHTML = `<p class="empty-msg">${LumiereI18n.t('admin_empty')}</p>`;
    return;
  }
  el.innerHTML = messages.map(m => {
    const subjectKey = CONTACT_SUBJECT_KEYS[m.subject] || 'admin_contact_subject_general';
    const phone = m.phone ? `<a href="tel:${m.phone.replace(/\s/g, '')}">${m.phone}</a>` : '—';
    const email = m.email ? `<a href="mailto:${m.email}">${m.email}</a>` : '—';
    const wa = m.phone ? `https://wa.me/20${String(m.phone).replace(/\D/g, '').replace(/^0/, '')}` : '';
    return `<article class="contact-msg-card${m.read ? ' contact-msg-card--read' : ''}" data-id="${m.id}">
      <div class="contact-msg-card__head">
        <strong>${m.name}</strong>
        <span class="contact-msg-card__date">${formatContactDate(m.createdAt)}</span>
        ${!m.read ? '<span class="contact-msg-card__badge">NEW</span>' : ''}
      </div>
      <p class="contact-msg-card__meta"><strong>${LumiereI18n.t('contact_subject')}:</strong> ${LumiereI18n.t(subjectKey)}</p>
      <p class="contact-msg-card__meta"><strong>${LumiereI18n.t('contact_phone')}:</strong> ${phone} · <strong>${LumiereI18n.t('contact_email')}:</strong> ${email}</p>
      <p class="contact-msg-card__body">${String(m.message || '').replace(/</g, '&lt;')}</p>
      <div class="table-actions">
        ${wa ? `<a class="btn btn-sm btn-primary" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        ${m.phone ? `<a class="btn btn-sm btn-outline" href="tel:${String(m.phone).replace(/\s/g, '')}">${LumiereI18n.t('admin_contact_call')}</a>` : ''}
        ${!m.read ? `<button type="button" class="btn btn-sm btn-outline" onclick="markContactRead('${m.id}')">${LumiereI18n.t('admin_contact_mark_read')}</button>` : ''}
        <button type="button" class="btn btn-sm btn-outline btn-icon--danger" onclick="deleteContactMessage('${m.id}')">${LumiereI18n.t('admin_delete')}</button>
      </div>
    </article>`;
  }).join('');
}

window.markContactRead = function(id) {
  LumiereStore.update(data => {
    const msg = (data.contactMessages || []).find(m => m.id === id);
    if (msg) msg.read = true;
  });
  renderContactMessages();
  toast(LumiereI18n.t('admin_saved'));
};

window.deleteContactMessage = function(id) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.update(data => {
    data.contactMessages = (data.contactMessages || []).filter(m => m.id !== id);
  });
  renderContactMessages();
  toast(LumiereI18n.t('admin_deleted'));
};

window.deleteNewsletter = function(email) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteNewsletter(email);
  renderNewsletter();
  toast(LumiereI18n.t('admin_deleted'));
};

/* ---- Product CRUD ---- */
document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());

window.editProduct = function(id) {
  openProductModal(LumiereStore.get().products.find(x => x.id === id));
};

window.deleteProduct = function(id) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteProduct(id);
  renderProducts();
  renderDashboard();
  toast(LumiereI18n.t('admin_deleted'));
};

function productColorRowHTML(color = {}) {
  const nameAr = String(color.nameAr || '').replace(/"/g, '&quot;');
  const name = String(color.name || '').replace(/"/g, '&quot;');
  const hex = /^#?[0-9a-fA-F]{3,8}$/.test(color.hex || '') ? (color.hex.startsWith('#') ? color.hex : `#${color.hex}`) : '#000000';
  return `<div class="product-color-row">
    <input type="color" class="pc-hex" value="${hex}" title="${LumiereI18n.t('admin_product_color_hex')}">
    <input type="text" class="pc-name-ar" value="${nameAr}" placeholder="${LumiereI18n.t('admin_product_color_ar')}">
    <input type="text" class="pc-name-en" value="${name}" placeholder="${LumiereI18n.t('admin_product_color_en')}">
    <button type="button" class="btn-icon btn-icon--danger pc-remove" title="${LumiereI18n.t('admin_delete')}">🗑</button>
  </div>`;
}

function renderProductColors(colors) {
  const wrap = document.getElementById('productColorsWrap');
  if (!wrap) return;
  wrap.innerHTML = (colors || []).map(c => productColorRowHTML(c)).join('');
  bindProductColorControls();
}

function bindProductColorControls() {
  document.querySelectorAll('#productColorsWrap .pc-remove').forEach(btn => {
    btn.onclick = () => btn.closest('.product-color-row')?.remove();
  });
}

function collectProductColors(root) {
  const wrap = (root || document).querySelector('#productColorsWrap');
  if (!wrap) return [];
  return [...wrap.querySelectorAll('.product-color-row')].map(row => ({
    hex: row.querySelector('.pc-hex')?.value || '#000000',
    nameAr: row.querySelector('.pc-name-ar')?.value?.trim() || '',
    name: row.querySelector('.pc-name-en')?.value?.trim() || ''
  })).filter(c => c.nameAr || c.name);
}

function openProductModal(product = null) {
  const isEdit = !!product;
  const cats = LumiereStore.get().categories;
  const catOptions = typeof CategoryTree !== 'undefined'
    ? CategoryTree.buildProductSelectOptions(cats, product?.categorySlug || '')
    : cats.map(c =>
      `<option value="${c.slug}" ${product?.categorySlug === c.slug ? 'selected' : ''}>${c.nameAr || c.name}</option>`
    ).join('');

  showModal(isEdit ? LumiereI18n.t('admin_edit_product') : LumiereI18n.t('admin_add_product'), `
    <form id="productForm" class="admin-form">
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_name_en')}</label><input name="name" value="${product?.name || ''}" required></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_name_ar')}</label><input name="nameAr" value="${product?.nameAr || ''}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_price')} (${currencySym()})</label><input name="price" type="number" value="${product?.price || ''}" required></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_sale_price')}</label><input name="salePrice" type="number" min="0" value="${product?.salePrice || ''}" placeholder="${LumiereI18n.t('admin_sale_price_ph')}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_discount')}</label><input name="discount" type="number" min="0" max="90" value="${product?.discount || ''}" placeholder="%"></div>
        <div class="form-group form-checks" style="align-self:end"><label><input type="checkbox" name="onSale" ${product?.onSale || product?.salePrice || product?.discount ? 'checked' : ''}> ${LumiereI18n.t('admin_on_sale')}</label></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_category')}</label><select name="categorySlug" required>${catOptions}</select></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_stock')}</label><input name="stock" type="number" value="${product?.stock ?? 10}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_rating')}</label><input name="rating" type="number" min="1" max="5" value="${product?.rating || 5}"></div>
      </div>
      ${imageUploadHTML('image', product?.image, LumiereI18n.t('admin_product_main_image'))}
      <div class="form-group"><label>${LumiereI18n.t('admin_product_images')}</label>${AdminMedia.galleryHTML(product?.images?.length > 1 ? product.images.slice(1) : [])}</div>
      <div class="form-group product-colors-field">
        <label>${LumiereI18n.t('admin_product_colors')}</label>
        <p class="field-hint">${LumiereI18n.t('admin_product_colors_hint')}</p>
        <div id="productColorsWrap" class="product-colors-wrap"></div>
        <button type="button" class="btn btn-sm btn-outline" id="addProductColor">+ ${LumiereI18n.t('admin_product_color_add')}</button>
      </div>
      <div class="form-group"><label>${LumiereI18n.t('admin_badge')}</label><input name="badge" value="${product?.badge || ''}"></div>
      <div class="form-group"><label>${LumiereI18n.t('admin_desc_ar')}</label><textarea name="descAr" rows="2">${product?.descAr || ''}</textarea></div>
      <div class="form-group"><label>${LumiereI18n.t('admin_desc_en')}</label><textarea name="descEn" rows="2">${product?.descEn || ''}</textarea></div>
      <div class="form-checks">
        <label><input type="checkbox" name="featured" ${product?.featured ? 'checked' : ''}> ${LumiereI18n.t('admin_featured')}</label>
        <label><input type="checkbox" name="bestseller" ${product?.bestseller ? 'checked' : ''}> ${LumiereI18n.t('admin_bestseller')}</label>
      </div>
      <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
    </form>
  `);
  bindModalImageUploads();
  AdminMedia.bindGallery(document.getElementById('modalBody'), toast);
  renderProductColors(product?.colors || []);
  document.getElementById('addProductColor')?.addEventListener('click', () => {
    const wrap = document.getElementById('productColorsWrap');
    if (!wrap) return;
    wrap.insertAdjacentHTML('beforeend', productColorRowHTML({ nameAr: '', name: '', hex: '#000000' }));
    bindProductColorControls();
  });

  document.getElementById('productForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const catSlugRaw = (fd.get('categorySlug') || '').toString();
    const cat = typeof CategoryTree !== 'undefined'
      ? CategoryTree.getBySlug(cats, catSlugRaw)
      : cats.find(c => c.slug === catSlugRaw);
    const modalBody = document.getElementById('modalBody');
    const gallery = AdminMedia.collectGallery(modalBody);
    const image = (fd.get('image') || product?.image || '').toString().trim();
    if (!image) {
      toast(LumiereI18n.t('admin_image_required'));
      return;
    }
    const extras = AdminMedia.collectGallery(modalBody);
    const images = [...new Set([image, ...extras].filter(Boolean))];
    const salePriceVal = fd.get('salePrice');
    const discountVal = fd.get('discount');
    const data = {
      name: fd.get('name'),
      nameAr: fd.get('nameAr'),
      category: cat?.name || cat?.nameAr || '',
      categorySlug: cat?.slug || catSlugRaw,
      price: +fd.get('price'),
      salePrice: salePriceVal ? +salePriceVal : null,
      discount: discountVal ? +discountVal : 0,
      onSale: fd.has('onSale'),
      stock: +fd.get('stock'),
      rating: +fd.get('rating'),
      reviews: product?.reviews || 0,
      image,
      images,
      colors: collectProductColors(modalBody),
      badge: fd.get('badge'),
      descAr: fd.get('descAr'),
      descEn: fd.get('descEn'),
      featured: fd.has('featured'),
      bestseller: fd.has('bestseller')
    };
    if (isEdit) LumiereStore.updateProduct(product.id, data);
    else LumiereStore.addProduct(data);
    closeModal();
    renderProducts();
    renderDashboard();
    await persistAfterSave();
  };
}

/* ---- Category CRUD ---- */
document.getElementById('addCategoryBtn')?.addEventListener('click', () => openCategoryModal());

window.editCategory = function(id) {
  openCategoryModal(LumiereStore.get().categories.find(c => c.id === id));
};

window.deleteCategory = function(id) {
  const cats = LumiereStore.get().categories;
  const hasChildren = cats.some(c => c.parentId === id);
  if (hasChildren) {
    toast(LumiereI18n.t('admin_delete_subcategories_first'));
    return;
  }
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteCategory(id);
  renderCategories();
  renderDashboard();
  toast(LumiereI18n.t('admin_deleted'));
};

function slugifyCategory(value) {
  const raw = String(value || '').trim();
  const AR_SLUG_MAP = {
    'بيرسينج': 'piercing',
    'بروش': 'brooch',
    'سلاسل': 'necklaces',
    'أساور': 'bracelets',
    'اساور': 'bracelets',
    'حلقان': 'earrings',
    'خواتم': 'rings',
    'خلخال': 'anklet',
    'بروش': 'brooch',
    'ساعات': 'watches',
    'ميداليه': 'medallion',
    'مديليه': 'medallion',
    'منتجات اخرى': 'other',
    'منتجات أخرى': 'other'
  };
  if (AR_SLUG_MAP[raw]) return AR_SLUG_MAP[raw];

  const slug = raw
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Reject empty or nonsense slugs like "eeee" (Arabic names strip to empty / junk).
  if (!slug || /^(.)\1{2,}$/.test(slug)) return '';
  return slug;
}

function openCategoryModal(cat = null) {
  const cats = LumiereStore.get().categories;
  const parentOptions = typeof CategoryTree !== 'undefined'
    ? CategoryTree.buildParentSelectOptions(cats, cat?.parentId || '', cat?.id || '')
    : '<option value="">—</option>';

  showModal(cat ? LumiereI18n.t('admin_edit_category') : LumiereI18n.t('admin_add_category'), `
    <form id="catForm" class="admin-form">
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_name_en')}</label><input name="name" value="${cat?.name || ''}" required></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_name_ar')}</label><input name="nameAr" value="${cat?.nameAr || ''}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Slug</label><input name="slug" value="${cat?.slug || ''}" required pattern="[a-z0-9-]+"></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_sort')}</label><input name="sort" type="number" value="${cat?.sort ?? 99}"></div>
      </div>
      <div class="form-group">
        <label>${LumiereI18n.t('admin_parent_category')}</label>
        <select name="parentId">${parentOptions}</select>
        <small>${LumiereI18n.t('admin_parent_category_hint')}</small>
      </div>
      ${imageUploadHTML('image', cat?.image, LumiereI18n.t('admin_category_image'))}
      <label><input type="checkbox" name="featured" ${cat?.featured ? 'checked' : ''}> ${LumiereI18n.t('admin_featured_home')}</label>
      <br><br>
      <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
    </form>
  `);
  bindModalImageUploads();
  document.getElementById('catForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const parentId = (fd.get('parentId') || '').toString() || null;
    const slug = slugifyCategory(fd.get('slug') || fd.get('name'));
    if (!slug) {
      toast(LumiereI18n.t('admin_slug_invalid'));
      return;
    }
    // Only check for duplicates when the slug actually changes — legacy data
    // contains shared slugs, and editing (e.g. the image) must never be blocked.
    const slugChanged = !cat || slug !== cat.slug;
    const dup = slugChanged && cats.some(c => c.slug === slug && c.id !== cat?.id);
    if (dup) {
      toast(LumiereI18n.t('admin_slug_duplicate'));
      return;
    }
    const data = {
      name: fd.get('name'),
      nameAr: fd.get('nameAr'),
      slug,
      sort: +fd.get('sort'),
      image: (fd.get('image') || '').toString().trim(),
      featured: fd.has('featured'),
      parentId
    };
    if (cat) {
      const oldSlug = cat.slug;
      const oldNameAr = cat.nameAr;
      const oldName = cat.name;
      LumiereStore.updateCategory(cat.id, data);
      // Keep products linked when the category slug/name changes.
      if (oldSlug !== slug || oldNameAr !== data.nameAr) {
        LumiereStore.update(store => {
          store.products.forEach(p => {
            if (
              p.categorySlug === oldSlug ||
              p.categorySlug === oldNameAr ||
              p.category === oldNameAr ||
              p.category === oldName
            ) {
              p.categorySlug = slug;
              p.category = data.name || data.nameAr;
            }
          });
        });
      }
    } else {
      LumiereStore.addCategory(data);
    }
    closeModal();
    renderCategories();
    renderDashboard();
    await persistAfterSave();
  };
}

/* ---- Collection CRUD ---- */
document.getElementById('addCollectionBtn')?.addEventListener('click', () => openCollectionModal());

window.editCollection = function(id) {
  openCollectionModal(LumiereStore.get().collections.find(c => c.id === id));
};

window.deleteCollection = function(id) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteCollection(id);
  renderCollections();
  toast(LumiereI18n.t('admin_deleted'));
};

function openCollectionModal(col = null) {
  showModal(col ? LumiereI18n.t('admin_edit_collection') : LumiereI18n.t('admin_add_collection'), `
    <form id="colForm" class="admin-form">
      <div class="form-row">
        <div class="form-group"><label>Label (EN)</label><input name="label" value="${col?.label || ''}"></div>
        <div class="form-group"><label>Label (AR)</label><input name="labelAr" value="${col?.labelAr || ''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Title (EN)</label><input name="title" value="${col?.title || ''}"></div>
        <div class="form-group"><label>Title (AR)</label><input name="titleAr" value="${col?.titleAr || ''}"></div>
      </div>
      <div class="form-group"><label>Slug</label><input name="slug" value="${col?.slug || ''}"></div>
      ${imageUploadHTML('image', col?.image, LumiereI18n.t('admin_image'))}
      <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
    </form>
  `);
  bindModalImageUploads();
  document.getElementById('colForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      label: fd.get('label'),
      labelAr: fd.get('labelAr'),
      labelEn: fd.get('label'),
      title: fd.get('title'),
      titleAr: fd.get('titleAr'),
      titleEn: fd.get('title'),
      slug: fd.get('slug'),
      image: fd.get('image') || col?.image
    };
    if (col) LumiereStore.updateCollection(col.id, data);
    else LumiereStore.addCollection(data);
    closeModal();
    renderCollections();
    await persistAfterSave();
  };
}

/* ---- Testimonial CRUD ---- */
document.getElementById('addTestimonialBtn')?.addEventListener('click', () => openTestimonialModal());

window.editTestimonial = function(id) {
  openTestimonialModal(LumiereStore.get().testimonials.find(x => x.id === id));
};

window.deleteTestimonial = function(id) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteTestimonial(id);
  renderTestimonials();
  toast(LumiereI18n.t('admin_deleted'));
};

function openTestimonialModal(t = null) {
  showModal(t ? LumiereI18n.t('admin_edit_testimonial') : LumiereI18n.t('admin_add_testimonial'), `
    <form id="testForm" class="admin-form">
      <div class="form-group"><label>${LumiereI18n.t('admin_quote_ar')}</label><textarea name="textAr" rows="2">${t?.textAr || t?.text || ''}</textarea></div>
      <div class="form-group"><label>${LumiereI18n.t('admin_quote_en')}</label><textarea name="textEn" rows="2">${t?.textEn || t?.text || ''}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_customer_name')}</label><input name="name" value="${t?.name || ''}"></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_location')}</label><input name="location" value="${t?.location || ''}"></div>
      </div>
      ${imageUploadHTML('avatar', t?.avatar, LumiereI18n.t('admin_avatar'))}
      <label><input type="checkbox" name="featured" ${t?.featured ? 'checked' : ''}> ${LumiereI18n.t('admin_featured')}</label>
      <br><br>
      <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
    </form>
  `);
  bindModalImageUploads();
  document.getElementById('testForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      text: fd.get('textEn'),
      textAr: fd.get('textAr'),
      textEn: fd.get('textEn'),
      name: fd.get('name'),
      location: fd.get('location'),
      avatar: fd.get('avatar') || t?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      featured: fd.has('featured')
    };
    if (t) LumiereStore.updateTestimonial(t.id, data);
    else LumiereStore.addTestimonial(data);
    closeModal();
    renderTestimonials();
    await persistAfterSave();
  };
}

window.deleteUser = function(id) {
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteUser(id);
  renderUsers();
  renderDashboard();
  toast(LumiereI18n.t('admin_deleted'));
};

function initModals() {
  document.querySelector('.admin-modal__close')?.addEventListener('click', closeModal);
  document.querySelector('.admin-modal__backdrop')?.addEventListener('click', closeModal);
}

function showModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('adminModal').hidden = false;
}

function closeModal() {
  document.getElementById('adminModal').hidden = true;
}

function initLogout() {
  document.getElementById('adminLogout')?.addEventListener('click', () => AdminSession.logout());
}

function toast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
