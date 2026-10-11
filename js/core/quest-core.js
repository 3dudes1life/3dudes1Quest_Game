"use strict";

/**
 * 3Dudes1Quest shared cast + power contract.
 * Adventure files may change worlds, enemies, bosses, dialogue and music.
 * They must not redefine the five main characters or the three dude powers.
 */
(() => {
  const VERSION = "3.4.0";
  const CAST_ASSET_VERSION = "original-world-outfits-340";
  const ANIMATIONS = Object.freeze(["idle", "walk", "jump", "attack", "hurt", "celebrate"]);

  const CAST = Object.freeze([
    Object.freeze({
      id: "will", key: "will", name: "Will", letter: "W",
      color: "#ff4fb8", accent: "#ffe66d", speed: 6.2, jump: 14,
      power: "Rainbow Ricochet", powerName: "Rainbow Ricochet",
      shortPower: "BOUNCE", powerIcon: "🌈", shot: "rainbow"
    }),
    Object.freeze({
      id: "daniel", key: "daniel", name: "Daniel", letter: "D",
      color: "#8d5cff", accent: "#3ce7d2", speed: 5.7, jump: 13.5,
      power: "Heartfield Burst", powerName: "Heartfield Burst",
      shortPower: "HEARTS", powerIcon: "💖", shot: "heart"
    }),
    Object.freeze({
      id: "caleb", key: "caleb", name: "Caleb", letter: "C",
      color: "#ff9a3c", accent: "#ffffff", speed: 5.9, jump: 13,
      power: "Long-Range Cookie Toss", powerName: "Long-Range Cookie Toss",
      shortPower: "TOSS", powerIcon: "🍪", shot: "cookie"
    })
  ]);

  const PETS = Object.freeze({
    rigsby: Object.freeze({ id: "rigsby", name: "Rigsby", w: 56, h: 40, collar: "#3ce7d2" }),
    zoey: Object.freeze({ id: "zoey", name: "Zoey", w: 54, h: 38, collar: "#ff4fb8" })
  });

  const CONTROLS = Object.freeze({
    left: Object.freeze(["ArrowLeft", "KeyA"]),
    right: Object.freeze(["ArrowRight", "KeyD"]),
    jump: Object.freeze(["ArrowUp", "KeyW"]),
    power: Object.freeze(["Space", "KeyX", "KeyF"]),
    pause: Object.freeze(["Escape", "KeyP"]),
    ultimate: Object.freeze(["KeyQ"]),
    switch1: Object.freeze(["Digit1"]),
    switch2: Object.freeze(["Digit2"]),
    switch3: Object.freeze(["Digit3"])
  });

  const POWER_CONTRACT = Object.freeze({
    rainbow: Object.freeze({ width: 58, height: 22, speed: 12.8, life: 130, bounces: 2, maxTargetRange: 430, damage: 1 }),
    heart: Object.freeze({ width: 38, height: 34, speed: 10.6, life: 138, fieldLife: 62, detonateAge: 30, fieldRadius: 98, damage: 1 }),
    cookie: Object.freeze({ width: 32, height: 32, speed: 10.4, lift: -5.7, gravity: 0.28, life: 220, fuse: 42, splashRadius: 220, damage: 2 })
  });

  function actionForCode(code) {
    for (const [action, codes] of Object.entries(CONTROLS)) {
      if (codes.includes(code)) return action;
    }
    return "";
  }

  function spritePath(character, animation = "idle") {
    const key = typeof character === "number" ? CAST[character]?.key : character?.key || character;
    if (!key || !ANIMATIONS.includes(animation)) throw new Error(`Unknown cast sprite: ${String(key)} ${animation}`);
    return `assets/sprites_hd/${key}_${animation}.png?cast=${CAST_ASSET_VERSION}`;
  }

  function loadCastImages() {
    if(window.QuestCast)return QuestCast.loadImages();
    const images = {};
    const load = (key, src) => {
      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";
      image.src = src;
      images[key] = image;
    };
    for (const dude of CAST) {
      for (const animation of ANIMATIONS) {
        load(`${dude.key}_${animation}`, spritePath(dude, animation));
      }
    }
    for (const animation of ["idle", "walk", "bark"]) {
      load(`rigsby_${animation}`, `assets/sprites_hd/rigsby_${animation}.png?cast=${CAST_ASSET_VERSION}`);
    }
    return images;
  }

  function requiredCastKeys() {
    const keys = [];
    for (const dude of CAST) for (const animation of ANIMATIONS) keys.push(`${dude.key}_${animation}`);
    keys.push("rigsby_idle", "rigsby_walk", "rigsby_bark");
    return keys;
  }

  function imageReady(image) {
    return !!(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
  }

  async function preloadCastImages(images, timeoutMs = 12000) {
    if(window.QuestCast){try{await QuestCast.ready}catch(error){return {ready:false,results:[],missing:[{key:"atlas",reason:error.message}]}}}
    const keys = requiredCastKeys();
    const waitFor = (key) => new Promise(resolve => {
      const image = images[key];
      if (imageReady(image)) return resolve({key, ok: true});
      if (!image) return resolve({key, ok: false, reason: "missing image object"});
      let settled = false;
      const finish = (ok, reason = "") => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        image.removeEventListener("load", onLoad);
        image.removeEventListener("error", onError);
        resolve({key, ok, reason});
      };
      const onLoad = async () => {
        try { if (typeof image.decode === "function") await image.decode(); } catch (_) {}
        finish(imageReady(image), imageReady(image) ? "" : "decoded without dimensions");
      };
      const onError = () => finish(false, "asset request failed");
      const timer = setTimeout(() => finish(imageReady(image), imageReady(image) ? "" : "timeout"), timeoutMs);
      image.addEventListener("load", onLoad, {once: true});
      image.addEventListener("error", onError, {once: true});
    });
    const results = await Promise.all(keys.map(waitFor));
    const missing = results.filter(result => !result.ok);
    return {ready: missing.length === 0, results, missing};
  }

  function castImagesReady(images) {
    return requiredCastKeys().every(key => imageReady(images[key]));
  }

  function makePowerProjectile(dudeIndex, player) {
    const dude = CAST[dudeIndex];
    if (!dude) throw new Error(`Unknown dude index: ${dudeIndex}`);
    const facing = player.facing ?? player.face ?? 1;

    if (dude.shot === "rainbow") {
      return {
        kind: "heroShot",
        feedback: "Rainbow Ricochet!",
        sound: "ricochet",
        entity: {
          type: "rainbow",
          x: player.x + (facing > 0 ? 48 : -18),
          y: player.y + 30,
          w: POWER_CONTRACT.rainbow.width,
          h: POWER_CONTRACT.rainbow.height,
          vx: facing * POWER_CONTRACT.rainbow.speed,
          vy: 0,
          life: POWER_CONTRACT.rainbow.life,
          trail: [],
          bounces: POWER_CONTRACT.rainbow.bounces,
          hitTargets: []
        }
      };
    }

    if (dude.shot === "heart") {
      return {
        kind: "heroShot",
        feedback: "Heartfield launched!",
        sound: "heart",
        entity: {
          type: "heart",
          x: player.x + (facing > 0 ? 58 : -34),
          y: player.y + 18,
          w: POWER_CONTRACT.heart.width,
          h: POWER_CONTRACT.heart.height,
          vx: facing * POWER_CONTRACT.heart.speed,
          vy: 0,
          life: POWER_CONTRACT.heart.life,
          age: 0,
          trail: [],
          facing
        }
      };
    }

    return {
      kind: "cookieBomb",
      feedback: "Long-range cookie toss!",
      sound: "cookie",
      entity: {
        x: player.x + (facing > 0 ? 52 : -18),
        y: player.y + 20,
        w: POWER_CONTRACT.cookie.width,
        h: POWER_CONTRACT.cookie.height,
        vx: facing * POWER_CONTRACT.cookie.speed,
        vy: POWER_CONTRACT.cookie.lift,
        gravity: POWER_CONTRACT.cookie.gravity,
        life: POWER_CONTRACT.cookie.life,
        fuse: POWER_CONTRACT.cookie.fuse,
        stuck: false,
        target: null,
        trail: []
      }
    };
  }

  function heartPath(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.25);
    ctx.bezierCurveTo(x - size * 0.72, y - size * 0.28, x - size * 0.55, y - size * 0.82, x, y - size * 0.42);
    ctx.bezierCurveTo(x + size * 0.55, y - size * 0.82, x + size * 0.72, y - size * 0.28, x, y + size * 0.25);
    ctx.closePath();
  }

  function drawHeroShots(ctx, shots, time, cameraX = 0) {
    QuestRetro.shots(ctx, shots, time, cameraX);
  }

  function drawPositiveFields(ctx, fields, time, cameraX = 0) {
    QuestRetro.fields(ctx, fields, time, cameraX);
  }

  function drawCookieBombs(ctx, bombs, time, cameraX = 0) {
    QuestRetro.cookies(ctx, bombs, time, cameraX);
  }

  function drawBeagle(ctx, x, y, time, variant = "rigsby", flip = false) {
    if(window.QuestCast?.drawPet(ctx,x,y,time,variant,flip))return;
    const run = Math.sin(time * 0.012 + x * 0.01);
    ctx.save();
    ctx.translate(x + (flip ? 54 : 0), y);
    ctx.scale(flip ? -1 : 1, 1);
    ctx.fillStyle = "rgba(0,0,0,.16)";
    ctx.beginPath();
    ctx.ellipse(27, 38, 27, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = variant === "zoey" ? "#f2e6d6" : "#d8b28a";
    ctx.beginPath();
    ctx.ellipse(28, 21, 25, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = variant === "zoey" ? "#6a4431" : "#6f4932";
    ctx.beginPath();
    ctx.ellipse(45, 13, 16, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(47, 22, 11, 15, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#23170f";
    ctx.beginPath();
    ctx.arc(57, 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(48, 9, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#21150f";
    ctx.beginPath();
    ctx.arc(49, 9, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = variant === "zoey" ? "#ff4fb8" : "#3ce7d2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(45, 19, 10, 0.2, 2.5);
    ctx.stroke();
    ctx.strokeStyle = variant === "zoey" ? "#f2e6d6" : "#d8b28a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(14, 30);
    ctx.lineTo(12 + run * 3, 39);
    ctx.moveTo(34, 31);
    ctx.lineTo(36 - run * 3, 39);
    ctx.stroke();
    ctx.strokeStyle = variant === "zoey" ? "#6a4431" : "#6f4932";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(4, 18);
    ctx.quadraticCurveTo(-8, 5, -2, -4 - run * 3);
    ctx.stroke();
    ctx.restore();
  }



  /**
   * Draw a sprite without ever allowing an image/canvas failure to stop the game loop.
   * Returns true only when the sprite frame was successfully painted.
   */
  function safeSprite(ctx, image, x, y, frame, frameWidth, frameHeight, width, height, flip = false) {
    if (!ctx || !image || !image.complete || !image.naturalWidth || !image.naturalHeight) return false;
    const values = [x, y, frame, frameWidth, frameHeight, width, height];
    if (!values.every(Number.isFinite) || frameWidth <= 0 || frameHeight <= 0 || width <= 0 || height <= 0) return false;
    const columns = Math.max(1, Math.floor(image.naturalWidth / frameWidth));
    const safeFrame = ((Math.floor(frame) % columns) + columns) % columns;
    const sourceX = safeFrame * frameWidth;
    const sourceWidth = Math.min(frameWidth, image.naturalWidth - sourceX);
    const sourceHeight = Math.min(frameHeight, image.naturalHeight);
    if (sourceWidth <= 0 || sourceHeight <= 0) return false;
    ctx.save();
    try {
      ctx.imageSmoothingEnabled = false;
      ctx.translate(Math.round(x + (flip ? width : 0)), Math.round(y));
      ctx.scale(flip ? -1 : 1, 1);
      ctx.drawImage(image, sourceX, 0, sourceWidth, sourceHeight, 0, 0, width, height);
      return true;
    } catch (error) {
      console.warn("QuestCore sprite fallback activated", error);
      return false;
    } finally {
      ctx.restore();
    }
  }

  function resolveDudeAnimation(player, time) {
    let animation = "idle";
    let frames = 6;
    let speed = 150;
    const grounded = player.onGround ?? player.on ?? false;
    if (Number(player.animUntil) > time && ANIMATIONS.includes(player.anim)) {
      animation = player.anim;
      frames = animation === "jump" ? 4 : animation === "walk" ? 8 : 6;
      speed = animation === "walk" ? 82 : 150;
    } else if (!grounded) {
      animation = "jump";
      frames = 4;
    } else if (Math.abs(Number(player.vx) || 0) > 0.35) {
      animation = "walk";
      frames = 8;
      speed = 82;
    }
    return { animation, frames, speed };
  }

  /** Exact code-rendered Adventure 1 fallback hero. */
  function drawFallbackHero(ctx, x, y, dude, facing = 1) {
    if (!ctx || !dude) return;
    ctx.save();
    try {
      ctx.translate(x + (facing < 0 ? 44 : 0), y);
      ctx.scale(facing < 0 ? -1 : 1, 1);
      ctx.fillStyle = "#b87855";
      ctx.beginPath();
      ctx.arc(22, 15, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dude.color;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(5, 28, 34, 38, 9);
      else ctx.rect(5, 28, 34, 38);
      ctx.fill();
      ctx.fillStyle = dude.accent;
      ctx.fillRect(18, 31, 7, 30);
      ctx.fillStyle = "#211a34";
      ctx.fillRect(8, 63, 11, 17);
      ctx.fillRect(26, 63, 11, 17);
    } finally {
      ctx.restore();
    }
  }

  /**
   * Canonical cross-adventure hero renderer. It uses Adventure 1 sprite timing,
   * then guarantees a visible code-rendered hero if an asset is late or invalid.
   */
  function drawDude(ctx, options) {
    const {
      images = {}, dudeIndex = 0, player, time = 0,
      cameraX = 0, groundY = null
    } = options || {};
    if (!ctx || !player) return { drawn: "none", animation: "idle" };
    const dude = CAST[dudeIndex] || CAST[0];
    const facing = player.facing ?? player.face ?? 1;
    const screenX = (Number(player.x) || 0) - (Number(cameraX) || 0);
    const screenY = Number(player.y) || 0;
    const resolvedGround = Number.isFinite(groundY) ? groundY : screenY + (Number(player.h) || 72);
    const { animation, frames, speed } = resolveDudeAnimation(player, time);
    const image = images[`${dude.key}_${animation}`] || images[`${dude.key}_idle`];
    const alpha = Number(player.inv) > 0 && Math.floor(time / 80) % 2 === 0 ? 0.35 : 1;
    ctx.save();
    try {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(0,0,0,.22)";
      ctx.beginPath();
      ctx.ellipse(screenX + 22, resolvedGround - 2, 31, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      const frame = animation==="jump" ? ((Number(player.vy)||0)>=0?2:0)+Math.floor(time/speed)%2 : Math.floor(time / speed) % frames;
      let painted = safeSprite(ctx, image, screenX - 41, screenY - 50, frame, 192, 192, 126, 126, facing < 0);
      if (!painted && animation !== "idle") {
        painted = safeSprite(ctx, images[`${dude.key}_idle`], screenX - 41, screenY - 50, Math.floor(time / 150) % 6, 192, 192, 126, 126, facing < 0);
      }
      return { drawn: painted ? "sprite" : "waiting", animation };
    } catch (error) {
      console.warn("QuestCore locked cast sprite unavailable", error);
      return { drawn: "waiting", animation };
    } finally {
      ctx.restore();
    }
  }

  /**
   * Runs every locked Adventure 1 animation through the real shared renderer.
   * This catches runtime-only Canvas API failures that syntax checks cannot see.
   */
  function verifyCastRenderer(images) {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 240;
    const testCtx = canvas.getContext("2d");
    const animations = ["idle", "walk", "jump", "attack", "hurt", "celebrate"];
    const results = [];
    if (!testCtx) return { ready: false, results, error: "2D canvas unavailable" };

    for (let dudeIndex = 0; dudeIndex < CAST.length; dudeIndex++) {
      for (const animation of animations) {
        testCtx.clearRect(0, 0, canvas.width, canvas.height);
        const player = {
          x: 78, y: 94, w: 44, h: 72, vx: animation === "walk" ? 2 : 0, vy: 0,
          on: animation !== "jump", onGround: animation !== "jump", face: 1, facing: 1, inv: 0,
          anim: animation, animUntil: ["attack", "hurt", "celebrate"].includes(animation) ? 1000 : 0
        };
        let rendered;
        try {
          rendered = drawDude(testCtx, { images, dudeIndex, player, time: 100, cameraX: 0, groundY: 166 });
        } catch (error) {
          rendered = { drawn: "error", animation, error: String(error?.message || error) };
        }
        results.push({
          dude: CAST[dudeIndex].key,
          animation,
          drawn: rendered?.drawn || "none",
          ok: rendered?.drawn === "sprite",
          error: rendered?.error || ""
        });
      }
    }

    const failed = results.filter(result => !result.ok);
    return { ready: failed.length === 0, results, failed };
  }

  function drawDanielCast(ctx, player, remaining, cameraX = 0) { QuestRetro.cast(ctx, player, remaining, cameraX); }

  function validateCast(candidate) {
    if (!Array.isArray(candidate) || candidate.length !== CAST.length) return false;
    return CAST.every((locked, index) => {
      const actual = candidate[index];
      return actual && ["name", "key", "speed", "jump", "power", "powerIcon", "shot"].every(key => actual[key] === locked[key]);
    });
  }

  window.QuestCore = Object.freeze({
    VERSION,
    CAST_ASSET_VERSION,
    ANIMATIONS,
    CAST,
    PETS,
    CONTROLS,
    POWER_CONTRACT,
    actionForCode,
    spritePath,
    loadCastImages,
    preloadCastImages,
    castImagesReady,
    makePowerProjectile,
    drawHeroShots,
    drawPositiveFields,
    drawCookieBombs,
    safeSprite,
    resolveDudeAnimation,
    drawFallbackHero,
    drawDude,
    verifyCastRenderer,
    drawDanielCast,
    drawBeagle,
    validateCast
  });
})();
