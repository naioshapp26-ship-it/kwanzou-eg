const fs = require('fs');
const path = require('path');
const vm = require('vm');

let code = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
code = code.replace('const LumiereI18n =', 'var LumiereI18n =');
let langStore = 'ar';
const sandbox = {
  localStorage: {
    getItem: k => (k === 'lumiere_lang' ? langStore : null),
    setItem: (k, v) => { if (k === 'lumiere_lang') langStore = v; }
  },
  document: { documentElement: { lang: 'ar', dir: 'rtl', setAttribute: () => {} }, querySelectorAll: () => [] },
  CustomEvent: class CustomEvent { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } },
  window: null
};
sandbox.window = { dispatchEvent: () => {}, addEventListener: () => {} };
vm.runInNewContext(code, sandbox);

const settings = {
  announcementLines: [
    { en: 'Line one EN', ar: 'جملة واحد' },
    { en: 'Line two EN', ar: 'جملة اتنين' }
  ]
};

const ar = sandbox.LumiereI18n.announcementText(settings);
if (!ar.includes('جملة واحد') || !ar.includes('جملة اتنين')) {
  throw new Error(`Arabic merge failed: ${ar}`);
}

sandbox.LumiereI18n.setLang('en');
const en = sandbox.LumiereI18n.announcementText(settings);
if (!en.includes('Line one EN') || !en.includes('Line two EN')) {
  throw new Error(`English merge failed: ${en}`);
}

const legacy = sandbox.LumiereI18n.normalizeAnnouncementLines({
  announcementEn: 'Legacy EN',
  announcementAr: 'قديم عربي'
});
if (legacy.length !== 1 || legacy[0].en !== 'Legacy EN') {
  throw new Error('Legacy migration failed');
}

console.log('ANNOUNCEMENT_UNIT_PASS');
