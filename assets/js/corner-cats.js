/* corner-cats.js — two pixel cats.
   PLAY MODE (default): leader (orange) wanders locally with long rests,
   follower (pink) stays close to the leader — calm, cat-like.
   FOLLOW MODE: clicking the blank left/right margins makes them chase the cursor
   for ~6 seconds, then they go back to playing.
   Sprites: assets/img/oneko-orange-v3.png / oneko-pink-v2.png
   (recolored from adryd325/oneko.js, MIT). */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SPEED = 30;
  var FOLLOW_MS = 6000;
  var mouseX = 0, mouseY = 0;
  var followMode = false, followUntil = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.addEventListener('click', function (e) {
    var W = window.innerWidth;
    var margin = Math.max((W - 1080) / 2, 0); // centered content column leaves blank margins
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

  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  /* cats may only roam the blank margins beside the centered content column */
  function margins() {
    var W = window.innerWidth;
    var m = Math.max((W - 1080) / 2, 0);
    return { W: W, m: m };
  }
  function allowedX(x) {
    var g = margins();
    var l2 = g.m - 54, r1 = g.W - g.m + 54; // leave 54px so the 96px cat clears the content
    if (l2 < 46 || r1 > g.W - 46) return null; // margins too small to hold a cat
    if (x <= (l2 + r1) / 2) return clamp(x, 16, l2);
    return clamp(x, r1, g.W - 16);
  }

  /* leader: walk to a nearby spot, then rest for a while */
  function leaderPlay(px, py) {
    return {
      x: clamp(px + (Math.random() - 0.5) * 640, 40, window.innerWidth - 40),
      y: clamp(py + (Math.random() - 0.5) * 460, 40, window.innerHeight - 40),
      cooldown: 3500 + Math.random() * 5000
    };
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
    var playTarget = null, retargetAt = 0;

    function getTarget() {
      var t;
      if (followMode && Date.now() < followUntil) t = { x: mouseX, y: mouseY };
      else if (Date.now() < startAt) t = { x: startX, y: startY }; // stay at own corner first
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
      if (ax === null) return { x: posX, y: posY }; // margins too small: stay put
      t.x = ax;
      return t;
    }

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

      if (dist < SPEED || dist < stopDist) { idle(); return; }

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
      var ax = allowedX(posX);
      if (ax === null) { el.style.display = 'none'; return; } // no margin room: hide cat
      if (el.style.display === 'none') el.style.display = '';
      posX = ax;
      posY = clamp(posY, 16, window.innerHeight - 16);
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

  var t0 = Date.now();
  var cat1 = new Neko('ccat-left', 90, window.innerHeight - 100, 'assets/img/oneko-orange-v3.png', 48, leaderPlay, t0 + 3000);
  /* follower: always aim near the leader, retarget often for smooth trailing */
  new Neko('ccat-right', window.innerWidth - 90, window.innerHeight - 100, 'assets/img/oneko-pink-v2.png', 100, function (px, py) {
    var b = { x: cat1.getX(), y: cat1.getY() };
    return {
      x: clamp(b.x + (Math.random() * 60 - 30), 16, window.innerWidth - 16),
      y: clamp(b.y + (Math.random() * 60 - 30), 16, window.innerHeight - 16),
      cooldown: 500 + Math.random() * 800
    };
  }, t0 + 4000);
})();

