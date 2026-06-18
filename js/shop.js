/**
 * Shop / Category listing page
 */
const LEGACY_CAT_REDIRECT = {
  jewelry: 'necklaces',
  earrings: 'accessories'
};
const REMOVED_CAT_SLUGS = ['watches', 'scarves', 'sunglasses', 'new-arrivals'];

document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  renderShop();
  window.addEventListener('lumiere:langchange', renderShop);
});

function filterTabLabel(item) {
  if (item.i18n) return LumiereI18n.t(item.i18n);
  return LumiereI18n.getLang() === 'ar' ? item.ar : item.en;
}

function isFilterActive(item, catSlug, query) {
  if (item.key === 'sale') return query === 'sale';
  if (item.key === 'earrings') return catSlug === 'accessories';
  if (item.key === 'necklaces') return catSlug === 'necklaces' && !query;
  if (item.key === 'bracelets') return catSlug === 'bracelets' && !query;
  if (item.key === 'rings') return catSlug === 'rings' && !query;
  if (item.key === 'perfumes') return catSlug === 'perfumes' && !query;
  if (item.key === 'handbags') return catSlug === 'handbags' && !query;
  return false;
}

function getShopTitle(catSlug, query, params) {
  if (query === 'sale') return LumiereI18n.getLang() === 'ar' ? 'UP TO 50%' : 'UP TO 50%';
  const tabs = typeof LumiereLayout.getHomeCategoryTabs === 'function'
    ? LumiereLayout.getHomeCategoryTabs()
    : [];
  const tab = tabs.find(t => isFilterActive(t, catSlug, query));
  if (tab) return filterTabLabel(tab);
  if (query) return `"${params.get('q')}"`;
  return LumiereI18n.t('shop_all');
}

function renderShop() {
  const params = new URLSearchParams(location.search);
  let catSlug = params.get('cat') || '';
  const query = (params.get('q') || '').toLowerCase();
  const sortParam = params.get('sort') || '';

  if (LEGACY_CAT_REDIRECT[catSlug]) {
    params.set('cat', LEGACY_CAT_REDIRECT[catSlug]);
    location.replace(`shop.html?${params.toString()}`);
    return;
  }
  if (REMOVED_CAT_SLUGS.includes(catSlug)) {
    location.replace('shop.html');
    return;
  }

  const data = LumiereStore.get();

  LumiereLayout.init(catSlug || (sortParam ? 'shop' : 'shop'));

  let products = [...data.products];
  if (catSlug) products = ProductUI.filterByCategory(products, catSlug);
  else if (sortParam === 'bestseller') products = products.filter(p => p.bestseller);
  if (query) products = products.filter(p => {
    const name = (LumiereI18n.localized(p, 'name') || p.name).toLowerCase();
    return name.includes(query) || p.category?.toLowerCase().includes(query);
  });

  const title = getShopTitle(catSlug, query, params);
  document.getElementById('shopTitle').textContent = title;
  document.getElementById('shopCount').textContent = `${products.length} ${LumiereI18n.t('products_count')}`;

  document.getElementById('breadcrumb').innerHTML = `
    <a href="index.html">${LumiereI18n.t('nav_home')}</a>
    <span>/</span>
    <a href="shop.html">${LumiereI18n.t('shop_all')}</a>
    ${catSlug || query ? `<span>/</span><span>${title}</span>` : ''}`;

  const navTabs = typeof LumiereLayout.getHomeCategoryTabs === 'function'
    ? LumiereLayout.getHomeCategoryTabs()
    : [];
  const filters = [
    { href: 'shop.html', key: 'all', label: LumiereI18n.t('shop_all') },
    ...navTabs.map(tab => ({
      href: (tab.href || 'shop.html').replace(/^\.\//, ''),
      key: tab.key,
      label: filterTabLabel(tab)
    }))
  ];

  document.getElementById('shopFilters').innerHTML = filters.map(f => {
    const active = f.key === 'all'
      ? !catSlug && !query
      : isFilterActive({ key: f.key }, catSlug, query);
    return `<a href="${f.href}" class="filter-chip${active ? ' active' : ''}">${f.label}</a>`;
  }).join('');

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
