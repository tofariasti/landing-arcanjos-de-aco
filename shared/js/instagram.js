/**
 * Galeria Instagram compartilhada — Arcanjos de Aço MC
 * Carrega shared/data/instagram.json e renderiza conforme layout.
 */
window.ArcanjosInstagram = (function () {
  'use strict';

  var DATA_URL = '../shared/data/instagram.json';
  var cache = null;
  var lightboxEl = null;
  var lightboxIndex = 0;
  var lightboxItems = [];
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function load(dataUrl) {
    if (cache) return Promise.resolve(cache);
    return fetch(dataUrl || DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('instagram.json not found');
        return res.json();
      })
      .then(function (items) {
        cache = items || [];
        return cache;
      });
  }

  function createImg(item, opts) {
    opts = opts || {};
    var img = document.createElement('img');
    img.src = item.file;
    img.alt = item.alt || 'Arcanjos de Aço MC';
    img.loading = opts.loading || 'lazy';
    img.decoding = 'async';
    if (opts.sizes) img.sizes = opts.sizes;
    if (opts.width) img.width = opts.width;
    if (opts.height) img.height = opts.height;
    return img;
  }

  function renderMasonry(container, items, options) {
    if (!container || !items.length) return;
    options = options || {};
    container.innerHTML = '';
    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', options.ariaLabel || 'Galeria Instagram @arcanjos_de_aco');

    var sizes = ['masonry-item--tall', 'masonry-item--wide', '', 'masonry-item--square'];

    items.forEach(function (item, index) {
      var figure = document.createElement('figure');
      figure.className = 'masonry-item ' + (sizes[index % sizes.length] || '');
      figure.setAttribute('role', 'listitem');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'masonry-item__btn';
      btn.setAttribute('aria-label', 'Ampliar: ' + (item.alt || 'foto do clube'));
      btn.dataset.index = String(index);

      var img = createImg(item, { loading: index < 4 ? 'eager' : 'lazy' });
      btn.appendChild(img);
      figure.appendChild(btn);

      if (item.caption) {
        var cap = document.createElement('figcaption');
        cap.className = 'masonry-item__cap';
        cap.textContent = item.caption;
        figure.appendChild(cap);
      }

      container.appendChild(figure);
    });

    if (options.lightbox !== false) {
      initLightbox(container, items, options.lightboxClass || 'lightbox');
    }

    if (window.ArcanjosReveal && typeof ArcanjosReveal.refresh === 'function') {
      ArcanjosReveal.refresh();
    }
  }

  function renderPolaroidCarousel(container, items, options) {
    if (!container || !items.length) return;
    options = options || {};
    container.innerHTML = '';
    container.setAttribute('aria-label', options.ariaLabel || 'Carrossel polaroid Instagram');

    var track = document.createElement('div');
    track.className = 'polaroid-track';
    track.id = options.trackId || 'polaroid-track';
    track.tabIndex = 0;

    items.forEach(function (item, index) {
      var card = document.createElement('figure');
      card.className = 'polaroid-card';
      card.style.setProperty('--rot', (index % 2 === 0 ? -2 : 3) + 'deg');

      var inner = document.createElement('div');
      inner.className = 'polaroid-card__photo';
      var img = createImg(item, { loading: index < 3 ? 'eager' : 'lazy' });
      inner.appendChild(img);

      var cap = document.createElement('figcaption');
      cap.className = 'polaroid-card__cap';
      if (item.permalink) {
        var link = document.createElement('a');
        link.href = item.permalink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.caption || '@arcanjos_de_aco';
        cap.appendChild(link);
      } else {
        cap.textContent = item.caption || 'Arcanjos de Aço';
      }

      card.appendChild(inner);
      card.appendChild(cap);
      track.appendChild(card);
    });

    container.appendChild(track);

    if (options.prevId && options.nextId) {
      bindCarouselNav(track, options.prevId, options.nextId, options.scrollAmount || 320);
    }
  }

  function renderHorizontalPanels(container, items, options) {
    if (!container || !items.length) return;
    options = options || {};
    container.innerHTML = '';

    items.forEach(function (item, index) {
      var panel = document.createElement('article');
      panel.className = 'ig-panel';
      panel.setAttribute('aria-label', item.alt || 'Foto do clube');

      var media = document.createElement('div');
      media.className = 'ig-panel__media';
      var img = createImg(item, { loading: index < 2 ? 'eager' : 'lazy' });
      media.appendChild(img);

      var overlay = document.createElement('div');
      overlay.className = 'ig-panel__overlay';
      if (item.caption) {
        var p = document.createElement('p');
        p.textContent = item.caption;
        overlay.appendChild(p);
      }
      if (item.permalink) {
        var a = document.createElement('a');
        a.href = item.permalink;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'ig-panel__link';
        a.textContent = '@arcanjos_de_aco';
        overlay.appendChild(a);
      }

      panel.appendChild(media);
      panel.appendChild(overlay);
      container.appendChild(panel);
    });

    if (options.prevId && options.nextId) {
      container.tabIndex = 0;
      bindCarouselNav(container, options.prevId, options.nextId, options.scrollAmount);
    }

    if (window.ArcanjosReveal && typeof ArcanjosReveal.refresh === 'function') {
      ArcanjosReveal.refresh();
    }
  }

  function getCarouselStep(track, amount) {
    if (amount) return amount;
    if (track.children.length) {
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap) || 0;
      return track.children[0].offsetWidth + gap;
    }
    return 320;
  }

  function bindCarouselNav(track, prevId, nextId, amount) {
    var prev = document.getElementById(prevId);
    var next = document.getElementById(nextId);
    var behavior = prefersReducedMotion ? 'auto' : 'smooth';

    function scrollByStep(dir) {
      track.scrollBy({ left: dir * getCarouselStep(track, amount), behavior: behavior });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        scrollByStep(-1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        scrollByStep(1);
      });
    }

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollByStep(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollByStep(1);
      }
    });
  }

  function initLightbox(container, items, className) {
    lightboxItems = items;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.masonry-item__btn');
      if (!btn) return;
      openLightbox(parseInt(btn.dataset.index, 10), className);
    });
  }

  function ensureLightbox(className) {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement('div');
    lightboxEl.className = className || 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Visualização ampliada');
    lightboxEl.hidden = true;
    lightboxEl.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Fechar">&times;</button>' +
      '<button type="button" class="lightbox__prev" aria-label="Foto anterior">&#8249;</button>' +
      '<button type="button" class="lightbox__next" aria-label="Próxima foto">&#8250;</button>' +
      '<figure class="lightbox__figure">' +
      '<img class="lightbox__img" alt="">' +
      '<figcaption class="lightbox__cap"></figcaption>' +
      '</figure>';
    document.body.appendChild(lightboxEl);

    lightboxEl.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox__prev').addEventListener('click', function () { stepLightbox(-1); });
    lightboxEl.querySelector('.lightbox__next').addEventListener('click', function () { stepLightbox(1); });
    lightboxEl.addEventListener('click', function (e) {
      if (e.target === lightboxEl) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightboxEl || lightboxEl.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    return lightboxEl;
  }

  function openLightbox(index, className) {
    var lb = ensureLightbox(className);
    lightboxIndex = index;
    updateLightbox();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lightbox__close').focus();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.hidden = true;
    document.body.style.overflow = '';
  }

  function stepLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
    updateLightbox();
  }

  function updateLightbox() {
    var item = lightboxItems[lightboxIndex];
    if (!item || !lightboxEl) return;
    var img = lightboxEl.querySelector('.lightbox__img');
    var cap = lightboxEl.querySelector('.lightbox__cap');
    img.src = item.file;
    img.alt = item.alt || '';
    cap.textContent = item.caption || '';
  }

  function renderFilmstrip(container, items, options) {
    if (!container || !items.length) return;
    options = options || {};
    container.innerHTML = '';
    container.setAttribute('aria-label', options.ariaLabel || 'Filmstrip Instagram @arcanjos_de_aco');

    var track = document.createElement('div');
    track.className = 'filmstrip-track';
    track.setAttribute('role', 'list');

    var doubled = items.concat(items);
    doubled.forEach(function (item, index) {
      var frame = document.createElement('figure');
      frame.className = 'filmstrip-frame';
      frame.setAttribute('role', 'listitem');

      var img = createImg(item, { loading: index < 4 ? 'eager' : 'lazy' });
      frame.appendChild(img);

      if (item.caption) {
        var cap = document.createElement('figcaption');
        cap.className = 'filmstrip-frame__cap';
        cap.textContent = item.caption;
        frame.appendChild(cap);
      }

      track.appendChild(frame);
    });

    container.appendChild(track);

    if (!prefersReducedMotion && options.autoplay !== false) {
      container.classList.add('filmstrip--active');
    }

    if (window.ArcanjosReveal && typeof ArcanjosReveal.refresh === 'function') {
      ArcanjosReveal.refresh();
    }
  }

  return {
    load: load,
    renderMasonry: renderMasonry,
    renderPolaroidCarousel: renderPolaroidCarousel,
    renderHorizontalPanels: renderHorizontalPanels,
    renderFilmstrip: renderFilmstrip,
    initLightbox: initLightbox
  };
})();
