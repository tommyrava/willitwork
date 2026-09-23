'use strict';

const { escapeHtml, amazonSearchUrl, checkerUrl } = require('./html');
const {
  SITE_NAME,
  KEYWORDS,
  WEBSITE_LD_JSON,
  QUICK_EXAMPLES,
  POPULAR_EXAMPLES,
  DETAIL_HELPER_BUTTONS,
  HOW_IT_WORKS_STEPS,
  CATEGORY_CARDS,
  CATALOG_FILTERS,
} = require('./site-content');

const VERDICT_ICON = { yes: '✓', no: '×', limited: '!' };
const VERDICT_LABEL_BADGE = { yes: '✓ Compatibile', no: '× Non compatibile', limited: '! Con limitazioni' };

// ---------------------------------------------------------------------
// <head>
// ---------------------------------------------------------------------

function renderHead(opts) {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogUrl,
    ogSiteName,
    ogType,
    ogLocale,
    twitterTitle,
    twitterDescription,
    iconHref,
    canonical,
    includeWebsiteLdJson,
  } = opts;

  let h = '';
  h += '<meta charset="utf-8"/>';
  h += '<meta name="viewport" content="width=device-width, initial-scale=1"/>';
  h += '<link rel="stylesheet" href="/assets/index-CI5d9a33.css"/>';
  h += `<title>${escapeHtml(title)}</title>`;
  h += `<meta name="description" content="${escapeHtml(description)}"/>`;
  h += `<meta name="keywords" content="${escapeHtml(KEYWORDS)}"/>`;
  h += `<meta property="og:title" content="${escapeHtml(ogTitle)}"/>`;
  h += `<meta property="og:description" content="${escapeHtml(ogDescription)}"/>`;
  if (ogUrl) h += `<meta property="og:url" content="${escapeHtml(ogUrl)}"/>`;
  if (ogSiteName) h += `<meta property="og:site_name" content="${escapeHtml(ogSiteName)}"/>`;
  h += `<meta property="og:type" content="${escapeHtml(ogType)}"/>`;
  if (ogLocale) h += `<meta property="og:locale" content="${escapeHtml(ogLocale)}"/>`;
  h += '<meta name="twitter:card" content="summary"/>';
  h += `<meta name="twitter:title" content="${escapeHtml(twitterTitle)}"/>`;
  h += `<meta name="twitter:description" content="${escapeHtml(twitterDescription)}"/>`;
  h += `<link rel="icon" href="${escapeHtml(iconHref)}"/>`;
  h += `<link rel="apple-touch-icon" href="${escapeHtml(iconHref)}"/>`;
  h += `<link rel="canonical" href="${escapeHtml(canonical)}"/>`;
  if (includeWebsiteLdJson) {
    h += `<script type="application/ld+json">${JSON.stringify(WEBSITE_LD_JSON)}</script>`;
  }
  return h;
}

// ---------------------------------------------------------------------
// Header / footer variants
// ---------------------------------------------------------------------

function headerHome() {
  return `<header class="nav-wrap"><nav class="nav" aria-label="Navigazione principale"><a class="brand" href="/#top" aria-label="Will It Work, home"><span class="brand-mark"><img src="/will-it-work-logo.png" alt=""/></span><span>Will It Work?</span></a><div class="nav-links"><a href="/#come-funziona">Come funziona</a><a href="/compatibilita">Tutte le verifiche</a><a href="/#categorie">Categorie</a><a href="/calcolatori/vite-tassello">Calcolatore tasselli</a><a href="/calcolatori/batterie">Verificatore batterie</a><a href="/calcolatori/usb-c-power-delivery">Calcolatore USB-C</a></div><a class="nav-cta" href="/#checker">Prova ora</a></nav></header>`;
}

function headerGuideNav(linkHref, linkText) {
  return `<header class="guide-nav"><a class="brand" href="/"><span class="brand-mark"><img src="/will-it-work-logo.png" alt=""/></span><span>Will It Work?</span></a><a href="${escapeHtml(linkHref)}">${escapeHtml(linkText)}</a></header>`;
}

function footerHome() {
  return `<footer><a class="brand" href="/#top"><span class="brand-mark"><img src="/will-it-work-logo.png" alt=""/></span><span>Will It Work?</span></a><p>Controlla prima. Compra una volta sola.</p><small>In qualità di Affiliato Amazon io ricevo un guadagno dagli acquisti idonei. · <a href="/affiliazione">Trasparenza</a> · <a href="/compatibilita">Tutte le verifiche</a> · <a href="/privacy">Privacy</a></small></footer>`;
}

function footerCatalog() {
  return `<footer><a class="brand" href="/"><span class="brand-mark"><img src="/will-it-work-logo.png" alt=""/></span><span>Will It Work?</span></a><p>Controlla prima. Compra una volta sola.</p><small>In qualità di Affiliato Amazon io ricevo un guadagno dagli acquisti idonei. · <a href="/affiliazione">Trasparenza</a> · <a href="/privacy">Privacy</a></small></footer>`;
}

