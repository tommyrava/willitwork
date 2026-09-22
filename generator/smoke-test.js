'use strict';

// Starts a tiny static server on dist/ and crawls it like a real visitor:
// homepage -> a few guide pages -> affiliazione -> privacy -> compatibilita,
// checking every internal link found along the way for 404s, verifying
// sitemap.xml/robots.txt are byte-identical to the originals over HTTP, and
// checking every Amazon affiliate link against the dataset.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const ORIG_DIR = path.join(ROOT, 'willitwork.it');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.css': 'text/css',
  '.png': 'image/png',
  '.js': 'application/javascript',
};

function resolveFilePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const ext = path.extname(clean);
  if (ext && MIME[ext]) {
    const direct = path.join(DIST_DIR, clean);
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
    return null;
  }
  const asIndex = path.join(DIST_DIR, clean, 'index.html');
  if (fs.existsSync(asIndex)) return asIndex;
  return null;
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = resolveFilePath(req.url);
      if (!filePath) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function extractInternalLinks(html) {
  const links = new Set();
  const re = /\shref="([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (href.startsWith('/')) links.add(href.split('#')[0]);
  }
  return [...links].filter(Boolean);
}

function extractAmazonLinks(html) {
  const re = /<a href="(https:\/\/www\.amazon\.it\/s\?[^"]*)"/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1].replace(/&amp;/g, '&'));
  return out;
}

async function main() {
  const server = await startServer();
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  console.log(`Server locale avviato su ${base} (cartella dist/)\n`);

  const visited = new Map(); // url -> status
  const amazonLinksByPage = new Map();

  async function fetchPage(urlPath) {
    if (visited.has(urlPath)) return visited.get(urlPath);
    const res = await fetch(base + urlPath);
    const body = res.status === 200 ? await res.text() : '';
    visited.set(urlPath, { status: res.status, body });
    return { status: res.status, body };
  }

  // 1. Crawl like a real visitor: homepage -> a sample of guide pages -> affiliazione -> privacy -> compatibilita
  console.log('--- Navigazione ---');
  const home = await fetchPage('/');
  console.log(`GET /  -> ${home.status}`);
  const homeLinks = extractInternalLinks(home.body);

  const sampleGuideLinks = homeLinks.filter((l) => l.startsWith('/compatibilita/')).slice(0, 6);
  for (const link of sampleGuideLinks) {
    const r = await fetchPage(link);
    console.log(`GET ${link}  -> ${r.status}`);
    if (r.status === 200) amazonLinksByPage.set(link, extractAmazonLinks(r.body));
  }

  const catalog = await fetchPage('/compatibilita');
  console.log(`GET /compatibilita  -> ${catalog.status}`);
  const catalogLinks = extractInternalLinks(catalog.body).filter((l) => l.startsWith('/compatibilita/'));

  const affiliazione = await fetchPage('/affiliazione');
  console.log(`GET /affiliazione  -> ${affiliazione.status}`);

  const privacy = await fetchPage('/privacy');
  console.log(`GET /privacy  -> ${privacy.status}`);

  // 2. Crawl EVERY internal link discovered on every page reached so far,
  //    plus every guide page linked from the catalog index (all 40), to
  //    catch any 404 anywhere in the generated site, not just the sample.
  const toVisit = new Set([...homeLinks, ...catalogLinks, ...extractInternalLinks(affiliazione.body), ...extractInternalLinks(privacy.body)]);
  for (const link of sampleGuideLinks) {
    const r = visited.get(link);
    if (r && r.status === 200) for (const l of extractInternalLinks(r.body)) toVisit.add(l);
  }

  console.log(`\n--- Controllo di tutti i link interni scoperti (${toVisit.size} URL) ---`);
  const notFound = [];
  for (const link of toVisit) {
    const r = await fetchPage(link);
    if (r.status !== 200) notFound.push({ link, status: r.status });
    if (r.status === 200 && link.startsWith('/compatibilita/') && !amazonLinksByPage.has(link)) {
      amazonLinksByPage.set(link, extractAmazonLinks(r.body));
    }
  }
  if (notFound.length === 0) {
    console.log(`Nessun link rotto: tutti i ${toVisit.size} URL interni scoperti rispondono 200.`);
  } else {
    console.log(`ATTENZIONE: ${notFound.length} link non rispondono 200:`);
    for (const nf of notFound) console.log(`  ${nf.link} -> ${nf.status}`);
  }

  // 3. sitemap.xml / robots.txt over HTTP, byte-identical to the originals
  console.log('\n--- sitemap.xml / robots.txt ---');
  const sitemapRes = await fetch(base + '/sitemap.xml');
  const sitemapBody = await sitemapRes.text();
  const robotsRes = await fetch(base + '/robots.txt');
  const robotsBody = await robotsRes.text();

  const origSitemap = fs.readFileSync(path.join(ORIG_DIR, 'sitemap.xml'), 'utf8');
  const origRobots = fs.readFileSync(path.join(ORIG_DIR, 'robots.txt'), 'utf8');

  const sitemapUrlCount = [...sitemapBody.matchAll(/<loc>/g)].length;
  const origSitemapUrlCount = [...origSitemap.matchAll(/<loc>/g)].length;

  console.log(`GET /sitemap.xml -> ${sitemapRes.status}, ${sitemapUrlCount} URL (originale: ${origSitemapUrlCount})`);
  console.log(`  byte-identico all'originale: ${sitemapBody === origSitemap ? 'SÌ' : 'NO'}`);
  console.log(`GET /robots.txt -> ${robotsRes.status}`);
  console.log(`  byte-identico all'originale: ${robotsBody === origRobots ? 'SÌ' : 'NO'}`);

  // 4. Amazon affiliate links: verify every guide page reached has exactly
  //    one, that it points at amazon.it with the correct affiliate tag, and
  //    that the search query matches the dataset (default or override).
  console.log('\n--- Link di affiliazione Amazon ---');
  const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'compatibility-dataset.json'), 'utf8'));
  const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'affiliate-offer-overrides.json'), 'utf8'));
  const bySlug = new Map(dataset.map((e) => [e.slug, e]));

  let amazonOk = 0;
  let amazonBad = 0;
  for (const [link, links] of amazonLinksByPage) {
    const slug = link.replace('/compatibilita/', '');
    const entry = bySlug.get(slug);
    if (!entry) continue;
    const override = overrides[slug];
    const expectedQuery = override && override.searchQuery !== undefined ? override.searchQuery : `${entry.device} ${entry.product}`;
    const expectedHref = `https://www.amazon.it/s?k=${encodeURIComponent(expectedQuery)}&tag=willitwork-21`;

    const ok = links.length === 1 && links[0] === expectedHref && links[0].includes('tag=willitwork-21');
    if (ok) {
      amazonOk++;
    } else {
      amazonBad++;
      console.log(`  ✗ ${link}`);
      console.log(`      trovati: ${JSON.stringify(links)}`);
      console.log(`      atteso : ${expectedHref}`);
    }
  }
  console.log(`Pagine di compatibilità controllate: ${amazonLinksByPage.size}. Link Amazon corretti: ${amazonOk}. Problemi: ${amazonBad}.`);

  server.close();

  console.log('\n=== RIEPILOGO ===');
  console.log(`Link interni rotti (non-200): ${notFound.length}`);
  console.log(`sitemap.xml identico: ${sitemapBody === origSitemap}`);
  console.log(`robots.txt identico: ${robotsBody === origRobots}`);
  console.log(`Link Amazon verificati: ${amazonOk}/${amazonLinksByPage.size} corretti`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
