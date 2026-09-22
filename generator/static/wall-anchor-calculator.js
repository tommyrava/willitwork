(function () {
  'use strict';

  var rules, resultBox, wallToggle, solidFields, hollowFields, diameterButtons, hollowToggle, panelInput;
  var state = { wall: 'solid', diameter: null, hollowType: 'selfdrilling' };

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

  function setActive(buttons, predicate) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('active', predicate(buttons[i]));
    }
  }

  function renderSolidResult() {
    var row = rules.solidWall.rows.filter(function (r) {
      return r.plugDiameter === state.diameter;
    })[0];
    if (!row) return;

    var badge =
      row.sources.length >= 2
        ? '<span class="source-badge source-badge-ok">✓ ' + row.sources.length + ' fonti indipendenti</span>'
        : '<span class="source-badge source-badge-warn">⚠ fonte singola — verifica sulla confezione</span>';

    resultBox.hidden = false;
    resultBox.innerHTML =
      '<p class="checker-result-label">Tassello ' +
      row.plugDiameter +
      ' mm — ' +
      rules.solidWall.plugType +
      '</p>' +
      '<div class="checker-result-item"><span>FORO DA PRATICARE</span><strong>' +
      row.holeDiameter +
      ' mm</strong></div>' +
      '<div class="checker-result-item"><span>VITE COMPATIBILE</span><strong>' +
      row.screwMin +
      '–' +
      row.screwMax +
      ' mm</strong></div>' +
      '<p>' +
      badge +
      '<br/><small>' +
      sourceLinksHtml(row.sources) +
      '</small></p>';
  }

  function renderHollowResult() {
    var h = rules.hollowWall;
    resultBox.hidden = false;

    if (state.hollowType === 'selfdrilling') {
      var t = parseFloat((panelInput.value || '').replace(',', '.'));
      var sd = h.selfDrilling;
      var fitNote;
      if (!t) {
        fitNote = '<p class="checker-result-empty">Inserisci lo spessore della lastra per una verifica precisa.</p>';
      } else if (t < sd.minPanelThickness) {
        fitNote =
          '<p class="checker-result-empty">Lastra più sottile di ' +
          sd.minPanelThickness +
          ' mm: verifica sulla confezione, potrebbe non garantire una presa sufficiente.</p>';
      } else if (t > sd.maxPanelThicknessNoPreDrill) {
        fitNote =
          '<p class="checker-result-empty">Oltre ' +
          sd.maxPanelThicknessNoPreDrill +
          ' mm questo tipo di tassello autoforante potrebbe non essere adatto: valuta un tassello a espansione/ancora.</p>';
      } else {
        fitNote = '<p class="checker-result-empty">Spessore compatibile con l’installazione senza preforo.</p>';
      }

      resultBox.innerHTML =
        '<p class="checker-result-label">' +
        escapeHtml(sd.plugType) +
        '</p>' +
        '<div class="checker-result-item"><span>FORO</span><strong>Nessun foro necessario</strong></div>' +
        '<div class="checker-result-item"><span>VITE COMPATIBILE</span><strong>' +
        sd.screwMin +
        '–' +
        sd.screwMax +
        ' mm</strong></div>' +
        fitNote +
        '<p><small>' +
        sourceLinksHtml(sd.sources) +
        '</small></p>';
    } else {
      var tg = h.toggleType;
      resultBox.innerHTML =
        '<p class="checker-result-label">' +
        escapeHtml(tg.plugType) +
        '</p>' +
        '<p class="checker-result-empty">' +
        escapeHtml(tg.note) +
        '</p>' +
        '<p><small>' +
        sourceLinksHtml(tg.sources) +
        '</small></p>';
    }
  }

  function render() {
    if (state.wall === 'solid') {
      renderSolidResult();
    } else {
      renderHollowResult();
    }
  }

  function init() {
    var dataEl = document.getElementById('wall-anchor-rules');
    resultBox = document.getElementById('tool-result');
    wallToggle = document.getElementById('wall-type-toggle');
    solidFields = document.getElementById('solid-wall-fields');
    hollowFields = document.getElementById('hollow-wall-fields');
    diameterButtons = document.getElementById('plug-diameter-buttons');
    hollowToggle = document.getElementById('hollow-type-toggle');
    panelInput = document.getElementById('panel-thickness');

    if (!dataEl || !resultBox || !wallToggle || !diameterButtons) return;

    try {
      rules = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    state.diameter = rules.solidWall.rows[0].plugDiameter;

    var wallButtons = wallToggle.querySelectorAll('button');
    for (var i = 0; i < wallButtons.length; i++) {
      wallButtons[i].addEventListener('click', function () {
        state.wall = this.getAttribute('data-wall');
        setActive(wallButtons, function (b) {
          return b === this;
        }.bind(this));
        solidFields.hidden = state.wall !== 'solid';
        hollowFields.hidden = state.wall !== 'hollow';
        render();
      });
    }

    var diamButtons = diameterButtons.querySelectorAll('button');
    for (var j = 0; j < diamButtons.length; j++) {
      diamButtons[j].addEventListener('click', function () {
        state.diameter = parseInt(this.getAttribute('data-diameter'), 10);
        setActive(diamButtons, function (b) {
          return b === this;
        }.bind(this));
        render();
      });
    }

    if (hollowToggle) {
      var hollowButtons = hollowToggle.querySelectorAll('button');
      for (var k = 0; k < hollowButtons.length; k++) {
        hollowButtons[k].addEventListener('click', function () {
          state.hollowType = this.getAttribute('data-hollow');
          setActive(hollowButtons, function (b) {
            return b === this;
          }.bind(this));
          render();
        });
      }
    }

    if (panelInput) {
      panelInput.addEventListener('input', function () {
        if (state.wall === 'hollow') render();
      });
    }

    var form = document.getElementById('wall-anchor-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        render();
      });
    }

    // Show a result immediately so the tool feels alive as soon as JS loads.
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