function footerGuide() {
  return `<footer><a href="/privacy">Privacy</a><small>In qualità di Affiliato Amazon io ricevo un guadagno dagli acquisti idonei. · <a href="/affiliazione">Trasparenza</a></small></footer>`;
}

// ---------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------

function renderHomePage(dataset) {
  const head = renderHead({
    title: 'Will It Work? — Verifica la compatibilità prima di comprare',
    description: 'Confronta dispositivi, accessori e ricambi. Scopri se sono compatibili, con quali limiti e perché.',
    ogTitle: 'Will It Work? — Funzionerà davvero?',
    ogDescription: 'Controlla gratuitamente la compatibilità tra dispositivi, cavi, caricatori e accessori.',
    ogUrl: 'https://willitwork.it/',
    ogSiteName: SITE_NAME,
    ogType: 'website',
    ogLocale: 'it_IT',
    twitterTitle: 'Will It Work? — Funzionerà davvero?',
    twitterDescription: 'Controlla gratuitamente la compatibilità tra dispositivi, cavi, caricatori e accessori.',
    iconHref: '/will-it-work-logo.png',
    canonical: 'https://willitwork.it/',
    includeWebsiteLdJson: true,
  });

  const popularButtons = POPULAR_EXAMPLES.map(
    (e) =>
      `<button type="button" data-device="${escapeHtml(e.device)}" data-product="${escapeHtml(e.product)}"><span>${escapeHtml(e.device)}</span><strong>${escapeHtml(e.product)}</strong><b>Controlla →</b></button>`
  ).join('');

  const quickButtons = QUICK_EXAMPLES.map(
    (e) => `<button type="button" data-device="${escapeHtml(e.device)}" data-product="${escapeHtml(e.product)}">${escapeHtml(e.label)}</button>`
  ).join('');

  const detailButtons = DETAIL_HELPER_BUTTONS.map((label) => `<button type="button">+ ${escapeHtml(label)}</button>`).join('');

  const steps = HOW_IT_WORKS_STEPS.map(
    (s, i) =>
      `<article><span>0${i + 1}</span><div class="step-icon">${s.icon}</div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.text)}</p></article>`
  ).join('');

  const guideGrid = dataset
    .slice(0, 6)
    .map(
      (e) =>
        `<a href="/compatibilita/${escapeHtml(e.slug)}"><small>${escapeHtml(e.device)}</small><strong>${escapeHtml(e.title)}</strong><span>Leggi la guida →</span></a>`
    )
    .join('');

  const categoryGrid = CATEGORY_CARDS.map(
    (c) => `<article><span>${c.icon}</span><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.text)}</small></article>`
  ).join('');

  const body = `<main>${headerHome()}<section class="hero" id="top"><div class="hero-glow glow-one"></div><div class="hero-glow glow-two"></div><div class="hero-copy"><div class="pill"><span></span> Compatibilità, senza supposizioni</div><h1>Funzionerà<br/>davvero?</h1><p>Confronta dispositivi, accessori e ricambi prima di comprare. Una risposta chiara, il motivo e le alternative corrette.</p><div class="trust-row"><div><strong>✓</strong> Verdetti spiegati</div><div><strong>✓</strong> Nessuna registrazione</div><div><strong>✓</strong> Risposta immediata</div></div></div><div class="checker-shell" id="checker"><form><div class="checker-title"><span class="live-dot"></span><div><strong>Verifica compatibilità</strong><small>Nessun account richiesto · risposta immediata</small></div></div><label for="device">Cosa possiedi?</label><div class="input-wrap"><span class="input-icon">⌁</span><input id="device" placeholder="Es. MacBook Air M1 2020" autocomplete="off" value=""/></div><div class="connector"><span>+</span></div><label for="product">Cosa vuoi comprare?</label><div class="input-wrap"><span class="input-icon">↗</span><input id="product" placeholder="Es. Cavo USB-A to Lightning" autocomplete="off" value=""/></div><div class="link-import"><label for="product-url">Oppure incolla il link del prodotto <span>facoltativo</span></label><div><input id="product-url" type="url" placeholder="https://..." value=""/><button type="button">Usa link</button></div></div><div class="detail-helper"><span>Aggiungi un dettaglio</span><div>${detailButtons}</div></div><button class="check-button" disabled>Controlla compatibilità <span>→</span></button><div class="examples"><span>Prova un esempio:</span>${quickButtons}</div></form><div id="checker-result" class="checker-result" hidden aria-live="polite"></div></div></section><section class="popular-section" aria-labelledby="popular-title"><div class="section-heading"><span>PROVA SUBITO</span><h2 id="popular-title">Controlli popolari</h2><p>Scegli un confronto frequente e guarda immediatamente il verdetto.</p></div><div class="popular-grid">${popularButtons}</div></section><section class="how" id="come-funziona"><div class="section-heading"><span>SEMPLICE PER DAVVERO</span><h2>Tre passaggi. Zero acquisti sbagliati.</h2></div><div class="steps">${steps}</div></section><section class="seo-guides" id="guide" aria-labelledby="guides-title"><div class="section-heading"><span>GUIDE VERIFICATE</span><h2 id="guides-title">Risposte che puoi trovare anche su Google.</h2><p>Approfondimenti dedicati ai confronti più comuni, con spiegazione e fonti ufficiali quando disponibili.</p></div><div class="seo-guide-grid">${guideGrid}</div><a class="all-guides-link" href="/compatibilita">Esplora tutte le ${dataset.length} verifiche →</a></section><section class="categories" id="categorie"><div><span class="section-kicker">IN PARTENZA</span><h2>Le categorie dove sbagliare costa di più.</h2><p>Partiamo dai confronti più richiesti. Il catalogo crescerà usando specifiche ufficiali e segnalazioni verificate.</p></div><div class="category-grid">${categoryGrid}</div></section>${footerHome()}</main><script src="/assets/checker.js" defer></script>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------
// Catalog index (/compatibilita)
// ---------------------------------------------------------------------

function renderCatalogPage(dataset) {
  const head = renderHead({
    title: 'Tutte le verifiche di compatibilità — Will It Work?',
    description: 'Cerca tra tutte le guide verificate su cavi, caricatori, cartucce, batterie e accessori.',
    ogTitle: 'Tutte le verifiche di compatibilità',
    ogDescription: 'Trova una risposta verificata prima di comprare un accessorio o un ricambio.',
    ogUrl: 'https://willitwork.it/compatibilita',
    ogType: 'website',
    twitterTitle: 'Tutte le verifiche di compatibilità',
    twitterDescription: 'Trova una risposta verificata prima di comprare un accessorio o un ricambio.',
    iconHref: '/will-it-work-logo.png',
    canonical: 'https://willitwork.it/compatibilita',
    includeWebsiteLdJson: false,
  });

  const filters = CATALOG_FILTERS.map(
    (f, i) => `<button type="button" class="${i === 0 ? 'active' : ''}">${escapeHtml(f)}</button>`
  ).join('');

  const cards = dataset
    .map((e) => {
      const badge = VERDICT_LABEL_BADGE[e.verdict];
      return `<a href="/compatibilita/${escapeHtml(e.slug)}"><div><span class="catalog-verdict ${e.verdict}">${escapeHtml(badge)}</span><small>${escapeHtml(e.device)}</small></div><h2>${escapeHtml(e.title)}</h2><p>${escapeHtml(e.summary)}</p><b>Leggi la verifica →</b></a>`;
    })
    .join('');

  const body = `<main class="catalog-page">${headerGuideNav('/#checker', 'Verifica un prodotto')}<section class="catalog-hero"><span>ARCHIVIO VERIFICATO</span><h1>Tutte le verifiche.</h1><p>Cerca un dispositivo, un accessorio o un codice prodotto. Ogni guida spiega il verdetto e, quando disponibile, rimanda alla fonte ufficiale.</p><label class="catalog-search"><span>⌕</span><input placeholder="Es. iPhone 14, HP 305, CR2032…" aria-label="Cerca tra le verifiche" value=""/></label><div class="catalog-filters" aria-label="Filtra per categoria">${filters}</div></section><section class="catalog-results" aria-live="polite"><div class="catalog-count"><strong>${dataset.length}</strong> verifiche trovate</div><div class="catalog-grid">${cards}</div></section>${footerCatalog()}</main>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------
// Guide page (/compatibilita/{slug})
// ---------------------------------------------------------------------

function renderGuidePage(entry, relatedEntries, offerOverride) {
  const displayTitle = entry.seoTitle || `${entry.title} — Will It Work?`;
  const displayDescription = entry.metaDescription || entry.summary;
  const pageUrl = `https://willitwork.it/compatibilita/${entry.slug}`;

  const head = renderHead({
    title: displayTitle,
    description: displayDescription,
    ogTitle: entry.seoTitle || entry.title,
    ogDescription: entry.metaDescription || entry.summary,
    ogType: 'article',
    twitterTitle: entry.seoTitle || entry.title,
    twitterDescription: entry.metaDescription || entry.summary,
    iconHref: '/will-it-work-logo.png',
    canonical: pageUrl,
    includeWebsiteLdJson: false,
  });

  const techArticleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: entry.title,
    description: entry.summary,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: 'it-IT',
    author: { '@type': 'Organization', name: SITE_NAME, url: 'https://willitwork.it/' },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: 'https://willitwork.it/' },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://willitwork.it/' },
      { '@type': 'ListItem', position: 2, name: 'Compatibilità', item: 'https://willitwork.it/compatibilita' },
      { '@type': 'ListItem', position: 3, name: entry.title, item: pageUrl },
    ],
  };

  const detailsHtml = (entry.details || [])
    .map((d) => `<div><h2>${escapeHtml(d.title)}</h2>${d.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>`)
    .join('');

  const checksHtml = `<ul>${entry.checks.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`;

  const sourceHtml = entry.source
    ? `<p class="guide-source">Fonte: <a href="${escapeHtml(entry.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.source.label)} ↗</a></p>`
    : '';

  const relatedHtml =
    relatedEntries.length > 0
      ? `<section class="guide-related"><h2>Altri confronti</h2><div>${relatedEntries
          .map(
            (r) =>
              `<a href="/compatibilita/${escapeHtml(r.slug)}"><span>${escapeHtml(r.device)}</span><strong>${escapeHtml(r.title)}</strong></a>`
          )
          .join('')}</div></section>`
      : '';

  const defaultOfferH2 = entry.verdict === 'no' ? 'Cerca l’alternativa compatibile' : 'Cerca questo prodotto';
  const o = offerOverride || {};
  const offerH2 = o.h2 !== undefined ? o.h2 : defaultOfferH2;
  const offerP = o.p !== undefined ? o.p : 'Controlla modello, codice e specifiche anche nella scheda del venditore.';
  const offerCtaLabel = o.ctaLabel !== undefined ? o.ctaLabel : 'Cerca su Amazon ↗';
  const offerSearchQuery = o.searchQuery !== undefined ? o.searchQuery : `${entry.device} ${entry.product}`;

  const amazonHref = amazonSearchUrl(offerSearchQuery);
  const checkerHref = checkerUrl(entry.device, entry.product);

  const body = `<main class="guide-page"><script type="application/ld+json">${JSON.stringify([techArticleLd, breadcrumbLd])}</script>${headerGuideNav(
    '/#checker',
    'Verifica un prodotto'
  )}<article class="guide-article"><nav aria-label="Percorso"><a href="/">Home</a><span>›</span><span>Compatibilità</span></nav><div class="guide-kicker">GUIDA ALLA COMPATIBILITÀ</div><h1>${escapeHtml(
    entry.title
  )}</h1><p class="guide-lead">${escapeHtml(entry.summary)}</p><section class="guide-verdict ${entry.verdict}"><span>${VERDICT_ICON[entry.verdict]}</span><div><small>VERDETTO</small><h2>${escapeHtml(
    entry.verdictLabel
  )}</h2></div></section><section class="guide-copy"><h2>Perché</h2><p>${escapeHtml(
    entry.explanation
  )}</p>${detailsHtml}<h2>Cosa controllare prima di comprare</h2>${checksHtml}${sourceHtml}</section><section class="affiliate-offer"><small>LINK A PAGAMENTO</small><h2>${escapeHtml(
    offerH2
  )}</h2><p>${escapeHtml(offerP)}</p><a href="${escapeHtml(
    amazonHref
  )}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Cerca su Amazon (si apre in una nuova scheda)">${escapeHtml(
    offerCtaLabel
  )}</a><span>Potremmo ricevere una commissione senza costi aggiuntivi per te.</span></section><section class="guide-cta"><h2>Vuoi verificare un altro prodotto?</h2><p>Inserisci modello e accessorio nel controllo gratuito.</p><a href="${escapeHtml(
    checkerHref
  )}">Apri il verificatore →</a></section>${relatedHtml}</article>${footerGuide()}</main>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------
// Legal pages (/privacy, /affiliazione)
// ---------------------------------------------------------------------

function renderLegalPage({ kicker, h1, updated, bodyHtml, titleTag, description }) {
  const head = renderHead({
    title: titleTag,
    description,
    ogTitle: 'Will It Work? — Funzionerà davvero?',
    ogDescription: 'Controlla gratuitamente la compatibilità tra dispositivi, cavi, caricatori e accessori.',
    ogUrl: 'https://willitwork.it/',
    ogSiteName: SITE_NAME,
    ogType: 'website',
    ogLocale: 'it_IT',
    twitterTitle: 'Will It Work? — Funzionerà davvero?',
    twitterDescription: 'Controlla gratuitamente la compatibilità tra dispositivi, cavi, caricatori e accessori.',
    iconHref: '/will-it-work-logo.png',
    canonical: 'https://willitwork.it/',
    includeWebsiteLdJson: false,
  });

  const body = `<main class="legal-page">${headerGuideNav('/', 'Torna al sito')}<article><span>${escapeHtml(
    kicker
  )}</span><h1>${escapeHtml(h1)}</h1><p class="updated">Ultimo aggiornamento: ${escapeHtml(updated)}</p>${bodyHtml}<a class="legal-back" href="/">← Torna a Will It Work?</a></article></main>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

