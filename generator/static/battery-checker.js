(function () {
  'use strict';

  var data, formatsById, variantsById;
  var deviceSelect, haveSelect, resultBox;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function sourceLinksHtml(sources) {
    return sources
      .map(function (s) {
        return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(s.label) + ' ↗</a>';
      })
      .join(', ');
  }

  function verdictHtml(level, label) {
    var icon = level === 'yes' ? '✓' : level === 'no' ? '×' : '!';
    return (
      '<div class="guide-verdict ' +
      level +
      '"><span>' +
      icon +
      '</span><div><small>VERDETTO</small><h2>' +
      escapeHtml(label) +
      '</h2></div></div>'
    );
  }

  function extra18650Html(deviceVariant, haveVariant) {
    var involves18650 = deviceVariant.formatId === '18650' || haveVariant.formatId === '18650';
    if (!involves18650) return '';
    var f = formatsById['18650'];
    return (
      '<div class="battery-safety-note">🛡 <strong>Controllo di sicurezza aggiuntivo — 18650</strong>' +
      escapeHtml(f.extraWarning) +
      '</div>'
    );
  }

  function render(deviceVariant, haveVariant) {
    resultBox.hidden = false;

    if (deviceVariant.id === haveVariant.id) {
      var f0 = formatsById[deviceVariant.formatId];
      resultBox.innerHTML =
        verdictHtml('yes', 'Sì, compatibile') +
        extra18650Html(deviceVariant, haveVariant) +
        '<p class="checker-result-empty">Stesso formato esatto (' +
        escapeHtml(deviceVariant.label) +
        ').</p>' +
        '<p><small>' +
        sourceLinksHtml([f0.source]) +
        '</small></p>';
      return;
    }

    var deviceFormat = formatsById[deviceVariant.formatId];
    var haveFormat = formatsById[haveVariant.formatId];

    // Same physical format (identical dimensions), different chemistry/voltage: AA alkaline vs AA NiMH etc.
    if (deviceVariant.formatId === haveVariant.formatId) {
      var warning =
        deviceVariant.voltage > haveVariant.voltage ? data.nimhLowerVoltageWarning : data.nimhHigherVoltageWarning;
      resultBox.innerHTML =
        verdictHtml('limited', 'Sì, ma con attenzione') +
        extra18650Html(deviceVariant, haveVariant) +
        '<p class="checker-result-empty">' +
        escapeHtml(warning) +
        '</p>' +
        '<p><small>' +
        sourceLinksHtml([deviceFormat.source]) +
        '</small></p>';
      return;
    }

    // Same coin-cell group (CR2032/CR2025/CR2016): same diameter, different thickness.
    if (deviceFormat.coinGroup && deviceFormat.coinGroup === haveFormat.coinGroup) {
      var haveThinner = haveFormat.thicknessMax < deviceFormat.thicknessMin;
      var haveThicker = haveFormat.thicknessMin > deviceFormat.thicknessMax;
      var coinWarning = haveThinner ? data.coinThinnerWarning : haveThicker ? data.coinThickerWarning : data.coinThinnerWarning;
      resultBox.innerHTML =
        verdictHtml('limited', 'Sì, ma con attenzione') +
        extra18650Html(deviceVariant, haveVariant) +
        '<p class="checker-result-empty">' +
        escapeHtml(coinWarning) +
        '</p>' +
        '<p><small>' +
        sourceLinksHtml([deviceFormat.source, haveFormat.source]) +
        '</small></p>';
      return;
    }

    // No dimensional or electrical relationship.
    resultBox.innerHTML =
      verdictHtml('no', 'No, non compatibile') +
      extra18650Html(deviceVariant, haveVariant) +
      '<p class="checker-result-empty">' +
      escapeHtml(deviceVariant.label) +
      ' e ' +
      escapeHtml(haveVariant.label) +
      ' hanno dimensioni e/o voltaggio diversi e non sono intercambiabili.</p>' +
      '<p><small>' +
      sourceLinksHtml([deviceFormat.source, haveFormat.source]) +
      '</small></p>';
  }

  function onChange() {
    var deviceVariant = variantsById[deviceSelect.value];
    var haveVariant = variantsById[haveSelect.value];
    if (!deviceVariant || !haveVariant) return;
    render(deviceVariant, haveVariant);
  }

  function init() {
    var dataEl = document.getElementById('battery-rules');
    deviceSelect = document.getElementById('device-battery');
    haveSelect = document.getElementById('have-battery');
    resultBox = document.getElementById('tool-result');
    if (!dataEl || !deviceSelect || !haveSelect || !resultBox) return;

    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    formatsById = {};
    data.formats.forEach(function (f) {
      formatsById[f.id] = f;
    });
    variantsById = {};
    data.variants.forEach(function (v) {
      variantsById[v.id] = v;
    });

    deviceSelect.addEventListener('change', onChange);
    haveSelect.addEventListener('change', onChange);

    var form = document.getElementById('battery-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        onChange();
      });
    }

    // Pick two different defaults so the tool shows something meaningful right away.
    if (haveSelect.options.length > 1) haveSelect.selectedIndex = 1;
    onChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
