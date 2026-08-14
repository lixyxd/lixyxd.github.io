/* 李小勇 Xiaoyong Li · personal homepage interactions */
(function () {
  'use strict';

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
  if ('IntersectionObserver' in window) {
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
})();
