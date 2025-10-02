/* =========================
   Apache â€” bugfix + UFO boss
   ========================= */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const loadingStatusEl = document.getElementById('loadingStatus');
const loadingPercentEl = document.getElementById('loadingPercent');
const loadingBarEl = document.querySelector('.loading-bar');
const loadingBarFillEl = document.getElementById('loadingBarFill');

let gameState = 'title';
let gameReady = false;
let gameStarted = false;
let assetsRegistered = 0;
let assetsLoaded = 0;
let startGameButton = null;

function updateLoadingUI() {
  if (!loadingBarFillEl) {
    return;
  }
  const percent = assetsRegistered ? Math.round((assetsLoaded / assetsRegistered) * 100) : 0;
  loadingBarFillEl.style.width = `${percent}%`;
  if (loadingBarEl) {
    loadingBarEl.setAttribute('aria-valuenow', String(percent));
  }
  if (loadingPercentEl) {
    loadingPercentEl.textContent = `${percent}%`;
  }
  if (loadingStatusEl) {
    const status = assetsRegistered ? `Loading assets (${assetsLoaded}/${assetsRegistered})` : 'Preparing assets...';
    loadingStatusEl.textContent = percent >= 100 ? 'Ready to ride!' : status;
  }
}

function handleAllAssetsLoaded() {
  if (gameReady) {
    return;
  }
  gameReady = true;
  updateLoadingUI();
  refreshStartButtonState();
  if (gameStarted) {
    startMainLoop();
  }
}

function markAssetLoaded() {
  assetsLoaded = Math.min(assetsLoaded + 1, assetsRegistered);
  updateLoadingUI();
  if (assetsRegistered > 0 && assetsLoaded >= assetsRegistered) {
    handleAllAssetsLoaded();
  }
}

function registerAsset(img) {
  if (!img) {
    return img;
  }
  assetsRegistered += 1;
  const finalize = () => {
    img.removeEventListener('load', finalize);
    img.removeEventListener('error', finalize);
    markAssetLoaded();
  };
  if (img.complete && img.naturalWidth > 0) {
    markAssetLoaded();
  } else {
    img.addEventListener('load', finalize, { once: true });
    img.addEventListener('error', finalize, { once: true });
  }
  updateLoadingUI();
  return img;
}

function createAsset(src) {
  const img = new Image();
  if (src) {
    img.src = src;
  }
  return registerAsset(img);
}

function refreshStartButtonState() {
  if (!startGameButton) {
    return;
  }
  const shouldDisable = !gameReady || gameStarted;
  if (startGameButton.disabled !== shouldDisable) {
    startGameButton.disabled = shouldDisable;
  }
}

updateLoadingUI();

/* ---------- Assets ---------- */
const horseImage = createAsset('APACHE.png');
const apamboImage = createAsset('APAMBO.png');
const logImage = createAsset('LOG.png');
const enemyImage = createAsset('ENEMY.png');
const coinImage = createAsset('COIN.png');
const goldCoinImage = createAsset('GOLD_COIN.png');
const platformImage = createAsset('PLATFORM.png');
const powerUpImage = createAsset('POWERUP.png');
const horse2Image = createAsset('HORSE2.png');
const bgLayer1 = createAsset('BG_LAYER1.png');
const bgLayer2 = createAsset('BG_LAYER2.png');
const bgLayer3 = createAsset('BG_LAYER3.png');
const beerImage = createAsset('beer.png');
const spaceBgLayer2 = createAsset('SPACE_BG_LAYER2.png');
const spaceBgLayer3 = createAsset('SPACE_BG_LAYER2.png');
const apastronautImage = createAsset('apastronaut.png');
const enemySpaceImage = createAsset('ENEMYSPACE.png');
const logSpaceImage = createAsset('LOGSPACE.png');
const horse2SpaceImage = createAsset('HORSE2SPACE.png');
const laboyImage = createAsset('laboy.png');
const spaceDecorEntries = [
  { key: 'moon1', img: createAsset('space/moon1.png'), height: 140 },
  { key: 'moon2', img: createAsset('space/moon2.png'), height: 168 },
  { key: 'moon3', img: createAsset('space/moon3.png'), height: 128 },
  { key: 'meteor', img: createAsset('space/meteor.png'), height: 96 },
  { key: 'satellite', img: createAsset('space/satellite.png'), height: 110 },
  { key: 'ufospace', img: createAsset('space/ufospace.png'), height: 120 },
];
const earthDecor = { key: 'earth', img: createAsset('space/earth.png'), height: 220 };
const APPLES_PER_RAMBO = 30;
const LABOY_SCORE_INTERVAL = 1000;
const MINI_GAME_SCORE_BONUS = 500;
const APACHEMON_GAMES = [
  'Apachemon/apachemon.html',
  'Apachemon/apachemon_brody.html',
  'Apachemon/apachemon_sheriff_snip.html',
];
// HORSE2 (bonus trigger)
let horse2s = []; // {platform, offsetX, x, y, width, height}
const HORSE2_W = 64, HORSE2_H = 64;
let horse2CooldownUntil = 0;

// APAMBO MODE banner state
let apamboBanner = null; // {start, duration}
const APAMBO_BANNER_DURATION = 1100; // ms (fast flash)

/* Optional boss sprite: if missing, we draw a fallback */
const ufoImage = new Image();
const discoHorseImage = createAsset('discapache.png');
const discoBgLayer2 = createAsset('DISCO_BG_LAYER2.png');
const discoBgLayer3 = createAsset('DISCO_BG_LAYER3.png');
const discoBallFrames = Array.from({ length: 17 }, (_, i) => createAsset(`Disco Ball/db${i + 1}.png`));
const snipsFrames = Array.from({ length: 13 }, (_, i) => createAsset(`Sheriff Snips/ss${i + 1}.png`));

const startScreen = document.getElementById('startScreen');
startGameButton = document.getElementById('startGameButton');
const controlsToggleButton = document.getElementById('controlsToggleButton');
const controlsOverlay = document.getElementById('controlsOverlay');
const collectOverlay = document.getElementById('collectOverlay');
const collectiblesToggleButton = document.getElementById('collectiblesToggleButton');
const collectiblesPage = document.getElementById('collectiblesPage');
const hazardsPage = document.getElementById('hazardsPage');
const collectPrevButton = document.getElementById('collectPrevButton');
const collectNextButton = document.getElementById('collectNextButton');
const miniGameOverlay = document.getElementById('miniGameOverlay');
const miniGameFrame = document.getElementById('miniGameFrame');
const highScoresButton = document.getElementById('highScoresButton');
const highScoresOverlay = document.getElementById('highScoresOverlay');
const highScoresList = document.getElementById('highScoresList');
const highScoresStatus = document.getElementById('highScoresStatus');
const initialsOverlay = document.getElementById('initialsOverlay');
const initialsLettersEls = Array.from(document.querySelectorAll('.initial-letter'));
const initialsArrowButtons = Array.from(document.querySelectorAll('.initial-arrow'));
const initialsConfirmButton = document.getElementById('initialsConfirm');
const initialsSkipButton = document.getElementById('initialsSkip');
const initialsStatus = document.getElementById('initialsStatus');
const pauseOverlay = document.getElementById('pauseOverlay');
const pauseResumeButton = document.getElementById('pauseResumeButton');
const pauseMainMenuButton = document.getElementById('pauseMainMenuButton');
const volumeSliders = Array.from(document.querySelectorAll('[data-volume-slider]'));
const muteToggleButtons = Array.from(document.querySelectorAll('[data-mute-toggle]'));
const volumeDisplays = Array.from(document.querySelectorAll('[data-volume-display]'));

if (startGameButton) {
  refreshStartButtonState();
}

let logSpawnTimer = 0;
let enemySpawnTimer = 0;
let coinSpawnTimer = 0;
let platformSpawnTimer = 0;
let powerUpSpawnTimer = 0;
let beers = [];
let nextBeerAt = 0;

/* Boss timers */
let bossSpawnTimer = 0;              // counts up; when past threshold, spawn a boss
let boss = null;                     // active boss or null
let beamExposure = 0;
let suckedByBeam = false;
let beamWasSucking = false;
let nextBeamSoundAt = 0;

let collectOverlayPage = 'collectibles';

let invincibleUntil = 0;      // ms timestamp when invincibility ends
let powerUpCooldownUntil = 0;    // ms timestamp to throttle powerUp spawns

const HIGH_SCORES_ENDPOINT = '/.netlify/functions/high-scores';
const INITIALS_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LOCAL_SCORES_KEY = 'apacheHighScores';
let highScores = [];
let highScoresLoaded = false;
let highScoresLoading = false;
let pendingScoreSubmission = null;
let initialsIndices = [0, 0, 0];
let initialsActiveIndex = 0;
let initialsOpen = false;
let isSavingScore = false;
const DEFAULT_VOLUME = 0.8;
const VOLUME_STORAGE_KEY = 'apacheVolume';
const MUTE_STORAGE_KEY = 'apacheMuted';
let volumeLevel = DEFAULT_VOLUME;
let volumeMuted = false;

const HURT_DURATION_MS = 750;   // post-hit i-frames
let hurtUntil = 0;

