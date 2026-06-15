/**
 * Super Admin Dashboard
 */
document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  LumiereI18n.bindLangSwitch();
  const session = LumiereAuth.requireSuperAdmin();
  if (!session) return;

  document.getElementById('adminUserName').textContent = session.name;
  initNavigation();
  renderDashboard();
  renderProducts();
  renderCategories();
  renderCollections();
  renderSettings();
  renderUsers();
  renderTestimonials();
  renderNewsletter();
  initModals();
  initLogout();
  initReset();
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

function switchSection(section) {
  document.querySelectorAll('.admin-nav__item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('active', s.id === `sec-${section}`));
  const titles = {
    dashboard: 'admin_dashboard', products: 'admin_products', categories: 'admin_categories',
    collections: 'admin_collections', settings: 'admin_settings', users: 'admin_users',
    testimonials: 'admin_testimonials', newsletter: 'admin_newsletter'
  };
  document.getElementById('adminPageTitle').textContent = LumiereI18n.t(titles[section] || section);
  document.getElementById('adminSidebar')?.classList.remove('open');
}

function initNavigation() {
  document.querySelectorAll('.admin-nav__item').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.toggle('open');
  });
}

function renderDashboard() {
  const data = LumiereStore.get();
  document.getElementById('dashProducts').textContent = data.products.length;
  document.getElementById('dashCategories').textContent = data.categories.length;
  document.getElementById('dashCustomers').textContent = data.users.filter(u => u.role === 'customer').length;
  document.getElementById('dashNewsletter').textContent = data.newsletter.length;
  document.getElementById('dashRecentProducts').innerHTML = data.products.slice(-3).reverse().map(p =>
    `<div class="dash-product-row"><img src="${p.image}" alt=""><span>${p.name}</span><span>$${p.price}</span></div>`
  ).join('');
}

