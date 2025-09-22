/* =========================
   Apache — bugfix + UFO boss
   ========================= */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/* ---------- Assets ---------- */
const horseImage = new Image();
const apamboImage = new Image();
const logImage = new Image();
const enemyImage = new Image();
const coinImage = new Image();
const goldCoinImage = new Image();
const platformImage = new Image();
const powerUpImage = new Image();
const horse2Image = new Image();
const bgLayer1 = new Image();
const bgLayer2 = new Image();
const bgLayer3 = new Image();
const APPLES_PER_RAMBO = 30;
// HORSE2 (bonus trigger)
let horse2s = []; // {platform, offsetX, x, y, width, height}
const HORSE2_W = 64, HORSE2_H = 64;
let horse2CooldownUntil = 0;

// “APAMBO MODE!!!” banner state
let apamboBanner = null; // {start, duration}
const APAMBO_BANNER_DURATION = 1100; // ms (fast flash)

/* Optional boss sprite: if missing, we draw a fallback */
const ufoImage = new Image();
ufoImage.src = 'UFO.png'; // optional — safe to leave absent

const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const pauseButton = document.getElementById('pauseButton');
const jumpButton = document.getElementById('jumpButton');
const stompButton = document.getElementById('stompButton');

let logSpawnTimer = 0;
let enemySpawnTimer = 0;
let coinSpawnTimer = 0;
let platformSpawnTimer = 0;
let powerUpSpawnTimer = 0;

/* Boss timers */
let bossSpawnTimer = 0;              // counts up; when past threshold, spawn a boss
let boss = null;                     // active boss or null
let beamExposure = 0;
let suckedByBeam = false; 
let beamWasSucking = false;

let gameState = 'playing';
let imagesLoaded = 0;

let invincibleUntil = 0;      // ms timestamp when invincibility ends
let powerUpCooldownUntil = 0;    // ms timestamp to throttle powerUp spawns

const HURT_DURATION_MS = 750;   // post-hit i-frames
let hurtUntil = 0;     

/* Keep your original sources */
horseImage.src = 'APACHE.png';
apamboImage.src = 'APAMBO.png';
logImage.src = 'LOG.png';
enemyImage.src = 'ENEMY.png';
horse2Image.src = 'HORSE2.png';
coinImage.src = 'COIN.png';
goldCoinImage.src = 'GOLD_COIN.png';
platformImage.src = 'PLATFORM.png';
powerUpImage.src = 'POWERUP.png';
bgLayer1.src = 'BG_LAYER1.png';
bgLayer2.src = 'BG_LAYER2.png';
bgLayer3.src = 'BG_LAYER3.png';

/* Wait for images before starting */
[
  horseImage, logImage, enemyImage, coinImage, platformImage,
  powerUpImage, bgLayer1, bgLayer2, bgLayer3, horse2Image, goldCoinImage
].forEach(img => img.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === 11) {
    lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
    AudioKit.startSong(); 
  }
});

