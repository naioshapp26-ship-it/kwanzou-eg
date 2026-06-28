/**
 * Kwanzou EG — Shared cart
 */
const KwanzouCart = (() => {
  const KEY = 'kwanzou_cart';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateUI();
  }

  function count() {
    return get().reduce((s, i) => s + i.qty, 0);
  }

  function add(productId, qty = 1) {
    const items = get();
    const existing = items.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else items.push({ id: productId, qty });
    save(items);
  }

  function remove(productId) {
    save(get().filter(i => i.id !== productId));
  }

  function updateUI() {
    const c = count();
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = c; });
  }

  function formatPrice(price) {
    const s = LumiereStore.get().settings;
    const sym = s.currencySymbol || 'ج.م';
    return `${price.toLocaleString()} ${sym}`;
  }

  return { get, add, remove, count, updateUI, formatPrice };
})();

/**
 * Shared product UI helpers
 */
const ProductUI = {
  url(id) { return `product.html?id=${id}`; },
  shopUrl(slug) { return slug ? `shop.html?cat=${slug}` : 'shop.html'; },

  formatPrice(price) {
    return KwanzouCart.formatPrice(price);
  },

  sku(p) {
    return p.sku || String(p.id).replace(/^p/i, 'P').toUpperCase();
  },

  salePrice(p) {
    if (p.salePrice && p.salePrice < p.price) return p.salePrice;
    if (p.discount && p.discount > 0) return Math.round(p.price * (1 - p.discount / 100));
    return null;
  },

  badgesHTML(p) {
    const badges = [];
    if (p.featured || p.badge === 'Best Seller' || p.badge === 'الأكتر مبيعاً') {
      badges.push(`<span class="wc-badge wc-badge--featured">${LumiereI18n.t('badge_featured')}</span>`);
    }
    if (p.badge === 'New' || p.badge === 'جديد') {
      badges.push(`<span class="wc-badge wc-badge--new">${LumiereI18n.t('badge_new')}</span>`);
    }
    const sale = this.salePrice(p);
    if (p.onSale || sale) {
      badges.push(`<span class="wc-badge wc-badge--sale">${LumiereI18n.t('badge_sale')}</span>`);
    }
    if (p.limited || p.badge === 'Limited' || p.badge === 'كمية محدودة' || (p.stock != null && p.stock <= 10)) {
      badges.push(`<span class="wc-badge wc-badge--limited">${LumiereI18n.t('badge_limited')}</span>`);
    }
    const pct = p.discount || (sale ? Math.round((1 - sale / p.price) * 100) : 0);
    if (pct >= 5) badges.push(`<span class="wc-badge wc-badge--discount">-${pct}%</span>`);
    return badges.length ? `<div class="wc-product__badges">${badges.join('')}</div>` : '';
  },

  priceHTML(p) {
    const sale = this.salePrice(p);
    if (sale && sale < p.price) {
      return `<del>${this.formatPrice(p.price)}</del>${this.formatPrice(sale)}`;
    }
    return this.formatPrice(p.price);
  },

  cardHTML(p) {
    const name = LumiereI18n.localized(p, 'name') || p.name;
    const url = this.url(p.id);
    const sku = this.sku(p);
    const stars = '★'.repeat(p.rating || 0) + '☆'.repeat(5 - (p.rating || 0));

    return `
    <li class="wc-product">
      <a href="${url}" class="wc-product__image-wrap">
        <img src="${p.image}" alt="${name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'">
        ${this.badgesHTML(p)}
      </a>
      <div class="wc-product__body">
        <h2 class="wc-product__title"><a href="${url}">${name}</a></h2>
        <span class="wc-product__sku">${LumiereI18n.t('sku_label')}: ${sku}</span>
        <div class="wc-product__footer">
          <span class="wc-product__price">${this.priceHTML(p)}</span>
          <button type="button" class="wc-product__cart btn-add-cart" data-id="${p.id}">${LumiereI18n.t('add_cart')}</button>
        </div>
      </div>
    </li>`;
  },

  filterByCategory(products, slug) {
    if (!slug || slug === 'all') return products;
    if (slug === 'new-arrivals') return products.filter(p => p.badge === 'New' || p.badge === 'جديد');
    const categories = typeof LumiereStore !== 'undefined' ? (LumiereStore.get().categories || []) : [];
    const allowed = typeof CategoryTree !== 'undefined'
      ? CategoryTree.getFilterSlugs(categories, slug)
      : new Set([slug]);
    return products.filter(p => {
      if (allowed.has(p.categorySlug)) return true;
      if (!categories.some(c => c.slug === slug) && p.categorySlug?.startsWith(`${slug}-`)) return true;
      return false;
    });
  },

  bindCartButtons(root = document) {
    root.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        KwanzouCart.add(btn.dataset.id);
        const p = LumiereStore.get().products.find(x => x.id === btn.dataset.id);
        const name = LumiereI18n.localized(p, 'name') || p?.name;
        if (typeof showToast === 'function') showToast(`${name} — ${LumiereI18n.t('added_bag')}`);
      };
    });
  }
};
