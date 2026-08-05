/**
 * Admin — deposit confirmation invoice (Care-style)
 * Opens after order payment confirmation; save + WhatsApp send to customer.
 */
const AdminInvoice = (() => {
  function brandName() {
    const s = LumiereStore.get()?.settings || {};
    return s.brandName || s.brand || 'Kwanzou EG';
  }

  function sym() {
    return LumiereStore.get()?.settings?.currencySymbol || 'ج.م';
  }

  function formatInvoiceDate(order) {
    const raw = order.invoice?.date || order.createdAt || order.date;
    try {
      const d = String(raw).includes('T') ? new Date(raw) : new Date(`${raw}T12:00:00`);
      if (Number.isNaN(d.getTime())) return order.date || '—';
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch (_) {
      return order.date || '—';
    }
  }

  function orderNum(order) {
    const id = String(order.id || '');
    const m = id.match(/(\d+)/);
    return m ? m[1] : id.replace(/^ORD-?/i, '') || id;
  }

  function fullAddress(order) {
    const a = order.shippingAddress || {};
    return [a.address, a.city, a.governorateName, a.countryName]
      .filter(Boolean)
      .join(' ');
  }

  function toWhatsAppPhone(phone) {
    let d = String(phone || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('00')) d = d.slice(2);
    if (d.startsWith('0') && d.length === 11) d = '20' + d.slice(1);
    if (!d.startsWith('20') && d.length === 10) d = '20' + d;
    return d;
  }

  function money(n) {
    const v = Number(n) || 0;
    return v.toLocaleString('en-US');
  }

  function defaultDeposit(order) {
    if (order.invoice?.deposit != null) return Number(order.invoice.deposit);
    if (order.shippingFee) return Number(order.shippingFee);
    return 0;
  }

  function buildInvoiceData(order, depositInput) {
    const subtotal = Number(order.subtotal ?? ((order.items || []).reduce((s, i) => s + (i.price * i.qty), 0)));
    const shipping = Number(order.shippingFee || 0);
    const total = Number(order.total ?? (subtotal + shipping));
    let deposit = Number(depositInput);
    if (Number.isNaN(deposit) || deposit < 0) deposit = 0;
    if (deposit > total) deposit = total;
    const remaining = Math.max(0, total - deposit);
    return {
      brand: brandName(),
      orderId: order.id,
      orderNum: orderNum(order),
      date: formatInvoiceDate(order),
      customerName: order.customerName || '',
      address: fullAddress(order),
      phone: order.customerPhone || '',
      phone2: order.customerPhone2 || '',
      items: (order.items || []).map(i => ({
        name: i.name || '',
        qty: Number(i.qty) || 1,
        price: Number(i.price) || 0,
        lineTotal: (Number(i.price) || 0) * (Number(i.qty) || 1)
      })),
      subtotal,
      shipping,
      total,
      deposit,
      remaining,
      issuedAt: new Date().toISOString()
    };
  }

  function invoiceDocumentHTML(data) {
    const rows = data.items.map(i => `
      <tr>
        <td>${escapeHtml(i.name)}</td>
        <td>${i.qty}</td>
        <td>${money(i.price)}</td>
        <td>${money(i.lineTotal)}</td>
      </tr>`).join('');

    return `
      <div class="inv-doc" id="invoiceDocument" dir="rtl">
        <div class="inv-doc__brand">${escapeHtml(data.brand)}</div>
        <div class="inv-doc__head">
          <div class="inv-doc__title">فاتورة طلب #${escapeHtml(data.orderNum)}</div>
          <div class="inv-doc__date">التاريخ: ${escapeHtml(data.date)}</div>
        </div>

        <div class="inv-doc__section">
          <h4 class="inv-doc__section-title"><span class="inv-doc__bar"></span> بيانات العميل</h4>
          <p><strong>الاسم:</strong> ${escapeHtml(data.customerName)}</p>
          <p><strong>العنوان:</strong> ${escapeHtml(data.address || '—')}</p>
          <p><strong>الموبايل:</strong> ${escapeHtml(data.phone || '—')}</p>
          <p><strong>الموبايل الإضافي:</strong> ${escapeHtml(data.phone2 || '—')}</p>
        </div>

        <div class="inv-doc__section">
          <h4 class="inv-doc__section-title"><span class="inv-doc__bar"></span> تفاصيل الطلب</h4>
          <table class="inv-doc__table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div class="inv-doc__section inv-doc__section--summary">
          <h4 class="inv-doc__section-title"><span class="inv-doc__bar"></span> الملخص المالي</h4>
          <div class="inv-doc__summary">
            <div><span>الأوردر:</span> <strong>${money(data.subtotal)}</strong></div>
            <div><span>الشحن:</span> <strong>${money(data.shipping)}</strong></div>
            <div><span>الإجمالي:</span> <strong>${money(data.total)}</strong></div>
            <div><span>الديبوزيت:</span> <strong>${money(data.deposit)}</strong></div>
            <div class="inv-doc__remain"><span>المتبقي عند الاستلام:</span> <strong>${money(data.remaining)}</strong></div>
          </div>
        </div>
      </div>`;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function invoiceWhatsAppText(data) {
    const lines = [
      data.brand,
      `فاتورة طلب #${data.orderNum}`,
      `التاريخ: ${data.date}`,
      '',
      'بيانات العميل',
      `الاسم: ${data.customerName}`,
      `العنوان: ${data.address || '—'}`,
      `الموبايل: ${data.phone || '—'}`,
      `الموبايل الإضافي: ${data.phone2 || '—'}`,
      '',
      'تفاصيل الطلب'
    ];
    data.items.forEach(i => {
      lines.push(`• ${i.name} | كمية ${i.qty} | سعر ${money(i.price)} | إجمالي ${money(i.lineTotal)}`);
    });
    lines.push('');
    lines.push('الملخص المالي');
    lines.push(`الأوردر: ${money(data.subtotal)}`);
    lines.push(`الشحن: ${money(data.shipping)}`);
    lines.push(`الإجمالي: ${money(data.total)}`);
    lines.push(`الديبوزيت: ${money(data.deposit)}`);
    lines.push(`المتبقي عند الاستلام: ${money(data.remaining)}`);
    return lines.join('\n');
  }

  function refreshPreview(order) {
    const input = document.getElementById('invoiceDepositInput');
    const data = buildInvoiceData(order, input ? input.value : defaultDeposit(order));
    const preview = document.getElementById('invoicePreview');
    if (preview) preview.innerHTML = invoiceDocumentHTML(data);
    const remainEl = document.getElementById('invoiceRemainHint');
    if (remainEl) {
      remainEl.innerHTML = `المتبقي عند الاستلام: <strong class="inv-remain-num">${money(data.remaining)}</strong> ${sym()}`;
    }
    return data;
  }

  function open(orderId, opts = {}) {
    const order = LumiereStore.getAllOrders().find(o => o.id === orderId);
    if (!order) return;

    const deposit = defaultDeposit(order);
    const confirmStatus = opts.confirmStatus !== false;

    showModal(LumiereI18n.t('admin_invoice_title'), `
      <div class="inv-editor">
        <p class="inv-editor__hint">${LumiereI18n.t('admin_invoice_hint')}</p>
        <div class="form-group">
          <label>${LumiereI18n.t('admin_invoice_deposit')} (${sym()})</label>
          <input type="number" id="invoiceDepositInput" min="0" step="1" value="${deposit}">
          <p class="field-hint" id="invoiceRemainHint"></p>
        </div>
        <div class="inv-editor__preview" id="invoicePreview"></div>
        <div class="inv-editor__actions">
          <button type="button" class="btn btn-primary" id="invoiceSaveSendBtn">${LumiereI18n.t('admin_invoice_save_send')}</button>
          <button type="button" class="btn btn-outline" id="invoicePrintBtn">${LumiereI18n.t('admin_invoice_print')}</button>
        </div>
      </div>
    `);

    const input = document.getElementById('invoiceDepositInput');
    input?.addEventListener('input', () => refreshPreview(order));
    refreshPreview(order);

    document.getElementById('invoiceSaveSendBtn')?.addEventListener('click', () => {
      const data = refreshPreview(order);
      LumiereStore.saveOrderInvoice(order.id, {
        deposit: data.deposit,
        remaining: data.remaining,
        subtotal: data.subtotal,
        shipping: data.shipping,
        total: data.total,
        date: data.date,
        issuedAt: data.issuedAt,
        brand: data.brand
      }, { confirm: confirmStatus });

      const phone = toWhatsAppPhone(order.customerPhone);
      if (phone) {
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(invoiceWhatsAppText(data))}`;
        window.open(url, '_blank', 'noopener');
      } else {
        toast(LumiereI18n.t('admin_invoice_no_phone'));
      }

      toast(LumiereI18n.t('admin_invoice_saved'));
      if (typeof closeModal === 'function') closeModal();
      if (typeof renderOrders === 'function') renderOrders();
      if (typeof renderDashboard === 'function') renderDashboard();
    });

    document.getElementById('invoicePrintBtn')?.addEventListener('click', () => {
      refreshPreview(order);
      printInvoice();
    });
  }

  function printInvoice() {
    const doc = document.getElementById('invoiceDocument');
    if (!doc) return;
    const win = window.open('', '_blank', 'noopener,width=720,height=900');
    if (!win) {
      toast(LumiereI18n.t('admin_invoice_popup_blocked'));
      return;
    }
    win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${brandName()} — Invoice</title>
      <style>
        body{font-family:Cairo,Tahoma,sans-serif;padding:24px;color:#111;background:#fff}
        .inv-doc__brand{text-align:center;font-size:1.4rem;font-weight:700;margin-bottom:12px}
        .inv-doc__head{display:flex;justify-content:space-between;gap:12px;margin-bottom:18px;font-weight:600}
        .inv-doc__section{margin:18px 0}
        .inv-doc__section-title{display:flex;align-items:center;gap:8px;font-size:1rem;margin:0 0 10px}
        .inv-doc__bar{display:inline-block;width:4px;height:1.1em;background:#111}
        .inv-doc__table{width:100%;border-collapse:collapse;font-size:0.92rem}
        .inv-doc__table th,.inv-doc__table td{border:1px solid #ddd;padding:8px;text-align:center}
        .inv-doc__table th:first-child,.inv-doc__table td:first-child{text-align:right}
        .inv-doc__summary{text-align:center;line-height:1.9}
        .inv-doc__remain strong{color:#e53935}
        @media print{body{padding:0}}
      </style></head><body>${doc.outerHTML}<script>window.onload=()=>{window.print()}<\/script></body></html>`);
    win.document.close();
  }

  function viewSaved(orderId) {
    const order = LumiereStore.getAllOrders().find(o => o.id === orderId);
    if (!order?.invoice) {
      open(orderId, { confirmStatus: false });
      return;
    }
    open(orderId, { confirmStatus: false });
  }

  return { open, viewSaved, buildInvoiceData };
})();
