/**
 * Admin image helpers — compress, preview, upload binding
 */
const AdminMedia = (() => {
  const MAX_BYTES = 900000;

  function compressDataUrl(dataUrl, maxW = 1400, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        let q = quality;
        let out = canvas.toDataURL('image/jpeg', q);
        while (out.length > MAX_BYTES && q > 0.45) {
          q -= 0.08;
          out = canvas.toDataURL('image/jpeg', q);
        }
        resolve(out);
      };
      img.onerror = () => reject(new Error('image load failed'));
      img.src = dataUrl;
    });
  }

  async function readFile(file) {
    const raw = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return compressDataUrl(raw);
  }

  function setPreview(previewEl, src) {
    if (!previewEl) return;
    if (src) {
      previewEl.src = src;
      previewEl.hidden = false;
    } else {
      previewEl.removeAttribute('src');
      previewEl.hidden = true;
    }
  }

  function bindSlot({ urlInput, previewEl, fileInput, clearBtn, onChange }) {
    if (!urlInput || !fileInput) return;

    urlInput.type = 'text';

    const apply = src => {
      urlInput.value = src || '';
      setPreview(previewEl, src);
      onChange?.(src);
    };

    urlInput.addEventListener('input', () => {
      const v = urlInput.value.trim();
      setPreview(previewEl, v);
      onChange?.(v);
    });

    fileInput.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toastMsg?.(LumiereI18n.t('admin_image_invalid'));
        return;
      }
      try {
        const dataUrl = await readFile(file);
        apply(dataUrl);
      } catch (_) {
        toastMsg?.(LumiereI18n.t('admin_image_upload_failed'));
      }
    });

    clearBtn?.addEventListener('click', () => apply(''));
  }

  let toastMsg = null;

  function init(root = document, toastFn) {
    toastMsg = toastFn;
    root.querySelectorAll('[data-image-slot]').forEach(slot => {
      bindSlot({
        urlInput: slot.querySelector('[data-image-url]'),
        previewEl: slot.querySelector('[data-image-preview]'),
        fileInput: slot.querySelector('[data-image-file]'),
        clearBtn: slot.querySelector('[data-image-clear]')
      });
    });
  }

  function bindModalForm(root, toastFn) {
    toastMsg = toastFn;
    root.querySelectorAll('.image-upload-group').forEach(group => {
      const urlInput = group.querySelector('[name="image"], [name="avatar"]');
      const previewEl = group.querySelector('.image-preview');
      const fileInput = group.querySelector('.image-file-input');
      if (!urlInput || !fileInput) return;

      urlInput.type = 'text';
      const fieldName = urlInput.name;

      fileInput.addEventListener('change', async e => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
          const dataUrl = await readFile(file);
          urlInput.value = dataUrl;
          setPreview(previewEl, dataUrl);
        } catch (_) {
          toastFn?.(LumiereI18n.t('admin_image_upload_failed'));
        }
      });

      urlInput.addEventListener('input', () => {
        setPreview(previewEl, urlInput.value.trim());
      });

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'btn btn-sm btn-outline image-clear-btn';
      clearBtn.textContent = LumiereI18n.t('admin_remove_image');
      clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        setPreview(previewEl, '');
      });
      if (!group.querySelector('.image-clear-btn')) {
        fileInput.insertAdjacentElement('afterend', clearBtn);
      }
    });
  }

  function galleryHTML(images = [], options = {}) {
    const galleryId = options.galleryId || 'productGallery';
    const addBtnId = options.addBtnId || 'addGalleryImage';
    const list = (images.length ? images : ['']).map((src, i) => `
      <div class="gallery-item" data-index="${i}">
        <img class="image-preview gallery-preview" src="${src ? escapeAttr(src) : ''}" alt="" ${src ? '' : 'hidden'}>
        <input type="text" name="gallery_${i}" value="${src && !String(src).startsWith('data:') ? escapeAttr(src) : (src || '')}" placeholder="https://..." class="gallery-url">
        <div class="image-upload-actions">
          <label class="btn btn-sm btn-outline image-upload-btn">
            ${LumiereI18n.t('admin_upload_image')}
            <input type="file" accept="image/*" hidden class="gallery-file">
          </label>
          <button type="button" class="btn btn-sm btn-outline image-clear-btn gallery-clear">${LumiereI18n.t('admin_remove_image')}</button>
        </div>
      </div>
    `).join('');
    return `<div class="product-gallery" id="${galleryId}">${list}</div>
      <button type="button" class="btn btn-sm btn-outline" id="${addBtnId}">${LumiereI18n.t('admin_add_image')}</button>`;
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function bindGallery(root, toastFn, options = {}) {
    const galleryId = options.galleryId || 'productGallery';
    const addBtnId = options.addBtnId || 'addGalleryImage';
    const wrap = root.querySelector(`#${galleryId}`);
    if (!wrap) return;

    const bindItem = item => {
      const preview = item.querySelector('.gallery-preview');
      const urlInput = item.querySelector('.gallery-url');
      const fileInput = item.querySelector('.gallery-file');
      urlInput?.addEventListener('input', () => setPreview(preview, urlInput.value.trim()));
      item.querySelector('.gallery-clear')?.addEventListener('click', () => {
        urlInput.value = '';
        setPreview(preview, '');
      });
      fileInput?.addEventListener('change', async e => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
          const dataUrl = await readFile(file);
          urlInput.value = dataUrl;
          setPreview(preview, dataUrl);
        } catch (_) {
          toastFn?.(LumiereI18n.t('admin_image_upload_failed'));
        }
      });
    };

    wrap.querySelectorAll('.gallery-item').forEach(bindItem);

    root.querySelector(`#${addBtnId}`)?.addEventListener('click', () => {
      const idx = wrap.querySelectorAll('.gallery-item').length;
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.dataset.index = idx;
      div.innerHTML = `
        <img class="image-preview gallery-preview" alt="" hidden>
        <input type="text" name="gallery_${idx}" placeholder="https://..." class="gallery-url">
        <div class="image-upload-actions">
          <label class="btn btn-sm btn-outline image-upload-btn">${LumiereI18n.t('admin_upload_image')}<input type="file" accept="image/*" hidden class="gallery-file"></label>
          <button type="button" class="btn btn-sm btn-outline image-clear-btn gallery-clear">${LumiereI18n.t('admin_remove_image')}</button>
          <button type="button" class="btn btn-sm btn-outline gallery-remove">${LumiereI18n.t('admin_delete')}</button>
        </div>`;
      wrap.appendChild(div);
      bindItem(div);
      div.querySelector('.gallery-remove')?.addEventListener('click', () => div.remove());
    });

    wrap.querySelectorAll('.gallery-remove').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.gallery-item')?.remove());
    });
  }

  function collectGallery(root, galleryId = 'productGallery') {
    const scope = root.querySelector?.(`#${galleryId}`) || root;
    return [...scope.querySelectorAll('.gallery-url')]
      .map(i => i.value.trim())
      .filter(Boolean);
  }

  return { init, bindModalForm, bindGallery, galleryHTML, collectGallery, setPreview, readFile };
})();
