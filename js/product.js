/**
 * Product detail page — Noon-style
 */
document.addEventListener('DOMContentLoaded', () => {
  LumiereI18n.init();
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
  const category = LumiereI18n.localized(product, 'category') || product.category;
  const desc = LumiereI18n.getLang() === 'ar' ? (product.descAr || product.descEn) : (product.descEn || product.descAr);
  const images = product.images || [product.image];
  const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
  const inStock = product.stock > 0;
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
      <div class="pd-price">${ProductUI.formatPrice(product.price)}</div>
      <div class="pd-stock ${inStock ? 'in-stock' : 'out-stock'}">${inStock ? '✓ ' + LumiereI18n.t('in_stock') : LumiereI18n.t('out_of_stock')}</div>
      <div class="pd-delivery">
        <div class="pd-delivery__item">🚚 ${LumiereI18n.t('delivery_fast')}</div>
        <div class="pd-delivery__item">↩ ${LumiereI18n.t('delivery_returns')}</div>
        <div class="pd-delivery__item">✓ ${LumiereI18n.t('delivery_authentic')}</div>
      </div>
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
      </div>
      <div class="pd-meta">
        <span>${LumiereI18n.t('sku')}: ${product.id.toUpperCase()}</span>
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
        <div class="review-summary"><span class="stars">${stars}</span> ${product.rating}/5 · ${product.reviews} ${LumiereI18n.t('reviews_count')}</div>
        <p>${LumiereI18n.t('reviews_verified')}</p>
      </div>
    </div>`;

  const related = LumiereStore.get().products.filter(p => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 4);
  document.getElementById('relatedGrid').innerHTML = related.length
    ? related.map(p => ProductUI.cardHTML(p, true)).join('')
    : `<p>${LumiereI18n.t('no_related')}</p>`;
  ProductUI.bindCartButtons(document.getElementById('relatedGrid'));

  bindProductEvents(product);
  LumiereI18n.applyTranslations();
}

function bindProductEvents(product) {
  document.querySelectorAll('.pd-thumb').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('pdMainImg').src = btn.dataset.src;
      document.querySelectorAll('.pd-thumb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').onclick = () => { if (+qtyInput.value > 1) qtyInput.value = +qtyInput.value - 1; };
  document.getElementById('qtyPlus').onclick = () => { if (+qtyInput.value < product.stock) qtyInput.value = +qtyInput.value + 1; };

  document.getElementById('btnAddCart').onclick = () => {
    KwanzouCart.add(product.id, +qtyInput.value);
    showToast(`${LumiereI18n.localized(product, 'name')} — ${LumiereI18n.t('added_bag')}`);
  };

  document.getElementById('btnBuyNow').onclick = () => {
    KwanzouCart.add(product.id, +qtyInput.value);
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
