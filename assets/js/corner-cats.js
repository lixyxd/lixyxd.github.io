/* corner-cats.js — two 3D-style cats with mouse interaction.
   Cat-left glides toward the cursor; cat-right follows cat-left.
   Sprite: assets/img/cat.png (JoyPixels 1f408 cat, CC-BY 4.0). */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SRC = 'assets/img/cat.png';
  var mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function Cat(id, x, y, getTarget) {
    var el = document.createElement('div');
    el.className = 'ccat3';
    el.id = id;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<span class="c3-bob"><span class="c3-sprite"></span></span>' +
      '<span class="c3-shadow"></span>';
    el.querySelector('.c3-sprite').style.backgroundImage = 'url(' + SRC + ')';
    document.body.appendChild(el);

    var px = x, py = y, facing = 1;

    function frame() {
      var t = getTarget();
      var dx = t.x - px, dy = t.y - py;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 6) {
        var step = Math.min(dist, 9);
        px += (dx / dist) * step;
        py += (dy / dist) * step;
        if (Math.abs(dx) > 0.5) facing = dx > 0 ? 1 : -1;
      }
      el.style.left = (px - 48) + 'px';
      el.style.top = (py - 48) + 'px';
      el.querySelector('.c3-sprite').style.transform = 'scaleX(' + facing + ')';
      requestAnimationFrame(frame);
    }

    el.style.left = (x - 48) + 'px';
    el.style.top = (y - 48) + 'px';
    requestAnimationFrame(frame);

    return {
      getX: function () { return px; },
      getY: function () { return py; }
    };
  }

  var cat1 = new Cat('ccat-left', 90, window.innerHeight - 100, function () {
    return { x: mouseX, y: mouseY };
  });
  new Cat('ccat-right', window.innerWidth - 90, window.innerHeight - 100, function () {
    return { x: cat1.getX(), y: cat1.getY() };
  });
})();
