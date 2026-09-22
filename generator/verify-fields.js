'use strict';

// Field-by-field comparison of every generated guide page against the
// corresponding already-downloaded original in willitwork.it/compatibilita/.
// Unlike verify.js (whole-page visible-text diff), this also checks
// attribute-only content (title tag, meta description) that a stripped-tag
// text diff cannot see.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIG_DIR = path.join(ROOT, 'willitwork.it', 'compatibilita');
const DIST_DIR = path.join(ROOT, 'dist', 'compatibilita');

function decodeEntities(s) {
  if (s == null) return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractFields(rawHtml) {
  const html = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
  const title = decodeEntities((html.match(/<title>([^<]*)<\/title>/) || [])[1]);
  const metaDescription = decodeEntities((html.match(/<meta name="description" content="([^"]*)"/) || [])[1]);

  const summary = decodeEntities((html.match(/<p class="guide-lead">([^<]*)<\/p>/) || [])[1]);

  const verdictSection = (html.match(/<section class="guide-verdict[^>]*>[\s\S]*?<\/section>/) || [''])[0];
  const verdictClass = (verdictSection.match(/guide-verdict (\w+)/) || [])[1];
  const verdictIcon = decodeEntities((verdictSection.match(/<span>([^<]*)<\/span>/) || [])[1]);
  const verdictLabel = decodeEntities((verdictSection.match(/<h2>([^<]*)<\/h2>/) || [])[1]);

  const copySection = (html.match(/<section class="guide-copy">([\s\S]*?)<\/section>/) || [, ''])[1];

  const explanation = decodeEntities((copySection.match(/<h2>Perch[^<]*<\/h2><p>([^<]*)<\/p>/) || [])[1]);

  const detailBlocks = [];
  const detailRe = /<div><h2>([^<]*)<\/h2>((?:<p>[^<]*<\/p>)+)<\/div>/g;
  let dm;
  while ((dm = detailRe.exec(copySection))) {
    const paragraphs = [...dm[2].matchAll(/<p>([^<]*)<\/p>/g)].map((m) => decodeEntities(m[1]));
    detailBlocks.push({ title: decodeEntities(dm[1]), paragraphs });
  }

  const checksMatch = copySection.match(/<ul>([\s\S]*?)<\/ul>/);
  const checks = checksMatch ? [...checksMatch[1].matchAll(/<li>([^<]*)<\/li>/g)].map((m) => decodeEntities(m[1])) : [];

  const sourceMatch = copySection.match(/<p class="guide-source">Fonte: <a href="([^"]*)"[^>]*>([^<]*)<\/a><\/p>/);
  const source = sourceMatch ? { url: sourceMatch[1].replace(/&amp;/g, '&'), label: decodeEntities(sourceMatch[2]).trim() } : null;

  return { title, metaDescription, summary, verdictClass, verdictIcon, verdictLabel, explanation, detailBlocks, checks, source };
}

function fieldsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const slugs = fs
  .readdirSync(ORIG_DIR)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.slice(0, -5))
  .sort();

const identical = [];
const different = [];

for (const slug of slugs) {
  const origHtml = fs.readFileSync(path.join(ORIG_DIR, `${slug}.html`), 'utf8');
  const distPath = path.join(DIST_DIR, slug, 'index.html');
  if (!fs.existsSync(distPath)) {
    different.push({ slug, missing: true });
    continue;
  }
  const distHtml = fs.readFileSync(distPath, 'utf8');

  const orig = extractFields(origHtml);
  const dist = extractFields(distHtml);

  const fieldNames = ['title', 'metaDescription', 'summary', 'verdictClass', 'verdictIcon', 'verdictLabel', 'explanation', 'detailBlocks', 'checks', 'source'];
  const diffs = [];
  for (const f of fieldNames) {
    if (!fieldsEqual(orig[f], dist[f])) {
      diffs.push({ field: f, original: orig[f], generated: dist[f] });
    }
  }

  if (diffs.length === 0) {
    identical.push(slug);
  } else {
    different.push({ slug, diffs });
  }
}

console.log(`\n=== IDENTICHE: ${identical.length}/${slugs.length} ===`);
for (const s of identical) console.log(`  ✓ ${s}`);

console.log(`\n=== CON DIFFERENZE: ${different.length}/${slugs.length} ===`);
for (const d of different) {
  console.log(`\n✗ ${d.slug}`);
  if (d.missing) {
    console.log('    (file generato mancante)');
    continue;
  }
  for (const diff of d.diffs) {
    console.log(`  campo: ${diff.field}`);
    console.log(`    originale : ${JSON.stringify(diff.original)}`);
    console.log(`    generato  : ${JSON.stringify(diff.generated)}`);
  }
}

console.log(`\nTotale: ${identical.length} identiche, ${different.length} con differenze (su ${slugs.length}).`);
