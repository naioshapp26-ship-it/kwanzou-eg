/**
 * Checkout — Care Natural–style order form + WhatsApp confirmation
 * Scoped to cart page only.
 */
(function () {
  let cartSubtotal = 0;
  let waOpenTimer = null;

  const DEPOSIT_PAYMENT = {
    id: 'deposit_cod',
    labelAr: 'تحويل ديبوزيت + الباقي عند الاستلام',
    labelEn: 'Deposit transfer + balance on delivery'
  };

  const WA_NUMBER = '201284371361';

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

  function paymentLabel() {
    return LumiereI18n.getLang() === 'ar' ? DEPOSIT_PAYMENT.labelAr : DEPOSIT_PAYMENT.labelEn;
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
      ['phone', 'checkout_phone_primary_required'],
      ['phone2', 'checkout_phone2_required'],
      ['country', 'checkout_country_required'],
      ['governorate', 'checkout_governorate_required'],
      ['city', 'checkout_area_required'],
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

    if (!form.querySelector('[name="payment"]')) {
      showToast(LumiereI18n.t('checkout_payment_required'));
      valid = false;
    }

    if (!valid) {
      firstInvalid?.focus();
      showToast(LumiereI18n.t('checkout_phones_alert'));
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

  function updateTotals(form) {
    const country = form.querySelector('[name="country"]')?.value || 'EG';
    const zoneId = form.querySelector('[name="governorate"]')?.value;
    const { fee, free } = CheckoutShipping.calcShipping(cartSubtotal, country, zoneId);
    const grand = cartSubtotal + fee;

    form.querySelectorAll('[data-checkout-subtotal]').forEach(el => {
      el.textContent = formatMoney(cartSubtotal);
    });
    form.querySelectorAll('[data-checkout-shipping]').forEach(el => {
      el.textContent = free ? LumiereI18n.t('checkout_shipping_free') : formatMoney(fee);
    });
    form.querySelectorAll('[data-checkout-total]').forEach(el => {
      el.textContent = formatMoney(grand);
    });
    return { fee, grand, free };
  }

  function buildWhatsAppUrl(order, orderItems) {
    const lines = [
      `طلب جديد — ${order.id}`,
      `الاسم: ${order.customerName || ''}`,
      `موبايل: ${order.customerPhone || ''}`,
      order.customerPhone2 ? `موبايل احتياطي: ${order.customerPhone2}` : '',
      `المحافظة: ${order.shippingAddress?.governorateName || ''}`,
      `المنطقة: ${order.shippingAddress?.city || ''}`,
      `العنوان: ${order.shippingAddress?.address || ''}`,
      '',
      'المنتجات:'
    ];
    (orderItems || order.items || []).forEach(i => {
      lines.push(`- ${i.name} × ${i.qty} = ${formatMoney(i.price * i.qty)}`);
    });
    lines.push('');
    lines.push(`المجموع: ${formatMoney(order.subtotal ?? 0)}`);
    lines.push(`الشحن: ${order.shippingFee ? formatMoney(order.shippingFee) : LumiereI18n.t('checkout_shipping_free')}`);
    lines.push(`الإجمالي: ${formatMoney(order.total)}`);
    lines.push(`الدفع: ${order.paymentMethodLabel || paymentLabel()}`);
    lines.push('');
    lines.push('تم إرسال الطلب من الموقع — برجاء تأكيد الأوردر.');
    const text = lines.filter(Boolean).join('\n');
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function formatOrderDate(order) {
    const raw = order.createdAt || order.date;
    try {
      const d = raw?.includes?.('T') ? new Date(raw) : new Date(String(raw) + 'T12:00:00');
      if (Number.isNaN(d.getTime())) return order.date || '—';
      return d.toLocaleDateString(LumiereI18n.getLang() === 'ar' ? 'ar-EG' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (_) {
      return order.date || '—';
    }
  }

  function bindCheckoutForm(form) {
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

    if (form.dataset.defaultGov) { /* keep */ }
    countrySelect?.addEventListener('change', refreshGovernorates);
    govSelect?.addEventListener('change', () => updateTotals(form));

    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        input.closest('.form-group')?.classList.remove('field-error');
      });
      input.addEventListener('change', () => {
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

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = LumiereI18n.t('checkout_submitting');
      }

      try {
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
            address: (fd.get('address') || '').trim(),
            landmark: '',
            notes: (fd.get('notes') || '').trim()
          },
          paymentMethod: DEPOSIT_PAYMENT.id,
          paymentMethodLabel: paymentLabel(),
          paymentStatus: 'awaiting_confirmation',
          status: 'Awaiting Payment',
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
      } catch (err) {
        showToast(LumiereI18n.t('checkout_error'));
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = LumiereI18n.t('checkout_submit');
        }
      }
    };
  }

  function showOrderConfirmation(order, orderItems) {
    if (waOpenTimer) {
      clearTimeout(waOpenTimer);
      waOpenTimer = null;
    }

    const el = document.getElementById('cartContent');
    const waUrl = buildWhatsAppUrl(order, orderItems);
    const items = orderItems || order.items || [];

    const rowsHtml = items.map(i => {
      const colorLabel = ProductUI.colorLabel?.(i.color);
      const colorText = colorLabel ? ` — ${colorLabel}` : '';
      return `<tr>
        <td>${i.name}${colorText} × ${i.qty}</td>
        <td>${formatMoney(i.price * i.qty)}</td>
      </tr>`;
    }).join('');

    el.innerHTML = `
      <div class="order-done">
        <div class="order-done__wa-box">
          <p class="order-done__wa-lead">${LumiereI18n.t('checkout_wa_lead')}</p>
          <ol class="order-done__steps">
            <li>${LumiereI18n.t('checkout_wa_step1')}</li>
            <li>${LumiereI18n.t('checkout_wa_step2')}</li>
            <li>${LumiereI18n.t('checkout_wa_step3')}</li>
          </ol>
          <p class="order-done__wa-foot">${LumiereI18n.t('checkout_wa_foot')}</p>
          <a class="order-done__wa-btn" id="orderWaBtn" href="${waUrl}" target="_blank" rel="noopener">
            ${LumiereI18n.t('checkout_wa_btn')}
          </a>
          <p class="order-done__wa-auto" id="orderWaAuto">${LumiereI18n.t('checkout_wa_auto')}</p>
        </div>

        <div class="order-done__meta">
          <div><span>${LumiereI18n.t('checkout_order_id')}</span><strong>${order.id}</strong></div>
          <div><span>${LumiereI18n.t('account_date')}</span><strong>${formatOrderDate(order)}</strong></div>
          <div><span>${LumiereI18n.t('cart_total')}</span><strong>${formatMoney(order.total)}</strong></div>
          <div class="order-done__meta-pay">
            <span>${LumiereI18n.t('checkout_payment')}</span>
            <strong>${order.paymentMethodLabel || paymentLabel()} ✓</strong>
          </div>
        </div>

        <div class="order-done__details">
          <h3>${LumiereI18n.t('checkout_order_details')}</h3>
          <table class="order-done__table">
            <tbody>
              ${rowsHtml}
              <tr><td>${LumiereI18n.t('checkout_subtotal')}</td><td>${formatMoney(order.subtotal ?? order.total)}</td></tr>
              <tr><td>${LumiereI18n.t('checkout_shipping')}</td><td>${order.shippingFee ? formatMoney(order.shippingFee) : LumiereI18n.t('checkout_shipping_free')}</td></tr>
              <tr class="order-done__total-row"><td>${LumiereI18n.t('cart_total')}</td><td>${formatMoney(order.total)}</td></tr>
              <tr><td>${LumiereI18n.t('checkout_payment')}</td><td>${order.paymentMethodLabel || paymentLabel()}</td></tr>
              ${order.shippingAddress?.notes ? `<tr><td>${LumiereI18n.t('checkout_notes')}</td><td>${order.shippingAddress.notes}</td></tr>` : ''}
            </tbody>
          </table>
          <div class="order-done__actions">
            <a class="order-done__pay" href="${waUrl}" target="_blank" rel="noopener">${LumiereI18n.t('checkout_wa_pay')}</a>
            <a class="order-done__cancel" href="shop.html">${LumiereI18n.t('checkout_wa_cancel')}</a>
          </div>
        </div>
      </div>`;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    waOpenTimer = setTimeout(() => {
      waOpenTimer = null;
      const auto = document.getElementById('orderWaAuto');
      if (auto) auto.textContent = LumiereI18n.t('checkout_wa_opened');
      window.open(waUrl, '_blank', 'noopener');
    }, 5000);
  }

  function orderSummaryTable(items, products) {
    const rows = items.map(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return '';
      const unit = ProductUI.effectivePrice(p);
      const name = LumiereI18n.localized(p, 'name') || p.name;
      const colorLabel = ProductUI.colorLabel(item.color);
      const colorText = colorLabel ? ` — ${colorLabel}` : '';
      return `<tr>
        <td><span class="order-sheet__qty">${item.qty} ×</span> ${name}${colorText}</td>
        <td>${formatMoney(unit * item.qty)}</td>
      </tr>`;
    }).join('');

    return `
      <div class="order-sheet__your">
        <h3>${LumiereI18n.t('checkout_your_order')}</h3>
        <table class="order-sheet__table">
          <thead>
            <tr>
              <th>${LumiereI18n.t('checkout_product_col')}</th>
              <th>${LumiereI18n.t('checkout_total_col')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td>${LumiereI18n.t('checkout_subtotal')}</td>
              <td data-checkout-subtotal>${formatMoney(cartSubtotal)}</td>
            </tr>
            <tr>
              <td>${LumiereI18n.t('checkout_shipping')}</td>
              <td data-checkout-shipping>—</td>
            </tr>
            <tr class="order-sheet__grand">
              <td>${LumiereI18n.t('cart_total')}</td>
              <td data-checkout-total>${formatMoney(cartSubtotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
  }

  function renderCart() {
    if (waOpenTimer) {
      clearTimeout(waOpenTimer);
      waOpenTimer = null;
    }

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
      <div class="cart-layout cart-layout--order-sheet">
        <div class="cart-items">${rows}</div>
        <form class="checkout-form order-sheet" id="checkoutForm" novalidate>
          <div class="order-sheet__alert">${LumiereI18n.t('checkout_phones_alert')}</div>

          <h2 class="order-sheet__title">${LumiereI18n.t('checkout_billing_title')}</h2>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_fullname_full')} <span class="required">*</span></label>
            <input type="text" name="name" autocomplete="name" value="${user?.name || session?.name || ''}">
            <span class="field-error-msg"></span>
          </div>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_country')} <span class="required">*</span></label>
            <select name="country">${countryOptions(profile.country || 'EG')}</select>
            <span class="field-error-msg"></span>
          </div>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_governorate')} <span class="required">*</span></label>
            <select name="governorate">
              <option value="">${LumiereI18n.t('checkout_select_option')}</option>
            </select>
            <span class="field-error-msg"></span>
          </div>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_area')} <span class="required">*</span></label>
            <input type="text" name="city" placeholder="${LumiereI18n.t('checkout_area_ph')}" value="${profile.city || ''}">
            <span class="field-error-msg"></span>
          </div>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_phone_wa')} <span class="required">*</span></label>
            <input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="01xxxxxxxxx" value="${profile.phone || user?.phone || session?.phone || ''}">
            <span class="field-error-msg"></span>
          </div>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_phone2_required_label')} <span class="required">*</span></label>
            <input type="tel" name="phone2" inputmode="tel" placeholder="01xxxxxxxxx" value="${profile.phone2 || ''}">
            <span class="field-error-msg"></span>
          </div>

          <div class="form-group">
            <label>${LumiereI18n.t('checkout_address')} <span class="required">*</span></label>
            <input type="text" name="address" placeholder="${LumiereI18n.t('checkout_address_detail_ph')}" value="${profile.address || ''}">
            <span class="field-error-msg"></span>
            <p class="order-sheet__tip">${LumiereI18n.t('checkout_address_tip')}</p>
          </div>

          <h3 class="order-sheet__section">${LumiereI18n.t('checkout_extra_info')}</h3>
          <div class="form-group">
            <label>${LumiereI18n.t('checkout_notes_optional')}</label>
            <textarea name="notes" rows="3" placeholder="${LumiereI18n.t('checkout_notes_order_ph')}">${profile.notes || ''}</textarea>
          </div>

          ${orderSummaryTable(items, products)}

          <h3 class="order-sheet__section">${LumiereI18n.t('checkout_payment_section')}</h3>
          <input type="hidden" name="payment" value="${DEPOSIT_PAYMENT.id}">
          <div class="order-sheet__pay" aria-checked="true">
            <span class="order-sheet__check" aria-hidden="true">✓</span>
            <span>${paymentLabel()}</span>
          </div>
          <p class="order-sheet__wa-note">${LumiereI18n.t('checkout_after_wa_note')}</p>

          <button type="submit" class="order-sheet__submit">${LumiereI18n.t('checkout_submit')}</button>
        </form>
      </div>`;

    const form = document.getElementById('checkoutForm');
    if (profile.governorate) form.dataset.defaultGov = profile.governorate;
    bindCartRowControls();
    bindCheckoutForm(form);
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
