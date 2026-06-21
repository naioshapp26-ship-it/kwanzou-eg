/**
 * Super Admin Dashboard — full site control
 */
const ADMIN_BASE = '../';

document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  LumiereI18n.bindLangSwitch();
  const session = LumiereAuth.requireSuperAdmin();
  if (!session) return;

  document.getElementById('adminUserName').textContent = session.name;
  applyAdminBranding();
  initNavigation();
  renderDashboard();
  renderOrders();
  renderProducts();
  renderCategories();
  renderCollections();
  renderAppearance();
  renderSettings();
  initAppearanceForm();
  initSettingsForm();
  renderUsers();
  renderTestimonials();
  renderNewsletter();
  initModals();
  initLogout();
  initReset();
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
  if (clean === 'assets/logo.png') return `${ADMIN_BASE}assets/logo.png?v=3`;
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
    dashboard: 'admin_dashboard', orders: 'admin_orders', products: 'admin_products',
    categories: 'admin_categories', collections: 'admin_collections', appearance: 'admin_appearance',
    settings: 'admin_settings', users: 'admin_users', testimonials: 'admin_testimonials', newsletter: 'admin_newsletter'
  };
  document.getElementById('adminPageTitle').textContent = LumiereI18n.t(titles[section] || section);
  document.getElementById('adminSidebar')?.classList.remove('open');
  if (section === 'orders') renderOrders();
  if (section === 'dashboard') renderDashboard();
  if (section === 'appearance') renderAppearance();
  if (section === 'settings') {
    renderSettings();
    AdminMedia.init(document.getElementById('sec-settings'), toast);
  }
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
    const itemsText = (o.items || []).map(i => `${i.name} ×${i.qty}`).join('، ');
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

