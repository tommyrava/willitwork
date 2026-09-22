'use strict';

// Static, site-wide copy taken verbatim from the already-indexed pages in
// willitwork.it/ (homepage, catalog, legal pages). None of this is derived
// from data/compatibility-dataset.json because it isn't per-guide content.

const SITE_NAME = 'Will It Work?';
const KEYWORDS = 'compatibilità dispositivi,compatibilità cavi,caricatore compatibile,USB-C,Lightning,Power Delivery';

const WEBSITE_LD_JSON = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Will It Work?',
  url: 'https://willitwork.it/',
  description: 'Verifica gratuitamente la compatibilità tra dispositivi, accessori e ricambi prima di comprare.',
  inLanguage: 'it-IT',
};

// The homepage's "quick examples" strip (3 buttons under the checker form).
// label is the short button text; device/product are what checker.js fills
// the form with (and searches for) when the button is clicked.
const QUICK_EXAMPLES = [
  { label: 'iPhone + USB-A', device: 'iPhone 12', product: 'Cavo USB-A' },
  { label: 'MacBook + 65 W', device: 'MacBook Air M1 2020', product: 'Caricatore USB-C Power Delivery 65W' },
  { label: 'Galaxy + Lightning', device: 'Samsung Galaxy S24', product: 'Cavo Lightning' },
];

// The homepage's "Controlli popolari" grid (8 device/product pairs).
const POPULAR_EXAMPLES = [
  { device: 'iPhone 12', product: 'Cavo USB-C to Lightning' },
  { device: 'iPhone 15', product: 'Cavo USB-C to USB-C' },
  { device: 'Samsung Galaxy S24', product: 'Caricatore USB-C PD 30 W PPS' },
  { device: 'MacBook Air M1 2020', product: 'Caricatore USB-C Power Delivery 65 W' },
  { device: 'HP DeskJet 2720e', product: 'Cartuccia HP 305 nera' },
  { device: 'Epson Expression Home XP-2200', product: 'Cartuccia Epson 604' },
  { device: 'Apple AirTag', product: 'Batteria CR2032 3V' },
  { device: 'Dyson V8', product: 'Filtro post-motore Dyson V8' },
];

const DETAIL_HELPER_BUTTONS = [
  'USB-A → USB-C',
  'USB-C → USB-C',
  'USB-C → Lightning',
  '20 W',
  '30 W PD',
  '65 W PD',
  'PPS',
];

const HOW_IT_WORKS_STEPS = [
  { icon: '⌨', title: 'Inserisci il dispositivo', text: 'Scrivi marca e modello esatto di ciò che già possiedi.' },
  { icon: '⇄', title: 'Aggiungi il prodotto', text: 'Incolla il nome, il codice o la descrizione di ciò che vuoi comprare.' },
  { icon: '✓', title: 'Ottieni il verdetto', text: 'Scopri se funziona, con quali limiti e perché.' },
];

const CATEGORY_CARDS = [
  { icon: '⌁', title: 'Caricatori e cavi', text: 'Watt, porte e protocolli' },
  { icon: '◫', title: 'Filtri e ricambi', text: 'Serie, posizione e codici' },
  { icon: '▦', title: 'Cartucce e toner', text: 'Codici e modelli stampante' },
  { icon: '＋', title: 'Batterie', text: 'Formato, tensione e polarità' },
];

const CATALOG_FILTERS = ['Tutte', 'Smartphone e tablet', 'Computer', 'Stampanti', 'Batterie'];

module.exports = {
  SITE_NAME,
  KEYWORDS,
  WEBSITE_LD_JSON,
  QUICK_EXAMPLES,
  POPULAR_EXAMPLES,
  DETAIL_HELPER_BUTTONS,
  HOW_IT_WORKS_STEPS,
  CATEGORY_CARDS,
  CATALOG_FILTERS,
};
