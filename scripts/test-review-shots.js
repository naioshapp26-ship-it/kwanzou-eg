/* Lightweight DOM mock to exercise renderReviewScreenshots + lightbox binding from js/home.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeEl(id) {
  const listeners = {};
  return {
    id,
    _html: '',
    hidden: false,
    dataset: {},
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);} },
    style: {},
    set innerHTML(v){ this._html = v; },
    get innerHTML(){ return this._html; },
    addEventListener(ev, fn){ (listeners[ev] = listeners[ev] || []).push(fn); },
    querySelectorAll(sel){
      if (sel === '.review-shot') {
        const count = (this._html.match(/class="review-shot/g) || []).length;
        return Array.from({ length: count }, (_, i) => ({
          dataset: { shotIndex: String(i) },
          addEventListener(){}
        }));
      }
      return [];
    },
    _listeners: listeners
  };
}

const els = {
  reviewShotsGrid: makeEl('reviewShotsGrid'),
  testimonials: makeEl('testimonials'),
  reviewLightbox: makeEl('reviewLightbox'),
  reviewLightboxImg: makeEl('reviewLightboxImg'),
  reviewLightboxClose: makeEl('reviewLightboxClose'),
  reviewLightboxNext: makeEl('reviewLightboxNext'),
  reviewLightboxPrev: makeEl('reviewLightboxPrev'),
  testimonialsGrid: makeEl('testimonialsGrid')
};

const document = {
  getElementById: id => els[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: { style: {} }
};

const sandbox = { document, window: {}, console, IntersectionObserver: function(){ this.observe = () => {}; } };
sandbox.window = sandbox;

const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'home.js'), 'utf8');
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

function assert(cond, msg){ if(!cond){ console.error('FAIL:', msg); process.exitCode = 1; } else { console.log('ok:', msg); } }

// Case 1: no screenshots -> grid hidden, empty
sandbox.renderReviewScreenshots([]);
assert(els.reviewShotsGrid.hidden === true, 'empty list hides grid');
assert(els.reviewShotsGrid.innerHTML === '', 'empty list clears html');

// Case 2: screenshots -> renders buttons + images, unhides, adds section class
sandbox.renderReviewScreenshots([
  { id: 'rs-1', image: '/api/media/abc' },
  { id: 'rs-2', image: 'https://example.com/x.png' },
  'https://example.com/y.png'
]);
assert(els.reviewShotsGrid.hidden === false, 'non-empty list shows grid');
const btnCount = (els.reviewShotsGrid.innerHTML.match(/class="review-shot/g) || []).length;
assert(btnCount === 3, 'renders 3 review-shot buttons (string + objects), got ' + btnCount);
assert(els.reviewShotsGrid.innerHTML.includes('/api/media/abc'), 'includes media ref src');
assert(els.testimonials.classList.contains('testimonials--shots'), 'adds testimonials--shots class');

// Case 3: filters out entries without image
sandbox.renderReviewScreenshots([{ id: 'x' }, { image: '' }, { image: 'https://ok/z.png' }]);
const btnCount2 = (els.reviewShotsGrid.innerHTML.match(/class="review-shot/g) || []).length;
assert(btnCount2 === 1, 'filters entries without image, got ' + btnCount2);

console.log(process.exitCode ? '\nSOME TESTS FAILED' : '\nALL TESTS PASSED');