function renderProducts() {
  const products = LumiereStore.get().products;
  document.getElementById('productsTableBody').innerHTML = products.map(p => `
    <tr>
      <td><img class="table-thumb" src="${p.image}" alt=""></td>
      <td><strong>${p.name}</strong>${p.badge ? `<br><small>${p.badge}</small>` : ''}</td>
      <td>${p.category}</td>
      <td>$${p.price}</td>
      <td>${p.stock}</td>
      <td>${p.featured ? '✓' : '—'}</td>
      <td class="table-actions">
        <button class="btn-icon" onclick="editProduct('${p.id}')">✏️</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteProduct('${p.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function renderCategories() {
  const cats = LumiereStore.get().categories;
  document.getElementById('categoriesTableBody').innerHTML = cats.map(c => `
    <tr>
      <td><img class="table-thumb" src="${c.image}" alt=""></td>
      <td>${c.name}</td>
      <td>${c.slug}</td>
      <td>${c.featured ? '✓' : '—'}</td>
      <td class="table-actions">
        <button class="btn-icon" onclick="editCategory('${c.id}')">✏️</button>
        <button class="btn-icon btn-icon--danger" onclick="deleteCategory('${c.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function renderCollections() {
  const cols = LumiereStore.get().collections;
  document.getElementById('collectionsAdminGrid').innerHTML = cols.map(c => `
    <div class="collection-admin-card">
      <img src="${c.image}" alt="">
      <div class="collection-admin-card__info">
        <span>${c.label}</span>
        <h4>${c.title.replace('\\n', ' ')}</h4>
        <button class="btn btn-sm btn-outline" onclick="editCollection('${c.id}')">Edit</button>
      </div>
    </div>
  `).join('');
}

function renderSettings() {
  const s = LumiereStore.get().settings;
  document.getElementById('setBrand').value = s.brandName;
  document.getElementById('setCurrency').value = s.currency;
  document.getElementById('setTagline').value = s.tagline;
  document.getElementById('setSubtitle').value = s.subtitle;
  document.getElementById('setAnnouncement').value = s.announcement;
  document.getElementById('setHeroImage').value = s.heroImage;
  document.getElementById('setHeroAccent1').value = s.heroAccent1;
  document.getElementById('setHeroAccent2').value = s.heroAccent2;

  document.getElementById('settingsForm').onsubmit = e => {
    e.preventDefault();
    LumiereStore.updateSettings({
      brandName: document.getElementById('setBrand').value,
      currency: document.getElementById('setCurrency').value,
      tagline: document.getElementById('setTagline').value,
      subtitle: document.getElementById('setSubtitle').value,
      announcement: document.getElementById('setAnnouncement').value,
      heroImage: document.getElementById('setHeroImage').value,
      heroAccent1: document.getElementById('setHeroAccent1').value,
      heroAccent2: document.getElementById('setHeroAccent2').value
    });
    toast('Site settings saved! Refresh homepage to see changes.');
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
      <td><button class="btn-icon btn-icon--danger" onclick="deleteUser('${u.id}')">🗑️</button></td>
    </tr>
  `).join('') : '<tr><td colspan="6">No customers yet.</td></tr>';
}

function renderTestimonials() {
  const items = LumiereStore.get().testimonials;
  document.getElementById('testimonialsAdminList').innerHTML = items.map(t => `
    <div class="testimonial-admin-card">
      <p>"${t.text}"</p>
      <footer>— ${t.name}, ${t.location} ${t.featured ? '(Featured)' : ''}</footer>
      <button class="btn btn-sm btn-outline" onclick="editTestimonial('${t.id}')">Edit</button>
    </div>
  `).join('');
}

function renderNewsletter() {
  const list = LumiereStore.get().newsletter;
  document.getElementById('newsletterList').innerHTML = list.length
    ? list.map(e => `<li>${e}</li>`).join('')
    : '<li class="empty-msg">No subscribers yet.</li>';
}

/* ---- Product CRUD ---- */
document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());

window.editProduct = function(id) {
  const p = LumiereStore.get().products.find(x => x.id === id);
  openProductModal(p);
};

window.deleteProduct = function(id) {
  if (confirm('Delete this product?')) {
    LumiereStore.deleteProduct(id);
    renderProducts(); renderDashboard();
    toast('Product deleted');
  }
};

function openProductModal(product = null) {
  const isEdit = !!product;
  showModal(isEdit ? 'Edit Product' : 'Add Product', `
    <form id="productForm" class="admin-form">
      <div class="form-group"><label>Name</label><input name="name" value="${product?.name || ''}" required></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label><input name="category" value="${product?.category || ''}" required></div>
        <div class="form-group"><label>Price ($)</label><input name="price" type="number" value="${product?.price || ''}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Stock</label><input name="stock" type="number" value="${product?.stock || 10}"></div>
        <div class="form-group"><label>Rating (1-5)</label><input name="rating" type="number" min="1" max="5" value="${product?.rating || 5}"></div>
      </div>
      <div class="form-group"><label>Image URL</label><input name="image" type="url" value="${product?.image || ''}" required></div>
      <div class="form-group"><label>Badge (New, Best Seller, Limited)</label><input name="badge" value="${product?.badge || ''}"></div>
      <div class="form-checks">
        <label><input type="checkbox" name="featured" ${product?.featured ? 'checked' : ''}> Featured</label>
        <label><input type="checkbox" name="bestseller" ${product?.bestseller ? 'checked' : ''}> Best Seller</label>
      </div>
      <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Add Product'}</button>
    </form>
  `);

  document.getElementById('productForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'), category: fd.get('category'),
      price: +fd.get('price'), stock: +fd.get('stock'),
      rating: +fd.get('rating'), reviews: product?.reviews || 0,
      image: fd.get('image'), badge: fd.get('badge'),
      featured: fd.has('featured'), bestseller: fd.has('bestseller')
    };
    if (isEdit) LumiereStore.updateProduct(product.id, data);
    else LumiereStore.addProduct(data);
    closeModal(); renderProducts(); renderDashboard();
    toast(isEdit ? 'Product updated' : 'Product added');
  };
}

/* ---- Category CRUD ---- */
document.getElementById('addCategoryBtn')?.addEventListener('click', () => openCategoryModal());

window.editCategory = function(id) {
  openCategoryModal(LumiereStore.get().categories.find(c => c.id === id));
};

window.deleteCategory = function(id) {
  if (confirm('Delete category?')) {
    LumiereStore.deleteCategory(id);
    renderCategories(); renderDashboard();
    toast('Category deleted');
  }
};

function openCategoryModal(cat = null) {
  showModal(cat ? 'Edit Category' : 'Add Category', `
    <form id="catForm" class="admin-form">
      <div class="form-group"><label>Name</label><input name="name" value="${cat?.name || ''}" required></div>
      <div class="form-group"><label>Slug</label><input name="slug" value="${cat?.slug || ''}" required></div>
      <div class="form-group"><label>Image URL</label><input name="image" type="url" value="${cat?.image || ''}" required></div>
      <label><input type="checkbox" name="featured" ${cat?.featured ? 'checked' : ''}> Featured on homepage</label>
      <br><br>
      <button type="submit" class="btn btn-primary">Save</button>
    </form>
  `);
  document.getElementById('catForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { name: fd.get('name'), slug: fd.get('slug'), image: fd.get('image'), featured: fd.has('featured') };
    if (cat) LumiereStore.updateCategory(cat.id, data);
    else LumiereStore.addCategory(data);
    closeModal(); renderCategories(); renderDashboard();
    toast('Category saved');
  };
}

window.editCollection = function(id) {
  const col = LumiereStore.get().collections.find(c => c.id === id);
  showModal('Edit Collection', `
    <form id="colForm" class="admin-form">
      <div class="form-group"><label>Label</label><input name="label" value="${col.label}"></div>
      <div class="form-group"><label>Title (use \\n for line break)</label><input name="title" value="${col.title}"></div>
      <div class="form-group"><label>Image URL</label><input name="image" type="url" value="${col.image}"></div>
      <button type="submit" class="btn btn-primary">Save</button>
    </form>
  `);
  document.getElementById('colForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    LumiereStore.updateCollection(id, { label: fd.get('label'), title: fd.get('title'), image: fd.get('image') });
    closeModal(); renderCollections();
    toast('Collection updated');
  };
};

window.editTestimonial = function(id) {
  const t = LumiereStore.get().testimonials.find(x => x.id === id);
  showModal('Edit Testimonial', `
    <form id="testForm" class="admin-form">
      <div class="form-group"><label>Quote</label><textarea name="text" rows="3">${t.text}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Name</label><input name="name" value="${t.name}"></div>
        <div class="form-group"><label>Location</label><input name="location" value="${t.location}"></div>
      </div>
      <label><input type="checkbox" name="featured" ${t.featured ? 'checked' : ''}> Featured (highlighted)</label>
      <br><br>
      <button type="submit" class="btn btn-primary">Save</button>
    </form>
  `);
  document.getElementById('testForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    LumiereStore.updateTestimonial(id, { text: fd.get('text'), name: fd.get('name'), location: fd.get('location'), featured: fd.has('featured') });
    closeModal(); renderTestimonials();
    toast('Testimonial updated');
  };
};

window.deleteUser = function(id) {
  if (confirm('Delete this customer?')) {
    LumiereStore.deleteUser(id);
    renderUsers(); renderDashboard();
    toast('Customer deleted');
  }
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
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      await LumiereStore.reset();
      location.reload();
    }
  });
}

function toast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