window.viewOrder = function(id) {
  const o = LumiereStore.getAllOrders().find(x => x.id === id);
  if (!o) return;
  const sym = currencySym();
  const rows = (o.items || []).map(i => `
    <tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price?.toLocaleString()} ${sym}</td><td>${(i.price * i.qty).toLocaleString()} ${sym}</td></tr>
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
  document.getElementById('categoriesTableBody').innerHTML = cats.map(c => `
    <tr>
      <td><img class="table-thumb" src="${imgSrc(c.image)}" alt=""></td>
      <td>${c.nameAr || c.name}</td>
      <td>${c.slug}</td>
      <td>${c.featured ? '✓' : '—'}</td>
      <td class="table-actions">
        <button class="btn-icon" onclick="editCategory('${c.id}')">✏️</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteCategory('${c.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
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
  document.getElementById('themeAccent').value = t.accent || '#C9A962';
  document.getElementById('themeAccentDark').value = t.accentDark || '#A8893E';
  document.getElementById('themePrimary').value = t.primary || '#2C2420';
  document.getElementById('themeBackground').value = t.background || '#FAF8F5';
  document.getElementById('themeCream').value = t.cream || '#F5F0EB';
  document.getElementById('themeSecondary').value = t.textSecondary || '#6B5E54';
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
      const dataUrl = await AdminMedia.readFile(file);
      document.getElementById('logoPreview').src = dataUrl;
      document.getElementById('setLogoUrl').value = dataUrl;
    } catch (_) {
      toast(LumiereI18n.t('admin_image_upload_failed'));
    }
  });

  document.getElementById('clearLogoBtn')?.addEventListener('click', () => {
    document.getElementById('setLogoUrl').value = '';
    document.getElementById('logoPreview').src = imgSrc('assets/logo.png');
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
  eyebrow: { font: 'jost', size: 0.72, weight: 500 },
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
  document.getElementById('setAnnouncement').value = s.announcementEn || s.announcement || '';
  document.getElementById('setAnnouncementAr').value = s.announcementAr || '';
  document.getElementById('setTaglineAr').value = s.taglineAr || '';
  document.getElementById('setTaglineEn').value = s.taglineEn || s.tagline || '';
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

function initSettingsForm() {
  document.getElementById('settingsForm').onsubmit = async e => {
    e.preventDefault();
    const s = LumiereStore.get().settings;
    const instaUrl = fieldValue('setInstaUrl', s.instaUrl || 'https://instagram.com/kwanzou.eg');
    const galleryWrap = document.getElementById('instagramGalleryWrap');
    const galleryImages = galleryWrap ? AdminMedia.collectGallery(galleryWrap, 'instagramGallery') : [];

    LumiereStore.update(data => {
      Object.assign(data.settings, {
        brandName: document.getElementById('setBrand').value,
        currencySymbol: document.getElementById('setCurrency').value,
        currency: document.getElementById('setCurrency').value,
        announcementEn: document.getElementById('setAnnouncement').value,
        announcement: document.getElementById('setAnnouncement').value,
        announcementAr: document.getElementById('setAnnouncementAr').value,
        taglineAr: document.getElementById('setTaglineAr').value,
        taglineEn: document.getElementById('setTaglineEn').value,
        tagline: document.getElementById('setTaglineEn').value,
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
    renderInstagramGalleryAdmin();
  };
}

function renderUsers() {
  const users = LumiereStore.get().users.filter(u => u.role !== 'superadmin');
  document.getElementById('usersTableBody').innerHTML = users.length ? users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td>${u.role}</td>
      <td>${u.createdAt}</td>
      <td class="table-actions">
        <button class="btn-icon btn-icon--danger" onclick="deleteUser('${u.id}')">🗑</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6">${LumiereI18n.t('admin_empty')}</td></tr>`;
}

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

function openProductModal(product = null) {
  const isEdit = !!product;
  const cats = LumiereStore.get().categories;
  const catOptions = cats.map(c =>
    `<option value="${c.slug}" ${product?.categorySlug === c.slug ? 'selected' : ''}>${c.nameAr || c.name}</option>`
  ).join('');

  showModal(isEdit ? LumiereI18n.t('admin_edit_product') : LumiereI18n.t('admin_add_product'), `
    <form id="productForm" class="admin-form">
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_name_en')}</label><input name="name" value="${product?.name || ''}" required></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_name_ar')}</label><input name="nameAr" value="${product?.nameAr || ''}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_category')}</label><select name="categorySlug" required>${catOptions}</select></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_price')} (${currencySym()})</label><input name="price" type="number" value="${product?.price || ''}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${LumiereI18n.t('admin_stock')}</label><input name="stock" type="number" value="${product?.stock ?? 10}"></div>
        <div class="form-group"><label>${LumiereI18n.t('admin_rating')}</label><input name="rating" type="number" min="1" max="5" value="${product?.rating || 5}"></div>
      </div>
      ${imageUploadHTML('image', product?.image, LumiereI18n.t('admin_product_main_image'))}
      <div class="form-group"><label>${LumiereI18n.t('admin_product_images')}</label>${AdminMedia.galleryHTML(product?.images?.length > 1 ? product.images.slice(1) : [])}</div>
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

  document.getElementById('productForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cat = cats.find(c => c.slug === fd.get('categorySlug'));
    const modalBody = document.getElementById('modalBody');
    const gallery = AdminMedia.collectGallery(modalBody);
    const image = (fd.get('image') || product?.image || '').toString().trim();
    if (!image) {
      toast(LumiereI18n.t('admin_image_required'));
      return;
    }
    const extras = AdminMedia.collectGallery(modalBody);
    const images = [...new Set([image, ...extras].filter(Boolean))];
    const data = {
      name: fd.get('name'),
      nameAr: fd.get('nameAr'),
      category: cat?.name || '',
      categorySlug: fd.get('categorySlug'),
      price: +fd.get('price'),
      stock: +fd.get('stock'),
      rating: +fd.get('rating'),
      reviews: product?.reviews || 0,
      image,
      images,
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
  if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
  LumiereStore.deleteCategory(id);
  renderCategories();
  renderDashboard();
  toast(LumiereI18n.t('admin_deleted'));
};

function openCategoryModal(cat = null) {
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
    const data = {
      name: fd.get('name'),
      nameAr: fd.get('nameAr'),
      slug: fd.get('slug'),
      sort: +fd.get('sort'),
      image: fd.get('image') || cat?.image,
      featured: fd.has('featured')
    };
    if (cat) LumiereStore.updateCategory(cat.id, data);
    else LumiereStore.addCategory(data);
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
  document.getElementById('adminLogout')?.addEventListener('click', () => LumiereAuth.logout());
}

function initReset() {
  document.getElementById('resetDataBtn')?.addEventListener('click', async () => {
    if (!confirm(LumiereI18n.t('admin_reset_confirm'))) return;
    await LumiereStore.reset();
    location.reload();
  });
}

function toast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
