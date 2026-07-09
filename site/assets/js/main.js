(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5522999999999';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();

    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: prefersReducedMotion ? 0 : 800,
        easing: 'ease-in-out',
        once: true,
        offset: 80,
        disable: prefersReducedMotion
      });
    }

    initMobileMenu();
    initScrollEffects();
    initSmoothScroll();
    initWhatsAppForm();
    initParticles();
    initCounters();
    initFaq();
    initWhatsAppFloat();
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
      }, 600);
    });
  }

  function initMobileMenu() {
    var menuToggle = document.getElementById('menu-toggle');
    var navMenu = document.getElementById('nav-menu');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var spans = menuToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        var spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  function initScrollEffects() {
    var header = document.getElementById('header');
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function () {
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }

      var current = '';
      sections.forEach(function (section) {
        if (window.scrollY >= section.offsetTop - 150) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#' || href.length <= 1) return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        var header = document.getElementById('header');
        var offset = header ? header.offsetHeight : 0;
        window.scrollTo({
          top: target.offsetTop - offset - 16,
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

      var nome = document.getElementById('nome').value;
      var cidade = document.getElementById('cidade').value;
      var moto = document.getElementById('moto').value;
      var tempoEstrada = document.getElementById('tempo-estrada').value;
      var comoConheceu = document.getElementById('como-conheceu').value;
      var mensagem = document.getElementById('mensagem').value;

      var msg = '*Olá, Arcanjos de Aço! Tenho interesse em fazer parte do clube.*\n\n';
      msg += '🏍️ *Meus dados*\n';
      msg += '• Nome: ' + nome + '\n';
      msg += '• Cidade: ' + cidade + '\n';
      msg += '• Moto: ' + moto + '\n';
      msg += '• Tempo de estrada: ' + tempoEstrada + '\n';
      msg += '• Como conheci: ' + comoConheceu + '\n';
      if (mensagem) msg += '• Mensagem: ' + mensagem + '\n';
      msg += '\nAguardo retorno. Obrigado!';

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
      showToast();
      form.reset();
    });
  }

  function initWhatsAppFloat() {
    var float = document.getElementById('whatsapp-float');
    if (!float) return;

    float.addEventListener('click', function (e) {
      var contact = document.getElementById('contato');
      if (contact && window.scrollY < contact.offsetTop - 200) {
        e.preventDefault();
        var header = document.getElementById('header');
        window.scrollTo({
          top: contact.offsetTop - (header ? header.offsetHeight : 0) - 16,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        setTimeout(function () {
          var first = document.getElementById('nome');
          if (first) first.focus();
        }, 600);
      }
    });

    window.addEventListener('scroll', function () {
      var footer = document.querySelector('.footer');
      var hideNearFooter = footer && window.scrollY + window.innerHeight > footer.offsetTop + 100;
      float.style.opacity = hideNearFooter ? '0' : '1';
      float.style.pointerEvents = hideNearFooter ? 'none' : 'auto';
    });
  }

  function initParticles() {
    if (prefersReducedMotion) return;
    var container = document.getElementById('particles');
    if (!container) return;

    for (var i = 0; i < 25; i++) {
      var particle = document.createElement('div');
      var size = Math.random() * 6 + 3;
      var isGold = Math.random() > 0.6;
      var color = isGold
        ? 'rgba(212,168,75,0.5)'
        : 'rgba(196,30,30,0.4)';
      particle.style.cssText =
        'position:absolute;width:' + size + 'px;height:' + size + 'px;' +
        'background:radial-gradient(circle,' + color + ' 0%,transparent 70%);' +
        'border-radius:50%;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;' +
        'animation:floatParticle ' + (Math.random() * 20 + 15) + 's ease-in-out ' + (Math.random() * 5) + 's infinite;' +
        'pointer-events:none;';
      container.appendChild(particle);
    }
  }

  function initCounters() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          var target = parseInt(entry.target.getAttribute('data-count'), 10);
          animateCounter(entry.target, target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el, target) {
    var current = 0;
    var step = target / 60;
    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 30);
  }

  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('active');
          var otherBtn = other.querySelector('.faq-question');
          var otherAnswer = other.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.hidden = true;
        });

        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          answer.hidden = false;
        }
      });
    });
  }

  function initFormValidation() {
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (input) {
      input.addEventListener('blur', function () { validateField(this); });
    });
  }

  function validateField(field) {
    var group = field.closest('.form-group');
    var existing = group ? group.querySelector('.error-message') : null;
    if (existing) existing.remove();
    field.classList.remove('error');

    if (field.hasAttribute('required') && !field.value.trim()) {
      showFieldError(field, 'Este campo é obrigatório');
      return false;
    }

    return true;
  }

  function showFieldError(field, message) {
    field.classList.add('error');
    var div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    div.style.cssText = 'color:#EF4444;font-size:0.875rem;margin-top:0.25rem;';
    field.parentNode.appendChild(div);
  }

  function showToast() {
    var toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Mensagem enviada! Aguarde nosso contato.</span>';
    toast.style.cssText =
      'position:fixed;top:100px;right:2rem;background:linear-gradient(135deg,#c41e1e,#991b1b);' +
      'color:#fff;padding:1rem 1.5rem;border-radius:1rem;box-shadow:0 10px 25px rgba(0,0,0,0.3);' +
      'display:flex;align-items:center;gap:0.75rem;font-weight:600;z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }
})();
