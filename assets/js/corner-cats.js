/* corner-cats.js — oneko-style pixel cats with mouse interaction.
   Cat-left chases the cursor; cat-right chases cat-left.
   Sprite sheet: assets/img/oneko.gif (from adryd325/oneko.js, MIT). */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SPRITE = 'assets/img/oneko.gif';
  var SPEED = 10;
  var mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  var spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    scratchWallN: [[0, 0], [0, -1]],
    scratchWallS: [[-7, -1], [-6, -2]],
    scratchWallE: [[-2, -2], [-2, -3]],
    scratchWallW: [[-4, 0], [-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]]
  };

  function Neko(id, startX, startY, getTarget) {
    var el = document.createElement('div');
    el.id = id;
    el.className = 'ccat';
    el.setAttribute('aria-hidden', 'true');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundImage = 'url(' + SPRITE + ')';
    document.body.appendChild(el);

    var posX = startX, posY = startY;
    var frameCount = 0, idleTime = 0, idleAnimation = null, idleAnimationFrame = 0, lastTs = null;

    function resetIdle() { idleAnimation = null; idleAnimationFrame = 0; }

    function setSprite(name, frame) {
      var s = spriteSets[name][frame % spriteSets[name].length];
      el.style.backgroundPosition = (s[0] * 32) + 'px ' + (s[1] * 32) + 'px';
    }

    function idle() {
      idleTime += 1;
      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
        var avail = ['sleeping', 'scratchSelf'];
        if (posX < 32) avail.push('scratchWallW');
        if (posY < 32) avail.push('scratchWallN');
        if (posX > window.innerWidth - 32) avail.push('scratchWallE');
        if (posY > window.innerHeight - 32) avail.push('scratchWallS');
        idleAnimation = avail[Math.floor(Math.random() * avail.length)];
      }
      switch (idleAnimation) {
        case 'sleeping':
          if (idleAnimationFrame < 8) { setSprite('tired', 0); break; }
          setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdle();
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
        case 'scratchSelf':
          setSprite(idleAnimation, idleAnimationFrame);
          if (idleAnimationFrame > 9) resetIdle();
          break;
        default:
          setSprite('idle', 0);
          return;
      }
      idleAnimationFrame += 1;
    }

    function frame() {
      frameCount += 1;
      var t = getTarget();
      var dx = posX - t.x, dy = posY - t.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SPEED || dist < 48) { idle(); return; }

      idleAnimation = null;
      idleAnimationFrame = 0;

      if (idleTime > 1) {
        setSprite('alert', 0);
        idleTime = Math.min(idleTime, 7);
        idleTime -= 1;
        return;
      }

      var direction = '';
      direction += dy / dist > 0.5 ? 'N' : '';
      direction += dy / dist < -0.5 ? 'S' : '';
      direction += dx / dist > 0.5 ? 'W' : '';
      direction += dx / dist < -0.5 ? 'E' : '';
      setSprite(direction, frameCount);

      posX -= (dx / dist) * SPEED;
      posY -= (dy / dist) * SPEED;
      posX = Math.min(Math.max(16, posX), window.innerWidth - 16);
      posY = Math.min(Math.max(16, posY), window.innerHeight - 16);
      el.style.left = (posX - 16) + 'px';
      el.style.top = (posY - 16) + 'px';
    }

    function loop(ts) {
      if (!el.isConnected) return;
      if (lastTs === null) lastTs = ts;
      if (ts - lastTs > 100) { lastTs = ts; frame(); }
      requestAnimationFrame(loop);
    }

    el.style.left = (posX - 16) + 'px';
    el.style.top = (posY - 16) + 'px';
    requestAnimationFrame(loop);

    return {
      getX: function () { return posX; },
      getY: function () { return posY; }
    };
  }

  var cat1 = new Neko('ccat-left', 60, window.innerHeight - 40, function () {
    return { x: mouseX, y: mouseY };
  });
  new Neko('ccat-right', window.innerWidth - 60, window.innerHeight - 40, function () {
    return { x: cat1.getX(), y: cat1.getY() };
  });
})();
