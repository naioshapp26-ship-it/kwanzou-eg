document.addEventListener('DOMContentLoaded', async () => {
  LumiereI18n.init();
  await LumiereStore.init();
  LumiereLayout.init('contact');
  LumiereI18n.applyTranslations();

  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          subject: fd.get('subject'),
          message: fd.get('message')
        })
      });
      const data = await res.json();
      if (!data.ok) {
        showToast(LumiereI18n.t('contact_error'));
        return;
      }
      showToast(LumiereI18n.t('contact_success'));
      form.reset();
    } catch {
      showToast(LumiereI18n.t('contact_error'));
    } finally {
      btn.disabled = false;
    }
  });

  window.addEventListener('lumiere:langchange', () => {
    LumiereI18n.applyTranslations();
    LumiereLayout.init('contact');
  });
});

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