/* Sounds (your existing files) */
/* ===== 8-bit Audio: Music + SFX (WebAudio) ===== */
const AudioKit = (() => {
  let ctx, masterGain, started = false, muted = false, volume = 0.8, snipLoop = null;

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
      },
      addVibrato: (freqHz = 5.7, depth = 6) => {
        const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = freqHz;
        const lfoGain = ctx.createGain(); lfoGain.gain.value = depth;
        lfo.connect(lfoGain);
        lfoGain.connect(o1.frequency);
        lfoGain.connect(o2.frequency);
        lfo.start(t0);
        return () => { try { lfo.stop(); } catch(e){} };
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
      const steps = [72, 76, 79, 84, 88]; // C major â€œshineâ€
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
      n.rampFreq(140, t, t + 0.4);  // âœ… now legal
      const e = envADSR(n.out, t, 0.004, 0.05, 0.3, 0.3, 0.7, 0.2);
      e.out.connect(masterGain);
      n.stop(t + 0.5); e.release(t + 0.4);
    },
    dart() {
      const t = ctx.currentTime;
      const n = pulseOsc(1200, 0.5, t); // Started higher for more "zip"
      n.rampFreq(600, t, t + 0.06); // Quick downward ramp for "pew" effect
      const e = envADSR(n.out, t, 0.001, 0.02, 0, 0.08, 1.0, 0); // Increased peak volume, slight duration tweak
      e.out.connect(masterGain);
      n.stop(t + 0.12); // Slightly longer tail
      e.release(t + 0.05);
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

  /* =========================
     MUSIC UPGRADE PATCH
     ========================= */

  function sineOsc(freq, t0 = 0) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq; o.start(t0);
    return o;
  }
  function sawOsc(freq, t0 = 0) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq; o.start(t0);
    return o;
  }
  function triOsc(freq, t0 = 0) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq; o.start(t0);
    return o;
  }
  function makeDistortion(amount = 24) {
    const ws = ctx.createWaveShaper();
    const n = 44100;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    ws.curve = curve; ws.oversample = '4x';
    return ws;
  }
  function addVibrato(osc, freqHz = 5.3, depth = 8) {
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = freqHz;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = depth;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start();
    return () => { try { lfo.stop(); } catch(e){} };
  }

  // percussion instruments
  function kick(t0) {
    const o = sineOsc(120, t0);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(1.0, t0+0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+0.22);
    o.frequency.setValueAtTime(120, t0);
    o.frequency.exponentialRampToValueAtTime(45, t0+0.22);
    o.connect(g).connect(masterGain);
    setTimeout(()=>{ try{o.stop();}catch(e){} }, 240);
  }
  function snare(t0) {
    const n = noiseNode(t0);
    const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.9, t0+0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+0.18);
    n.connect(bp).connect(g).connect(masterGain);
    setTimeout(()=>{ try{n.stop();}catch(e){} }, 200);
  }
  function hat(t0, open=false) {
    const n = noiseNode(t0);
    const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 5000;
    const g = ctx.createGain();
    const dur = open ? 0.18 : 0.04;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(open ? 0.5 : 0.35, t0+0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    n.connect(hp).connect(g).connect(masterGain);
    setTimeout(()=>{ try{n.stop();}catch(e){} }, (dur*1000)|0);
  }

  // string pad-ish: two detuned saws through gentle lowpass
  function stringPad(midi, t0, dur, gain=0.18) {
    const f = midiToHz(midi);
    const o1 = sawOsc(f, t0), o2 = sawOsc(f*0.999, t0), o3 = sawOsc(f*1.001, t0);
    o2.detune.value = +6; o3.detune.value = -6;
    const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 1800; lp.Q.value = 0.2;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.05);
    g.gain.linearRampToValueAtTime(gain*0.75, t0 + dur*0.6);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    o1.connect(lp); o2.connect(lp); o3.connect(lp); lp.connect(g).connect(masterGain);
    setTimeout(()=>{ try{o1.stop();o2.stop();o3.stop();}catch(e){} }, (dur*1000 + 10)|0);
  }

  // banjo/fiddle-ish lead: bright pulse w/ vibrato + quick envelope
  function twangLead(midi, t0, dur=0.24, vol=0.28) {
    const {out, stop, addVibrato} = pulseOsc(midiToHz(midi), 0.28, t0);
    const pre = ctx.createGain(); pre.gain.value = vol;
    const killVib = addVibrato(5.7, 6); // âœ… vibrato modulates the underlying oscillators
    out.connect(pre);
    const e = envADSR(pre, t0, 0.004, 0.06, 0.16, 0.08, 1.0, 0.6);
    e.out.connect(masterGain);
    stop(t0 + dur); e.release(t0 + dur - 0.04);
    setTimeout(()=>{ killVib(); }, (dur*1000+20)|0);
  }
  
  function mellowLead(midi, t0, dur=0.62, vol=0.22) {
    const s  = sineOsc(midiToHz(midi), t0);
    const p  = pulseOsc(midiToHz(midi), 0.24, t0); // a touch of breath
    const pre = ctx.createGain(); pre.gain.value = vol;
    const killVibS = (() => { // gentle vibrato on sine only
      const lfo = ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value = 5.1;
      const lfoG = ctx.createGain(); lfoG.gain.value = 4; lfo.connect(lfoG); lfoG.connect(s.frequency); lfo.start(t0);
      return ()=>{ try{ lfo.stop(); }catch(e){} };
    })();
    s.connect(pre); p.out.connect(pre);
    const e = envADSR(pre, t0, /*A*/0.02, /*D*/0.12, /*S*/0.6, /*R*/0.28, /*peak*/1.0, /*sus*/0.6);
    e.out.connect(masterGain);
    setTimeout(()=>{ try{s.stop();}catch(e){}; killVibS(); }, (dur*1000+30)|0);
    // shape
    const stopAt = t0 + dur; e.release(stopAt - 0.02);
  }

  // distorted â€œguitarâ€ chug: saw -> distortion -> lowpass gate
  function chug(midi, t0, dur=0.16, vol=0.22) {
    const f = midiToHz(midi);
    const o1 = sawOsc(f, t0);
    const o2 = sawOsc(f, t0); o2.detune.value = 4;
    const o3 = sawOsc(f, t0); o3.detune.value = -4;
    const dist = makeDistortion(80);            // increased for more intense overdrive
    const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 80;
    const lp = ctx.createBiquadFilter(); lp.type='lowpass';  lp.frequency.value = 2200; lp.Q.value = 0.6; // adjusted for bite
    const g  = ctx.createGain(); g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0+0.006);
    g.gain.linearRampToValueAtTime(0,   t0+dur);            // tight gate
    o1.connect(dist); o2.connect(dist); o3.connect(dist);
    dist.connect(hp).connect(lp).connect(g).connect(masterGain);
    setTimeout(()=>{ try{o1.stop();o2.stop();o3.stop();}catch(e){} }, (dur*1000+20)|0);
  }

  // helper: power-chord (root + fifth) as layered chugs
  function powerChord(rootMidi, t0, dur=0.22) {
    chug(rootMidi, t0, dur);
    chug(rootMidi+7, t0, dur*0.92, 0.18);
    chug(rootMidi+12, t0, dur*0.88, 0.12); // added octave for fuller, heavier sound
  }

  function discoBass(midi, t0, dur=0.36, vol=0.34) {
    const { out, stop } = pulseOsc(midiToHz(midi), 0.24, t0);
    const pre = ctx.createGain(); pre.gain.value = vol;
    out.connect(pre);
    const env = envADSR(pre, t0, 0.004, 0.06, 0.4, 0.14, 1.0, 0.22);
    env.out.connect(masterGain);
    stop(t0 + dur); env.release(t0 + dur - 0.05);
  }

  function discoCompChord(rootMidi, t0, dur=0.28) {
    const tones = [rootMidi, rootMidi + 4, rootMidi + 7];
    tones.forEach((m, i) => {
      const voice = pulseOsc(midiToHz(m), 0.18 + i * 0.05, t0);
      const pre = ctx.createGain(); pre.gain.value = 0.22;
      voice.out.connect(pre);
      const env = envADSR(pre, t0, 0.003, 0.07, 0.2, 0.14, 0.9, 0.2);
      env.out.connect(masterGain);
      voice.stop(t0 + dur); env.release(t0 + dur - 0.04);
    });
  }

  function discoLead(midi, t0, dur=0.26, vol=0.24) {
    const { out, stop, addVibrato } = pulseOsc(midiToHz(midi), 0.32, t0);
    const pre = ctx.createGain(); pre.gain.value = vol;
    out.connect(pre);
    const killVib = addVibrato(6.2, 5);
    const env = envADSR(pre, t0, 0.002, 0.05, 0.22, 0.16, 1.0, 0.24);
    env.out.connect(masterGain);
    stop(t0 + dur); env.release(t0 + dur - 0.03);
    setTimeout(() => { try { killVib(); } catch(e){} }, (dur * 1000) | 0);
  }

  function discoClap(t0) {
    snare(t0);
    hat(t0, true);
  }


  /* ------------ SONG DEFINITIONS ------------- */
  // MAIN: Redneck Adventure (key A, Iâ€“â™­VIIâ€“IV: Aâ€“Gâ€“D)
  const SONG_MAIN = {
    name: 'main',
    bpm: 124,
    patternLen: 16,
    chords: [57,57,57,57, 55,55,55,55, 50,50,50,50, 55,55,55,55], // A,G,D,G (roots)
    // walking bass for more dynamic feel
    bass:   [45,47,48,50, 43,45,47,48, 38,39,41,43, 43,45,47,48],
    // fuller, more melodic and catchy lead line with scale runs
    lead:   [81,83,85,86, 79,78,76,74, 74,76,78,81, 79,76,74,71],
    // standard backbeat drums with hats on every quarter for groove
    drums:  ['KH','SH','KH','SH', 'KH','SH','KH','SH', 'KH','SH','KH','SH', 'KH','SH','KH','SH']
  };

  // METAL â€” faster & crunchier (more drive, double-kick grid)
  const metalDrums = [];
  for (let i = 0; i < 64; i++) {
    let dd = 'K'; // kick on every 16th for intense double bass
    if (i % 4 === 0 && (Math.floor(i / 4) % 4 === 1 || Math.floor(i / 4) % 4 === 3)) dd += 'S'; // snare on beats 2 and 4
    if (i % 4 === 0) dd += 'R'; // open hat on quarter downbeats
    else if (i % 2 === 0) dd += 'H'; // closed hat on offbeat 8ths
    metalDrums.push(dd);
  }
  const SONG_METAL = {
    name: 'metal',
    bpm: 192,
    patternLen: 64, // expanded for 16th-note grid
    // repeated for tremolo-style chugs on 16ths
    chugs:  [...Array(16).fill(45), ...Array(16).fill(43), ...Array(16).fill(41), ...Array(16).fill(40)],
    // bass doubles
    bass:   [...Array(16).fill(33), ...Array(16).fill(31), ...Array(16).fill(29), ...Array(16).fill(28)],
    // expanded lead stabs, placed on original timings
    lead:   [81,0,0,0, 0,0,0,0, 0,0,0,0, 83,0,0,0,
             0,0,0,0, 88,0,0,0, 0,0,0,0, 83,0,0,0,
             81,0,0,0, 0,0,0,0, 0,0,0,0, 79,0,0,0,
             0,0,0,0, 83,0,0,0, 0,0,0,0, 81,0,0,0],
    // intense death metal drum pattern with fast kicks and blasts
    drums:  metalDrums
  };


  const discoDrums = [
    'KH', 'H', 'KH', 'H',
    'KSH', 'H', 'KO', 'H',
    'KH', 'H', 'KH', 'H',
    'KSH', 'H', 'KO', 'H'
  ];

  const SONG_DISCO = {
    name: 'disco',
    bpm: 118,
    patternLen: 16,
    chords: [57,0,0,0, 60,0,0,0, 62,0,0,0, 59,0,0,0],
    bass:   [45,0,47,0, 48,0,50,0, 43,0,45,0, 40,0,43,0],
    riff:   [0,81,0,84, 0,86,0,84, 0,81,0,79, 0,76,0,79],
    drums:  discoDrums
  };

  let CURRENT_SONG = SONG_MAIN;
  let songTimer = null, songStep = 0;

  function scheduleStep(song, stepIdx, t0) {
    const spb = 60 / song.bpm;
    const beatDur = spb;         // quarter note
    const stepDur = song.name === 'metal' ? beatDur / 4 : (song.name === 'disco' ? beatDur / 2 : beatDur);
    const noteDur = spb * 0.9;   // lead/chords gate

    // Determine current harmony root
    const chordRoot =
      (song.chords ? song.chords[stepIdx % song.patternLen]
                   : (song.chugs ? song.chugs[stepIdx % song.patternLen] : null));

    // Common: bass
    const b = song.bass ? song.bass[stepIdx % song.patternLen] : 0;
    const l = song.lead ? song.lead[stepIdx % song.patternLen] : 0;
    const d = song.drums ? song.drums[stepIdx % song.patternLen] : '';

    if (song.name === 'disco') {
      if (b) discoBass(b, t0, stepDur * 0.95);
      if (chordRoot && stepIdx % 4 === 0) discoCompChord(chordRoot, t0, beatDur * 0.35);
      const riffNote = song.riff ? song.riff[stepIdx % song.patternLen] : 0;
      if (riffNote) discoLead(riffNote, t0, stepDur * 0.82);
      if (d) {
        if (d.includes('K')) kick(t0);
        if (d.includes('S')) discoClap(t0);
        if (d.includes('H')) hat(t0, false);
        if (d.includes('O')) hat(t0, true);
      }
      return;
    }


    // --- MAIN THEME layers ---
    if (song.name === 'main') {
      // long, smooth pads on strong beats
      if (stepIdx % 4 === 0 && chordRoot) {
        stringPad(chordRoot,      t0, beatDur*1.00, 0.16);
        stringPad(chordRoot + 7,  t0, beatDur*1.00, 0.12);
        stringPad(chordRoot + 12, t0, beatDur*1.00, 0.10);
      }

      // walking bass
      if (b) {
        const {out, stop} = pulseOsc(midiToHz(b), 0.2, t0);
        const pre = ctx.createGain(); pre.gain.value = 0.14;
        out.connect(pre);
        const e = envADSR(pre, t0, 0.006, 0.08, 0.5, 0.16, 1.0, 0.55);
        e.out.connect(masterGain);
        stop(t0 + spb*0.7); e.release(t0 + spb*0.66);
      }

      // melodic lead
      if (l) mellowLead(l, t0, spb*0.9, 0.22);
    }

    // --- METAL layers ---
    if (song.name === 'metal') {
      const stepDur = spb / 4; // 16th-note timing

      // crunchy chugs as power-chords, tight gate
      const root = song.chugs[stepIdx % song.patternLen];
      if (root) powerChord(root, t0, stepDur*0.38);

      // bass doubles tightly
      if (b) chug(b, t0, stepDur*0.28, 0.18);

      // sharp lead stabs with added distortion for intensity
      if (l) {
        const {out, stop} = pulseOsc(midiToHz(l), 0.22, t0);
        const dist = makeDistortion(30); // added distortion for heavier lead
        const pre = ctx.createGain(); pre.gain.value = 0.24;
        out.connect(dist).connect(pre);
        const e = envADSR(pre, t0, 0.002, 0.04, 0.12, 0.04, 1.0, 0.5);
        e.out.connect(masterGain);
        stop(t0 + stepDur*0.36); e.release(t0 + stepDur*0.32);
      }
    }

    // Common: drums (layered via strings)
    if (d) {
      for (let char of d) {
        switch (char) {
          case 'K': kick(t0); break;
          case 'S': snare(t0); break;
          case 'H': hat(t0, false); break;
          case 'R': hat(t0, true); break;
        }
      }
    }
  }

  function _startSequencer(song) {
    if (!ctx) init();
    if (songTimer) { clearInterval(songTimer); songTimer = null; }
    CURRENT_SONG = song;
    songStep = 0;
    const spb = 60 / song.bpm;
    const stepDur = song.name === 'metal' ? spb / 4 : (song.name === 'disco' ? spb / 2 : spb); // finer grid for metal
    const tickMs = Math.max(40, Math.min(140, (stepDur * 1000) / 4));
    let nextStepTime = ctx.currentTime + 0.08;
    const lookAhead = 0.05;
    songTimer = setInterval(() => {
      if (!ctx) return;
      const now = ctx.currentTime;
      while (nextStepTime < now + lookAhead) {
        scheduleStep(CURRENT_SONG, songStep, nextStepTime);
        songStep = (songStep + 1) % CURRENT_SONG.patternLen;
        nextStepTime += stepDur;
      }
    }, tickMs);
  }

  function startSong(){ _startSequencer(SONG_MAIN); }
  function playMetal(){ _startSequencer(SONG_METAL); }
  function playDisco(){ _startSequencer(SONG_DISCO); }
  function stopSong(){ if (songTimer){ clearInterval(songTimer); songTimer=null; } }
  // --- public ---
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
  }

	async function readyFromGesture() {

		if (!ctx) init();

		try {

			if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {

				const p = ctx.resume();

				if (p && typeof p.then === 'function') {

					p.then(() => { started = !!ctx && ctx.state === 'running'; }).catch(() => {});

				}

			}

		} catch (e) {

			// Ignore: browsers may throw if no activation yet

		}

		started = !!ctx && ctx.state === 'running'; // best-effort flag

	}



  function setMuted(v) {
    muted = !!v;
    if (masterGain) masterGain.gain.value = muted ? 0 : volume;
  }

  function setVolume(v) {
    volume = clamp(Number.isFinite(v) ? v : volume, 0, 1);
    if (masterGain && !muted) {
      masterGain.gain.value = volume;
    }
  }

  function startSnipLoop() {
    if (!ctx) init();
    if (!ctx || snipLoop) return;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 760;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(masterGain);
    const tick = () => {
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.13);
    };
    const interval = setInterval(tick, 140);
    osc.start();
    tick();
    snipLoop = { osc, gain, interval };
  }

  function stopSnipLoop() {
    if (!snipLoop) return;
    clearInterval(snipLoop.interval);
    if (ctx) {
      const t = ctx.currentTime;
      try {
        snipLoop.gain.gain.cancelScheduledValues(t);
        snipLoop.gain.gain.setValueAtTime(snipLoop.gain.gain.value, t);
        snipLoop.gain.gain.linearRampToValueAtTime(0, t + 0.08);
        snipLoop.osc.stop(t + 0.1);
      } catch (e) {
        try { snipLoop.osc.stop(); } catch (err) {}
      }
    } else {
      try { snipLoop.osc.stop(); } catch (e) {}
    }
    snipLoop = null;
  }

  return {
    init,
    readyFromGesture, startSong, stopSong, setMuted,
    setVolume,
    toggleMute(){ setMuted(!muted); },

    playMetal,

    playDisco,
    startSnipLoop,
    stopSnipLoop,
    sfx: SFX,
    getVolume(){ return volume; },
    isMuted(){ return muted; },
    get started(){ return started; },
  };
})();

