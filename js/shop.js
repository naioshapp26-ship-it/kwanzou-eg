/**
 * Shop / Category listing page
 */
document.addEventListener('DOMContentLoaded', () => {
  LumiereI18n.init();
  renderShop();
  window.addEventListener('lumiere:langchange', renderShop);
});

function renderShop() {
  const params = new URLSearchParams(location.search);
  const catSlug = params.get('cat') || '';
  const query = (params.get('q') || '').toLowerCase();
  const data = LumiereStore.get();

  LumiereLayout.init(catSlug || 'shop');

  let products = [...data.products];
  if (catSlug) products = ProductUI.filterByCategory(products, catSlug);
  if (query) products = products.filter(p => {
    const name = (LumiereI18n.localized(p, 'name') || p.name).toLowerCase();
    return name.includes(query) || p.category?.toLowerCase().includes(query);
  });

  const cat = data.categories.find(c => c.slug === catSlug);
  const title = cat ? LumiereI18n.translateCategory(cat) : (query ? `"${params.get('q')}"` : LumiereI18n.t('shop_all'));
  document.getElementById('shopTitle').textContent = title;
  document.getElementById('shopCount').textContent = `${products.length} ${LumiereI18n.t('products_count')}`;

  document.getElementById('breadcrumb').innerHTML = `
    <a href="index.html">${LumiereI18n.t('nav_home')}</a>
    <span>/</span>
    <a href="shop.html">${LumiereI18n.t('shop_all')}</a>
    ${catSlug ? `<span>/</span><span>${title}</span>` : ''}`;

  document.getElementById('shopFilters').innerHTML = [
    { slug: '', label: LumiereI18n.t('shop_all') },
    ...data.categories.slice(0, 7).map(c => ({ slug: c.slug, label: LumiereI18n.translateCategory(c) }))
  ].map(f => `<a href="shop.html${f.slug ? '?cat=' + f.slug : ''}" class="filter-chip${f.slug === catSlug ? ' active' : ''}">${f.label}</a>`).join('');

  const sortEl = document.getElementById('shopSort');
  sortEl.onchange = () => renderGrid(sortProducts(products, sortEl.value));
  renderGrid(sortProducts(products, sortEl.value));

  LumiereI18n.applyTranslations();
}

function sortProducts(list, sort) {
  const arr = [...list];
  if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') arr.sort((a, b) => b.rating - a.rating);
  else arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return arr;
}

function renderGrid(products) {
  const grid = document.getElementById('shopGrid');
  const empty = document.getElementById('shopEmpty');
  if (!products.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = products.map(p => ProductUI.cardHTML(p)).join('');
  ProductUI.bindCartButtons(grid);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