function renderPrivacyPage() {
  const bodyHtml = `<h2>Quali dati raccogliamo</h2><p>Quando utilizzi il verificatore conserviamo il testo del dispositivo e del prodotto inseriti, il tipo di verdetto, l’eventuale valutazione della risposta e l’eventuale clic sul collegamento a un’alternativa. Non chiediamo nome, email, numero di telefono o registrazione per usare il servizio.</p><h2>Perché li utilizziamo</h2><p>Usiamo questi dati per capire quali compatibilità vengono cercate, correggere risposte segnalate come errate, ampliare il catalogo e misurare l’utilità del servizio.</p><h2>Conservazione locale</h2><p>Gli ultimi confronti e alcune preferenze possono essere conservati nel browser del dispositivo tramite memoria locale. Puoi cancellare la cronologia dal pulsante presente nel sito oppure eliminando i dati del sito dal browser.</p><h2>Condivisione e profilazione</h2><p>Non vendiamo dati personali e non utilizziamo i confronti per creare profili pubblicitari individuali. I collegamenti commerciali, quando presenti, vengono dichiarati chiaramente.</p><h2>Link affiliati</h2><p>Alcuni collegamenti verso Amazon sono link a pagamento e includono l’identificativo affiliato willitwork-21. Amazon può trattare dati tecnici e cookie dopo il clic secondo la propria informativa. Will It Work? non riceve da Amazon il nome o i dati di pagamento dell’acquirente. Consulta anche la pagina <a href="/affiliazione">Trasparenza e affiliazioni</a>.</p><h2>Attenzione ai dati inseriti</h2><p>Inserisci soltanto modelli, codici e descrizioni di prodotti. Non scrivere nomi, recapiti, numeri d’ordine, password o altre informazioni personali nei campi del verificatore.</p><h2>Richieste</h2><p>Per richieste di accesso, rettifica o cancellazione relative ai dati del servizio, contatta il gestore attraverso il canale con cui hai ricevuto l’accesso al sito. Una modalità di contatto dedicata sarà aggiunta prima del lancio commerciale.</p>`;

  return renderLegalPage({
    kicker: 'INFORMATIVA',
    h1: 'Privacy',
    updated: '11 agosto 2026',
    bodyHtml,
    titleTag: 'Privacy — Will It Work?',
    description: 'Informativa sul trattamento dei dati del servizio Will It Work?.',
  });
}

