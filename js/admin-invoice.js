/**
 * Admin — deposit confirmation invoice (Care-style)
 * Fully editable receipt → save to store (await sync) → WhatsApp to customer.
 */
const AdminInvoice = (() => {
  let _draft = null;

  function brandName() {
    const s = LumiereStore.get()?.settings || {};
    return s.brandName || s.brand || 'Kwanzou EG';
  }

  function sym() {
    return LumiereStore.get()?.settings?.currencySymbol || 'ج.م';
  }

  function formatInvoiceDate(order) {
    if (order.invoice?.date) return order.invoice.date;
    const raw = order.createdAt || order.date;
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
    if (order.invoice?.orderNum) return String(order.invoice.orderNum);
    const id = String(order.id || '');
    const m = id.match(/(\d+)/);
    return m ? m[1] : id.replace(/^ORD-?/i, '') || id;
  }

  function fullAddress(order) {
    if (order.invoice?.address) return order.invoice.address;
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

  function num(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function initDraft(order) {
    const inv = order.invoice || {};
    const itemsSrc = Array.isArray(inv.items) && inv.items.length
      ? inv.items
      : (order.items || []);
    const items = itemsSrc.map(i => ({
      name: i.name || '',
      qty: num(i.qty, 1),
      price: num(i.price, 0)
    }));
    if (!items.length) items.push({ name: '', qty: 1, price: 0 });

    const subtotal = inv.subtotal != null
      ? num(inv.subtotal)
      : items.reduce((s, i) => s + i.qty * i.price, 0);
    const shipping = inv.shipping != null ? num(inv.shipping) : num(order.shippingFee);
    const total = inv.total != null ? num(inv.total) : num(order.total, subtotal + shipping);
    let deposit = inv.deposit != null ? num(inv.deposit) : (shipping || 0);
    if (deposit < 0) deposit = 0;
    const remaining = Math.max(0, total - deposit);

    return {
      brand: inv.brand || brandName(),
      orderId: order.id,
      orderNum: orderNum(order),
      date: formatInvoiceDate(order),
      customerName: inv.customerName != null ? inv.customerName : (order.customerName || ''),
      address: fullAddress(order),
      phone: inv.phone != null ? inv.phone : (order.customerPhone || ''),
      phone2: inv.phone2 != null ? inv.phone2 : (order.customerPhone2 || ''),
      items,
      subtotal,
      shipping,
      total,
      deposit,
      remaining,
      issuedAt: inv.issuedAt || null
    };
  }

  function recalcDraft(d) {
    d.items = (d.items || []).map(i => ({
      name: String(i.name || ''),
      qty: Math.max(1, num(i.qty, 1)),
      price: Math.max(0, num(i.price, 0)),
      lineTotal: Math.max(1, num(i.qty, 1)) * Math.max(0, num(i.price, 0))
    }));
    const itemsSum = d.items.reduce((s, i) => s + i.lineTotal, 0);
    // Keep subtotal editable but default sync from items when user edits qty/price
    d.subtotal = num(d.subtotal, itemsSum);
    d.shipping = Math.max(0, num(d.shipping));
    d.total = Math.max(0, num(d.total, d.subtotal + d.shipping));
    d.deposit = Math.max(0, num(d.deposit));
    if (d.deposit > d.total) d.deposit = d.total;
    d.remaining = Math.max(0, d.total - d.deposit);
    return d;
  }

  function readFormIntoDraft() {
    if (!_draft) return null;
    const root = document.getElementById('invoiceEditorForm');
    if (!root) return _draft;

    _draft.brand = root.querySelector('[name="brand"]')?.value?.trim() || brandName();
    _draft.orderNum = root.querySelector('[name="orderNum"]')?.value?.trim() || _draft.orderNum;
    _draft.date = root.querySelector('[name="date"]')?.value?.trim() || _draft.date;
    _draft.customerName = root.querySelector('[name="customerName"]')?.value?.trim() || '';
    _draft.address = root.querySelector('[name="address"]')?.value?.trim() || '';
    _draft.phone = root.querySelector('[name="phone"]')?.value?.trim() || '';
    _draft.phone2 = root.querySelector('[name="phone2"]')?.value?.trim() || '';
    _draft.subtotal = num(root.querySelector('[name="subtotal"]')?.value, _draft.subtotal);
    _draft.shipping = num(root.querySelector('[name="shipping"]')?.value, _draft.shipping);
    _draft.total = num(root.querySelector('[name="total"]')?.value, _draft.total);
    _draft.deposit = num(root.querySelector('[name="deposit"]')?.value, _draft.deposit);

    const rows = [...root.querySelectorAll('[data-item-row]')];
    _draft.items = rows.map(row => ({
      name: row.querySelector('[name="itemName"]')?.value || '',
      qty: num(row.querySelector('[name="itemQty"]')?.value, 1),
      price: num(row.querySelector('[name="itemPrice"]')?.value, 0)
    }));

    return recalcDraft(_draft);
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
      lines.push(`• ${i.name} | كمية ${i.qty} | سعر ${money(i.price)} | إجمالي ${money(i.qty * i.price)}`);
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

  function printDocumentHTML(data) {
    const rows = data.items.map(i => `
      <tr>
        <td>${escapeHtml(i.name)}</td>
        <td>${i.qty}</td>
        <td>${money(i.price)}</td>
        <td>${money(i.qty * i.price)}</td>
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
            <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
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

  function editorHTML(d) {
    const itemRows = d.items.map((i, idx) => `
      <tr data-item-row data-idx="${idx}">
        <td><input type="text" name="itemName" value="${escapeHtml(i.name)}"></td>
        <td><input type="number" name="itemQty" min="1" step="1" value="${i.qty}"></td>
        <td><input type="number" name="itemPrice" min="0" step="1" value="${i.price}"></td>
        <td class="inv-line-total">${money(i.qty * i.price)}</td>
        <td><button type="button" class="btn-icon btn-icon--danger inv-remove-item" title="حذف">×</button></td>
      </tr>`).join('');

    return `
      <form class="inv-editor" id="invoiceEditorForm" novalidate>
        <p class="inv-editor__hint">${LumiereI18n.t('admin_invoice_hint')}</p>

        <div class="inv-doc inv-doc--editable" dir="rtl">
          <div class="form-group inv-doc__brand-field">
            <input type="text" name="brand" class="inv-input inv-input--brand" value="${escapeHtml(d.brand)}" placeholder="اسم البراند">
          </div>

          <div class="inv-doc__head inv-doc__head--edit">
            <label class="inv-inline">فاتورة طلب #
              <input type="text" name="orderNum" value="${escapeHtml(d.orderNum)}">
            </label>
            <label class="inv-inline">التاريخ:
              <input type="text" name="date" value="${escapeHtml(d.date)}" placeholder="DD-MM-YYYY">
            </label>
          </div>

          <div class="inv-doc__section">
            <h4 class="inv-doc__section-title"><span class="inv-doc__bar"></span> بيانات العميل</h4>
            <div class="form-group"><label>الاسم</label><input type="text" name="customerName" value="${escapeHtml(d.customerName)}"></div>
            <div class="form-group"><label>العنوان</label><textarea name="address" rows="2">${escapeHtml(d.address)}</textarea></div>
            <div class="form-row form-row--2">
              <div class="form-group"><label>الموبايل</label><input type="tel" name="phone" value="${escapeHtml(d.phone)}"></div>
              <div class="form-group"><label>الموبايل الإضافي</label><input type="tel" name="phone2" value="${escapeHtml(d.phone2)}"></div>
            </div>
          </div>

          <div class="inv-doc__section">
            <h4 class="inv-doc__section-title"><span class="inv-doc__bar"></span> تفاصيل الطلب</h4>
            <div class="inv-table-wrap">
              <table class="inv-doc__table inv-doc__table--edit">
                <thead>
                  <tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th></th></tr>
                </thead>
                <tbody id="invoiceItemsBody">${itemRows}</tbody>
              </table>
            </div>
            <button type="button" class="btn btn-sm btn-outline" id="invoiceAddItemBtn">+ منتج</button>
          </div>

          <div class="inv-doc__section inv-doc__section--summary">
            <h4 class="inv-doc__section-title"><span class="inv-doc__bar"></span> الملخص المالي</h4>
            <div class="inv-summary-edit">
              <div class="form-group"><label>الأوردر</label><input type="number" name="subtotal" min="0" step="1" value="${d.subtotal}"></div>
              <div class="form-group"><label>الشحن</label><input type="number" name="shipping" min="0" step="1" value="${d.shipping}"></div>
              <div class="form-group"><label>الإجمالي</label><input type="number" name="total" min="0" step="1" value="${d.total}"></div>
              <div class="form-group"><label>الديبوزيت</label><input type="number" name="deposit" min="0" step="1" value="${d.deposit}"></div>
              <p class="inv-remain-line">${LumiereI18n.t('admin_invoice_remaining')}: <strong class="inv-remain-num" id="invoiceRemainValue">${money(d.remaining)}</strong> ${sym()}</p>
            </div>
          </div>
        </div>

        <div class="inv-editor__actions">
          <button type="button" class="btn btn-primary" id="invoiceSaveSendBtn">${LumiereI18n.t('admin_invoice_save_send')}</button>
          <button type="button" class="btn btn-outline" id="invoiceSaveOnlyBtn">${LumiereI18n.t('admin_invoice_save_only')}</button>
          <button type="button" class="btn btn-outline" id="invoicePrintBtn">${LumiereI18n.t('admin_invoice_print')}</button>
        </div>
      </form>`;
  }

  function syncItemsSumToSubtotal(fromItemEdit) {
    const d = readFormIntoDraft();
    if (!d) return;
    if (fromItemEdit) {
      d.subtotal = d.items.reduce((s, i) => s + i.qty * i.price, 0);
      d.total = d.subtotal + d.shipping;
      if (d.deposit > d.total) d.deposit = d.total;
      d.remaining = Math.max(0, d.total - d.deposit);
      const form = document.getElementById('invoiceEditorForm');
      if (form) {
        const sub = form.querySelector('[name="subtotal"]');
        const tot = form.querySelector('[name="total"]');
        const dep = form.querySelector('[name="deposit"]');
        if (sub) sub.value = d.subtotal;
        if (tot) tot.value = d.total;
        if (dep) dep.value = d.deposit;
      }
    }
    updateLineTotalsAndRemain();
  }

  function updateLineTotalsAndRemain() {
    const d = readFormIntoDraft();
    if (!d) return;
    const form = document.getElementById('invoiceEditorForm');
    form?.querySelectorAll('[data-item-row]').forEach((row, idx) => {
      const item = d.items[idx];
      const cell = row.querySelector('.inv-line-total');
      if (cell && item) cell.textContent = money(item.qty * item.price);
    });
    const remain = document.getElementById('invoiceRemainValue');
    if (remain) remain.textContent = money(d.remaining);
  }

  function bindEditor(order, confirmStatus) {
    const form = document.getElementById('invoiceEditorForm');
    if (!form) return;

    form.addEventListener('input', e => {
      const t = e.target;
      if (!t) return;
      const fromItem = t.name === 'itemName' || t.name === 'itemQty' || t.name === 'itemPrice';
      const fromMoney = t.name === 'subtotal' || t.name === 'shipping' || t.name === 'total' || t.name === 'deposit';
      if (fromItem) syncItemsSumToSubtotal(true);
      else if (fromMoney) {
        if (t.name === 'subtotal' || t.name === 'shipping') {
          const d = readFormIntoDraft();
          d.total = d.subtotal + d.shipping;
          const tot = form.querySelector('[name="total"]');
          if (tot) tot.value = d.total;
        }
        updateLineTotalsAndRemain();
      }
    });

    form.querySelector('#invoiceAddItemBtn')?.addEventListener('click', () => {
      readFormIntoDraft();
      _draft.items.push({ name: '', qty: 1, price: 0 });
      rerenderEditor(order, confirmStatus);
    });

    form.querySelectorAll('.inv-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('[data-item-row]');
        const idx = Number(row?.dataset.idx);
        readFormIntoDraft();
        if (_draft.items.length <= 1) return;
        _draft.items.splice(idx, 1);
        syncItemsSumToSubtotal(true);
        rerenderEditor(order, confirmStatus);
      });
    });

    form.querySelector('#invoiceSaveSendBtn')?.addEventListener('click', () => persist(order, confirmStatus, true));
    form.querySelector('#invoiceSaveOnlyBtn')?.addEventListener('click', () => persist(order, confirmStatus, false));
    form.querySelector('#invoicePrintBtn')?.addEventListener('click', () => {
      const data = readFormIntoDraft();
      printInvoice(data);
    });
  }

  function rerenderEditor(order, confirmStatus) {
    recalcDraft(_draft);
    const body = document.getElementById('modalBody');
    if (!body) return;
    body.innerHTML = editorHTML(_draft);
    bindEditor(order, confirmStatus);
  }

  async function persist(order, confirmStatus, sendWhatsApp) {
    const data = readFormIntoDraft();
    if (!data) return;
    if (!data.customerName.trim()) {
      toast(LumiereI18n.t('checkout_name_required'));
      return;
    }

    const btn = document.getElementById('invoiceSaveSendBtn');
    const btn2 = document.getElementById('invoiceSaveOnlyBtn');
    if (btn) btn.disabled = true;
    if (btn2) btn2.disabled = true;

    const payload = {
      brand: data.brand,
      orderNum: data.orderNum,
      date: data.date,
      customerName: data.customerName,
      address: data.address,
      phone: data.phone,
      phone2: data.phone2,
      items: data.items.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        lineTotal: i.qty * i.price
      })),
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      deposit: data.deposit,
      remaining: data.remaining,
      issuedAt: new Date().toISOString()
    };

    try {
      const ok = await LumiereStore.saveOrderInvoice(order.id, payload, { confirm: confirmStatus });
      if (!ok) {
        const detail = LumiereStore.getLastSyncError?.();
        toast(detail
          ? `${LumiereI18n.t('admin_save_failed')} (${detail})`
          : LumiereI18n.t('admin_save_failed'));
        return;
      }

      toast(LumiereI18n.t('admin_invoice_saved'));

      if (sendWhatsApp) {
        const phone = toWhatsAppPhone(data.phone || order.customerPhone);
        if (phone) {
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(invoiceWhatsAppText(data))}`, '_blank', 'noopener');
        } else {
          toast(LumiereI18n.t('admin_invoice_no_phone'));
        }
      }

      if (typeof closeModal === 'function') closeModal();
      if (typeof renderOrders === 'function') renderOrders();
      if (typeof renderDashboard === 'function') renderDashboard();
    } catch (err) {
      toast(LumiereI18n.t('admin_save_failed'));
    } finally {
      if (btn) btn.disabled = false;
      if (btn2) btn2.disabled = false;
    }
  }

  function printInvoice(data) {
    const html = printDocumentHTML(data || _draft);
    const win = window.open('', '_blank', 'noopener,width=720,height=900');
    if (!win) {
      toast(LumiereI18n.t('admin_invoice_popup_blocked'));
      return;
    }
    win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${escapeHtml((data || _draft).brand)} — Invoice</title>
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
      </style></head><body>${html}<script>window.onload=()=>{window.print()}<\/script></body></html>`);
    win.document.close();
  }

  function open(orderId, opts = {}) {
    const order = LumiereStore.getAllOrders().find(o => o.id === orderId);
    if (!order) return;
    const confirmStatus = opts.confirmStatus !== false;
    _draft = initDraft(order);
    recalcDraft(_draft);
    showModal(LumiereI18n.t('admin_invoice_title'), editorHTML(_draft));
    bindEditor(order, confirmStatus);
  }

  function viewSaved(orderId) {
    open(orderId, { confirmStatus: false });
  }

  function buildInvoiceData(order, depositInput) {
    const d = initDraft(order);
    if (depositInput != null) d.deposit = num(depositInput, d.deposit);
    return recalcDraft(d);
  }

  return { open, viewSaved, buildInvoiceData };
})();