/* Sounds (your existing files) */
/* ===== 8-bit Audio: Music + SFX (WebAudio) ===== */
const AudioKit = (() => {
  let ctx, masterGain, started = false, muted = false;

  // --- util ---
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const midiToHz = m => 440 * Math.pow(2, (m - 69) / 12);

  // --- node builders ---
  function pulseOsc(freq, duty = 0.5, t0 = 0) {
    const o1 = ctx.createOscillator(); o1.type = 'square'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = freq;
    const g1 = ctx.createGain(), g2 = ctx.createGain();
    g1.gain.value =  0.5; g2.gain.value = -0.5;
    o1.connect(g1); o2.connect(g2);
    const m = ctx.createGain(); g1.connect(m); g2.connect(m);
    o2.detune.value = (duty - 0.5) * 120;
    o1.start(t0); o2.start(t0);
    return {
      out: m,
      stop: t => { o1.stop(t); o2.stop(t); },
      rampFreq: (to, tStart, tEnd) => {
        o1.frequency.setValueAtTime(o1.frequency.value, tStart);
        o2.frequency.setValueAtTime(o2.frequency.value, tStart);
        o1.frequency.exponentialRampToValueAtTime(to, tEnd);
        o2.frequency.exponentialRampToValueAtTime(to, tEnd);
      }
    };
  }


  function noiseNode(t0 = 0) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.start(t0);
    return src;
  }

  function envADSR(node, t0, a=0.005, d=0.07, s=0.4, r=0.08, peak=1, sus=0.3) {
    const g = ctx.createGain(); node.connect(g);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.linearRampToValueAtTime(sus,  t0 + a + d);
    return {
      in: node,
      out: g,
      release: (t) => {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + r);
      }
    };
  }

  // --- simple SFX ---
  const SFX = {
    jump() {
      const t = ctx.currentTime;
      const hz = midiToHz(76); // E5
      const {out, stop} = pulseOsc(hz, 0.25, t);
      const e = envADSR(out, t, 0.002, 0.03, 0.0, 0.08, 0.9, 0.0);
      e.out.connect(masterGain);
      stop(t + 0.12); e.release(t + 0.04);
    },
    stomp() {
      const t = ctx.currentTime;
      const hz = 110;
      const {out, stop} = pulseOsc(hz, 0.125, t);
      const e = envADSR(out, t, 0.001, 0.02, 0.0, 0.06, 1.0, 0.0);
      e.out.connect(masterGain);
      stop(t + 0.1); e.release(t + 0.03);
    },
    coin() {
      const t = ctx.currentTime;
      const n1 = pulseOsc(midiToHz(84), 0.5, t); // C6
      const e1 = envADSR(n1.out, t, 0.002, 0.04, 0.0, 0.1, 0.9, 0.0);
      e1.out.connect(masterGain);
      setTimeout(() => { const n2 = pulseOsc(midiToHz(88), 0.5, ctx.currentTime);
        const e2 = envADSR(n2.out, ctx.currentTime, 0.002, 0.04, 0, 0.08, 0.9, 0);
        e2.out.connect(masterGain); n2.stop(ctx.currentTime + 0.12); e2.release(ctx.currentTime + 0.06);
      }, 30);
      n1.stop(t + 0.12); e1.release(t + 0.06);
    },
    powerup() {
      const t = ctx.currentTime;
      const steps = [72, 76, 79, 84, 88]; // C major “shine”
      steps.forEach((m, i) => {
        const tt = t + i*0.06;
        const n = pulseOsc(midiToHz(m), 0.25, tt);
        const e = envADSR(n.out, tt, 0.002, 0.04, 0, 0.08, 0.8, 0);
        e.out.connect(masterGain); n.stop(tt + 0.12); e.release(tt + 0.06);
      });
    },
    hit() {
      const t = ctx.currentTime;
      const n = noiseNode(t);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(1200, t);
      n.connect(f);
      const e = envADSR(f, t, 0.001, 0.03, 0, 0.15, 0.9, 0);
      e.out.connect(masterGain);
      setTimeout(() => n.stop(), 160);
    },
    beam() {
      const t = ctx.currentTime;
      const n = pulseOsc(300, 0.5, t);
      n.rampFreq(140, t, t + 0.4);  // ✅ now legal
      const e = envADSR(n.out, t, 0.004, 0.05, 0.3, 0.3, 0.7, 0.2);
      e.out.connect(masterGain);
      n.stop(t + 0.5); e.release(t + 0.4);
    },
    dart() {
      const t = ctx.currentTime;
      const {out, stop} = pulseOsc(1000, 0.5, t);
      const e = envADSR(out, t, 0.001, 0.015, 0, 0.05, 0.8, 0);
      e.out.connect(masterGain); stop(t + 0.08); e.release(t + 0.03);
    },
    enemyDown() {
      const t = ctx.currentTime;
      [67, 62, 55].forEach((m, i) => {
        const tt = t + i * 0.05;
        const n = pulseOsc(midiToHz(m), 0.25, tt);
        const e = envADSR(n.out, tt, 0.001, 0.03, 0, 0.06, 0.9, 0);
        e.out.connect(masterGain); n.stop(tt + 0.09); e.release(tt + 0.05);
      });
    },
    gameover() {
      const t = ctx.currentTime;
      [72, 67, 60, 48].forEach((m, i) => {
        const tt = t + i*0.18;
        const n = pulseOsc(midiToHz(m), 0.5, tt);
        const e = envADSR(n.out, tt, 0.003, 0.08, 0.0, 0.25, 0.9, 0.0);
        e.out.connect(masterGain); n.stop(tt + 0.35); e.release(tt + 0.18);
      });
    }
  };

  // --- tiny music sequencer (2 voices) ---
  // “Thin Redneck Adventure” — upbeat, simple I–♭VII–IV vibe in A:
  const SONG = {
    bpm: 132,
    patternLen: 16,
    // lead: [midi, steps], 0 = rest
    lead:  [ 81,  0,  81,  83,   81,  79,  76,  0,   81,  0,  81,  83,   86,  83,  81,  0],
    bass:  [ 45,  45, 45,  45,   43,  43,  43,  43,  40,  40, 40,  40,   43,  43,  43,  43],
  };

  let songTimer = null, songStep = 0;
  function scheduleStep(stepIdx, t0) {
    const spb = 60 / SONG.bpm;
    const dur = spb * 0.9; // staccato
    // lead
    const l = SONG.lead[stepIdx % SONG.patternLen];
    if (l) {
      const {out, stop} = pulseOsc(midiToHz(l), 0.25, t0);
      const g = ctx.createGain(); g.gain.value = 0.22; out.connect(g); g.connect(masterGain);
      const e = envADSR(g, t0, 0.002, 0.05, 0.15, 0.05, 1.0, 0.5);
      e.out.connect(masterGain); stop(t0 + dur); e.release(t0 + dur - 0.04);
    }
    // bass
    const b = SONG.bass[stepIdx % SONG.patternLen];
    if (b) {
      const {out, stop} = pulseOsc(midiToHz(b), 0.125, t0);
      const g = ctx.createGain(); g.gain.value = 0.18; out.connect(g); g.connect(masterGain);
      const e = envADSR(g, t0, 0.003, 0.04, 0.2, 0.06, 1.0, 0.6);
      e.out.connect(masterGain); stop(t0 + dur); e.release(t0 + dur - 0.05);
    }
  }
  function startSong() {
    if (!ctx) init();
    if (songTimer) return;
    const spb = 60 / SONG.bpm;
    let base = ctx.currentTime + 0.06;
    songTimer = setInterval(() => {
      const t = base + songStep * spb;
      scheduleStep(songStep, t);
      songStep = (songStep + 1) % SONG.patternLen;
    }, spb * 1000);
  }
  function stopSong() {
    if (songTimer) { clearInterval(songTimer); songTimer = null; }
  }

  // --- public ---
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
  }

  async function readyFromGesture() {
    if (!ctx) init();
    if (ctx.state === 'suspended') await ctx.resume();
    started = true;
  }

  function setMuted(v) {
    muted = !!v;
    if (masterGain) masterGain.gain.value = muted ? 0 : 0.8;
  }

  return {
    readyFromGesture, startSong, stopSong, setMuted,
    sfx: SFX,
    get started(){ return started; },
    toggleMute(){ setMuted(!muted); }
  };
})();

/* Wrap your old variables so existing calls still work */
const jumpSound    = { play: () => AudioKit.sfx.jump() };
const stompSound   = { play: () => AudioKit.sfx.stomp() };
const collectSound = { play: () => AudioKit.sfx.coin()  };
const gameOverSound= { play: () => AudioKit.sfx.gameover() };

/* Start audio context on first input (mobile-safe) */
const _armAudio = () => {
  if (!AudioKit.started) AudioKit.readyFromGesture();
  window.removeEventListener('pointerdown', _armAudio);
  window.removeEventListener('keydown', _armAudio);
};
window.addEventListener('pointerdown', _armAudio, { once: true });
window.addEventListener('keydown', _armAudio,  { once: true });

/* Physics */
const GROUND_Y = 300;
const NORMAL_GRAVITY = 980;
const JUMP_GRAVITY   = 2;

let horse = {
  x: 50, y: GROUND_Y,
  width: 64, height: 64,
  stomping: false, stompCount: 0,
  score: 0, speed: 200,
  isJumping: false, velocityY: 0,
  gravity: NORMAL_GRAVITY, onGround: true,
  trampleAngle: 0, lives: 3,
  invincible: false, invincibleTimer: 0,
  jumpHoldTime: 0, maxJumpHoldTime: 0.3
};

let logs = [];
let enemies = [];
let coins = [];
let platforms = [];
let powerUps = [];
let keys = {};
let goldCoins = [];

let gameSpeed = 200;
let frame = 0;
let level = 1;
let isPaused = false;
let animationId;

let bgLayer1X = 0;
let bgLayer2X = 0;
let bgLayer3X = 0;

/* === APAMBO (Rambo mode) + darts === */
let applesCollected = 0;        // apples == your coins
let ramboUntil = 0;             // ms timestamp when APAMBO ends
let nextDartAt = 0;             // ms timestamp for next auto-shot
const RAMBO_DURATION = 5500;    // 5.5s
const DART_INTERVAL = 120;      // rapid fire cadence (ms)
const DART_SPEED = 520;         // px/s
let darts = [];                 // active projectiles

/* ---------- Input ---------- */
document.addEventListener('keydown', e => {
  keys[e.code] = true;

  if (e.code === 'ControlLeft' && !horse.stomping) {
    horse.stomping = true;
    horse.stompCount = 0;
  }

  if (e.code === 'Space' && horse.onGround) {
    horse.isJumping = true;
    horse.velocityY = -350;
    horse.jumpHoldTime = 0;
    horse.onGround = false;
    jumpSound.play();
  }

  if (e.code === 'Escape') {
    isPaused = !isPaused;
    if (!isPaused) {
      lastTime = performance.now();
      animationId = requestAnimationFrame(gameLoop);
      AudioKit.startSong();
    } else {
      cancelAnimationFrame(animationId);
      drawPauseOverlay();
      AudioKit.stopSong();
    }
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'ControlLeft') {
    horse.stomping = false;
    horse.trampleAngle = 0;
  }
});

