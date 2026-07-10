(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initNav();
    initSmoothScroll();
    initCounters();
    initFaq();
    initGallery();
    if (window.ArcanjosWhatsApp) {
      ArcanjosWhatsApp.initForm('whatsapp-form', { theme: 'blood' });
      ArcanjosWhatsApp.initFloatButton('#whatsapp-float');
    }
  });

  function initPreloader() {
    var el = document.getElementById('preloader');
    if (!el) return;
    if (prefersReducedMotion) { el.remove(); return; }
    window.addEventListener('load', function () {
      setTimeout(function () {
        el.classList.add('preloader--hidden');
        setTimeout(function () { el.remove(); }, 500);
      }, 1400);
    });
  }

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      menu.classList.toggle('is-open', !open);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href.length <= 1) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (prefersReducedMotion) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target.classList.contains('counted')) return;
        entry.target.classList.add('counted');
        var target = parseInt(entry.target.getAttribute('data-count'), 10);
        var current = 0;
        var step = Math.max(target / 40, 1);
        var timer = setInterval(function () {
          current += step;
          if (current >= target) {
            entry.target.textContent = target;
            clearInterval(timer);
          } else {
            entry.target.textContent = Math.floor(current);
          }
        }, 30);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { observer.observe(el); });
  }

  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (row) {
      var btn = row.querySelector('.faq-item__q');
      var answer = row.querySelector('.faq-item__a');
      if (!btn || !answer) return;
      btn.addEventListener('click', function () {
        var isOpen = row.classList.contains('is-open');
        document.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('is-open');
          var b = other.querySelector('.faq-item__q');
          var a = other.querySelector('.faq-item__a');
          if (b) b.setAttribute('aria-expanded', 'false');
          if (a) a.hidden = true;
        });
        if (!isOpen) {
          row.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          answer.hidden = false;
        }
      });
    });
  }

  function initGallery() {
    var container = document.getElementById('masonry-gallery');
    var meta = document.getElementById('galeria-meta');
    if (!container || !window.ArcanjosInstagram) return;
    ArcanjosInstagram.load().then(function (items) {
      ArcanjosInstagram.renderMasonry(container, items);
      if (meta && items.length) {
        meta.textContent = items.length + ' fotos · clique para ampliar';
      }
    }).catch(function () {});
  }
})();
