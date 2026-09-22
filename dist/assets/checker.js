(function () {
  'use strict';

  var deviceInput, productInput, checkButton, resultBox, form;
  var index = null;

  function normalize(s) {
    return (s || '')
      .toString()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  function tokenize(s) {
    return normalize(s)
      .replace(/([a-z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-z])/g, '$1 $2')
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  }

  function coverage(inputTokens, fieldTokens) {
    if (!inputTokens.length) return 0;
    var set = {};
    for (var i = 0; i < fieldTokens.length; i++) set[fieldTokens[i]] = true;
    var matched = 0;
    for (var j = 0; j < inputTokens.length; j++) if (set[inputTokens[j]]) matched++;
    return matched / inputTokens.length;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function findMatches(deviceQuery, productQuery) {
    var dTokens = tokenize(deviceQuery);
    var pTokens = tokenize(productQuery);
    var scored = index.map(function (entry) {
      var dScore = coverage(dTokens, entry._deviceTokens);
      var pScore = coverage(pTokens, entry._productTokens);
      return { entry: entry, dScore: dScore, pScore: pScore, combined: (dScore + pScore) / 2 };
    });
    scored.sort(function (a, b) {
      return b.combined - a.combined;
    });
    return scored;
  }

  function showMessage(html) {
    resultBox.hidden = false;
    resultBox.innerHTML = html;
  }

  function renderNoMatch(deviceQuery, productQuery, suggestions) {
    var head = suggestions.length
      ? '<p class="checker-result-label">Nessuna corrispondenza esatta. Forse cercavi:</p>'
      : '<p class="checker-result-empty">Nessuna verifica trovata per &laquo;' +
        escapeHtml(deviceQuery) +
        '&raquo; + &laquo;' +
        escapeHtml(productQuery) +
        '&raquo;.</p>';

    var list = suggestions.length
      ? '<div class="checker-result-list">' +
        suggestions
          .map(function (s) {
            return (
              '<a class="checker-result-item" href="/compatibilita/' +
              encodeURIComponent(s.entry.slug) +
              '/"><span>' +
              escapeHtml(s.entry.device) +
              '</span><strong>' +
              escapeHtml(s.entry.title) +
              '</strong></a>'
            );
          })
          .join('') +
        '</div>'
      : '';

    showMessage(head + list + '<a class="checker-result-all" href="/compatibilita">Esplora tutte le verifiche &rarr;</a>');
  }

  function runSearch() {
    if (!index) return;
    var deviceQuery = deviceInput.value.trim();
    var productQuery = productInput.value.trim();

    if (!deviceQuery || !productQuery) {
      showMessage('<p class="checker-result-empty">Scrivi sia il dispositivo che il prodotto da controllare.</p>');
      return;
    }

    var scored = findMatches(deviceQuery, productQuery);
    var best = scored[0];

    // Confident match: the device is fully recognised and most of the
    // product wording lines up with an existing guide -> go straight there.
    if (best && best.dScore >= 0.999 && best.pScore >= 0.6) {
      window.location.href = '/compatibilita/' + encodeURIComponent(best.entry.slug) + '/';
      return;
    }

    // A minimum combined score avoids surfacing pure coincidences (e.g. a
    // short unit token like "w" or "v" matching by chance on an otherwise
    // unrelated device/product with no other overlap).
    var suggestions = scored.filter(function (s) {
      return s.combined >= 0.34;
    }).slice(0, 3);
    renderNoMatch(deviceQuery, productQuery, suggestions);
  }

  function wireExampleButtons(selector) {
    var buttons = document.querySelectorAll(selector);
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var device = btn.getAttribute('data-device');
        var product = btn.getAttribute('data-product');
        if (!device || !product) return;
        btn.addEventListener('click', function () {
          deviceInput.value = device;
          productInput.value = product;
          runSearch();
        });
      })(buttons[i]);
    }
  }

  function wireDetailHelper() {
    var buttons = document.querySelectorAll('.detail-helper button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var label = this.textContent.replace(/^\+\s*/, '').trim();
        var current = productInput.value.trim();
        productInput.value = current ? current + ' · ' + label : label;
        productInput.focus();
      });
    }
  }

  function wireLinkImport() {
    var urlInput = document.getElementById('product-url');
    if (!urlInput) return;
    var useLinkBtn = urlInput.parentElement ? urlInput.parentElement.querySelector('button') : null;
    if (!useLinkBtn) return;
    useLinkBtn.addEventListener('click', function () {
      var raw = urlInput.value.trim();
      if (!raw) return;
      var url;
      try {
        url = new URL(raw);
      } catch (e) {
        return;
      }
      var segments = url.pathname.split('/').filter(function (s) {
        return s.length > 3 && !/^\d+$/.test(s);
      });
      if (!segments.length) return;
      var guess = decodeURIComponent(segments[segments.length - 1])
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      if (guess) productInput.value = guess;
    });
  }

  function init() {
    form = deviceInput && deviceInput.form;
    checkButton = document.querySelector('.check-button');
    resultBox = document.getElementById('checker-result');
    if (!form || !checkButton || !resultBox) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch();
    });

    wireExampleButtons('.popular-grid button');
    wireExampleButtons('.examples button');
    wireDetailHelper();
    wireLinkImport();

    fetch('/search-index.json')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        index = data.map(function (e) {
          return {
            slug: e.slug,
            device: e.device,
            product: e.product,
            title: e.title,
            _deviceTokens: tokenize(e.device),
            _productTokens: tokenize(e.product),
          };
        });
        checkButton.disabled = false;
      })
      .catch(function () {
        // Index failed to load: leave the button disabled. The rest of the
        // page (including the /compatibilita link) still works with no JS.
      });
  }

  function ready() {
    deviceInput = document.getElementById('device');
    productInput = document.getElementById('product');
    if (!deviceInput || !productInput) return;
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
