/**
 * Admin — shipping zones, fees & payment methods
 */
const AdminShipping = (() => {
  let draft = null;

  function cloneConfig() {
    const s = LumiereStore.get().settings || {};
    const base = typeof CheckoutShipping !== 'undefined' ? CheckoutShipping.DEFAULT_CONFIG : { freeThreshold: 1500, countries: [], paymentMethods: [] };
    const mergedPayments = typeof CheckoutShipping !== 'undefined'
      ? CheckoutShipping.getConfig().paymentMethods
      : (s.paymentMethods?.length ? s.paymentMethods : base.paymentMethods);
    return {
      freeThreshold: s.freeShippingThreshold ?? base.freeThreshold ?? 1500,
      countries: JSON.parse(JSON.stringify(s.shippingCountries?.length ? s.shippingCountries : base.countries)),
      paymentMethods: JSON.parse(JSON.stringify(mergedPayments))
    };
  }

  function ensureDraft() {
    if (!draft) draft = cloneConfig();
    return draft;
  }

  function resetDraft() {
    draft = cloneConfig();
    return draft;
  }

  function slugifyId(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function sym() {
    return LumiereStore.get().settings?.currencySymbol || 'ج.م';
  }

  function renderPaymentMethods() {
    const el = document.getElementById('shipPaymentMethods');
    if (!el) return;
    const cfg = ensureDraft();
    el.innerHTML = cfg.paymentMethods.map((m, idx) => `
      <label class="ship-pay-row">
        <input type="checkbox" data-pay-idx="${idx}" ${m.enabled ? 'checked' : ''} ${m.id === 'cod' ? '' : ''}>
        <span>
          <strong>${m.nameAr || m.nameEn}</strong>
          <small>${m.nameEn || ''} — <code>${m.id}</code></small>
        </span>
      </label>
    `).join('');
    el.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.onchange = () => {
        const i = Number(cb.dataset.payIdx);
        cfg.paymentMethods[i].enabled = cb.checked;
      };
    });
  }

  function renderCountries() {
    const el = document.getElementById('shipCountriesList');
    if (!el) return;
    const cfg = ensureDraft();
    if (!cfg.countries.length) {
      el.innerHTML = `<p class="admin-hint">${LumiereI18n.t('admin_shipping_empty')}</p>`;
      return;
    }
    el.innerHTML = cfg.countries.map((country, cIdx) => {
      const zones = (country.zones || []).map((z, zIdx) => `
        <tr>
          <td><code>${z.id}</code></td>
          <td>${z.nameAr || '—'}</td>
          <td>${z.nameEn || '—'}</td>
          <td><strong>${Number(z.fee || 0).toLocaleString()} ${sym()}</strong></td>
          <td class="table-actions">
            <button type="button" class="btn btn-sm btn-outline" data-edit-zone="${cIdx}-${zIdx}">${LumiereI18n.t('admin_edit')}</button>
            <button type="button" class="btn btn-sm btn-outline btn-danger-text" data-del-zone="${cIdx}-${zIdx}">${LumiereI18n.t('admin_delete')}</button>
          </td>
        </tr>
      `).join('');
      return `
        <div class="ship-country-card">
          <div class="ship-country-card__head">
            <div>
              <strong>${country.nameAr || country.nameEn}</strong>
              <small><code>${country.code}</code> — ${(country.zones || []).length} ${LumiereI18n.t('admin_shipping_zones')}</small>
            </div>
            <div class="table-actions__group">
              <button type="button" class="btn btn-sm btn-outline" data-edit-country="${cIdx}">${LumiereI18n.t('admin_edit')}</button>
              <button type="button" class="btn btn-sm btn-primary" data-add-zone="${cIdx}">+ ${LumiereI18n.t('admin_shipping_add_zone')}</button>
              <button type="button" class="btn btn-sm btn-outline btn-danger-text" data-del-country="${cIdx}">${LumiereI18n.t('admin_delete')}</button>
            </div>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table admin-table--compact">
              <thead><tr>
                <th>ID</th>
                <th data-i18n="admin_name_ar">Arabic</th>
                <th data-i18n="admin_name_en">English</th>
                <th data-i18n="admin_shipping_fee">Fee</th>
                <th data-i18n="admin_actions">Actions</th>
              </tr></thead>
              <tbody>${zones || `<tr><td colspan="5">${LumiereI18n.t('admin_shipping_no_zones')}</td></tr>`}</tbody>
            </table>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('[data-add-zone]').forEach(btn => {
      btn.onclick = () => openZoneModal(Number(btn.dataset.addZone));
    });
    el.querySelectorAll('[data-edit-zone]').forEach(btn => {
      const [c, z] = btn.dataset.editZone.split('-').map(Number);
      btn.onclick = () => openZoneModal(c, z);
    });
    el.querySelectorAll('[data-del-zone]').forEach(btn => {
      const [c, z] = btn.dataset.delZone.split('-').map(Number);
      btn.onclick = () => {
        if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
        ensureDraft().countries[c].zones.splice(z, 1);
        renderCountries();
      };
    });
    el.querySelectorAll('[data-edit-country]').forEach(btn => {
      btn.onclick = () => openCountryModal(Number(btn.dataset.editCountry));
    });
    el.querySelectorAll('[data-del-country]').forEach(btn => {
      btn.onclick = () => {
        if (!confirm(LumiereI18n.t('admin_confirm_delete'))) return;
        ensureDraft().countries.splice(Number(btn.dataset.delCountry), 1);
        renderCountries();
      };
    });
    LumiereI18n.applyTranslations();
  }

  function openCountryModal(cIdx = null) {
    const cfg = ensureDraft();
    const country = cIdx != null ? cfg.countries[cIdx] : { code: '', nameAr: '', nameEn: '', zones: [] };
    showModal(cIdx != null ? LumiereI18n.t('admin_edit') : LumiereI18n.t('admin_shipping_add_country'), `
      <form id="shipCountryForm" class="admin-form">
        <div class="form-row">
          <div class="form-group"><label>Code</label><input name="code" value="${country.code || ''}" required placeholder="EG" maxlength="12"></div>
          <div class="form-group"><label>${LumiereI18n.t('admin_name_ar')}</label><input name="nameAr" value="${country.nameAr || ''}" required></div>
        </div>
        <div class="form-group"><label>${LumiereI18n.t('admin_name_en')}</label><input name="nameEn" value="${country.nameEn || ''}" required></div>
        <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
      </form>
    `);
    document.getElementById('shipCountryForm').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const code = String(fd.get('code') || '').trim().toUpperCase();
      const entry = {
        code,
        nameAr: String(fd.get('nameAr') || '').trim(),
        nameEn: String(fd.get('nameEn') || '').trim(),
        zones: country.zones || []
      };
      if (!entry.nameAr || !entry.nameEn) return;
      const dup = cfg.countries.some((c, i) => c.code === code && i !== cIdx);
      if (dup) {
        toast(LumiereI18n.t('admin_shipping_country_dup'));
        return;
      }
      if (cIdx != null) cfg.countries[cIdx] = entry;
      else cfg.countries.push(entry);
      closeModal();
      renderCountries();
    };
  }

  function openZoneModal(cIdx, zIdx = null) {
    const cfg = ensureDraft();
    const country = cfg.countries[cIdx];
    if (!country) return;
    country.zones = country.zones || [];
    const zone = zIdx != null ? country.zones[zIdx] : { id: '', nameAr: '', nameEn: '', fee: 50 };
    showModal(
      `${LumiereI18n.t('admin_shipping_zone')} — ${country.nameAr || country.nameEn}`,
      `
      <form id="shipZoneForm" class="admin-form">
        <div class="form-row">
          <div class="form-group"><label>ID</label><input name="id" value="${zone.id || ''}" required pattern="[a-z0-9-]+" placeholder="cairo"></div>
          <div class="form-group"><label>${LumiereI18n.t('admin_shipping_fee')}</label><input name="fee" type="number" min="0" step="1" value="${zone.fee ?? 50}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${LumiereI18n.t('admin_name_ar')}</label><input name="nameAr" value="${zone.nameAr || ''}" required></div>
          <div class="form-group"><label>${LumiereI18n.t('admin_name_en')}</label><input name="nameEn" value="${zone.nameEn || ''}" required></div>
        </div>
        <button type="submit" class="btn btn-primary">${LumiereI18n.t('admin_save')}</button>
      </form>
    `
    );
    document.getElementById('shipZoneForm').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const id = slugifyId(fd.get('id') || fd.get('nameEn'));
      if (!id) {
        toast(LumiereI18n.t('admin_slug_invalid'));
        return;
      }
      const entry = {
        id,
        nameAr: String(fd.get('nameAr') || '').trim(),
        nameEn: String(fd.get('nameEn') || '').trim(),
        fee: Number(fd.get('fee') || 0)
      };
      const dup = country.zones.some((z, i) => z.id === id && i !== zIdx);
      if (dup) {
        toast(LumiereI18n.t('admin_slug_duplicate'));
        return;
      }
      if (zIdx != null) country.zones[zIdx] = entry;
      else country.zones.push(entry);
      closeModal();
      renderCountries();
    };
  }

  function render() {
    resetDraft();
    const threshold = document.getElementById('shipFreeThreshold');
    if (threshold) threshold.value = draft.freeThreshold;
    renderPaymentMethods();
    renderCountries();
  }

  async function save() {
    const cfg = ensureDraft();
    const threshold = Number(document.getElementById('shipFreeThreshold')?.value || cfg.freeThreshold);
    LumiereStore.update(data => {
      data.settings.freeShippingThreshold = threshold;
      data.settings.shippingCountries = JSON.parse(JSON.stringify(cfg.countries));
      data.settings.paymentMethods = JSON.parse(JSON.stringify(cfg.paymentMethods));
    });
    const ok = await persistAfterSave();
    if (ok) {
      resetDraft();
      render();
    }
    return ok;
  }

  function init() {
    document.getElementById('shippingSaveBtn')?.addEventListener('click', () => save());
    document.getElementById('shippingResetBtn')?.addEventListener('click', () => {
      if (!confirm(LumiereI18n.t('admin_shipping_reset_confirm'))) return;
      LumiereStore.update(data => {
        const base = CheckoutShipping.DEFAULT_CONFIG;
        data.settings.freeShippingThreshold = base.freeThreshold;
        data.settings.shippingCountries = JSON.parse(JSON.stringify(base.countries));
        data.settings.paymentMethods = JSON.parse(JSON.stringify(base.paymentMethods));
      });
      persistAfterSave().then(ok => { if (ok) render(); });
    });
    document.getElementById('addShipCountryBtn')?.addEventListener('click', () => openCountryModal());
    document.getElementById('shipFreeThreshold')?.addEventListener('input', e => {
      ensureDraft().freeThreshold = Number(e.target.value || 0);
    });
  }

  return { render, init, save };
})();
