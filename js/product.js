/**
 * Product detail page — Noon-style
 */
document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  renderProduct();
  window.addEventListener('lumiere:langchange', renderProduct);
});

function renderProduct() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const product = LumiereStore.get().products.find(p => p.id === id);

  LumiereLayout.init('product');

  if (!product) {
    document.getElementById('productDetail').innerHTML = `<div class="product-not-found"><h2>${LumiereI18n.t('product_not_found')}</h2><a href="shop.html" class="btn btn-primary">${LumiereI18n.t('shop_all')}</a></div>`;
    return;
  }

  const name = LumiereI18n.localized(product, 'name') || product.name;
  const category = LumiereI18n.productCategory(product);
  const desc = LumiereI18n.getLang() === 'ar' ? (product.descAr || product.descEn) : (product.descEn || product.descAr);
  const images = product.images || [product.image];
  const stars = '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0));
  const inStock = product.stock > 0;
  const productReviews = (LumiereStore.get().productReviews || []).filter(r => r.productId === product.id);
  const reviewsListHtml = productReviews.length
    ? productReviews.slice(0, 20).map(r => {
        const rStars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
        return `<article class="product-review">
          <div class="product-review__head"><span class="stars">${rStars}</span> <cite>${r.name || '—'}</cite> <time>${r.date || ''}</time></div>
          <p>${String(r.text || '').replace(/</g, '&lt;')}</p>
        </article>`;
      }).join('')
    : `<p>${LumiereI18n.t('reviews_none')}</p>`;
  document.title = `${name} | Kwanzou EG`;

  document.getElementById('breadcrumb').innerHTML = `
    <a href="index.html">${LumiereI18n.t('nav_home')}</a><span>/</span>
    <a href="shop.html?cat=${product.categorySlug || ''}">${category}</a><span>/</span>
    <span>${name}</span>`;

  document.getElementById('productDetail').innerHTML = `
    <div class="pd-gallery">
      <div class="pd-gallery__main"><img id="pdMainImg" src="${images[0]}" alt="${name}"></div>
      <div class="pd-gallery__thumbs">${images.map((img, i) => `<button type="button" class="pd-thumb${i === 0 ? ' active' : ''}" data-src="${img}"><img src="${img}" alt=""></button>`).join('')}</div>
    </div>
    <div class="pd-info">
      ${product.badge ? `<span class="badge badge--new">${LumiereI18n.translateBadge(product.badge)}</span>` : ''}
      <h1 class="pd-title">${name}</h1>
      <div class="pd-rating"><span class="stars">${stars}</span> <span>(${product.reviews} ${LumiereI18n.t('reviews_count')})</span></div>
      <div class="pd-price">${ProductUI.priceHTML(product)}</div>
      <div class="pd-stock ${inStock ? 'in-stock' : 'out-stock'}">${inStock ? '✓ ' + LumiereI18n.t('in_stock') : LumiereI18n.t('out_of_stock')}</div>
      <div class="pd-delivery">
        <div class="pd-delivery__item">🚚 ${LumiereI18n.t('delivery_fast')}</div>
        <div class="pd-delivery__item">💎 ${LumiereI18n.t('delivery_policy_match')}</div>
        <div class="pd-delivery__item">🛡️ ${LumiereI18n.t('delivery_policy_defect')}</div>
        <div class="pd-delivery__item">✓ ${LumiereI18n.t('delivery_authentic')}</div>
      </div>
      ${colorPickerHTML(product)}
      <div class="pd-qty">
        <label>${LumiereI18n.t('quantity')}</label>
        <div class="qty-control">
          <button type="button" id="qtyMinus">−</button>
          <input type="number" id="qtyInput" value="1" min="1" max="${product.stock}">
          <button type="button" id="qtyPlus">+</button>
        </div>
      </div>
      <div class="pd-actions">
        <button class="btn btn-primary btn-full" id="btnBuyNow" ${!inStock ? 'disabled' : ''}>${LumiereI18n.t('buy_now')}</button>
        <button class="btn btn-outline btn-full" id="btnAddCart" ${!inStock ? 'disabled' : ''}>${LumiereI18n.t('add_cart')}</button>
        <button type="button" class="btn btn-outline btn-full btn-wishlist${typeof KwanzouWishlist !== 'undefined' && KwanzouWishlist.has(product.id) ? ' active' : ''}" id="btnWishlist" data-id="${product.id}">♥ ${LumiereI18n.t('account_wishlist')}</button>
      </div>
      ${productShareHTML()}
      <div class="pd-meta">
        <span>${LumiereI18n.t('sku')}: ${ProductUI.sku(product)}</span>
        <span>${LumiereI18n.t('category_label')}: ${category}</span>
      </div>
    </div>`;

  document.getElementById('productTabs').innerHTML = `
    <div class="tabs-nav">
      <button class="tab-btn active" data-tab="desc">${LumiereI18n.t('tab_description')}</button>
      <button class="tab-btn" data-tab="details">${LumiereI18n.t('tab_details')}</button>
      <button class="tab-btn" data-tab="reviews">${LumiereI18n.t('tab_reviews')}</button>
    </div>
    <div class="tabs-content">
      <div class="tab-panel active" id="tab-desc"><p>${desc || LumiereI18n.t('no_description')}</p></div>
      <div class="tab-panel" id="tab-details">
        <ul class="details-list">
          <li><strong>${LumiereI18n.t('category_label')}</strong> ${category}</li>
          <li><strong>${LumiereI18n.t('material')}</strong> ${LumiereI18n.t('material_premium')}</li>
          <li><strong>${LumiereI18n.t('warranty')}</strong> ${LumiereI18n.t('warranty_1year')}</li>
          <li><strong>${LumiereI18n.t('origin')}</strong> ${LumiereI18n.t('origin_intl')}</li>
        </ul>
      </div>
      <div class="tab-panel" id="tab-reviews">
        <div class="review-summary"><span class="stars">${stars}</span> ${product.rating || 0}/5 · ${product.reviews || productReviews.length} ${LumiereI18n.t('reviews_count')}</div>
        <div class="product-reviews-list">${reviewsListHtml}</div>
      </div>
    </div>`;

  const related = LumiereStore.get().products.filter(p => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 4);
  document.getElementById('relatedGrid').innerHTML = related.length
    ? related.map(p => ProductUI.cardHTML(p)).join('')
    : `<p>${LumiereI18n.t('no_related')}</p>`;
  ProductUI.bindCartButtons(document.getElementById('relatedGrid'));

  bindProductEvents(product);
  if (typeof KwanzouWishlist !== 'undefined') KwanzouWishlist.bindButtons(document.getElementById('productDetail'));
  LumiereI18n.applyTranslations();
}

