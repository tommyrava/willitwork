'use strict';

// Compares the *visible text* of every generated page against the
// corresponding already-downloaded, already-indexed page in willitwork.it/.
// Tags, comments, attributes and whitespace differences are ignored: only
// what a reader (or a search engine's text extraction) actually sees matters.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIG_DIR = path.join(ROOT, 'willitwork.it');
const DIST_DIR = path.join(ROOT, 'dist');

function extractVisibleText(html) {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<[^>]+>/g, '\n');
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  s = s
    .split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join('\n');
  return s;
}

function extractAmazonHref(html) {
  const m = html.match(/<section class="affiliate-offer">[\s\S]*?<a href="([^"]*)"/);
  return m ? m[1].replace(/&amp;/g, '&') : null;
}

function diffLines(a, b) {
  const la = a.split('\n');
  const lb = b.split('\n');
  const max = Math.max(la.length, lb.length);
  const diffs = [];
  for (let i = 0; i < max; i++) {
    if (la[i] !== lb[i]) {
      diffs.push({ line: i + 1, original: la[i] ?? '∅', generated: lb[i] ?? '∅' });
    }
  }
  return diffs;
}

const pairs = [
  ['index.html', ['index.html']],
  ['compatibilita.html', ['compatibilita', 'index.html']],
  ['privacy.html', ['privacy', 'index.html']],
  ['affiliazione.html', ['affiliazione', 'index.html']],
];

const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'compatibility-dataset.json'), 'utf8'));
for (const e of dataset) {
  pairs.push([path.join('compatibilita', `${e.slug}.html`), ['compatibilita', e.slug, 'index.html']]);
}

let failCount = 0;
let passCount = 0;

for (const [origRel, distRelParts] of pairs) {
  const origPath = path.join(ORIG_DIR, origRel);
  const distPath = path.join(DIST_DIR, ...distRelParts);

  if (!fs.existsSync(origPath)) {
    console.log(`SKIP (no original): ${origRel}`);
    continue;
  }
  if (!fs.existsSync(distPath)) {
    console.log(`FAIL (missing generated file): ${distRelParts.join('/')}`);
    failCount++;
    continue;
  }

  const origHtml = fs.readFileSync(origPath, 'utf8');
  const distHtml = fs.readFileSync(distPath, 'utf8');

  const origText = extractVisibleText(origHtml);
  const distText = extractVisibleText(distHtml);
  const origAmazonHref = extractAmazonHref(origHtml);
  const distAmazonHref = extractAmazonHref(distHtml);

  const textOk = origText === distText;
  const hrefOk = origAmazonHref === distAmazonHref;

  if (textOk && hrefOk) {
    passCount++;
  } else {
    failCount++;
    console.log(`\nFAIL: ${origRel}  vs  ${distRelParts.join('/')}`);
    if (!textOk) {
      const diffs = diffLines(origText, distText);
      for (const d of diffs.slice(0, 20)) {
        console.log(`  line ${d.line}:`);
        console.log(`    original : ${d.original}`);
        console.log(`    generated: ${d.generated}`);
      }
      if (diffs.length > 20) console.log(`  ... and ${diffs.length - 20} more diff lines`);
    }
    if (!hrefOk) {
      console.log('  amazon href:');
      console.log(`    original : ${origAmazonHref}`);
      console.log(`    generated: ${distAmazonHref}`);
    }
  }
}

console.log(`\n${passCount} pages match exactly, ${failCount} pages differ (out of ${pairs.length}).`);
process.exit(failCount > 0 ? 1 : 0);
