(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initRegistro();
  });

  function padIndex(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function initRegistro() {
    var grid = document.getElementById('registro-grid');
    var meta = document.getElementById('registro-meta');
    if (!grid || !window.ArcanjosInstagram) return;

    ArcanjosInstagram.load()
      .then(function (items) {
        if (meta) {
          meta.textContent =
            items.length + (items.length === 1 ? ' registro' : ' registros') + ' · arquivo visual';
        }

        ArcanjosInstagram.renderMasonry(grid, items, {
          ariaLabel: 'Registro Territorial @arcanjos_de_aco',
          lightboxClass: 'lightbox'
        });

        Array.prototype.forEach.call(grid.querySelectorAll('.masonry-item'), function (item, index) {
          item.classList.add('registro-frame');
          item.style.setProperty('--frame-i', String(index));
          var num = document.createElement('span');
          num.className = 'registro-frame__num';
          num.setAttribute('aria-hidden', 'true');
          num.textContent = padIndex(index + 1);
          item.appendChild(num);
        });
      })
      .catch(function () {
        if (meta) meta.textContent = 'Arquivo indisponível no momento.';
      });
  }
})();
