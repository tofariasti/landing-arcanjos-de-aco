(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var regionData = {
    costa: { title: 'Costa do Sol', html: '<p><strong>Sede:</strong> Village, Rio das Ostras — RJ</p><p><strong>Fundador:</strong> Zé Alex · <strong>Desde:</strong> 07/09/2017</p><p>Base territorial do Arcanjos de Aço MC. Rolês pela orla, interior e estradas da região.</p>' },
    lagoa: { title: 'Região dos Lagos', html: '<p><strong>Presença:</strong> Rolês regulares por Cabo Frio, Búzios, Araruama.</p><p>Conexão com a cena biker dos Lagos fluminenses.</p>' },
    metro: { title: 'Região Metropolitana', html: '<p><strong>Presença:</strong> Participação em eventos e encontros na capital e Baixada.</p><p>A.A.M.C. representado onde a estrada leva.</p>' }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initSmoothScroll();
    initCounters();
    initFaq();
    initHeroRotator();
    initMap();
    initGallery();
    initEventCountdown();
    initUltimoRole();
    initEventPrefill();
    if (window.ArcanjosWhatsApp) {
      ArcanjosWhatsApp.initForm('whatsapp-form', { theme: 'red' });
      ArcanjosWhatsApp.initFloatButton('#whatsapp-float');
    }
  });

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

  function initHeroRotator() {
    var frame = document.getElementById('hero-rotator');
    if (!frame || !window.ArcanjosInstagram || prefersReducedMotion) return;
    var img = frame.querySelector('img');
    ArcanjosInstagram.load().then(function (items) {
      if (!items.length) return;
      var idx = 0;
      setInterval(function () {
        idx = (idx + 1) % items.length;
        img.classList.add('is-fading');
        setTimeout(function () {
          img.src = items[idx].file;
          img.alt = items[idx].alt || 'Arcanjos de Aço MC';
          img.classList.remove('is-fading');
        }, 400);
      }, 4000);
    }).catch(function () {});
  }

  function initMap() {
    var info = document.getElementById('map-info');
    if (!info) return;
    document.querySelectorAll('.mapa__region').forEach(function (region) {
      function activate() {
        document.querySelectorAll('.mapa__region').forEach(function (r) {
          r.classList.remove('mapa__region--active');
        });
        region.classList.add('mapa__region--active');
        var key = region.getAttribute('data-region');
        var data = regionData[key];
        if (data) {
          info.innerHTML = '<h3>' + data.title + '</h3>' + data.html;
        }
      }
      region.addEventListener('click', activate);
      region.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  function initGallery() {
    var container = document.getElementById('ig-carousel');
    if (!container || !window.ArcanjosInstagram) return;
    ArcanjosInstagram.load().then(function (items) {
      ArcanjosInstagram.renderHorizontalPanels(container, items, {
        prevId: 'carousel-prev',
        nextId: 'carousel-next'
      });
    }).catch(function () {});
  }

  function initEventCountdown() {
    var block = document.getElementById('event-countdown');
    if (!block) return;

    var targetIso = block.getAttribute('data-target');
    var target = targetIso ? new Date(targetIso) : null;
    if (!target || isNaN(target.getTime())) return;

    var daysEl = block.querySelector('[data-countdown="days"]');
    var hoursEl = block.querySelector('[data-countdown="hours"]');
    var minsEl = block.querySelector('[data-countdown="mins"]');
    var secsEl = block.querySelector('[data-countdown="secs"]');
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
      }
      var totalSecs = Math.floor(diff / 1000);
      var days = Math.floor(totalSecs / 86400);
      var hours = Math.floor((totalSecs % 86400) / 3600);
      var mins = Math.floor((totalSecs % 3600) / 60);
      var secs = totalSecs % 60;
      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }

    tick();
    if (!prefersReducedMotion) {
      setInterval(tick, 1000);
    }
  }

  function initUltimoRole() {
    var grid = document.getElementById('ultimo-role-gallery');
    if (!grid || !window.ArcanjosInstagram) return;

    ArcanjosInstagram.load().then(function (items) {
      var slice = items.slice(0, 4);
      if (!slice.length) return;
      grid.innerHTML = slice.map(function (item) {
        var cap = item.caption || item.alt || 'Arcanjos de Aço MC';
        var shortCap = cap.length > 48 ? cap.slice(0, 45) + '…' : cap;
        return (
          '<a class="role-thumb" href="' + (item.permalink || 'https://www.instagram.com/arcanjos_de_aco/') + '" target="_blank" rel="noopener noreferrer">' +
            '<img src="' + item.file + '" alt="' + (item.alt || 'Rolê Arcanjos de Aço MC') + '" loading="lazy" width="400" height="300">' +
            '<span class="role-thumb__cap">' + shortCap + '</span>' +
          '</a>'
        );
      }).join('');
    }).catch(function () {});
  }

  function initEventPrefill() {
    var mensagem = document.getElementById('mensagem');
    if (!mensagem) return;

    document.querySelectorAll('[data-event-prefill]').forEach(function (link) {
      link.addEventListener('click', function () {
        var text = link.getAttribute('data-event-prefill');
        if (text) mensagem.value = text;
      });
    });
  }
})();
