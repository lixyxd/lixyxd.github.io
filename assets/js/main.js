/* 李小勇 Xiaoyong Li · personal homepage interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile nav toggle ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.sec, .pub, .honor-card, .contact-card, .tl-item');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('reveal', 'in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('reveal', 'in'); });
  }

  /* ---- publication filter ---- */
  var filters = document.querySelectorAll('.pub-filters .pf');
  var pubs = document.querySelectorAll('.pub');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-f');
      pubs.forEach(function (p) {
        var show = f === 'all' || p.getAttribute('data-type') === f;
        p.classList.toggle('hidden', !show);
      });
    });
  });

  /* ---- scroll progress bar ---- */
  var progress = document.getElementById('scrollProgress');
  var onScroll = function () {
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- back to top ---- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    var toggleToTop = function () {
      toTop.classList.toggle('show', (window.scrollY || document.documentElement.scrollTop) > 420);
    };
    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---- scrollspy: highlight active nav link ---- */
  var navAnchors = document.querySelectorAll('.links a[href^="#"]');
  var sections = [];
  navAnchors.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute('href'));
    if (sec) sections.push({ link: a, sec: sec });
  });
  var spy = function () {
    var pos = (window.scrollY || document.documentElement.scrollTop) + 110;
    var current = null;
    sections.forEach(function (s) {
      if (pos >= s.sec.offsetTop) current = s;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle('active', s === current);
    });
  };
  if (sections.length) {
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  /* ---- hero stats count-up ---- */
  var counters = document.querySelectorAll('.stat b[data-count]');
  if (counters.length) {
    var animate = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      var dur = 1200, start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animate(en.target);
            cio.unobserve(en.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animate);
    }
  }
})();
