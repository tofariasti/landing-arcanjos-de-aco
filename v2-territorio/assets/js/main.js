(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initSmoothScroll();
    initCounters();
    initFaq();
    initHeroRotator();
    initMovimentoBg();
    initEventCountdown();
    initUltimoRole();
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
    var left = document.getElementById('hero-rotator-left');
    var right = document.getElementById('hero-rotator-right');
    if ((!left && !right) || !window.ArcanjosInstagram || prefersReducedMotion) return;

    function bindFrame(frame, startIndex, step) {
      if (!frame) return;
      var img = frame.querySelector('img');
      if (!img) return;
      ArcanjosInstagram.load().then(function (items) {
        if (!items.length) return;
        var idx = startIndex % items.length;
        setInterval(function () {
          idx = (idx + step) % items.length;
          img.classList.add('is-fading');
          setTimeout(function () {
            img.src = items[idx].file;
            if (frame.id === 'hero-rotator-right') {
              img.alt = items[idx].alt || 'Arcanjos de Aço MC';
            }
            img.classList.remove('is-fading');
          }, 400);
        }, 4500);
      }).catch(function () {});
    }

    /* Offset indices so left/right rarely show the same frame */
    bindFrame(left, 1, 2);
    bindFrame(right, 0, 2);
  }

  function initMovimentoBg() {
    var section = document.getElementById('movimento');
    var media = document.getElementById('movimento-media');
    if (!section || !media) return;

    var prefersReducedData = false;
    try {
      prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
    } catch (_) { /* unsupported */ }

    var useStatic = prefersReducedMotion || prefersReducedData;
    var clipMs = 9000;
    var activeIndex = 0;
    var layers = [];
    var timer = null;
    var inView = false;

    function showLayer(index) {
      if (!layers.length) return;
      activeIndex = (index + layers.length) % layers.length;
      layers.forEach(function (layer, i) {
        var on = i === activeIndex;
        layer.classList.toggle('is-active', on);
        if (layer.tagName === 'VIDEO') {
          if (on && inView && !useStatic) {
            layer.currentTime = 0;
            var playPromise = layer.play();
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch(function () {
                section.classList.add('is-static');
              });
            }
          } else {
            layer.pause();
          }
        }
      });
    }

    function startCycle() {
      if (useStatic || layers.length < 2 || timer) return;
      timer = setInterval(function () {
        if (!inView) return;
        showLayer(activeIndex + 1);
      }, clipMs);
    }

    function stopCycle() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    fetch('assets/data/instagram-reels.json')
      .then(function (res) {
        if (!res.ok) throw new Error('reels json missing');
        return res.json();
      })
      .then(function (items) {
        if (!items || !items.length) {
          section.hidden = true;
          return;
        }

        section.hidden = false;
        media.innerHTML = '';
        layers = [];

        items.slice(0, 4).forEach(function (item, index) {
          if (useStatic || !item.video) {
            if (!item.poster) return;
            var img = document.createElement('img');
            img.src = item.poster;
            img.alt = '';
            img.decoding = 'async';
            if (index === 0) img.classList.add('is-active');
            media.appendChild(img);
            layers.push(img);
            return;
          }

          var video = document.createElement('video');
          video.muted = true;
          video.playsInline = true;
          video.setAttribute('playsinline', '');
          video.preload = index === 0 ? 'metadata' : 'none';
          video.loop = items.length === 1;
          if (item.poster) video.poster = item.poster;
          var source = document.createElement('source');
          source.src = item.video;
          source.type = 'video/mp4';
          video.appendChild(source);
          if (index === 0) video.classList.add('is-active');
          media.appendChild(video);
          layers.push(video);
        });

        if (!layers.length) {
          section.hidden = true;
          return;
        }

        if (useStatic) {
          section.classList.add('is-static');
          showLayer(0);
          return;
        }

        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
            if (inView) {
              showLayer(activeIndex);
              startCycle();
            } else {
              stopCycle();
              layers.forEach(function (layer) {
                if (layer.tagName === 'VIDEO') layer.pause();
              });
            }
          });
        }, { threshold: [0, 0.25, 0.5] });

        observer.observe(section);
      })
      .catch(function () {
        section.hidden = true;
      });
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

})();