/* Wrap your old variables so existing calls still work */
const jumpSound    = { play: () => AudioKit.sfx.jump() };
const stompSound   = { play: () => AudioKit.sfx.stomp() };
const collectSound = { play: () => AudioKit.sfx.coin()  };
const gameOverSound= { play: () => AudioKit.sfx.gameover() };

/* Start audio context on first input (mobile-safe) */
function ensureAudioActive(force = false) {
  if (force) {
    userAudioActivated = true;
  } else if (!userAudioActivated && typeof navigator !== 'undefined' && navigator.userActivation && navigator.userActivation.hasBeenActive) {
    userAudioActivated = true;
  }

  if (typeof AudioKit.init === 'function') {
    AudioKit.init();
  }

  if (!AudioKit.started) {
    if (!userAudioActivated && !audioBootstrapped) {
      audioWasRunning = false;
      return;
    }
    AudioKit.readyFromGesture();
  }

  const ctxRunning = AudioKit.started;

  if (!audioBootstrapped) {
    if (ctxRunning) {
      syncMusicToState();
      audioBootstrapped = true;
    }
    audioWasRunning = ctxRunning;
    return;
  }

  if (ctxRunning && !audioWasRunning) {
    syncMusicToState();
  }

  audioWasRunning = ctxRunning;
}

function _armAudio() {

  userAudioActivated = true;
  ensureAudioActive(true);
}


// One-time, capture-phase to catch the very first touch/click/keydown reliably
['pointerdown','touchstart','keydown'].forEach(type => {
  window.addEventListener(type, _armAudio, { once: true, capture: true, passive: true });
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' &&
      (typeof navigator === 'undefined' || !navigator.userActivation || navigator.userActivation.hasBeenActive)) {
    ensureAudioActive(true);
  }
});

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
let laboys = [];
let platforms = [];
let powerUps = [];
let keys = {};
let nextLaboyScoreTrigger = LABOY_SCORE_INTERVAL;
let miniGameActive = false;
let gameStateBeforeMiniGame = null;

const HORIZONTAL_AXIS_DEADZONE = 0.25;
const horizontalControlState = {
  keyboardLeft: false,
  keyboardRight: false,
  pointerLeft: false,
  pointerRight: false,
  joystickLeft: false,
  joystickRight: false,
};
const VERTICAL_AXIS_DEADZONE = 0.25;
const verticalControlState = {
  keyboardUp: false,
  keyboardDown: false,
  joystickUp: false,
  joystickDown: false,
};


function syncHorizontalKeys() {
  keys['ArrowLeft'] = horizontalControlState.keyboardLeft ||
    horizontalControlState.pointerLeft ||
    horizontalControlState.joystickLeft;
  keys['ArrowRight'] = horizontalControlState.keyboardRight ||
    horizontalControlState.pointerRight ||
    horizontalControlState.joystickRight;
}

function syncVerticalKeys() {
  keys['ArrowUp'] = verticalControlState.keyboardUp ||
    verticalControlState.joystickUp;
  keys['ArrowDown'] = verticalControlState.keyboardDown ||
    verticalControlState.joystickDown;
}

function isJoystickEngaged() {
  return horizontalControlState.joystickLeft || horizontalControlState.joystickRight ||
    verticalControlState.joystickUp || verticalControlState.joystickDown;
}

function resetHorizontalControlState() {
  horizontalControlState.keyboardLeft = false;
  horizontalControlState.keyboardRight = false;
  horizontalControlState.pointerLeft = false;
  horizontalControlState.pointerRight = false;
  horizontalControlState.joystickLeft = false;
  horizontalControlState.joystickRight = false;
  syncHorizontalKeys();
}

function resetVerticalControlState() {
  verticalControlState.keyboardUp = false;
  verticalControlState.keyboardDown = false;
  verticalControlState.joystickUp = false;
  verticalControlState.joystickDown = false;
  syncVerticalKeys();
}

function startStompFromControl() {
  if (!gameStarted) return;
  if (!horse.stomping) {
    horse.stomping = true;
    horse.stompCount = 0;
  }
}

function stopStompFromControl(options = {}) {
  if (!gameStarted) return;
  const respectManual = options.respectManual !== false;
  if (respectManual && keys['ControlLeft']) {
    return;
  }
  if (respectManual && isJoystickEngaged()) {
    return;
  }
  horse.stomping = false;
  horse.trampleAngle = 0;
}

function startJumpFromControl() {
  if (!gameStarted) return;
  if (horse.onGround && !isSpaceModeVisual()) {
    ensureAudioActive();
    horse.isJumping = true;
    horse.velocityY = -350;
    horse.jumpHoldTime = 0;
    horse.onGround = false;
    jumpSound.play();
  }
  keys['Space'] = true;
}

function endJumpFromControl() {
  if (!gameStarted) return;
  keys['Space'] = false;
}

function setHorizontalAxisFromJoystick(value) {
  if (!gameStarted) return;
  const leftActive = value < -HORIZONTAL_AXIS_DEADZONE;
  const rightActive = value > HORIZONTAL_AXIS_DEADZONE;
  horizontalControlState.joystickLeft = leftActive;
  horizontalControlState.joystickRight = rightActive;
  syncHorizontalKeys();
  if (leftActive || rightActive) {
    startStompFromControl();
  } else {
    stopStompFromControl();
  }
}

function setVerticalAxisFromJoystick(value) {
  if (!gameStarted) return;
  const upActive = value < -VERTICAL_AXIS_DEADZONE;
  const downActive = value > VERTICAL_AXIS_DEADZONE;
  verticalControlState.joystickUp = upActive;
  verticalControlState.joystickDown = downActive;
  syncVerticalKeys();
}

function pauseGame() {
  if (!gameStarted || isPaused) return;
  isPaused = true;
  cancelAnimationFrame(animationId);
  AudioKit.stopSong();
  discoMusicOn = false;
  apamboMusicOn = false;
  if (AudioKit && typeof AudioKit.stopSnipLoop === 'function') {
    AudioKit.stopSnipLoop();
  }
  hideOverlay(controlsOverlay);
  hideOverlay(collectOverlay);
  hideOverlay(highScoresOverlay);
  if (pauseOverlay) {
    syncVolumeUI();
    showOverlay(pauseOverlay);
    if (pauseResumeButton) {
      pauseResumeButton.focus();
    }
  } else {
    drawPauseOverlay();
  }
}

function resumeGame() {
  if (!isPaused) return;
  isPaused = false;
  hideOverlay(pauseOverlay);
  ensureAudioActive();
  syncMusicToState();
  if (snips && AudioKit && typeof AudioKit.startSnipLoop === 'function') {
    AudioKit.startSnipLoop();
  }
  startMainLoop();
}