function renderAffiliazionePage() {
  const bodyHtml = `<h2>Dichiarazione Amazon</h2><p><strong>In qualità di Affiliato Amazon io ricevo un guadagno dagli acquisti idonei.</strong></p><h2>Come funzionano i link</h2><p>Alcuni collegamenti verso Amazon sono link a pagamento. Se visiti Amazon attraverso uno di questi link e completi un acquisto idoneo, Will It Work? può ricevere una commissione. Per te il prezzo non aumenta.</p><h2>Come scegliamo cosa mostrare</h2><p>I link vengono associati al dispositivo, accessorio o ricambio descritto nella verifica. Il verdetto non dipende dalla commissione: se un prodotto è incompatibile, il sito indica il problema e cerca l’alternativa corretta.</p><h2>Prezzi e disponibilità</h2><p>Prezzi, disponibilità e caratteristiche possono cambiare su Amazon. Prima dell’acquisto verifica sempre la scheda del venditore, il codice prodotto e la compatibilità dichiarata dal produttore.</p>`;

  return renderLegalPage({
    kicker: 'TRASPARENZA',
    h1: 'Affiliazioni',
    updated: '11 agosto 2026',
    bodyHtml,
    titleTag: 'Trasparenza e affiliazioni — Will It Work?',
    description: 'Come funzionano i link affiliati presenti su Will It Work?.',
  });
}

