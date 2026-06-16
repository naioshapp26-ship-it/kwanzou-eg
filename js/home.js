/**
 * Homepage — Flouka-style catalog layout
 */
function sortedCategories(categories) {
  return [...categories].sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
}

function renderHomepage() {
  try {
    const data = LumiereStore.get();
    if (!data) throw new Error('No store data');

    const { products, categories } = data;
    const allProducts = products || [];

    const catalogProducts = document.getElementById('catalogProducts');
    const categoryCloud = document.getElementById('categoryCloud');

    if (catalogProducts) {
      catalogProducts.innerHTML = allProducts.map(p => ProductUI.cardHTML(p)).join('');
    }
    if (categoryCloud) {
      categoryCloud.innerHTML = sortedCategories(categories).map(cat => {
        const label = LumiereI18n.translateCategory(cat);
        return `<h3 class="category-cloud__item"><a href="shop.html?cat=${cat.slug}">${label}</a></h3>`;
      }).join('');
    }

    ProductUI.bindCartButtons(document);
    LumiereI18n.applyTranslations();
  } catch (err) {
    console.error('Homepage render error:', err);
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMessage').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function refreshPage() {
  try { LumiereLayout.init('home'); } catch (err) { console.error('Layout error:', err); }
  try {
    LumiereI18n.applyTranslations();
    renderHomepage();
  } catch (err) {
    console.error('Homepage render error:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    LumiereI18n.init();
    await LumiereStore.init();
    refreshPage();
    window.addEventListener('lumiere:langchange', refreshPage);
  } catch (err) {
    console.error('Init error:', err);
  }
});
