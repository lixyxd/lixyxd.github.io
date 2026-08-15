/* rocket.js — decorative rocket launching from the right side, every 18-42s */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var rk = document.getElementById('rocket');
  if (!rk) return;

  var FLIGHT_MS = 3100;

  function launch() {
    rk.classList.remove('launching');
    void rk.offsetWidth; // restart the CSS animations
    rk.style.opacity = '1';
    rk.classList.add('launching');
    setTimeout(function () {
      rk.classList.remove('launching');
      rk.style.opacity = '0';
      schedule();
    }, FLIGHT_MS);
  }

  function schedule() {
    setTimeout(launch, 18000 + Math.random() * 24000); // every 18-42s
  }

  schedule();
})();