// ---------------------------------------------------------------------
// Wall-anchor calculator (/calcolatori/vite-tassello)
// ---------------------------------------------------------------------

function renderSourceLinks(sources) {
  return sources
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)} ↗</a>`)
    .join(', ');
}

function renderAnchorTableRow(row) {
  const badge =
    row.sources.length >= 2
      ? `<span class="source-badge source-badge-ok">✓ ${row.sources.length} fonti indipendenti</span>`
      : `<span class="source-badge source-badge-warn">⚠ fonte singola — verifica sulla confezione</span>`;
  const screwRange = `${row.screwMin} – ${row.screwMax} mm`;
  return `<tr><td>${row.plugDiameter} mm</td><td>${row.holeDiameter} mm</td><td>${screwRange}</td><td>${badge}<br/><small>${renderSourceLinks(row.sources)}</small></td></tr>`;
}

function renderWallAnchorCalculatorPage(rules) {
  const head = renderHead({
    title: 'Calcolatore vite-tassello: che diametro serve? — Will It Work?',
    description: 'Scopri il diametro del foro e la vite giusta per il tuo tassello, per muro pieno o cartongesso, con le fonti tecniche verificate.',
    ogTitle: 'Calcolatore vite-tassello: che diametro serve?',
    ogDescription: 'Scopri il diametro del foro e la vite giusta per il tuo tassello, per muro pieno o cartongesso, con le fonti tecniche verificate.',
    ogType: 'article',
    twitterTitle: 'Calcolatore vite-tassello: che diametro serve?',
    twitterDescription: 'Scopri il diametro del foro e la vite giusta per il tuo tassello, per muro pieno o cartongesso, con le fonti tecniche verificate.',
    iconHref: '/will-it-work-logo.png',
    canonical: 'https://willitwork.it/calcolatori/vite-tassello',
    includeWebsiteLdJson: false,
  });

  const diameterButtons = rules.solidWall.rows
    .map((r, i) => `<button type="button" data-diameter="${r.plugDiameter}" class="${i === 0 ? 'active' : ''}">${r.plugDiameter} mm</button>`)
    .join('');

  const tableRows = rules.solidWall.rows.map(renderAnchorTableRow).join('');

  const selfDrilling = rules.hollowWall.selfDrilling;
  const toggleType = rules.hollowWall.toggleType;

  const body = `<main class="guide-page">${headerGuideNav(
    '/#checker',
    'Verifica un prodotto'
  )}<article class="guide-article"><nav aria-label="Percorso"><a href="/">Home</a><span>›</span><span>Calcolatori</span></nav><div class="guide-kicker">CALCOLATORE</div><h1>Che tassello e vite servono?</h1><p class="guide-lead">Seleziona il tipo di muro per scoprire il foro e la vite giusti, con le fonti tecniche verificate.</p><div class="checker-shell" id="calcolatore"><form id="wall-anchor-form"><div class="checker-title"><span class="live-dot"></span><div><strong>Calcola tassello e vite</strong><small>Dati da schede tecniche ufficiali dei produttori</small></div></div><label>Tipo di muro</label><div class="catalog-filters" role="radiogroup" aria-label="Tipo di muro" id="wall-type-toggle"><button type="button" data-wall="solid" class="active">Muro pieno / mattone / cemento</button><button type="button" data-wall="hollow">Cartongesso / muro cavo</button></div><div id="solid-wall-fields"><label>Diametro tassello</label><div class="catalog-filters" id="plug-diameter-buttons">${diameterButtons}</div></div><div id="hollow-wall-fields" hidden><label for="panel-thickness">Spessore lastra (mm)</label><div class="input-wrap"><input id="panel-thickness" type="number" step="0.5" min="0" placeholder="Es. 12,5"/></div><label>Tipo di tassello</label><div class="catalog-filters" id="hollow-type-toggle"><button type="button" data-hollow="selfdrilling" class="active">Autoforante</button><button type="button" data-hollow="toggle">A espansione/ancora (farfalla, molly)</button></div></div></form><div class="tool-disclaimer">⚠ ${escapeHtml(
    rules.disclaimer
  )}</div><div id="tool-result" class="checker-result" hidden aria-live="polite"></div></div><section class="guide-copy"><h2>Tabella completa — muro pieno o semipieno</h2><p>${escapeHtml(
    rules.solidWall.rule
  )}</p><table class="anchor-table"><thead><tr><th>Ø tassello</th><th>Ø foro</th><th>Ø vite</th><th>Fonti</th></tr></thead><tbody>${tableRows}</tbody></table><h2>Cartongesso o muro cavo</h2><p><strong>${escapeHtml(
    selfDrilling.plugType
  )}</strong>: ${escapeHtml(selfDrilling.rule)} Vite ${selfDrilling.screwMin}–${selfDrilling.screwMax} mm, lastre da ${
    selfDrilling.minPanelThickness
  } fino a ${selfDrilling.maxPanelThicknessNoPreDrill} mm circa senza preforo. Fonte: ${renderSourceLinks(
    selfDrilling.sources
  )}</p><p><strong>${escapeHtml(toggleType.plugType)}</strong>: ${escapeHtml(toggleType.note)} Fonte: ${renderSourceLinks(
    toggleType.sources
  )}</p><p class="guide-source">Nota sui materiali teneri: ${escapeHtml(rules.softMaterialNote)}</p></section></article>${footerCatalog()}</main><script type="application/json" id="wall-anchor-rules">${JSON.stringify(
    rules
  )}</script><script src="/assets/wall-anchor-calculator.js" defer></script>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------
