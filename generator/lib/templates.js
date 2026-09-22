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
  return `<header class="nav-wrap"><nav class="nav" aria-label="Navigazione principale"><a class="brand" href="/#top" aria-label="Will It Work, home"><span class="brand-mark"><img src="/will-it-work-logo.png" alt=""/></span><span>Will It Work?</span></a><div class="nav-links"><a href="/#come-funziona">Come funziona</a><a href="/compatibilita">Tutte le verifiche</a><a href="/#categorie">Categorie</a></div><a class="nav-cta" href="/#checker">Prova ora</a></nav></header>`;
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
    (e) => `<button type="button"><span>${escapeHtml(e.device)}</span><strong>${escapeHtml(e.product)}</strong><b>Controlla →</b></button>`
  ).join('');

  const quickButtons = QUICK_EXAMPLES.map((label) => `<button type="button">${escapeHtml(label)}</button>`).join('');

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

  const body = `<main>${headerHome()}<section class="hero" id="top"><div class="hero-glow glow-one"></div><div class="hero-glow glow-two"></div><div class="hero-copy"><div class="pill"><span></span> Compatibilità, senza supposizioni</div><h1>Funzionerà<br/>davvero?</h1><p>Confronta dispositivi, accessori e ricambi prima di comprare. Una risposta chiara, il motivo e le alternative corrette.</p><div class="trust-row"><div><strong>✓</strong> Verdetti spiegati</div><div><strong>✓</strong> Nessuna registrazione</div><div><strong>✓</strong> Risposta immediata</div></div></div><div class="checker-shell" id="checker"><form><div class="checker-title"><span class="live-dot"></span><div><strong>Verifica compatibilità</strong><small>Nessun account richiesto · risposta immediata</small></div></div><label for="device">Cosa possiedi?</label><div class="input-wrap"><span class="input-icon">⌁</span><input id="device" placeholder="Es. MacBook Air M1 2020" autocomplete="off" value=""/></div><div class="connector"><span>+</span></div><label for="product">Cosa vuoi comprare?</label><div class="input-wrap"><span class="input-icon">↗</span><input id="product" placeholder="Es. Cavo USB-A to Lightning" autocomplete="off" value=""/></div><div class="link-import"><label for="product-url">Oppure incolla il link del prodotto <span>facoltativo</span></label><div><input id="product-url" type="url" placeholder="https://..." value=""/><button type="button">Usa link</button></div></div><div class="detail-helper"><span>Aggiungi un dettaglio</span><div>${detailButtons}</div></div><button class="check-button" disabled>Controlla compatibilità <span>→</span></button><div class="examples"><span>Prova un esempio:</span>${quickButtons}</div></form></div></section><section class="popular-section" aria-labelledby="popular-title"><div class="section-heading"><span>PROVA SUBITO</span><h2 id="popular-title">Controlli popolari</h2><p>Scegli un confronto frequente e guarda immediatamente il verdetto.</p></div><div class="popular-grid">${popularButtons}</div></section><section class="how" id="come-funziona"><div class="section-heading"><span>SEMPLICE PER DAVVERO</span><h2>Tre passaggi. Zero acquisti sbagliati.</h2></div><div class="steps">${steps}</div></section><section class="seo-guides" id="guide" aria-labelledby="guides-title"><div class="section-heading"><span>GUIDE VERIFICATE</span><h2 id="guides-title">Risposte che puoi trovare anche su Google.</h2><p>Approfondimenti dedicati ai confronti più comuni, con spiegazione e fonti ufficiali quando disponibili.</p></div><div class="seo-guide-grid">${guideGrid}</div><a class="all-guides-link" href="/compatibilita">Esplora tutte le ${dataset.length} verifiche →</a></section><section class="categories" id="categorie"><div><span class="section-kicker">IN PARTENZA</span><h2>Le categorie dove sbagliare costa di più.</h2><p>Partiamo dai confronti più richiesti. Il catalogo crescerà usando specifiche ufficiali e segnalazioni verificate.</p></div><div class="category-grid">${categoryGrid}</div></section>${footerHome()}</main>`;

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

module.exports = {
  renderHomePage,
  renderCatalogPage,
  renderGuidePage,
  renderPrivacyPage,
  renderAffiliazionePage,
};
