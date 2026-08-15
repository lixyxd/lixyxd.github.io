/* corner-cats.js — two pixel cats with extra actions & interactions.
   PLAY MODE: leader (orange) wanders locally with long rests and occasionally
   crosses to the other side; follower (pink) stays close.
   FOLLOW MODE: clicking the blank left/right margins makes them chase the cursor.
   Extra actions: zoomies (dash), tail-chase spin, stretch, sniff-greet between the
   two cats, and looking up when the cursor is near.
   Sprites: assets/img/oneko-orange-v3.png / oneko-pink-v2.png
   (recolored from adryd325/oneko.js, MIT). */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SPEED = 30;
  var FOLLOW_MS = 6000;
  var HALF = window.innerWidth <= 760 ? 32 : 48; // visual half-width of a cat
  var SCALE = HALF / 16;
  var mouseX = 0, mouseY = 0;
  var followMode = false, followUntil = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.addEventListener('click', function (e) {
    var W = window.innerWidth;
    var margin = Math.max((W - 1080) / 2, 0);
    var inMargin = e.clientX < margin - 10 || e.clientX > W - margin + 10;
    if (inMargin || margin <= 0) {
      followMode = true;
      followUntil = Date.now() + FOLLOW_MS;
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
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
  var SPIN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  function margins() {
    var W = window.innerWidth;
    var m = Math.max((W - 1080) / 2, 0);
    return { W: W, m: m };
  }
  function allowedX(x) {
    var g = margins();
    var l2 = g.m - 54, r1 = g.W - g.m + 54;
    if (l2 < HALF || r1 > g.W - HALF) return clamp(x, HALF, g.W - HALF); // no margins: full screen
    if (x <= (l2 + r1) / 2) return clamp(x, HALF, l2);
    return clamp(x, r1, g.W - HALF);
  }
  function regions() {
    var g = margins();
    var l1 = HALF, l2 = g.m - 54;
    var r1 = g.W - g.m + 54, r2 = g.W - HALF;
    if (l2 < HALF || r1 > g.W - HALF) return null; // margins too small -> full screen
    return { l1: l1, l2: l2, r1: r1, r2: r2 };
  }

  /* leader: walk to a nearby spot, rest; occasionally cross to the other side */
  function leaderPlay(px, py) {
    var W = window.innerWidth;
    var mid = W / 2;
    var cross = Math.random() < 0.22;
    var g = margins();
    var l2 = g.m - 54, r1 = W - g.m + 54;
    var x;
    if (cross) {
      x = (px < mid)
        ? clamp(r1 + Math.random() * Math.max(20, (W - HALF) - r1), r1, W - HALF)
        : clamp(HALF + Math.random() * Math.max(20, l2 - HALF), HALF, l2);
    } else {
      x = clamp(px + (Math.random() - 0.5) * 640, HALF, W - HALF);
    }
    var y = clamp(py + (Math.random() - 0.5) * 460, HALF, window.innerHeight - HALF);
    return { x: x, y: y, cooldown: 3500 + Math.random() * 5000 };
  }

  function Neko(id, startX, startY, sprite, stopDist, playFn, startAt) {
    var el = document.createElement('div');
    el.id = id;
    el.className = 'ccat';
    el.setAttribute('aria-hidden', 'true');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundImage = 'url(' + sprite + ')';
    document.body.appendChild(el);

    var posX = startX, posY = startY;
    var frameCount = 0, idleTime = 0, idleAnimation = null, idleAnimationFrame = 0, lastTs = null;
    var playTarget = null, retargetAt = 0, dashUntil = 0, buddy = null;

    function setBuddy(fn) { buddy = fn; }

    function getTarget() {
      var t;
      if (followMode && Date.now() < followUntil) t = { x: mouseX, y: mouseY };
      else if (Date.now() < startAt) t = { x: startX, y: startY };
      else {
        followMode = false;
        if (!playTarget || Date.now() > retargetAt) {
          var pt = playFn(posX, posY);
          playTarget = { x: pt.x, y: pt.y };
          retargetAt = Date.now() + pt.cooldown;
        }
        t = playTarget;
      }
      var ax = allowedX(t.x);
      t.x = ax === null ? posX : ax;
      return t;
    }

    function resetIdle() {
      idleAnimation = null;
      idleAnimationFrame = 0;
      el.style.transform = '';
    }

    function setSprite(name, frame) {
      var s = spriteSets[name][frame % spriteSets[name].length];
      el.style.backgroundPosition = (s[0] * 32) + 'px ' + (s[1] * 32) + 'px';
    }

    function idle() {
      idleTime += 1;
      var now = Date.now();

      // sniff-greet when the two cats are close
      if (idleAnimation === null && buddy && Math.random() < 0.06) {
        var b = buddy();
        if (Math.hypot(posX - b.x, posY - b.y) < 150) idleAnimation = 'sniff';
      }

      // occasional zoomies: bolt across the screen
      if (idleTime > 10 && now > dashUntil + 3000 && Math.random() < 0.03) {
        dashUntil = now + 1300 + Math.random() * 900;
        var W = window.innerWidth;
        playTarget = { x: allowedX(Math.random() * W), y: clamp(80 + Math.random() * (window.innerHeight - 160), HALF, window.innerHeight - HALF) };
        retargetAt = now + 2500;
        idleAnimation = null;
        idleAnimationFrame = 0;
        return;
      }

      // random idle action every ~16s
      if (idleTime > 10 && Math.floor(Math.random() * 160) === 0 && idleAnimation === null) {
        var avail = ['sleeping', 'scratchSelf', 'tailchase', 'stretch'];
        if (posX < HALF + 16) avail.push('scratchWallW');
        if (posY < HALF + 16) avail.push('scratchWallN');
        if (posX > window.innerWidth - HALF - 16) avail.push('scratchWallE');
        if (posY > window.innerHeight - HALF - 16) avail.push('scratchWallS');
        idleAnimation = avail[Math.floor(Math.random() * avail.length)];
        idleAnimationFrame = 0;
      }

      switch (idleAnimation) {
        case 'sleeping':
          if (idleAnimationFrame < 8) { setSprite('tired', 0); break; }
          setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdle();
          break;
        case 'tailchase':
          setSprite(SPIN[Math.floor(idleAnimationFrame / 2) % 8], 0);
          el.style.transform = 'scale(' + SCALE + ') rotate(' + (Math.sin(idleAnimationFrame * 0.5) * 20) + 'deg)';
          if (idleAnimationFrame > 30) resetIdle();
          break;
        case 'stretch':
          {
            var k = Math.sin((idleAnimationFrame / 10) * Math.PI);
            el.style.transform = 'scaleX(' + SCALE + ') scaleY(' + (SCALE * (1 + 0.28 * k)) + ')';
            if (idleAnimationFrame > 10) resetIdle();
          }
          break;
        case 'sniff':
          setSprite(Math.random() < 0.5 ? 'idle' : 'alert', 0);
          if (idleAnimationFrame > 12) resetIdle();
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
          if (Math.hypot(posX - mouseX, posY - mouseY) < 260 && Math.random() < 0.4) setSprite('alert', 0);
          else setSprite('idle', 0);
          return;
      }
      idleAnimationFrame += 1;
    }

    function frame() {
      frameCount += 1;
      var now = Date.now();
      var dashing = now < dashUntil;
      var t = getTarget();
      var dx = posX - t.x, dy = posY - t.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (!dashing && (dist < SPEED || dist < stopDist)) { idle(); return; }
      var speed = dashing ? SPEED * 3 : SPEED;

      var reg = regions();
      var mid = window.innerWidth / 2;
      var leftSide = posX < mid;
      var tgtLeft = t.x < mid;
      var lo, hi;
      if (reg) {
        lo = leftSide ? reg.l1 : reg.r1;
        hi = leftSide ? reg.l2 : reg.r2;
      } else {
        lo = HALF;
        hi = window.innerWidth - HALF;
      }

      idleAnimation = null;
      idleAnimationFrame = 0;
      el.style.transform = '';

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

      posX -= (dx / dist) * speed;
      posY -= (dy / dist) * speed;

      posX = clamp(posX, lo, hi);
      posY = clamp(posY, HALF, window.innerHeight - HALF);

      // crossing the content area (only when margins exist): run to the strip edge, then teleport across
      if (reg && tgtLeft !== leftSide) {
        if (leftSide && posX >= reg.l2) posX = reg.r1;
        else if (!leftSide && posX <= reg.r1) posX = reg.l2;
      }

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
      setBuddy: setBuddy,
      getX: function () { return posX; },
      getY: function () { return posY; }
    };
  }

  var t0 = Date.now();
  var cat1 = new Neko('ccat-left', 90, window.innerHeight - 100, 'assets/img/oneko-orange-v3.png', 48, leaderPlay, t0 + 3000);
  var cat2 = new Neko('ccat-right', window.innerWidth - 90, window.innerHeight - 100, 'assets/img/oneko-pink-v2.png', 100, function (px, py) {
    var b = { x: cat1.getX(), y: cat1.getY() };
    return {
      x: clamp(b.x + (Math.random() * 60 - 30), HALF, window.innerWidth - HALF),
      y: clamp(b.y + (Math.random() * 60 - 30), HALF, window.innerHeight - HALF),
      cooldown: 500 + Math.random() * 800
    };
  }, t0 + 4000);
  cat1.setBuddy(function () { return { x: cat2.getX(), y: cat2.getY() }; });
  cat2.setBuddy(function () { return { x: cat1.getX(), y: cat1.getY() }; });
})();
