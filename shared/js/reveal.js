(function (global) {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var STAGGER_GROUPS = [
    '.pilares > *',
    '.pillars > *',
    '.quotes__grid > *',
    '.vozes__grid > *',
    '.eventos__agenda > *',
    '.timeline > .timeline__item',
    '.capitulos > .cap',
    '.ritual-steps > li',
    '.admissao__steps > li',
    '.garagem__grid > .moto-card',
    '.estrada-ritual__list > li',
    '.eventos__legend > li',
    '.eventos__ultimo-role__grid > .role-thumb',
    '.loja__grid > .loja-card',
    '.membros__list > .membro',
    '.registro-grid > .masonry-item',
    '.steps > li',
    '.faq__list > .faq-item',
    '.origem__grid > *',
    '.hub-info__grid > .hub-info__item'
  ];

  var SECTION_HEADERS = '.section-head, .chapter-head, .kicker, .eventos__intro, .contato__header, .estrada-ritual__intro, .eventos__ultimo-role__head';

  var ASYNC_SECTION_SELECTORS = ['#masonry-gallery', '#ig-carousel', '#filmstrip-gallery', '#loja-grid', '#membros-list', '#registro-grid', '#galeria-preview'];

  var BLOCK_TARGETS = [
    'main .section-intro',
    '.hub-info',
    '.footer',
    '.hub-footer'
  ];

  var HERO_TARGETS = [
    '.hero__content',
    '.hero__stats',
    '.hero-split__manifesto',
    '.hero-split__visual',
    '.hub-header__brand'
  ];

  var revealObserver = null;
  var observedReveals = new WeakSet();

  function markReveal(el, delayIndex) {
    if (!el || el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    if (typeof delayIndex === 'number') {
      el.style.setProperty('--reveal-delay', (delayIndex % 12) * 0.07 + 's');
    }
  }

  function sectionHasAsyncGrid(section) {
    return ASYNC_SECTION_SELECTORS.some(function (selector) {
      return section.querySelector(selector);
    });
  }

  function revealSectionParts(section) {
    section.querySelectorAll(SECTION_HEADERS).forEach(function (header) {
      markReveal(header);
    });
    section.querySelectorAll('.section-inner > h2, .section-inner > p.kicker, .galeria__sub, .loja__intro, .loja__note, .galeria__shell > .galeria__meta, .galeria__cta').forEach(function (el) {
      if (!el.closest('.has-stagger-children')) markReveal(el);
    });
    section.querySelectorAll('.masonry, .galeria__carousel, .registro-grid, .filmstrip, #masonry-gallery, #ig-carousel, #filmstrip-gallery, #loja-grid, #registro-grid, #galeria-preview').forEach(function (el) {
      el.classList.remove('reveal', 'is-visible');
    });
  }

  function getRevealObserver() {
    if (revealObserver) return revealObserver;

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
        observedReveals.delete(entry.target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 12% 0px' });

    return revealObserver;
  }

  function observeReveals(nodes) {
    if (prefersReducedMotion || !nodes.length) return;
    var observer = getRevealObserver();
    nodes.forEach(function (el) {
      if (observedReveals.has(el)) return;
      observedReveals.add(el);
      observer.observe(el);
    });
  }

  function initHeroEntrance() {
    HERO_TARGETS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        el.classList.add('hero-enter');
        el.style.setProperty('--hero-delay', (0.15 + index * 0.1) + 's');
      });
    });
  }

  function initScrollReveal() {
    var staggered = new Set();

    STAGGER_GROUPS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        if (staggered.has(el)) return;
        staggered.add(el);
        markReveal(el, index);
        if (el.parentElement) {
          el.parentElement.classList.add('has-stagger-children');
        }
      });
    });

    document.querySelectorAll('main > section').forEach(function (section) {
      if (section.id === 'home' || section.classList.contains('hero-split')) return;

      if (section.querySelector('.has-stagger-children') || sectionHasAsyncGrid(section)) {
        revealSectionParts(section);
        return;
      }

      markReveal(section);
    });

    BLOCK_TARGETS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (el.classList.contains('reveal')) return;
        if (el.matches('main > section')) return;
        markReveal(el);
      });
    });

    observeReveals(document.querySelectorAll('.reveal:not(.is-visible)'));
  }

  function refresh() {
    if (prefersReducedMotion) return;

    STAGGER_GROUPS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        if (el.classList.contains('reveal')) return;
        markReveal(el, index);
        if (el.parentElement) {
          el.parentElement.classList.add('has-stagger-children');
        }
      });
    });

    document.querySelectorAll('main > section').forEach(function (section) {
      if (!sectionHasAsyncGrid(section)) return;
      if (section.classList.contains('reveal')) {
        section.classList.remove('reveal', 'is-visible');
      }
      revealSectionParts(section);
    });

    observeReveals(document.querySelectorAll('.reveal:not(.is-visible)'));
  }

  function initNavScroll() {
    var navs = document.querySelectorAll('.nav, .header, .hub-header, .chapter-nav');
    if (!navs.length) return;

    function onScroll() {
      var scrolled = window.scrollY > 24;
      navs.forEach(function (nav) {
        nav.classList.toggle('is-scrolled', scrolled);
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    document.documentElement.classList.add('reveal-ready');
    if (prefersReducedMotion) return;
    initHeroEntrance();
    initScrollReveal();
    initNavScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.ArcanjosReveal = { init: init, refresh: refresh };
})(typeof window !== 'undefined' ? window : this);
