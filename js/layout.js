/**
 * Shared layout — Kwanzou EG header & footer
 */
const LumiereLayout = (() => {
  const isAdmin = window.location.pathname.includes('/admin/');
  const base = isAdmin ? '../' : '';

  function logoPath(settings) {
    const logo = settings?.logo || 'assets/logo.png';
    if (logo.startsWith('data:') || logo.startsWith('http://') || logo.startsWith('https://')) return logo;
    return `${base}${logo}`;
  }

  function sortedCategories(categories) {
    return [...categories].sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
  }

  const SUBCATEGORY_HINTS = {
    accessories: [
      { ar: 'إكسسوارات يومية', en: 'Daily Accessories', query: 'daily' },
      { ar: 'قطع ترند', en: 'Trending Pieces', query: 'trend' },
      { ar: 'هدايا بنات', en: 'Gift Picks', query: 'gift' }
    ],
    handbags: [
      { ar: 'شنط كروس', en: 'Crossbody Bags', query: 'crossbody' },
      { ar: 'شنط ميني', en: 'Mini Bags', query: 'mini bag' },
      { ar: 'شنط كبيرة', en: 'Tote Bags', query: 'tote' }
    ],
    perfumes: [
      { ar: 'برفانات يومية', en: 'Daily Perfumes', query: 'daily perfume' },
      { ar: 'روائح مسائية', en: 'Evening Scents', query: 'oud' },
      { ar: 'هدايا عطور', en: 'Perfume Gifts', query: 'gift set' }
    ],
    necklaces: [
      { ar: 'سلاسل ناعمة', en: 'Minimal Chains', query: 'chain' },
      { ar: 'دلايات', en: 'Pendant Necklaces', query: 'pendant' },
      { ar: 'طبقات', en: 'Layered Necklaces', query: 'layer' }
    ],
    earrings: [
      { ar: 'حلق صغير', en: 'Stud Earrings', query: 'stud' },
      { ar: 'حلق طويل', en: 'Drop Earrings', query: 'drop' },
      { ar: 'حلق كاجوال', en: 'Daily Earrings', query: 'earring' }
    ],
    bracelets: [
      { ar: 'أساور ناعمة', en: 'Minimal Bracelets', query: 'bracelet' },
      { ar: 'أساور ستايل', en: 'Statement Bracelets', query: 'cuff' },
      { ar: 'أطقم أساور', en: 'Stack Sets', query: 'stack' }
    ],
    rings: [
      { ar: 'خواتم يومية', en: 'Daily Rings', query: 'ring' },
      { ar: 'خواتم ترند', en: 'Statement Rings', query: 'statement ring' },
      { ar: 'خواتم ستاك', en: 'Stackable Rings', query: 'stack' }
    ],
    watches: [
      { ar: 'ساعات كلاسيك', en: 'Classic Watches', query: 'classic' },
      { ar: 'ساعات ستايل', en: 'Fashion Watches', query: 'watch' },
      { ar: 'هدايا ساعات', en: 'Watch Gifts', query: 'gift watch' }
    ],
    sunglasses: [
      { ar: 'نظارات كلاسيك', en: 'Classic Glasses', query: 'classic' },
      { ar: 'نظارات كاجوال', en: 'Daily Glasses', query: 'glasses' },
      { ar: 'نظارات صيفي', en: 'Summer Styles', query: 'summer' }
    ],
    scarves: [
      { ar: 'طرح قطن', en: 'Cotton Scarves', query: 'cotton' },
      { ar: 'طرح شيفون', en: 'Chiffon Scarves', query: 'chiffon' },
      { ar: 'ألوان محايدة', en: 'Neutral Tones', query: 'neutral' }
    ],
    'new-arrivals': [
      { ar: 'وصل جديد', en: 'Just Dropped', query: 'new' },
      { ar: 'الأكثر رواجًا', en: 'Trending Now', query: 'trend' },
      { ar: 'مختارات الأسبوع', en: 'Weekly Picks', query: 'featured' }
    ]
  };

  function subcategoryLabel(subcat) {
    if (typeof subcat === 'string') return subcat;
    return LumiereI18n.getLang() === 'ar'
      ? (subcat.ar || subcat.nameAr || subcat.en || subcat.name || '')
      : (subcat.en || subcat.name || subcat.ar || subcat.nameAr || '');
  }

  function buildSubcategories(category, products) {
    const explicit = Array.isArray(category.subcategories) ? category.subcategories : [];
    const explicitItems = explicit.map(item => {
      if (typeof item === 'string') return { ar: item, en: item, query: item };
      return {
        ar: item.ar || item.nameAr || item.name || item.en,
        en: item.en || item.name || item.ar || item.nameAr,
        query: item.query || item.slug || item.en || item.name || item.ar || item.nameAr
      };
    });

    if (explicitItems.length) return explicitItems;

    const hints = SUBCATEGORY_HINTS[category.slug] || [
      { ar: 'الأكثر طلبًا', en: 'Most Popular', query: 'popular' },
      { ar: 'وصل جديد', en: 'New In', query: 'new' },
      { ar: 'مختارات مميزة', en: 'Featured Picks', query: 'featured' }
    ];

    const fromProducts = (products || [])
      .filter(p => p.categorySlug === category.slug)
      .slice(0, 3)
      .map(p => ({
        ar: p.nameAr || p.name,
        en: p.name || p.nameAr,
        query: p.name || p.nameAr
      }));

    const merged = [...hints, ...fromProducts];
    const seen = new Set();
    return merged.filter(item => {
      const key = (item.query || item.en || item.ar || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  }

  function renderMegaSubmenu(category, products, base) {
    const label = LumiereI18n.translateCategory(category);
    const subs = buildSubcategories(category, products);
    const items = subs.map(sub => {
      const subLabel = subcategoryLabel(sub);
      const query = sub.query || subLabel;
      return `<li><a href="${base}shop.html?cat=${category.slug}&q=${encodeURIComponent(query)}">${subLabel}</a></li>`;
    }).join('');

    return `
      <div class="nav-mega" role="menu" aria-label="${label}">
        <div class="nav-mega__inner">
          <h4 class="nav-mega__title">${label}</h4>
          <ul class="nav-mega__list">
            ${items}
          </ul>
        </div>
      </div>`;
  }

  function renderCategoryDropdown(categories, base) {
    const listItems = categories.map(cat => {
      const label = LumiereI18n.translateCategory(cat);
      return `<li><a href="${base}shop.html?cat=${cat.slug}" role="menuitem">${label}</a></li>`;
    }).join('');
    return `
      <ul class="categories-dropdown__list" role="menu">
        <li><a href="${base}shop.html" class="categories-dropdown__all" role="menuitem">${LumiereI18n.t('nav_shop_all')}</a></li>
        ${listItems}
      </ul>`;
  }

  function inferBottomActive(active, categories) {
    const path = window.location.pathname.toLowerCase();
    const file = path.split('/').pop() || 'index.html';
    const inShopCategory = categories.some(c => c.slug === active);

    if (file === 'account.html') {
      return window.location.hash === '#wishlist' ? 'wishlist' : 'account';
    }
    if (file === 'shop.html' || file === 'product.html' || file === 'cart.html' || active === 'shop' || active === 'product' || inShopCategory) {
      return 'shop';
    }
    if ((file === 'index.html' || file === '') && window.location.hash === '#homeTabs') {
      return 'categories';
    }
    return 'home';
  }

  function renderHeader(active = '') {
    const session = LumiereAuth.getSession();
    const data = LumiereStore.get();
    const settings = data.settings;
    const categories = sortedCategories(data.categories);
    const products = data.products || [];
    const accountLink = session
      ? (session.role === 'superadmin' ? `${base}admin/index.html` : `${base}account.html`)
      : `${base}login.html`;
    const accountLabel = session ? session.name.split(' ')[0] : LumiereI18n.t('nav_signin');
    const announcement = LumiereI18n.localizedSettings(settings, 'announcement');
    const logo = logoPath(settings);

    const mobileCatLinks = categories.map(cat => {
      const label = LumiereI18n.translateCategory(cat);
      return `<li><a href="${base}shop.html?cat=${cat.slug}">${label}</a></li>`;
    }).join('');

    const categoriesActive = active === 'shop' || categories.some(c => c.slug === active) ? ' active' : '';
    const categoryNavItems = categories.map(cat => {
      const label = LumiereI18n.translateCategory(cat);
      const activeClass = active === cat.slug ? ' active' : '';
      return `
        <div class="nav-item nav-item--mega">
          <a href="${base}shop.html?cat=${cat.slug}" class="header-cat${activeClass}">${label}</a>
          ${renderMegaSubmenu(cat, products, base)}
        </div>`;
    }).join('');

    return `
    <div class="announcement-bar"><p>${announcement}</p></div>
    <header class="site-header" id="header">
      <div class="header-main container">
        <button class="nav-toggle" aria-label="Menu" id="navToggle"><span></span><span></span><span></span></button>
        <a href="${base}index.html" class="logo-link">
          <img src="${logo}" alt="${settings.brandName}" class="logo-img" width="160" height="72">
        </a>
        <form class="header-search" id="headerSearch" action="${base}shop.html" method="get">
          <input type="search" name="q" placeholder="${LumiereI18n.t('search_placeholder')}" aria-label="Search">
          <button type="submit" aria-label="Search">🔍</button>
        </form>
        <div class="header-actions">
          ${LumiereI18n.langSwitcherHTML(base)}
          <a href="${accountLink}" class="header-action" title="${LumiereI18n.t('nav_account')}">
            <span class="header-action__icon">👤</span>
            <span class="header-action__label">${accountLabel}</span>
          </a>
          ${session?.role === 'superadmin' ? `<a href="${base}admin/index.html" class="header-action header-action--admin">${LumiereI18n.t('nav_admin')}</a>` : ''}
          <a href="${base}cart.html" class="header-action cart-link" title="${LumiereI18n.t('nav_bag')}">
            <span class="header-action__icon">🛍</span>
            <span class="cart-count">0</span>
          </a>
        </div>
      </div>
      <nav class="header-nav container" id="headerNav" aria-label="Main">
        <a href="${base}index.html" class="header-cat${active === 'home' ? ' active' : ''}">${LumiereI18n.t('nav_home')}</a>
        ${categoryNavItems}
        <div class="nav-dropdown" id="categoriesDropdown">
          <button type="button" class="header-cat nav-dropdown__trigger${categoriesActive}" aria-expanded="false" aria-haspopup="true" aria-controls="categoriesPanel">
            ${LumiereI18n.t('nav_categories')}
            <svg class="nav-dropdown__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="nav-dropdown__panel" id="categoriesPanel">
            <div class="categories-dropdown">
              ${renderCategoryDropdown(categories, base)}
            </div>
          </div>
        </div>
      </nav>
      <div class="mobile-menu" id="mobileMenu">
        <form class="header-search mobile-search" action="${base}shop.html" method="get">
          <input type="search" name="q" placeholder="${LumiereI18n.t('search_placeholder')}">
          <button type="submit">🔍</button>
        </form>
        <ul>
          <li><a href="${base}index.html">${LumiereI18n.t('nav_home')}</a></li>
          <li class="mobile-categories">
            <button type="button" class="mobile-categories__toggle" id="mobileCategoriesToggle" aria-expanded="false">
              ${LumiereI18n.t('nav_categories')}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <ul class="mobile-categories__list" id="mobileCategoriesList">
              <li><a href="${base}shop.html">${LumiereI18n.t('nav_shop_all')}</a></li>
              ${mobileCatLinks}
            </ul>
          </li>
          <li><a href="${accountLink}">${session ? LumiereI18n.t('nav_account') : LumiereI18n.t('nav_signin')}</a></li>
          <li><a href="${base}cart.html">${LumiereI18n.t('nav_bag')}</a></li>
          <li><button type="button" class="lang-switch mobile-lang">${LumiereI18n.t('lang_switch')}</button></li>
        </ul>
      </div>
    </header>`;
  }

  function renderMobileBottomNav(active = '') {
    const session = LumiereAuth.getSession();
    const categories = sortedCategories(LumiereStore.get().categories);
    const bottomActive = inferBottomActive(active, categories);
    const bottomAccountHref = session ? `${base}account.html` : `${base}login.html`;
    const bottomWishlistHref = session ? `${base}account.html#wishlist` : `${base}login.html`;

    return `
    <nav class="mobile-bottom-nav" id="mobileBottomNav" aria-label="Mobile bottom navigation">
      <a href="${base}index.html" class="mobile-bottom-nav__item${bottomActive === 'home' ? ' active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/></svg>
        <span>${LumiereI18n.t('mobile_nav_home')}</span>
      </a>
      <a href="${base}index.html#homeTabs" class="mobile-bottom-nav__item${bottomActive === 'categories' ? ' active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        <span>${LumiereI18n.t('mobile_nav_categories')}</span>
      </a>
      <a href="${bottomAccountHref}" class="mobile-bottom-nav__item${bottomActive === 'account' ? ' active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-3.5 4.3-5 8-5s6.5 1.5 8 5"/></svg>
        <span>${LumiereI18n.t('mobile_nav_account')}</span>
      </a>
      <a href="${bottomWishlistHref}" class="mobile-bottom-nav__item${bottomActive === 'wishlist' ? ' active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 5.6a5.3 5.3 0 0 0-7.5 0L12 6.8l-1.3-1.2a5.3 5.3 0 1 0-7.5 7.5L12 21l8.8-7.9a5.3 5.3 0 0 0 0-7.5z"/></svg>
        <span>${LumiereI18n.t('mobile_nav_wishlist')}</span>
      </a>
      <a href="${base}shop.html" class="mobile-bottom-nav__item${bottomActive === 'shop' ? ' active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h15l-1.4 7.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L5.5 4H3"/><circle cx="10" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>
        <span>${LumiereI18n.t('mobile_nav_shop')}</span>
      </a>
    </nav>`;
  }

  function mountMobileBottomNav(active = '') {
    document.getElementById('mobileBottomNav')?.remove();
    if (isAdmin) return;
    document.body.insertAdjacentHTML('beforeend', renderMobileBottomNav(active));
  }

  function renderFooter() {
    const s = LumiereStore.get().settings;
    const categories = sortedCategories(LumiereStore.get().categories);
    const logo = logoPath(s);
    const year = new Date().getFullYear();
    const shopLinks = categories.map(c =>
      `<li><a href="${base}shop.html?cat=${c.slug}">${LumiereI18n.translateCategory(c)}</a></li>`
    ).join('');
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="${base}index.html"><img src="${logo}" alt="${s.brandName}" class="footer-logo" width="140" height="64"></a>
            <p>${LumiereI18n.t('footer_desc')}</p>
          </div>
          <div class="footer-links"><h4>${LumiereI18n.t('footer_shop')}</h4><ul>
            <li><a href="${base}shop.html">${LumiereI18n.t('shop_all')}</a></li>
            ${shopLinks}
          </ul></div>
          <div class="footer-links"><h4>${LumiereI18n.t('footer_account')}</h4><ul>
            <li><a href="${base}login.html">${LumiereI18n.t('footer_signin')}</a></li>
            <li><a href="${base}register.html">${LumiereI18n.t('footer_register')}</a></li>
            <li><a href="${base}account.html">${LumiereI18n.t('footer_orders')}</a></li>
          </ul></div>
          <div class="footer-contact"><h4>${LumiereI18n.t('footer_contact')}</h4><ul>
            <li>hello@kwanzou-eg.com</li>
            <li>+20 100 000 0000</li>
            <li>Cairo · Alexandria · Giza</li>
          </ul></div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${year} ${s.brandName}. ${LumiereI18n.t('footer_rights')}</p>
        </div>
      </div>
    </footer>`;
  }

  function init(active = '') {
    try {
      LumiereTheme.apply(LumiereStore.get().settings);
    } catch (_) {}
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    try {
      if (headerEl) headerEl.innerHTML = renderHeader(active);
    } catch (err) {
      console.error('Header render error:', err);
    }
    try {
      mountMobileBottomNav(active);
    } catch (err) {
      console.error('Mobile nav render error:', err);
    }
    try {
      if (footerEl) footerEl.innerHTML = renderFooter();
    } catch (err) {
      console.error('Footer render error:', err);
    }
    document.body.classList.toggle('mobile-nav-enabled', !isAdmin);
    KwanzouCart.updateUI();
    LumiereI18n.bindLangSwitch(headerEl || document);
    LumiereI18n.bindLangSwitch(document.getElementById('mobileMenu') || document);
    initMobileMenu();
    initCategoriesDropdown();
    initHeaderScroll();
  }

  let _outsideClickHandler = null;

  function initCategoriesDropdown() {
    const dropdown = document.getElementById('categoriesDropdown');
    const trigger = dropdown?.querySelector('.nav-dropdown__trigger');
    if (!dropdown || !trigger) return;

    let closeTimer;
    const open = () => {
      clearTimeout(closeTimer);
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      closeTimer = setTimeout(() => {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 150);
    };

    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', close);
    dropdown.addEventListener('focusin', open);
    dropdown.addEventListener('focusout', e => {
      if (!dropdown.contains(e.relatedTarget)) close();
    });
    const closeNow = () => {
      clearTimeout(closeTimer);
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        closeNow();
        trigger.focus();
      }
    });

    if (_outsideClickHandler) document.removeEventListener('click', _outsideClickHandler);
    _outsideClickHandler = (e) => {
      if (!dropdown.contains(e.target)) closeNow();
    };
    document.addEventListener('click', _outsideClickHandler);

    const mobileToggle = document.getElementById('mobileCategoriesToggle');
    const mobileList = document.getElementById('mobileCategoriesList');
    mobileToggle?.addEventListener('click', () => {
      const openMobile = mobileList?.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', openMobile ? 'true' : 'false');
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    toggle?.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu?.classList.toggle('active');
      document.body.style.overflow = menu?.classList.contains('active') ? 'hidden' : '';
    });
    menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle?.classList.remove('active');
      menu?.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  function initHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
      header?.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  return { init, renderHeader, renderFooter };
})();
