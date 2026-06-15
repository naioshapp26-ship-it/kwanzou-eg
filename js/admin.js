/**
 * Super Admin Dashboard — full site control
 */
const ADMIN_BASE = '../';
const MAX_IMAGE_BYTES = 800000;

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
  initImageUploads(document);
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

function imgSrc(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
  return ADMIN_BASE + url;
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
  if (section === 'settings') renderSettings();
}

function initNavigation() {
  document.querySelectorAll('.admin-nav__item').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.toggle('open');
  });
}

function initImageUploads(root) {
  root.querySelectorAll('.image-file-input').forEach(input => {
    input.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_IMAGE_BYTES) {
        toast(LumiereI18n.t('admin_image_too_large'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const targetId = input.dataset.target;
        const previewId = input.dataset.preview;
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) el.value = reader.result;
        }
        if (previewId) {
          const img = document.getElementById(previewId);
          if (img) img.src = reader.result;
        }
        const groupPreview = input.closest('.image-upload-group')?.querySelector('.image-preview');
        if (groupPreview && !previewId) groupPreview.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  });
}

function imageUploadHTML(name, current, label) {
  const safe = (current && !String(current).startsWith('data:')) ? current : '';
  const preview = current ? imgSrc(current) : '';
  return `
    <div class="image-upload-group">
      <label>${label}</label>
      ${preview ? `<img class="image-preview" src="${preview}" alt="">` : '<img class="image-preview" alt="" hidden>'}
      <input type="url" name="${name}" value="${safe}" placeholder="https://...">
      <input type="file" accept="image/*" class="image-file-input" data-field="${name}">
      <small>${LumiereI18n.t('admin_image_hint')}</small>
    </div>`;
}

function bindModalImageUploads() {
  const body = document.getElementById('modalBody');
  body.querySelectorAll('.image-file-input').forEach(input => {
    input.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file || file.size > MAX_IMAGE_BYTES) return;
      const reader = new FileReader();
      reader.onload = () => {
        const field = body.querySelector(`[name="${input.dataset.field}"]`);
        if (field) field.value = reader.result;
        const preview = input.closest('.image-upload-group')?.querySelector('.image-preview');
        if (preview) { preview.hidden = false; preview.src = reader.result; }
      };
      reader.readAsDataURL(file);
    });
  });
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
      <p><strong>${LumiereI18n.t('admin_order_phone')}:</strong> ${o.customerPhone || '—'}</p>
      <p><strong>Email:</strong> ${o.customerEmail || '—'}</p>
      <p><strong>${LumiereI18n.t('account_date')}:</strong> ${o.date}</p>
      <p><strong>${LumiereI18n.t('account_status')}:</strong> ${LumiereI18n.translateStatus(o.status)}</p>
      <table class="admin-table order-items-table">
        <thead><tr><th>${LumiereI18n.t('admin_product')}</th><th>${LumiereI18n.t('admin_qty')}</th><th>${LumiereI18n.t('admin_price')}</th><th>${LumiereI18n.t('admin_subtotal')}</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3"><strong>${LumiereI18n.t('account_total')}</strong></td><td><strong>${o.total?.toLocaleString()} ${sym}</strong></td></tr></tfoot>
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

  document.getElementById('setLogoFile')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || file.size > MAX_IMAGE_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('logoPreview').src = reader.result;
      document.getElementById('setLogoUrl').value = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('appearanceForm').onsubmit = e => {
    e.preventDefault();
    const s = LumiereStore.get().settings;
    const logoVal = document.getElementById('setLogoUrl').value.trim();
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
    toast(LumiereI18n.t('admin_saved'));
  };
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
  document.getElementById('setHeroImage').value = s.heroImage?.startsWith('data:') ? '' : (s.heroImage || '');
  document.getElementById('setHeroAccent1').value = s.heroAccent1?.startsWith('data:') ? '' : (s.heroAccent1 || '');
  document.getElementById('setHeroAccent2').value = s.heroAccent2?.startsWith('data:') ? '' : (s.heroAccent2 || '');
  ['heroBgPreview', 'heroA1Preview', 'heroA2Preview'].forEach((id, i) => {
    const src = [s.heroImage, s.heroAccent1, s.heroAccent2][i];
    const el = document.getElementById(id);
    if (el && src) { el.src = imgSrc(src); el.hidden = false; }
  });
}

function initSettingsForm() {
  document.getElementById('settingsForm').onsubmit = e => {
    e.preventDefault();
    const s = LumiereStore.get().settings;
    const getImg = (id, fallback) => {
      const v = document.getElementById(id).value.trim();
      return v || fallback;
    };
    LumiereStore.updateSettings({
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
      heroImage: getImg('setHeroImage', s.heroImage),
      heroAccent1: getImg('setHeroAccent1', s.heroAccent1),
      heroAccent2: getImg('setHeroAccent2', s.heroAccent2)
    });
    applyAdminBranding();
    toast(LumiereI18n.t('admin_saved'));
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
      ${imageUploadHTML('image', product?.image, LumiereI18n.t('admin_product_image'))}
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

  document.getElementById('productForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cat = cats.find(c => c.slug === fd.get('categorySlug'));
    const image = fd.get('image') || product?.image;
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
      images: [image],
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
    toast(LumiereI18n.t('admin_saved'));
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
  document.getElementById('catForm').onsubmit = e => {
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
    toast(LumiereI18n.t('admin_saved'));
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
  document.getElementById('colForm').onsubmit = e => {
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
    toast(LumiereI18n.t('admin_saved'));
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
  document.getElementById('testForm').onsubmit = e => {
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
    toast(LumiereI18n.t('admin_saved'));
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