// Battery format checker (/calcolatori/batterie)
// ---------------------------------------------------------------------

function formatDimensions(f) {
  if (f.shape === 'rectangular') {
    return `${f.widthMin}–${f.widthMax} × ${f.depthMin}–${f.depthMax} × ${f.heightMin}–${f.heightMax} mm (L×P×H)`;
  }
  const dMax = f.diameterMax;
  const dMin = f.diameterMin != null ? f.diameterMin : null;
  const dText = dMin != null ? `Ø ${dMin}–${dMax} mm` : `Ø max ${dMax} mm`;
  const hMax = f.heightMax != null ? f.heightMax : f.thicknessMax;
  const hMin = f.heightMin != null ? f.heightMin : f.thicknessMin;
  const hLabel = f.shape === 'coin' ? 'spessore' : 'altezza';
  const hText = hMin != null ? `${hLabel} ${hMin}–${hMax} mm` : `${hLabel} max ${hMax} mm`;
  return `${dText}, ${hText}`;
}

function formatVoltage(f) {
  if (f.nimhCapable) return '1,5 V (alcalina) / 1,2 V (NiMH ricaricabile)';
  if (f.id === '18650') return '3,6 V (ricaricabile Li-ion)';
  if (f.id === '9V') return '9 V';
  return '3 V (litio)';
}

