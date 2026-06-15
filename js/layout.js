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

  function renderHeader(active = '') {
    const session = LumiereAuth.getSession();
    const data = LumiereStore.get();
    const settings = data.settings;
    const categories = sortedCategories(data.categories);
    const accountLink = session
      ? (session.role === 'superadmin' ? `${base}admin/index.html` : `${base}account.html`)
      : `${base}login.html`;
    const accountLabel = session ? session.name.split(' ')[0] : LumiereI18n.t('nav_signin');
    const announcement = LumiereI18n.localizedSettings(settings, 'announcement');
    const logo = logoPath(settings);

    const catLinks = categories.map(cat => {
      const label = LumiereI18n.translateCategory(cat);
      const isActive = active === cat.slug ? ' active' : '';
      return `<a href="${base}shop.html?cat=${cat.slug}" class="header-cat${isActive}">${label}</a>`;
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
      <nav class="header-categories container" id="headerCategories">
        <a href="${base}index.html" class="header-cat${active === 'home' ? ' active' : ''}">${LumiereI18n.t('nav_home')}</a>
        <a href="${base}shop.html" class="header-cat${active === 'shop' ? ' active' : ''}">${LumiereI18n.t('shop_all')}</a>
        ${catLinks}
      </nav>
      <div class="mobile-menu" id="mobileMenu">
        <form class="header-search mobile-search" action="${base}shop.html" method="get">
          <input type="search" name="q" placeholder="${LumiereI18n.t('search_placeholder')}">
          <button type="submit">🔍</button>
        </form>
        <ul>
          <li><a href="${base}index.html">${LumiereI18n.t('nav_home')}</a></li>
          <li><a href="${base}shop.html">${LumiereI18n.t('shop_all')}</a></li>
          ${categories.map(c => `<li><a href="${base}shop.html?cat=${c.slug}">${LumiereI18n.translateCategory(c)}</a></li>`).join('')}
          <li><a href="${accountLink}">${session ? LumiereI18n.t('nav_account') : LumiereI18n.t('nav_signin')}</a></li>
          <li><a href="${base}cart.html">${LumiereI18n.t('nav_bag')}</a></li>
          <li><button type="button" class="lang-switch mobile-lang">${LumiereI18n.t('lang_switch')}</button></li>
        </ul>
      </div>
    </header>`;
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
            ${shopLinks}
            <li><a href="${base}shop.html">${LumiereI18n.t('shop_all')}</a></li>
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
      if (footerEl) footerEl.innerHTML = renderFooter();
    } catch (err) {
      console.error('Footer render error:', err);
    }
    KwanzouCart.updateUI();
    LumiereI18n.bindLangSwitch(headerEl || document);
    LumiereI18n.bindLangSwitch(document.getElementById('mobileMenu') || document);
    initMobileMenu();
    initHeaderScroll();
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
