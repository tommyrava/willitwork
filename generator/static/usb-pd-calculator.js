(function () {
  'use strict';

  var data, resultBox;
  var cableSelect, chargerInput, deviceSelect, deviceCustomWrap, deviceCustomInput;

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

  function pickVoltage(deliveredWatts, maxAmps) {
    var tiers = data.voltageTiers;
    for (var i = 0; i < tiers.length; i++) {
      if (tiers[i] * maxAmps >= deliveredWatts) return tiers[i];
    }
    return tiers[tiers.length - 1];
  }

  function safetyBoxHtml(cable) {
    if (cable.maxWatts <= 60) return '';
    return (
      '<div class="battery-safety-note">🛡 <strong>Attenzione alla sicurezza sopra i 60W</strong>' +
      escapeHtml(data.safetyNote) +
      '</div>'
    );
  }

  function expectationsBoxHtml() {
    return (
      '<div class="usb-pd-expectations-note">⚡ <strong>La velocità reale può differire</strong>' +
      escapeHtml(data.expectationsNote) +
      '</div>'
    );
  }

  function getDeviceWatts() {
    var deviceId = deviceSelect.value;
    var preset = data.devicePresets.filter(function (d) {
      return d.id === deviceId;
    })[0];
    if (!preset) return null;
    if (preset.watts != null) return preset.watts;
    var custom = parseFloat((deviceCustomInput.value || '').replace(',', '.'));
    return isNaN(custom) || custom <= 0 ? null : custom;
  }

  function compute() {
    var cable = data.cableOptions.filter(function (c) {
      return c.id === cableSelect.value;
    })[0];
    var chargerWatts = parseFloat((chargerInput.value || '').replace(',', '.'));
    var deviceWatts = getDeviceWatts();

    resultBox.hidden = false;

    if (!cable || isNaN(chargerWatts) || chargerWatts <= 0 || !deviceWatts) {
      resultBox.innerHTML =
        '<p class="checker-result-empty">Inserisci il wattaggio dell’alimentatore e scegli (o inserisci) il wattaggio richiesto dal dispositivo per calcolare la stima.</p>';
      return;
    }

    var values = [
      { label: 'cavo', watts: cable.maxWatts },
      { label: 'alimentatore', watts: chargerWatts },
      { label: 'dispositivo', watts: deviceWatts },
    ];
    values.sort(function (a, b) {
      return a.watts - b.watts;
    });
    var bottleneck = values[0];
    var deliveredWatts = bottleneck.watts;

    var voltage = pickVoltage(deliveredWatts, cable.maxAmps);
    var current = Math.min(deliveredWatts / voltage, cable.maxAmps);

    var fallbackHtml = cable.isFallback
      ? '<p class="checker-result-empty">' + escapeHtml(data.fallbackExplanation) + '</p>'
      : '';

    var bottleneckText =
      bottleneck.label === 'dispositivo'
        ? 'Il dispositivo assorbe solo quanto gli serve: cavo e alimentatore permetterebbero di più.'
        : 'Il fattore limitante è ' + bottleneck.label + ' (' + bottleneck.watts + ' W): il dispositivo potrebbe caricarsi più lentamente di quanto supporterebbe.';

    resultBox.innerHTML =
      '<p class="checker-result-label">Stima teorica</p>' +
      '<div class="checker-result-item"><span>POTENZA STIMATA</span><strong>≈ ' +
      Math.round(deliveredWatts) +
      ' W</strong></div>' +
      '<div class="checker-result-item"><span>TENSIONE / CORRENTE STIMATA</span><strong>' +
      voltage +
      ' V, ' +
      current.toFixed(2) +
      ' A</strong></div>' +
      '<p class="checker-result-empty">' +
      bottleneckText +
      '</p>' +
      fallbackHtml +
      safetyBoxHtml(cable) +
      expectationsBoxHtml() +
      '<p><small>' +
      sourceLinksHtml(data.sources) +
      '</small></p>';
  }

  function onDeviceChange() {
    var isCustom = deviceSelect.value === 'custom';
    deviceCustomWrap.hidden = !isCustom;
    compute();
  }

  function init() {
    var dataEl = document.getElementById('usb-pd-rules');
    resultBox = document.getElementById('tool-result');
    cableSelect = document.getElementById('cable-select');
    chargerInput = document.getElementById('charger-watts');
    deviceSelect = document.getElementById('device-select');
    deviceCustomWrap = document.getElementById('device-custom-wrap');
    deviceCustomInput = document.getElementById('device-watts-custom');

    if (!dataEl || !resultBox || !cableSelect || !chargerInput || !deviceSelect) return;

    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    cableSelect.addEventListener('change', compute);
    chargerInput.addEventListener('input', compute);
    deviceSelect.addEventListener('change', onDeviceChange);
    deviceCustomInput.addEventListener('input', compute);

    var form = document.getElementById('usb-pd-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        compute();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