function renderBatteryTableRow(f) {
  return `<tr><td>${escapeHtml(f.label)}</td><td>${formatDimensions(f)}</td><td>${formatVoltage(f)}</td><td>${escapeHtml(
    f.altNames.join(', ')
  )}</td><td><small>${renderSourceLinks([f.source])}</small></td></tr>`;
}

function renderBatteryCheckerPage(data) {
  const head = renderHead({
    title: 'Le batterie sono compatibili? Verificatore formati — Will It Work?',
    description: 'Confronta due formati di batteria (AA, AAA, CR2032, 18650 e altri) e scopri se sono davvero intercambiabili, con le fonti tecniche verificate.',
    ogTitle: 'Le batterie sono compatibili? Verificatore formati',
    ogDescription: 'Confronta due formati di batteria e scopri se sono davvero intercambiabili, con le fonti tecniche verificate.',
    ogType: 'article',
    twitterTitle: 'Le batterie sono compatibili? Verificatore formati',
    twitterDescription: 'Confronta due formati di batteria e scopri se sono davvero intercambiabili, con le fonti tecniche verificate.',
    iconHref: '/will-it-work-logo.png',
    canonical: 'https://willitwork.it/calcolatori/batterie',
    includeWebsiteLdJson: false,
  });

  const options = data.variants.map((v) => `<option value="${escapeHtml(v.id)}">${escapeHtml(v.label)}</option>`).join('');
  const tableRows = data.formats.map(renderBatteryTableRow).join('');

  const body = `<main class="guide-page">${headerGuideNav(
    '/#checker',
    'Verifica un prodotto'
  )}<article class="guide-article"><nav aria-label="Percorso"><a href="/">Home</a><span>›</span><span>Calcolatori</span></nav><div class="guide-kicker">VERIFICATORE</div><h1>Le batterie sono compatibili?</h1><p class="guide-lead">Seleziona cosa richiede il tuo dispositivo e cosa hai in mano: ti diciamo se vanno bene, non vanno bene, o vanno bene con attenzione.</p><div class="checker-shell" id="verificatore"><form id="battery-form"><div class="checker-title"><span class="live-dot"></span><div><strong>Verifica formato batteria</strong><small>Dati da schede tecniche ufficiali dei produttori</small></div></div><label for="device-battery">Che batteria richiede il tuo dispositivo?</label><div class="input-wrap"><span class="input-icon">⌁</span><select id="device-battery">${options}</select></div><div class="connector"><span>+</span></div><label for="have-battery">Che batteria hai in mano?</label><div class="input-wrap"><span class="input-icon">↗</span><select id="have-battery">${options}</select></div></form><div class="tool-disclaimer">⚠ ${escapeHtml(
    data.disclaimer
  )}</div><div id="tool-result" class="checker-result" hidden aria-live="polite"></div></div><section class="guide-copy"><h2>Tabella completa dei formati</h2><table class="anchor-table"><thead><tr><th>Formato</th><th>Dimensioni</th><th>Voltaggio</th><th>Nomi alternativi</th><th>Fonte</th></tr></thead><tbody>${tableRows}</tbody></table><h2>Casi da trattare con attenzione</h2><p><strong>CR2032 / CR2025 / CR2016</strong>: stesso diametro (~20 mm), spessore diverso. ${escapeHtml(
    data.coinThinnerWarning
  )} ${escapeHtml(data.coinThickerWarning)}</p><p><strong>Alcalina vs NiMH ricaricabile</strong> (AA, AAA, C, D): stesse identiche dimensioni IEC, voltaggio diverso (1,5 V vs 1,2 V). ${escapeHtml(
    data.nimhLowerVoltageWarning
  )}</p><p><strong>18650</strong>: ${escapeHtml(
    data.formats.find((f) => f.id === '18650').extraWarning
  )}</p></section></article>${footerCatalog()}</main><script type="application/json" id="battery-rules">${JSON.stringify(
    data
  )}</script><script src="/assets/battery-checker.js" defer></script>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------
// USB-C / Power Delivery calculator (/calcolatori/usb-c-power-delivery)
// ---------------------------------------------------------------------

function renderUsbPdCableTableRow(c) {
  return `<tr><td>${escapeHtml(c.label)}</td><td>${c.maxWatts} W</td><td>${c.maxVoltage} V</td><td>${c.maxAmps} A</td></tr>`;
}

function renderUsbPdCalculatorPage(data) {
  const head = renderHead({
    title: 'Quanti watt arrivano davvero? Calcolatore USB-C Power Delivery — Will It Work?',
    description: 'Stima teorica della potenza di ricarica USB-C in base a cavo, alimentatore e dispositivo, con le fonti tecniche ufficiali USB-IF.',
    ogTitle: 'Quanti watt arrivano davvero? Calcolatore USB-C Power Delivery',
    ogDescription: 'Stima teorica della potenza di ricarica USB-C in base a cavo, alimentatore e dispositivo.',
    ogType: 'article',
    twitterTitle: 'Quanti watt arrivano davvero? Calcolatore USB-C Power Delivery',
    twitterDescription: 'Stima teorica della potenza di ricarica USB-C in base a cavo, alimentatore e dispositivo.',
    iconHref: '/will-it-work-logo.png',
    canonical: 'https://willitwork.it/calcolatori/usb-c-power-delivery',
    includeWebsiteLdJson: false,
  });

  const cableOptions = data.cableOptions
    .map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`)
    .join('');
  const deviceOptions = data.devicePresets
    .map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.label)}${d.watts != null ? ` (${d.watts} W)` : ''}</option>`)
    .join('');
  const cableTableRows = data.cableOptions.map(renderUsbPdCableTableRow).join('');

  const body = `<main class="guide-page">${headerGuideNav(
    '/#checker',
    'Verifica un prodotto'
  )}<article class="guide-article"><nav aria-label="Percorso"><a href="/">Home</a><span>›</span><span>Calcolatori</span></nav><div class="guide-kicker">CALCOLATORE</div><h1>Quanti watt arrivano davvero?</h1><p class="guide-lead">Cavo, alimentatore e dispositivo: la potenza reale è sempre il valore più basso dei tre. Stima teorica secondo lo standard USB Power Delivery.</p><div class="checker-shell" id="usb-pd-calc"><form id="usb-pd-form"><div class="checker-title"><span class="live-dot"></span><div><strong>Calcola la potenza di ricarica</strong><small>Stima teorica secondo lo standard USB-IF</small></div></div><label for="cable-select">Cosa c'è scritto sul cavo (wattaggio massimo)?</label><div class="input-wrap"><span class="input-icon">⌁</span><select id="cable-select">${cableOptions}</select></div><div class="connector"><span>+</span></div><label for="charger-watts">Wattaggio massimo dichiarato dall'alimentatore</label><div class="input-wrap"><span class="input-icon">↗</span><input id="charger-watts" type="number" min="0" step="1" placeholder="Es. 65"/></div><div class="connector"><span>+</span></div><label for="device-select">Wattaggio richiesto dal dispositivo</label><div class="input-wrap"><span class="input-icon">⌁</span><select id="device-select">${deviceOptions}</select></div><div class="input-wrap" id="device-custom-wrap" hidden><input id="device-watts-custom" type="number" min="0" step="1" placeholder="Es. 45"/></div></form><div class="tool-disclaimer">⚠ ${escapeHtml(
    data.disclaimer
  )}</div><div id="tool-result" class="checker-result" hidden aria-live="polite"></div></div><section class="guide-copy"><h2>Tabella dei profili di potenza standard</h2><table class="anchor-table"><thead><tr><th>Wattaggio dichiarato sul cavo</th><th>Potenza massima</th><th>Tensione massima</th><th>Corrente massima</th></tr></thead><tbody>${cableTableRows}</tbody></table><h2>Se non sai cosa c'è scritto sul cavo</h2><p>${escapeHtml(
    data.fallbackExplanation
  )}</p><h2>Attenzione alla sicurezza sopra i 60W</h2><p>${escapeHtml(
    data.safetyNote
  )}</p><h2>La velocità reale può differire</h2><p>${escapeHtml(
    data.expectationsNote
  )}</p><p class="guide-source">Fonti: ${renderSourceLinks(data.sources)}</p></section></article>${footerCatalog()}</main><script type="application/json" id="usb-pd-rules">${JSON.stringify(
    data
  )}</script><script src="/assets/usb-pd-calculator.js" defer></script>`;

  return `<!DOCTYPE html><html lang="it"><head>${head}</head><body>${body}</body></html>`;
}

module.exports = {
  renderHomePage,
  renderCatalogPage,
  renderGuidePage,
  renderPrivacyPage,
  renderAffiliazionePage,
  renderWallAnchorCalculatorPage,
  renderBatteryCheckerPage,
  renderUsbPdCalculatorPage,
};
