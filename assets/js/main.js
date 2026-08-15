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

  /* ---- nav clock + lunar + weather (IP-based) ---- */
  var navDate = document.getElementById('navDate');
  var navLunar = document.getElementById('navLunar');
  var navTime = document.getElementById('navTime');
  var navWeather = document.getElementById('navWeather');
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  /* ---- lunar calendar (1900-2100) ---- */
  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var MONTH_CN = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  var DAY_CN = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  var LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520];
  var lYearDays = function (y) {
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
    return sum + leapDays(y);
  };
  var leapMonth = function (y) { return LUNAR_INFO[y - 1900] & 0xf; };
  var leapDays = function (y) {
    if (leapMonth(y)) return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
    return 0;
  };
  var monthDays = function (y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; };
  var solar2lunar = function (y, m, d) {
    var base = new Date(1900, 0, 31);
    var offset = Math.floor((new Date(y, m - 1, d) - base) / 86400000);
    var temp = 0, i;
    for (i = 1900; i < 2101 && offset > 0; i++) { temp = lYearDays(i); offset -= temp; }
    if (offset < 0) { offset += temp; i--; }
    var year = i, leap = leapMonth(i), isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === (leap + 1) && !isLeap) { --i; isLeap = true; temp = leapDays(year); }
      else { temp = monthDays(year, i); }
      if (isLeap && i === (leap + 1)) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && i === leap + 1) { isLeap = !isLeap; if (isLeap) --i; }
    if (offset < 0) { offset += temp; --i; }
    return { month: i, day: offset + 1, isLeap: isLeap, gan: GAN[(year - 4) % 10], zhi: ZHI[(year - 4) % 12] };
  };
  var tickClock = function () {
    var d = new Date();
    if (navDate) navDate.textContent = '公元' + d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + WEEK[d.getDay()];
    if (navLunar) {
      var l = solar2lunar(d.getFullYear(), d.getMonth() + 1, d.getDate());
      navLunar.textContent = '农历' + l.gan + l.zhi + '年 ' + (l.isLeap ? '闰' : '') + MONTH_CN[l.month - 1] + DAY_CN[l.day - 1];
    }
    if (navTime) navTime.textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  };
  tickClock();
  setInterval(tickClock, 1000);
  if (navWeather) {
    (function () {
      var done = false;
      var setText = function (s) { if (!done) { done = true; navWeather.textContent = s; } };
      var iconFor = function (code) {
        if (code === 0) return '☀️';
        if (code <= 3) return '🌤️';
        if (code <= 48) return '🌫️';
        if (code <= 67) return '🌦️';
        if (code <= 77) return '🌨️';
        if (code <= 82) return '🌧️';
        return '⛈️';
      };
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); setText('☁️ --°C'); }, 8000);
      // fixed Hangzhou weather (30.2741, 120.1551), not visitor-IP based
      fetch('https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&current=temperature_2m,weather_code',
        ctrl ? { signal: ctrl.signal } : undefined)
        .then(function (r) { return r.json(); })
        .then(function (w) {
          clearTimeout(timer);
          var cur = (w && w.current) || {};
          var temp = Math.round(cur.temperature_2m || 0);
          setText(iconFor(cur.weather_code == null ? 0 : cur.weather_code) + ' ' + temp + '°C 杭州');
        })
        .catch(function () { clearTimeout(timer); setText('☁️ --°C'); });
    })();
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
