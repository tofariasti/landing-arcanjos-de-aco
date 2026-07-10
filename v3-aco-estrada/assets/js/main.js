(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initHeroVideo();
    initChapterNav();
    initSmoothScroll();
    initCounters();
    initFaq();
    initGallery();
    if (window.ArcanjosWhatsApp) {
      ArcanjosWhatsApp.initForm('whatsapp-form', { theme: 'ember' });
      ArcanjosWhatsApp.initFloatButton('#whatsapp-float');
    }
  });

  function initHeroVideo() {
    var hero = document.querySelector('.hero');
    var video = document.querySelector('.hero__video');
    if (!hero || !video) return;

    var useStatic = prefersReducedMotion
      || window.matchMedia('(prefers-reduced-data: reduce)').matches;

    if (useStatic) {
      hero.classList.add('is-static');
      video.pause();
      return;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        hero.classList.add('is-static');
      });
    }
  }

  function initChapterNav() {
    var dots = document.querySelectorAll('.chapter-nav__dot');
    var chapters = document.querySelectorAll('.chapter[data-chapter]');
    if (!dots.length || !chapters.length) return;

    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        var href = dot.getAttribute('href');
        if (!href) return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

    if (prefersReducedMotion) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('data-chapter');
        dots.forEach(function (dot) {
          dot.classList.toggle('is-active', dot.getAttribute('data-chapter') === id);
        });
      });
    }, { threshold: 0.4, rootMargin: '-20% 0px -20% 0px' });

    chapters.forEach(function (ch) { observer.observe(ch); });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      if (link.classList.contains('chapter-nav__dot')) return;
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
          if (current >= target) { entry.target.textContent = target; clearInterval(timer); }
          else { entry.target.textContent = Math.floor(current); }
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
    var container = document.getElementById('filmstrip-gallery');
    if (!container || !window.ArcanjosInstagram) return;
    ArcanjosInstagram.load().then(function (items) {
      ArcanjosInstagram.renderFilmstrip(container, items);
    }).catch(function () {});
  }
})();
