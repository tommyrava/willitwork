'use strict';

const fs = require('fs');
const path = require('path');

const {
  renderHomePage,
  renderCatalogPage,
  renderGuidePage,
  renderPrivacyPage,
  renderAffiliazionePage,
  renderWallAnchorCalculatorPage,
} = require('./lib/templates');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'dist');
const STATIC_SRC = path.join(__dirname, 'static');
const ASSETS_SRC = STATIC_SRC;
const LOGO_SRC = path.join(STATIC_SRC, 'will-it-work-logo.png');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writePage(relPath, html) {
  const dir = path.join(OUT_DIR, relPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

function main() {
  const dataset = readJson(path.join(DATA_DIR, 'compatibility-dataset.json'));
  const relatedLinks = readJson(path.join(DATA_DIR, 'related-links.json'));
  const offerOverrides = readJson(path.join(DATA_DIR, 'affiliate-offer-overrides.json'));
  const bySlug = new Map(dataset.map((e) => [e.slug, e]));

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. Homepage
  writePage('.', renderHomePage(dataset));

  // 2. Catalog index
  writePage('compatibilita', renderCatalogPage(dataset));

  // 3. One page per guide
  for (const entry of dataset) {
    const relatedSlugs = relatedLinks[entry.slug] || [];
    const relatedEntries = relatedSlugs.map((s) => bySlug.get(s)).filter(Boolean);
    const offerOverride = offerOverrides[entry.slug];
    writePage(path.join('compatibilita', entry.slug), renderGuidePage(entry, relatedEntries, offerOverride));
  }

  // 4. Legal pages
  writePage('affiliazione', renderAffiliazionePage());
  writePage('privacy', renderPrivacyPage());

  // 4b. Calculators — first module: screw/wall-anchor calculator. Rule-based,
  //     reads its own data file, kept separate from compatibility-dataset.json.
  const wallAnchorRules = readJson(path.join(DATA_DIR, 'wall-anchor-rules.json'));
  writePage(path.join('calcolatori', 'vite-tassello'), renderWallAnchorCalculatorPage(wallAnchorRules));

  // 5. sitemap.xml — same 44 URLs, same order, same changefreq/priority as the
  //    original sitemap.xml already saved at willitwork.it/sitemap.xml
  const urls = [
    { loc: 'https://willitwork.it', changefreq: 'weekly', priority: '1' },
    { loc: 'https://willitwork.it/compatibilita', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://willitwork.it/affiliazione', changefreq: 'yearly', priority: '0.2' },
    { loc: 'https://willitwork.it/privacy', changefreq: 'yearly', priority: '0.2' },
    ...dataset.map((e) => ({
      loc: `https://willitwork.it/compatibilita/${e.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
    })),
    // New page, not part of the original 44 — first "calculator" module.
    { loc: 'https://willitwork.it/calcolatori/vite-tassello', changefreq: 'monthly', priority: '0.7' },
  ];
  const sitemapBody = urls
    .map((u) => `<url>\n<loc>${u.loc}</loc>\n<changefreq>${u.changefreq}</changefreq>\n<priority>${u.priority}</priority>\n</url>`)
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapBody}\n</urlset>\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemap, 'utf8');

  // 6. robots.txt — identical to the original
  const robots = `User-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://willitwork.it/sitemap.xml\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robots, 'utf8');

  // 7. Static assets needed to render the pages (stylesheet, logo, and the
  //    vanilla-JS checker that powers the homepage search form). The
  //    original React/RSC client bundles are NOT copied: this generator
  //    produces plain static HTML/CSS/JS, not a reimplementation of the
  //    original app.
  fs.mkdirSync(path.join(OUT_DIR, 'assets'), { recursive: true });
  fs.copyFileSync(
    path.join(ASSETS_SRC, 'index-CI5d9a33.css'),
    path.join(OUT_DIR, 'assets', 'index-CI5d9a33.css')
  );
  fs.copyFileSync(path.join(STATIC_SRC, 'checker.js'), path.join(OUT_DIR, 'assets', 'checker.js'));
  fs.copyFileSync(
    path.join(STATIC_SRC, 'wall-anchor-calculator.js'),
    path.join(OUT_DIR, 'assets', 'wall-anchor-calculator.js')
  );
  fs.copyFileSync(LOGO_SRC, path.join(OUT_DIR, 'will-it-work-logo.png'));

  // 8. search-index.json — a trimmed copy of the dataset (only the fields
  //    checker.js needs) so the homepage search doesn't have to download
  //    the full dataset (explanations, checks, sources, etc.) just to
  //    match a device/product pair to its guide page.
  const searchIndex = dataset.map((e) => ({ slug: e.slug, device: e.device, product: e.product, title: e.title }));
  fs.writeFileSync(path.join(OUT_DIR, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');

  console.log(`Generated ${dataset.length} guide pages + 4 site pages + sitemap.xml + robots.txt + search-index.json in ${OUT_DIR}`);
}

main();
