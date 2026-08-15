/* 李小勇 Xiaoyong Li · personal homepage interactions
   v2: tabbed sections + publication year filter */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TABS = ['about', 'timeline', 'publications', 'honors', 'service'];

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

  /* ---- tabbed sections ---- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.links a[href^="#"]'));
  var activateTab = function (id, scroll) {
    if (TABS.indexOf(id) === -1) id = 'about';
    document.body.classList.add('tabs-enabled');
    TABS.forEach(function (s) {
      var el = document.getElementById(s);
      if (el) el.classList.toggle('active', s === id);
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
    if (scroll) {
      var sec = document.getElementById(id);
      if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };
  var tabFromHash = function () { return (location.hash || '#about').replace('#', ''); };

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (TABS.indexOf(id) === -1) return; // #top etc. keep default behavior
      e.preventDefault();
      if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
      activateTab(id, true);
    });
  });
  window.addEventListener('hashchange', function () { activateTab(tabFromHash(), true); });
  activateTab(tabFromHash(), false);

  /* ---- reveal on scroll (staggered) ---- */
  var revealEls = document.querySelectorAll('.pub, .honor-card, .tl-item');
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
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- publication filters (type + year) ---- */
  var applyFilters = function () {
    var f = (document.querySelector('.pub-filters .pf.active[data-f]') || {}).getAttribute ? document.querySelector('.pub-filters .pf.active[data-f]').getAttribute('data-f') : 'all';
    var y = (document.querySelector('.pub-filters.year .pf.active') || {}).getAttribute ? document.querySelector('.pub-filters.year .pf.active').getAttribute('data-year') : 'all';
    document.querySelectorAll('.pub').forEach(function (p) {
      var showType = f === 'all' || p.getAttribute('data-type') === f;
      var py = p.querySelector('.pub-year');
      var showYear = y === 'all' || (py && py.textContent.trim() === y);
      p.classList.toggle('hidden', !(showType && showYear));
    });
  };
  document.querySelectorAll('.pub-filters .pf').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.parentElement.classList.contains('year') ? '.pub-filters.year' : '.pub-filters:not(.year)';
      document.querySelectorAll(group + ' .pf').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilters();
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

  /* ---- back to top / bottom ---- */
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
  var toBottom = document.getElementById('toBottom');
  if (toBottom) {
    var toggleToBottom = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var y = window.scrollY || doc.scrollTop;
      toBottom.classList.toggle('show', max > 0 && y < max - 400);
    };
    window.addEventListener('scroll', toggleToBottom, { passive: true });
    toggleToBottom();
    toBottom.addEventListener('click', function () {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
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

  /* ---- realistic celestial motion: sun & moon orbit the Earth (space view).
         Both rise left (east) and set right (west). Moon phase is computed from the
         sun-moon-earth angle (offset shadow circle: new moon .. full moon). ---- */
  (function () {
    var sun = document.querySelector('.bg-sun');
    var moon = document.querySelector('.moon-pos');
    var moonShadow = document.querySelector('.moon-shadow');
    if (!sun || !moon || typeof performance === 'undefined') return;
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var norm = function (a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
    var EARTH = { x: 50, y: 104, r: 33 };      // earth center & disk radius
    var SUN = { rx: 48, ry: 34, cx: 50, cy: 72, dur: 85000 };  // elliptical arc, left -> right
    var MOON = { r: 46, dur: 50000 };           // circular orbit, left -> right
    var MOON_PX = 32;                           // half of the 64px moon
    var place = function () {
      var t = performance.now();
      // sun: elliptical arc across the sky
      var sp = (t % SUN.dur) / SUN.dur * 2 * Math.PI;
      var sx = SUN.cx - SUN.rx * Math.cos(sp);
      var sy = SUN.cy - SUN.ry * Math.sin(sp);
      var d = Math.sqrt((sx - EARTH.x) * (sx - EARTH.x) + (sy - EARTH.y) * (sy - EARTH.y));
      var op = clamp((d - (EARTH.r - 6)) / 8, 0, 1);
      sun.style.transform = 'translate(' + sx + 'vw,' + sy + 'vh) translate(-50%,-50%)';
      sun.style.opacity = op.toFixed(2);
      // moon: circular orbit, same left->right direction as the sun
      var mp = (t % MOON.dur) / MOON.dur * 2 * Math.PI;
      var mx = EARTH.x - MOON.r * Math.cos(mp);
      var my = EARTH.y - MOON.r * Math.sin(mp);
      moon.style.transform = 'translate(' + mx + 'vw,' + my + 'vh) translate(-50%,-50%)';
      // moon phase: illuminated fraction from sun-moon-earth angle
      if (moonShadow) {
        var sunAng = Math.atan2(sy - EARTH.y, sx - EARTH.x);
        var moonAng = Math.atan2(my - EARTH.y, mx - EARTH.x);
        var theta = norm(moonAng - sunAng);       // 0 = new moon, PI = full moon
        var off = MOON_PX * Math.cos(theta);      // shadow offset (px)
        var rot = Math.atan2(my - sy, mx - sx) * 180 / Math.PI;  // shadow pushed away from sun
        moonShadow.style.transform = 'rotate(' + rot.toFixed(1) + 'deg) translateX(' + off.toFixed(1) + 'px)';
      }
    };
    if (reduceMotion) { place(); return; }
    var tick = function () { place(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  })();
})();
