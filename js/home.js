/**
 * Homepage dynamic rendering — premium layout inspired by Floukaa
 */
const HERO_FALLBACK = {
  bg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85',
  a1: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=650&q=80',
  a2: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=650&q=80'
};

const INSTA_FALLBACK = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'
];

function mediaSrc(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/api/media/')) return url;
  return url;
}

function sortedCategories(categories) {
  if (typeof CategoryTree !== 'undefined') {
    return CategoryTree.getTopLevel(categories || []);
  }
  return [...(categories || [])].filter(c => !c.parentId).sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
}

const HERO_FONT_MAP = {
  cairo: "'Cairo', sans-serif",
  cormorant: "'Cormorant Garamond', Georgia, serif",
  jost: "'Jost', sans-serif"
};

const DEFAULT_HERO_TYPO = {
  eyebrow: { font: 'cairo', size: 0.82, weight: 600 },
  brand: { font: 'cormorant', size: 3.25, weight: 600 },
  tagline: { font: 'cairo', size: 1.05, weight: 500 },
  subtitle: { font: 'cairo', size: 0.95, weight: 400 }
};

function applyHeroTypography(settings) {
  const hero = document.querySelector('.hero--premium');
  if (!hero) return;
  const typo = settings?.heroTypography || {};
  Object.keys(DEFAULT_HERO_TYPO).forEach(key => {
    const t = { ...DEFAULT_HERO_TYPO[key], ...(typo[key] || {}) };
    hero.style.setProperty(`--hero-${key}-font`, HERO_FONT_MAP[t.font] || HERO_FONT_MAP.cairo);
    hero.style.setProperty(`--hero-${key}-size`, `${t.size}rem`);
    hero.style.setProperty(`--hero-${key}-weight`, String(t.weight));
  });
}

