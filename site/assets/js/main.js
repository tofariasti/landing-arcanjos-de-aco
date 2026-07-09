(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5522999999999';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initMobileMenu();
    initSideRail();
    initSmoothScroll();
    initWhatsAppForm();
    initSparks();
    initCounters();
    initFaq();
    initFilmstrip();
    initFormValidation();
  });

  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    if (prefersReducedMotion) {
      preloader.remove();
      return;
    }

    window.addEventListener('load', function () {
      setTimeout(function () {
        preloader.classList.add('preloader--hidden');
        setTimeout(function () { preloader.remove(); }, 500);
      }, 900);
    });
  }

  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var drawer = document.getElementById('mobile-drawer');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      drawer.hidden = open;
      drawer.classList.toggle('is-open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        drawer.hidden = true;
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        drawer.hidden = true;
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  function initSideRail() {
    var links = document.querySelectorAll('.side-rail__link[data-section]');
    var sections = document.querySelectorAll('section[id]');
    if (!links.length) return;

    function updateActive() {
      var current = '';
      sections.forEach(function (section) {
        if (window.scrollY >= section.offsetTop - 200) {
          current = section.id;
        }
      });

      links.forEach(function (link) {
        var match = link.getAttribute('data-section') === current;
        link.classList.toggle('is-active', match);
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href.length <= 1) return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  function initWhatsAppForm() {
    var form = document.getElementById('whatsapp-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = ['nome', 'cidade', 'moto', 'tempo-estrada', 'como-conheceu'];
      var valid = true;
      fields.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !validateField(el)) valid = false;
      });
      if (!valid) return;

      var msg = '*Olá, Arcanjos de Aço! Tenho interesse em fazer parte do clube.*\n\n';
      msg += '🏍️ *Meus dados*\n';
      msg += '• Nome: ' + document.getElementById('nome').value + '\n';
      msg += '• Cidade: ' + document.getElementById('cidade').value + '\n';
      msg += '• Moto: ' + document.getElementById('moto').value + '\n';
      msg += '• Tempo de estrada: ' + document.getElementById('tempo-estrada').value + '\n';
      msg += '• Como conheci: ' + document.getElementById('como-conheceu').value + '\n';
      var mensagem = document.getElementById('mensagem').value;
      if (mensagem) msg += '• Mensagem: ' + mensagem + '\n';
      msg += '\nAguardo retorno. Obrigado!';

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
      showToast();
      form.reset();
    });
  }

  function initSparks() {
    if (prefersReducedMotion) return;
    var container = document.getElementById('particles');
    if (!container) return;

    for (var i = 0; i < 18; i++) {
      var spark = document.createElement('div');
      var size = Math.random() * 4 + 2;
      var warm = Math.random() > 0.5;
      spark.style.cssText =
        'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
        'background:' + (warm ? 'rgba(251,146,60,0.7)' : 'rgba(201,162,39,0.6)') + ';' +
        'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;' +
        'animation:floatSpark ' + (12 + Math.random() * 10) + 's ease-in-out ' + (Math.random() * 4) + 's infinite;' +
        'pointer-events:none;box-shadow:0 0 6px currentColor;';
      container.appendChild(spark);
    }
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
        var step = Math.max(target / 50, 1);
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
    document.querySelectorAll('.faq-row').forEach(function (row) {
      var btn = row.querySelector('.faq-row__q');
      var answer = row.querySelector('.faq-row__a');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = row.classList.contains('is-open');

        document.querySelectorAll('.faq-row').forEach(function (other) {
          other.classList.remove('is-open');
          var otherBtn = other.querySelector('.faq-row__q');
          var otherAnswer = other.querySelector('.faq-row__a');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.hidden = true;
        });

        if (!isOpen) {
          row.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          answer.hidden = false;
        }
      });
    });
  }

  function initFilmstrip() {
    var track = document.getElementById('film-track');
    var prev = document.getElementById('film-prev');
    var next = document.getElementById('film-next');
    if (!track) return;

    var scrollAmount = 300;

    if (prev) {
      prev.addEventListener('click', function () {
        track.scrollBy({ left: -scrollAmount, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        track.scrollBy({ left: scrollAmount, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -scrollAmount, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: scrollAmount, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  }

  function initFormValidation() {
    document.querySelectorAll('.field input, .field select, .field textarea').forEach(function (input) {
      input.addEventListener('blur', function () { validateField(this); });
    });
  }

  function validateField(field) {
    var group = field.closest('.field');
    var existing = group ? group.querySelector('.error-message') : null;
    if (existing) existing.remove();
    field.classList.remove('error');

    if (field.hasAttribute('required') && !field.value.trim()) {
      showFieldError(field, 'Obrigatório');
      return false;
    }
    return true;
  }

  function showFieldError(field, message) {
    field.classList.add('error');
    var div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    div.style.cssText = 'color:#ef4444;font-size:0.8rem;margin-top:0.25rem;';
    field.parentNode.appendChild(div);
  }

  function showToast() {
    var toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Pedido enviado!</span>';
    toast.style.cssText =
      'position:fixed;top:1.5rem;right:1.5rem;background:linear-gradient(135deg,#e85d04,#c2410c);' +
      'color:#030304;padding:1rem 1.5rem;font-weight:700;z-index:10001;display:flex;gap:0.75rem;align-items:center;' +
      'font-family:Barlow Condensed,sans-serif;letter-spacing:0.05em;';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }
})();
