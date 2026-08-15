/* meteors.js — occasional shooting stars streaking across the background sky */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sky = document.querySelector('.bg-sky');
  if (!sky) return;

  var active = 0;

  function spawn() {
    if (active >= 3) { setTimeout(spawn, 1200); return; }
    active += 1;

    var m = document.createElement('span');
    m.className = 'meteor';
    var W = sky.clientWidth, H = sky.clientHeight;
    m.style.left = (W * (0.5 + Math.random() * 0.45)) + 'px';
    m.style.top = (10 + Math.random() * Math.min(150, H * 0.25)) + 'px';
    m.style.transform = 'translate(0,0) rotate(35deg)';
    sky.appendChild(m);

    var dist = 420 + Math.random() * 180;
    var dur = 900 + Math.random() * 600;

    requestAnimationFrame(function () {
      m.style.transition = 'transform ' + dur + 'ms linear, opacity 250ms ease';
      m.style.transform = 'translate(' + (-dist) + 'px,' + (dist * 0.7) + 'px) rotate(35deg)';
      m.style.opacity = '1';
    });

    setTimeout(function () { m.style.opacity = '0'; }, dur - 250);
    setTimeout(function () {
      if (m.parentNode) m.parentNode.removeChild(m);
      active -= 1;
    }, dur + 300);

    setTimeout(spawn, 2000 + Math.random() * 4500);
  }

  setTimeout(spawn, 1200);
})();
