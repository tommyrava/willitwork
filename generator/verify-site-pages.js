'use strict';

// Field + visible-text comparison for the 4 non-guide pages (/, /compatibilita,
// /affiliazione, /privacy) against the already-downloaded originals.
// Same method already used for the 40 guide pages: strip <!-- --> comments
// first, then compare <title>, <meta name="description">, and the full
// visible body text (tags stripped, whitespace collapsed).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIG_DIR = path.join(ROOT, 'willitwork.it');
const DIST_DIR = path.join(ROOT, 'dist');

function decodeEntities(s) {
  if (s == null) return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, ' ');
}

function extractTitleAndDescription(html) {
  const noComments = stripComments(html);
  const title = decodeEntities((noComments.match(/<title>([^<]*)<\/title>/) || [])[1]);
  const metaDescription = decodeEntities((noComments.match(/<meta name="description" content="([^"]*)"/) || [])[1]);
  return { title, metaDescription };
}

function extractVisibleText(html) {
  let s = stripComments(html);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<[^>]+>/g, '\n');
  s = decodeEntities(s);
  s = s
    .split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join('\n');
  return s;
}

function diffLines(a, b) {
  const la = a.split('\n');
  const lb = b.split('\n');
  const max = Math.max(la.length, lb.length);
  const diffs = [];
  for (let i = 0; i < max; i++) {
    if (la[i] !== lb[i]) diffs.push({ line: i + 1, original: la[i] ?? '∅', generated: lb[i] ?? '∅' });
  }
  return diffs;
}

const pages = [
  { name: '/ (homepage)', orig: 'index.html', dist: ['index.html'] },
  { name: '/compatibilita', orig: 'compatibilita.html', dist: ['compatibilita', 'index.html'] },
  { name: '/affiliazione', orig: 'affiliazione.html', dist: ['affiliazione', 'index.html'] },
  { name: '/privacy', orig: 'privacy.html', dist: ['privacy', 'index.html'] },
];

let allOk = true;

for (const p of pages) {
  const origHtml = fs.readFileSync(path.join(ORIG_DIR, p.orig), 'utf8');
  const distHtml = fs.readFileSync(path.join(DIST_DIR, ...p.dist), 'utf8');

  const origMeta = extractTitleAndDescription(origHtml);
  const distMeta = extractTitleAndDescription(distHtml);
  const origText = extractVisibleText(origHtml);
  const distText = extractVisibleText(distHtml);

  const titleOk = origMeta.title === distMeta.title;
  const descOk = origMeta.metaDescription === distMeta.metaDescription;
  const textOk = origText === distText;

  if (titleOk && descOk && textOk) {
    console.log(`✓ ${p.name} — identica (title, meta description, testo visibile)`);
  } else {
    allOk = false;
    console.log(`✗ ${p.name} — differenze trovate`);
    if (!titleOk) {
      console.log(`  <title>:`);
      console.log(`    originale: ${JSON.stringify(origMeta.title)}`);
      console.log(`    generato : ${JSON.stringify(distMeta.title)}`);
    }
    if (!descOk) {
      console.log(`  <meta description>:`);
      console.log(`    originale: ${JSON.stringify(origMeta.metaDescription)}`);
      console.log(`    generato : ${JSON.stringify(distMeta.metaDescription)}`);
    }
    if (!textOk) {
      const diffs = diffLines(origText, distText);
      for (const d of diffs.slice(0, 30)) {
        console.log(`  testo, riga ${d.line}:`);
        console.log(`    originale: ${d.original}`);
        console.log(`    generato : ${d.generated}`);
      }
      if (diffs.length > 30) console.log(`  ... e altre ${diffs.length - 30} righe diverse`);
    }
  }
}

console.log(allOk ? '\nTutte e 4 le pagine sono identiche.' : '\nAlcune pagine presentano differenze (vedi sopra).');
process.exit(allOk ? 0 : 1);
