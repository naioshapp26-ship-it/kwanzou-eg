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

  cardHTML(p, compact = false) {
    const name = LumiereI18n.localized(p, 'name') || p.name;
    const stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);
    const badge = p.badge ? `<span class="badge badge--${p.badge.includes('Best') ? 'bestseller' : 'new'}">${LumiereI18n.translateBadge(p.badge)}</span>` : '';
    const url = this.url(p.id);

    return `
    <article class="product-card ${compact ? 'product-card--compact' : ''} reveal">
      <a href="${url}" class="product-card__link">
        <div class="product-card__image">
          <img src="${p.image}" alt="${name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'">
          ${badge ? `<div class="product-card__badges">${badge}</div>` : ''}
        </div>
        <div class="product-card__info">
          ${compact ? '' : `<div class="product-rating"><span class="stars">${stars}</span><span class="rating-count">(${p.reviews})</span></div>`}
          <h3 class="product-name">${name}</h3>
          ${compact ? '' : `<p class="product-category">${LumiereI18n.productCategory(p)}</p>`}
          <p class="product-price">${this.formatPrice(p.price)}</p>
        </div>
      </a>
      <button class="wishlist-btn" data-id="${p.id}" aria-label="Wishlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
      <button class="btn btn-sm btn-add-cart" data-id="${p.id}">${LumiereI18n.t('add_cart')}</button>
    </article>`;
  },

  filterByCategory(products, slug) {
    if (!slug || slug === 'all') return products;
    if (slug === 'new-arrivals') return products.filter(p => p.badge === 'New' || p.badge === 'جديد');
    return products.filter(p => p.categorySlug === slug);
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