function togglePauseFromControl() {
  if (!gameStarted || gameState !== 'playing') return;
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function returnToMainMenu() {
  hideOverlay(pauseOverlay);
  isPaused = false;
  cancelAnimationFrame(animationId);
  AudioKit.stopSong();
  if (AudioKit && typeof AudioKit.stopSnipLoop === 'function') {
    AudioKit.stopSnipLoop();
  }
  resetGame({ start: false });
  if (startScreen) {
    startScreen.classList.remove('hidden');
  }
  if (startGameButton) {
    startGameButton.disabled = false;
  }
  if (highScoresButton) {
    highScoresButton.setAttribute('aria-expanded', 'false');
  }
  hideOverlay(controlsOverlay);
  hideOverlay(collectOverlay);
  hideOverlay(highScoresOverlay);
  hideOverlay(initialsOverlay);
  initialsOpen = false;
  pendingScoreSubmission = null;
  if (initialsStatus) {
    initialsStatus.textContent = '';
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  syncVolumeUI();
}

function registerExternalControls() {
  window.apacheControls = {
    setHorizontalAxis: setHorizontalAxisFromJoystick,
    setVerticalAxis: setVerticalAxisFromJoystick,
    pressJump: startJumpFromControl,
    releaseJump: endJumpFromControl,
    togglePause: togglePauseFromControl,
  };
}

registerExternalControls();
resetHorizontalControlState();
resetVerticalControlState();
let goldCoins = [];
let discoBall = null;
let snips = null;
let nextSnipsAt = 0;
let ufoSurvivalCount = 0;
let spawnDiscoBallNext = true;
let discoModeUntil = 0;
let discoModeStartedAt = 0;
let discoMusicOn = false;
let difficultyMultiplier = 1;

let spaceState = 'normal'; // 'normal' | 'entering' | 'active' | 'exiting'
let spaceModeUntil = 0;
let spaceTransitionStart = 0;
let spaceTransitionProgress = 0;
let spaceVisualApplied = false;
let spaceEnteredAt = 0;



let baseGameSpeed = 200;
let gameSpeed = baseGameSpeed;
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
const DISCO_BALL_FRAME_TIME = 0.06;
const DISCO_BALL_SCROLL_FACTOR = 0.645;
const DISCO_BALL_BOB_AMPLITUDE = 6;
const DISCO_BALL_SPARKLES_PER_SEC = 9;
const DISCO_BALL_SPARKLE_LIFE = 0.45;
const DISCO_BALL_SIZE = 72;
const DISCO_MODE_DURATION = 30000;
const DISCO_LIGHT_BEAMS = 6;
const DISCO_LIGHT_ALPHA = 0.32;

const SNIPS_SPAWN_INTERVAL = 65000;
const SNIPS_SPAWN_JITTER = 12000;
const SNIPS_DURATION = 24000;
const SNIPS_FRAME_TIME = 0.08;
const SNIPS_SPEED = 120;
const SNIPS_ENTRY_SCROLL_FACTOR = 0.65;
const SNIPS_EXIT_SPEED = 220;

const SPACE_MODE_DURATION = 45000;
const SPACE_TRANSITION_DURATION = 1500;
const SPACE_RESPAWN_GRACE_MS = 2500;
const BEER_RESPAWN_BASE_MS = 56000;
const BEER_RESPAWN_JITTER_MS = 22000;
const SPACE_COIN_INTERVAL = 3.4;
const SPACE_LOG_INTERVAL = 3.6;
const SPACE_ENEMY_INTERVAL = 4.2;
const SPACE_FLOAT_AMPLITUDE_LOG = 18;
const SPACE_FLOAT_AMPLITUDE_ENEMY = 26;
const SPACE_FLOAT_AMPLITUDE_HORSE2 = 24;
const SPACE_FLOAT_SPEED_MIN = 0.9;
const SPACE_FLOAT_SPEED_MAX = 1.6;
const SPACE_HORSE2_COOLDOWN_MS = 11000;
const SPACE_STAR_COUNT = 130;
const SPACE_STAR_SCROLL_FACTOR = 0.18;
const SPACE_DECOR_MIN_INTERVAL = 6200;
const SPACE_DECOR_MAX_INTERVAL = 14200;
const SPACE_DECOR_SCROLL_MIN = 0.28;
const SPACE_DECOR_SCROLL_MAX = 0.52;

nextSnipsAt = performance.now() + SNIPS_SPAWN_INTERVAL + Math.random() * SNIPS_SPAWN_JITTER;

nextBeerAt = performance.now() + BEER_RESPAWN_BASE_MS + Math.random() * BEER_RESPAWN_JITTER_MS;

let darts = [];                 // active projectiles

let apamboMusicOn = false;
let audioBootstrapped = false;
let audioWasRunning = false;
let userAudioActivated = false;
let spaceStars = [];
let spaceDecorations = [];
let spaceDecorNextSpawnAt = 0;
let spaceEarthSpawned = false;

function setCollectOverlayPage(page) {
  collectOverlayPage = page === 'hazards' ? 'hazards' : 'collectibles';
  if (collectiblesPage) {
    collectiblesPage.classList.toggle('hidden', collectOverlayPage !== 'collectibles');
  }
  if (hazardsPage) {
    hazardsPage.classList.toggle('hidden', collectOverlayPage !== 'hazards');
  }
  if (collectPrevButton) {
    const isDisabled = collectOverlayPage === 'collectibles';
    collectPrevButton.disabled = isDisabled;
    collectPrevButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
  }
  if (collectNextButton) {
    const isDisabled = collectOverlayPage === 'hazards';
    collectNextButton.disabled = isDisabled;
    collectNextButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
  }
  refreshStartButtonState();
}

function resetCollectOverlayPager() {
  setCollectOverlayPage('collectibles');
}

function showOverlay(overlay) {
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function getLocalHighScores() {
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function storeLocalHighScores(list) {
  try {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(list));
  } catch (err) {
    /* ignore */
  }
}

function renderHighScores(list = highScores) {
  if (!highScoresList) {
    return;
  }
  const scores = Array.isArray(list) ? list : [];
  if (!scores.length) {
    highScoresList.innerHTML = '<div class="high-score-row">NO SCORES RECORDED</div>';
    return;
  }
  const rows = scores
    .map((entry, idx) => {
      const rank = (idx + 1).toString().padStart(2, '0');
      const safeName = (entry.name || 'AAA').substring(0, 3).toUpperCase();
      const safeScore = Number(entry.score || 0).toLocaleString();
      return `<div class="high-score-row"><span class="high-score-rank">${rank}</span><span class="high-score-name">${safeName}</span><span class="high-score-score">${safeScore}</span></div>`;
    })
    .join('');
  highScoresList.innerHTML = rows;
}

async function loadHighScores(force = false) {
  if (highScoresLoading) {
    return highScores;
  }
  if (highScoresLoaded && !force) {
    renderHighScores();
    return highScores;
  }
  highScoresLoading = true;
  if (highScoresStatus) {
    highScoresStatus.textContent = 'Loading...';
  }
  try {
    const res = await fetch(HIGH_SCORES_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    highScores = Array.isArray(data.scores) ? data.scores : [];
    storeLocalHighScores(highScores);
    highScoresLoaded = true;
    renderHighScores();
    if (highScoresStatus) {
      highScoresStatus.textContent = 'Press ESC to close.';
    }
  } catch (err) {
    highScores = topScoresFrom(getLocalHighScores());
    highScoresLoaded = true;
    renderHighScores();
    if (highScoresStatus) {
      highScoresStatus.textContent = 'Offline mode: showing local scores only.';
    }
  } finally {
    highScoresLoading = false;
  }
  return highScores;
}

function getInitialsString() {
  return initialsIndices
    .map(idx => INITIALS_ALPHABET[(idx % INITIALS_ALPHABET.length + INITIALS_ALPHABET.length) % INITIALS_ALPHABET.length] || 'A')
    .join('');
}

function updateInitialsDisplay() {
  initialsLettersEls.forEach((el, idx) => {
    const letter = INITIALS_ALPHABET[(initialsIndices[idx] % INITIALS_ALPHABET.length + INITIALS_ALPHABET.length) % INITIALS_ALPHABET.length] || 'A';
    el.textContent = letter;
    const cell = el.parentElement;
    if (cell) {
      cell.classList.toggle('active', idx === initialsActiveIndex);
    }
  });
}

function shiftInitial(slot, delta) {
  const alphabetLength = INITIALS_ALPHABET.length;
  initialsIndices[slot] = (initialsIndices[slot] + delta + alphabetLength) % alphabetLength;
  updateInitialsDisplay();
}

function focusInitial(slot) {
  initialsActiveIndex = Math.max(0, Math.min(initialsIndices.length - 1, slot));
  updateInitialsDisplay();
}

async function showHighScores() {
  if (!highScoresOverlay) {
    return;
  }
  showOverlay(highScoresOverlay);
  if (highScoresButton) {
    highScoresButton.setAttribute('aria-expanded', 'true');
  }
  await loadHighScores(false);
}

function closeInitialsOverlay() {
  initialsOpen = false;
  hideOverlay(initialsOverlay);
  document.body.classList.remove('initials-open');
}

function openInitialsOverlay(score) {
  if (!initialsOverlay) {
    return;
  }
  hideOverlay(highScoresOverlay);
  hideOverlay(controlsOverlay);
  hideOverlay(collectOverlay);
  pendingScoreSubmission = score;
  initialsOpen = true;
  initialsIndices = [0, 0, 0];
  initialsActiveIndex = 0;
  updateInitialsDisplay();
  if (initialsStatus) {
    initialsStatus.textContent = '';
  }
  showOverlay(initialsOverlay);
  document.body.classList.add('initials-open');
}

async function submitHighScoreInitials() {
  if (!initialsOpen || pendingScoreSubmission == null || isSavingScore) {
    return;
  }
  const name = getInitialsString();
  const score = pendingScoreSubmission;
  isSavingScore = true;
  if (initialsStatus) {
    initialsStatus.textContent = 'Saving...';
  }
  try {
    let offline = false;
    try {
      const res = await fetch(HIGH_SCORES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, score })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      highScores = Array.isArray(data.scores) ? data.scores : [];
      storeLocalHighScores(highScores);
      if (highScoresStatus) {
        highScoresStatus.textContent = 'Press ESC to close.';
      }
    } catch (err) {
      offline = true;
      const now = new Date().toISOString();
      const local = getLocalHighScores();
      local.push({ name, score, timestamp: now });
      local.sort((a, b) => b.score - a.score);
      const trimmed = local.slice(0, 50);
      storeLocalHighScores(trimmed);
      highScores = trimmed.slice(0, 10);
      if (highScoresStatus) {
        highScoresStatus.textContent = 'Offline mode: showing local scores only.';
      }
    }
    highScoresLoaded = true;
    renderHighScores();
    if (initialsStatus) {
      initialsStatus.textContent = offline ? 'Saved locally. Connect to sync to the cloud.' : 'Score saved!';
    }
    pendingScoreSubmission = null;
    setTimeout(() => {
      closeInitialsOverlay();
    }, 1000);
  } finally {
    isSavingScore = false;
  }
}

function skipSavingScore() {
  pendingScoreSubmission = null;
  if (initialsStatus) {
    initialsStatus.textContent = '';
  }
  closeInitialsOverlay();
}

function storeVolumeSettings() {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volumeLevel));
    localStorage.setItem(MUTE_STORAGE_KEY, volumeMuted ? 'true' : 'false');
  } catch (err) {
    /* ignore */
  }
}

function syncVolumeUI() {
  const percent = Math.round(clamp(volumeLevel, 0, 1) * 100);
  volumeDisplays.forEach(el => {
    el.textContent = `${percent}%`;
  });
  volumeSliders.forEach(slider => {
    if (Number(slider.value) !== percent) {
      slider.value = String(percent);
    }
  });
  const currentlyMuted = volumeMuted || percent === 0;
  muteToggleButtons.forEach(btn => {
    btn.textContent = currentlyMuted ? 'Unmute' : 'Mute';
    btn.setAttribute('aria-pressed', currentlyMuted ? 'true' : 'false');
  });
}

function applyVolumeSettings(save = true) {
  try { AudioKit.init(); } catch (err) {}
  if (AudioKit && typeof AudioKit.setVolume === 'function') {
    AudioKit.setVolume(volumeLevel);
  }
  const effectiveMuted = volumeMuted || volumeLevel <= 0;
  if (AudioKit && typeof AudioKit.setMuted === 'function') {
    AudioKit.setMuted(effectiveMuted);
  }
  if (save) {
    storeVolumeSettings();
  }
  syncVolumeUI();
}

function loadVolumeSettings() {
  const storedVolume = parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY));
  if (Number.isFinite(storedVolume)) {
    volumeLevel = clamp(storedVolume, 0, 1);
  } else {
    volumeLevel = DEFAULT_VOLUME;
  }
  const storedMute = localStorage.getItem(MUTE_STORAGE_KEY);
  volumeMuted = storedMute === 'true';
  applyVolumeSettings(false);
}

function handleVolumeSliderValue(value) {
  const percent = clamp(value, 0, 100);
  volumeLevel = clamp(percent / 100, 0, 1);
  if (volumeLevel > 0) {
    volumeMuted = false;
  } else {
    volumeMuted = true;
  }
  applyVolumeSettings();
}

function toggleMute() {
  const currentlyMuted = volumeMuted || volumeLevel <= 0;
  if (currentlyMuted) {
    if (volumeLevel <= 0) {
      volumeLevel = DEFAULT_VOLUME;
    }
    volumeMuted = false;
  } else {
    volumeMuted = true;
  }
  applyVolumeSettings();
}

function topScoresFrom(list) {
  return (Array.isArray(list) ? list : [])
    .slice()
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 10);
}

function qualifiesForHighScore(score) {
  if (!Number.isFinite(score) || score <= 0) {
    return false;
  }
  const current = highScoresLoaded ? highScores : getLocalHighScores();
  const top = topScoresFrom(current);
  if (top.length < 10) {
    return true;
  }
  const lowest = Number(top[top.length - 1]?.score) || 0;
  return score > lowest;
}

function promptHighScoreSave(score) {
  if (gameState !== 'gameover') {
    return;
  }
  if (!qualifiesForHighScore(score)) {
    return;
  }
  loadHighScores().finally(() => {
    if (gameState === 'gameover' && qualifiesForHighScore(score)) {
      openInitialsOverlay(score);
    }
  });
}

function hideOverlay(overlay) {
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  if (overlay === controlsOverlay && controlsToggleButton) {
    controlsToggleButton.setAttribute('aria-expanded', 'false');
  }
  if (overlay === collectOverlay) {
    resetCollectOverlayPager();
    if (collectiblesToggleButton) {
      collectiblesToggleButton.setAttribute('aria-expanded', 'false');
    }
  }
  if (overlay === highScoresOverlay && highScoresButton) {
    highScoresButton.setAttribute('aria-expanded', 'false');
  }
}

if (controlsToggleButton) {
  controlsToggleButton.setAttribute('aria-expanded', 'false');
}
if (collectiblesToggleButton) {
  collectiblesToggleButton.setAttribute('aria-expanded', 'false');
}
if (highScoresButton) {
  highScoresButton.setAttribute('aria-expanded', 'false');
}
if (controlsOverlay) {
  controlsOverlay.setAttribute('aria-hidden', 'true');
}
if (collectOverlay) {
  collectOverlay.setAttribute('aria-hidden', 'true');
}
if (pauseOverlay) {
  pauseOverlay.setAttribute('aria-hidden', 'true');
}
if (highScoresOverlay) {
  highScoresOverlay.setAttribute('aria-hidden', 'true');
}
if (initialsOverlay) {
  initialsOverlay.setAttribute('aria-hidden', 'true');
}

resetCollectOverlayPager();

if (controlsToggleButton && controlsOverlay) {
  controlsToggleButton.addEventListener('click', () => {
    const isOpen = !controlsOverlay.classList.contains('hidden');
    if (isOpen) {
      hideOverlay(controlsOverlay);
      return;
    }
    hideOverlay(collectOverlay);
    showOverlay(controlsOverlay);
    controlsToggleButton.setAttribute('aria-expanded', 'true');
  });
}

if (collectiblesToggleButton && collectOverlay) {
  collectiblesToggleButton.addEventListener('click', () => {
    const isOpen = !collectOverlay.classList.contains('hidden');
    if (isOpen) {
      hideOverlay(collectOverlay);
      return;
    }
    hideOverlay(controlsOverlay);
    resetCollectOverlayPager();
    showOverlay(collectOverlay);
    collectiblesToggleButton.setAttribute('aria-expanded', 'true');
  });
}

if (highScoresButton && highScoresOverlay) {
  highScoresButton.addEventListener('click', async () => {
    const isOpen = !highScoresOverlay.classList.contains('hidden');
    if (isOpen) {
      hideOverlay(highScoresOverlay);
      return;
    }
    await showHighScores();
  });
}

initialsArrowButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (!initialsOpen) return;
    const cell = button.closest('.initial-cell');
    if (!cell) return;
    const slot = Number(cell.getAttribute('data-index') || '0');
    focusInitial(slot);
    const dir = button.getAttribute('data-dir') === 'up' ? -1 : 1;
    shiftInitial(slot, dir);
  });
});

if (initialsConfirmButton) {
  initialsConfirmButton.addEventListener('click', () => {
    submitHighScoreInitials();
  });
}

if (initialsSkipButton) {
  initialsSkipButton.addEventListener('click', () => {
    skipSavingScore();
  });
}

document.addEventListener('keydown', (event) => {
  if (!initialsOpen) {
    return;
  }
  const key = event.key;
  if (key === 'ArrowUp') {
    shiftInitial(initialsActiveIndex, -1);
    event.preventDefault();
  } else if (key === 'ArrowDown') {
    shiftInitial(initialsActiveIndex, 1);
    event.preventDefault();
  } else if (key === 'ArrowLeft') {
    focusInitial(Math.max(0, initialsActiveIndex - 1));
    event.preventDefault();
  } else if (key === 'ArrowRight') {
    focusInitial(Math.min(initialsIndices.length - 1, initialsActiveIndex + 1));
    event.preventDefault();
  } else if (key === 'Enter') {
    submitHighScoreInitials();
    event.preventDefault();
  } else if (key === 'Escape') {
    skipSavingScore();
    event.preventDefault();
  }
});

if (collectPrevButton) {
  collectPrevButton.addEventListener('click', () => {
    setCollectOverlayPage('collectibles');
  });
}

if (collectNextButton) {
  collectNextButton.addEventListener('click', () => {
    setCollectOverlayPage('hazards');
  });
}

if (startGameButton) {
  startGameButton.addEventListener('click', () => {
    startGameButton.disabled = true;
    if (startScreen) {
      startScreen.classList.add('hidden');
    }
    hideOverlay(controlsOverlay);
    hideOverlay(collectOverlay);
    hideOverlay(highScoresOverlay);
    hideOverlay(pauseOverlay);
    gameState = 'playing';
    gameStarted = true;
    ensureAudioActive();
    syncMusicToState();
    if (gameReady) {
      startMainLoop();
    }
  });
}