function isInvincible() {
  // treat either timer as invincibility (powerup OR post-hit i-frames)
  return performance.now() < Math.max(invincibleUntil, hurtUntil);
}

/* ---------- Spawners ---------- */
function createLog() {
  logs.push({ x: canvas.width, y: GROUND_Y, width: 64, height: 64, stomped: 0, isBlocking: true });
}

function spawnGoldCoin(x, y) {
  goldCoins.push({
    x: Math.round(x - 16),   // center horizontally (32px wide)
    y: Math.round(y - 32),   // sit on ground: top = GROUND_Y - height
    width: 32,
    height: 32,
    collected: false,
    t: 0
  });
}
function createEnemy() {
  const enemyY = GROUND_Y; // start on the ground
  enemies.push({
    x: canvas.width, y: enemyY, width: 64, height: 64,
    stomped: false, moveDirection: 1, moveAmplitude: 50, moveSpeed: 2,
    baseX: canvas.width, isJumping: false, velocityY: 0, gravity: NORMAL_GRAVITY,
    jumpTimer: Math.random() * 2 + 1
  });
}

function createCoin() {
  coins.push({ x: canvas.width, y: Math.random() * 200 + 100, width: 32, height: 32, collected: false });
}

function createPlatform() {
  // keep platforms comfortably above ground so HORSE2 never sits "on" the ground band
  const minY = 140;                                 // was ~150
  const maxY = Math.min(220, GROUND_Y - HORSE2_H - 16); // clamp away from ground
  const y = Math.round(minY + Math.random() * (maxY - minY));

  // vary width so some platforms are nice and long
  const w = Math.round(96 + Math.random() * 260);
  const p = { x: canvas.width, y, width: w, height: 32 };
  platforms.push(p);

  // ~12% chance AND respect cooldown AND only 1 on screen
  if (
    Math.random() < 0.12 &&
    performance.now() >= horse2CooldownUntil &&
    horse2s.length === 0 &&
    p.y <= GROUND_Y - HORSE2_H - 12 &&      // hard guarantee above ground
    noNearbyLogs(p, 120)                    // don't spawn on top of a recent LOG lane
  ) {
    const safeMargin = 28;
    const offsetX = Math.round(
      safeMargin + Math.random() * Math.max(1, (w - HORSE2_W - safeMargin * 2))
    );
    horse2s.push({
      platform: p,
      offsetX,
      x: p.x + offsetX,
      y: p.y - HORSE2_H,
      width: HORSE2_W,
      height: HORSE2_H
    });
    // 12–18s cooldown before another can appear
    horse2CooldownUntil = performance.now() + (12000 + Math.random() * 6000);
  }
}




function createPowerUp() {
  powerUps.push({ x: canvas.width, y: Math.random() * 200 + 100, width: 32, height: 32, collected: false });
}

/* ---------- Robust platform landing (fix for falling through) ---------- */
/* Swept AABB for vertical motion: if the bottom crosses the platform top in this frame, snap to it. */
function willLandOnTop(actor, platform, dt) {
  const horizontalOverlap =
    actor.x + actor.width > platform.x &&
    actor.x < platform.x + platform.width;

  if (!horizontalOverlap) return false;

  const currentBottom = actor.y + actor.height;
  const nextBottom = currentBottom + actor.velocityY * dt;

  return (
    actor.velocityY > 0 &&                // falling
    currentBottom <= platform.y + 1 &&    // was above or exactly at top
    nextBottom >= platform.y              // crosses the top this frame
  );
}

/* ---------- Updates ---------- */
function updateHorse(dt) {
  // Horizontal
  if (keys['ArrowLeft'])  horse.x -= horse.speed * dt;
  if (keys['ArrowRight']) horse.x += horse.speed * dt;
  horse.x = Math.max(0, Math.min(canvas.width - horse.width, horse.x));

  // Variable jump gravity while held
  const holdJump = horse.isJumping && keys['Space'] && horse.jumpHoldTime < horse.maxJumpHoldTime;
  const g = holdJump ? JUMP_GRAVITY : NORMAL_GRAVITY;
  if (holdJump) horse.jumpHoldTime += dt;

  // Apply gravity
  horse.velocityY += g * dt;

  // Predict landing against platforms (prevents tunneling)
  let landed = false;
  for (const p of platforms) {
    if (willLandOnTop(horse, p, dt)) {
      horse.y = p.y - horse.height;
      horse.velocityY = 0;
      horse.isJumping = false;
      horse.onGround = true;
      horse.jumpHoldTime = 0;
      landed = true;
      break;
    }
  }

  // Move vertically if not snapped to a platform
  if (!landed) {
    horse.y += horse.velocityY * dt;
  }

  // Ground
  if (horse.y >= GROUND_Y) {
    horse.y = GROUND_Y;
    horse.velocityY = 0;
    horse.isJumping = false;
    horse.onGround = true;
    horse.jumpHoldTime = 0;
  } else if (!landed) {
    horse.isJumping = true;
    horse.onGround = false;
  }

  // Stomp animation wobble
  if (horse.stomping) horse.trampleAngle = Math.sin(performance.now() / 50) * 30;

  // Invincibility timer
  horse.invincible = performance.now() < invincibleUntil;

  // Off-screen fall
  if (horse.y > canvas.height && !isInvincible()) loseLife();
}

function updateLogs(dt) {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    log.x -= gameSpeed * dt;

    if (log.x + log.width < 0) { logs.splice(i, 1); continue; }

    if (rectsOverlap(horse, log)) {
      if (horse.isJumping) {
        log.isBlocking = false; // you can clip through while airborne (existing design)
      } else if (horse.stomping && log.isBlocking) {
        log.stomped++;
        stompSound.play();
        if (log.stomped >= 5) { logs.splice(i, 1); horse.score += 10; }
      } else if (log.isBlocking) {
        // Push the horse to the left of the log
        if (horse.x + horse.width > log.x) horse.x = log.x - horse.width;
      }
    }
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.isJumping) e.y = GROUND_Y;

    // Movement (keep what you had before)
    e.x -= (gameSpeed - e.moveDirection * e.moveSpeed) * dt;
    if (Math.abs(e.x - e.baseX) > e.moveAmplitude) e.moveDirection *= -1;

    e.jumpTimer -= dt;
    if (e.jumpTimer <= 0 && !e.isJumping) {
      e.isJumping = true; e.velocityY = -200; e.jumpTimer = Math.random() * 2 + 1;
    }
    if (e.isJumping) {
      e.velocityY += e.gravity * dt;
      e.y += e.velocityY * dt;
      if (e.y >= GROUND_Y) { e.y = GROUND_Y; e.velocityY = 0; e.isJumping = false; }
    }

    if (e.x + e.width < 0) { enemies.splice(i, 1); continue; }

    // ---- Collision resolution (fixed) ----
    if (rectsOverlap(horse, e)) {
      // Was the horse coming from above this frame?
      const prevBottom = (horse.y + horse.height) - horse.velocityY * dt;
      const tolerance = 6; // pixels to avoid false side-hits on large dt
      const comingFromAbove = (horse.velocityY > 0) && (prevBottom <= e.y + tolerance);

      if (comingFromAbove) {
        // Jumping/falling on top defeats enemy
        enemies.splice(i, 1);
        AudioKit.sfx.enemyDown();
        horse.score += 20;
        // small bounce (optional)
        horse.velocityY = -120;
        // (no stompSound; remove any “stomp to kill” logic elsewhere)
      } else if (!isInvincible()) {
        // Side/body contact = damage
        loseLife();
      }
    }
  }
}

