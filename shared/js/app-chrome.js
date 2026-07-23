/**
 * Shared mobile app chrome — bottom tab bar + Mais sheet.
 *
 * Body attributes:
 *   data-app-home   — path to v2 home (default "./")
 *   data-app-root   — site root for membros/loja/galeria (auto from home if omitted)
 *   data-app-active — home | capitulos | historia | eventos | more
 *   data-app-chrome="off" — disable
 */
(function (global) {
  'use strict';

  if (global.ArcanjosAppChrome) return;

  var MOBILE_MQ = '(max-width: 640px)';

  function withSlash(path) {
    if (!path) return './';
    if (path.slice(-1) === '/' || path.indexOf('#') !== -1) return path;
    return path + '/';
  }

  function sectionHref(home, hash) {
    var h = withSlash(home);
    if (h === './' || h === '/') return '#' + hash;
    return h + '#' + hash;
  }

  function detectActive() {
    var path = (global.location.pathname || '').replace(/\/+$/, '');
    if (/\/membros$/i.test(path) || /\/galeria$/i.test(path) || /\/loja$/i.test(path)) {
      return 'more';
    }
    var hash = (global.location.hash || '').replace(/^#/, '');
    if (hash === 'capitulos' || hash === 'historia' || hash === 'eventos' || hash === 'home') {
      return hash;
    }
    return 'home';
  }

  function setMenuOpen(open) {
    var more = document.getElementById('app-more');
    var menu = document.getElementById('app-sheet');
    if (!menu) return;

    if (open) {
      menu.hidden = false;
      void menu.offsetWidth;
      menu.classList.add('is-open');
    } else {
      menu.classList.remove('is-open');
      var onEnd = function (e) {
        if (e.target !== menu.querySelector('.app-sheet__panel')) return;
        menu.removeEventListener('transitionend', onEnd);
        if (!menu.classList.contains('is-open')) menu.hidden = true;
      };
      menu.addEventListener('transitionend', onEnd);
      global.setTimeout(function () {
        if (!menu.classList.contains('is-open')) menu.hidden = true;
      }, 350);
    }

    document.body.classList.toggle('is-menu-open', open);
    if (more) more.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function injectChrome(home, root, active) {
    if (document.getElementById('app-tabbar')) return;

    var path = (global.location.pathname || '').replace(/\/+$/, '');
    var links = [
      { href: sectionHref(home, 'movimento'), label: 'Em movimento' },
      { href: sectionHref(home, 'capitulos'), label: 'Capítulos' },
      { href: sectionHref(home, 'historia'), label: 'História' },
      { href: sectionHref(home, 'garagem'), label: 'Garagem' },
      { href: root + 'membros/', label: 'Irmãos', page: /\/membros$/i },
      { href: root + 'galeria/', label: 'Galeria', page: /\/galeria$/i },
      { href: root + 'loja/', label: 'Loja', page: /\/loja$/i },
      { href: sectionHref(home, 'eventos'), label: 'Eventos' },
      { href: sectionHref(home, 'faq'), label: 'FAQ' }
    ];

    var sheetLinks = links.map(function (item) {
      var current = item.page && item.page.test(path);
      return (
        '<a href="' + item.href + '"' +
        (current ? ' class="is-current" aria-current="page"' : '') +
        '>' + item.label + '</a>'
      );
    }).join('');

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="app-sheet" id="app-sheet" hidden>' +
        '<button type="button" class="app-sheet__backdrop" id="app-sheet-backdrop" aria-label="Fechar menu" tabindex="-1"></button>' +
        '<nav class="app-sheet__panel" aria-label="Mais seções">' +
          '<div class="app-sheet__handle" aria-hidden="true"></div>' +
          '<header class="app-sheet__head">' +
            '<p class="app-sheet__title">Mais</p>' +
            '<button type="button" class="app-sheet__close" id="app-sheet-close" aria-label="Fechar menu">' +
              '<i class="fas fa-xmark" aria-hidden="true"></i>' +
            '</button>' +
          '</header>' +
          '<div class="app-sheet__links">' + sheetLinks + '</div>' +
        '</nav>' +
      '</div>' +
      '<nav class="app-tabbar" id="app-tabbar" aria-label="Navegação rápida">' +
        '<a href="' + sectionHref(home, 'home') + '" class="app-tabbar__item' + (active === 'home' ? ' is-active' : '') + '" data-app-tab="home">' +
          '<i class="fas fa-home" aria-hidden="true"></i><span>Início</span></a>' +
        '<a href="' + sectionHref(home, 'capitulos') + '" class="app-tabbar__item' + (active === 'capitulos' ? ' is-active' : '') + '" data-app-tab="capitulos">' +
          '<i class="fas fa-shield-halved" aria-hidden="true"></i><span>Valores</span></a>' +
        '<a href="' + sectionHref(home, 'historia') + '" class="app-tabbar__item' + (active === 'historia' ? ' is-active' : '') + '" data-app-tab="historia">' +
          '<i class="fas fa-road" aria-hidden="true"></i><span>História</span></a>' +
        '<a href="' + sectionHref(home, 'eventos') + '" class="app-tabbar__item' + (active === 'eventos' ? ' is-active' : '') + '" data-app-tab="eventos">' +
          '<i class="fas fa-calendar-day" aria-hidden="true"></i><span>Eventos</span></a>' +
        '<button type="button" class="app-tabbar__item' + (active === 'more' ? ' is-active' : '') + '" id="app-more" aria-label="Abrir menu" aria-expanded="false" aria-controls="app-sheet">' +
          '<i class="fas fa-ellipsis" aria-hidden="true"></i><span>Mais</span></button>' +
      '</nav>';

    while (wrap.firstChild) {
      document.body.appendChild(wrap.firstChild);
    }
  }

  function bindChrome() {
    var more = document.getElementById('app-more');
    var close = document.getElementById('app-sheet-close');
    var backdrop = document.getElementById('app-sheet-backdrop');
    var menu = document.getElementById('app-sheet');
    if (!menu) return;

    if (more) {
      more.addEventListener('click', function () {
        setMenuOpen(!menu.classList.contains('is-open'));
      });
    }
    if (close) close.addEventListener('click', function () { setMenuOpen(false); });
    if (backdrop) backdrop.addEventListener('click', function () { setMenuOpen(false); });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenuOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenuOpen(false);
    });
  }

  function initTabbarSpy() {
    var tabbar = document.getElementById('app-tabbar');
    if (!tabbar || !global.matchMedia(MOBILE_MQ).matches) return;

    var tabs = Array.prototype.slice.call(tabbar.querySelectorAll('[data-app-tab]'));
    if (!tabs.length) return;

    var sections = tabs.map(function (tab) {
      var id = tab.getAttribute('data-app-tab');
      return { tab: tab, el: document.getElementById(id) };
    }).filter(function (item) { return item.el; });

    if (!sections.length) return;

    function setActive(id) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-app-tab') === id;
        tab.classList.toggle('is-active', on);
        if (on) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
      });
      var more = document.getElementById('app-more');
      if (more) more.classList.remove('is-active');
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setMenuOpen(false);
        setActive(tab.getAttribute('data-app-tab'));
      });
    });

    if (!('IntersectionObserver' in global)) return;

    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (!visible.length) return;
      setActive(visible[0].target.id);
    }, {
      rootMargin: '-35% 0px -50% 0px',
      threshold: [0.08, 0.2, 0.4]
    });

    sections.forEach(function (item) { observer.observe(item.el); });
  }

  function initHeaderScroll() {
    var header = document.querySelector('#top-nav, .page-nav, .loja-nav, [data-app-header]');
    if (!header) return;

    var ticking = false;
    function update() {
      ticking = false;
      header.classList.toggle('is-scrolled', global.scrollY > 18);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      global.requestAnimationFrame(update);
    }
    update();
    global.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    var body = document.body;
    if (!body || body.getAttribute('data-app-chrome') === 'off') return;

    body.classList.add('app-body');
    var home = body.getAttribute('data-app-home') || './';
    var root = body.getAttribute('data-app-root');
    if (!root) {
      var h = withSlash(home);
      root = (h === './' || h === '/') ? '../' : h.replace(/v2-territorio\/?$/, '');
    }
    root = withSlash(root);
    var active = body.getAttribute('data-app-active') || detectActive();

    injectChrome(home, root, active);
    bindChrome();
    initTabbarSpy();
    initHeaderScroll();
  }

  global.ArcanjosAppChrome = {
    init: init,
    setMenuOpen: setMenuOpen
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