function escHeroText(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHeroEyebrow(settings) {
  const el = document.getElementById('heroEyebrow');
  if (!el) return;
  const lang = LumiereI18n.getLang();
  const city = lang === 'ar'
    ? (settings.heroEyebrowCityAr || LumiereI18n.t('hero_eyebrow_city'))
    : (settings.heroEyebrowCityEn || LumiereI18n.t('hero_eyebrow_city'));
  const note = lang === 'ar'
    ? (settings.heroEyebrowNoteAr || LumiereI18n.t('hero_eyebrow_note'))
    : (settings.heroEyebrowNoteEn || LumiereI18n.t('hero_eyebrow_note'));
  el.innerHTML = `<span class="hero-eyebrow__chip">
    <span class="hero-eyebrow__city">${escHeroText(city)}</span>
    <span class="hero-eyebrow__dot" aria-hidden="true"></span>
    <span class="hero-eyebrow__ship">${escHeroText(note)}</span>
  </span>`;
}

function renderHero(settings, categories) {
  const s = settings || {};
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroImage = document.getElementById('heroImage');
  const heroAccent1 = document.getElementById('heroAccent1');
  const heroAccent2 = document.getElementById('heroAccent2');
  const heroExploreLink = document.getElementById('heroExploreLink');
  const promoImage = document.getElementById('promoImage');

  const lang = LumiereI18n.getLang();
  const heroTagline = lang === 'ar'
    ? (s.taglineAr || LumiereI18n.t('hero_tagline'))
    : (s.taglineEn || s.tagline || LumiereI18n.t('hero_tagline'));
  const heroSub = lang === 'ar'
    ? (s.subtitleAr || LumiereI18n.t('hero_subtitle'))
    : (s.subtitleEn || s.subtitle || LumiereI18n.t('hero_subtitle'));

  if (heroImage) {
    heroImage.src = s.heroImage || HERO_FALLBACK.bg;
    heroImage.onerror = () => { heroImage.src = HERO_FALLBACK.bg; };
  }
  if (heroAccent1) {
    heroAccent1.src = s.heroAccent1 || HERO_FALLBACK.a1;
    heroAccent1.onerror = () => { heroAccent1.src = HERO_FALLBACK.a1; };
  }
  if (heroAccent2) {
    heroAccent2.src = s.heroAccent2 || HERO_FALLBACK.a2;
    heroAccent2.onerror = () => { heroAccent2.src = HERO_FALLBACK.a2; };
  }
  if (promoImage) {
    promoImage.src = s.promoImage || s.heroAccent2 || HERO_FALLBACK.a2;
    promoImage.onerror = () => { promoImage.src = HERO_FALLBACK.a2; };
  }
  if (heroTitle) {
    heroTitle.innerHTML = `<span class="hero-title__brand">${s.brandName || 'Kwanzou EG'}</span><em class="hero-title__tagline">${heroTagline}</em>`;
  }
  renderHeroEyebrow(s);
  if (heroSubtitle) heroSubtitle.textContent = heroSub;
  if (heroExploreLink) heroExploreLink.href = categories[0]?.slug ? `shop.html?cat=${categories[0].slug}` : 'shop.html';
  applyHeroTypography(s);
}

function renderCategoryTabs(categories) {
  const tabs = document.getElementById('categoryTabs');
  if (!tabs) return;
  const saleTab = { href: 'shop.html?q=sale', ar: 'UP TO 50%', en: 'UP TO 50%' };
  const catItems = sortedCategories(categories || LumiereStore.get().categories || []).map(c => ({
    href: `shop.html?cat=${c.slug}`,
    ar: c.nameAr || c.name,
    en: c.name || c.nameAr
  }));
  const items = [saleTab, ...catItems];

  tabs.innerHTML = items.map(item => {
    const label = LumiereI18n.getLang() === 'ar' ? item.ar : item.en;
    const href = (item.href || 'shop.html').replace(/^\.\//, '');
    return `<a class="home-tab-pill" href="${href}">${label}</a>`;
  }).join('');
}

function renderHomeCategories(categories) {
  const grid = document.getElementById('homeCategoriesGrid');
  if (!grid) return;
  const list = sortedCategories(categories || []).slice(0, 8);
  if (!list.length) {
    grid.innerHTML = '';
    return;
  }
  grid.innerHTML = list.map(c => {
    const name = LumiereI18n.translateCategory(c);
    const img = c.image || HERO_FALLBACK.a1;
    return `<a class="home-cat-card" href="shop.html?cat=${c.slug}">
      <img src="${img}" alt="${name}" loading="lazy" onerror="this.src='${HERO_FALLBACK.a1}'">
      <span>${name}</span>
    </a>`;
  }).join('');
}

function renderProductSections(products) {
  const featuredGrid = document.getElementById('featuredGrid');
  const bestsellersGrid = document.getElementById('bestsellersGrid');
  const newArrivalsGrid = document.getElementById('newArrivalsGrid');

  if (featuredGrid) {
    featuredGrid.innerHTML = products.filter(p => p.featured).slice(0, 8).map(p => ProductUI.cardHTML(p)).join('');
  }
  if (bestsellersGrid) {
    bestsellersGrid.innerHTML = products.filter(p => p.bestseller).slice(0, 8).map(p => ProductUI.cardHTML(p)).join('');
  }
  if (newArrivalsGrid) {
    const newItems = ProductUI.filterByCategory(products, 'new-arrivals');
    const fallbackNew = products.filter(p => p.badge === 'New' || p.badge === 'جديد');
    const latest = [...products].slice(-12).reverse();
    const list = (newItems.length ? newItems : (fallbackNew.length ? fallbackNew : latest)).slice(0, 8);
    newArrivalsGrid.innerHTML = list.map(p => ProductUI.cardHTML(p)).join('');
  }
}

function renderTestimonials(testimonials) {
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  if (!testimonialsGrid) return;
  testimonialsGrid.innerHTML = (testimonials || []).map(t => {
    const text = LumiereI18n.getLang() === 'ar' ? (t.textAr || t.text) : (t.textEn || t.text);
    return `<blockquote class="testimonial-card ${t.featured ? 'testimonial-card--featured' : ''}">
      <div class="testimonial-stars">★★★★★</div><p>"${text}"</p>
      <footer><img src="${t.avatar}" alt="${t.name}" loading="lazy"><div><cite>${t.name}</cite><span>${t.location}</span></div></footer>
    </blockquote>`;
  }).join('');
}

function renderInstagram(settings, gallery) {
  const instagramGrid = document.getElementById('instagramGrid');
  if (!instagramGrid) return;

  const instaUrl = settings?.instaUrl || 'https://instagram.com/kwanzou.eg';
  const instaHandle = settings?.instaHandle || '@kwanzou.eg';
  const followLink = document.querySelector('#instagram .link-arrow');
  const eyebrow = document.querySelector('#instagram .section-eyebrow');
  if (followLink) followLink.href = instaUrl;
  if (eyebrow) eyebrow.textContent = instaHandle;

  const items = (gallery?.length ? gallery : INSTA_FALLBACK.map((image, i) => ({ id: `ig-${i + 1}`, image })))
    .map(item => (typeof item === 'string' ? { image: item } : item))
    .filter(item => item.image);

  instagramGrid.innerHTML = items.map((item, i) => {
    const src = mediaSrc(item.image);
    const href = item.link || instaUrl;
    const fallback = INSTA_FALLBACK[i % INSTA_FALLBACK.length];
    return `<a href="${href}" class="instagram-item" target="_blank" rel="noopener" aria-label="Instagram ${i + 1}">
      <img src="${src}" alt="" loading="lazy" onerror="this.src='${fallback}'">
    </a>`;
  }).join('');
}

function initScrollReveal() {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  if (!('IntersectionObserver' in window)) return;
  document.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }), { threshold: 0.08 }).observe(el);
  });
}

function renderHomepage() {
  try {
    const data = LumiereStore.get();
    if (!data) throw new Error('No store data');

    const { settings, products, testimonials, categories, instagramGallery } = data;
    const sortedCats = sortedCategories(categories || []);
    const allProducts = products || [];

    renderHero(settings, sortedCats);
    renderCategoryTabs(sortedCats);
    renderHomeCategories(sortedCats);
    renderProductSections(allProducts);
    renderTestimonials(testimonials);
    renderInstagram(settings, instagramGallery);

    ProductUI.bindCartButtons(document);
    initScrollReveal();
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
    document.getElementById('newsletterForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const ok = await LumiereStore.addNewsletter(e.target.querySelector('input').value);
      if (ok) {
        showToast(LumiereI18n.t('news_welcome'));
        e.target.reset();
      }
    });
    window.addEventListener('lumiere:langchange', refreshPage);
  } catch (err) {
    console.error('Init error:', err);
  }
});