volumeSliders.forEach(slider => {
  slider.addEventListener('input', (event) => {
    handleVolumeSliderValue(Number(event.target.value || 0));
  });
});

muteToggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleMute();
  });
});

if (pauseResumeButton) {
  pauseResumeButton.addEventListener('click', () => {
    resumeGame();
  });
}

if (pauseMainMenuButton) {
  pauseMainMenuButton.addEventListener('click', () => {
    returnToMainMenu();
  });
}

loadVolumeSettings();

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const closeTarget = e.currentTarget.getAttribute('data-close');
    if (closeTarget) {
      hideOverlay(document.getElementById(closeTarget));
    }
  });
});

[controlsOverlay, collectOverlay, highScoresOverlay].forEach(overlay => {
  if (!overlay) return;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      hideOverlay(overlay);
    }
  });
});


/* ---------- Input ---------- */
document.addEventListener('keydown', e => {
if (!gameStarted) {
  if (e.code === 'Escape') {
    hideOverlay(controlsOverlay);
    hideOverlay(collectOverlay);
    hideOverlay(highScoresOverlay);
    hideOverlay(pauseOverlay);
    isPaused = false;
  }
  return;
}

  keys[e.code] = true;

  if (e.code === 'ArrowLeft') {
    horizontalControlState.keyboardLeft = true;
    syncHorizontalKeys();
  }

  if (e.code === 'ArrowRight') {
    horizontalControlState.keyboardRight = true;
    syncHorizontalKeys();
  }

  if (e.code === 'ControlLeft') {
    startStompFromControl();
  }

  if (e.code === 'Space') {
    startJumpFromControl();
  }

  if (e.code === 'ArrowUp') {
    verticalControlState.keyboardUp = true;
    syncVerticalKeys();
  }

  if (e.code === 'ArrowDown') {
    verticalControlState.keyboardDown = true;
    syncVerticalKeys();
  }

  if (e.code === 'Escape') {
    togglePauseFromControl();
  }
});


document.addEventListener('keyup', e => {
  if (!gameStarted) return;

  keys[e.code] = false;

  if (e.code === 'ArrowLeft') {
    horizontalControlState.keyboardLeft = false;
    syncHorizontalKeys();
  }

  if (e.code === 'ArrowRight') {
    horizontalControlState.keyboardRight = false;
    syncHorizontalKeys();
  }

  if (e.code === 'ControlLeft') {
    stopStompFromControl();
  }

  if (e.code === 'ArrowUp') {
    verticalControlState.keyboardUp = false;
    syncVerticalKeys();
  }

  if (e.code === 'ArrowDown') {
    verticalControlState.keyboardDown = false;
    syncVerticalKeys();
  }

  if (e.code === 'Space') {
    endJumpFromControl();
  }
});

function isInvincible() {
  // treat either timer as invincibility (powerup OR post-hit i-frames)
  return performance.now() < Math.max(invincibleUntil, hurtUntil) || isSpaceTransitioning();
}

function isSpaceModeActive() {
  return spaceState === 'active';
}

function isSpaceModeVisual() {
  return spaceState === 'active' || spaceState === 'exiting' || (spaceState === 'entering' && spaceVisualApplied);
}

function isSpaceTransitioning() {
  return spaceState === 'entering' || spaceState === 'exiting';
}

/* ---------- Spawners ---------- */
function createLog() {
  if (isSpaceModeActive()) {
    const baseY = Math.max(48, Math.random() * (canvas.height - 160) + 40);
    logs.push({
      x: canvas.width,
      y: baseY,
      baseY,
      width: 64,
      height: 64,
      stomped: 0,
      isBlocking: true,
      space: true,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: SPACE_FLOAT_SPEED_MIN + Math.random() * (SPACE_FLOAT_SPEED_MAX - SPACE_FLOAT_SPEED_MIN),
      floatAmplitude: SPACE_FLOAT_AMPLITUDE_LOG
    });
    return;
  }
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
  if (isSpaceModeActive()) {
    const baseY = Math.max(56, Math.random() * (canvas.height - 168) + 48);
    enemies.push({
      x: canvas.width,
      y: baseY,
      baseY,
      width: 64,
      height: 64,
      space: true,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: SPACE_FLOAT_SPEED_MIN + Math.random() * (SPACE_FLOAT_SPEED_MAX - SPACE_FLOAT_SPEED_MIN),
      floatAmplitude: SPACE_FLOAT_AMPLITUDE_ENEMY,
      driftMultiplier: 0.85 + Math.random() * 0.2
    });
    return;
  }
  const enemyY = GROUND_Y; // start on the ground
  enemies.push({
    x: canvas.width, y: enemyY, width: 64, height: 64,
    stomped: false, moveDirection: 1, moveAmplitude: 50, moveSpeed: 2,
    baseX: canvas.width, isJumping: false, velocityY: 0, gravity: NORMAL_GRAVITY,
    jumpTimer: Math.random() * 2 + 1
  });
}

function createCoin() {
  if (isSpaceModeActive()) {
    spawnSpaceCoins();
    return;
  }
  coins.push({ x: canvas.width, y: Math.random() * 200 + 100, width: 32, height: 32, collected: false });
}

function spawnSpaceCoins() {
  const baseX = canvas.width;
  const baseY = Math.random() * (canvas.height - 180) + 60;
  const pattern = Math.random();
  const count = 8 + Math.floor(Math.random() * 8);

  const addCoin = (offsetX, offsetY) => {
    coins.push({
      x: baseX + offsetX,
      y: clamp(baseY + offsetY, 32, canvas.height - 96),
      width: 32,
      height: 32,
      collected: false,
      space: true,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: 0.6 + Math.random() * 0.6,
      floatAmplitude: 14 + Math.random() * 9
    });
  };

  if (pattern < 0.33) {
    for (let i = 0; i < count; i++) {
      const angle = i * 0.55;
      addCoin(i * 36, Math.sin(angle) * 48);
    }
  } else if (pattern < 0.66) {
    const slope = Math.random() < 0.5 ? 1 : -1;
    for (let i = 0; i < count; i++) {
      const dy = slope * i * 18 + Math.sin(i * 0.4) * 22;
      addCoin(i * 34, dy);
    }
  } else {
    const radius = 24 + Math.random() * 24;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      addCoin(Math.cos(t) * radius + i * 18, Math.sin(t) * radius);
    }
  }
}

function spawnLaboy() {
  const width = 64;
  const height = 64;
  if (isSpaceModeActive()) {
    const baseY = clamp(Math.random() * (canvas.height - height - 120) + 40, 32, canvas.height - height - 32);
    laboys.push({
      x: canvas.width + 60,
      y: baseY,
      baseY,
      width,
      height,
      glowPhase: Math.random() * Math.PI * 2,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: 0.8 + Math.random() * 0.6,
      floatAmplitude: 26 + Math.random() * 18,
      collected: false,
      space: true
    });
    return;
  }

  laboys.push({
    x: canvas.width + 60,
    y: GROUND_Y,
    baseY: GROUND_Y,
    width,
    height,
    glowPhase: Math.random() * Math.PI * 2,
    collected: false,
    space: false
  });
}

function spawnSpaceHorse2() {
  const baseY = Math.random() * (canvas.height - HORSE2_H - 80) + 40;
  horse2s.push({
    platform: null,
    offsetX: 0,
    x: canvas.width + 40,
    y: baseY,
    baseY,
    width: HORSE2_W,
    height: HORSE2_H,
    space: true,
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: SPACE_FLOAT_SPEED_MIN + Math.random() * (SPACE_FLOAT_SPEED_MAX - SPACE_FLOAT_SPEED_MIN),
    floatAmplitude: SPACE_FLOAT_AMPLITUDE_HORSE2
  });
}

function generateSpaceStars() {
  spaceStars = [];
  for (let i = 0; i < SPACE_STAR_COUNT; i++) {
    const radius = 0.6 + Math.random() * 1.6;
    spaceStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius,
      baseAlpha: 0.28 + Math.random() * 0.42,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.9 + Math.random() * 1.8
    });
  }
}

function scheduleNextSpaceDecoration() {
  spaceDecorNextSpawnAt = performance.now() + SPACE_DECOR_MIN_INTERVAL + Math.random() * (SPACE_DECOR_MAX_INTERVAL - SPACE_DECOR_MIN_INTERVAL);
}

function spawnSpaceDecoration(entry = null) {
  const pick = entry || spaceDecorEntries[Math.floor(Math.random() * spaceDecorEntries.length)];
  const img = pick.img;
  let width;
  let height;
  if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    width = img.naturalWidth;
    height = img.naturalHeight;
  } else {
    height = pick.height;
    width = Math.max(32, height);
  }
  const margin = 90;
  const y = clamp(Math.random() * (canvas.height - margin * 2 - height) + margin, 30, canvas.height - height - margin);
  spaceDecorations.push({
    key: pick.key,
    img,
    x: canvas.width + 60 + Math.random() * 120,
    y,
    baseY: y,
    width,
    height,
    scrollFactor: SPACE_DECOR_SCROLL_MIN + Math.random() * (SPACE_DECOR_SCROLL_MAX - SPACE_DECOR_SCROLL_MIN),
    floatAmplitude: 6 + Math.random() * 18,
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: 0.25 + Math.random() * 0.65,
    unique: !!pick.unique
  });
}

function spawnSpaceEarth() {
  const img = earthDecor.img;
  const height = earthDecor.height;
  let width = Math.max(64, height);
  if (img && img.complete && img.naturalHeight > 0) {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (Number.isFinite(ratio) && ratio > 0) {
      width = Math.max(64, Math.round(height * ratio));
    }
  }
  const y = clamp(canvas.height * 0.28, 20, canvas.height - height - 180);
  spaceDecorations.push({
    key: earthDecor.key,
    img,
    x: canvas.width * 0.65,
    y,
    baseY: y,
    width,
    height,
    scrollFactor: SPACE_DECOR_SCROLL_MIN,
    floatAmplitude: 8,
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: 0.22,
    unique: true
  });
  spaceEarthSpawned = true;
}

function spawnDiscoBall() {
  if (discoBall) return;

  const baseFrame = discoBallFrames[0];
  const ratio = (baseFrame && baseFrame.naturalHeight) ? baseFrame.naturalWidth / baseFrame.naturalHeight : 1;
  const height = DISCO_BALL_SIZE;
  const width = Math.max(40, Math.round(height * (Number.isFinite(ratio) && ratio > 0 ? ratio : 1)));
  const minY = 130;
  const maxY = 220;
  const baseY = Math.random() * (maxY - minY) + minY;

  discoBall = {
    x: canvas.width,
    y: baseY,
    baseY,
    width,
    height,
    frame: 0,
    frameTimer: 0,
    bobTime: 0,
    sparkles: [],
    collected: false,
  };
}
function collectDiscoBall() {
  if (!discoBall) return;
  discoBall.collected = true;
  ensureAudioActive();
  if (AudioKit && AudioKit.sfx && typeof AudioKit.sfx.powerup === 'function') {
    AudioKit.sfx.powerup();
  }
  discoBall = null;
  activateDiscoMode();
}

function scheduleNextBeer(extraMs = 0) {
  const delay = BEER_RESPAWN_BASE_MS + Math.random() * BEER_RESPAWN_JITTER_MS + extraMs;
  nextBeerAt = performance.now() + delay;
}

function spawnBeer() {
  const height = 48;
  let width = 36;
  if (beerImage && beerImage.naturalWidth > 0 && beerImage.naturalHeight > 0) {
    const ratio = beerImage.naturalWidth / beerImage.naturalHeight;
    if (Number.isFinite(ratio) && ratio > 0) {
      width = Math.max(16, Math.round(height * ratio));
    }
  }
  const y = GROUND_Y - height;
  beers.push({
    x: canvas.width,
    y,
    width,
    height,
    collected: false
  });
  nextBeerAt = Number.POSITIVE_INFINITY;
}

function handleBeerCollected() {
  ensureAudioActive();
  if (collectSound && typeof collectSound.play === 'function') {
    collectSound.play();
  }
  triggerSpaceMode();
}

function triggerSpaceMode() {
  const now = performance.now();
  const alreadyActive = spaceState === 'active' || spaceState === 'entering';
  if (alreadyActive) {
    spaceModeUntil = now + SPACE_MODE_DURATION;
    return;
  }
  spaceModeUntil = now + SPACE_MODE_DURATION;
  startSpaceTransitionIn();
}

function startSpaceTransitionIn() {
  spaceState = 'entering';
  spaceTransitionStart = performance.now();
  spaceTransitionProgress = 0;
  spaceVisualApplied = false;
  horse2CooldownUntil = performance.now() + 1200;
  nextBeerAt = Number.POSITIVE_INFINITY;
}

function startSpaceTransitionOut() {
  if (spaceState !== 'active') return;
  spaceState = 'exiting';
  spaceTransitionStart = performance.now();
  spaceTransitionProgress = 1;
}

