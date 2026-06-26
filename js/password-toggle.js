/**
 * Show/hide password toggle for .password-field wrappers
 */
const PasswordToggle = (() => {
  const EYE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  function wrapInput(input) {
    if (!input || input.closest('.password-field')) return;
    const wrap = document.createElement('div');
    wrap.className = 'password-field';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'password-toggle';
    btn.innerHTML = EYE;
    btn.setAttribute('aria-label', 'Show password');
    wrap.appendChild(btn);
    bind(wrap);
  }

  function bind(wrap) {
    const input = wrap.querySelector('input');
    const btn = wrap.querySelector('.password-toggle');
    if (!input || !btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show ? EYE_OFF : EYE;
      btn.classList.toggle('is-visible', show);
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  function init(root = document) {
    root.querySelectorAll('.password-field').forEach(bind);
    root.querySelectorAll('input[type="password"]').forEach(input => {
      if (!input.closest('.password-field')) wrapInput(input);
    });
  }

  return { init };
})();
