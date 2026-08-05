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

  function checkoutSocialBarHTML() {
    const ig = 'https://www.instagram.com/kwanzou.eg?igsh=MTJ3MW5pMmhoYnl6MQ%3D%3D&utm_source=qr';
    const tt = 'https://www.tiktok.com/@kwanzou11?_r=1&_t=ZS-97GmAtM3DrM';
    const fb = 'https://www.facebook.com/share/14kxCwPToLH/?mibextid=wwXIfr';
    const wa = 'https://wa.me/201284371361?text=' + encodeURIComponent('مرحباً، عندي استفسار بخصوص طلب Kwanzou EG');
    const tel = 'tel:+201284371361';
    return `
      <div class="order-sheet__social" aria-label="Social">
        <a class="order-sheet__social-btn order-sheet__social-btn--facebook" href="${fb}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z"/></svg>
        </a>
        <a class="order-sheet__social-btn order-sheet__social-btn--instagram" href="${ig}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
        </a>
        <a class="order-sheet__social-btn order-sheet__social-btn--tiktok" href="${tt}" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
        </a>
        <a class="order-sheet__social-btn order-sheet__social-btn--whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        </a>
        <a class="order-sheet__social-btn order-sheet__social-btn--phone" href="${tel}" aria-label="Phone">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>
        </a>
      </div>`;
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
          ${checkoutSocialBarHTML()}
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