function applySpaceVisuals(enable) {
  if (enable) {
    logs = [];
    enemies = [];
    platforms = [];
    horse2s = [];
    coins = [];
    goldCoins = [];
    powerUps = [];
    if (snips) { despawnSnips(false); }
    if (boss) { boss = null; bossSpawnTimer = 0; }
    discoModeUntil = 0;
    discoMusicOn = false;
    horse.isJumping = false;
    horse.onGround = false;
    horse.velocityY = 0;
    generateSpaceStars();
    spaceDecorations = [];
    spaceDecorNextSpawnAt = 0;
    spaceEarthSpawned = false;
  } else {
    logs = [];
    enemies = [];
    horse2s = [];
    coinSpawnTimer = 0;
    logSpawnTimer = 0;
    enemySpawnTimer = 0;
    platformSpawnTimer = 0;
    horse.y = Math.min(horse.y, GROUND_Y);
    horse.velocityY = 0;
    horse.onGround = horse.y === GROUND_Y;
    horse.isJumping = false;
    spaceStars = [];
    spaceDecorations = [];
    spaceDecorNextSpawnAt = 0;
    spaceEarthSpawned = false;
  }
}

function updateSpaceMode(dt) {
  const now = performance.now();

  if (spaceState === 'entering') {
    const progress = clamp((now - spaceTransitionStart) / SPACE_TRANSITION_DURATION, 0, 1);
    spaceTransitionProgress = progress;
    if (!spaceVisualApplied && progress >= 0.5) {
      spaceVisualApplied = true;
      applySpaceVisuals(true);
    }
    if (progress >= 1) {
      spaceState = 'active';
      spaceEnteredAt = now;
      spaceModeUntil = now + SPACE_MODE_DURATION;
      spaceTransitionProgress = 1;
    }
  } else if (spaceState === 'active') {
    spaceTransitionProgress = 1;
    if (now >= spaceModeUntil) {
      startSpaceTransitionOut();
    }
  } else if (spaceState === 'exiting') {
    const progress = clamp((now - spaceTransitionStart) / SPACE_TRANSITION_DURATION, 0, 1);
    spaceTransitionProgress = 1 - progress;
    if (progress >= 1) {
      applySpaceVisuals(false);
      spaceState = 'normal';
      spaceTransitionProgress = 0;
      spaceVisualApplied = false;
      scheduleNextBeer(SPACE_RESPAWN_GRACE_MS);
      nextSnipsAt = performance.now() + 2200 + Math.random() * 1600;
    }
  } else {
    spaceTransitionProgress = 0;
  }
}

function drawSpaceTransitionOverlay() {
  if (!isSpaceTransitioning()) return;
  const easing = spaceState === 'entering' ? spaceTransitionProgress : (1 - spaceTransitionProgress);
  const eased = easing * easing * (3 - 2 * easing);
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * eased})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function updateSpaceStars(dt) {
  if (!spaceStars.length) return;
  const scroll = gameSpeed * SPACE_STAR_SCROLL_FACTOR * dt;
  for (const star of spaceStars) {
    star.twinklePhase += star.twinkleSpeed * dt;
    star.x -= scroll;
    if (star.x < -4) {
      star.x = canvas.width + Math.random() * 30;
      star.y = Math.random() * canvas.height;
      star.radius = 0.6 + Math.random() * 1.6;
      star.baseAlpha = 0.28 + Math.random() * 0.42;
      star.twinklePhase = Math.random() * Math.PI * 2;
      star.twinkleSpeed = 0.9 + Math.random() * 1.8;
    }
  }
}

function updateSpaceDecorations(dt) {
  if (!spaceDecorations.length) return;
  for (let i = spaceDecorations.length - 1; i >= 0; i--) {
    const deco = spaceDecorations[i];
    deco.floatPhase += deco.floatSpeed * dt;
    deco.y = deco.baseY + Math.sin(deco.floatPhase) * deco.floatAmplitude;
    deco.x -= gameSpeed * deco.scrollFactor * dt;
    if (deco.x + deco.width < -240) {
      spaceDecorations.splice(i, 1);
      continue;
    }
  }
}

function updateSpaceScenery(dt) {
  if (!isSpaceModeVisual()) return;
  updateSpaceStars(dt);
  updateSpaceDecorations(dt);

  if (isSpaceModeActive()) {
    if (!spaceEarthSpawned) {
      spawnSpaceEarth();
      scheduleNextSpaceDecoration();
    }
    if (performance.now() >= spaceDecorNextSpawnAt) {
      spawnSpaceDecoration();
      scheduleNextSpaceDecoration();
    }
  }
}
function activateDiscoMode() {
  const now = performance.now();
  const alreadyActive = now < discoModeUntil;

  discoModeUntil = now + DISCO_MODE_DURATION;

  if (!alreadyActive) {
    discoModeStartedAt = now;
    ensureAudioActive();
    AudioKit.stopSong();
    AudioKit.playDisco();
    discoMusicOn = true;
    apamboMusicOn = false;
  }
}

function spawnSnips() {
  const baseFrame = snipsFrames[0];
  const targetHeight = 64;
  let width = 52;
  if (baseFrame && baseFrame.naturalWidth > 0 && baseFrame.naturalHeight > 0) {
    const ratio = baseFrame.naturalWidth / baseFrame.naturalHeight;
    if (Number.isFinite(ratio) && ratio > 0) {
      width = Math.max(36, Math.round(targetHeight * ratio));
    }
  }
  const now = performance.now();
  snips = {
    x: canvas.width + width + 40,
    y: GROUND_Y,
    width,
    height: targetHeight,
    frame: 0,
    frameTimer: 0,
    speed: Math.max(SNIPS_SPEED, gameSpeed * 0.82),
    despawnAt: now + SNIPS_DURATION,
    leaving: false,
    spawnedAt: now,
    entryComplete: false,
    direction: -1,
  };
  nextSnipsAt = Number.POSITIVE_INFINITY;
  ensureAudioActive();
  if (AudioKit && typeof AudioKit.startSnipLoop === 'function') {
    AudioKit.startSnipLoop();
  }
}

function despawnSnips(resetTimer = true) {
  if (!snips) return;
  snips = null;
  if (AudioKit && typeof AudioKit.stopSnipLoop === 'function') {
    AudioKit.stopSnipLoop();
  }
  if (resetTimer) {
    nextSnipsAt = performance.now() + SNIPS_SPAWN_INTERVAL + Math.random() * SNIPS_SPAWN_JITTER;
  }
}

function recalcGameSpeed() {
  gameSpeed = baseGameSpeed * difficultyMultiplier;
}

function updateSnips(dt) {
  if (!snips) return;
  snips.frameTimer += dt;
  if (snips.frameTimer >= SNIPS_FRAME_TIME) {
    snips.frameTimer -= SNIPS_FRAME_TIME;
    snips.frame = (snips.frame + 1) % snipsFrames.length;
  }

  const now = performance.now();
  const scroll = gameSpeed * dt;
  const entryScrollFactor = snips.entryComplete ? 0 : SNIPS_ENTRY_SCROLL_FACTOR;
  snips.x -= scroll * entryScrollFactor;

  if (snips.leaving) {
    snips.x -= SNIPS_EXIT_SPEED * dt;
    if (snips.x + snips.width < -240) {
      despawnSnips(true);
    }
    return;
  }

  const minX = 52;
  const maxX = canvas.width - snips.width - 40;
  if (!snips.entryComplete && snips.x <= maxX) {
    snips.entryComplete = true;
    snips.x = clamp(snips.x, minX, maxX);
  }

  if (snips.entryComplete) {
    const patrolSpeed = Math.max(snips.speed * 0.58, gameSpeed * 0.6);
    snips.x += snips.direction * patrolSpeed * dt;
    if (snips.x <= minX) {
      snips.x = minX;
      snips.direction = 1;
    } else if (snips.x >= maxX) {
      snips.x = maxX;
      snips.direction = -1;
    }
    snips.x = clamp(snips.x, minX, maxX);
  }

  snips.y = GROUND_Y;

  if (!isInvincible() && snips && rectsOverlap(horse, snips)) {
    loseLife();
    if (gameState !== 'playing' || !snips) {
      return;
    }
  }

  if (!snips.leaving && snips.x > canvas.width + 200) snips.x = canvas.width + 200;

  if (now >= snips.despawnAt) {
    snips.leaving = true;
    return;
  }
}

function drawSnips() {
  if (!snips) return;
  const frame = snipsFrames[snips.frame % snipsFrames.length];
  const x = Math.round(snips.x);
  const y = Math.round(snips.y);

  ctx.save();
  ctx.translate(x, y);
  if (frame && frame.complete && frame.naturalWidth > 0) {
    ctx.drawImage(frame, 0, 0, snips.width, snips.height);
  } else {
    ctx.fillStyle = '#b36b3c';
    ctx.fillRect(0, 0, snips.width, snips.height);
  }
  ctx.restore();
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
    // 12â€“18s cooldown before another can appear
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
  if (isSpaceModeActive()) {
    let vx = 0;
    let vy = 0;
    if (keys['ArrowLeft'])  vx -= horse.speed;
    if (keys['ArrowRight']) vx += horse.speed;
    if (keys['ArrowUp'])    vy -= horse.speed * 0.85;
    if (keys['ArrowDown'])  vy += horse.speed * 0.85;

    horse.x += vx * dt;
    horse.y += vy * dt;
    horse.x = clamp(horse.x, 0, canvas.width - horse.width);
    horse.y = clamp(horse.y, 32, canvas.height - horse.height - 24);

    horse.velocityY = 0;
    horse.isJumping = false;
    horse.onGround = false;
    horse.jumpHoldTime = 0;

    if (horse.stomping) horse.trampleAngle = Math.sin(performance.now() / 50) * 30;
    horse.invincible = performance.now() < invincibleUntil;
    return;
  }
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
    if (log.space) {
      log.floatPhase += log.floatSpeed * dt;
      log.y = log.baseY + Math.sin(log.floatPhase) * log.floatAmplitude;
      log.x -= gameSpeed * 0.88 * dt;
    } else {
      log.x -= gameSpeed * dt;
    }

    if (log.x + log.width < 0) { logs.splice(i, 1); continue; }

    if (rectsOverlap(horse, log)) {
      if (!log.space && horse.isJumping) {
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
    if (e.space) {
      e.floatPhase += e.floatSpeed * dt;
      e.y = e.baseY + Math.sin(e.floatPhase) * e.floatAmplitude;
      e.x -= gameSpeed * e.driftMultiplier * dt;

      if (e.x + e.width < -160) { enemies.splice(i, 1); continue; }

      if (rectsOverlap(horse, e) && !isInvincible()) {
        loseLife();
        if (gameState !== 'playing') return;
      }
      continue;
    }
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
        // (no stompSound; remove any â€œstomp to killâ€ logic elsewhere)
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
    if (c.space) {
      c.x -= gameSpeed * 0.52 * dt;
      c.floatPhase += c.floatSpeed * dt;
      c.y = clamp(c.y + Math.sin(c.floatPhase) * 18 * dt, 24, canvas.height - 90);
    } else {
      c.x -= gameSpeed * 0.645 * dt;
    }
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
			ensureAudioActive();
      collectSound.play();
    }
  }
}

function updateLaboys(dt) {
  for (let i = laboys.length - 1; i >= 0; i--) {
    const item = laboys[i];
    const factor = item.space ? 0.55 : 0.7;
    item.x -= gameSpeed * factor * dt;

    if (item.space) {
      item.floatPhase += item.floatSpeed * dt;
      const offset = Math.sin(item.floatPhase) * item.floatAmplitude;
      item.y = clamp(item.baseY + offset, 32, canvas.height - item.height - 32);
    }

    item.glowPhase += dt * 4;

    if (item.x + item.width < -160) {
      laboys.splice(i, 1);
      continue;
    }

    if (!item.collected && rectsOverlap(horse, item)) {
      handleLaboyCollected(i);
    }
  }
}

function handleLaboyCollected(index) {
  if (index < 0 || index >= laboys.length) {
    return;
  }
  const item = laboys[index];
  item.collected = true;
  laboys.splice(index, 1);
  ensureAudioActive();
  collectSound.play();
  enterMiniGame();
}

function updateBeers(dt) {
  for (let i = beers.length - 1; i >= 0; i--) {
    const beer = beers[i];
    beer.x -= gameSpeed * dt;
    if (beer.x + beer.width < 0) {
      beers.splice(i, 1);
      scheduleNextBeer();
      continue;
    }
    if (!beer.collected && rectsOverlap(horse, beer)) {
      beer.collected = true;
      beers.splice(i, 1);
      handleBeerCollected();
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
			invincibleUntil = performance.now() + 8000;
			horse.invincible = true;
			powerUpCooldownUntil = performance.now() + 20000;
			ensureAudioActive();
			collectSound.play();
			AudioKit.sfx.powerup();


    }
  }
}

function updateHorse2s(dt) {
  for (let i = horse2s.length - 1; i >= 0; i--) {
    const h2 = horse2s[i];

    if (h2.space) {
      h2.floatPhase += h2.floatSpeed * dt;
      h2.y = h2.baseY + Math.sin(h2.floatPhase) * h2.floatAmplitude;
      h2.x -= gameSpeed * 0.78 * dt;

      if (h2.x + h2.width < -160) {
        horse2s.splice(i, 1);
        continue;
      }

      if (rectsOverlap(horse, h2) && horse.stomping) {
        horse2s.splice(i, 1);
        triggerApamboBanner();
      }
      continue;
    }

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
    const img = h2.space ? horse2SpaceImage : horse2Image;
    ctx.drawImage(img, h2.x, h2.y, h2.width, h2.height);
  }
}

