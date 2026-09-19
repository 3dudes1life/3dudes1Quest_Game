"use strict";
// Shared simulation, input, movement and durable storage for every adventure.
(() => {
  const STEP = 1000 / 60;
  function createLoop({ update, draw, active, onError = console.error }) {
    let frame = null, last = null, accumulator = 0, time = 0, running = false;
    const tick = now => {
      frame = null;
      if (!running) return;
      const elapsed = last === null ? 0 : Math.max(0, Math.min(100, now - last));
      last = now;
      try {
        if (active()) {
          accumulator += elapsed;
          while (accumulator + 1e-7 >= STEP && active() && running) {
            accumulator -= STEP;
            time += STEP;
            update(STEP, time);
          }
        } else accumulator = 0;
        draw(time);
      } catch (error) { accumulator = 0; onError(error); }
      if (running && frame === null) frame = requestAnimationFrame(tick);
    };
    return {
      get time() { return time; },
      start() { if (!running) { running = true; last = null; frame = requestAnimationFrame(tick); } },
      reset() { last = null; accumulator = 0; },
      stop() { running = false; if (frame !== null) cancelAnimationFrame(frame); frame = null; last = null; accumulator = 0; }
    };
  }

  function createInput({ active, screenActive = active, canvas, buttons, switchDude, pause }) {
    const held = new Map(), pending = new Set();
    const input = { left: false, right: false, jump: false, power: false, ultimate: false };
    function sync(action) { input[action] = [...held.values()].includes(action); }
    function down(source, action) {
      if (!active() || held.has(source)) return;
      if (!input[action]) pending.add(action);
      held.set(source, action); sync(action);
    }
    function up(source) { const action = held.get(source); held.delete(source); if (action) sync(action); }
    function releaseAll() {
      held.clear(); pending.clear();
      for (const action of ['left','right','jump','power','ultimate']) input[action] = false;
      buttons.forEach(button => button.classList.remove('isPressed'));
    }
    addEventListener('keydown', event => {
      const action = window.QuestCore.actionForCode(event.code);
      if (!action || !screenActive()) return;
      event.preventDefault();
      if (event.repeat) return;
      if (action === 'pause') { pause(); return; }
      if (!active()) return;
      if (action.startsWith('switch')) switchDude(Number(action.slice(-1)) - 1);
      else down(`key:${event.code}`, action);
    });
    addEventListener('keyup', event => {
      if (screenActive() && window.QuestCore.actionForCode(event.code)) event.preventDefault();
      up(`key:${event.code}`);
    });
    buttons.forEach(button => {
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        down(`pointer:${event.pointerId}`, button.dataset.action);
        if (!active()) return;
        button.classList.add('isPressed');
        try { button.setPointerCapture(event.pointerId); } catch (_) {}
      }, { passive: false });
      const release = event => {
        up(`pointer:${event.pointerId}`);
        button.classList.toggle('isPressed', input[button.dataset.action]);
      };
      for (const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type, release);
      button.addEventListener('click', event => event.preventDefault());
    });
    for (const type of ['blur','pagehide','orientationchange']) addEventListener(type, releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
    return Object.assign(input, {
      releaseAll, isPlaying: active,
      consume(action) { const value = pending.has(action); pending.delete(action); return value; },
      trigger(action) { if (active()) pending.add(action); },
      focusCanvas() { canvas?.focus({ preventScroll: true }); }
    });
  }

  function movePlayer(player, input, dude, { ground, platforms, world, jumpPressed, motion }) {
    const wasGrounded = player.onGround ?? player.on ?? false;
    const previousVy = player.vy, oldBottom = player.y + player.h;
    motion.coyote = wasGrounded ? 8 : Math.max(0, (motion.coyote || 0) - 1);
    motion.buffer = jumpPressed ? 9 : Math.max(0, (motion.buffer || 0) - 1);
    const direction = Number(input.right) - Number(input.left);
    if (direction) { player.vx += direction * .82; player.facing = player.face = direction; }
    else player.vx *= .58;
    if (Math.abs(player.vx) < .08) player.vx = 0;
    player.vx = Math.max(-dude.speed, Math.min(dude.speed, player.vx));
    let jumped = false;
    const jump = () => { player.vy = -dude.jump; motion.buffer = motion.coyote = 0; jumped = true; };
    if (motion.buffer > 0 && motion.coyote > 0) jump();
    if (!input.jump && player.vy < -5) player.vy *= .82;
    player.vy += .72;
    player.x = Math.max(0, Math.min(world - player.w, player.x + player.vx));
    player.y += player.vy;
    let landingY = ground(player.x);
    for (const platform of platforms) {
      if (player.vy >= 0 && oldBottom <= platform.y + .01 && player.y + player.h >= platform.y &&
          player.x + player.w > platform.x && player.x < platform.x + platform.w) landingY = Math.min(landingY, platform.y);
    }
    let grounded = player.y + player.h >= landingY && player.vy >= 0;
    if (grounded) { player.y = landingY - player.h; player.vy = 0; if (motion.buffer > 0) { jump(); grounded = false; } }
    player.on = player.onGround = grounded;
    return { jumped, landed: !wasGrounded && grounded, impact: previousVy };
  }

  function readSave(key, validate = value => value && typeof value === 'object' && !Array.isArray(value)) {
    for (const name of [key, `${key}:backup`]) {
      try { const value = JSON.parse(localStorage.getItem(name) || 'null'); if (validate(value)) return value; } catch (_) {}
    }
    return null;
  }
  function writeSave(key, value) {
    try {
      const encoded = JSON.stringify(value);
      // Keep the previous readable snapshot if the next write is interrupted.
      const previous = readSave(key);
      if (previous) { try { localStorage.setItem(`${key}:backup`, JSON.stringify(previous)); } catch (_) {} }
      localStorage.setItem(key, encoded);
      return true;
    } catch (error) { console.warn('Quest save failed', error); return false; }
  }
  function clearSave(key) { try { localStorage.removeItem(key); localStorage.removeItem(`${key}:backup`); } catch (_) {} }
  function capEffects(items, maximum = 280) { if (items.length > maximum) items.splice(0, items.length - maximum); }
  window.QuestRuntime = Object.freeze({ STEP, createLoop, createInput, movePlayer, readSave, writeSave, clearSave, capEffects });
})();
