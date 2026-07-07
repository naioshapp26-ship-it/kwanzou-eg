const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '../js/i18n.js'), 'utf8');
const sandbox = {
  localStorage: { getItem: () => 'ar', setItem: () => {} },
  document: { documentElement: { lang: 'ar', dir: 'rtl', setAttribute: () => {} }, querySelectorAll: () => [] }
};
vm.runInNewContext(code, sandbox);
const LumiereI18n = sandbox.LumiereI18n;

const settings = {
  announcementLines: [
    { en: 'Line one EN', ar: 'جملة واحد' },
    { en: 'Line two EN', ar: 'جملة اتنين' }
  ]
};

const ar = LumiereI18n.announcementText(settings);
if (!ar.includes('جملة واحد') || !ar.includes('جملة اتنين')) {
  throw new Error(`Arabic merge failed: ${ar}`);
}

LumiereI18n.setLang('en');
const en = LumiereI18n.announcementText(settings);
if (!en.includes('Line one EN') || !en.includes('Line two EN')) {
  throw new Error(`English merge failed: ${en}`);
}

const legacy = LumiereI18n.normalizeAnnouncementLines({
  announcementEn: 'Legacy EN',
  announcementAr: 'قديم عربي'
});
if (legacy.length !== 1 || legacy[0].en !== 'Legacy EN') {
  throw new Error('Legacy migration failed');
}

console.log('ANNOUNCEMENT_UNIT_PASS');