// Create & show the flashing â€œAPAMBO MODE!!!â€ banner, then enable APAMBO
function triggerApamboBanner() {
  ensureAudioActive();
  apamboBanner = { start: performance.now(), duration: APAMBO_BANNER_DURATION };
  // immediately set APAMBO so the meter & darts are ready when banner clears
  ramboUntil = performance.now() + RAMBO_DURATION;
  if (isDiscoModeActive()) {
    apamboMusicOn = false;
  } else {
    AudioKit.stopSong();
    AudioKit.playMetal();
    apamboMusicOn = true;
    discoMusicOn = false;
  }
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
  const baseY = 68;
  boss = {
    x: canvas.width + 120,
    y: baseY,
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
    survivalHandled: false,
    baseY,

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

function handleBossSurvival() {
  if (gameState !== 'playing') return;

  ufoSurvivalCount++;
  difficultyMultiplier = Math.min(2.5, 1 + ufoSurvivalCount * 0.05);
  recalcGameSpeed();

  if (spawnDiscoBallNext) {
    if (!discoBall) {
      spawnDiscoBall();
      spawnDiscoBallNext = false;
    }
  } else {
    spawnDiscoBallNext = true;
  }
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
    boss.y = boss.baseY + Math.sin(performance.now() / 450) * 7;

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
      if (!boss.survivalHandled) {
        handleBossSurvival();
        boss.survivalHandled = true;
      }
    }
  } else if (boss.state === 'beam') {
    // patrol while beaming
    boss.x += boss.patrolDir * boss.patrolSpeed * dt;
    if (boss.x <= boss.patrolLeft) { boss.x = boss.patrolLeft; boss.patrolDir = 1; }
    if (boss.x >= boss.patrolRight()) { boss.x = boss.patrolRight(); boss.patrolDir = -1; }

    boss.y = boss.baseY + Math.sin(performance.now() / 450) * 7;

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

  const nowMs = performance.now();

  // Play beam sound periodically while beam is active (independent of player position)
  if (nowMs >= nextBeamSoundAt) {
    console.log('Playing beam sound'); // For debuggingâ€”remove after testing
    ensureAudioActive(); // Changed from ensureAudioActive(true) to avoid forced resume issues
    AudioKit.sfx.beam();
    nextBeamSoundAt = nowMs + 450;
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

  if (inBeam) {
    suckedByBeam = true;

    beamExposure = clamp(beamExposure + dt, 0, 10);
    const ramp = Math.min(1, beamExposure / 0.8);   // 0-1 over ~0.8s
    const suction = 900 + 700 * ramp;

    // Upward acceleration
    horse.velocityY = nz(horse.velocityY, 0) - suction * dt;
    horse.isJumping = true;
    horse.onGround = false;

    // Lateral pull toward center â€” fully safe
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

    // saucer upper disc (red) with darker underside bandâ€”reads as one unit
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

  /* ====== COW (dangling â€œstuck to the bottomâ€) ====== */
  // Small stylized pixel-cow; uses rectangles & arcs, swings a bit.
  const c = boss.cow;
  const attachX = cx;
  const attachY = y + h * 0.68 + c.stuckOffsetY;
  const swingX = Math.sin(c.swing) * (c.amplitude * 14); // left/right swing
  const cowX = Math.round(attachX - 26 + swingX);
  const cowY = Math.round(attachY + c.bob);

  // rope/tractor â€œholdâ€
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

function updateDiscoBall(dt) {
  if (!discoBall) return;

  discoBall.x -= gameSpeed * DISCO_BALL_SCROLL_FACTOR * dt;
  discoBall.bobTime += dt;
  discoBall.y = discoBall.baseY + Math.sin(discoBall.bobTime * 3.6) * DISCO_BALL_BOB_AMPLITUDE;

  discoBall.frameTimer += dt;
  if (discoBall.frameTimer >= DISCO_BALL_FRAME_TIME) {
    discoBall.frameTimer -= DISCO_BALL_FRAME_TIME;
    discoBall.frame = (discoBall.frame + 1) % discoBallFrames.length;
  }

  if (discoBall.sparkles.length > 28) {
    discoBall.sparkles = discoBall.sparkles.slice(-28);
  }

  if (Math.random() < DISCO_BALL_SPARKLES_PER_SEC * dt) {
    discoBall.sparkles.push({
      angle: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: DISCO_BALL_SPARKLE_LIFE * (0.7 + Math.random() * 0.6),
      radius: discoBall.width * 0.45 + Math.random() * 12,
      spin: (Math.random() - 0.5) * 3.2
    });
  }

  for (let i = discoBall.sparkles.length - 1; i >= 0; i--) {
    const s = discoBall.sparkles[i];
    s.life += dt;
    if (s.life >= s.maxLife) {
      discoBall.sparkles.splice(i, 1);
    } else {
      s.angle += s.spin * dt;
    }
  }

  const hitbox = {
    x: discoBall.x + discoBall.width * 0.2,
    y: discoBall.y + discoBall.height * 0.2,
    width: discoBall.width * 0.6,
    height: discoBall.height * 0.6,
  };

  if (!discoBall.collected && rectsOverlap(horse, hitbox)) {
    collectDiscoBall();
    return;
  }

  if (discoBall.x + discoBall.width < 0) {
    discoBall = null;
  }
}

function updateGoldCoins(dt) {
  for (let i = goldCoins.length - 1; i >= 0; i--) {
    const g = goldCoins[i];
    g.t += dt;
    g.x -= gameSpeed * dt;                 // scroll with level
    g.bobY = Math.sin(g.t * 5) * 3;        // gentle bob

    if (g.x + g.width < 0) {
      goldCoins.splice(i, 1);
      continue;
    }

    // define the coin's hitbox (account for bob)
    const hitbox = {
      x: g.x,
      y: g.y + (g.bobY || 0),
      width: g.width,
      height: g.height
    };

    // pickup
    if (!g.collected && rectsOverlap(horse, hitbox)) {
      g.collected = true;
      goldCoins.splice(i, 1);
      horse.lives += 1;

      // sfx
      ensureAudioActive();
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

function pickRandomMiniGame() {
  if (!APACHEMON_GAMES.length) {
    return null;
  }
  const idx = Math.floor(Math.random() * APACHEMON_GAMES.length);
  return APACHEMON_GAMES[idx];
}

function enterMiniGame() {
  if (miniGameActive) {
    return;
  }
  if (!miniGameOverlay || !miniGameFrame) {
    horse.score += MINI_GAME_SCORE_BONUS;
    return;
  }
  const url = pickRandomMiniGame();
  if (!url) {
    horse.score += MINI_GAME_SCORE_BONUS;
    return;
  }

  miniGameActive = true;
  gameStateBeforeMiniGame = gameState;
  gameState = 'mini-game';
  cancelAnimationFrame(animationId);
  AudioKit.stopSong();

  miniGameOverlay.classList.remove('hidden');
  miniGameOverlay.setAttribute('aria-hidden', 'false');
  miniGameFrame.src = url;
}

function exitMiniGame(grantBonus = false) {
  if (!miniGameActive) {
    return;
  }

  miniGameActive = false;
  if (miniGameOverlay) {
    miniGameOverlay.classList.add('hidden');
    miniGameOverlay.setAttribute('aria-hidden', 'true');
  }
  if (miniGameFrame) {
    miniGameFrame.src = 'about:blank';
  }

  if (grantBonus) {
    horse.score += MINI_GAME_SCORE_BONUS;
  }

  gameState = gameStateBeforeMiniGame || 'playing';
  gameStateBeforeMiniGame = null;
  lastTime = performance.now();
  startMainLoop();
  ensureAudioActive(true);
  syncMusicToState();
}

function isNum(v){ return Number.isFinite(v); }
function nz(v, fallback=0){ return isNum(v) ? v : fallback; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

function syncMusicToState() {
  const now = performance.now();
  const inApambo = now < ramboUntil;
  const inDisco = isDiscoModeActive();

  AudioKit.stopSong();

  if (gameState !== 'playing') {
    apamboMusicOn = false;
    discoMusicOn = false;
    return;
  }

  if (inDisco) {
    AudioKit.playDisco();
    discoMusicOn = true;
    apamboMusicOn = false;
    return;
  }

  discoMusicOn = false;

  if (inApambo) {
    AudioKit.playMetal();
    apamboMusicOn = true;
  } else {
    AudioKit.startSong();
    apamboMusicOn = false;
  }
}


function noNearbyLogs(platform, pad = 120) {
  // If any LOG is horizontally overlapping the platform lane right now,
  // skip spawning HORSE2 to prevent the â€œlog turned into horse2â€ illusion.
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

function isDiscoModeActive() {
  return performance.now() < discoModeUntil;
}


function loseLife() {
  const now = performance.now();
  // ignore damage when invulnerability timers or space transitions are active
  if (now < Math.max(invincibleUntil, hurtUntil) || isSpaceTransitioning()) return;

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

  const spaceVisual = isSpaceModeVisual();
  const discoActive = !spaceVisual && isDiscoModeActive();

  const layer1Img = spaceVisual ? spaceBgLayer2 : bgLayer1;
  const layer2Img = spaceVisual ? spaceBgLayer2 : (discoActive && discoBgLayer2.complete && discoBgLayer2.naturalWidth ? discoBgLayer2 : bgLayer2);
  const layer3Img = spaceVisual ? spaceBgLayer3 : (discoActive && discoBgLayer3.complete && discoBgLayer3.naturalWidth ? discoBgLayer3 : bgLayer3);

  ctx.drawImage(layer1Img, bgLayer1X, 0, canvas.width, canvas.height);
  ctx.drawImage(layer1Img, bgLayer1X + canvas.width, 0, canvas.width, canvas.height);
  ctx.drawImage(layer2Img, bgLayer2X, 0, canvas.width, canvas.height);
  ctx.drawImage(layer2Img, bgLayer2X + canvas.width, 0, canvas.width, canvas.height);
  ctx.drawImage(layer3Img, bgLayer3X, 0, canvas.width, canvas.height);
  ctx.drawImage(layer3Img, bgLayer3X + canvas.width, 0, canvas.width, canvas.height);

  if (discoActive) {
    drawDiscoLights();
  }
}

function drawSpaceStars() {
  if (!isSpaceModeVisual() || !spaceStars.length) return;
  ctx.save();
  for (const star of spaceStars) {
    const alpha = clamp(star.baseAlpha + Math.sin(star.twinklePhase) * 0.3, 0.05, 1);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawSpaceDecorations() {
  if (!isSpaceModeVisual() || !spaceDecorations.length) return;
  ctx.save();
  ctx.globalAlpha = 0.96;
  for (const deco of spaceDecorations) {
    const img = deco.img;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, deco.x, deco.y, deco.width, deco.height);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawHorse() {
  ctx.save();
  ctx.translate(horse.x + horse.width / 2, horse.y + horse.height / 2);

  if (horse.stomping) ctx.rotate((-horse.trampleAngle * Math.PI) / 180);

  // flicker while invincible (existing)
  if (horse.invincible && Math.floor(Date.now() / 100) % 2) ctx.globalAlpha = 0.6;

  // choose sprite; space overrides other modes
  let img;
  if (isSpaceModeVisual() && apastronautImage.complete && apastronautImage.naturalWidth) {
    img = apastronautImage;
  } else if (isDiscoModeActive() && discoHorseImage.complete && discoHorseImage.naturalWidth) {
    img = discoHorseImage;
  } else if (performance.now() < ramboUntil) {
    img = apamboImage;
  } else {
    img = horseImage;
  }
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


function drawLogs() {
  for (const l of logs) {
    const img = l.space ? logSpaceImage : logImage;
    ctx.drawImage(img, l.x, l.y, l.width, l.height);
  }
}
function drawEnemies() {
  for (const e of enemies) {
    const img = e.space ? enemySpaceImage : enemyImage;
    ctx.drawImage(img, e.x, e.y, e.width, e.height);
  }
}
function drawDiscoBall() {
  if (!discoBall) return;

  const frame = discoBallFrames[discoBall.frame % discoBallFrames.length];
  const x = discoBall.x;
  const y = discoBall.y;
  const w = discoBall.width;
  const h = discoBall.height;
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  const glowRadius = Math.max(w, h) * 0.75;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
  glow.addColorStop(0, 'rgba(255,255,255,0.45)');
  glow.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (frame && frame.complete && frame.naturalWidth) {
    ctx.drawImage(frame, x, y, w, h);
  } else {
    ctx.fillStyle = '#d0d0ff';
    ctx.beginPath();
    ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (const s of discoBall.sparkles) {
    const progress = s.life / s.maxLife;
    const alpha = Math.max(0, 1 - progress);
    const radius = s.radius * (0.6 + 0.4 * Math.sin(progress * Math.PI));
    const sx = cx + Math.cos(s.angle) * radius;
    const sy = cy + Math.sin(s.angle) * radius * 0.7;
    const size = 3 + 3 * (1 - Math.abs(Math.sin(progress * Math.PI)));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(sx, sy - size);
    ctx.lineTo(sx + size, sy);
    ctx.lineTo(sx, sy + size);
    ctx.lineTo(sx - size, sy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawDiscoLights() {
  if (!isDiscoModeActive()) return;

  const elapsed = performance.now() - discoModeStartedAt;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < DISCO_LIGHT_BEAMS; i++) {
    const phase = elapsed / 320 + i * 0.65;
    const center = canvas.width * (0.5 + 0.45 * Math.sin(phase));
    const hue = (elapsed / 8 + i * 55) % 360;
    const alpha = Math.max(0.18, Math.min(0.6, DISCO_LIGHT_ALPHA * (0.7 + 0.3 * Math.cos(phase * 1.7))));
    ctx.fillStyle = `hsla(${Math.floor(hue)}, 82%, 62%, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(center, 0);
    ctx.lineTo(center - canvas.width * 0.28, canvas.height);
    ctx.lineTo(center + canvas.width * 0.28, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  const sparkleCount = 12;
  for (let i = 0; i < sparkleCount; i++) {
    const t = elapsed / 150 + i * 2.1;
    const sx = (Math.sin(t * 1.3 + i) * 0.5 + 0.5) * canvas.width;
    const sy = (Math.cos(t * 1.9 + i * 0.8) * 0.4 + 0.55) * canvas.height;
    const size = 4 + 3 * Math.sin(t * 2.7);
    const alpha = 0.25 + 0.25 * (1 + Math.sin(t * 3.4));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.moveTo(sx, sy - size);
    ctx.lineTo(sx + size, sy);
    ctx.lineTo(sx, sy + size);
    ctx.lineTo(sx - size, sy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCoins()     { coins.forEach(c => ctx.drawImage(coinImage, c.x, c.y, c.width, c.height)); }

function drawLaboys() {
  for (const item of laboys) {
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const pulse = 1 + Math.sin(item.glowPhase) * 0.25;
    const radius = Math.max(item.width, item.height) * 0.75 * pulse;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(255,255,200,0.75)');
    gradient.addColorStop(0.6, 'rgba(255,200,80,0.35)');
    gradient.addColorStop(1, 'rgba(255,140,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(laboyImage, item.x, item.y, item.width, item.height);
  }
}
function drawGoldCoins() {
  for (const g of goldCoins) {
    // gentle 0.75â€“1.25x pulse
    const t = performance.now();
    const pulse = 1 + Math.sin(t / 240) * 0.25;

    ctx.save();
    // softer, subtler glow â€” no additive blending
    ctx.shadowColor = 'rgba(255,215,0,0.35)';   // was ~0.9
    ctx.shadowBlur  = 4 + 4 * pulse;            // was ~14 + big pulse
    ctx.drawImage(goldCoinImage, g.x, g.y + (g.bobY || 0), g.width, g.height);
    ctx.restore();
  }
}
function drawPlatforms() { platforms.forEach(p => ctx.drawImage(platformImage, p.x, p.y, p.width, p.height)); }
function drawPowerUps() {
  for (const p of powerUps) {
    ctx.drawImage(powerUpImage, p.x, p.y, p.width, p.height);
  }
}

function drawBeers() {
  for (const beer of beers) {
    ctx.drawImage(beerImage, beer.x, beer.y, beer.width, beer.height);
  }
}

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
  apamboMusicOn = false;
  discoMusicOn = false;
  discoModeUntil = 0;
  discoModeStartedAt = 0;
  if (snips) { despawnSnips(false); }
  nextSnipsAt = performance.now() + SNIPS_SPAWN_INTERVAL + Math.random() * SNIPS_SPAWN_JITTER;
  difficultyMultiplier = 1;
  baseGameSpeed = 200;
  recalcGameSpeed();
  setTimeout(() => {
    promptHighScoreSave(horse.score);
  }, 400);
}

function initializeGameState() {
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
  logs = [];
  enemies = [];
  coins = [];
  platforms = [];
  powerUps = [];
  keys = {};
  laboys = [];
  resetHorizontalControlState();
  discoBall = null;
  if (snips) { despawnSnips(false); }
  snips = null;
  nextSnipsAt = performance.now() + SNIPS_SPAWN_INTERVAL + Math.random() * SNIPS_SPAWN_JITTER;
  beers = [];
  scheduleNextBeer();
  nextLaboyScoreTrigger = LABOY_SCORE_INTERVAL;
  miniGameActive = false;
  gameStateBeforeMiniGame = null;
  hideOverlay(miniGameOverlay);
  if (miniGameFrame) {
    miniGameFrame.src = 'about:blank';
  }
  spaceState = 'normal';
  spaceModeUntil = 0;
  spaceTransitionStart = 0;
  spaceTransitionProgress = 0;
  spaceVisualApplied = false;
  spaceEnteredAt = 0;
  spaceStars = [];
  spaceDecorations = [];
  spaceDecorNextSpawnAt = 0;
  spaceEarthSpawned = false;
  ufoSurvivalCount = 0;
  spawnDiscoBallNext = true;
  discoModeUntil = 0;
  discoModeStartedAt = 0;
  discoMusicOn = false;
  difficultyMultiplier = 1;
  baseGameSpeed = 200;
  recalcGameSpeed();
  frame = 0;
  level = 1;
  isPaused = false;
  bgLayer1X = bgLayer2X = bgLayer3X = 0;
  boss = null;
  bossSpawnTimer = 0;
  apamboMusicOn = false;
  hideOverlay(pauseOverlay);
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

function resetGame(options = {}) {
  const { start = true } = options;
  initializeGameState();
  if (start) {
    gameState = 'playing';
    gameStarted = true;
  } else {
    gameState = 'title';
    gameStarted = false;
  }
  if (startScreen) {
    startScreen.classList.toggle('hidden', start);
  }
  if (startGameButton) {
    startGameButton.disabled = start;
  }
  if (start) {
    startMainLoop();
    AudioKit.startSong();
  } else {
    cancelAnimationFrame(animationId);
    AudioKit.stopSong();
    if (AudioKit && typeof AudioKit.stopSnipLoop === 'function') {
      AudioKit.stopSnipLoop();
    }
  }
}

function startMainLoop() {
  cancelAnimationFrame(animationId);
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

/* ---------- Loop ---------- */
let lastTime = 0;

function gameLoop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.1);
  lastTime = ts;


  ensureAudioActive();


  updateSpaceMode(dt);

  const now = performance.now();
  const discoActive = isDiscoModeActive();
  const inApambo = now < ramboUntil;

  if (discoActive) {
    if (!discoMusicOn) {
      AudioKit.stopSong();
      AudioKit.playDisco();
      discoMusicOn = true;
      apamboMusicOn = false;
    }
  } else {
    if (discoMusicOn) {
      discoMusicOn = false;
      AudioKit.stopSong();
      if (inApambo) {
        AudioKit.playMetal();
        apamboMusicOn = true;
      } else {
        AudioKit.startSong();
        apamboMusicOn = false;
      }
    } else {
      if (inApambo && !apamboMusicOn) {
        AudioKit.playMetal();
        apamboMusicOn = true;
      }
      if (!inApambo && apamboMusicOn) {
        AudioKit.startSong();
        apamboMusicOn = false;
      }
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'playing') {
    const nowMs = performance.now();
    const inSpace = isSpaceModeActive() || isSpaceTransitioning();
    if (!inSpace && !snips && nowMs >= nextSnipsAt) {
      const bossActive = !!boss;
      const ufoLeavingSoon = bossActive && boss.state === 'leave' && boss.stateTimer <= 2;
      if (!bossActive || ufoLeavingSoon) {
        spawnSnips();
      }
    }

    // Spawn timers
    logSpawnTimer += dt;
    enemySpawnTimer += dt;
    coinSpawnTimer += dt;
    platformSpawnTimer += dt;
    powerUpSpawnTimer += dt;
    bossSpawnTimer += dt;

    if (inSpace) {
      if (logSpawnTimer >= SPACE_LOG_INTERVAL) { createLog(); logSpawnTimer = 0; }
      if (enemySpawnTimer >= SPACE_ENEMY_INTERVAL) { createEnemy(); enemySpawnTimer = 0; }
      if (coinSpawnTimer >= SPACE_COIN_INTERVAL) { createCoin(); coinSpawnTimer = 0; }

      platformSpawnTimer = 0;
      powerUpSpawnTimer = 0;

      const hasSpaceHorse2 = horse2s.some(h => h.space);
      if (!hasSpaceHorse2 && performance.now() >= horse2CooldownUntil) {
        spawnSpaceHorse2();
        horse2CooldownUntil = performance.now() + SPACE_HORSE2_COOLDOWN_MS + Math.random() * 4000;
      }
    } else {
      if (logSpawnTimer >= 2.5)        { createLog();      logSpawnTimer = 0; }
      if (enemySpawnTimer >= 3.1)      { createEnemy();    enemySpawnTimer = 0; }
      if (coinSpawnTimer >= 1.5)       { createCoin();     coinSpawnTimer = 0; }
      if (platformSpawnTimer >= 3.3)   { createPlatform(); platformSpawnTimer = 0; }
      if (
        powerUpSpawnTimer >= 12 &&
        performance.now() >= powerUpCooldownUntil &&
        powerUps.length === 0 &&
        performance.now() >= invincibleUntil
      ) {
        createPowerUp();
        powerUpSpawnTimer = 0;
        powerUpCooldownUntil = performance.now() + 20000;
      }

      if (beers.length === 0 && performance.now() >= nextBeerAt) {
        spawnBeer();
      }
    }

    // Spawn boss every ~25â€“35s (randomized), only if none active
    if (!inSpace && !boss && bossSpawnTimer >= 45 + Math.random() * 20) {
      spawnBoss();
      bossSpawnTimer = 0;
    }

    updateSpaceScenery(dt);

    // Updates
    updateHorse(dt);
    updateLogs(dt);
    updateEnemies(dt);
    updateCoins(dt);
    updateLaboys(dt);
    updateDiscoBall(dt);
    updateGoldCoins(dt);
    updatePlatforms(dt);
    updatePowerUps(dt);
    updateBeers(dt);
    updateHorse2s(dt);
    updateSnips(dt);
    updateBoss(dt);
    if (!isNum(horse.x) || !isNum(horse.y) || !isNum(horse.velocityY)) {
      resetHorsePosition();
    }

    while (horse.score >= nextLaboyScoreTrigger) {
      spawnLaboy();
      nextLaboyScoreTrigger += LABOY_SCORE_INTERVAL;
    }

    // Auto-fire while APAMBO is active
    if (nowMs < ramboUntil) {
      if (nowMs >= nextDartAt) {
				ensureAudioActive();
        spawnDart();
        AudioKit.sfx.dart();
        nextDartAt = nowMs + DART_INTERVAL;
      }
    }
    updateDarts(dt);

    // Draw
    drawBackground(dt);
    drawSpaceStars();
    drawSpaceDecorations();
    drawPlatforms();
    drawCoins();
    drawLaboys();
    drawDiscoBall();
    drawGoldCoins();
    drawBeers();
    drawPowerUps();
    drawLogs();
    drawHorse2s();
    drawEnemies();
    drawSnips();
    drawBoss();
    drawHorse();
    drawSpaceTransitionOverlay();
    drawScore();
    drawDarts();
    drawRamboMeter();
    if (drawApamboBanner()) {
      // Do not level-up or spawn things during banner; just render next frame
      animationId = requestAnimationFrame(gameLoop);
      return;
    }

    // Level speed-up
    if (horse.score >= level * 100) { level++; baseGameSpeed += 0.5; recalcGameSpeed(); }
  } else if (gameState === 'gameover') {
    updateSpaceScenery(dt);
    drawBackground(dt);
    drawSpaceStars();
    drawSpaceDecorations();
    drawGameOverScreen();
  }

  if (miniGameActive) {
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
}





const DESKTOP_MEDIA_MESSAGE = 'desktop-media-control';
let desktopMutedByHost = false;
let desktopPausedByHost = false;

function handleDesktopMediaCommand(action) {
  switch (action) {
    case 'mute':
      desktopMutedByHost = true;
      if (typeof AudioKit !== 'undefined' && typeof AudioKit.setMuted === 'function') {
        AudioKit.setMuted(true);
      }
      break;
    case 'unmute':
      desktopMutedByHost = false;
      if (typeof AudioKit !== 'undefined' && typeof AudioKit.setMuted === 'function') {
        AudioKit.setMuted(false);
      }
      if (!desktopPausedByHost) {
        try {
          ensureAudioActive();
          syncMusicToState();
        } catch (err) {
          console.warn('Resume audio failed', err);
        }
      }
      break;
    case 'pause':
      desktopPausedByHost = true;
      if (typeof AudioKit !== 'undefined' && typeof AudioKit.stopSong === 'function') {
        AudioKit.stopSong();
      }
      if (typeof AudioKit !== 'undefined' && typeof AudioKit.setMuted === 'function') {
        AudioKit.setMuted(true);
      }
      break;
    case 'resume':
      desktopPausedByHost = false;
      if (!desktopMutedByHost) {
        if (typeof AudioKit !== 'undefined' && typeof AudioKit.setMuted === 'function') {
          AudioKit.setMuted(false);
        }
        try {
          ensureAudioActive();
          syncMusicToState();
        } catch (err) {
          console.warn('Resume audio failed', err);
        }
      }
      break;
    case 'stop':
      desktopPausedByHost = true;
      if (typeof AudioKit !== 'undefined' && typeof AudioKit.stopSong === 'function') {
        AudioKit.stopSong();
      }
      if (typeof AudioKit !== 'undefined' && typeof AudioKit.setMuted === 'function') {
        AudioKit.setMuted(true);
      }
      break;
    default:
      break;
  }
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (data.type !== DESKTOP_MEDIA_MESSAGE) return;
  handleDesktopMediaCommand(data.action);
});

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') {
    return;
  }
  if (data.type !== 'apachemonResult') {
    return;
  }

  if (data.outcome === 'victory') {
    exitMiniGame(true);
  } else {
    exitMiniGame(false);
  }
});
































