/**
 * Homepage dynamic rendering — with safe fallbacks
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

    const { settings, categories, products, testimonials } = data;
    const sortedCats = sortedCategories(categories);

    const tagline = LumiereI18n.localizedSettings(settings, 'tagline') || settings.taglineAr || 'Kwanzou EG — إكسسوارات ودهب على ذوقك';
    const parts = tagline.includes('،') ? tagline.split('، ') : tagline.split(' — ');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroImage = document.getElementById('heroImage');
    const heroAccent1 = document.getElementById('heroAccent1');
    const heroAccent2 = document.getElementById('heroAccent2');

    if (heroImage) heroImage.src = settings.heroImage || HERO_FALLBACK.bg;
    if (heroAccent1) heroAccent1.src = settings.heroAccent1 || HERO_FALLBACK.a1;
    if (heroAccent2) heroAccent2.src = settings.heroAccent2 || HERO_FALLBACK.a2;
    if (heroTitle) {
      const line1 = (parts[0] || 'Kwanzou EG').trim();
      const line2 = (parts[1] || 'إكسسوارات ودهب على ذوقك').trim();
      heroTitle.innerHTML = `<span class="hero-title__brand">${line1}</span><em class="hero-title__tagline">${line2}</em>`;
    }
    if (heroSubtitle) heroSubtitle.textContent = LumiereI18n.localizedSettings(settings, 'subtitle') || settings.subtitleAr || '';

    const catGrid = document.getElementById('categoriesGrid');
    if (catGrid && sortedCats.length) {
      catGrid.className = 'categories-grid categories-grid--4';
      catGrid.innerHTML = sortedCats.map(cat => `
        <a href="shop.html?cat=${cat.slug}" class="category-card">
          <img src="${cat.image}" alt="${LumiereI18n.translateCategory(cat)}" loading="lazy">
          <div class="category-card__content">
            <h3>${LumiereI18n.translateCategory(cat)}</h3>
            <span>${LumiereI18n.t('cat_explore')}</span>
          </div>
        </a>`).join('');
    }

    const featuredGrid = document.getElementById('featuredGrid');
    if (featuredGrid && products) {
      featuredGrid.innerHTML = products.filter(p => p.featured).slice(0, 4).map(p => ProductUI.cardHTML(p)).join('');
    }

    const bestsellersGrid = document.getElementById('bestsellersGrid');
    if (bestsellersGrid && products) {
      bestsellersGrid.innerHTML = products.filter(p => p.bestseller).slice(0, 4).map(p => ProductUI.cardHTML(p, true)).join('');
    }

    const testimonialsGrid = document.getElementById('testimonialsGrid');
    if (testimonialsGrid && testimonials) {
      testimonialsGrid.innerHTML = testimonials.map(t => {
        const text = LumiereI18n.getLang() === 'ar' ? (t.textAr || t.text) : (t.textEn || t.text);
        return `<blockquote class="testimonial-card ${t.featured ? 'testimonial-card--featured' : ''}">
          <div class="testimonial-stars">★★★★★</div><p>"${text}"</p>
          <footer><img src="${t.avatar}" alt="${t.name}"><div><cite>${t.name}</cite><span>${t.location}</span></div></footer>
        </blockquote>`;
      }).join('');
    }

    if (typeof ProductUI !== 'undefined') ProductUI.bindCartButtons(document);
    initScrollReveal();
    LumiereI18n.applyTranslations();
  } catch (err) {
    console.error('Homepage render error:', err);
  }
}

function initScrollReveal() {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
  if (!('IntersectionObserver' in window)) return;
  document.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }), { threshold: 0.08 }).observe(el);
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMessage').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function refreshPage() {
  try {
    LumiereLayout.init('home');
  } catch (err) {
    console.error('Layout error:', err);
  }
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
    document.getElementById('newsletterForm')?.addEventListener('submit', e => {
      e.preventDefault();
      LumiereStore.addNewsletter(e.target.querySelector('input').value);
      showToast(LumiereI18n.t('news_welcome'));
      e.target.reset();
    });
    window.addEventListener('lumiere:langchange', refreshPage);
  } catch (err) {
    console.error('Init error:', err);
  }
});
