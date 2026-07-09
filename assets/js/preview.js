(function () {
  var wrap = document.getElementById('preview-frame-wrap');
  var buttons = document.querySelectorAll('[data-preview-device]');
  if (!wrap || !buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var device = btn.getAttribute('data-preview-device');
      wrap.classList.remove('preview-frame-wrap--tablet', 'preview-frame-wrap--mobile');
      if (device === 'tablet') wrap.classList.add('preview-frame-wrap--tablet');
      if (device === 'mobile') wrap.classList.add('preview-frame-wrap--mobile');

      buttons.forEach(function (other) {
        other.classList.toggle('is-active', other === btn);
        other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
      });
    });
  });
})();
