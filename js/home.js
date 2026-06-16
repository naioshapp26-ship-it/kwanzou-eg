/**
 * Homepage — Flouka-style catalog layout
 */
const HERO_FALLBACK = {
  bg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85',
  a1: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=650&q=80',
  a2: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=650&q=80'
};

function sortedCategories(categories) {
  return [...categories].sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
}

function renderHomepage() {
  try {
    const data = LumiereStore.get();
    if (!data) throw new Error('No store data');

    const { products, categories, settings } = data;
    const allProducts = products || [];
    const sortedCats = sortedCategories(categories || []);

    const catalogProducts = document.getElementById('catalogProducts');
    const categoryCloud = document.getElementById('categoryCloud');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroImage = document.getElementById('heroImage');
    const heroAccent1 = document.getElementById('heroAccent1');
    const heroAccent2 = document.getElementById('heroAccent2');
    const heroExploreLink = document.getElementById('heroExploreLink');

    const lang = LumiereI18n.getLang();
    const heroTagline = lang === 'ar'
      ? (settings?.taglineAr || LumiereI18n.t('hero_tagline'))
      : (settings?.taglineEn || settings?.tagline || LumiereI18n.t('hero_tagline'));
    const heroSub = lang === 'ar'
      ? (settings?.subtitleAr || LumiereI18n.t('hero_subtitle'))
      : (settings?.subtitleEn || settings?.subtitle || LumiereI18n.t('hero_subtitle'));

    if (heroImage) {
      heroImage.src = settings?.heroImage || HERO_FALLBACK.bg;
      heroImage.onerror = () => { heroImage.src = HERO_FALLBACK.bg; };
    }
    if (heroAccent1) {
      heroAccent1.src = settings?.heroAccent1 || HERO_FALLBACK.a1;
      heroAccent1.onerror = () => { heroAccent1.src = HERO_FALLBACK.a1; };
    }
    if (heroAccent2) {
      heroAccent2.src = settings?.heroAccent2 || HERO_FALLBACK.a2;
      heroAccent2.onerror = () => { heroAccent2.src = HERO_FALLBACK.a2; };
    }
    if (heroTitle) {
      heroTitle.innerHTML = `<span class="hero-title__brand">${settings?.brandName || 'Kwanzou EG'}</span><em class="hero-title__tagline">${heroTagline}</em>`;
    }
    if (heroSubtitle) heroSubtitle.textContent = heroSub;
    if (heroExploreLink) heroExploreLink.href = sortedCats[0]?.slug ? `shop.html?cat=${sortedCats[0].slug}` : 'shop.html';

    if (catalogProducts) {
      catalogProducts.innerHTML = allProducts.map(p => ProductUI.cardHTML(p)).join('');
    }
    if (categoryCloud) {
      categoryCloud.innerHTML = sortedCats.map(cat => {
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