function updateCoins(dt) {
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    c.x -= gameSpeed * 0.645 * dt; 
    if (c.x + c.width < 0) { coins.splice(i, 1); continue; }
    if (!c.collected && rectsOverlap(horse, c)) {
      c.collected = true;
      coins.splice(i, 1);
      horse.score += 5;
      applesCollected++;                 // <-- count apples

      // Trigger APAMBO every 30 apples
      if (applesCollected >= APPLES_PER_RAMBO) {
        applesCollected -= APPLES_PER_RAMBO;
        ramboUntil = performance.now() + RAMBO_DURATION;
        nextDartAt = 0; // fire immediately
      }

      collectSound.play();
    }
  }
}

function updatePlatforms(dt) {
  for (let i = platforms.length - 1; i >= 0; i--) {
    const p = platforms[i];
    p.x -= gameSpeed * dt;
    if (p.x + p.width < 0) platforms.splice(i, 1);
  }
}

function updatePowerUps(dt) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.x -= gameSpeed * dt;
    if (p.x + p.width < 0) { powerUps.splice(i, 1); continue; }
    if (!p.collected && rectsOverlap(horse, p)) {
      p.collected = true; powerUps.splice(i, 1);
      invincibleUntil = performance.now() + 8000;  // 8 seconds
      horse.invincible = true;
      powerUpCooldownUntil = performance.now() + 20000; 
      collectSound.play();
      AudioKit.sfx.powerup();

    }
  }
}

function updateHorse2s(dt) {
  for (let i = horse2s.length - 1; i >= 0; i--) {
    const h2 = horse2s[i];

    // Ride along with platform
    if (!h2.platform) { horse2s.splice(i, 1); continue; }
    h2.x = h2.platform.x + h2.offsetX;
    h2.y = h2.platform.y - h2.height;

    // If the platform scrolled away, remove
    if (h2.platform.x + h2.platform.width < 0) {
      horse2s.splice(i, 1);
      continue;
    }

    // Stomp detection = player is stomping
    if (rectsOverlap(horse, h2) && horse.stomping) {
      horse2s.splice(i, 1);
      triggerApamboBanner();      // brief banner, then APAMBO active
      horse.velocityY = -160;     // tiny bounce for feel (optional)
    }
    
  }
}

function drawHorse2s() {
  for (const h2 of horse2s) {
    ctx.drawImage(horse2Image, h2.x, h2.y, h2.width, h2.height);
  }
}

// Create & show the flashing “APAMBO MODE!!!” banner, then enable APAMBO
function triggerApamboBanner() {
  // start banner
  apamboBanner = { start: performance.now(), duration: APAMBO_BANNER_DURATION };
  // immediately set APAMBO so the meter & darts are ready when banner clears
  ramboUntil = performance.now() + RAMBO_DURATION;
  nextDartAt = 0; // fire ASAP
}