function colorPickerHTML(product) {
  if (!ProductUI.hasColors(product)) return '';
  const swatches = product.colors.map((c, i) => {
    const label = ProductUI.colorLabel(c);
    const bg = ProductUI.colorSwatchStyle(c);
    return `<button type="button" class="pd-color" data-idx="${i}" title="${label}" aria-label="${label}" aria-pressed="false">
      <span class="pd-color__dot" style="background:${bg}"></span>
      <span class="pd-color__name">${label}</span>
    </button>`;
  }).join('');
  return `<div class="pd-colors" id="pdColors">
    <label class="pd-colors__label">${LumiereI18n.t('color_label')}: <span class="pd-colors__selected" id="pdColorSelected">${LumiereI18n.t('color_choose')}</span></label>
    <div class="pd-colors__swatches">${swatches}</div>
  </div>`;
}

function productShareHTML() {
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  return `<div class="pd-share" id="pdShare">
    <p class="pd-share__label">${LumiereI18n.t('share_product')}</p>
    <p class="pd-share__hint">${LumiereI18n.t('share_product_hint')}</p>
    <div class="pd-share__btns">
      <button type="button" class="pd-share__btn pd-share__btn--facebook" data-share="facebook" aria-label="Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z"/></svg>
        <span>Facebook</span>
      </button>
      <button type="button" class="pd-share__btn pd-share__btn--instagram" data-share="instagram" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
        <span>Instagram</span>
      </button>
      <button type="button" class="pd-share__btn pd-share__btn--tiktok" data-share="tiktok" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
        <span>TikTok</span>
      </button>
      <button type="button" class="pd-share__btn pd-share__btn--copy" data-share="copy" aria-label="${LumiereI18n.t('share_copy')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        <span>${LumiereI18n.t('share_copy')}</span>
      </button>
      ${canNative ? `<button type="button" class="pd-share__btn pd-share__btn--native" data-share="native" aria-label="${LumiereI18n.t('share_more')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/></svg>
        <span>${LumiereI18n.t('share_more')}</span>
      </button>` : ''}
    </div>
  </div>`;
}

