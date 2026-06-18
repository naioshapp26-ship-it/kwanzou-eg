/**
 * Shared layout — Kwanzou EG header & footer
 */
const LumiereLayout = (() => {
  const isAdmin = window.location.pathname.includes('/admin/');
  const base = isAdmin ? '../' : '';

  const SOCIAL_LINKS = {
    instagram: 'https://www.instagram.com/kwanzou.eg?igsh=MTJ3MW5pMmhoYnl6MQ%3D%3D&utm_source=qr',
    tiktok: 'https://www.tiktok.com/@kwanzou11?_r=1&_t=ZS-97GmAtM3DrM',
    facebook: 'https://www.facebook.com/share/14kxCwPToLH/?mibextid=wwXIfr'
  };
  const FOOTER_PHONE = '01284371361';
  const FOOTER_PHONE_HREF = 'tel:+201284371361';

  function logoPath(settings) {
    const logo = settings?.logo || 'assets/logo.svg';
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
      { ar: 'حلقان مجموعة', en: 'Earrings Set', query: 'set' },
      { ar: 'حلقان زيركون', en: 'Zircon Earrings', query: 'zircon' },
      { ar: 'حلقان صيفي', en: 'Summer Earrings', query: 'summer' },
      { ar: 'حلقان كوري', en: 'Korean Earrings', query: 'korean' },
      { ar: 'حلقان سواريه', en: 'Evening Earrings', query: 'evening' }
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

  function shopHref(cat = '', query = '', href = '') {
    if (href) return href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')
      ? href
      : `${base}${href.replace(/^\//, '')}`;
    const params = new URLSearchParams();
    if (cat) params.set('cat', cat);
    if (query) params.set('q', query);
    const qs = params.toString();
    return `${base}shop.html${qs ? `?${qs}` : ''}`;
  }

  function menuText(item) {
    if (item.i18n) return LumiereI18n.t(item.i18n);
    return LumiereI18n.getLang() === 'ar' ? item.ar : item.en;
  }

  function resolveMobileSubs(item, products, categories) {
    if (item.subs) return item.subs;
    if (!item.slug) return [];
    const category = categories.find(c => c.slug === item.slug) || { slug: item.slug };
    return buildSubcategories(category, products).map(sub => ({
      ar: sub.ar,
      en: sub.en,
      cat: item.cat || item.slug,
      query: sub.query
    }));
  }

  function renderMobileSubLink(sub) {
    const label = menuText(sub);
    const href = shopHref(sub.cat || sub.slug || '', sub.query || '', sub.href || '');
    return `<a class="mobile-menu__sub-link" href="${href}">${label}</a>`;
  }

  function getStoreNavTabs() {
    const cats = sortedCategories(LumiereStore.get().categories || []);
    return [
      { href: shopHref('', 'sale'), ar: 'UP TO 50%', en: 'UP TO 50%', key: 'sale' },
      ...cats.map(c => ({
        href: shopHref(c.slug),
        ar: c.nameAr || c.name,
        en: c.name || c.nameAr,
        key: c.slug
      }))
    ];
  }

  function getDesktopHeaderNavItems() {
    return [
      { href: `${base}index.html`, i18n: 'nav_home', key: 'home' },
      ...getStoreNavTabs()
    ];
  }

  function isDesktopNavActive(item, active, categories) {
    if (item.key === 'home') return active === 'home';
    if (item.key === 'sale') return false;
    return active === item.key || categories.some(c => c.slug === item.key && active === c.slug);
  }

  function renderDesktopHeaderNav(active = '', categories = []) {
    return getDesktopHeaderNavItems().map(item => {
      const activeClass = isDesktopNavActive(item, active, categories) ? ' active' : '';
      return `<a href="${item.href}" class="header-cat${activeClass}">${menuText(item)}</a>`;
    }).join('');
  }

  function renderMobileSideMenu(products, categories) {
    const catalog = [
      { type: 'link', href: `${base}index.html`, i18n: 'nav_home' },
      { type: 'link', href: shopHref('', 'sale'), ar: 'UP TO 50%', en: 'UP TO 50%' },
      { type: 'expandable', slug: 'necklaces', ar: 'سلاسل', en: 'Necklaces' },
      { type: 'expandable', slug: 'bracelets', ar: 'أساور', en: 'Bracelets' },
      {
        type: 'expandable',
        cat: 'accessories',
        ar: 'حلقان',
        en: 'Earrings',
        subs: SUBCATEGORY_HINTS.earrings
      },
      { type: 'link', cat: 'accessories', query: 'anklet', ar: 'خلخال', en: 'Anklet' },
      { type: 'expandable', slug: 'rings', ar: 'خواتم', en: 'Rings' },
      { type: 'link', cat: 'accessories', query: 'piercing', ar: 'بيرسينج', en: 'Piercing' },
      { type: 'link', cat: 'accessories', query: 'gift', ar: 'هدايا', en: 'Gifts' },
      { type: 'link', cat: 'accessories', query: 'kids', ar: 'أطفال', en: 'Children' },
      {
        type: 'expandable',
        ar: 'منتجات أخرى',
        en: 'Other Products',
        subs: [
          { ar: 'برفانات', en: 'Perfumes', cat: 'perfumes' },
          { ar: 'شنط', en: 'Bags', cat: 'handbags' }
        ]
      },
      {
        type: 'expandable',
        i18n: 'footer_about_title',
        subs: [
          { i18n: 'footer_customer_service', href: 'account.html' },
          { i18n: 'bs_title', href: 'shop.html?sort=bestseller' },
          { i18n: 'footer_contact_us', href: FOOTER_PHONE_HREF }
        ]
      }
    ];

    return catalog.map(item => {
      if (item.type === 'link') {
        const href = item.href || shopHref(item.cat || '', item.query || '');
        return `<a class="mobile-menu__row mobile-menu__row--link" href="${href}">${menuText(item)}</a>`;
      }

      const subs = resolveMobileSubs(item, products, categories);
      const subHtml = subs.map(renderMobileSubLink).join('');
      return `
        <div class="mobile-menu__group">
          <button type="button" class="mobile-menu__row mobile-menu__row--toggle" aria-expanded="false">
            <span class="mobile-menu__label">${menuText(item)}</span>
            <span class="mobile-menu__icon" aria-hidden="true">+</span>
          </button>
          <div class="mobile-menu__subpanel">${subHtml}</div>
        </div>`;
    }).join('');
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

    const mobileSideMenu = renderMobileSideMenu(products, categories);
    const desktopHeaderNav = renderDesktopHeaderNav(active, categories);

    return `
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
        ${desktopHeaderNav}
      </nav>
      <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu__announcement">${announcement}</div>
        <form class="header-search mobile-search" action="${base}shop.html" method="get">
          <input type="search" name="q" placeholder="${LumiereI18n.t('search_placeholder')}">
          <button type="submit">🔍</button>
        </form>
        <nav class="mobile-menu__catalog" aria-label="${LumiereI18n.t('nav_categories')}">
          ${mobileSideMenu}
        </nav>
        <ul class="mobile-menu__links mobile-menu__links--compact">
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
    const logo = logoPath(s);
    const year = new Date().getFullYear();
    const brand = s.brandName || 'Kwanzou EG';

    return `
    <footer class="footer footer--info">
      <div class="container">
        <div class="footer-info__top">
          <a href="${base}index.html" class="footer-info__logo">
            <img src="${logo}" alt="${brand}" class="footer-logo" width="120" height="54">
          </a>
          <p class="footer-info__location">${LumiereI18n.t('footer_location')}</p>
          <a class="footer-info__phone" href="${FOOTER_PHONE_HREF}">${FOOTER_PHONE}</a>
          <a class="footer-info__email" href="mailto:hello@kwanzou-eg.com">hello@kwanzou-eg.com</a>
          <a class="footer-info__web" href="${base}index.html">www.kwanzou-eg.com</a>
          <div class="footer-info__social">
            <a href="${SOCIAL_LINKS.tiktok}" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
            </a>
            <a href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="${SOCIAL_LINKS.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z"/></svg>
            </a>
          </div>
        </div>

        <div class="footer-info__accordions">
          <details class="footer-info__accordion">
            <summary>${LumiereI18n.t('footer_links_title')}</summary>
            <ul>
              <li><a href="${base}privacy.html">${LumiereI18n.t('footer_privacy_policy')}</a></li>
              <li><a href="${base}terms.html">${LumiereI18n.t('footer_terms_policy')}</a></li>
              <li><a href="${base}returns.html">${LumiereI18n.t('footer_returns_policy')}</a></li>
            </ul>
          </details>
          <details class="footer-info__accordion">
            <summary>${LumiereI18n.t('footer_about_title')}</summary>
            <ul>
              <li><a href="${base}account.html">${LumiereI18n.t('footer_customer_service')}</a></li>
              <li><a href="${base}shop.html?sort=bestseller">${LumiereI18n.t('bs_title')}</a></li>
              <li><a href="${FOOTER_PHONE_HREF}">${LumiereI18n.t('footer_contact_us')}</a></li>
            </ul>
          </details>
          <details class="footer-info__accordion">
            <summary>${LumiereI18n.t('footer_news_title')}</summary>
            <ul>
              <li><a href="${base}shop.html?cat=new-arrivals">${LumiereI18n.t('na_title')}</a></li>
              <li><a href="${base}index.html#featured">${LumiereI18n.t('featured_title')}</a></li>
              <li><a href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener noreferrer">${LumiereI18n.t('insta_follow')}</a></li>
            </ul>
          </details>
        </div>

        <div class="footer-info__bottom">
          <p>&copy; ${year} ${brand}. ${LumiereI18n.t('footer_rights')}</p>
        </div>
      </div>
    </footer>`;
  }

  function getHomeCategoryTabs() {
    return getStoreNavTabs();
  }

  function stripTopAnnouncementBar() {
    document.querySelectorAll('.announcement-bar').forEach(el => {
      if (!el.closest('.mobile-menu')) el.remove();
    });
  }

  function init(active = '') {
    try {
      LumiereTheme.apply(LumiereStore.get().settings);
    } catch (_) {}
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    try {
      if (headerEl) headerEl.innerHTML = renderHeader(active);
      stripTopAnnouncementBar();
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
    initMobileMenuAccordions();
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

  function initMobileMenuAccordions() {
    const menu = document.getElementById('mobileMenu');
    menu?.querySelectorAll('.mobile-menu__row--toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.mobile-menu__group');
        if (!group) return;
        const isOpen = group.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const icon = btn.querySelector('.mobile-menu__icon');
        if (icon) icon.textContent = isOpen ? '−' : '+';
      });
    });
  }

  function initHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
      header?.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  return { init, renderHeader, renderFooter, getHomeCategoryTabs };
})();
