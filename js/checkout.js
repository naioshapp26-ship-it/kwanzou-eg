/**
 * Checkout page logic
 */
(function () {
  let cartSubtotal = 0;

  document.addEventListener('DOMContentLoaded', async () => {
    LumiereI18n.init();
    await LumiereStore.init();
    if (LumiereAuth.isLoggedIn()) await LumiereAuth.refreshCurrentUser();
    LumiereLayout.init('shop');
    renderCart();
    window.addEventListener('lumiere:langchange', () => {
      LumiereI18n.applyTranslations();
      LumiereLayout.init('shop');
      renderCart();
    });
  });

  function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  function sym() {
    return LumiereStore.get().settings.currencySymbol || 'ج.م';
  }

  function formatMoney(n) {
    return `${Number(n).toLocaleString()} ${sym()}`;
  }

  function markFieldError(input, msgKey) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.add('field-error');
    input.classList.add('input-error');
    const msg = group.querySelector('.field-error-msg');
    if (msg) msg.textContent = LumiereI18n.t(msgKey);
  }

  function clearFieldErrors(form) {
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('field-error'));
    form.querySelectorAll('input, select, textarea').forEach(i => i.classList.remove('input-error'));
  }

  function validateCheckoutForm(form) {
    clearFieldErrors(form);
    const required = [
      ['name', 'checkout_name_required'],
      ['phone', 'checkout_phone_required'],
      ['country', 'checkout_country_required'],
      ['governorate', 'checkout_governorate_required'],
      ['city', 'checkout_city_required'],
      ['address', 'checkout_address_required']
    ];
    let valid = true;
    let firstInvalid = null;

    required.forEach(([name, key]) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input || !String(input.value).trim()) {
        if (input) markFieldError(input, key);
        valid = false;
        firstInvalid = firstInvalid || input;
      }
    });

    const payment = form.querySelector('[name="payment"]:checked');
    if (!payment) {
      showToast(LumiereI18n.t('checkout_payment_required'));
      valid = false;
    }

    if (!valid) {
      firstInvalid?.focus();
      showToast(LumiereI18n.t('checkout_error'));
    }
    return valid;
  }

  function countryOptions(selected = 'EG') {
    return CheckoutShipping.getConfig().countries.map(c =>
      `<option value="${c.code}" ${c.code === selected ? 'selected' : ''}>${CheckoutShipping.countryLabel(c)}</option>`
    ).join('');
  }

  function governorateOptions(countryCode, selected = '') {
    const country = CheckoutShipping.findCountry(countryCode);
    if (!country) return '';
    return country.zones.map(z =>
      `<option value="${z.id}" data-fee="${z.fee}" ${z.id === selected ? 'selected' : ''}>${CheckoutShipping.zoneLabel(z)} — ${formatMoney(z.fee)}</option>`
    ).join('');
  }

  function paymentOptionsHTML() {
    return CheckoutShipping.enabledPaymentMethods().map(m => `
      <label class="payment-option">
        <input type="radio" name="payment" value="${m.id}" ${m.id === 'cod' ? 'checked' : ''}>
        <span class="payment-option__box">
          <span class="payment-option__title">${CheckoutShipping.paymentLabel(m)}</span>
          <span class="payment-option__desc">${LumiereI18n.t('checkout_cod_desc')}</span>
        </span>
      </label>
    `).join('');
  }

  function updateTotals(form) {
    const country = form.querySelector('[name="country"]')?.value || 'EG';
    const zoneId = form.querySelector('[name="governorate"]')?.value;
    const { fee, free } = CheckoutShipping.calcShipping(cartSubtotal, country, zoneId);
    const grand = cartSubtotal + fee;

    const subEl = document.getElementById('checkoutSubtotal');
    const shipEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutGrandTotal');
    const freeNote = document.getElementById('checkoutFreeNote');

    if (subEl) subEl.textContent = formatMoney(cartSubtotal);
    if (shipEl) {
      shipEl.textContent = free ? LumiereI18n.t('checkout_shipping_free') : formatMoney(fee);
      shipEl.classList.toggle('checkout-summary__free', free);
    }
    if (totalEl) totalEl.textContent = formatMoney(grand);
    if (freeNote) {
      const threshold = CheckoutShipping.getConfig().freeThreshold;
      freeNote.hidden = free || !threshold;
      if (!free && threshold) {
        freeNote.textContent = LumiereI18n.t('checkout_free_hint').replace('{amount}', formatMoney(threshold));
      }
    }
    return { fee, grand, free };
  }

  function bindCheckoutForm(form, profile = {}) {
    if (profile.governorate) form.dataset.defaultGov = profile.governorate;
    const countrySelect = form.querySelector('[name="country"]');
    const govSelect = form.querySelector('[name="governorate"]');

    const refreshGovernorates = () => {
      const code = countrySelect.value;
      const prev = govSelect.value || form.dataset.defaultGov || '';
      govSelect.innerHTML = `<option value="">${LumiereI18n.t('checkout_select_governorate')}</option>` +
        governorateOptions(code, prev);
      if (!govSelect.value && govSelect.options.length > 1 && !prev) {
        govSelect.selectedIndex = 1;
      }
      updateTotals(form);
    };

    countrySelect?.addEventListener('change', refreshGovernorates);
    govSelect?.addEventListener('change', () => updateTotals(form));

    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        input.closest('.form-group')?.classList.remove('field-error');
      });
    });

    refreshGovernorates();

    form.onsubmit = async e => {
      e.preventDefault();
      if (!validateCheckoutForm(form)) return;

      const fd = new FormData(form);
      const session = LumiereAuth.getSession();
      const items = KwanzouCart.get();
      const products = LumiereStore.get().products;
      const countryCode = fd.get('country');
      const zoneId = fd.get('governorate');
      const country = CheckoutShipping.findCountry(countryCode);
      const zone = CheckoutShipping.findZone(countryCode, zoneId);
      const { fee, grand } = updateTotals(form);
      const paymentId = fd.get('payment');
      const paymentMethod = CheckoutShipping.getConfig().paymentMethods.find(m => m.id === paymentId);

      const orderItems = items.map(item => {
        const p = products.find(x => x.id === item.id);
        const unit = ProductUI.effectivePrice(p);
        return {
          id: item.id,
          name: LumiereI18n.localized(p, 'name') || p?.name,
          qty: item.qty,
          price: unit,
          image: p?.image || '',
          color: item.color || null
        };
      }).filter(i => i.name);

      const addressLine = [
        fd.get('address'),
        fd.get('landmark') ? `${LumiereI18n.t('checkout_landmark')}: ${fd.get('landmark')}` : ''
      ].filter(Boolean).join(' — ');

      await LumiereStore.init();
      const order = await LumiereStore.placeOrder({
        customerName: (fd.get('name') || '').trim(),
        customerEmail: (fd.get('email') || '').trim(),
        customerPhone: (fd.get('phone') || '').trim(),
        customerPhone2: (fd.get('phone2') || '').trim(),
        shippingAddress: {
          country: countryCode,
          countryName: country ? CheckoutShipping.countryLabel(country) : countryCode,
          governorate: zoneId,
          governorateName: zone ? CheckoutShipping.zoneLabel(zone) : zoneId,
          city: (fd.get('city') || '').trim(),
          address: addressLine,
          landmark: (fd.get('landmark') || '').trim(),
          notes: (fd.get('notes') || '').trim()
        },
        paymentMethod: paymentId,
        paymentMethodLabel: paymentMethod ? CheckoutShipping.paymentLabel(paymentMethod) : '',
        subtotal: cartSubtotal,
        shippingFee: fee,
        total: grand,
        items: orderItems,
        userId: session?.id || null
      });

      items.forEach(i => KwanzouCart.remove(KwanzouCart.lineKey(i)));
      KwanzouCart.updateUI();
      if (session) await LumiereAuth.refreshCurrentUser();
      showOrderConfirmation(order, orderItems);
    };
  }

  function showOrderConfirmation(order, orderItems) {
    const el = document.getElementById('cartContent');
    const session = LumiereAuth.getSession();
    const addr = order.shippingAddress || {};
    const itemsHtml = orderItems.map(i => {
      const colorLabel = ProductUI.colorLabel(i.color);
      const colorText = colorLabel ? ` — ${LumiereI18n.t('color_label')}: ${colorLabel}` : '';
      return `<li>${i.name} × ${i.qty}${colorText} — ${formatMoney(i.price * i.qty)}</li>`;
    }).join('');

    el.innerHTML = `
      <div class="order-success">
        <div class="order-success__icon">✓</div>
        <h2>${LumiereI18n.t('checkout_success_title')}</h2>
        <p>${LumiereI18n.t('checkout_success_desc')}</p>
        <div class="order-success__card">
          <p><strong>${LumiereI18n.t('checkout_order_id')}:</strong> ${order.id}</p>
          <p><strong>${LumiereI18n.t('checkout_name')}:</strong> ${order.customerName}</p>
          <p><strong>${LumiereI18n.t('checkout_phone')}:</strong> ${order.customerPhone}${order.customerPhone2 ? ` / ${order.customerPhone2}` : ''}</p>
          <p><strong>${LumiereI18n.t('checkout_country')}:</strong> ${addr.countryName || '—'}</p>
          <p><strong>${LumiereI18n.t('checkout_governorate')}:</strong> ${addr.governorateName || '—'}</p>
          <p><strong>${LumiereI18n.t('checkout_city')}:</strong> ${addr.city || '—'}</p>
          <p><strong>${LumiereI18n.t('checkout_address')}:</strong> ${addr.address || '—'}</p>
          <p><strong>${LumiereI18n.t('checkout_payment')}:</strong> ${order.paymentMethodLabel || LumiereI18n.t('checkout_payment_cod')}</p>
          <p><strong>${LumiereI18n.t('checkout_subtotal')}:</strong> ${formatMoney(order.subtotal ?? order.total)}</p>
          <p><strong>${LumiereI18n.t('checkout_shipping')}:</strong> ${order.shippingFee ? formatMoney(order.shippingFee) : LumiereI18n.t('checkout_shipping_free')}</p>
          <p><strong>${LumiereI18n.t('cart_total')}:</strong> ${formatMoney(order.total)}</p>
          <div class="order-success__items">
            <strong>${LumiereI18n.t('checkout_items')}:</strong>
            <ul>${itemsHtml}</ul>
          </div>
        </div>
        <div class="order-success__actions">
          ${session ? `<a href="account.html" class="btn btn-primary">${LumiereI18n.t('checkout_view_orders')}</a>` : ''}
          <a href="shop.html" class="btn btn-outline">${LumiereI18n.t('checkout_back_shop')}</a>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderCart() {
    const el = document.getElementById('cartContent');
    const items = KwanzouCart.get();
    const products = LumiereStore.get().products;
    const session = LumiereAuth.getSession();
    const user = LumiereAuth.getCurrentUser();
    const profile = user?.shippingProfile || {};

    if (!items.length) {
      el.innerHTML = `<div class="cart-empty"><p>${LumiereI18n.t('cart_empty')}</p><a href="shop.html" class="btn btn-primary">${LumiereI18n.t('shop_all')}</a></div>`;
      return;
    }

    cartSubtotal = 0;
    const rows = items.map((item, idx) => {
      const p = products.find(x => x.id === item.id);
      if (!p) return '';
      const unit = ProductUI.effectivePrice(p);
      const sub = unit * item.qty;
      cartSubtotal += sub;
      const name = LumiereI18n.localized(p, 'name') || p.name;
      const priceLabel = ProductUI.salePrice(p)
        ? `<span class="cart-item__price-sale">${KwanzouCart.formatPrice(unit)} <del>${KwanzouCart.formatPrice(p.price)}</del></span>`
        : `<span>${KwanzouCart.formatPrice(unit)}</span>`;
      const max = p.stock != null ? p.stock : 99;
      const colorLabel = ProductUI.colorLabel(item.color);
      const colorHtml = colorLabel
        ? `<span class="cart-item__color"><span class="cart-item__swatch" style="background:${ProductUI.colorSwatchStyle(item.color)}"></span>${LumiereI18n.t('color_label')}: ${colorLabel}</span>`
        : '';
      return `<div class="cart-item">
        <a href="product.html?id=${p.id}"><img src="${p.image}" alt=""></a>
        <div class="cart-item__info"><a href="product.html?id=${p.id}"><strong>${name}</strong></a>${priceLabel}${colorHtml}
        <div class="cart-qty">
          <button type="button" class="cart-qty__btn" data-idx="${idx}" data-delta="-1" aria-label="-">−</button>
          <span class="cart-qty__num">${item.qty}</span>
          <button type="button" class="cart-qty__btn" data-idx="${idx}" data-delta="1" ${item.qty >= max ? 'disabled' : ''} aria-label="+">+</button>
        </div></div>
        <div class="cart-item__total">${KwanzouCart.formatPrice(sub)}</div>
        <button class="cart-item__remove" data-idx="${idx}" type="button" aria-label="remove">✕</button>
      </div>`;
    }).join('');

    el.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">${rows}</div>
        <div class="cart-sidebar">
          <div class="cart-summary checkout-summary" id="checkoutSummary">
            <div class="checkout-summary__row">
              <span>${LumiereI18n.t('checkout_subtotal')}</span>
              <strong id="checkoutSubtotal">${formatMoney(cartSubtotal)}</strong>
            </div>
            <div class="checkout-summary__row">
              <span>${LumiereI18n.t('checkout_shipping')}</span>
              <strong id="checkoutShipping">—</strong>
            </div>
            <p class="checkout-summary__note" id="checkoutFreeNote" hidden></p>
            <div class="checkout-summary__row checkout-summary__total">
              <span>${LumiereI18n.t('cart_total')}</span>
              <strong id="checkoutGrandTotal">${formatMoney(cartSubtotal)}</strong>
            </div>
          </div>
          <form class="checkout-form" id="checkoutForm" novalidate>
            <h2>${LumiereI18n.t('checkout_title')}</h2>
            <p class="checkout-form__hint">${LumiereI18n.t('checkout_required_hint')}</p>

            <h3 class="checkout-form__section">${LumiereI18n.t('checkout_contact')}</h3>
            <div class="form-group">
              <label>${LumiereI18n.t('checkout_name')} <span class="required">*</span></label>
              <input type="text" name="name" autocomplete="name" value="${user?.name || session?.name || ''}">
              <span class="field-error-msg"></span>
            </div>
            <div class="form-row form-row--2">
              <div class="form-group">
                <label>${LumiereI18n.t('checkout_phone')} <span class="required">*</span></label>
                <input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="01xxxxxxxxx" value="${profile.phone || user?.phone || session?.phone || ''}">
                <span class="field-error-msg"></span>
              </div>
              <div class="form-group">
                <label>${LumiereI18n.t('checkout_phone2')}</label>
                <input type="tel" name="phone2" inputmode="tel" placeholder="01xxxxxxxxx" value="${profile.phone2 || ''}">
                <span class="field-error-msg"></span>
              </div>
            </div>
            <div class="form-group">
              <label>${LumiereI18n.t('checkout_email')}</label>
              <input type="email" name="email" autocomplete="email" value="${user?.email || session?.email || ''}">
            </div>

            <h3 class="checkout-form__section">${LumiereI18n.t('checkout_address_section')}</h3>
            <div class="form-row form-row--2">
              <div class="form-group">
                <label>${LumiereI18n.t('checkout_country')} <span class="required">*</span></label>
                <select name="country">${countryOptions(profile.country || 'EG')}</select>
                <span class="field-error-msg"></span>
              </div>
              <div class="form-group">
                <label>${LumiereI18n.t('checkout_governorate')} <span class="required">*</span></label>
                <select name="governorate">
                  <option value="">${LumiereI18n.t('checkout_select_governorate')}</option>
                </select>
                <span class="field-error-msg"></span>
              </div>
            </div>
            <div class="form-group">
              <label>${LumiereI18n.t('checkout_city')} <span class="required">*</span></label>
              <input type="text" name="city" placeholder="${LumiereI18n.t('checkout_city_ph')}" value="${profile.city || ''}">
              <span class="field-error-msg"></span>
            </div>
            <div class="form-group">
              <label>${LumiereI18n.t('checkout_address')} <span class="required">*</span></label>
              <textarea name="address" rows="2" placeholder="${LumiereI18n.t('checkout_address_ph')}">${profile.address || ''}</textarea>
              <span class="field-error-msg"></span>
            </div>
            <div class="form-group">
              <label>${LumiereI18n.t('checkout_landmark')}</label>
              <input type="text" name="landmark" placeholder="${LumiereI18n.t('checkout_landmark_ph')}" value="${profile.landmark || ''}">
            </div>
            <div class="form-group">
              <label>${LumiereI18n.t('checkout_notes')}</label>
              <textarea name="notes" rows="2" placeholder="${LumiereI18n.t('checkout_notes_ph')}">${profile.notes || ''}</textarea>
            </div>

            <h3 class="checkout-form__section">${LumiereI18n.t('checkout_payment_section')}</h3>
            <div class="payment-options">${paymentOptionsHTML()}</div>

            <button type="submit" class="btn btn-primary btn-full">${LumiereI18n.t('checkout_submit')}</button>
          </form>
        </div>
      </div>`;

    bindCartRowControls();
    bindCheckoutForm(document.getElementById('checkoutForm'), profile);
  }

  function bindCartRowControls() {
    const el = document.getElementById('cartContent');
    if (!el) return;
    el.querySelectorAll('.cart-qty__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = KwanzouCart.get()[+btn.dataset.idx];
        if (!item) return;
        KwanzouCart.changeQty(KwanzouCart.lineKey(item), +btn.dataset.delta);
        renderCart();
      });
    });
    el.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = KwanzouCart.get()[+btn.dataset.idx];
        if (!item) return;
        KwanzouCart.remove(KwanzouCart.lineKey(item));
        renderCart();
      });
    });
  }

  window.renderCart = renderCart;
})();
