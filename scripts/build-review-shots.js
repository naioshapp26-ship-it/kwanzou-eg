const fs = require('fs');
const path = require('path');

// Arabic via Unicode escapes so the file encoding stays ASCII-safe on Windows shells.
const ar = {
  c1a: '\u0627\u0644\u0633\u0644\u0633\u0644\u0629 \u0648\u0635\u0644\u062A \u0648\u0627\u0644\u0646\u062D\u0627\u0633',
  c1b: '\u062A\u062D\u0641\u0629 \u0623\u0648\u064A \u0648\u0627\u0644\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629',
  c1c: '\u0634\u0643\u0631\u0627\u064B \u062C\u062F\u0627\u064B',
  r1a: '\u0646\u0648\u0631\u062A\u064A\u0646\u0627 \u064A\u0627 \u0642\u0645\u0631',
  r1b: '\u0641\u0631\u062D\u064A\u0646 \u062C\u062F\u0627\u064B \u0625\u0646\u0643 \u0639\u062C\u0628\u062A\u0643',

  c2a: '\u0627\u0644\u062E\u0627\u062A\u0645 \u0634\u0643\u0644\u0647 \u0634\u064A\u0643 \u062C\u062F\u0627\u064B',
  c2b: '\u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0641\u062E\u0645 \u0623\u0648\u064A',
  c2c: '\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0643\u0627\u0646 \u0633\u0631\u064A\u0639',
  r2a: '\u062A\u0633\u0644\u0645\u0649 \u064A\u0627 \u062C\u0645\u0627\u0644\u0643',
  r2b: '\u0645\u0633\u062A\u0646\u064A\u064A\u0646 \u0637\u0644\u0628\u0643 \u0627\u0644\u062C\u0627\u064A',

  c3a: '\u0627\u0644\u062D\u0644\u0642\u0627\u0646 \u0627\u0644\u0627\u0633\u062A\u0627\u0644\u0633',
  c3b: '\u0645\u0627 \u0628\u064A\u0635\u062F\u0648\u0634 \u062E\u0627\u0644\u0635',
  c3c: '\u0648\u0644\u0627\u0628\u0633\u0627\u0647\u0648\u0645 \u0643\u0644 \u064A\u0648\u0645',
  c3d: '\u0623\u062D\u0644\u0649 \u0627\u0633\u062A\u0627\u0644\u0633 \u062C\u0631\u0628\u062A\u0647',
  r3a: '\u062F\u0627\u064A\u0645\u0627\u064B \u0641\u064A \u062E\u062F\u0645\u062A\u0643',

  c4a: '\u0627\u0644\u0633\u0627\u0639\u0629 \u0648\u0635\u0644\u062A \u0632\u064A \u0627\u0644\u0635\u0648\u0631',
  c4b: '\u0628\u0627\u0644\u0638\u0628\u0637 \u0648\u0627\u0644\u0644\u0648\u0646 \u062A\u062D\u0641\u0629',
  c4c: '\u0627\u0644\u0645\u0648\u0642\u0639 \u062B\u0642\u0629 \u0648\u0647\u0648\u0635\u0651\u064A \u0635\u062D\u0627\u0628\u064A',
  r4a: '\u0634\u0643\u0631\u0627\u064B \u0644\u0630\u0648\u0642\u0643 \u0627\u0644\u062C\u0645\u064A\u0644',
  r4b: '\u0648\u062D\u064A\u0627\u0643\u064A \u0641\u064A Kwanzou \u062F\u0627\u064A\u0645\u0627\u064B',

  footer: '\u062A\u062C\u0631\u0628\u0629 \u0639\u0631\u0636 \u2014 \u0622\u0631\u0627\u0621 Kwanzou'
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function build({ customer, reply, times }) {
  const bubbleH = 36 + customer.length * 26;
  const replyY = 120 + bubbleH;
  const replyH = 36 + reply.length * 26;
  const customerLines = customer.map((line, i) =>
    `<text x="372" y="${132 + i * 26}" text-anchor="end" fill="#2b2118" font-family="Arial, Tahoma, sans-serif" font-size="16">${esc(line)}</text>`
  ).join('\n  ');
  const replyLines = reply.map((line, i) =>
    `<text x="52" y="${replyY + 32 + i * 26}" fill="#2b2118" font-family="Arial, Tahoma, sans-serif" font-size="15">${esc(line)}</text>`
  ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="640" viewBox="0 0 420 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#efe6d8"/>
      <stop offset="100%" stop-color="#e8dcc8"/>
    </linearGradient>
  </defs>
  <rect width="420" height="640" fill="url(#bg)"/>
  <rect x="0" y="0" width="420" height="64" fill="#2b2118"/>
  <circle cx="42" cy="32" r="18" fill="#c9a962"/>
  <text x="72" y="28" fill="#fff" font-family="Arial, sans-serif" font-size="15" font-weight="600">Kwanzou EG</text>
  <text x="72" y="46" fill="#d4c4b0" font-family="Arial, sans-serif" font-size="11">online</text>
  <rect x="70" y="100" width="318" height="${bubbleH}" rx="18" fill="#fff" stroke="#e5d9c8"/>
  ${customerLines}
  <text x="90" y="${100 + bubbleH - 12}" fill="#9a8b78" font-family="Arial, sans-serif" font-size="11">${times[0]}</text>
  <rect x="32" y="${replyY}" width="280" height="${replyH}" rx="18" fill="#f3e7d4"/>
  ${replyLines}
  <text x="270" y="${replyY + replyH - 12}" text-anchor="end" fill="#9a8b78" font-family="Arial, sans-serif" font-size="11">${times[1]}</text>
  <text x="210" y="600" text-anchor="middle" fill="#b09a7a" font-family="Arial, Tahoma, sans-serif" font-size="12">${esc(ar.footer)}</text>
</svg>
`;
}

const demos = [
  { file: 'shot-1.svg', customer: [ar.c1a, ar.c1b, ar.c1c], reply: [ar.r1a, ar.r1b], times: ['10:42', '10:45'] },
  { file: 'shot-2.svg', customer: [ar.c2a, ar.c2b, ar.c2c], reply: [ar.r2a, ar.r2b], times: ['1:18', '1:20'] },
  { file: 'shot-3.svg', customer: [ar.c3a, ar.c3b, ar.c3c, ar.c3d], reply: [ar.r3a], times: ['4:05', '4:07'] },
  { file: 'shot-4.svg', customer: [ar.c4a, ar.c4b, ar.c4c], reply: [ar.r4a, ar.r4b], times: ['8:33', '8:35'] }
];

const dir = path.join(__dirname, '..', 'assets', 'reviews');
fs.mkdirSync(dir, { recursive: true });

for (const d of demos) {
  const svg = build(d);
  const out = path.join(dir, d.file);
  fs.writeFileSync(out, svg, 'utf8');
  const ok = /[\u0600-\u06FF]/.test(svg);
  console.log(d.file, 'bytes', Buffer.byteLength(svg, 'utf8'), 'arabic', ok);
}
