(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const startScreen = document.getElementById("startScreen");
  let startButton = document.getElementById("startButton");
  const muteButton = document.getElementById("muteButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const stageWrap = document.getElementById("stageWrap");
  const messageEl = document.getElementById("message");
  const characterButtons = [...document.querySelectorAll(".character-card")];
  const touchButtons = [...document.querySelectorAll(".mobile-controls button")];

  let W = canvas.width;
  const H = canvas.height;
  const TILE = 48;
  const WORLD_W = 4320;
  const GRAVITY = 1800;

  const COLORS = {
    night: "#160d34",
    skyTop: "#2b1763",
    skyBottom: "#ff5fa2",
    moon: "#ffe66d",
    white: "#fff7ff",
    pink: "#ff4fb8",
    orange: "#ff8f3d",
    teal: "#41e6d0",
    purple: "#9f6bff",
    beige: "#c8b99b",
    beigeDark: "#786c58",
    ground: "#2d184e",
    grass: "#44d9a6",
    danger: "#ff425c",
  };

  const characters = [
    {
      name: "WILL",
      color: COLORS.pink,
      accent: COLORS.orange,
      ability: "SASS WAVE",
      speed: 310,
      jump: 680,
    },
    {
      name: "DANIEL",
      color: COLORS.teal,
      accent: COLORS.purple,
      ability: "PRISM SHIELD",
      speed: 285,
      jump: 705,
    },
    {
      name: "CALEB",
      color: COLORS.orange,
      accent: COLORS.teal,
      ability: "POWER SMASH",
      speed: 270,
      jump: 650,
    },
  ];

  const keys = Object.create(null);
  const touch = { left: false, right: false, jump: false, ability: false };
  let running = false;
  let muted = false;
  let lastTime = 0;
  let cameraX = 0;
  let shake = 0;
  let flash = 0;
  let toastTimer = 0;
  let audioCtx = null;

  const level = {
    solids: [],
    cracked: [],
    hazards: [],
    shards: [],
    enemies: [],
    decor: [],
    cards: [],
    checkpoints: [],
    boss: null,
    exit: { x: 4110, y: 300, w: 90, h: 150 },
  };

  const player = {
    x: 110,
    y: 300,
    w: 34,
    h: 50,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    character: 0,
    health: 4,
    invuln: 0,
    shield: 0,
    abilityCooldown: 0,
    coyote: 0,
    jumpBuffer: 0,
    shards: 0,
    cards: 0,
    respawnX: 110,
    respawnY: 300,
    won: false,
    dead: false,
  };

  const projectiles = [];
  const particles = [];

  function rect(x, y, w, h, type = "platform") {
    level.solids.push({ x, y, w, h, type });
  }

  function cracked(x, y, w = TILE, h = TILE) {
    level.cracked.push({ x, y, w, h, broken: false });
  }

  function hazard(x, y, w, h) {
    level.hazards.push({ x, y, w, h });
  }

  function shard(x, y) {
    level.shards.push({ x, y, w: 24, h: 30, collected: false, bob: Math.random() * Math.PI * 2 });
  }

  function gayCard(x, y) {
    level.cards.push({ x, y, w: 28, h: 20, collected: false, bob: Math.random() * Math.PI * 2 });
  }

  function checkpoint(x, y) {
    level.checkpoints.push({ x, y, w: 34, h: 82, active: false });
  }

  function enemy(x, y, left, right, speed = 75) {
    level.enemies.push({
      x, y, w: 38, h: 38,
      left, right, speed,
      dir: Math.random() > .5 ? 1 : -1,
      dead: false,
      stunned: 0,
    });
  }

  function buildLevel() {
    level.solids.length = 0;
    level.cracked.length = 0;
    level.hazards.length = 0;
    level.shards.length = 0;
    level.enemies.length = 0;
    level.decor.length = 0;
    level.cards.length = 0;
    level.checkpoints.length = 0;
    level.boss = null;

    rect(0, 468, 1100, 100, "ground");
    rect(1240, 468, 690, 100, "ground");
    rect(2070, 468, 810, 100, "ground");
    rect(3020, 468, 1300, 100, "ground");

    rect(420, 372, 180, 28);
    rect(710, 300, 180, 28);
    rect(1010, 238, 130, 28);
    rect(1320, 350, 190, 28);
    rect(1600, 285, 210, 28);
    rect(1980, 370, 160, 28);
    rect(2260, 302, 180, 28);
    rect(2520, 235, 210, 28);
    rect(2900, 365, 150, 28);
    rect(3230, 315, 180, 28);
    rect(3550, 250, 180, 28);
    rect(3860, 330, 210, 28);

    cracked(1820, 420);
    cracked(1868, 420);
    cracked(2820, 420);
    cracked(2868, 420);
    cracked(3740, 420);
    cracked(3788, 420);

    hazard(1100, 492, 140, 48);
    hazard(1930, 492, 140, 48);
    hazard(2880, 492, 140, 48);

    shard(520, 325);
    shard(785, 250);
    shard(1080, 190);
    shard(1690, 235);
    shard(2600, 185);
    shard(3650, 200);

    gayCard(280, 420);
    gayCard(675, 252);
    gayCard(1450, 302);
    gayCard(2045, 325);
    gayCard(2340, 254);
    gayCard(3075, 420);
    gayCard(3605, 202);
    gayCard(4005, 282);

    checkpoint(2110, 386);
    level.boss = { x: 3890, y: 392, w: 74, h: 76, hp: 5, maxHp: 5, dir: -1, dead: false, hitFlash: 0, cooldown: 0 };

    enemy(610, 430, 540, 1000);
    enemy(1390, 312, 1320, 1470, 62);
    enemy(2160, 430, 2070, 2800, 85);
    enemy(3280, 277, 3230, 3370, 55);
    enemy(3450, 430, 3050, 3900, 92);

    for (let x = 140; x < WORLD_W; x += 250) {
      level.decor.push({
        x,
        y: 80 + Math.random() * 170,
        kind: Math.random() > .45 ? "star" : "palm",
        s: .6 + Math.random() * .8,
      });
    }
  }

  function resetGame() {
    buildLevel();
    projectiles.length = 0;
    particles.length = 0;
    Object.assign(player, {
      x: 110, y: 300, vx: 0, vy: 0,
      onGround: false, facing: 1, character: 0,
      health: 4, invuln: 0, shield: 0,
      abilityCooldown: 0, coyote: 0, jumpBuffer: 0,
      shards: 0, cards: 0, respawnX: 110, respawnY: 300, won: false, dead: false,
    });
    cameraX = 0;
    updateCharacterUI();
  }

  function startGame() {
    resetGame();
    running = true;
    startScreen.classList.add("hidden");
    showMessage("3DUDES1QUEST BEGINS!");
    blip(520, .08, "square");
  }

  function showEnd(title, body, buttonText) {
    running = false;
    startScreen.innerHTML = `
      <div class="panel">
        <p class="panel-kicker">3DUDES: PRISM PANIC</p>
        <h2>${title}</h2>
        <p>${body}</p>
        <button id="restartButton" class="primary-button" type="button">${buttonText}</button>
      </div>
    `;
    startScreen.classList.remove("hidden");
    document.getElementById("restartButton").addEventListener("click", startGame, { once: true });
  }

  function switchCharacter(index) {
    if (!running || player.dead || player.won || index === player.character) return;
    player.character = index;
    player.abilityCooldown = Math.max(player.abilityCooldown, .15);
    updateCharacterUI();
    burst(player.x + player.w / 2, player.y + player.h / 2, characters[index].color, 14);
    showMessage(`${characters[index].name}: ${characters[index].ability}`);
    blip(340 + index * 110, .07, "square");
  }

  function cycleCharacter() {
    switchCharacter((player.character + 1) % characters.length);
  }

  function updateCharacterUI() {
    characterButtons.forEach((button, index) => {
      button.classList.toggle("active", index === player.character);
    });
  }

  function showMessage(text, seconds = 1.5) {
    messageEl.textContent = text;
    messageEl.classList.add("show");
    toastTimer = seconds;
  }

  function overlap(a, b) {
    return a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y;
  }

  function playTone(freq, duration, type = "square", volume = .035) {
    if (muted) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Sound is optional.
    }
  }

  function blip(freq, duration, type) {
    playTone(freq, duration, type);
  }

  function burst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 210;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: .35 + Math.random() * .55,
        max: .9,
        color,
        size: 3 + Math.random() * 6,
      });
    }
  }

  function hurtPlayer(sourceX) {
    if (player.invuln > 0 || player.dead) return;
    if (player.shield > 0) {
      burst(player.x + player.w / 2, player.y + player.h / 2, COLORS.teal, 16);
      blip(760, .08, "sine");
      return;
    }

    player.health -= 1;
    player.invuln = 1.4;
    player.vy = -460;
    player.vx = player.x < sourceX ? -320 : 320;
    shake = 14;
    flash = .16;
    burst(player.x + player.w / 2, player.y + player.h / 2, COLORS.danger, 18);
    blip(150, .18, "sawtooth");

    if (player.health <= 0) {
      player.dead = true;
      setTimeout(() => {
        showEnd("THAT WAS HOMOPHOBIC.", "The Shade Brigade got the last word. Dramatic—but fixable.", "TRY AGAIN");
      }, 650);
    }
  }

  function useAbility() {
    if (!running || player.abilityCooldown > 0 || player.dead || player.won) return;
    player.abilityCooldown = .55;
    const c = characters[player.character];

    if (player.character === 0) {
      projectiles.push({
        x: player.x + (player.facing > 0 ? player.w : -24),
        y: player.y + 16,
        w: 28, h: 18,
        vx: 560 * player.facing,
        life: 1.1,
        color: c.color,
      });
      burst(player.x + player.w / 2, player.y + 18, c.color, 8);
      blip(660, .08, "square");
    } else if (player.character === 1) {
      player.shield = 2.2;
      player.invuln = Math.max(player.invuln, .2);
      burst(player.x + player.w / 2, player.y + player.h / 2, c.color, 18);
      showMessage("PRISM SHIELD!");
      blip(880, .18, "sine");
    } else {
      const smashZone = {
        x: player.x - 34,
        y: player.y - 20,
        w: player.w + 68,
        h: player.h + 68,
      };
      let smashed = false;
      for (const block of level.cracked) {
        if (!block.broken && overlap(smashZone, block)) {
          block.broken = true;
          burst(block.x + block.w / 2, block.y + block.h / 2, COLORS.beige, 20);
          smashed = true;
        }
      }
      for (const e of level.enemies) {
        if (!e.dead && overlap(smashZone, e)) {
          e.dead = true;
          burst(e.x + e.w / 2, e.y + e.h / 2, COLORS.orange, 16);
          smashed = true;
        }
      }
      if (level.boss && !level.boss.dead && overlap(smashZone, level.boss)) {
        damageBoss(2);
        smashed = true;
      }
      shake = smashed ? 14 : 7;
      burst(player.x + player.w / 2, player.y + player.h, c.color, 14);
      blip(smashed ? 110 : 180, .18, "square");
    }
  }

  function damageBoss(amount = 1) {
    const b = level.boss;
    if (!b || b.dead || b.hitFlash > 0) return;
    b.hp -= amount;
    b.hitFlash = .35;
    shake = 14;
    burst(b.x + b.w / 2, b.y + b.h / 2, COLORS.yellow, 24);
    blip(120, .16, "sawtooth");
    showMessage(`BEIGE BEAST: ${Math.max(0, b.hp)}/${b.maxHp}`);
    if (b.hp <= 0) {
      b.dead = true;
      burst(b.x + b.w / 2, b.y + b.h / 2, COLORS.pink, 60);
      showMessage("BEIGE BEAST DEFEATED — THE PORTAL IS READY!", 2.2);
      [440, 660, 880].forEach((f, i) => setTimeout(() => blip(f, .12, "square"), i * 100));
    }
  }

  function updateBoss(dt) {
    const b = level.boss;
    if (!b || b.dead) return;
    b.hitFlash = Math.max(0, b.hitFlash - dt);
    b.cooldown -= dt;
    if (Math.abs(player.x - b.x) < 620) {
      b.x += b.dir * 70 * dt;
      if (b.x < 3790) b.dir = 1;
      if (b.x > 4010) b.dir = -1;
      if (b.cooldown <= 0) {
        b.cooldown = 1.35;
        projectiles.push({ x:b.x + b.w/2, y:b.y+22, w:22, h:22, vx:(player.x < b.x ? -330 : 330), life:2.6, color:COLORS.beige, hostile:true });
      }
    }
    if (overlap(player,b)) hurtPlayer(b.x + b.w/2);
  }

  function update(dt) {
    if (!running) return;

    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) messageEl.classList.remove("show");
    }

    player.invuln = Math.max(0, player.invuln - dt);
    player.shield = Math.max(0, player.shield - dt);
    player.abilityCooldown = Math.max(0, player.abilityCooldown - dt);
    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
    player.coyote = player.onGround ? .11 : Math.max(0, player.coyote - dt);
    flash = Math.max(0, flash - dt);
    shake = Math.max(0, shake - 40 * dt);

    const c = characters[player.character];
    const left = keys.ArrowLeft || keys.KeyA || touch.left;
    const right = keys.ArrowRight || keys.KeyD || touch.right;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space || touch.jump;
    const ability = keys.KeyX || touch.ability;

    if (jump && !player._jumpHeld) player.jumpBuffer = .13;
    player._jumpHeld = jump;

    if (ability && !player._abilityHeld) useAbility();
    player._abilityHeld = ability;

    const accel = player.onGround ? 2500 : 1450;
    const drag = player.onGround ? 2200 : 500;
    let move = 0;
    if (left) move -= 1;
    if (right) move += 1;

    if (move) {
      player.vx += move * accel * dt;
      player.facing = move;
    } else {
      const amount = drag * dt;
      if (Math.abs(player.vx) <= amount) player.vx = 0;
      else player.vx -= Math.sign(player.vx) * amount;
    }

    player.vx = Math.max(-c.speed, Math.min(c.speed, player.vx));

    if (player.jumpBuffer > 0 && player.coyote > 0) {
      player.vy = -c.jump;
      player.onGround = false;
      player.coyote = 0;
      player.jumpBuffer = 0;
      burst(player.x + player.w / 2, player.y + player.h, c.color, 6);
      blip(310, .07, "square");
    }

    if (!jump && player.vy < -250) player.vy += 1150 * dt;
    player.vy += GRAVITY * dt;
    player.vy = Math.min(player.vy, 1050);

    movePlayer(dt);

    for (const e of level.enemies) {
      if (e.dead) continue;
      e.stunned = Math.max(0, e.stunned - dt);
      if (e.stunned <= 0) {
        e.x += e.speed * e.dir * dt;
        if (e.x <= e.left) e.dir = 1;
        if (e.x + e.w >= e.right) e.dir = -1;
      }

      if (overlap(player, e)) {
        const fallingOn = player.vy > 120 && player.y + player.h - e.y < 22;
        if (fallingOn) {
          e.dead = true;
          player.vy = -430;
          burst(e.x + e.w / 2, e.y + e.h / 2, COLORS.pink, 14);
          blip(520, .08, "square");
        } else {
          hurtPlayer(e.x + e.w / 2);
        }
      }
    }

    for (const h of level.hazards) {
      if (overlap(player, h)) hurtPlayer(h.x + h.w / 2);
    }

    for (const s of level.shards) {
      s.bob += dt * 3;
      if (!s.collected && overlap(player, s)) {
        s.collected = true;
        player.shards += 1;
        burst(s.x + 12, s.y + 15, COLORS.yellow, 22);
        blip(980, .1, "sine");
        showMessage(player.shards === 6 ? "ALL SHARDS FOUND — FIND THE PORTAL!" : `PRISM SHARD ${player.shards}/6`);
      }
    }

    for (const card of level.cards) {
      card.bob += dt * 4;
      if (!card.collected && overlap(player, card)) {
        card.collected = true;
        player.cards += 1;
        burst(card.x + card.w/2, card.y + card.h/2, COLORS.pink, 16);
        blip(1180, .08, "square");
        showMessage(`GAY CARD ${player.cards}/${level.cards.length}`);
      }
    }

    for (const cp of level.checkpoints) {
      if (!cp.active && overlap(player, cp)) {
        level.checkpoints.forEach(c => c.active = false);
        cp.active = true;
        player.respawnX = cp.x + 45;
        player.respawnY = cp.y - 40;
        showMessage("CHECKPOINT: YOU SURVIVED THE DISCOURSE.", 2);
        burst(cp.x + 15, cp.y + 18, COLORS.teal, 26);
      }
    }

    updateBoss(dt);

    if (player.y > H + 160) {
      hurtPlayer(player.x);
      player.x = player.respawnX;
      player.y = player.respawnY;
      player.vx = 0;
      player.vy = 0;
    }

    if (overlap(player, level.exit)) {
      if (player.shards >= 6 && level.boss && level.boss.dead) {
        player.won = true;
        running = false;
        burst(level.exit.x + 45, level.exit.y + 75, COLORS.yellow, 80);
        playWinJingle();
        setTimeout(() => {
          showEnd("COLOR RESTORED!", "Lord Beige has been defeated by teamwork, impeccable timing, and a completely reasonable amount of glitter.", "PLAY AGAIN");
        }, 850);
      } else {
        if (player.shards < 6) showMessage(`THE PORTAL NEEDS ${6 - player.shards} MORE SHARD${6 - player.shards === 1 ? "" : "S"}.`);
        else showMessage("DEFEAT THE BEIGE BEAST FIRST!");
      }
    }

    updateProjectiles(dt);
    updateParticles(dt);

    const targetCamera = Math.max(0, Math.min(WORLD_W - W, player.x - W * .37));
    cameraX += (targetCamera - cameraX) * Math.min(1, dt * 7);
  }

  function movePlayer(dt) {
    player.x += player.vx * dt;
    resolveSolids("x");

    player.y += player.vy * dt;
    player.onGround = false;
    resolveSolids("y");

    player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));
  }

  function activeSolids() {
    return level.solids.concat(level.cracked.filter(b => !b.broken));
  }

  function resolveSolids(axis) {
    for (const s of activeSolids()) {
      if (!overlap(player, s)) continue;

      if (axis === "x") {
        if (player.vx > 0) player.x = s.x - player.w;
        else if (player.vx < 0) player.x = s.x + s.w;
        player.vx = 0;
      } else {
        if (player.vy > 0) {
          player.y = s.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = s.y + s.h;
          player.vy = 0;
        }
      }
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.life -= dt;

      let hit = false;
      if (p.hostile) {
        if (overlap(p, player)) {
          hurtPlayer(p.x);
          hit = true;
        }
      } else {
        for (const e of level.enemies) {
          if (!e.dead && overlap(p, e)) {
            e.stunned = 2.2;
            e.dir *= -1;
            burst(e.x + e.w / 2, e.y + e.h / 2, COLORS.pink, 14);
            blip(740, .08, "square");
            hit = true;
            break;
          }
        }
        if (!hit && level.boss && !level.boss.dead && overlap(p, level.boss)) {
          damageBoss(1);
          hit = true;
        }
      }

      if (p.life <= 0 || hit) projectiles.splice(i, 1);
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 520 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function playWinJingle() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, .22, "square", .045), i * 130);
    });
  }

  function draw() {
    const sx = shake ? (Math.random() - .5) * shake : 0;
    const sy = shake ? (Math.random() - .5) * shake : 0;

    ctx.save();
    ctx.translate(sx, sy);
    drawBackground();

    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);
    drawWorld();
    drawProjectiles();
    drawParticles();
    drawPlayer();
    ctx.restore();

    drawHUD();
    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flash * 2.4})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, COLORS.skyTop);
    gradient.addColorStop(.72, COLORS.skyBottom);
    gradient.addColorStop(1, "#ff9a5a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = COLORS.moon;
    ctx.beginPath();
    ctx.arc(770, 105, 54, 0, Math.PI * 2);
    ctx.fill();

    const parallax = cameraX * .16;
    for (let i = -1; i < 8; i++) {
      const x = i * 210 - (parallax % 210);
      drawMountain(x, 315, 160, "#4b2476");
      drawMountain(x + 95, 335, 130, "#30195a");
    }

    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (let i = 0; i < 38; i++) {
      const x = (i * 137 + 43) % W;
      const y = (i * 71 + 29) % 210;
      ctx.fillRect(x, y, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2);
    }

    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 1);
  }

  function drawMountain(x, baseY, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + size * .5, baseY - size);
    ctx.lineTo(x + size, baseY);
    ctx.closePath();
    ctx.fill();
  }

  function drawWorld() {
    for (const d of level.decor) {
      if (d.kind === "star") drawSparkle(d.x, d.y, 5 * d.s, "rgba(255,255,255,.55)");
      else drawPalm(d.x, 450, d.s);
    }

    for (const h of level.hazards) {
      ctx.fillStyle = "#4a183f";
      ctx.fillRect(h.x, h.y, h.w, h.h);
      for (let x = h.x; x < h.x + h.w; x += 24) {
        ctx.fillStyle = COLORS.danger;
        ctx.beginPath();
        ctx.moveTo(x, h.y + h.h);
        ctx.lineTo(x + 12, h.y);
        ctx.lineTo(x + 24, h.y + h.h);
        ctx.fill();
      }
    }

    for (const s of level.solids) drawPlatform(s);
    for (const b of level.cracked) if (!b.broken) drawCrackedBlock(b);

    for (const s of level.shards) {
      if (s.collected) continue;
      const bobY = s.y + Math.sin(s.bob) * 7;
      drawPrism(s.x + s.w / 2, bobY + s.h / 2);
    }

    for (const card of level.cards) {
      if (!card.collected) drawGayCard(card.x, card.y + Math.sin(card.bob) * 5);
    }
    for (const cp of level.checkpoints) drawCheckpoint(cp);
    if (level.boss && !level.boss.dead) drawBoss(level.boss);

    for (const e of level.enemies) {
      if (!e.dead) drawEnemy(e);
    }

    drawExit();
  }

  function drawPlatform(s) {
    ctx.fillStyle = s.type === "ground" ? COLORS.ground : "#5b2e78";
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(s.x, s.y, s.w, 9);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let x = s.x + 10; x < s.x + s.w; x += 34) {
      ctx.fillRect(x, s.y + 19, 10, 5);
    }
  }

  function drawCrackedBlock(b) {
    ctx.fillStyle = COLORS.beige;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = COLORS.beigeDark;
    ctx.fillRect(b.x, b.y, b.w, 5);
    ctx.strokeStyle = "#5e5140";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(b.x + 8, b.y + 6);
    ctx.lineTo(b.x + 25, b.y + 22);
    ctx.lineTo(b.x + 17, b.y + 34);
    ctx.lineTo(b.x + 35, b.y + 46);
    ctx.stroke();
  }

  function drawPrism(x, y) {
    const rainbow = [COLORS.pink, COLORS.orange, COLORS.yellow, COLORS.teal, COLORS.purple];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    rainbow.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(-12 + i * 4, -12 + i * 2, 24 - i * 8, 24 - i * 4);
    });
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 3;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.restore();
  }

  function drawGayCard(x, y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle = COLORS.white; ctx.fillRect(0,0,28,20);
    ctx.fillStyle = COLORS.pink; ctx.fillRect(3,3,22,14);
    ctx.fillStyle = COLORS.yellow; ctx.font = "bold 10px Courier New"; ctx.textAlign="center"; ctx.fillText("GAY",14,13);
    ctx.restore();
  }

  function drawCheckpoint(cp) {
    ctx.fillStyle = "#eee7ff"; ctx.fillRect(cp.x, cp.y, 5, cp.h);
    ctx.fillStyle = cp.active ? COLORS.teal : COLORS.purple;
    ctx.fillRect(cp.x+5, cp.y+5, 34, 22);
    ctx.fillStyle = COLORS.white; ctx.font="bold 12px Courier New"; ctx.fillText("3D",cp.x+11,cp.y+21);
  }

  function drawBoss(b) {
    ctx.save(); ctx.translate(b.x,b.y);
    ctx.fillStyle = b.hitFlash > 0 ? COLORS.white : COLORS.beige;
    ctx.fillRect(8,10,58,55); ctx.fillRect(16,2,42,68);
    ctx.fillStyle = COLORS.beigeDark; ctx.fillRect(3,18,16,35); ctx.fillRect(55,18,16,35);
    ctx.fillStyle = "#24152f"; ctx.fillRect(24,20,7,8); ctx.fillRect(44,20,7,8); ctx.fillRect(28,44,20,6);
    ctx.fillStyle = COLORS.pink; ctx.fillRect(17,0,40,7);
    ctx.fillStyle = COLORS.white; ctx.font="bold 10px Courier New"; ctx.textAlign="center"; ctx.fillText("BEIGE",37,6);
    ctx.restore();
    ctx.fillStyle="rgba(15,7,35,.85)"; ctx.fillRect(b.x-3,b.y-18,80,10);
    ctx.fillStyle=COLORS.danger; ctx.fillRect(b.x,b.y-15,74*(b.hp/b.maxHp),5);
  }

  function drawEnemy(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    const wobble = e.stunned > 0 ? Math.sin(performance.now() * .04) * 4 : 0;
    ctx.translate(wobble, 0);
    ctx.fillStyle = e.stunned > 0 ? COLORS.purple : COLORS.beige;
    ctx.fillRect(3, 7, 32, 25);
    ctx.fillRect(8, 2, 22, 31);
    ctx.fillStyle = "#24152f";
    ctx.fillRect(10, 12, 5, 6);
    ctx.fillRect(23, 12, 5, 6);
    ctx.fillRect(14, 24, 11, 4);
    ctx.fillStyle = COLORS.beigeDark;
    ctx.fillRect(4, 32, 10, 6);
    ctx.fillRect(24, 32, 10, 6);
    if (e.stunned > 0) {
      drawSparkle(3, 0, 5, COLORS.yellow);
      drawSparkle(34, 2, 5, COLORS.teal);
    }
    ctx.restore();
  }

  function drawPlayer() {
    if (player.invuln > 0 && Math.floor(player.invuln * 12) % 2 === 0) return;

    const c = characters[player.character];
    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    if (player.facing < 0) ctx.scale(-1, 1);

    if (player.shield > 0) {
      ctx.strokeStyle = `rgba(65,230,208,${.55 + Math.sin(performance.now() * .012) * .25})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 43, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = c.color;
    ctx.fillRect(-13, -25, 26, 20);
    ctx.fillStyle = "#f1b899";
    ctx.fillRect(-10, -22, 20, 17);
    ctx.fillStyle = "#2b1936";
    ctx.fillRect(-10, -25, 20, 6);
    ctx.fillRect(-10, -22, 5, 7);
    ctx.fillStyle = "#1b1028";
    ctx.fillRect(3, -15, 3, 3);

    ctx.fillStyle = c.color;
    ctx.fillRect(-15, -5, 30, 26);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-15, 7, 30, 6);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4, 0, 8, 8);

    ctx.fillStyle = "#211331";
    ctx.fillRect(-14, 21, 10, 7);
    ctx.fillRect(4, 21, 10, 7);

    ctx.fillStyle = c.accent;
    ctx.fillRect(13, 0, 9, 6);
    ctx.restore();
  }

  function drawExit() {
    const unlocked = player.shards >= 6 && level.boss && level.boss.dead;
    const e = level.exit;
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    const pulse = 1 + Math.sin(performance.now() * .006) * .07;
    ctx.scale(pulse, pulse);
    const rainbow = [COLORS.pink, COLORS.orange, COLORS.yellow, COLORS.teal, COLORS.purple];
    rainbow.forEach((color, i) => {
      ctx.strokeStyle = unlocked ? color : COLORS.beigeDark;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 26, 58 - i * 9, Math.PI, 0);
      ctx.stroke();
    });
    ctx.fillStyle = unlocked ? "rgba(255,255,255,.45)" : "rgba(60,50,45,.45)";
    ctx.fillRect(-50, 26, 100, 55);
    ctx.fillStyle = COLORS.white;
    ctx.font = "bold 14px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(unlocked ? "FABULOUS EXIT" : "LOCKED", 0, -48);
    ctx.restore();
  }

  function drawProjectiles() {
    for (const p of projectiles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = COLORS.white;
      ctx.font = `bold ${p.hostile ? 10 : 13}px Courier New`;
      ctx.fillText(p.hostile ? "NO" : "YAS", p.x + 2, p.y + 14);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawPalm(x, groundY, scale) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#442356";
    ctx.fillRect(-4, -72, 8, 72);
    ctx.fillStyle = "#281339";
    ctx.fillRect(0, -72, 4, 72);
    ctx.fillStyle = COLORS.teal;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i / 5) * Math.PI * 2);
      ctx.fillRect(0, -76, 38, 8);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawSparkle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - size, y - 1, size * 2, 2);
    ctx.fillRect(x - 1, y - size, 2, size * 2);
  }

  function drawHUD() {
    const compact = W < 620;
    const pad = compact ? 8 : 16;
    const h = compact ? 52 : 70;
    ctx.fillStyle = "rgba(16,8,40,.84)";
    ctx.fillRect(pad, pad, compact ? W - pad*2 : 300, h);
    ctx.strokeStyle = COLORS.white; ctx.lineWidth = compact ? 2 : 3;
    ctx.strokeRect(pad, pad, compact ? W - pad*2 : 300, h);

    const c = characters[player.character];
    const box = compact ? 32 : 44;
    ctx.fillStyle = c.color; ctx.fillRect(pad+10,pad+10,box,box);
    ctx.fillStyle="#140c2b"; ctx.font=`bold ${compact?18:24}px Courier New`; ctx.textAlign="center";
    ctx.fillText(c.name[0],pad+10+box/2,pad+(compact?34:43));
    ctx.textAlign="left"; ctx.fillStyle=COLORS.white; ctx.font=`bold ${compact?13:16}px Courier New`;
    ctx.fillText(c.name,pad+(compact?50:68),pad+(compact?23:24));
    ctx.font=`${compact?9:12}px Courier New`; ctx.fillStyle="#d6c8ef";
    ctx.fillText(c.ability,pad+(compact?50:68),pad+(compact?39:44));

    const heartStart = compact ? W-148 : 202;
    for (let i=0;i<4;i++) { ctx.fillStyle=i<player.health?COLORS.pink:"#543350"; drawPixelHeart(heartStart+i*(compact?20:22),pad+(compact?27:34),compact?1.7:2); }
    ctx.fillStyle=COLORS.white; ctx.font=`bold ${compact?12:16}px Courier New`; ctx.textAlign="right";
    ctx.fillText(`◆ ${player.shards}/6  CARD ${player.cards}/${level.cards.length}`,W-pad-8,pad+h-8);
  }

  function drawPixelHeart(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillRect(-5, -3, 4, 4);
    ctx.fillRect(1, -3, 4, 4);
    ctx.fillRect(-7, -1, 14, 5);
    ctx.fillRect(-5, 4, 10, 3);
    ctx.fillRect(-3, 7, 6, 2);
    ctx.restore();
  }

  function loop(time) {
    const dt = Math.min(.033, (time - lastTime) / 1000 || 0);
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
    if (event.code === "Digit1") switchCharacter(0);
    if (event.code === "Digit2") switchCharacter(1);
    if (event.code === "Digit3") switchCharacter(2);
    if (event.code === "KeyR" && !running) startGame();
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  characterButtons.forEach((button) => {
    button.addEventListener("click", () => switchCharacter(Number(button.dataset.character)));
  });

  touchButtons.forEach((button) => {
    const action = button.dataset.action;
    if (action === "switch") {
      button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.classList.add("pressed"); cycleCharacter(); });
      ["pointerup","pointercancel","pointerleave"].forEach(type => button.addEventListener(type, () => button.classList.remove("pressed")));
      return;
    }
    const press = (event) => { event.preventDefault(); touch[action] = true; button.classList.add("pressed"); };
    const release = (event) => { event.preventDefault(); touch[action] = false; button.classList.remove("pressed"); };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });

  muteButton.addEventListener("click", () => {
    muted = !muted;
    muteButton.textContent = `SOUND: ${muted ? "OFF" : "ON"}`;
    if (!muted) blip(540, .08, "square");
  });

  function resizeGameCanvas() {
    const bounds = stageWrap.getBoundingClientRect();
    const aspect = Math.max(.72, Math.min(1.8, bounds.width / Math.max(1,bounds.height)));
    W = Math.round(H * aspect);
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    cameraX = Math.max(0, Math.min(WORLD_W-W,cameraX));
  }

  window.addEventListener("resize", resizeGameCanvas);
  window.addEventListener("orientationchange", () => setTimeout(resizeGameCanvas,180));
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch { showMessage("ROTATE SIDEWAYS FOR ARCADE MODE."); }
  });

  startButton.addEventListener("click", startGame);

  resizeGameCanvas();
  buildLevel();
  requestAnimationFrame(loop);
})();