function productShareUrl(product) {
  try {
    const url = new URL(window.location.href);
    if (product?.id && !url.searchParams.get('id')) url.searchParams.set('id', product.id);
    return url.toString();
  } catch (_) {
    return window.location.href;
  }
}

function productShareText(product) {
  const name = LumiereI18n.localized(product, 'name') || product.name || product.nameAr || '';
  return `${name} — Kwanzou EG`;
}

async function copyShareLink(url) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

function openShareWindow(url) {
  window.open(url, '_blank', 'noopener,noreferrer,width=640,height=720');
}

async function handleProductShare(platform, product) {
  const url = productShareUrl(product);
  const text = productShareText(product);

  if (platform === 'facebook') {
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`);
    return;
  }

  if (platform === 'copy') {
    const ok = await copyShareLink(url);
    showToast(ok ? LumiereI18n.t('share_copied') : LumiereI18n.t('share_copy_failed'));
    return;
  }

  if (platform === 'native') {
    try {
      await navigator.share({ title: text, text, url });
    } catch (_) {}
    return;
  }

  // Instagram / TikTok: no web story API — copy link then open the app/site
  const ok = await copyShareLink(url);
  showToast(ok
    ? (platform === 'instagram' ? LumiereI18n.t('share_instagram_hint') : LumiereI18n.t('share_tiktok_hint'))
    : LumiereI18n.t('share_copy_failed'));

  const web = platform === 'instagram'
    ? 'https://www.instagram.com/'
    : 'https://www.tiktok.com/upload';
  window.open(web, '_blank', 'noopener,noreferrer');
}

function bindProductShare(product) {
  document.querySelectorAll('#pdShare [data-share]').forEach(btn => {
    btn.onclick = () => handleProductShare(btn.dataset.share, product);
  });
}

// Currently selected color for the product being viewed (null = none / no colors).
let _selectedColor = null;

function bindProductEvents(product) {
  _selectedColor = null;
  bindProductShare(product);
  document.querySelectorAll('.pd-thumb').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('pdMainImg').src = btn.dataset.src;
      document.querySelectorAll('.pd-thumb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  const hasColors = ProductUI.hasColors(product);
  document.querySelectorAll('.pd-color').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx;
      _selectedColor = product.colors[idx] || null;
      document.querySelectorAll('.pd-color').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const sel = document.getElementById('pdColorSelected');
      if (sel) sel.textContent = ProductUI.colorLabel(_selectedColor);
    };
  });

  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').onclick = () => { if (+qtyInput.value > 1) qtyInput.value = +qtyInput.value - 1; };
  document.getElementById('qtyPlus').onclick = () => { if (+qtyInput.value < product.stock) qtyInput.value = +qtyInput.value + 1; };

  const requireColor = () => {
    if (hasColors && !_selectedColor) {
      showToast(LumiereI18n.t('color_required'));
      document.getElementById('pdColors')?.classList.add('pd-colors--error');
      return false;
    }
    return true;
  };

  document.getElementById('btnAddCart').onclick = () => {
    if (!requireColor()) return;
    const result = KwanzouCart.add(product.id, +qtyInput.value, _selectedColor);
    if (result?.ok === false) {
      showToast(LumiereI18n.t('stock_limit'));
      return;
    }
    const colorText = _selectedColor ? ` (${ProductUI.colorLabel(_selectedColor)})` : '';
    showToast(`${LumiereI18n.localized(product, 'name')}${colorText} — ${LumiereI18n.t('added_bag')}`);
  };

  document.getElementById('btnBuyNow').onclick = () => {
    if (!requireColor()) return;
    KwanzouCart.add(product.id, +qtyInput.value, _selectedColor);
    window.location.href = 'cart.html';
  };

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    };
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