// Draw the banner overlay; returns true if banner is still active this frame
function drawApamboBanner() {
  if (!apamboBanner) return false;

  const now = performance.now();
  const t = now - apamboBanner.start;
  if (t >= apamboBanner.duration) {
    apamboBanner = null;
    return false;
  }

  // Freeze world visuals under a pulsing red
  ctx.save();
  // Flashing red panel
  const pulse = 0.5 + 0.5 * Math.sin(now / 60);
  ctx.fillStyle = `rgba(255, 0, 0, ${0.35 + 0.35 * pulse})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rapid text flicker/scale
  const scale = 1 + 0.05 * Math.sin(now / 40);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  ctx.font = 'bold 64px Impact, Arial Black, Arial';
  ctx.textAlign = 'center';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.strokeText('APAMBO MODE!!!', 0, 20);
  ctx.fillText('APAMBO MODE!!!', 0, 20);
  ctx.restore();

  return true;
}

/* ---------- Boss (UFO + tractor beam) ---------- */
function spawnBoss() {
  const w = 148, h = 92;
  boss = {
    x: canvas.width + 120,
    y: 92,
    w, h,
    vx: -160,
    state: 'enter',
    stateTimer: 0,
    beamActive: false,
    beamWidth: 170,
    maxHoverTime: 6 + Math.random() * 4,
    maxBeams: 3 + Math.floor(Math.random() * 2),
    beamsFired: 0,
    aliveTime: 0,

    // patrol
    patrolSpeed: 130,
    patrolDir: 1,
    patrolLeft: 60,
    patrolRight: () => canvas.width - w - 60,

    // cow (dangling from underside)
    cow: {
      swing: 0,                // radians
      swingSpeed: 2.2,         // rad/s
      amplitude: 0.25,         // swing amplitude
      bob: 0,                  // vertical bob
      bobSpeed: 3.0,
      stuckOffsetY: 16         // how far below saucer belly the rope attaches
    },

    // beam FX
    fx: {
      particles: [],           // squares rising in beam
      noisePhase: 0,           // wavy edges
      flicker: 0
    },
    droppedGold: false,
  };
}

function updateBoss(dt) {
  if (!boss) return;

  boss.aliveTime += dt;
  boss.stateTimer += dt;

  if (boss.state === 'enter') {
    boss.x += boss.vx * dt;
    if (boss.x <= canvas.width - boss.w - 100) {
      boss.state = 'hover';
      boss.stateTimer = 0;
    }
  } else if (boss.state === 'hover') {
    // gentle bob
    boss.y = 92 + Math.sin(performance.now() / 450) * 7;

    // patrol
    boss.x += boss.patrolDir * boss.patrolSpeed * dt;
    if (boss.x <= boss.patrolLeft) { boss.x = boss.patrolLeft; boss.patrolDir = 1; }
    if (boss.x >= boss.patrolRight()) { boss.x = boss.patrolRight(); boss.patrolDir = -1; }

    if (boss.stateTimer > 1.6 && boss.beamsFired < boss.maxBeams) {
      boss.state = 'beam';
      boss.beamActive = true;
      boss.stateTimer = 0;
      spawnBeamFX(); // kick off FX burst
    } else if (boss.stateTimer >= boss.maxHoverTime || boss.aliveTime > 22) {
      boss.state = 'leave';
      boss.vx = -240;
      if (!boss.droppedGold) {
        // drop at ground near where it starts leaving
        spawnGoldCoin(boss.x + boss.w / 2, GROUND_Y);
        boss.droppedGold = true;
      }
    }
  } else if (boss.state === 'beam') {
    // patrol while beaming
    boss.x += boss.patrolDir * boss.patrolSpeed * dt;
    if (boss.x <= boss.patrolLeft) { boss.x = boss.patrolLeft; boss.patrolDir = 1; }
    if (boss.x >= boss.patrolRight()) { boss.x = boss.patrolRight(); boss.patrolDir = -1; }

    boss.y = 92 + Math.sin(performance.now() / 450) * 7;

    // wilder beam
    boss.fx.noisePhase += dt * 2.2;
    boss.fx.flicker = (Math.sin(performance.now() / 70) + 1) * 0.5; // 0..1
    updateBeamFX(dt);

    tractorPull(dt); // this already handles suction + damage

    if (boss.stateTimer > 2.25) {
      boss.beamActive = false;
      boss.beamsFired++;
      boss.state = 'hover';
      boss.stateTimer = 0;
    }
  } else if (boss.state === 'leave') {
    boss.x += boss.vx * dt;
    if (boss.x + boss.w < 0) boss = null;
  }
  if (!boss) return;

  // cow motion (always animates while boss alive)
  const c = boss.cow;
  c.swing += c.swingSpeed * dt;
  c.bob = Math.sin(performance.now() / 220) * 3;

  // contact with saucer = abducted
  const saucerHitbox = { x: boss.x + 8, y: boss.y, width: boss.w - 16, height: boss.h * 0.6 };
  // Only damage if beam is active AND player is actually being sucked up into it
  if (boss.beamActive && suckedByBeam && rectsOverlap(horse, saucerHitbox) && !isInvincible()) {
    beamExposure = 0;
    suckedByBeam = false;
    loseLife();
  }
}


function tractorPull(dt) {
  if (!boss || !boss.beamActive) {
    suckedByBeam = false;
    beamExposure = 0;
    beamWasSucking = false;
    return;
  }

  const beamTopX = boss.x + boss.w / 2;
  const beamTopY = boss.y + boss.h * 0.52;
  const beamBottomY = canvas.height;

  // If the beam would be inverted or zero-length, bail safely this frame.
  const denom = beamBottomY - beamTopY;
  if (!(denom > 1)) {
    suckedByBeam = false;
    beamExposure = Math.max(0, beamExposure - dt);
    beamWasSucking = false;
    return;
  }

  // Half-width along the cone; guaranteed finite & non-negative
  function halfWidthAt(y) {
    const tRaw = (y - beamTopY) / denom;
    const t = clamp(tRaw, 0, 1);               // clamp avoids NaN/Inf use
    return (boss.beamWidth * 0.5) * t;
  }

  // Sample points on the player
  const pxL = horse.x;
  const pxC = horse.x + horse.width / 2;
  const pxR = horse.x + horse.width;
  const pyTop = horse.y + 4;
  const pyMid = horse.y + horse.height / 2;
  const pyBot = horse.y + horse.height - 4;

  function pointInBeam(px, py) {
    if (py < beamTopY) return false;
    const hw = halfWidthAt(py);
    return Math.abs(px - beamTopX) <= hw;
  }

  const inBeam =
    pointInBeam(pxC, pyMid) ||
    pointInBeam(pxC, pyBot) ||
    pointInBeam(pxL, pyBot) ||
    pointInBeam(pxR, pyBot) ||
    pointInBeam(pxC, pyTop);

  // Edge-trigger SFX
  if (inBeam && !beamWasSucking) AudioKit.sfx.beam();

  if (inBeam) {
    suckedByBeam = true;

    beamExposure = clamp(beamExposure + dt, 0, 10);
    const ramp = Math.min(1, beamExposure / 0.8);   // 0→1 over ~0.8s
    const suction = 900 + 700 * ramp;

    // Upward acceleration
    horse.velocityY = nz(horse.velocityY, 0) - suction * dt;
    horse.isJumping = true;
    horse.onGround = false;

    // Lateral pull toward center — fully safe
    const dx = nz(beamTopX - pxC, 0);
    const denomHW = Math.max(8, halfWidthAt(pyMid)); // never < 8 to avoid huge pulls
    const centerFactor = clamp(Math.abs(dx) / denomHW, 0, 1);
    const lateralAssist = 280 * (0.6 + 0.4 * ramp) * Math.sign(dx) * (0.3 + 0.7 * centerFactor);

    horse.x = nz(horse.x, 0) + lateralAssist * dt;
    horse.x = clamp(horse.x, 0, canvas.width - horse.width);
  } else {
    suckedByBeam = false;
    beamExposure = Math.max(0, beamExposure - dt * 1.5);
  }

  beamWasSucking = inBeam;
}

function drawBoss() {
  if (!boss) return;

  const x = Math.round(boss.x);
  const y = Math.round(boss.y);
  const w = boss.w, h = boss.h;
  const cx = x + w / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false; // crisp pixel look

  /* ====== TRACTOR BEAM (under saucer, drawn first) ====== */
  if (boss.beamActive) {
    // base geometry
    const topX = cx;
    const topY = y + h * 0.52;
    const bottomY = canvas.height;
    if (!(bottomY - topY > 1)) {
       drawBeamFX();
    } else {
		}

    // pulsating width + slight sinusoidal edge wobble
    const pulse = 1 + Math.sin(performance.now() / 120) * 0.1 + boss.fx.flicker * 0.08;
    const baseW = boss.beamWidth * pulse;

    const segments = 14;
    const leftPts = [];
    const rightPts = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const yPos = topY + t * (bottomY - topY);
      const wiggle = Math.sin((t * 10) + boss.fx.noisePhase) * (8 + 8 * (1 - t)); // stronger near top
      const half = (baseW / 2) * t + wiggle;
      leftPts.push([topX - half, yPos]);
      rightPts.push([topX + half, yPos]);
    }

    // inner glow gradient
    const grad = ctx.createLinearGradient(topX, topY, topX, bottomY);
    grad.addColorStop(0, 'rgba(190,240,255,0.95)');
    grad.addColorStop(0.35, 'rgba(150,220,255,0.55)');
    grad.addColorStop(1, 'rgba(150,220,255,0.0)');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(topX, topY);
    for (const [lx, ly] of leftPts) ctx.lineTo(lx, ly);
    for (let i = rightPts.length - 1; i >= 0; i--) {
      const [rx, ry] = rightPts[i];
      ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();

    // scanlines
    ctx.globalAlpha = 0.25 + boss.fx.flicker * 0.2;
    for (let sy = topY; sy < bottomY; sy += 12) {
      const t = (sy - topY) / (bottomY - topY);
      const halfW = (baseW / 2) * t;
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.fillRect(topX - halfW, sy, halfW * 2, 2);
    }
    ctx.globalAlpha = 1;

    // particles/sparkles
    drawBeamFX();
  }

  /* ====== UFO BODY (assembled, outlined, shaded) ====== */
  if (ufoImage.complete && ufoImage.naturalWidth > 0) {
    // If you want to force our vector version, remove this block.
    ctx.drawImage(ufoImage, x, y, w, h);
  } else {
    // drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.72, w * 0.52, h * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0e0e0e';

    // saucer upper disc (red) with darker underside band—reads as one unit
    ctx.fillStyle = '#d43b35';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.55, w * 0.48, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#6a1d1c';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.63, w * 0.54, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // porthole lights (gold, with dark rims so they look embedded)
    for (let i = -2; i <= 2; i++) {
      const lx = cx + i * (w * 0.135);
      const ly = y + h * 0.60;
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(lx, ly, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffcf3b';
      ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI * 2); ctx.fill();
    }

    // dome base ring (ties dome to hull)
    ctx.fillStyle = '#1f1f1f';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.48, w * 0.24, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // glass dome (blue gradient)
    const domeGrad = ctx.createLinearGradient(cx, y + h * 0.18, cx, y + h * 0.48);
    domeGrad.addColorStop(0, '#7fd1ff');
    domeGrad.addColorStop(1, '#2b7bd0');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.36, w * 0.28, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // green alien blob
    ctx.fillStyle = '#6dc24d';
    ctx.strokeStyle = '#1a3a16';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.40, w * 0.11, h * 0.10, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // small antenna
    ctx.strokeStyle = '#0e0e0e';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, y + h * 0.18); ctx.lineTo(cx, y + h * 0.07); ctx.stroke();
    ctx.fillStyle = '#0e0e0e';
    ctx.beginPath(); ctx.arc(cx, y + h * 0.06, 5, 0, Math.PI * 2); ctx.fill();

    // belly (dark gray plate the cow sticks to)
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.68, w * 0.34, h * 0.10, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  /* ====== COW (dangling “stuck to the bottom”) ====== */
  // Small stylized pixel-cow; uses rectangles & arcs, swings a bit.
  const c = boss.cow;
  const attachX = cx;
  const attachY = y + h * 0.68 + c.stuckOffsetY;
  const swingX = Math.sin(c.swing) * (c.amplitude * 14); // left/right swing
  const cowX = Math.round(attachX - 26 + swingX);
  const cowY = Math.round(attachY + c.bob);

  // rope/tractor “hold”
  ctx.strokeStyle = 'rgba(80,80,80,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(attachX, attachY); ctx.lineTo(cowX + 26, cowY + 6); ctx.stroke();

  // body
  ctx.fillStyle = '#f7f3e7';
  ctx.fillRect(cowX + 0, cowY + 6, 52, 34);

  // spots
  ctx.fillStyle = '#2f2f2f';
  ctx.fillRect(cowX + 8,  cowY + 12, 10, 8);
  ctx.fillRect(cowX + 28, cowY + 18, 12, 10);

  // head
  ctx.fillStyle = '#f7f3e7';
  ctx.fillRect(cowX - 12, cowY + 12, 20, 18);
  // muzzle
  ctx.fillStyle = '#f7a6a6';
  ctx.fillRect(cowX - 12, cowY + 22, 20, 8);
  // eyes
  ctx.fillStyle = '#111';
  ctx.fillRect(cowX - 6, cowY + 16, 3, 3);
  ctx.fillRect(cowX + 2, cowY + 16, 3, 3);
  // horns
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(cowX - 12, cowY + 10, 4, 3);
  ctx.fillRect(cowX + 4,  cowY + 10, 4, 3);
  // legs
  ctx.fillStyle = '#f7f3e7';
  ctx.fillRect(cowX + 6,  cowY + 40, 6, 10);
  ctx.fillRect(cowX + 18, cowY + 40, 6, 10);
  ctx.fillRect(cowX + 34, cowY + 40, 6, 10);
  ctx.fillStyle = '#111';
  ctx.fillRect(cowX + 6,  cowY + 50, 6, 4);
  ctx.fillRect(cowX + 18, cowY + 50, 6, 4);
  ctx.fillRect(cowX + 34, cowY + 50, 6, 4);
  // tail
  ctx.fillStyle = '#2f2f2f';
  ctx.fillRect(cowX + 50, cowY + 16, 3, 16);
  ctx.fillRect(cowX + 50, cowY + 30, 6, 3);

  ctx.restore();
}

function spawnBeamFX() {
  if (!boss) return;
  // seed a burst of sparkles
  for (let i = 0; i < 36; i++) {
    boss.fx.particles.push({
      x: boss.x + boss.w / 2 + (Math.random() - 0.5) * (boss.beamWidth * 0.2),
      y: boss.y + boss.h * 0.55 + Math.random() * 30,
      vx: (Math.random() - 0.5) * 30,
      vy: - (80 + Math.random() * 160),
      life: 0.6 + Math.random() * 0.8,
      size: 2 + (Math.random() < 0.25 ? 2 : 0)
    });
  }
}

function updateBeamFX(dt) {
  if (!boss) return;
  const arr = boss.fx.particles;
  for (let i = arr.length - 1; i >= 0; i--) {
    const p = arr[i];
    p.life -= dt;
    if (p.life <= 0) { arr.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // slight inward drift to center of beam
    const centerX = boss.x + boss.w / 2;
    p.x += (centerX - p.x) * 0.9 * dt;
  }
  // keep topping up while beaming
  if (boss.beamActive && arr.length < 50) {
    if (Math.random() < 0.6) arr.push({
      x: boss.x + boss.w / 2 + (Math.random() - 0.5) * (boss.beamWidth * 0.6),
      y: boss.y + boss.h * 0.55 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 40,
      vy: - (120 + Math.random() * 160),
      life: 0.4 + Math.random() * 0.8,
      size: 2
    });
  }
}

function drawBeamFX() {
  if (!boss) return;
  ctx.save();
  for (const p of boss.fx.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = 'white';
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function updateGoldCoins(dt) {
  for (let i = goldCoins.length - 1; i >= 0; i--) {
    const g = goldCoins[i];
    g.t += dt;
    // scroll with level
    g.x -= gameSpeed * dt;
    // gentle bob for attention
    g.bobY = Math.sin(g.t * 5) * 3;
    if (g.x + g.width < 0) { goldCoins.splice(i, 1); continue; }

    // pickup
    const hitbox = { x: g.x, y: g.y + g.bobY, width: g.width, height: g.height };
    if (!g.collected && rectsOverlap(horse, hitbox)) {
      g.collected = true;
      goldCoins.splice(i, 1);
      horse.lives += 1;      // reward: extra life
      collectSound.play();
    }
  }
}

function drawRamboMeter() {
  const w = 300, h = 14;
  const x = Math.round((canvas.width - w) / 2);  // centered
  const y = 14;                                  // top padding

  ctx.save();

  // Backplate
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);

  // Frame
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);

  if (performance.now() < ramboUntil) {
    // APAMBO countdown (red, draining)
    const remain = Math.max(0, ramboUntil - performance.now());
    const pct = remain / RAMBO_DURATION;
    ctx.fillStyle = '#ff5151';
    ctx.fillRect(x, y, w * pct, h);

    // label centered above bar
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('APAMBO: ' + (remain / 1000).toFixed(1) + 's',
                 x + w / 2, y - 4);
  } else {
    // progress to next APAMBO (green, filling)
    const pct = Math.min(1, applesCollected / APPLES_PER_RAMBO);
    ctx.fillStyle = '#4ec04e';
    ctx.fillRect(x, y, w * pct, h);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`APAMBO at ${APPLES_PER_RAMBO} apples`,
                 x + w / 2, y - 4);
  }

  // tick marks (every 5 apples)
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 5; i < APPLES_PER_RAMBO; i += 5) {
    const tx = x + (w * i / APPLES_PER_RAMBO);
    ctx.fillRect(Math.round(tx), y, 1, h);
  }

  ctx.restore();
}


/* ---------- Helpers ---------- */

function isNum(v){ return Number.isFinite(v); }
function nz(v, fallback=0){ return isNum(v) ? v : fallback; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

function noNearbyLogs(platform, pad = 120) {
  // If any LOG is horizontally overlapping the platform lane right now,
  // skip spawning HORSE2 to prevent the “log turned into horse2” illusion.
  const left  = platform.x - pad;
  const right = platform.x + platform.width + pad;
  for (const l of logs) {
    if (l.x + l.width > left && l.x < right) return false;
  }
  return true;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function loseLife() {
  const now = performance.now();
  // hard guard — if invincible for any reason, ignore
  if (now < Math.max(invincibleUntil, hurtUntil)) return;

  // set invulnerability *first*, so any subsequent checks this frame see it
  hurtUntil       = now + HURT_DURATION_MS;
  invincibleUntil = now + HURT_DURATION_MS;
  horse.invincible = true; // visual flicker still uses this boolean
  AudioKit.sfx.hit();

  // now apply the life change
  horse.lives--;

  // small knockback/air pop so you don't re-collide instantly
  horse.velocityY = -220;
  horse.x = Math.max(0, horse.x - 30);
  horse.isJumping = true;
  horse.onGround = false;

  if (horse.lives <= 0) {
    gameOver();
  }
}



function resetHorsePosition() {
  horse.x = 50;
  horse.y = GROUND_Y;
  horse.velocityY = 0;
  horse.isJumping = false;
  horse.onGround = true;
}

function drawBackground(dt) {
  // Parallax
  bgLayer1X -= gameSpeed * 0.2 * dt;
  bgLayer2X -= gameSpeed * 0.5 * dt;
  bgLayer3X -= gameSpeed * 1.0 * dt;

  if (bgLayer1X <= -canvas.width) bgLayer1X = 0;
  if (bgLayer2X <= -canvas.width) bgLayer2X = 0;
  if (bgLayer3X <= -canvas.width) bgLayer3X = 0;

  ctx.drawImage(bgLayer1, bgLayer1X, 0, canvas.width, canvas.height);
  ctx.drawImage(bgLayer1, bgLayer1X + canvas.width, 0, canvas.width, canvas.height);
  ctx.drawImage(bgLayer2, bgLayer2X, 0, canvas.width, canvas.height);
  ctx.drawImage(bgLayer2, bgLayer2X + canvas.width, 0, canvas.width, canvas.height);
  ctx.drawImage(bgLayer3, bgLayer3X, 0, canvas.width, canvas.height);
  ctx.drawImage(bgLayer3, bgLayer3X + canvas.width, 0, canvas.width, canvas.height);
}

function drawHorse() {
  ctx.save();
  ctx.translate(horse.x + horse.width / 2, horse.y + horse.height / 2);

  if (horse.stomping) ctx.rotate((-horse.trampleAngle * Math.PI) / 180);

  // flicker while invincible (existing)
  if (horse.invincible && Math.floor(Date.now() / 100) % 2) ctx.globalAlpha = 0.6;

  // choose sprite (APAMBO during rambo)
  const img = (performance.now() < ramboUntil) ? apamboImage : horseImage;
  ctx.drawImage(img, -horse.width / 2, -horse.height / 2, horse.width, horse.height);

  // red flash overlay while hurt
  if (performance.now() < hurtUntil) {
    ctx.globalAlpha = 0.45;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = '#ff2a2a';
    ctx.fillRect(-horse.width / 2, -horse.height / 2, horse.width, horse.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;
}


function drawLogs()      { logs.forEach(l => ctx.drawImage(logImage, l.x, l.y, l.width, l.height)); }
function drawEnemies()   { enemies.forEach(e => ctx.drawImage(enemyImage, e.x, e.y, e.width, e.height)); }
function drawCoins()     { coins.forEach(c => ctx.drawImage(coinImage, c.x, c.y, c.width, c.height)); }
function drawGoldCoins() {
  for (const g of goldCoins) {
    // gentle 0.75–1.25x pulse
    const t = performance.now();
    const pulse = 1 + Math.sin(t / 240) * 0.25;

    ctx.save();
    // softer, subtler glow — no additive blending
    ctx.shadowColor = 'rgba(255,215,0,0.35)';   // was ~0.9
    ctx.shadowBlur  = 4 + 4 * pulse;            // was ~14 + big pulse
    ctx.drawImage(goldCoinImage, g.x, g.y + (g.bobY || 0), g.width, g.height);
    ctx.restore();
  }
}
function drawPlatforms() { platforms.forEach(p => ctx.drawImage(platformImage, p.x, p.y, p.width, p.height)); }
function drawPowerUps()  { powerUps.forEach(p => ctx.drawImage(powerUpImage, p.x, p.y, p.width, p.height)); }

function spawnDart() {
  // muzzle position: tweak offsets to match your APAMBO gun
  const muzzleX = horse.x + horse.width - 8;
  const muzzleY = horse.y + horse.height * 0.45;

  darts.push({
    x: muzzleX,
    y: muzzleY,
    vx: DART_SPEED,
    width: 22,
    height: 6,
  });
}

function updateDarts(dt) {
  for (let i = darts.length - 1; i >= 0; i--) {
    const d = darts[i];
    d.x += d.vx * dt;
    if (d.x > canvas.width + 40) { darts.splice(i, 1); continue; }

    // hit ENEMY
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (rectsOverlap(d, e)) {
        enemies.splice(j, 1);
        AudioKit.sfx.enemyDown();
        darts.splice(i, 1);
        horse.score += 20;
        // optional: play a sound here
        break;
      }
    }
    if (!darts[i]) continue; // was removed

    // hit LOG
    for (let k = logs.length - 1; k >= 0; k--) {
      const l = logs[k];
      if (rectsOverlap(d, l)) {
        logs.splice(k, 1);
        darts.splice(i, 1);
        horse.score += 10;
        break;
      }
    }
  }
}

function drawDarts() {
  ctx.save();
  // simple tranquilizer darts (rectangle). Replace with sprite if you add one.
  for (const d of darts) {
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(d.x, d.y, d.width, d.height);
    // dart tip
    ctx.beginPath();
    ctx.moveTo(d.x + d.width, d.y);
    ctx.lineTo(d.x + d.width + 6, d.y + d.height / 2);
    ctx.lineTo(d.x + d.width, d.y + d.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + horse.score, 10, 30);
  ctx.fillText('Lives: ' + horse.lives, 10, 60);
  ctx.fillText('Level: ' + level, 10, 90);
  ctx.fillText('High Score: ' + (localStorage.getItem('highScore') || 0), 10, 120);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = '30px Arial';
  ctx.fillText('Final Score: ' + horse.score, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#000';
  ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 30, 150, 50);
  ctx.fillStyle = '#fff';
  ctx.font = '30px Arial';
  ctx.fillText('Restart', canvas.width / 2, canvas.height / 2 + 65);
}

function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
}

/* ---------- Game state ---------- */
function gameOver() {
  gameState = 'gameover';
  gameOverSound.play();
  const hs = +localStorage.getItem('highScore') || 0;
  if (horse.score > hs) localStorage.setItem('highScore', horse.score);
  AudioKit.stopSong();
}

canvas.addEventListener('click', (event) => {
  if (gameState !== 'gameover') return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  if (x >= canvas.width / 2 - 75 && x <= canvas.width / 2 + 75 &&
      y >= canvas.height / 2 + 30 && y <= canvas.height / 2 + 80) {
    resetGame();
  }
});

function resetGame() {
  gameState = 'playing';
  applesCollected = 0;
  ramboUntil = 0;
  nextDartAt = 0;
  darts = [];
  horse = {
    x: 50, y: GROUND_Y, width: 64, height: 64, stomping: false, stompCount: 0,
    score: 0, speed: 200, isJumping: false, velocityY: 0, gravity: NORMAL_GRAVITY,
    onGround: true, trampleAngle: 0, lives: 3, invincible: false, invincibleTimer: 0,
    jumpHoldTime: 0, maxJumpHoldTime: 0.3
  };
  logs = []; enemies = []; coins = []; platforms = []; powerUps = []; keys = {};
  gameSpeed = 200; frame = 0; level = 1; isPaused = false;
  bgLayer1X = bgLayer2X = bgLayer3X = 0;
  boss = null; bossSpawnTimer = 0;
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
  AudioKit.startSong();
}

/* ---------- Touch controls (unchanged) ---------- */
leftButton.addEventListener('pointerdown', e => { e.preventDefault(); keys['ArrowLeft'] = true; });
leftButton.addEventListener('pointerup',   e => { e.preventDefault(); keys['ArrowLeft'] = false; });

rightButton.addEventListener('pointerdown', e => { e.preventDefault(); keys['ArrowRight'] = true; });
rightButton.addEventListener('pointerup',   e => { e.preventDefault(); keys['ArrowRight'] = false; });

pauseButton.addEventListener('pointerup', e => {
  e.preventDefault();
  isPaused = !isPaused;
  if (!isPaused) { lastTime = performance.now(); animationId = requestAnimationFrame(gameLoop); }
  else { cancelAnimationFrame(animationId); drawPauseOverlay(); }
});

jumpButton.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (horse.onGround) {
    horse.isJumping = true;
    horse.velocityY = -350;
    horse.jumpHoldTime = 0;
    horse.onGround = false;
    jumpSound.play();
  }
  // simulate held Space for variable jump height
  keys['Space'] = true;
});
jumpButton.addEventListener('pointerup', e => {
  e.preventDefault();
  keys['Space'] = false;
});

stompButton.addEventListener('pointerdown', e => { e.preventDefault(); if (!horse.stomping) { horse.stomping = true; horse.stompCount = 0; } });
stompButton.addEventListener('pointerup',   e => { e.preventDefault(); horse.stomping = false; horse.trampleAngle = 0; });

/* ---------- Loop ---------- */
let lastTime = 0;

function gameLoop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.1);
  lastTime = ts;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'playing') {
    // Spawn timers
    logSpawnTimer += dt;
    enemySpawnTimer += dt;
    coinSpawnTimer += dt;
    platformSpawnTimer += dt;
    powerUpSpawnTimer += dt;
    bossSpawnTimer += dt;

    if (logSpawnTimer >= 2.5)        { createLog();      logSpawnTimer = 0; }
    if (enemySpawnTimer >= 3.1)      { createEnemy();    enemySpawnTimer = 0; }
    if (coinSpawnTimer >= 1.5)       { createCoin();     coinSpawnTimer = 0; }
    if (platformSpawnTimer >= 3.3)   { createPlatform(); platformSpawnTimer = 0; }
    if (
      powerUpSpawnTimer >= 12 &&                        // base interval (a bit rarer)
      performance.now() >= powerUpCooldownUntil &&         // cooldown gate
      powerUps.length === 0 &&                          // only one powerUp on screen
      performance.now() >= invincibleUntil              // don't spawn while invincible
    ) {
      createPowerUp();
      powerUpSpawnTimer = 0;
      // set a soft cooldown so it can’t re-appear right away unless you want it to
      powerUpCooldownUntil = performance.now() + 20000;    // 20s
    }

    // Spawn boss every ~25–35s (randomized), only if none active
    if (!boss && bossSpawnTimer >= 45 + Math.random() * 20) {
      spawnBoss();
      bossSpawnTimer = 0;
    }

    // Updates
    updateHorse(dt);
    updateLogs(dt);
    updateEnemies(dt);
    updateCoins(dt);
    updateGoldCoins(dt);
    updatePlatforms(dt);
    updatePowerUps(dt);
    updateHorse2s(dt);
    updateBoss(dt);
    if (!isNum(horse.x) || !isNum(horse.y) || !isNum(horse.velocityY)) {
      resetHorsePosition();
    }
    
    // Auto-fire while APAMBO is active
    const now = performance.now();
    if (now < ramboUntil) {
      if (now >= nextDartAt) {
        spawnDart();
        AudioKit.sfx.dart();
        nextDartAt = now + DART_INTERVAL;
      }
    }
    updateDarts(dt);    

    // Draw
    drawBackground(dt);
    drawPlatforms();
    drawCoins();
    drawGoldCoins();
    drawPowerUps();
    drawLogs();
    drawHorse2s();
    drawEnemies();
    drawBoss();
    drawHorse();
    drawScore();
    drawDarts();
    drawRamboMeter();
    if (drawApamboBanner()) {
      // Do not level-up or spawn things during banner; just render next frame
      animationId = requestAnimationFrame(gameLoop);
      return;
    }

    // Level speed-up
    if (horse.score >= level * 100) { level++; gameSpeed += 0.5; }
  } else if (gameState === 'gameover') {
    drawBackground(dt);
    drawGameOverScreen();
  }

  animationId = requestAnimationFrame(gameLoop);
}
