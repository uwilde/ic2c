/* --- game.js (patched) --- */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const GAME_STATES = {
  LOADING: 'loading',
  TITLE: 'title',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL2: 'level2'
};

const INPUT_KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  ATTACK: 'KeyX',
  POWER: 'KeyZ',
  JUMP: 'Space',
  PAUSE: 'Escape',
  ACCEPT: 'Enter'
};

const preventDefaultKeys = new Set([
  INPUT_KEYS.LEFT,
  INPUT_KEYS.RIGHT,
  INPUT_KEYS.UP,
  INPUT_KEYS.DOWN,
  INPUT_KEYS.ATTACK,
  INPUT_KEYS.POWER,
  INPUT_KEYS.PAUSE,
  'Space'
]);

/** utils */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const range = (s, e) => { const a=[]; for(let i=s;i<=e;i++) a.push(i); return a; };
const framePaths = (s, e, t) => range(s, e).map((n)=>t.replace('%', n));
const createImage = (src) => new Promise((res, rej)=>{
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = (e) => {
    console.error('Failed to load image asset:', src, e);
    const error = new Error(`Failed to load image asset: ${src}`);
    error.originalEvent = e;
    rej(error);
  };
  img.src = src;
});
const loadAudio = (src, { loop = false, volume = 1 } = {}) => new Promise((resolve, reject)=>{
  const audio = new Audio();
  audio.src = src;
  audio.loop = loop;
  audio.volume = volume;
  audio.preload = 'auto';
  audio._baseVolume = volume ?? 1;
  audio._category = 'sfx';
  const cleanup = ()=>{
    audio.removeEventListener('canplaythrough', onReady);
    audio.removeEventListener('loadeddata', onReady);
    audio.removeEventListener('error', onError);
  };
  const onReady = ()=>{ cleanup(); resolve(audio); };
  const onError = (e)=>{ cleanup(); reject(e); };
  audio.addEventListener('canplaythrough', onReady, { once:true });
  audio.addEventListener('loadeddata', onReady, { once:true });
  audio.addEventListener('error', onError, { once:true });
  audio.load();
});
const AUDIO_SETTING_STORAGE_KEY='hp_audio_settings';
const DEFAULT_AUDIO_SETTINGS={ master:1, music:1, sfx:1 };
const VOLUME_KEYS=['master','music','sfx'];
const VOLUME_LABELS={ master:'Master', music:'Music', sfx:'SFX' };
const AUDIO_CATEGORIES={
  menuMusic:'music',
  gameMusic:'music'
};
const clamp01=(v)=>clamp(v,0,1);
const loadStoredAudioSettings=()=>{
  if(typeof localStorage==='undefined') return { ...DEFAULT_AUDIO_SETTINGS };
  try{
    const raw=localStorage.getItem(AUDIO_SETTING_STORAGE_KEY);
    if(!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    const data=JSON.parse(raw);
    return {
      master: clamp01(typeof data.master==='number'?data.master:DEFAULT_AUDIO_SETTINGS.master),
      music: clamp01(typeof data.music==='number'?data.music:DEFAULT_AUDIO_SETTINGS.music),
      sfx: clamp01(typeof data.sfx==='number'?data.sfx:DEFAULT_AUDIO_SETTINGS.sfx)
    };
  }catch(e){
    console.warn('Failed to load audio settings', e);
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
};
const storedAudioSettings=loadStoredAudioSettings();
const isAudioClip = (clip) => !!clip && typeof clip === 'object' && typeof clip.volume === 'number';
let audioRegistry = {};
const registerAudioClip=(key, clip)=>{
  if(!isAudioClip(clip)) return;
  clip._key=key;
  clip._category=AUDIO_CATEGORIES[key] ?? clip._category ?? 'sfx';
  if(typeof clip._baseVolume!=='number') clip._baseVolume=clip.volume ?? 1;
  audioRegistry=audioRegistry ?? {};
  audioRegistry[key]=clip;
};
const getAudioSettings=()=> (game?.settings?.audio) ?? storedAudioSettings;
const applyVolumeToClip=(clip, categoryOverride)=>{
  if(!isAudioClip(clip)) return;
  const settings=getAudioSettings();
  const base=typeof clip._baseVolume==='number' ? clip._baseVolume : (clip.volume ?? 1);
  const category=categoryOverride ?? clip._category ?? 'sfx';
  const master=settings.master ?? 1;
  const categoryVolume = category==='music' ? (settings.music ?? 1) : (settings.sfx ?? 1);
  clip.volume=clamp01(base * master * categoryVolume);
};
const applyAudioSettings=()=>{
  if(!audioRegistry) return;
  for(const clip of Object.values(audioRegistry)){
    applyVolumeToClip(clip);
  }
  if(currentMusic) applyVolumeToClip(currentMusic);
};
const saveAudioSettings=()=>{
  if(typeof localStorage==='undefined') return;
  try{
    const settings=getAudioSettings();
    localStorage.setItem(AUDIO_SETTING_STORAGE_KEY, JSON.stringify(settings));
  }catch(e){
    console.warn('Failed to save audio settings', e);
  }
};
const setAudioSetting=(key, value)=>{
  if(!VOLUME_KEYS.includes(key)) return;
  if(!game.settings) game.settings={ audio:{ ...DEFAULT_AUDIO_SETTINGS } };
  if(!game.settings.audio) game.settings.audio={ ...DEFAULT_AUDIO_SETTINGS };
  game.settings.audio[key]=clamp01(value);
  storedAudioSettings[key]=game.settings.audio[key];
  applyAudioSettings();
  saveAudioSettings();
};
const adjustAudioSetting=(key, delta)=>{
  const current=getAudioSettings()[key] ?? 1;
  setAudioSetting(key, current + delta);
  return getAudioSettings()[key];
};
const playAudio = (audio, { reset = true } = {}) => {
  if(!audio) return;
  applyVolumeToClip(audio);
  if(reset){
    try{ audio.currentTime = 0; }catch(e){ /* ignore */ }
  }
  const promise = audio.play();
  if(promise?.catch) promise.catch(()=>{});
};
const stopAudio = (audio, { reset = false } = {}) => {
  if(!audio) return;
  audio.pause();
  if(reset){
    try{ audio.currentTime = 0; }catch(e){ /* ignore */ }
  }
};
let currentMusic=null;
const setMusic = (audio) => {
  if(currentMusic === audio) return;
  if(currentMusic) stopAudio(currentMusic);
  currentMusic = audio ?? null;
  if(currentMusic){
    applyVolumeToClip(currentMusic, currentMusic._category);
    playAudio(currentMusic, { reset:true });
  }
};
const setAudioRegistry = (collection)=>{
  if(!collection || typeof collection!=='object'){
    audioRegistry={};
  }else{
    audioRegistry={};
    for(const [key,value] of Object.entries(collection)){
      if(isAudioClip(value)) audioRegistry[key]=value;
    }
  }
  applyAudioSettings();
};
const playSfx = (key, options) => {
  const clip = audioRegistry?.[key];
  if(!clip) return;
  playAudio(clip, options ?? { reset:true });
};

const level2Manager = {
  loading:false,
  loaded:false,
  initialized:false,
  update: null,
  draw: null,
  pending: []
};

const loadLevel2Module = (onReady) => {
  if(level2Manager.loaded){
    onReady?.();
    return;
  }
  if(level2Manager.loading){
    if(onReady) level2Manager.pending.push(onReady);
    return;
  }
  if(typeof document==='undefined'){
    console.warn('level2.js requires a browser environment');
    if(onReady) onReady();
    return;
  }
  level2Manager.loading=true;
  if(onReady) level2Manager.pending.push(onReady);
  const script=document.createElement('script');
  script.src='level2.js';
  script.onload=()=> {
    level2Manager.loaded=true;
    level2Manager.loading=false;
    const callbacks=[...level2Manager.pending];
    level2Manager.pending.length=0;
    callbacks.forEach(cb=>cb?.());
  };
  script.onerror=(err)=> {
    level2Manager.loading=false;
    console.error('Failed to load level2.js', err);
  };
  const host=document.body || document.head || document.documentElement;
  if(host) host.appendChild(script);
  else {
    level2Manager.loading=false;
    console.error('Unable to attach level2.js script element');
  }
};

const enterLevel2 = () => {
  if(level2Manager.initialized){
    game.state = GAME_STATES.LEVEL2;
    if(level2Manager.update==null || level2Manager.draw==null){
      const module = window.level2 ?? {};
      level2Manager.update = typeof module.update==='function' ? module.update.bind(module) : null;
      level2Manager.draw = typeof module.draw==='function' ? module.draw.bind(module) : null;
    }
    return;
  }
  loadLevel2Module(()=> {
    const module = window.level2 ?? {};
    if(typeof module.init==='function'){
      module.init({ canvas, ctx, game, playAudio, setMusic });
    }
    level2Manager.update = typeof module.update==='function' ? module.update.bind(module) : null;
    level2Manager.draw = typeof module.draw==='function' ? module.draw.bind(module) : null;
    level2Manager.initialized=true;
    setMusic(null);
    game.world=null;
    game.state=GAME_STATES.LEVEL2;
  });
};

class Animation {
  constructor(frames, frameDuration, { loop = true } = {}) {
    this.frames = frames; this.frameDuration = frameDuration; this.loop = loop; this.reset();
  }
  reset(){ this.elapsed=0; this.index=0; this.done=false; }
  clone(){ return new Animation(this.frames, this.frameDuration, { loop:this.loop }); }
  update(dt){
    if(this.done || this.frames.length<=1) return;
    this.elapsed+=dt;
    while(this.elapsed>=this.frameDuration){
      this.elapsed-=this.frameDuration;
      this.index+=1;
      if(this.index>=this.frames.length){
        if(this.loop){ this.index=0; }
        else { this.index=this.frames.length-1; this.done=true; break; }
      }
    }
  }
  get frame(){ return this.frames[this.index]; }
}

class InputManager {
  constructor(){
    this.down=new Map(); this.pressed=new Set();
    window.addEventListener('keydown',(e)=>{ if(preventDefaultKeys.has(e.code)) e.preventDefault(); if(!this.down.get(e.code)) this.pressed.add(e.code); this.down.set(e.code,true); });
    window.addEventListener('keyup',(e)=>{ if(preventDefaultKeys.has(e.code)) e.preventDefault(); this.down.set(e.code,false); });
  }
  isDown(c){ return this.down.get(c); }
  wasPressed(c){ return this.pressed.has(c); }
  postUpdate(){ this.pressed.clear(); }
}
const input = new InputManager();

/** assets */
const assetManifest = {
  background: 'eaglesclub.jpg',
  walkMask: 'eaglesclub_path.jpg',
  cover: 'cover.jpg',
  players: {
    corky: {
      name: 'Corky',
      nativeFacing: 'left',
      walk: framePaths(1, 10, 'Corky/walk%.png'),
      attack: framePaths(1, 6, 'Corky/kick%.png'),
      hurt: framePaths(1, 2, 'Corky/hurt%.png'),
      jump: [
        'Corky/jump/prepare.png',
        'Corky/jump/jump1.png',
        'Corky/jump/jump2.png',
        'Corky/jump/landing1.png',
        'Corky/jump/landing2.png'
      ],
      power: framePaths(1, 21, 'Corky/power%.png'),
      portrait: 'corky_left_1.png'
    },
    boner: {
      name: 'Boiner',
      nativeFacing: 'right',
      walk: framePaths(1, 9, 'Boner/walk%.png'),
      attack: framePaths(1, 7, 'Boner/punch%.png'),
      hurt: framePaths(1, 2, 'Boner/hurt%.png'),
      jump: [
        'Boner/jump/prepare.png',
        'Boner/jump/jump1.png',
        'Boner/jump/jump2.png',
        'Boner/jump/landing1.png',
        'Boner/jump/landing2.png'
      ],
      power: framePaths(1, 9, 'Boner/power%.png'),
      portrait: 'boner_right_1.png'
    }
  },
  bigBoner: {
    walk: framePaths(2, 10, 'BigBoner/walk%.png'),
    portrait: 'bigboner_right_1.png',
    nativeFacing: 'right'
  },
  enemies: {
    entrado: {
      walk: framePaths(1, 13, 'Entrado/walk%.png'),
      hurt: ['Entrado/damage1.png'],
      explode: framePaths(1, 4, 'Entrado/explode%.png'),
      portrait: 'entrado_left_1.png',
      nativeFacing: 'left'
    },
    peppers: {
      walk: framePaths(1, 16, 'Peppers/walk%.png'),
      hurt: ['Peppers/damage1.png'],
      explode: framePaths(1, 4, 'Peppers/explode%.png'),
      portrait: 'Peppers/damage1.png',
      nativeFacing: 'right'
    }
  },
  boss: {
    mutant: {
      idle: [...framePaths(1, 12, 'Entrado/Mutant/mutant%.png'), ...framePaths(14, 23, 'Entrado/Mutant/mutant%.png')],
      blast: framePaths(1, 29, 'Entrado/Mutant/blast%.png'),
      damage: 'Entrado/Mutant/mutant_damage.png',
      mudball: framePaths(1, 14, 'Entrado/Mutant/mudball/mudball%.png'),
      mudballSplat: framePaths(1, 3, 'Entrado/Mutant/mudball/mudballsplat%.png')
    }
  }
};

const audioManifest = {
  menuMusic: { src:'start.mp3', loop:true, volume:0.5 },
  gameMusic: { src:'barsong.mp3', loop:true, volume:0.5 },
  menuNavigate: { src:'button1.mp3', volume:0.85 },
  menuSelect: { src:'startbutton.mp3', volume:0.85 },
  corkyPower: { src:'Corky/doplar.mp3', volume:0.9 },
  bonerPower: { src:'Boner/transform.mp3', volume:0.9 },
  hitEnemy: { src:'hit.mp3', volume:0.8 },
  destroyEnemy: { src:'destroy.mp3', volume:0.8 },
  mutantSplat: { src:'Entrado/Mutant/splat.mp3', volume:0.55 },
  bigBonerLaser: { src:'BigBoner/laser.mp3', loop:true, volume:0.65 },
  mutantRumble: { src:'Entrado/Mutant/rumble.mp3', volume:0.85 },
  stepWood1: { src:'step_wood1.mp3', volume:0.4 },
  stepWood2: { src:'step_wood2.mp3', volume:0.4 },
  stepWood3: { src:'step_wood3.mp3', volume:0.4 },
  stepWood4: { src:'step_wood4.mp3', volume:0.4 },
  stepWood5: { src:'step_wood5.mp3', volume:0.4 }
};

const buildWalkMask = (img) => {
  if(!img) return null;
  const canvas=document.createElement('canvas');
  canvas.width=img.width;
  canvas.height=img.height;
  const ctx=canvas.getContext('2d', { willReadFrequently:true });
  ctx.drawImage(img, 0, 0);
  const buffer=ctx.getImageData(0,0,img.width,img.height).data;
  const total=img.width*img.height;
  const data=new Uint8Array(total);
  for(let i=0;i<total;i++){
    const r=buffer[i*4];
    const g=buffer[i*4+1];
    const b=buffer[i*4+2];
    data[i]=(r>200 && g<70 && b<70) ? 1 : 0;
  }
  canvas.width=0; canvas.height=0;
  return { width: img.width, height: img.height, data };
};

const buildAlphaMask = (img, threshold = 20) => {
  if(!img || typeof document==='undefined') return null;
  const canvas=document.createElement('canvas');
  canvas.width=img.width;
  canvas.height=img.height;
  const ctx=canvas.getContext('2d', { willReadFrequently:true });
  ctx.drawImage(img, 0, 0);
  const buffer=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const total=canvas.width*canvas.height;
  const mask=new Uint8Array(total);
  for(let i=0;i<total;i++){
    const alpha=buffer[i*4+3];
    mask[i]=alpha>threshold ? 1 : 0;
  }
  canvas.width=0; canvas.height=0;
  return { width: img.width, height: img.height, data: mask, threshold };
};

const ensureAlphaMask = (img) => {
  if(!img) return null;
  if(!img._alphaMask){
    if(img.width && img.height){
      img._alphaMask=buildAlphaMask(img);
    }
  }
  return img._alphaMask ?? null;
};

const FOOTSTEP_AUDIO_KEYS = ['stepWood1','stepWood2','stepWood3','stepWood4','stepWood5'];
const ACTIVE_FOOTSTEP_CLONES = [];
const FOOTSTEP_CONFIG = {
  player: {
    corky: new Set([2,5,7,9]),
    boner: new Set([0,3,7])
  },
  enemy: {
    entrado: new Set([0,3,7,12]),
    peppers: new Set([1,3,6,10,13,15])
  }
};

const getFootstepTracker = (entity) => {
  if(!entity._footstepTracker){
    entity._footstepTracker = { prevIndex:-1, lastTrigger:-1 };
  }
  return entity._footstepTracker;
};

const resetFootstepTracker = (tracker) => {
  tracker.prevIndex=-1;
  tracker.lastTrigger=-1;
};

const playRandomFootstep = () => {
  const candidates = FOOTSTEP_AUDIO_KEYS
    .map((key)=>audioRegistry?.[key])
    .filter(Boolean);
  if(!candidates.length) return;
  const base = candidates[Math.floor(Math.random()*candidates.length)];
  if(!base) return;
  if(typeof base.cloneNode === 'function'){
    const clone = base.cloneNode();
    const baseVol = typeof base._baseVolume === 'number' ? base._baseVolume : (base.volume ?? 0.4);
    clone._baseVolume = baseVol;
    clone._category = base._category ?? 'sfx';
    clone.volume = baseVol;
    applyVolumeToClip(clone);
    clone.currentTime = 0;
    ACTIVE_FOOTSTEP_CLONES.push(clone);
    const release=()=> {
      const idx=ACTIVE_FOOTSTEP_CLONES.indexOf(clone);
      if(idx>=0) ACTIVE_FOOTSTEP_CLONES.splice(idx,1);
      clone.removeEventListener('ended', release);
      clone.removeEventListener('error', release);
    };
    clone.addEventListener('ended', release, { once:true });
    clone.addEventListener('error', release, { once:true });
    const promise = clone.play();
    if(promise?.catch) promise.catch(()=>{});
  }else{
    playAudio(base, { reset:true });
  }
};

const tryPlayFootstep = (entity, category, key) => {
  if(!category || !key) return;
  const config = FOOTSTEP_CONFIG?.[category]?.[key];
  const tracker = getFootstepTracker(entity);
  if(!config || config.size===0){
    resetFootstepTracker(tracker);
    return;
  }
  if(entity.state!=='walk' || !entity.currentAnimation){
    resetFootstepTracker(tracker);
    return;
  }
  const idx = entity.currentAnimation.index ?? 0;
  if(tracker.prevIndex>idx) tracker.lastTrigger=-1;
  if(config.has(idx) && tracker.lastTrigger!==idx){
    playRandomFootstep();
    tracker.lastTrigger=idx;
  }
  tracker.prevIndex=idx;
};

const loadFrameSet = async (paths) => Promise.all(paths.map((p)=>createImage(p)));

const loadAssets = async () => {
  const background = await createImage(assetManifest.background);
  const walkMaskImage = assetManifest.walkMask ? await createImage(assetManifest.walkMask) : null;
  const walkMask = walkMaskImage ? buildWalkMask(walkMaskImage) : null;
  const cover = assetManifest.cover ? await createImage(assetManifest.cover) : null;

  const players = {};
  for (const [key, data] of Object.entries(assetManifest.players)) {
    players[key] = {
      name: data.name,
      nativeFacing: data.nativeFacing ?? 'right',
      walk: await loadFrameSet(data.walk),
      attack: await loadFrameSet(data.attack),
      hurt: await loadFrameSet(data.hurt),
      portrait: await createImage(data.portrait)
    };
    players[key].walk.forEach(ensureAlphaMask);
    players[key].attack.forEach(ensureAlphaMask);
    players[key].hurt.forEach(ensureAlphaMask);
    if (data.jump?.length) {
      const jumpFrames = await loadFrameSet(data.jump);
      jumpFrames.forEach(ensureAlphaMask);
      players[key].jump = {
        prepare: jumpFrames[0] ? [jumpFrames[0]] : [],
        air: jumpFrames.slice(1, 3).filter(Boolean),
        landing: jumpFrames.slice(3).filter(Boolean)
      };
    }
    if (data.power) {
      players[key].power = await loadFrameSet(data.power);
      players[key].power.forEach(ensureAlphaMask);
    }
  }

  const bigBoner = {
    walk: await loadFrameSet(assetManifest.bigBoner.walk),
    portrait: await createImage(assetManifest.bigBoner.portrait),
    nativeFacing: assetManifest.bigBoner.nativeFacing ?? 'right'
  };
  bigBoner.walk.forEach(ensureAlphaMask);

  const enemies = {};
  for (const [key, data] of Object.entries(assetManifest.enemies)) {
    enemies[key] = {
      walk: await loadFrameSet(data.walk),
      hurt: await loadFrameSet(data.hurt),
      portrait: await createImage(data.portrait),
      nativeFacing: data.nativeFacing ?? 'right',
      explode: data.explode ? await loadFrameSet(data.explode) : null
    };
    enemies[key].walk.forEach(ensureAlphaMask);
    enemies[key].hurt.forEach(ensureAlphaMask);
    if(enemies[key].explode) enemies[key].explode.forEach(ensureAlphaMask);
  }

  const boss = {};
  for (const [key, data] of Object.entries(assetManifest.boss)) {
    boss[key] = {
      idle: await loadFrameSet(data.idle),
      blast: await loadFrameSet(data.blast),
      damage: await createImage(data.damage),
      mudball: await loadFrameSet(data.mudball),
      mudballSplat: data.mudballSplat ? await loadFrameSet(data.mudballSplat) : null
    };
    boss[key].idle.forEach(ensureAlphaMask);
    boss[key].blast.forEach(ensureAlphaMask);
    if(boss[key].mudball) boss[key].mudball.forEach(ensureAlphaMask);
    if(boss[key].mudballSplat) boss[key].mudballSplat.forEach(ensureAlphaMask);
  }

  const audio = {};
  for (const [key, data] of Object.entries(audioManifest)) {
    const clip = await loadAudio(data.src, data);
    clip._baseVolume = data.volume ?? clip._baseVolume ?? 1;
    clip._category = AUDIO_CATEGORIES[key] ?? clip._category ?? 'sfx';
    audio[key] = clip;
    registerAudioClip(key, clip);
  }
  applyAudioSettings();

  return { background, cover, walkMask, players, bigBoner, enemies, boss, audio };
};

const FLOOR_Y = CANVAS_HEIGHT - 5;
const WALKWAY_HEIGHT = 90;

const PLAYER_HEIGHT = 165;
const ENEMY_HEIGHT = 150;

const computeScale = (frame, targetHeight) => targetHeight / frame.height;

const SCALE_OVERRIDES = {
  players: { corky: 1.5 },
  enemies: { entrado: 1.25, peppers: 1.3 }
};

/** Particles & Lasers */
class Particle {
  constructor(x,y,life,vx=0,vy=0){
    this.x=x; this.y=y; this.life=life; this.t=0; this.vx=vx; this.vy=vy;
  }
  update(dt){ this.t+=dt; this.x+=this.vx*dt; this.y+=this.vy*dt; }
  draw(ctx, cameraX=0){
    const k = 1 - clamp(this.t/this.life,0,1);
    if(k<=0) return;
    const screenX=this.x - cameraX;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=`rgba(255,220,120,${0.35*k})`;
    ctx.beginPath();
    ctx.arc(screenX, this.y, 2+2*k, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  get dead(){ return this.t>=this.life; }
}

class LaserBolt {
  constructor(x,y,dir){
    this.x=x; this.y=y; this.dir=dir;
    this.speed=880;             // fast
    this.range=CANVAS_WIDTH + 120;
    this.travel=0;
    this.alive=true;
    this.hitSpark=null;
  }
  update(dt, enemies, world, ownerY){
    if(!this.alive){ if(this.hitSpark) this.hitSpark.update(dt); return; }
    const dx = this.speed*dt*this.dir;
    this.x += dx; this.travel += Math.abs(dx);
    // collide
    for(const e of enemies){
      if(e.shouldRemove || e.dying) continue;
      if(Math.abs(e.position.y - ownerY) > 45) continue;
      // approximate circle hit
      const ex=e.position.x, ey=e.position.y- e.height*0.5;
      if(Math.abs(ex - this.x) < 28){
        const hit=e.receiveDamage(24, this.dir, { isSpecial:true, type:'laser' });
        if(hit){
          playSfx('hitEnemy');
          if(!e.isAlive()) playSfx('destroyEnemy');
          this.alive=false;
          this.hitSpark = new Particle(ex, ey, 0.22, 60*this.dir, -30);
          break;
        }
      }
    }
    if(this.travel > this.range) this.alive=false;
  }
  draw(ctx, cameraX=0){
    if(this.alive){
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      ctx.lineCap='round';
      // outer glow
      ctx.lineWidth=6;
      ctx.strokeStyle='rgba(255,120,40,0.55)';
      const screenX=this.x - cameraX;
      ctx.beginPath(); ctx.moveTo(screenX-10*this.dir, this.y); ctx.lineTo(screenX+10*this.dir, this.y); ctx.stroke();
      // bright core
      ctx.lineWidth=2;
      ctx.strokeStyle='rgba(255,255,255,0.95)';
      ctx.beginPath(); ctx.moveTo(screenX-10*this.dir, this.y); ctx.lineTo(screenX+10*this.dir, this.y); ctx.stroke();
      ctx.restore();
    }
    if(this.hitSpark && !this.hitSpark.dead) this.hitSpark.draw(ctx, cameraX);
  }
  get dead(){ return !this.alive && (!this.hitSpark || this.hitSpark.dead); }
}

/** Entities */
class Entity {
  constructor(x,y){
    this.position={x,y}; this.velocity={x:0,y:0};
    this.facing=1; this.nativeFacing='right';
    this.state='idle'; this.animations={}; this.currentAnimation=null;
    this.scale=1; this.width=0; this.height=0; this.zOrder=y; this.invulnerableTimer=0;
  }
  setAnimations(f){ this.animationFactories=f; }
  setState(s){
    if(this.state===s && this.currentAnimation) return;
    const factory=this.animationFactories[s];
    if(!factory) throw new Error(`Missing animation factory for ${s}`);
    this.state=s; this.currentAnimation=factory(); this.refreshMetrics();
  }
  refreshMetrics(){
    const frame=this.currentAnimation?.frame; if(!frame) return;
    this.scale=this.baseScale ?? computeScale(frame, PLAYER_HEIGHT);
    this.width=frame.width*this.scale; this.height=frame.height*this.scale;
  }
  update(dt){
    if(this.invulnerableTimer>0) this.invulnerableTimer=Math.max(0,this.invulnerableTimer-dt);
    if(this.currentAnimation) this.currentAnimation.update(dt);
    this.position.x+=this.velocity.x*dt;
    this.position.y+=this.velocity.y*dt;
    this.position.y=clamp(this.position.y, FLOOR_Y - WALKWAY_HEIGHT, FLOOR_Y);
    this.zOrder=this.position.y;
  }
  drawShadow(ctx, cameraX){
    const shadowWidth=Math.max(30,this.width*0.4); const shadowHeight=12;
    const shadowX=Math.round(this.position.x - cameraX - shadowWidth/2);
    const shadowY=Math.round(this.position.y - shadowHeight/2);
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(shadowX + shadowWidth/2, shadowY + shadowHeight/2, shadowWidth/2, shadowHeight/2, 0, 0, Math.PI*2);
    ctx.fill();
  }
  draw(ctx, cameraX){
    if(!this.currentAnimation) return;
    const frame=this.currentAnimation.frame; if(!frame) return;
    const scale=this.baseScale ?? computeScale(frame, PLAYER_HEIGHT);
    const drawWidth=frame.width*scale, drawHeight=frame.height*scale;
    const drawX=Math.round(this.position.x - cameraX - drawWidth/2);
    const drawY=Math.round(this.position.y - drawHeight);
    ctx.save();
    ctx.translate(drawX + drawWidth/2, 0);
    const orientationMultiplier = this.nativeFacing==='left' ? -1 : 1;
    const renderScaleX = this.facing * orientationMultiplier;
    ctx.scale(renderScaleX, 1);
    ctx.drawImage(frame, -drawWidth/2, drawY, drawWidth, drawHeight);
    ctx.restore();
  }
  receiveDamage(amount, direction){
    if(this.invulnerableTimer>0) return false;
    this.hp-=amount; this.invulnerableTimer=0.4; this.velocity.x=direction*-45; this.velocity.y=-15; return true;
  }
  isAlive(){ return this.hp>0; }
}

const getEntityBounds = (info) => {
  if(!info) return null;
  return {
    left: info.left,
    top: info.top,
    right: info.left + info.width,
    bottom: info.top + info.height,
    width: info.width,
    height: info.height
  };
};

const getEntityCollisionInfo = (entity) => {
  if(!entity) return null;
  entity.refreshMetrics?.();
  const frame=entity.currentAnimation?.frame;
  if(!frame) return null;
  const mask=ensureAlphaMask(frame);
  if(!mask) return null;
  const width=entity.width ?? 0;
  const height=entity.height ?? 0;
  if(width<=0 || height<=0) return null;
  const left=entity.position.x - width*0.5;
  const top=entity.position.y - height;
  const scaleX=width / mask.width;
  const scaleY=height / mask.height;
  if(scaleX<=0 || scaleY<=0) return null;
  const flip = ((entity.facing ?? 1) * (entity.nativeFacing==='left' ? -1 : 1)) < 0;
  return { entity, mask, left, top, width, height, scaleX, scaleY, flip };
};

const collisionInfoHasOpaque = (info, worldX, worldY) => {
  if(!info) return false;
  const localX=worldX - info.left;
  const localY=worldY - info.top;
  if(localX<0 || localX>=info.width || localY<0 || localY>=info.height) return false;
  let imgX=localX / info.scaleX;
  const imgY=localY / info.scaleY;
  if(info.flip){
    imgX = (info.mask.width - 1) - imgX;
  }
  const ix=Math.floor(imgX);
  const iy=Math.floor(imgY);
  if(ix<0 || ix>=info.mask.width || iy<0 || iy>=info.mask.height) return false;
  const idx=iy*info.mask.width + ix;
  return info.mask.data[idx] > 0;
};

const entitiesOverlapOpaque = (entityA, entityB, step=1) => {
  if(!entityA || !entityB) return false;
  const infoA=getEntityCollisionInfo(entityA);
  const infoB=getEntityCollisionInfo(entityB);
  if(!infoA || !infoB) return false;
  const boundsA=getEntityBounds(infoA);
  const boundsB=getEntityBounds(infoB);
  if(!boundsA || !boundsB) return false;
  const left=Math.max(boundsA.left, boundsB.left);
  const right=Math.min(boundsA.right, boundsB.right);
  const top=Math.max(boundsA.top, boundsB.top);
  const bottom=Math.min(boundsA.bottom, boundsB.bottom);
  if(left>=right || top>=bottom) return false;
  const sampleStep=Math.max(1, step|0);
  for(let y=Math.floor(top); y<bottom; y+=sampleStep){
    for(let x=Math.floor(left); x<right; x+=sampleStep){
      if(collisionInfoHasOpaque(infoA, x+0.5, y+0.5) && collisionInfoHasOpaque(infoB, x+0.5, y+0.5)){
        return true;
      }
    }
  }
  return false;
};

class Player extends Entity {
  constructor(config){
    super(config.spawnX, config.spawnY);
    this.type=config.type; this.name=config.name; this.assets=config.assets;
    this.speed=180; this.depthSpeed=130; this.attackPower=config.attackPower ?? 15;
    this.maxHp=config.maxHp ?? 120; this.hp=this.maxHp;
    this.baseScale=config.baseScale; this.hitFrameWindow=config.hitFrameWindow;
    this.hurtDuration=0.4; this.hurtTimer=0; this.comboCooldown=0; this.attackCooldown=0;

    this.mutation={
      enabled: config.mutationEnabled ?? false,
      meter: 0, max: config.mutationMax ?? 100,
      active: false, timer: 0,
      state: 'idle',            // idle | charging | active | draining | burst
      mode: config.mutationMode ?? (config.mutationEnabled ? 'transform' : null),
      label: config.mutationLabel ?? 'MUTATION'
    };
    this.mutationGainOnHit=config.mutationGainOnHit ?? 18;

    this.eyeOffset=config.eyeOffset ?? {x:30,y:75};
    this.bigBonerAssets=config.bigBonerAssets ?? null;
    this.bigBonerWalk = this.bigBonerAssets ? new Animation(this.bigBonerAssets.walk, 0.09) : null;
    this.jumpAssets = this.assets.jump ?? null;

    // exact 1.5x target vs Boner base scale
    this.bigBonerScale = (config.baseScale ?? 1) * 1.5;

    // burst bits (unused for Boner but kept for Corky path)
    if (this.mutation.mode === 'burst') {
      this.burst = { hasWiped:false, intensity:0, peakFrame:config.burstPeakFrame ?? 15, radius: config.burstRadius ?? 420 };
    } else { this.burst=null; }

    this.attackHitbox={ width:70, height:55 };
    this.invulnerableTimer=0;
    this.pendingMutationReverse=false;
    this.mutationAnimation=null;
    this.isDuringPowerAnimation=false;
    this.powerAnimationTimer=0;
    this.nativeFacing=config.nativeFacing ?? 'right';
    this.bigBonerNativeFacing=config.bigBonerNativeFacing ?? this.nativeFacing;
    this.facing=config.initialFacing ?? 1;

    // lasers
    this.bolts=[]; this.laserCooldown=0;

    this.puffs=[]; // small particles
    this.isInAttackWindow=false;
    this.powerSoundPlayed=false;
    this.powerHealAmount = config.powerHealAmount ?? Math.max(6, Math.round(this.maxHp * 0.08));
    this.healedThisPower=false;
    this.laserAudioRef=null;
    this.laserLoopActive=false;
    this.knockback={ timeLeft:0, duration:0, initialVelocity:0 };
    this.jump = {
      active:false,
      phase:'ground',
      timer:0,
      height:0,
      peakHeight:34,
      prepareDuration:0.12,
      airDuration:0.26,
      landingDuration:0.18,
      forwardVelocity:0,
      direction:1,
      currentBoostX:0
    };

    this.setAnimations({
      idle: ()=>new Animation([this.assets.walk[0]], 1, {loop:false}),
      walk: ()=>new Animation(this.assets.walk, 0.1),
      attack: ()=>new Animation(this.assets.attack, 0.07, {loop:false}),
      hurt: ()=>new Animation(this.assets.hurt, 0.15, {loop:false}),
      power: this.assets.power ? ()=>{ const a=new Animation(this.assets.power, 0.09, {loop:false}); a.reset(); return a; } : null,
      powerReverse: this.assets.power ? ()=>{ const r=[...this.assets.power].reverse(); const a=new Animation(r, 0.09, {loop:false}); a.reset(); return a; } : null,
      jumpPrepare: (this.jumpAssets?.prepare?.length)
        ? ()=>new Animation(this.jumpAssets.prepare, this.jump.prepareDuration/Math.max(1,this.jumpAssets.prepare.length), {loop:false})
        : null,
      jumpAir: (this.jumpAssets?.air?.length)
        ? ()=>new Animation(this.jumpAssets.air, 0.08, {loop:false})
        : null,
      jumpLand: (this.jumpAssets?.landing?.length)
        ? ()=>new Animation(this.jumpAssets.landing, 0.08, {loop:false})
        : null
    });

    this.setState('idle');
  }

  setAnimations(f){ this.animationFactories=f; }
  setState(s){
    if(this.state===s && this.currentAnimation) return;
    const factory=this.animationFactories[s]; if(!factory) return;
    this.state=s; this.currentAnimation=factory(); this.refreshMetrics();
    if(s!=='attack') this.isInAttackWindow=false;
    if(s==='power') this.powerSoundPlayed=false;
  }
  applyKnockback(velocity, duration=0.35){
    if(!Number.isFinite(duration) || duration<=0) duration=0.1;
    if(!Number.isFinite(velocity)) velocity=0;
    const absIncoming=Math.abs(velocity);
    const absCurrent=Math.abs(this.knockback.initialVelocity);
    if(absIncoming < absCurrent && this.knockback.timeLeft>0) return;
    this.knockback.timeLeft=duration;
    this.knockback.duration=duration;
    this.knockback.initialVelocity=velocity;
  }
  startJump(){
    if(this.jump.active) return false;
    if(!this.jumpAssets) return false;
    if(!this.jumpAssets.prepare?.length || !this.jumpAssets.air?.length) return false;
    if(this.hurtTimer>0 || this.state==='hurt') return false;
    if(this.isDuringPowerAnimation) return false;
    if(this.mutation.state==='active') return false;
    if(this.state==='attack') return false;
    this.knockback.timeLeft=0;
    this.knockback.initialVelocity=0;
    this.knockback.duration=0;
    this.jump.active=true;
    this.jump.phase='prepare';
    this.jump.timer=0;
    this.jump.height=0;
    this.jump.direction=this.facing || 1;
    this.jump.forwardVelocity=this.jump.direction * (this.speed * 1.18);
    this.jump.currentBoostX=0;
    if(this.animationFactories.jumpPrepare){
      this.setState('jumpPrepare');
    }
    return true;
  }
  finishJump(){
    this.jump.active=false;
    this.jump.phase='ground';
    this.jump.timer=0;
    this.jump.height=0;
    this.jump.forwardVelocity=0;
    this.jump.currentBoostX=0;
    if(this.hurtTimer<=0){
      if(Math.abs(this.velocity.x)>6 || Math.abs(this.velocity.y)>6) this.setState('walk');
      else this.setState('idle');
    }
  }
  updateJump(dt){
    if(!this.jump.active){
      this.jump.currentBoostX=0;
      return;
    }
    this.jump.timer+=dt;
    switch(this.jump.phase){
      case 'prepare': {
        this.jump.currentBoostX=0;
        const prepareTime=this.jump.prepareDuration;
        if(this.jump.timer>=prepareTime){
          this.jump.phase='air';
          this.jump.timer=0;
          this.jump.height=0;
          if(this.animationFactories.jumpAir){
            this.setState('jumpAir');
          }
        }
        break;
      }
      case 'air': {
        const airTime=this.jump.airDuration;
        const progress=clamp(this.jump.timer/airTime, 0, 1);
        this.jump.height = Math.sin(progress*Math.PI) * this.jump.peakHeight;
        const easing=Math.max(0.25, 1 - progress*0.6);
        this.jump.currentBoostX = this.jump.forwardVelocity * easing;
        if(this.jump.timer>=airTime){
          this.jump.phase='landing';
          this.jump.timer=0;
          this.jump.height=Math.max(this.jump.height, 0);
          this.jump.forwardVelocity*=0.45;
          if(this.animationFactories.jumpLand){
            this.setState('jumpLand');
          }
        }
        break;
      }
      case 'landing': {
        this.jump.height=Math.max(0, this.jump.height - dt*this.jump.peakHeight*6);
        this.jump.currentBoostX = this.jump.forwardVelocity;
        this.jump.forwardVelocity *= 0.72;
        if(this.jump.timer>=this.jump.landingDuration){
          this.finishJump();
        }
        break;
      }
      default:
        this.jump.currentBoostX=0;
        this.finishJump();
        break;
    }
  }

  heal(amount){
    if(amount<=0) return 0;
    const before=this.hp;
    this.hp=Math.min(this.maxHp, this.hp + amount);
    return this.hp-before;
  }
  applyPowerHeal(){
    if(this.healedThisPower) return;
    const restored=this.heal(this.powerHealAmount);
    if(restored>0) this.healedThisPower=true;
  }
  playLaserLoop(){
    if(this.type!=='boner') return;
    const clip=game.audio?.bigBonerLaser;
    if(!clip) return;
    this.laserAudioRef=clip;
    if(this.laserLoopActive) return;
    try{
      clip._baseVolume = Math.min(1, 0.65);
      clip._category = clip._category ?? 'sfx';
      clip.loop = true;
      clip.currentTime = 0;
    }catch(e){ /* ignore */ }
    applyVolumeToClip(clip);
    playAudio(clip, { reset:false });
    this.laserLoopActive=true;
  }
  stopLaserLoop(){
    if(!this.laserLoopActive) return;
    const clip=this.laserAudioRef ?? game.audio?.bigBonerLaser;
    if(clip) stopAudio(clip, { reset:false });
    this.laserLoopActive=false;
    this.laserAudioRef=null;
  }

  /** transformation progress for scaling during power anims */
  getPowerProgress(){
    const anim=this.currentAnimation; if(!this.isDuringPowerAnimation || !anim) return 0;
    const total=anim.frames?.length ?? 0; if(total<=1) return 0;
    return clamp(anim.index / (total - 1), 0, 1);
  }

  updateGameplay(dt, input, world, enemies){
    if(world?.victorySequence?.active){
      if(this.hurtTimer>0){
        this.hurtTimer=Math.max(0, this.hurtTimer-dt);
      }
      this.velocity.x=0;
      this.velocity.y=0;
      if(this.hurtTimer===0 && this.state!=='idle' && this.state!=='power'){
        this.setState('idle');
      }
      this.updateJump(dt);
      this.updateLasers(dt, enemies, world);
      super.update(dt);
      if(this.type==='boner') this.stopLaserLoop();
      tryPlayFootstep(this, 'player', this.type);
      return;
    }

    if(this.hurtTimer>0){
      this.hurtTimer=Math.max(0, this.hurtTimer-dt);
      if(this.hurtTimer===0 && this.isAlive()) this.setState('idle');
    }
    if(this.attackCooldown>0) this.attackCooldown=Math.max(0, this.attackCooldown-dt);

    if(this.mutation.enabled) this.updateMutation(dt, input, world, enemies);

    // During power animation: freeze motion & drive transform logic
    if(this.isDuringPowerAnimation){
      this.velocity.x=0; this.velocity.y=0;
      this.updateJump(dt);
      super.update(dt);
      const animation=this.currentAnimation;
      if(animation){
        if(!this.powerSoundPlayed){
          if(this.type==='corky'){
            if(animation.index>=10){
              playAudio(game.audio?.corkyPower);
              this.powerSoundPlayed=true;
            }
          }else if(this.type==='boner'){
            playAudio(game.audio?.bonerPower, { reset: true });
            this.powerSoundPlayed=true;
          }
        }
        this.powerAnimationTimer+=dt;
        const frameCount=animation.frames?.length ?? 0;
        const frameDuration=animation.frameDuration ?? 0;
        const expected=(frameCount*frameDuration || 0.5)+0.3;
        if(!animation.done && this.powerAnimationTimer>expected){
          if(frameCount>0) animation.index=frameCount-1;
          animation.done=true;
          if(this.mutation.mode==='burst' && this.burst && !this.burst.hasWiped){
            this.executeBurstWipe(world, enemies);
          }
        }
      }
      if(this.mutation.mode==='burst') this.updateBurstPower(world, enemies);
      if(this.currentAnimation?.done){
        this.isDuringPowerAnimation=false; this.powerAnimationTimer=0;
        if(!this.mutation.active && this.pendingMutationReverse){ this.pendingMutationReverse=false; this.finishMutationCooldown(); }
        else if(this.mutation.active){ this.enterMutation(); }
      }
      // update particles while paused
      this.puffs = this.puffs.filter(p=>{ p.update(dt); return !p.dead; });
      return;
    }

    // regular movement
    let knockVelocity=0;
    let knockControlFactor=1;
    if(this.knockback.timeLeft>0){
      const duration=this.knockback.duration || 0.0001;
      const normalized=clamp(this.knockback.timeLeft / duration, 0, 1);
      knockVelocity=this.knockback.initialVelocity * normalized;
      knockControlFactor=Math.max(0, 1 - normalized);
      this.knockback.timeLeft=Math.max(0, this.knockback.timeLeft - dt);
      if(this.knockback.timeLeft<=0) this.knockback.initialVelocity=0;
    }

    const movingLeft=input.isDown(INPUT_KEYS.LEFT);
    const movingRight=input.isDown(INPUT_KEYS.RIGHT);
    const movingUp=input.isDown(INPUT_KEYS.UP);
    const movingDown=input.isDown(INPUT_KEYS.DOWN);
    const wantsAttack=input.wasPressed(INPUT_KEYS.ATTACK);
    const wantsJump=input.wasPressed(INPUT_KEYS.JUMP);
    if(wantsJump) this.startJump();
    let inputVx=0, inputVy=0;
    if(movingLeft){ inputVx-=this.speed; if(!movingRight) this.facing=-1; }
    if(movingRight){ inputVx+=this.speed; if(!movingLeft) this.facing=1; }
    if(movingUp) inputVy-=this.depthSpeed;
    if(movingDown) inputVy+=this.depthSpeed;

    let vx=inputVx;
    let vy=inputVy;
    if(knockVelocity!==0 || this.knockback.timeLeft>0){
      vx = knockVelocity + inputVx * knockControlFactor;
      vy = inputVy * knockControlFactor;
      if(knockVelocity<0) this.facing=-1;
      else if(knockVelocity>0) this.facing=1;
    }
    const preJumpFacing=this.facing;
    this.updateJump(dt);
    if(this.jump.active){
      vx += this.jump.currentBoostX ?? 0;
      if(Math.abs(inputVx)<1 && Math.abs(knockVelocity)<1){
        this.facing = this.jump.direction || preJumpFacing;
      }
    }
    this.velocity.x=vx; this.velocity.y=vy;

    if(this.mutation.state==='active') this.updateMutationActive(dt, enemies, world);
    else if(this.type==='boner') this.stopLaserLoop();

    if(this.hurtTimer<=0 && !this.jump.active){
      if(wantsAttack && this.attackCooldown===0) this.performAttack(enemies, world);
      else if(vx!==0 || vy!==0){ if(this.state!=='attack') this.setState('walk'); }
      else if(this.state!=='attack' && this.state!=='hurt') this.setState('idle');
    }

    // keep in bounds
    this.position.x=clamp(this.position.x, world.bounds.left, world.bounds.right);
    this.position.y=clamp(this.position.y, FLOOR_Y - WALKWAY_HEIGHT, FLOOR_Y);
    if((!this.jump.active || this.jump.phase==='landing') && this.knockback.timeLeft<=0){
      if(this.position.x<=world.bounds.left+0.5 && this.velocity.x<0) this.velocity.x=0;
      if(this.position.x>=world.bounds.right-0.5 && this.velocity.x>0) this.velocity.x=0;
    }

    // update lasers & particles
    this.updateLasers(dt, enemies, world);

    super.update(dt);
    this.position.x=clamp(this.position.x, world.bounds.left, world.bounds.right);
    this.position.y=clamp(this.position.y, FLOOR_Y - WALKWAY_HEIGHT, FLOOR_Y);
    this.resolveBossCollision(world);
    if(!this.jump.active || this.jump.phase==='landing'){
      tryPlayFootstep(this, 'player', this.type);
    }
  }

  performAttack(enemies, world){
    if(this.jump.active) return;
    this.setState('attack');
    this.attackCooldown=0.45;
    if(this.mutation.enabled && !this.mutation.active) this.mutation.meter=Math.min(this.mutation.max, this.mutation.meter+4);
    this.currentAnimation.reset();
    const damage=this.mutation.active ? this.attackPower+10 : this.attackPower;
    const hitStart=this.hitFrameWindow.start, hitEnd=this.hitFrameWindow.end;
    const context={ isSpecial:this.mutation.active, type:this.mutation.active ? 'mutation_melee' : 'melee', world };
    this.isInAttackWindow=false;

    const resolve=()=>{
      const i=this.currentAnimation.index;
      const active=i>=hitStart && i<=hitEnd;
      this.isInAttackWindow=active;
      if(active) this.tryStrike(enemies, damage, world, context);
      if(this.currentAnimation.done){
        this.isInAttackWindow=false;
        if(this.hurtTimer<=0) this.setState('idle');
      }
    };
    const original=this.currentAnimation.update.bind(this.currentAnimation);
    this.currentAnimation.update=(dt)=>{ original(dt); resolve(); };
  }

  tryStrike(enemies, damage, world, context={}){
    enemies.forEach((enemy)=>{
      if(enemy.shouldRemove || enemy.dying) return;
      if(!enemy.isAlive()) return;
      const enemyHeight=enemy.height ?? (enemy.currentAnimation?.frame?.height ?? 160) * (enemy.baseScale ?? 1);
      const yTolerance = enemy.isBoss ? Math.max(90, enemyHeight*0.55) : 40;
      if(Math.abs(enemy.position.y - this.position.y) > yTolerance) return;
      const enemyWidth = enemy.width ?? (enemy.currentAnimation?.frame?.width ?? 100) * (enemy.baseScale ?? 1);
      const reach=this.attackHitbox.width + (enemy.isBoss ? enemyWidth*0.35 : 0);
      const minReach = enemy.isBoss ? -enemyWidth*0.25 : 0;
      const f=this.facing;
      const dx=(enemy.position.x - this.position.x)*f;
      if(dx<minReach || dx>reach) return;
      const took = enemy.receiveDamage(damage, f, context);
      if(took){
        if(context.type==='melee' || context.type==='mutation_melee'){
          playSfx('hitEnemy');
          if(!enemy.isAlive()) playSfx('destroyEnemy');
        }else if((this.type==='corky' || this.type==='boner') && enemy?.isBoss){
          playSfx('hitEnemy');
          if(!enemy.isAlive()) playSfx('destroyEnemy');
        }
        if(this.mutation.enabled && !this.mutation.active){
          let gain;
          if(enemy.isBoss){
            gain=Math.max(1, Math.round(this.mutationGainOnHit*0.2));
          }else{
            gain=Math.max(1, Math.round(this.mutationGainOnHit*0.6));
          }
          this.mutation.meter=Math.min(this.mutation.max, this.mutation.meter + gain);
        }
      }
    });
  }

  resolveBossCollision(world){
    const boss=world?.boss;
    if(!boss || boss.shouldRemove || boss.dying || !boss.isAlive()) return;
    if(this.jump?.active && this.jump.height>6) return;
    const rect=boss.getCollisionBounds?.();
    if(!rect) return;
    const playerWidth=Math.max(10, this.width ?? 90);
    const playerHeight=Math.max(10, this.height ?? 160);
    const playerHalfW=playerWidth*0.5;
    const playerLeft=this.position.x - playerHalfW;
    const playerRight=this.position.x + playerHalfW;
    const playerTop=this.position.y - playerHeight;
    const playerBottom=this.position.y;
    const overlapX=Math.min(playerRight, rect.right) - Math.max(playerLeft, rect.left);
    const overlapY=Math.min(playerBottom, rect.bottom) - Math.max(playerTop, rect.top);
    if(overlapX>0 && overlapY>0){
      const center=rect.centerX ?? ((rect.left + rect.right)/2);
      const pushDir = (this.position.x < center) ? -1 : 1;
      const newCenter = pushDir<0 ? rect.left - playerHalfW : rect.right + playerHalfW;
      this.position.x = newCenter;
      this.velocity.x = 0;
      this.position.x = clamp(this.position.x, world.bounds.left, world.bounds.right);
    }
  }

  receiveDamage(amount, sourceX){
    if(!this.isAlive() || this.invulnerableTimer>0 || this.isDuringPowerAnimation || this.mutation.active) return false;
    this.hp=Math.max(0, this.hp - amount);
    this.hurtTimer=this.hurtDuration;
    if(this.jump.active) this.finishJump();
    this.setState('hurt');
    this.invulnerableTimer=0.85;
    this.velocity.x = sourceX < this.position.x ? 80 : -80;
    this.velocity.y = -20;
    if(this.type==='boner') this.stopLaserLoop();
    return true;
  }

  updateMutation(dt, input, world, enemies){
    const m=this.mutation; if(!m.enabled) return;
    if(m.state==='idle'){
      if(m.meter>=m.max && input.wasPressed(INPUT_KEYS.POWER)){
        if(!this.animationFactories.power){ m.active=false; m.state='idle'; m.meter=m.max; console.warn(`[Player:${this.type}] Power animation missing`); return; }
        m.active=true; this.isDuringPowerAnimation=true; this.powerAnimationTimer=0; this.velocity.x=0; this.velocity.y=0;
        this.healedThisPower=false;
        m.state = (m.mode==='burst') ? 'burst' : 'charging';
        this.setState('power');
        if(this.state!=='power' || !this.currentAnimation){ this.isDuringPowerAnimation=false; this.powerAnimationTimer=0; m.active=false; m.state='idle'; return; }
        this.applyPowerHeal();
      }
    } else if (m.mode==='transform' && m.state==='active'){
      m.timer=Math.max(0, m.timer - dt);
      if(m.timer===0) this.exitMutation();
    } else if (m.state==='draining'){
      // handled elsewhere
    }
  }

  updateMutationActive(dt, enemies, world){
    if(!this.mutation.active || this.mutation.state!=='active') return;
    if(this.type==='boner') this.playLaserLoop();

    // Big Boner walk cycle
    if(this.bigBonerWalk){
      const isMoving = Math.abs(this.velocity.x)>1 || Math.abs(this.velocity.y)>1;
      if(isMoving){
        this.bigBonerWalk.update(dt);
      }else{
        const frames=this.bigBonerWalk.frames ?? [];
        if(frames.length>1){
          this.bigBonerWalk.index=1;
        }else{
          this.bigBonerWalk.index=0;
        }
        this.bigBonerWalk.elapsed=0;
        this.bigBonerWalk.done=false;
      }
      const frame=this.bigBonerWalk.frame;
      const scale=this.bigBonerScale;
      this.width=frame.width*scale; this.height=frame.height*scale;
    }

    // Rapid-fire eye bolts
    this.laserCooldown -= dt;
    if(this.laserCooldown<=0){
      this.laserCooldown=0.06; // fire rate
      const dir=this.facing;
      const baseX=this.position.x + this.eyeOffset.x*dir;
      const y=this.position.y - this.eyeOffset.y;
      // two eyes: small vertical offset
      const jitter = (Math.random()-0.5)*6;
      this.bolts.push(new LaserBolt(baseX, y - 6 + jitter, dir));
      this.bolts.push(new LaserBolt(baseX, y + 6 + jitter*0.8, dir));
      // little muzzle puff
      this.puffs.push(new Particle(baseX, y, 0.18, 40*dir, -20));
    }
  }

  executeBurstWipe(world, enemies){
    if(this.mutation.mode!=='burst' || !this.burst || this.burst.hasWiped) return;
    const scale = world?.backgroundScale ?? 1;
    const safeScale = scale > 0 ? scale : 1;
    const cameraWorld = world ? world.cameraX / safeScale : this.position.x - CANVAS_WIDTH / (2 * safeScale);
    const viewWidth = CANVAS_WIDTH / safeScale;
    const margin = 40;
    const left = cameraWorld - margin, right = cameraWorld + viewWidth + margin;
    if (!Array.isArray(enemies)) return;
    enemies.forEach((e)=>{
      if(!e || e.shouldRemove || e.dying) return;
      if(!e.isAlive()) return;
      if(e.position.x < left || e.position.x > right) return;
      if(e.isBoss){
        if(typeof e.applySpecialDamage === 'function') e.applySpecialDamage('burst', this.position.x);
        else e.receiveDamage(80, this.position.x, { isSpecial:true, type:'burst' });
      }else if(e.isMudball){
        e.receiveDamage(e.maxHp ?? 3, this.position.x, { isSpecial:true, type:'burst' });
      }else{
        e.hp=0;
        if(typeof e.beginDefeat === 'function') e.beginDefeat();
      }
    });
    this.burst.hasWiped=true;
  }

  updateBurstPower(world, enemies){
    if(this.mutation.mode!=='burst' || !this.burst) return;
    const a=this.currentAnimation; if(!a) return;
    const total=a.frames.length;
    if(total<=1){ this.burst.intensity=0; return; }
    const i=a.index, peak=clamp(this.burst.peakFrame, 0, total-1);
    if(i<=peak) this.burst.intensity = peak===0 ? 1 : i/peak;
    else {
      const fall = total - peak - 1;
      this.burst.intensity = fall>0 ? Math.max(0, 1 - (i - peak)/fall) : 0;
    }
    if(!this.burst.hasWiped && i>=peak) this.executeBurstWipe(world, enemies);
  }

  enterMutation(){
    if(this.mutation.mode==='burst'){ this.finishBurst(); return; }
    this.mutation.state='active'; this.mutation.timer=8; this.invulnerableTimer=0.3;
    if(this.bigBonerWalk) this.bigBonerWalk.reset();
    this.applyPowerHeal();
    if(this.type==='boner') this.playLaserLoop();
  }

  exitMutation(){
    if(!this.mutation.active || this.mutation.mode==='burst') return;
    this.mutation.state='draining'; this.mutation.active=false;
    this.isDuringPowerAnimation=true; this.powerAnimationTimer=0; this.pendingMutationReverse=true;
    this.setState('powerReverse');
    if(this.type==='boner') this.stopLaserLoop();
  }

  finishMutationCooldown(){
    if(this.mutation.mode==='burst'){ this.finishBurst(); return; }
    this.mutation.state='idle'; this.mutation.meter=0; this.mutation.timer=0; this.setState('idle');
    this.healedThisPower=false;
    if(this.type==='boner') this.stopLaserLoop();
  }

  finishBurst(){
    if(this.burst){ this.burst.intensity=0; this.burst.hasWiped=false; }
    this.mutation.active=false; this.mutation.state='idle'; this.mutation.meter=0; this.mutation.timer=0; this.setState('idle');
    this.healedThisPower=false;
    if(this.type==='boner') this.stopLaserLoop();
  }

  /** laser/particle housekeeping */
  updateLasers(dt, enemies, world){
    // projectiles
    for(const b of this.bolts) b.update(dt, enemies, world, this.position.y);
    this.bolts = this.bolts.filter(b=>!b.dead);
    // particles
    this.puffs = this.puffs.filter(p=>{ p.update(dt); return !p.dead; });
  }

  drawCorkyPowerAura(ctx, cameraX){
    if(this.type!=='corky') return;
    if(!this.isDuringPowerAnimation) return;
    const anim=this.currentAnimation;
    if(!anim) return;
    const total=anim.frames?.length ?? 0;
    if(total<=0) return;
    const peak=15;
    const frameIndex=(anim.index ?? 0) + 1;
    let intensity;
    if(frameIndex<=peak) intensity=frameIndex/peak;
    else {
      const remaining=Math.max(total - peak, 1);
      intensity=Math.max(0, 1 - (frameIndex - peak)/remaining);
    }
    intensity=clamp(intensity, 0, 1);
    if(intensity<=0.02) return;
    const screenX=Math.round(this.position.x - cameraX);
    const hopOffset=this.jump?.height ?? 0;
    const screenY=Math.round(this.position.y - hopOffset*0.6 - (this.height ?? 160)*0.55);
    const inner=26 + 24*intensity;
    const outer=inner + 140 + 120*intensity;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    const glow=ctx.createRadialGradient(screenX, screenY, Math.max(1, inner*0.45), screenX, screenY, outer);
    glow.addColorStop(0, `rgba(255,255,255,${0.85*intensity})`);
    glow.addColorStop(0.35, `rgba(255,245,180,${0.55*intensity})`);
    glow.addColorStop(0.7, `rgba(255,230,110,${0.28*intensity})`);
    glow.addColorStop(1, 'rgba(255,225,90,0)');
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(screenX, screenY, outer, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  /** rendering */
  draw(ctx, cameraX){
    // Active transform form
    if(this.mutation.state==='active' && this.bigBonerAssets){
      this.drawBigBoner(ctx, cameraX);
      this.drawEyeGlow(ctx, cameraX);
      this.drawLaserBolts(ctx, cameraX);
      return;
    }

    // Otherwise, draw regular sprite BUT scale during power animations
    if(!this.currentAnimation) return;
    const frame=this.currentAnimation.frame; if(!frame) return;

    // scale multiplier for transform visuals
    let scaleMul = 1;
    if(this.isDuringPowerAnimation){
      const t = this.getPowerProgress();
      if(this.mutation.state==='charging') scaleMul = 1 + 0.5 * t;          // 1.0 -> 1.5
      else if(this.mutation.state==='draining') scaleMul = 1 + 0.5 * (1-t); // 1.5 -> 1.0
    }

    const base = this.baseScale ?? computeScale(frame, PLAYER_HEIGHT);
    const scale = base * scaleMul;

    const w=frame.width*scale, h=frame.height*scale;
    const hopOffset = this.jump?.height ?? 0;
    const drawX=Math.round(this.position.x - cameraX - w/2);
    const drawY=Math.round(this.position.y - h - hopOffset);

    this.width=w; this.height=h;

    this.drawCorkyPowerAura(ctx, cameraX);

    ctx.save();
    ctx.translate(drawX + w/2, 0);
    const orientationMultiplier = this.nativeFacing==='left' ? -1 : 1;
    ctx.scale(this.facing*orientationMultiplier, 1);
    ctx.drawImage(frame, -w/2, drawY, w, h);
    ctx.restore();

    // particles that play during charge/reverse
    this.puffs.forEach(p=>p.draw(ctx, cameraX));
  }
  drawShadow(ctx, cameraX){
    if(!ctx) return;
    const hop=this.jump?.height ?? 0;
    const peak=Math.max(1, this.jump?.peakHeight ?? 30);
    const scaleFactor=clamp(1 - hop/peak, 0.45, 1);
    const shadowWidth=Math.max(24, (this.width ?? 80)*0.4*scaleFactor);
    const shadowHeight=Math.max(10, 12*scaleFactor);
    const shadowX=Math.round(this.position.x - cameraX - shadowWidth/2);
    const shadowY=Math.round(this.position.y - shadowHeight/2);
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(shadowX + shadowWidth/2, shadowY + shadowHeight/2, shadowWidth/2, shadowHeight/2, 0, 0, Math.PI*2);
    ctx.fill();
  }

  drawBigBoner(ctx, cameraX){
    if(!this.bigBonerWalk) return;
    const frame=this.bigBonerWalk.frame;
    const scale=this.bigBonerScale; // fixed 1.5x over Boner base
    const w=frame.width*scale, h=frame.height*scale;
    this.width=w; this.height=h;
    const x=Math.round(this.position.x - cameraX - w/2);
    const y=Math.round(this.position.y - h);
    ctx.save();
    ctx.translate(x + w/2, 0);
    const orientationMultiplier = this.bigBonerNativeFacing==='left' ? -1 : 1;
    ctx.scale(this.facing*orientationMultiplier, 1);
    ctx.drawImage(frame, -w/2, y, w, h);
    ctx.restore();
  }

  drawEyeGlow(ctx, cameraX){
    const ox = this.position.x - cameraX + this.eyeOffset.x*this.facing;
    const oy = this.position.y - this.eyeOffset.y;
    const eyes = [[ox, oy - 6], [ox, oy + 6]];
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    eyes.forEach(([x,y])=>{
      const r=4;
      const g=ctx.createRadialGradient(x,y,0,x,y,16);
      g.addColorStop(0,'rgba(255,250,200,0.95)');
      g.addColorStop(0.4,'rgba(255,120,40,0.75)');
      g.addColorStop(1,'rgba(255,120,40,0)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(x,y,r*4,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  drawLaserBolts(ctx, cameraX){
    // faint beam flicker for style
    const originX = this.position.x - cameraX + this.eyeOffset.x * this.facing;
    const originY = this.position.y - this.eyeOffset.y;
    const beamTargetX = this.facing > 0 ? CANVAS_WIDTH + 40 : -40;

    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const drawBeam=(offsetY)=>{
      const targetY = originY + offsetY;
      const grad=ctx.createLinearGradient(originX, originY, beamTargetX, targetY);
      grad.addColorStop(0, 'rgba(255,255,215,0.3)');
      grad.addColorStop(1, 'rgba(255,70,0,0)');
      ctx.lineWidth=4;
      ctx.strokeStyle=grad;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(beamTargetX, targetY);
      ctx.stroke();
    };
    drawBeam(-6);
    drawBeam(6);
    ctx.restore();

    // actual bolts
    this.bolts.forEach(b=>b.draw(ctx, cameraX));
    // muzzle/impact puffs
    this.puffs.forEach(p=>p.draw(ctx, cameraX));
  }

  drawBurstLight(ctx, cameraX){
    if(!this.burst) return;
    const intensity=this.burst.intensity; if(intensity<=0) return;
    const screenX=Math.round(this.position.x - cameraX);
    const spriteHeight=this.height || 180;
    const screenY=Math.round(this.position.y - spriteHeight * 0.6);
    const radius=Math.max(120, this.burst.radius * intensity);

    ctx.save();
    ctx.globalCompositeOperation='screen';
    const radial=ctx.createRadialGradient(screenX,screenY,radius*0.15,screenX,screenY,radius);
    radial.addColorStop(0, `rgba(255,255,215,${0.75*intensity})`);
    radial.addColorStop(0.45, `rgba(255,244,120,${0.55*intensity})`);
    radial.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle=radial;
    ctx.beginPath(); ctx.arc(screenX,screenY,radius,0,Math.PI*2); ctx.fill();

    const beamHeight=Math.max(160, spriteHeight*1.4);
    const beamTop=screenY - beamHeight/2;
    const g=ctx.createLinearGradient(screenX, beamTop, screenX, beamTop+beamHeight);
    g.addColorStop(0,'rgba(255,255,200,0)');
    g.addColorStop(0.5,`rgba(255,255,180,${0.5*intensity})`);
    g.addColorStop(1,'rgba(255,255,200,0)');
    ctx.fillStyle=g; ctx.fillRect(0, beamTop, CANVAS_WIDTH, beamHeight);
    ctx.restore();
  }
}

class Enemy extends Entity {
  constructor(config){
    super(config.spawnX, config.spawnY);
    this.assets=config.assets; this.nativeFacing=config.nativeFacing ?? this.nativeFacing;
    this.facing=config.initialFacing ?? this.facing;
    this.explodeFrames=config.explode ?? null;
    this.aggression=config.aggression ?? 1;
    this.difficultyTier=config.difficultyTier ?? 0;
    this.difficultyLabel=config.difficultyLabel ?? null;
    this.speed=config.speed ?? 110; this.depthSpeed=config.depthSpeed ?? 100;
    this.attackRange=config.attackRange ?? 55; this.attackDamage=config.attackDamage ?? 10;
    this.attackCooldown=0; this.attackSuppressedTimer=0;
    this.attackCooldownBase=config.attackCooldownBase ?? 1.05;
    this.attackCooldownVariance=Math.max(0, config.attackCooldownVariance ?? 0.4);
    this.maxHp=config.maxHp ?? 60; this.hp=this.maxHp;
    this.baseScale=config.baseScale ?? computeScale(this.assets.walk[0], ENEMY_HEIGHT);
    this.hurtTimer=0; this.dying=false; this.shouldRemove=false;
    this.exitSpeed = config.exitSpeed ?? 180;
    this.exiting=false;
    this.countsTowardKill = config.countsTowardKill ?? true;
    this.onDefeated = config.onDefeated ?? null;
    this.isBoss=false;
    this._defeatNotified=false;
    this.enemyKey = config.enemyKey ?? null;

    const animations={
      idle: ()=>new Animation(this.assets.walk, 0.13),
      walk: ()=>new Animation(this.assets.walk, 0.11),
      attack: ()=>new Animation(this.assets.walk, 0.08, {loop:false}),
      hurt: ()=>new Animation(this.assets.hurt, 0.15, {loop:false})
    };
    if(this.explodeFrames) animations.defeated=()=>new Animation(this.explodeFrames, 0.12, {loop:false});
    this.setAnimations(animations);
    this.setState('walk');
  }
  setAnimations(f){ this.animationFactories=f; }
  setState(s){
    if(this.state===s && this.currentAnimation) return;
    const factory=this.animationFactories[s]; if(!factory) return;
    this.state=s; this.currentAnimation=factory(); this.refreshMetrics();
  }
  update(dt, world, player){
    if(this.shouldRemove) return;
    if(this.exiting){
      this.state='walk';
      this.facing=1;
      this.velocity.x=this.exitSpeed;
      this.velocity.y=0;
      super.update(dt);
      tryPlayFootstep(this, 'enemy', this.enemyKey);
      if(this.position.x > world.bounds.right + 240) this.shouldRemove=true;
      return;
    }
    if(this.dying){
      this.velocity.x=0; this.velocity.y=0; super.update(dt);
      if(this.currentAnimation?.done) this.shouldRemove=true; return;
    }
    if(!this.isAlive()){ this.beginDefeat(); return; }
    player = player ?? world?.player ?? null;
    if(!player){
      super.update(dt);
      return;
    }

    if(this.hurtTimer>0){
      this.hurtTimer=Math.max(0, this.hurtTimer - dt);
      if(Math.abs(this.velocity.x)>1) this.facing = this.velocity.x>0 ? 1 : -1;
      if(this.hurtTimer===0) this.setState('walk');
    }else{
      const dx=player.position.x - this.position.x;
      const dy=player.position.y - this.position.y;
      const dist=Math.max(0.001, Math.hypot(dx, dy));
      const desired = dx===0 ? this.facing : (dx>0?1:-1);
      this.facing=desired;
      if(Math.abs(dx) > this.attackRange || Math.abs(dy) > 32){
        const moveX=(dx/dist)*this.speed;
        const moveY=(dy/dist)*this.depthSpeed;
        this.velocity.x=moveX; this.velocity.y=moveY; this.setState('walk');
      }else{
        this.velocity.x=0; this.velocity.y=0; this.tryAttack(player);
      }
    }

    if(this.attackCooldown>0) this.attackCooldown=Math.max(0, this.attackCooldown - dt);
    if(this.attackSuppressedTimer>0) this.attackSuppressedTimer=Math.max(0, this.attackSuppressedTimer - dt);
    this.position.x=clamp(this.position.x, world.bounds.left, world.bounds.right);
    super.update(dt);
    tryPlayFootstep(this, 'enemy', this.enemyKey);
  }
  tryAttack(player){
    if(this.attackCooldown>0 || this.attackSuppressedTimer>0) return;
    this.setState('attack');
    const variance=Math.max(0, this.attackCooldownVariance);
    this.attackCooldown=this.attackCooldownBase + (variance>0 ? Math.random()*variance : 0);
    const resolve=()=>{
      const i=this.currentAnimation.index;
      if(i===2 && player && this.canStrikePlayer(player)){
        player.receiveDamage(this.attackDamage, this.position.x);
      }
      if(this.currentAnimation.done) this.setState('walk');
    };
    const original=this.currentAnimation.update.bind(this.currentAnimation);
    this.currentAnimation.update=(dt)=>{ original(dt); resolve(); };
  }
  canStrikePlayer(player){
    if(!player || !player.isAlive?.()) return false;
    if(this.attackSuppressedTimer>0) return false;
    if(player.state==='attack') return false;
    return entitiesOverlapOpaque(this, player, 1);
  }
  receiveDamage(amount, sourceX){
    if(this.dying) return false;
    const took=super.receiveDamage(amount, sourceX);
    if(!took) return false;
    this.attackSuppressedTimer=Math.max(this.attackSuppressedTimer, 0.3);
    this.hp=Math.max(0, this.hp);
    if(!this.isAlive()) this.beginDefeat();
    else { this.hurtTimer=0.35; this.setState('hurt'); }
    return true;
  }
  beginDefeat(){
    if(this.dying) return;
    if(this.countsTowardKill && !this._defeatNotified){
      this._defeatNotified=true;
      if(typeof this.onDefeated === 'function') this.onDefeated(this);
    }
    this.dying=true; this.velocity.x=0; this.velocity.y=0; this.invulnerableTimer=999;
    if(this.animationFactories.defeated) this.setState('defeated'); else this.shouldRemove=true;
  }
  startExit(){
    this.exiting=true;
    this.invulnerableTimer=5;
    this.setState('walk');
    this.facing=1;
  }
}

class Mudball extends Entity {
  constructor(config){
    super(config.spawnX, config.spawnY);
    this.frames=config.frames ?? [];
    this.splatFrames=config.splatFrames ?? [];
    const baseFrame=this.frames[0] ?? null;
    this.baseScale=config.baseScale ?? (baseFrame ? computeScale(baseFrame, config.targetHeight ?? 110) : 1);
    this.setAnimations({
      drop: ()=>new Animation(this.frames, config.frameDuration ?? 0.05),
      splat: ()=>new Animation(this.splatFrames.length ? this.splatFrames : (this.frames.length ? [this.frames[this.frames.length-1]] : []), config.splatFrameDuration ?? 0.07, { loop:false })
    });
    this.setState('drop');
    this.damage=config.damage ?? 20;
    this.gravity=config.gravity ?? 900;
    this.maxFallSpeed=config.maxFallSpeed ?? 560;
    this.groundY=config.groundY ?? (FLOOR_Y - 6);
    this.velocity.x = config.horizontalVelocity ?? 0;
    this.velocity.y = config.initialVelocityY ?? 0;
    this.startHeight=Math.max(1, this.groundY - this.position.y);
    this.countsTowardKill=false;
    this.isMudball=true;
    this.isBoss=false;
    this.playedSplat=false;
    this.shouldRemove=false;
    this.maxHp=config.maxHp ?? 1;
    this.hp=this.maxHp;
    this.nativeFacing='right';
  }
  update(dt, world, player){
    if(this.shouldRemove) return;
    if(this.invulnerableTimer>0) this.invulnerableTimer=Math.max(0, this.invulnerableTimer-dt);
    if(this.currentAnimation) this.currentAnimation.update(dt);
    this.refreshMetrics();
    if(this.state==='drop'){
      this.velocity.y = Math.min(this.maxFallSpeed, this.velocity.y + this.gravity*dt);
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      this.zOrder=this.position.y;
      if(player) this.checkCollision(player);
      if(this.position.y >= this.groundY){
        this.triggerImpact({ impactY:this.groundY });
      }
      const bounds=world?.bounds;
      if(bounds){
        if(this.position.x < bounds.left - 360 || this.position.x > bounds.right + 360){
          this.shouldRemove=true;
        }
      }
    }else if(this.state==='splat'){
      this.zOrder=this.groundY;
      if(this.currentAnimation?.done || !this.splatFrames.length){
        this.shouldRemove=true;
      }
    }
  }
  triggerImpact({ impactY=null, removeInstantly=false }={}){
    if(typeof impactY === 'number') this.position.y = impactY;
    this.velocity.x=0;
    this.velocity.y=0;
    if(!this.playedSplat){
      playAudio(game.audio?.mutantSplat);
      this.playedSplat=true;
    }
    if(removeInstantly || !this.splatFrames.length){
      this.shouldRemove=true;
      return;
    }
    if(typeof impactY === 'number') this.groundY=impactY;
    if(this.state!=='splat'){
      this.setState('splat');
    }
  }
  checkCollision(player){
    if(!player || this.shouldRemove || this.state!=='drop') return;
    const playerWidth=Math.max(60, player.width ?? 90);
    const playerHeight=Math.max(110, player.height ?? 170);
    const dx=Math.abs(player.position.x - this.position.x);
    const playerCenterY=player.position.y - playerHeight*0.5;
    const ballCenterY=this.position.y - Math.max(20, (this.height ?? 70)*0.3);
    const dy=Math.abs(playerCenterY - ballCenterY);
    const reachX=(playerWidth*0.5) + Math.max(26, (this.width ?? 60)*0.4);
    const reachY=(playerHeight*0.5) + Math.max(26, (this.height ?? 60)*0.45);
    if(dx <= reachX && dy <= reachY){
      player.receiveDamage(this.damage, this.position.x);
      const impactY=Math.min(player.position.y - playerHeight*0.35, this.groundY);
      this.triggerImpact({ impactY, removeInstantly:false });
    }
  }
  receiveDamage(amount, sourceX, context={}){
    if(this.shouldRemove) return false;
    const type=context.type ?? context.source ?? 'normal';
    if(type==='melee' || context.isSpecial || type==='projectile' || type==='burst'){
      this.triggerImpact({ impactY:this.position.y, removeInstantly:false });
      return true;
    }
    return false;
  }
  drawShadow(ctx, cameraX){
    if(!ctx) return;
    if(!this.width || !this.height) this.refreshMetrics();
    const groundY=this.groundY ?? this.position.y;
    const heightAbove=Math.max(0, groundY - Math.min(this.position.y, groundY));
    const baseHeight=Math.max(1, this.startHeight);
    const progress=clamp(1 - heightAbove / baseHeight, 0, 1);
    const bodyWidth=this.width ?? 60;
    const minWidth=Math.max(22, bodyWidth * 0.32);
    const maxWidth=Math.max(minWidth * 2.2, bodyWidth * 0.9);
    const shadowWidth=minWidth + (maxWidth - minWidth) * progress;
    const shadowHeight=Math.max(12, shadowWidth * 0.42);
    const screenX=Math.round(this.position.x - cameraX);
    const screenY=Math.round(groundY - shadowHeight/2);
    ctx.save();
    ctx.globalAlpha=0.5;
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY, shadowWidth/2, shadowHeight/2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

class BossMutant extends Entity {
  constructor(config){
    super(config.spawnX, config.spawnY);
    this.assets=config.assets;
    this.world=config.world;
    const base=config.baseScale ?? computeScale(this.assets.idle[0], config.targetHeight ?? 310);
    this.baseScale = base * (config.scaleMultiplier ?? 1.25);
    this.maxHp=config.maxHp ?? 420; this.hp=this.maxHp;
    this.countsTowardKill=false;
    this.isBoss=true;
    this.shouldRemove=false;
    this.dying=false;
    this.vulnerable=false;
    this.damageFlashTimer=0;
    this.loopTimer=0;
    this.idleDelay=config.idleDelay ?? 2.4;
    this.currentIdleDelay=this.idleDelay;
    this.recoveryDelay=config.recoveryDelay ?? 1.6;
    this.onDefeated=config.onDefeated ?? null;
    this.mudballFrames=config.mudballFrames;
    this.mudballSplatFrames=config.mudballSplatFrames ?? null;
    this.spawnHandOffset=config.spawnHandOffset ?? {x:-110, y:-220};
    this.nativeFacing='left';
    this.facing=-1;
    this.mudballPush1=false;
    this.mudballPush2=false;
    this.pendingMudballSpawns=[];
    this.spawnedMudballVolley=false;
    this.contactDamage=config.contactDamage ?? 20;
    this.contactCooldown=0;
    this.chipDamageMin=config.chipDamageMin ?? 3;
    this.chipDamageMax=config.chipDamageMax ?? 6;
    if(this.chipDamageMax<this.chipDamageMin) this.chipDamageMax=this.chipDamageMin;
    this.specialLaserDamage=config.specialLaserDamage ?? 5;
    const collisionConfig=config.collision ?? {};
    this.collision={
      widthFactor: collisionConfig.widthFactor ?? 0.48,
      heightFactor: collisionConfig.heightFactor ?? 0.85,
      offsetXFactor: collisionConfig.offsetXFactor ?? 0.08,
      offsetYFactor: collisionConfig.offsetYFactor ?? 0.02
    };

    this.setAnimations({
      idle: ()=>new Animation(this.assets.idle, 0.12),
      windup: ()=>new Animation(this.assets.blast.slice(0, 19), 0.08, {loop:false}),
      barrage: ()=>new Animation(this.assets.blast.slice(19), 0.09, {loop:true}),
      defeated: ()=>new Animation([this.assets.damage], 0.2, {loop:false})
    });
    this.setState('idle');
  }
  update(dt, world, player){
    if(this.shouldRemove) return;
    if(this.invulnerableTimer>0) this.invulnerableTimer=Math.max(0, this.invulnerableTimer - dt);
    if(this.damageFlashTimer>0) this.damageFlashTimer=Math.max(0, this.damageFlashTimer - dt);
    if(this.contactCooldown>0) this.contactCooldown=Math.max(0, this.contactCooldown - dt);
    this.velocity.x=0; this.velocity.y=0;
    super.update(dt);
    this.position.x = clamp(this.position.x, world.bounds.right - 120, world.bounds.right - 60);
    this.handlePlayerCollision(player);
    this.updatePendingMudballSpawns(dt, player);
    switch(this.state){
      case 'idle':
        this.currentIdleDelay-=dt;
        if(this.currentIdleDelay<=0) this.beginAttack();
        break;
      case 'windup':
        this.handleWindupEvents(player);
        if(this.currentAnimation?.done) this.enterBarrage();
        break;
      case 'barrage':
        this.loopTimer=Math.max(0, this.loopTimer - dt);
        if(this.loopTimer<=0) this.finishBarrage();
        break;
      case 'defeated':
        if(this.currentAnimation?.done) this.shouldRemove=true;
        break;
      default: break;
    }
  }
  beginAttack(){
    this.mudballPush1=false;
    this.mudballPush2=false;
    this.spawnedMudballVolley=false;
    this.pendingMudballSpawns.length=0;
    this.setState('windup');
  }
  handleWindupEvents(player){
    const anim=this.currentAnimation; if(!anim) return;
    const idx=anim.index;
    if(!this.mudballPush1 && idx>=10){
      this.mudballPush1=true;
      this.applyMudballShockwave(player, this.world, 1);
    }
    if(!this.spawnedMudballVolley && idx>=11){
      this.spawnedMudballVolley=true;
      this.queueMudballVolley(player);
    }
    if(!this.mudballPush2 && idx>=16){
      this.mudballPush2=true;
      this.applyMudballShockwave(player, this.world, 1.2);
    }
  }
  queueMudballVolley(player){
    const baseGravity=880;
    const baseTerminal=520;
    const baseDelay=0.5;
    const patterns=[
      { delay:0, offsetX:-90, gravityScale:0.9, terminalScale:0.92, horizontalVelocity:-74 },
      { delay:0.75, offsetX:-44, gravityScale:0.96, terminalScale:0.98, horizontalVelocity:-42 },
      { delay:1.45, offsetX:-8, gravityScale:1, terminalScale:1.02, horizontalVelocity:-14 },
      { delay:2.1, offsetX:24, gravityScale:1.05, terminalScale:1.06, horizontalVelocity:12 },
      { delay:2.7, offsetX:56, gravityScale:1.1, terminalScale:1.12, horizontalVelocity:28 },
      { delay:3.25, offsetX:92, gravityScale:1.16, terminalScale:1.18, horizontalVelocity:46 }
    ];
    for(const pattern of patterns){
      this.pendingMudballSpawns.push({
        timer: baseDelay + pattern.delay,
        offsetX: pattern.offsetX,
        gravity: baseGravity * pattern.gravityScale,
        maxFallSpeed: baseTerminal * pattern.terminalScale,
        horizontalVelocity: pattern.horizontalVelocity
      });
    }
  }
  updatePendingMudballSpawns(dt, player){
    if(!this.pendingMudballSpawns.length) return;
    const remaining=[];
    for(const spawn of this.pendingMudballSpawns){
      spawn.timer-=dt;
      if(spawn.timer<=0){
        this.spawnMudball(player, spawn);
      }else{
        remaining.push(spawn);
      }
    }
    this.pendingMudballSpawns=remaining;
  }
  applyMudballShockwave(player, world, intensity=1){
    if(!player || !player.isAlive?.()) return;
    const range=260;
    const vertical=140;
    if(player.position.x >= this.position.x) return;
    const dx=this.position.x - player.position.x;
    if(dx>range) return;
    if(Math.abs(player.position.y - this.position.y)>vertical) return;
    const collision=this.getCollisionBounds();
    const width=collision?.width ?? this.width ?? 240;
    const desiredDisplacement=-Math.abs(width * 2 * intensity);
    const clampLeft=(world?.bounds?.left ?? 0) + Math.max(40, width * 0.25);
    const targetX=Math.max(clampLeft, player.position.x + desiredDisplacement);
    const displacement = targetX - player.position.x;
    if(Math.abs(displacement)<0.5) return;
    const duration = clamp(0.38 + 0.12 * intensity, 0.3, 0.75);
    const initialVelocity = (2 * displacement) / duration;
    if(typeof player.applyKnockback === 'function'){
      player.applyKnockback(initialVelocity, duration);
    }else{
      player.velocity.x = initialVelocity;
    }
  }
  spawnMudball(player, config={}){
    if(!this.world || !Array.isArray(this.mudballFrames)) return;
    const target=(player && player.isAlive?.()) ? player : this.world.player;
    const bounds=this.world?.bounds ?? { left:0, right:CANVAS_WIDTH };
    const padding=90;
    const baseX=target?.position?.x ?? (this.position.x - 160);
    const jitter=(config.positionJitter ?? 42) * (Math.random()-0.5);
    const spawnX=clamp(baseX + (config.offsetX ?? 0) + jitter, bounds.left + padding, bounds.right - padding);
    const playerY=target?.position?.y ?? FLOOR_Y;
    const verticalOffset = (CANVAS_HEIGHT * 0.85) + 160 + Math.random()*90;
    const spawnY=Math.min(this.position.y - 140, playerY - verticalOffset);
    const groundY=FLOOR_Y - 6;
    const ball=new Mudball({
      spawnX,
      spawnY,
      frames:this.mudballFrames,
      splatFrames:this.mudballSplatFrames,
      targetHeight:110,
      damage:config.damage ?? 24,
      gravity:config.gravity ?? 900,
      maxFallSpeed:config.maxFallSpeed ?? 560,
      horizontalVelocity:config.horizontalVelocity ?? 0,
      groundY
    });
    this.world.addMudball(ball);
    if(this.world) this.world.triggerShake(0.18, 3.2);
  }
  enterBarrage(){
    this.vulnerable=true;
    this.loopTimer=5;
    this.setState('barrage');
    if(this.currentAnimation) this.currentAnimation.reset();
  }
  finishBarrage(){
    this.vulnerable=false;
    this.currentIdleDelay=this.idleDelay + this.recoveryDelay;
    this.setState('idle');
  }
  getCollisionBounds(){
    const frame=this.currentAnimation?.frame ?? this.assets.idle?.[0];
    const frameWidth=frame?.width ?? 1;
    const frameHeight=frame?.height ?? 1;
    const scale=this.baseScale;
    const w=frameWidth*scale;
    const h=frameHeight*scale;
    const width=Math.max(12, w*(this.collision.widthFactor ?? 0.5));
    const height=Math.max(12, h*(this.collision.heightFactor ?? 0.8));
    const offsetX=w*(this.collision.offsetXFactor ?? 0);
    const offsetY=h*(this.collision.offsetYFactor ?? 0);
    const centerX=this.position.x + offsetX;
    const bottom=this.position.y - offsetY;
    const top=bottom - height;
    return {
      left: centerX - width/2,
      right: centerX + width/2,
      top,
      bottom,
      width,
      height,
      centerX
    };
  }
  handlePlayerCollision(player){
    if(!player || !player.isAlive()) return;
    const rect=this.getCollisionBounds();
    if(!rect) return;
    const playerWidth=Math.max(10, player.width ?? 90);
    const playerHeight=Math.max(10, player.height ?? 160);
    const playerLeft=player.position.x - playerWidth*0.5;
    const playerRight=player.position.x + playerWidth*0.5;
    const playerTop=player.position.y - playerHeight;
    const playerBottom=player.position.y;
    const overlapX=Math.min(playerRight, rect.right) - Math.max(playerLeft, rect.left);
    const overlapY=Math.min(playerBottom, rect.bottom) - Math.max(playerTop, rect.top);
    if(overlapX>0 && overlapY>0){
      if(this.contactCooldown<=0){
        const hit=player.receiveDamage(this.contactDamage, this.position.x);
        this.contactCooldown = hit ? 0.9 : 0.2;
      }
    }
  }
  receiveDamage(amount, sourceX, context={}){
    if(this.shouldRemove || this.dying) return false;
    if(this.invulnerableTimer>0) return false;
    const type=context.type ?? context.source ?? 'normal';
    const isSpecial=context.isSpecial ?? false;
    const chipActive = type==='melee' && !this.vulnerable && !isSpecial;
    let applied=amount;
    if(isSpecial){
      if(type==='burst') applied=Math.max(applied, 80);
      else if(type==='laser') applied=this.specialLaserDamage;
      else if(type==='mutation_melee') applied=Math.max(applied, amount*1.4);
      else applied=Math.max(applied, amount*1.25);
    }else if(type==='melee'){
      if(chipActive){
        const chipBase = amount*0.1;
        applied = clamp(chipBase, this.chipDamageMin, this.chipDamageMax);
      }else{
        const scaled = amount*0.2;
        applied = clamp(scaled, 3, 6);
      }
    }
    this.hp=Math.max(0, this.hp - applied);
    this.damageFlashTimer=0.32;
    const invul = isSpecial ? 0.45 : (chipActive ? 0.25 : 0.35);
    this.invulnerableTimer=invul;
    if(this.hp<=0){ this.beginDefeat(); }
    return true;
  }
  applySpecialDamage(kind, sourceX){
    const mapping={
      burst:80,
      laser:this.specialLaserDamage,
      mutation_melee:46
    };
    return this.receiveDamage(mapping[kind] ?? 36, sourceX, { isSpecial:true, type:kind });
  }
  beginDefeat(){
    if(this.dying) return;
    this.dying=true;
    this.vulnerable=false;
    this.setState('defeated');
    if(typeof this.onDefeated === 'function') this.onDefeated(this);
  }
  draw(ctx, cameraX){
    const frame=(this.damageFlashTimer>0 && this.assets.damage) ? this.assets.damage : this.currentAnimation?.frame;
    if(!frame) return;
    const scale=this.baseScale;
    const w=frame.width*scale, h=frame.height*scale;
    this.width=w; this.height=h;
    const drawX=Math.round(this.position.x - cameraX - w/2);
    const drawY=Math.round(this.position.y - h);
    ctx.save();
    ctx.translate(drawX + w/2, 0);
    const orientationMultiplier = this.nativeFacing==='left' ? -1 : 1;
    ctx.scale(this.facing*orientationMultiplier, 1);
    ctx.drawImage(frame, -w/2, drawY, w, h);
    ctx.restore();
  }
}

/** World */
class GameWorld {
  constructor(assets, options={}){
    this.assets=assets;
    this.walkMask=assets.walkMask ?? null;
    this.bounds={ left:100, right: assets.background.width - 100 };
    this.cameraX=0; this.entities=[]; this.player=null; this.enemies=[];
    this.spawnTimer=0.8; this.spawnInterval=3.2; this.maxEnemies=5;
    this.spawnEnabled=true;
    this.defeatedCount=0;
    this.defeatedTarget=options.defeatedTarget ?? 30;
    this.encounterPhase='normal';
    this.boss=null;
    this.mudballs=new Set();
    this.shake={ timer:0, duration:0, magnitude:0, offsetX:0, offsetY:0 };
    this.backgroundScale = CANVAS_HEIGHT / assets.background.height;
    this.backgroundWidth = assets.background.width * this.backgroundScale;
    this.onLevelComplete = options.onLevelComplete ?? null;
    this.victorySequenceDefaultDuration = options.victoryDuration ?? 4.2;
    this.victorySequence = {
      active:false,
      timer:0,
      duration:this.victorySequenceDefaultDuration,
      origin:null,
      notified:false
    };
  }
  getActiveEnemyCount(){
    return this.enemies.filter(e=>
      e &&
      !e.shouldRemove &&
      !e.dying &&
      !e.isBoss &&
      !e.isMudball &&
      e.countsTowardKill
    ).length;
  }
  computeNextSpawnDelay(){
    const active=this.getActiveEnemyCount();
    const deficit=Math.max(0, this.maxEnemies - active);
    if(deficit>=3) return 0.7 + Math.random()*0.5;
    if(deficit===2) return 1 + Math.random()*0.7;
    if(deficit===1) return 1.4 + Math.random()*0.9;
    return 2 + Math.random()*1.5;
  }
  setPlayer(p){
    this.player=p;
    this.entities.push(p);
    this.snapEntityToWalkMask(p);
  }
  spawnEnemy(){
    if(!this.player || !this.spawnEnabled) return;
    const keys=Object.keys(this.assets.enemies);
    const key=keys[Math.floor(Math.random()*keys.length)];
    const assets=this.assets.enemies[key];
    const playerX=this.player.position.x;
    let leftCount=0, rightCount=0;
    for(const e of this.enemies){
      if(!e || e.shouldRemove || e.isBoss || !e.countsTowardKill) continue;
      if(e.position.x < playerX) leftCount++; else rightCount++;
    }
    let spawnSide = Math.random()<0.5 ? 1 : -1;
    if(leftCount===0 && rightCount>0) spawnSide=-1;
    else if(rightCount===0 && leftCount>0) spawnSide=1;
    const spawnDistance=460 + Math.random()*180;
    let spawnX=playerX + spawnSide*spawnDistance;
    const minSpacing=140;
    let adjustAttempts=0;
    const clampSpawn=(x)=>clamp(x, this.bounds.left+80, this.bounds.right-80);
    spawnX=clampSpawn(spawnX);
    while(adjustAttempts<8){
      const overlap=this.enemies.some(e=>
        e &&
        !e.shouldRemove &&
        !e.isBoss &&
        e.countsTowardKill &&
        Math.abs(e.position.x - spawnX) < minSpacing
      );
      if(!overlap) break;
      spawnX += spawnSide * (minSpacing + 32);
      spawnX=clampSpawn(spawnX);
      if(Math.sign(spawnX - playerX)!==spawnSide){
        spawnX = clampSpawn(playerX + spawnSide * (minSpacing * (adjustAttempts+2)));
      }
      adjustAttempts+=1;
    }
    const enemyBaseScale = computeScale(assets.walk[0], ENEMY_HEIGHT + Math.random()*12);
    const mult = SCALE_OVERRIDES.enemies[key] ?? 1;
    const difficultyTable=[
      { label:'grunt', speed:0.9, depth:0.92, attack:0.9, hp:0.85, cooldown:1.2, variance:0.45 },
      { label:'fighter', speed:1, depth:1, attack:1, hp:1, cooldown:0.95, variance:0.35 },
      { label:'enforcer', speed:1.22, depth:1.08, attack:1.35, hp:1.4, cooldown:0.75, variance:0.28 }
    ];
    const roll=Math.random();
    const difficultyTier = roll<0.35 ? 0 : (roll<0.75 ? 1 : 2);
    const difficulty = difficultyTable[difficultyTier];
    const baseSpeed = 95 + Math.random()*35;
    const baseDepthSpeed = 110 + Math.random()*28;
    const baseAttackDamage = 9 + Math.random()*7;
    const baseHp = 58 + Math.random()*20;
    const baseAttackRange = 52 + Math.random()*8;
    const config={
      assets,
      spawnX,
      spawnY: FLOOR_Y - 40 - Math.random()*90,
      speed: Math.max(70, baseSpeed * difficulty.speed),
      depthSpeed: Math.max(70, baseDepthSpeed * difficulty.depth),
      attackRange: Math.round(baseAttackRange * difficulty.depth),
      attackDamage: Math.max(6, Math.round(baseAttackDamage * difficulty.attack)),
      maxHp: Math.max(40, Math.round(baseHp * difficulty.hp)),
      baseScale: enemyBaseScale * mult,
      nativeFacing: assets.nativeFacing ?? 'right',
      initialFacing: (assets.nativeFacing ?? 'right') === 'left' ? -1 : 1,
      explode: assets.explode,
      onDefeated: (enemy)=>this.handleEnemyDefeated(enemy),
      enemyKey: key,
      difficultyTier,
      difficultyLabel: difficulty.label,
      attackCooldownBase: Math.max(0.55, difficulty.cooldown),
      attackCooldownVariance: Math.max(0.15, difficulty.variance),
      aggression: difficulty.attack
    };
    const e=new Enemy(config); this.enemies.push(e); this.entities.push(e); this.snapEntityToWalkMask(e);
  }
  update(dt){
    if(!this.player) return;
    const prevPlayerX=this.player.position.x;
    const prevPlayerY=this.player.position.y;
    this.player.updateGameplay(dt, input, this, this.enemies);
    this.enforceWalkMask(this.player, prevPlayerX, prevPlayerY);
    for(const e of this.enemies){
      const prevX=e.position.x;
      const prevY=e.position.y;
      e.update(dt, this, this.player);
      this.enforceWalkMask(e, prevX, prevY);
    }
    this.enemies = this.enemies.filter(e=>!e.shouldRemove);
    for(const ball of [...this.mudballs]){ if(ball.shouldRemove) this.mudballs.delete(ball); }
    if(this.boss && this.boss.shouldRemove) this.boss=null;
    this.updateCamera();
    if(!this.victorySequence.active){
      this.handleSpawning(dt);
      this.handleEncounterProgress();
    }else{
      this.spawnEnabled=false;
    }
    this.updateVictorySequence(dt);
    this.updateShake(dt);
  }
  addMudball(ball){
    if(!ball) return;
    this.mudballs.add(ball);
    this.enemies.push(ball);
  }
  handleEnemyDefeated(enemy){
    if(!enemy || !enemy.countsTowardKill) return;
    this.defeatedCount+=1;
    if(this.defeatedCount>=this.defeatedTarget) this.startBossEvac();
  }
  beginVictorySequence(boss){
    if(this.victorySequence.active) return;
    this.spawnEnabled=false;
    const originX = boss?.position?.x ?? this.player?.position?.x ?? (this.bounds.right - 80);
    const originY = boss?.position?.y ?? this.player?.position?.y ?? FLOOR_Y;
    this.victorySequence = {
      active:true,
      timer:0,
      duration:this.victorySequenceDefaultDuration,
      origin:{ x: originX, y: originY },
      notified:false
    };
    if(this.player){
      this.player.velocity.x=0;
      this.player.velocity.y=0;
      if(this.player.hurtTimer<=0) this.player.setState('idle');
      if(this.player.type==='boner') this.player.stopLaserLoop();
    }
    for(const enemy of this.enemies){
      if(enemy && enemy!==boss && enemy.isAlive && !enemy.isBoss){
        if(typeof enemy.startExit==='function') enemy.startExit();
        enemy.shouldRemove=true;
      }
    }
    for(const ball of this.mudballs){
      if(ball) ball.shouldRemove=true;
    }
    this.triggerShake(2.6, 14);
    playAudio(game.audio?.mutantRumble);
  }
  startBossEvac(){
    if(this.encounterPhase!=='normal'){
      this.spawnEnabled=false;
      return;
    }
    this.encounterPhase='evacuate';
    this.spawnEnabled=false;
    this.spawnTimer=Number.POSITIVE_INFINITY;
    for(const enemy of this.enemies){
      if(enemy && !enemy.isBoss && enemy.countsTowardKill && typeof enemy.startExit === 'function'){
        enemy.startExit();
      }
    }
  }
  startBossIntro(){
    if(this.encounterPhase==='bossFight' || this.boss) return;
    if(!this.assets.boss?.mutant) return;
    this.encounterPhase='bossFight';
    this.spawnBoss();
  }
  spawnBoss(){
    if(this.boss || !this.assets.boss?.mutant) return;
    const spawnX=this.bounds.right - 80;
    const spawnY=FLOOR_Y - 10;
    const boss=new BossMutant({
      assets:this.assets.boss.mutant,
      world:this,
      spawnX,
      spawnY,
      mudballFrames:this.assets.boss.mutant.mudball,
      mudballSplatFrames:this.assets.boss.mutant.mudballSplat,
      scaleMultiplier:1.25,
      contactDamage:24,
      collision:{
        widthFactor:0.46,
        heightFactor:0.88,
        offsetXFactor:0.1,
        offsetYFactor:0.02
      },
      onDefeated:(mutant)=>this.handleBossDefeated(mutant)
    });
    this.boss=boss;
    this.enemies.push(boss);
    this.snapEntityToWalkMask(boss);
    this.triggerShake(2.5, 11);
    playAudio(game.audio?.mutantRumble);
  }
  handleBossDefeated(boss){
    this.encounterPhase='cleared';
    this.beginVictorySequence(boss);
  }
  maskCoordsFromWorld(x, y){
    const mask=this.walkMask;
    if(!mask) return { x, y };
    const mx=clamp(Math.round(x), 0, mask.width-1);
    const my=clamp(Math.round(y / this.backgroundScale), 0, mask.height-1);
    return { x:mx, y:my };
  }
  worldCoordsFromMask(mx, my){
    if(!this.walkMask) return { x:mx, y:my };
    return {
      x:clamp(mx, 0, this.walkMask.width-1),
      y:clamp(my, 0, this.walkMask.height-1) * this.backgroundScale
    };
  }
  isMaskWalkable(mx, my){
    const mask=this.walkMask;
    if(!mask) return true;
    if(mx<0 || my<0 || mx>=mask.width || my>=mask.height) return false;
    return mask.data[my*mask.width + mx]===1;
  }
  findNearestWalkableMask(mx, my, maxRadius=48){
    const mask=this.walkMask;
    if(!mask) return { x:mx, y:my };
    const ix=clamp(mx, 0, mask.width-1);
    const iy=clamp(my, 0, mask.height-1);
    if(this.isMaskWalkable(ix, iy)) return { x:ix, y:iy };
    for(let r=1; r<=maxRadius; r++){
      for(let dy=-r; dy<=r; dy++){
        for(let dx=-r; dx<=r; dx++){
          if(Math.max(Math.abs(dx), Math.abs(dy))!==r) continue;
          const nx=ix+dx;
          const ny=iy+dy;
          if(this.isMaskWalkable(nx, ny)) return { x:nx, y:ny };
        }
      }
    }
    return null;
  }
  findDirectionalWalkableMask(prevX, prevY, targetX, targetY, maxRadius=40){
    const mask=this.walkMask;
    if(!mask) return null;
    const targetMask=this.maskCoordsFromWorld(targetX, targetY);
    const desiredDX=targetX - prevX;
    const desiredDY=targetY - prevY;
    const desiredLen=Math.hypot(desiredDX, desiredDY);
    let best=null;
    let bestScore=Number.POSITIVE_INFINITY;
    for(let r=0; r<=maxRadius; r++){
      for(let dy=-r; dy<=r; dy++){
        for(let dx=-r; dx<=r; dx++){
          if(r>0 && Math.max(Math.abs(dx), Math.abs(dy))!==r) continue;
          const mx=targetMask.x + dx;
          const my=targetMask.y + dy;
          if(!this.isMaskWalkable(mx, my)) continue;
          const world=this.worldCoordsFromMask(mx, my);
          const diffX=world.x - targetX;
          const diffY=world.y - targetY;
          let score=diffX*diffX + diffY*diffY;
          if(desiredLen>0){
            const progress=((world.x - prevX)*desiredDX + (world.y - prevY)*desiredDY)/desiredLen;
            if(progress < -2){
              score += 10000;
            }else if(progress < 0){
              score += Math.abs(progress) * 400;
            }else{
              score -= Math.min(progress, desiredLen) * 12;
            }
          }
          if(!best || score<bestScore){
            best={ x:mx, y:my, world };
            bestScore=score;
          }
        }
      }
      if(best && bestScore<=4) break;
    }
    return best;
  }
  snapEntityToWalkMask(entity){
    if(!entity || entity.isMudball || entity.exiting) return;
    if(!this.walkMask){
      entity._lastSafeMask=this.maskCoordsFromWorld(entity.position.x, entity.position.y);
      return;
    }
    const maskPos=this.maskCoordsFromWorld(entity.position.x, entity.position.y);
    const safeMask=this.isMaskWalkable(maskPos.x, maskPos.y)
      ? maskPos
      : this.findNearestWalkableMask(maskPos.x, maskPos.y, 96);
    if(safeMask){
      const world=this.worldCoordsFromMask(safeMask.x, safeMask.y);
      entity.position.x=world.x;
      entity.position.y=world.y;
      entity._lastSafeMask={ ...safeMask };
    }else{
      entity._lastSafeMask={ ...maskPos };
    }
  }
  enforceWalkMask(entity, prevX, prevY){
    if(!entity || entity.isMudball || entity.exiting) return;
    if(!this.walkMask){
      entity._lastSafeMask=this.maskCoordsFromWorld(entity.position.x, entity.position.y);
      return;
    }
    const currentMask=this.maskCoordsFromWorld(entity.position.x, entity.position.y);
    if(this.isMaskWalkable(currentMask.x, currentMask.y)){
      entity._lastSafeMask={ ...currentMask };
      return;
    }
    const directional=this.findDirectionalWalkableMask(prevX, prevY, entity.position.x, entity.position.y, 48);
    if(directional){
      entity.position.x=directional.world.x;
      entity.position.y=directional.world.y;
      const moveDX=entity.position.x - prevX;
      const moveDY=entity.position.y - prevY;
      const moveLen=Math.hypot(moveDX, moveDY);
      if(moveLen>0){
        const currentVx=entity.velocity.x;
        const currentVy=entity.velocity.y;
        const dot=(currentVx*moveDX + currentVy*moveDY)/(moveLen*moveLen);
        const projected=Math.max(0, dot);
        entity.velocity.x=moveDX * projected;
        entity.velocity.y=moveDY * projected;
        const maxSpeed=Math.max(
          entity.speed ?? 0,
          entity.depthSpeed ?? 0,
          Math.hypot(currentVx, currentVy)
        );
        const mag=Math.hypot(entity.velocity.x, entity.velocity.y);
        if(maxSpeed>0 && mag>maxSpeed){
          const scale=maxSpeed/mag;
          entity.velocity.x*=scale;
          entity.velocity.y*=scale;
        }
      }
      entity._lastSafeMask={ x:directional.x, y:directional.y };
      return;
    }
    const fallbackMask=this.findNearestWalkableMask(currentMask.x, currentMask.y, 64)
      || entity._lastSafeMask
      || this.maskCoordsFromWorld(prevX, prevY);
    if(fallbackMask){
      const world=this.worldCoordsFromMask(fallbackMask.x, fallbackMask.y);
      entity.position.x=world.x;
      entity.position.y=world.y;
      entity.velocity.x=0;
      entity.velocity.y=0;
      entity._lastSafeMask={ x:fallbackMask.x, y:fallbackMask.y };
    }
  }
  updateCamera(){
    if(!this.player) return;
    const half=CANVAS_WIDTH/2;
    const maxCam=this.assets.background.width*this.backgroundScale - CANVAS_WIDTH;
    this.cameraX = clamp(this.player.position.x * this.backgroundScale - half, 0, maxCam);
  }
  handleSpawning(dt){
    if(!this.spawnEnabled) return;
    this.spawnTimer-=dt;
    let guard=0;
    while(this.spawnTimer<=0 && guard<5){
      if(this.getActiveEnemyCount()>=this.maxEnemies){
        this.spawnTimer=this.computeNextSpawnDelay();
        break;
      }
      this.spawnEnemy();
      this.spawnTimer+=this.computeNextSpawnDelay();
      guard+=1;
    }
    if(this.spawnTimer<=0){
      this.spawnTimer=this.computeNextSpawnDelay();
    }
  }
  handleEncounterProgress(){
    if(this.victorySequence.active) return;
    if(this.encounterPhase==='evacuate'){
      const remaining=this.enemies.filter(e=>e && e.countsTowardKill && !e.shouldRemove && !e.isBoss);
      if(remaining.length===0) this.startBossIntro();
    }
  }
  triggerShake(duration, magnitude=6){
    this.shake.duration=Math.max(this.shake.duration, duration);
    this.shake.timer=Math.max(this.shake.timer, duration);
    this.shake.magnitude=Math.max(this.shake.magnitude, magnitude);
  }
  updateVictorySequence(dt){
    if(!this.victorySequence.active) return;
    const seq=this.victorySequence;
    seq.timer+=dt;
    const progress=clamp(seq.timer/seq.duration, 0, 1);
    if(this.player){
      this.player.velocity.x=0;
      this.player.velocity.y=0;
    }
    if(progress<1){
      const wave=Math.sin(progress*Math.PI);
      const magnitude=8 + 14*Math.max(0, wave);
      this.triggerShake(0.08, magnitude);
    }
    if(seq.timer>=seq.duration && !seq.notified){
      seq.notified=true;
      if(typeof this.onLevelComplete==='function') this.onLevelComplete();
    }
  }
  updateShake(dt){
    if(this.shake.timer>0){
      this.shake.timer=Math.max(0, this.shake.timer - dt);
      const progress=this.shake.duration>0 ? this.shake.timer/this.shake.duration : 0;
      const intensity=this.shake.magnitude * progress;
      this.shake.offsetX=(Math.random()*2-1)*intensity;
      this.shake.offsetY=(Math.random()*2-1)*intensity*0.6;
      if(this.shake.timer===0){
        this.shake.duration=0;
        this.shake.magnitude=0;
        this.shake.offsetX=0;
        this.shake.offsetY=0;
      }
    }else{
      this.shake.offsetX=0;
      this.shake.offsetY=0;
    }
  }
  draw(ctx){
    ctx.save();
    ctx.translate(this.shake.offsetX ?? 0, this.shake.offsetY ?? 0);
    this.drawBackground(ctx);
    const camWorld=this.cameraX / this.backgroundScale;
    const sorted=[...this.enemies, this.player].filter(Boolean).sort((a,b)=>a.zOrder - b.zOrder);
    for(const e of sorted) e.drawShadow(ctx, camWorld);
    for(const e of sorted) e.draw(ctx, camWorld);
    ctx.restore();
    this.drawVictoryOverlay(ctx);
  }
  drawVictoryOverlay(ctx){
    if(!this.victorySequence.active) return;
    const seq=this.victorySequence;
    const progress=clamp(seq.timer/seq.duration, 0, 1);
    const eased=progress*progress*(3 - 2*progress);
    const camWorld=this.cameraX / this.backgroundScale;
    const baseOrigin=seq.origin ?? this.player?.position ?? { x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2 };
    let originX=(baseOrigin.x - camWorld) + (this.shake.offsetX ?? 0);
    let originY=(baseOrigin.y) + (this.shake.offsetY ?? 0) - 140;
    const maxRadius=Math.sqrt(CANVAS_WIDTH*CANVAS_WIDTH + CANVAS_HEIGHT*CANVAS_HEIGHT) + 220;
    const radius=140 + eased * maxRadius;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const glow=ctx.createRadialGradient(originX, originY, Math.max(1, radius*0.18), originX, originY, radius);
    glow.addColorStop(0, `rgba(255,255,235,${0.88})`);
    glow.addColorStop(0.35, `rgba(255,220,160,${0.68})`);
    glow.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    ctx.restore();
    const fade=Math.max(0, Math.min(1, (seq.timer - seq.duration*0.6)/(seq.duration*0.4)));
    if(fade>0){
      ctx.save();
      ctx.fillStyle=`rgba(255,255,255,${fade})`;
      ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
      ctx.restore();
    }
  }
  drawBackground(ctx){
    const scaledCamera=this.cameraX;
    ctx.drawImage(
      this.assets.background,
      scaledCamera / this.backgroundScale,
      0,
      CANVAS_WIDTH / this.backgroundScale,
      this.assets.background.height,
      0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
    );
  }
}

/** Game state */
const game = {
  state: GAME_STATES.LOADING,
  assets: null,
  audio: null,
  world: null,
  settings: { audio: { ...storedAudioSettings } },
  session: { characterKey:null },
  pause: null,
  title: { timer: 0, flashTimer: 0, lightPhase: 0, beamPhase: Math.random() * Math.PI * 2 },
  menu: { options: [], selectedIndex: 0, blinkTimer: 0, section:'characters', volumeIndex:0, sparkTimer:0, gridPhase:0 },
  loading: { progress: 0 }
};

const initTitle = () => {
  game.title.timer = 0;
  game.title.flashTimer = 0;
  game.title.lightPhase = Math.random() * Math.PI * 2;
  game.title.beamPhase = Math.random() * Math.PI * 2;
  if (game.audio) {
    game.audio.menuMusicPlaying = false;
  }
};

const initMenu = () => {
  game.menu.options = [
    { key: 'corky', label: 'Corky', assets: game.assets.players.corky },
    { key: 'boner', label: 'Boiner', assets: game.assets.players.boner }
  ];
  game.menu.selectedIndex=0; game.menu.blinkTimer=0; game.menu.gridPhase=0; game.menu.sparkTimer=0;
  game.menu.section='characters';
  game.menu.volumeIndex=0;
  game.menu.decals = Array.from({ length: 16 }, () => ({
    x: Math.random(),
    y: Math.random(),
    w: 0.12 + Math.random() * 0.22,
    h: 0.03 + Math.random() * 0.09,
    tilt: (Math.random() - 0.5) * 1.1,
    tint: Math.random() < 0.5 ? 'rgba(255, 110, 246, 0.28)' : 'rgba(120, 240, 255, 0.28)'
  }));
  if(game.audio){
    game.audio.menuMusicPlaying=false;
  }
};

const updateTitle = (dt) => {
  game.title.timer += dt;
  game.title.flashTimer += dt;
  game.title.lightPhase = (game.title.lightPhase + dt * 0.75) % (Math.PI * 2);
  game.title.beamPhase = (game.title.beamPhase + dt * 0.45) % (Math.PI * 2);

  if (game.audio?.menuMusic && !game.audio.menuMusicPlaying) {
    setMusic(game.audio.menuMusic);
    game.audio.menuMusicPlaying = true;
  }

  if (game.title.timer > 0.25 && input.wasPressed(INPUT_KEYS.ACCEPT)) {
    playAudio(game.audio?.menuSelect);
    initMenu();
    game.state = GAME_STATES.MENU;
  }
};

const drawTitle = () => {
  const cover = game.assets?.cover ?? game.assets?.background ?? null;
  ctx.fillStyle = '#05060e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (cover) {
    const scale = Math.max(CANVAS_WIDTH / cover.width, CANVAS_HEIGHT / cover.height);
    const w = cover.width * scale;
    const h = cover.height * scale;
    const sway = Math.sin(game.title.lightPhase * 0.45) * 8;
    const ox = (CANVAS_WIDTH - w) / 2 + sway;
    const oy = (CANVAS_HEIGHT - h) / 2;
    ctx.drawImage(cover, ox, oy, w, h);
  }

  ctx.save();
  const vignette = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.25,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.75
  );
  vignette.addColorStop(0, 'rgba(8, 6, 20, 0.0)');
  vignette.addColorStop(1, 'rgba(4, 2, 12, 0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  const cx = CANVAS_WIDTH / 2 + Math.cos(game.title.lightPhase * 0.8) * CANVAS_WIDTH * 0.2;
  const cy = CANVAS_HEIGHT / 2 + Math.sin(game.title.lightPhase * 1.1) * CANVAS_HEIGHT * 0.18;
  const radius = CANVAS_WIDTH * 0.55;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius);
  glow.addColorStop(0, 'rgba(255, 240, 190, 0.55)');
  glow.addColorStop(0.45, 'rgba(255, 120, 220, 0.35)');
  glow.addColorStop(1, 'rgba(40, 60, 160, 0.08)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.rotate(game.title.beamPhase);
  const beamWidth = CANVAS_WIDTH * 1.6;
  const beamGrad = ctx.createLinearGradient(-beamWidth, 0, beamWidth, 0);
  beamGrad.addColorStop(0, 'rgba(20, 60, 160, 0)');
  beamGrad.addColorStop(0.35, 'rgba(255, 120, 180, 0.28)');
  beamGrad.addColorStop(0.5, 'rgba(255, 255, 220, 0.6)');
  beamGrad.addColorStop(0.65, 'rgba(120, 220, 255, 0.36)');
  beamGrad.addColorStop(1, 'rgba(20, 60, 160, 0)');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(-beamWidth, -CANVAS_HEIGHT, beamWidth * 2, CANVAS_HEIGHT * 2);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = '#0d0825';
  const stripeOffset = (game.title.timer * 120) % 4;
  for (let y = stripeOffset; y < CANVAS_HEIGHT; y += 4) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);
  }
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '56px "Press Start 2P", monospace';
  ctx.shadowColor = 'rgba(255, 230, 210, 0.9)';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#fdf3d5';
  ctx.fillText('', CANVAS_WIDTH / 2, 132);
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '18px "Press Start 2P", monospace';
  ctx.fillStyle = 'rgba(214, 237, 255, 0.85)';
  ctx.fillText('THE ULTIMATE CHAOS', CANVAS_WIDTH / 2, 176);
  ctx.restore();

  const flash = 0.55 + 0.45 * Math.sin(game.title.flashTimer * 6);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255, 200, 160, 0.85)';
  ctx.shadowBlur = 20;
  ctx.font = '28px "Press Start 2P", monospace';
  ctx.fillStyle = `rgba(255, 248, 210, ${flash})`;
  ctx.fillText('PRESS START', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 116);
  ctx.font = '18px "Press Start 2P", monospace';
  ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
  ctx.fillText('(ENTER)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 78);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.textAlign = 'center';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillStyle = 'rgba(200, 215, 255, 0.85)';
  ctx.fillText('(C) 2024 HANKYPANK TEAM // BEST EXPERIENCED WITH LIGHTS DOWN LOW', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 32);
  ctx.restore();
};

const startGameWithCharacter = (characterKey) => {
  const world = new GameWorld(game.assets, { onLevelComplete: enterLevel2 });
  const spawnX=200, spawnY=FLOOR_Y - 12;
  game.session.characterKey = characterKey;

  if(characterKey==='corky'){
    const base=computeScale(game.assets.players.corky.walk[0], PLAYER_HEIGHT);
    const mult=SCALE_OVERRIDES.players.corky ?? 1;
    const scale=base*mult;
    const player = new Player({
      type:'corky', name:'Corky', assets:game.assets.players.corky,
      spawnX, spawnY, attackPower:18, hitFrameWindow:{start:2,end:4},
      baseScale:scale, mutationEnabled:true, mutationMode:'burst', mutationLabel:'POWER',
      mutationGainOnHit:12, burstPeakFrame:15, burstRadius:520,
      nativeFacing: game.assets.players.corky.nativeFacing
    });
    world.setPlayer(player);
  } else if (characterKey==='boner'){
    const bonerBase = computeScale(game.assets.players.boner.walk[0], PLAYER_HEIGHT);
    const player = new Player({
      type:'boner', name:'Boiner', assets:game.assets.players.boner,
      spawnX, spawnY, attackPower:16, hitFrameWindow:{start:3,end:5},
      baseScale: bonerBase,
      mutationEnabled:true, mutationMode:'transform', mutationGainOnHit:16,
      bigBonerAssets: game.assets.bigBoner,
      eyeOffset:{x:20, y:80},
      nativeFacing: game.assets.players.boner.nativeFacing,
      bigBonerNativeFacing: game.assets.bigBoner.nativeFacing
    });
    world.setPlayer(player);
  }

  if(game.audio){
    game.audio.menuMusicPlaying=false;
    setMusic(game.audio.gameMusic ?? null);
  }

  world.spawnTimer=2.5;
  game.world=world;
  game.state=GAME_STATES.PLAYING;
};

const updateMenu = (dt) => {
  if(game.audio?.menuMusic && !game.audio.menuMusicPlaying){
    setMusic(game.audio.menuMusic);
    game.audio.menuMusicPlaying=true;
  }
  game.menu.gridPhase=(game.menu.gridPhase ?? 0) + dt*60;
  game.menu.sparkTimer=(game.menu.sparkTimer ?? 0) + dt;
  game.menu.blinkTimer+=dt;
  const section=game.menu.section ?? 'characters';
  if(section==='characters'){
    if(input.wasPressed(INPUT_KEYS.LEFT)){
      playAudio(game.audio?.menuNavigate);
      game.menu.selectedIndex = (game.menu.selectedIndex + game.menu.options.length - 1) % game.menu.options.length;
    } else if(input.wasPressed(INPUT_KEYS.RIGHT)){
      playAudio(game.audio?.menuNavigate);
      game.menu.selectedIndex = (game.menu.selectedIndex + 1) % game.menu.options.length;
    }
    if(input.wasPressed(INPUT_KEYS.UP) || input.wasPressed(INPUT_KEYS.DOWN)){
      playAudio(game.audio?.menuNavigate);
      game.menu.section='volume';
      return;
    }
    if(input.wasPressed(INPUT_KEYS.ACCEPT)){
      playAudio(game.audio?.menuSelect);
      const choice=game.menu.options[game.menu.selectedIndex];
      startGameWithCharacter(choice.key);
    }
  }else{
    if(input.wasPressed(INPUT_KEYS.UP)){
      if(game.menu.volumeIndex===0){
        playAudio(game.audio?.menuNavigate);
        game.menu.section='characters';
      }else{
        playAudio(game.audio?.menuNavigate);
        game.menu.volumeIndex = (game.menu.volumeIndex + VOLUME_KEYS.length - 1) % VOLUME_KEYS.length;
      }
    }else if(input.wasPressed(INPUT_KEYS.DOWN)){
      playAudio(game.audio?.menuNavigate);
      game.menu.volumeIndex = (game.menu.volumeIndex + 1) % VOLUME_KEYS.length;
    }else if(input.wasPressed(INPUT_KEYS.LEFT)){
      const key=VOLUME_KEYS[game.menu.volumeIndex];
      adjustAudioSetting(key, -0.05);
      playAudio(game.audio?.menuNavigate);
    }else if(input.wasPressed(INPUT_KEYS.RIGHT)){
      const key=VOLUME_KEYS[game.menu.volumeIndex];
      adjustAudioSetting(key, 0.05);
      playAudio(game.audio?.menuNavigate);
    }else if(input.wasPressed(INPUT_KEYS.ACCEPT)){
      playAudio(game.audio?.menuSelect);
      game.menu.section='characters';
    }
  }
};

const drawVolumeControlsPanel = ({ centerX, startY, activeIndex=0, highlight=false, width=360, alpha=0.95, header=null } = {}) => {
  const settings=getAudioSettings();
  const rowSpacing=52;
  const barHeight=12;
  if(header){
    ctx.save();
    ctx.textAlign='center';
    ctx.font='16px "Press Start 2P", monospace';
    ctx.globalAlpha=alpha;
    ctx.fillStyle=highlight ? '#ffe7b4' : 'rgba(212, 226, 255, 0.85)';
    ctx.fillText(header, centerX, startY - 28);
    ctx.restore();
  }
  VOLUME_KEYS.forEach((key, idx)=>{
    const value=settings[key] ?? 1;
    const label=VOLUME_LABELS[key] ?? key;
    const y = startY + idx * rowSpacing;
    const barX = centerX - width/2;
    const isActive = highlight && idx===activeIndex;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.textAlign='left';
    ctx.font='14px "Press Start 2P", monospace';
    ctx.fillStyle = isActive ? '#ffeac1' : 'rgba(214, 224, 255, 0.92)';
    ctx.fillText(label, barX, y);
    const baseColor='rgba(18, 12, 40, 0.78)';
    ctx.fillStyle=baseColor;
    ctx.fillRect(barX, y + 16, width, barHeight);
    const gradient=ctx.createLinearGradient(barX, y + 16, barX + width, y + 16);
    if(isActive){
      gradient.addColorStop(0, 'rgba(255, 196, 120, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 120, 188, 0.9)');
    }else{
      gradient.addColorStop(0, 'rgba(120, 180, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(170, 120, 255, 0.8)');
    }
    ctx.fillStyle=gradient;
    ctx.fillRect(barX, y + 16, width * clamp01(value), barHeight);
    ctx.lineWidth=isActive ? 3 : 1.5;
    ctx.strokeStyle=isActive ? 'rgba(255, 231, 180, 0.95)' : 'rgba(255,255,255,0.55)';
    ctx.strokeRect(barX, y + 16, width, barHeight);
    ctx.textAlign='right';
    ctx.fillStyle=isActive ? '#ffeac1' : 'rgba(214, 224, 255, 0.9)';
    ctx.fillText(`${Math.round(value*100)}%`, barX + width, y);
    ctx.restore();
  });
};

const drawMenu = () => {
  const cover = game.assets?.cover ?? game.assets?.background ?? null;
  const timer = game.menu.sparkTimer ?? 0;
  const section = game.menu.section ?? 'characters';
  const selectingCharacters = section==='characters';

  ctx.fillStyle = '#03030a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (cover) {
    const scale = Math.max(CANVAS_WIDTH / cover.width, CANVAS_HEIGHT / cover.height) * 1.03;
    const w = cover.width * scale;
    const h = cover.height * scale;
    const driftX = Math.sin(timer * 0.45) * 14;
    const driftY = Math.cos(timer * 0.38) * 10;
    const ox = (CANVAS_WIDTH - w) / 2 + driftX;
    const oy = (CANVAS_HEIGHT - h) / 2 + driftY;
    ctx.drawImage(cover, ox, oy, w, h);
  }

  ctx.save();
  const darken = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  darken.addColorStop(0, 'rgba(12, 8, 34, 0.62)');
  darken.addColorStop(0.55, 'rgba(8, 6, 26, 0.78)');
  darken.addColorStop(1, 'rgba(14, 8, 24, 0.9)');
  ctx.fillStyle = darken;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const chaos = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  chaos.addColorStop(0, 'rgba(255, 92, 196, 0.22)');
  chaos.addColorStop(0.45, 'rgba(120, 180, 255, 0.08)');
  chaos.addColorStop(1, 'rgba(255, 189, 89, 0.26)');
  ctx.fillStyle = chaos;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = 'rgba(180, 210, 255, 0.55)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 22]);
  const grid = 56;
  const gx = -grid + ((timer * 48) % grid);
  const gy = -grid + ((timer * 32) % grid);
  for (let x = gx; x < CANVAS_WIDTH + grid; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = gy; y < CANVAS_HEIGHT + grid; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();

  const decals = game.menu.decals ?? [];
  ctx.save();
  decals.forEach((d, idx) => {
    ctx.save();
    const px = CANVAS_WIDTH / 2 + (d.x - 0.5) * CANVAS_WIDTH * 1.25 + Math.sin(timer * (0.7 + idx * 0.13)) * 24;
    const py = CANVAS_HEIGHT / 2 + (d.y - 0.5) * CANVAS_HEIGHT * 1.1 + Math.cos(timer * (0.6 + idx * 0.11)) * 18;
    ctx.translate(px, py);
    ctx.rotate(d.tilt + Math.sin(timer * 0.9 + idx) * 0.03);
    const w = d.w * CANVAS_WIDTH;
    const h = d.h * CANVAS_HEIGHT;
    const streak = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    streak.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streak.addColorStop(0.5, d.tint);
    streak.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = streak;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  });
  ctx.restore();

  ctx.save();
  const headerHeight = 120;
  ctx.beginPath();
  ctx.moveTo(40, 36);
  ctx.lineTo(CANVAS_WIDTH - 40, 24);
  ctx.lineTo(CANVAS_WIDTH - 36, 24 + headerHeight);
  ctx.lineTo(48, 36 + headerHeight + 12);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10, 6, 36, 0.86)';
  ctx.fill();
  const headerGlow = ctx.createLinearGradient(40, 36, CANVAS_WIDTH - 36, 24 + headerHeight);
  headerGlow.addColorStop(0, 'rgba(255, 96, 196, 0.4)');
  headerGlow.addColorStop(0.5, 'rgba(255, 234, 180, 0.18)');
  headerGlow.addColorStop(1, 'rgba(120, 196, 255, 0.35)');
  ctx.fillStyle = headerGlow;
  ctx.globalAlpha = 0.45;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255, 210, 190, 0.85)';
  ctx.shadowBlur = 22;
  ctx.font = '38px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffeac8';
  ctx.fillText('CHARACTER SELECT', CANVAS_WIDTH / 2, 108);
  ctx.shadowBlur = 0;
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillStyle = '#b6c9ff';
  ctx.fillText('LEFT/RIGHT: PICK A HERO  //  ENTER: START  //  UP/DOWN: VOLUME', CANVAS_WIDTH / 2, 142);
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillStyle = 'rgba(255, 150, 220, 0.8)';
  ctx.fillText('LOCATION: THE EAGLES CLUB BASEMENT', 48, 174);
  ctx.fillStyle = 'rgba(160, 220, 255, 0.8)';
  ctx.fillText('VIBE CHECK: NEO-RETRO PANIC MODE', CANVAS_WIDTH - 430, 174);
  ctx.restore();

  const cardsY = 208;
  const cardW = 280;
  const cardH = 310;
  const spacing = 320;
  const centerOffset = (game.menu.options.length - 1) * spacing * 0.5;

  game.menu.options.forEach((opt, i) => {
    const x = CANVAS_WIDTH / 2 + i * spacing - centerOffset;
    const isSelected = i === game.menu.selectedIndex;
    const isFocused = selectingCharacters && isSelected;
    const baseTilt = (i - (game.menu.options.length - 1) / 2) * 0.06;
    const wobble = Math.sin(timer * 3 + i) * (isFocused ? 0.04 : 0.02);
    const bob = Math.sin(timer * 4.5 + i) * (isFocused ? 9 : 4);
    const pulse = 0.5 + 0.5 * Math.sin((game.menu.blinkTimer + i * 0.3) * 5);

    ctx.save();
    ctx.translate(x, cardsY + bob);
    ctx.rotate(baseTilt + wobble);

    const drawCardOutline = () => {
      ctx.beginPath();
      ctx.moveTo(-cardW / 2 + 26, -cardH / 2);
      ctx.lineTo(cardW / 2 - 26, -cardH / 2);
      ctx.lineTo(cardW / 2, -cardH / 2 + 40);
      ctx.lineTo(cardW / 2, cardH / 2 - 48);
      ctx.lineTo(cardW / 2 - 34, cardH / 2);
      ctx.lineTo(-cardW / 2 + 34, cardH / 2);
      ctx.lineTo(-cardW / 2, cardH / 2 - 40);
      ctx.lineTo(-cardW / 2, -cardH / 2 + 38);
      ctx.closePath();
    };

    const shell = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
    shell.addColorStop(0, 'rgba(16, 20, 54, 0.94)');
    shell.addColorStop(1, 'rgba(26, 14, 46, 0.94)');
    drawCardOutline();
    ctx.fillStyle = shell;
    ctx.fill();

    const border = ctx.createLinearGradient(-cardW / 2, 0, cardW / 2, 0);
    if (isFocused) {
      border.addColorStop(0, 'rgba(255, 214, 167, 0.95)');
      border.addColorStop(1, 'rgba(255, 125, 236, 0.9)');
    } else {
      border.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      border.addColorStop(1, 'rgba(180, 200, 255, 0.18)');
    }
    drawCardOutline();
    ctx.lineWidth = isFocused ? 4 : 2;
    ctx.strokeStyle = border;
    ctx.stroke();

    drawCardOutline();
    ctx.save();
    ctx.clip();
    const innerGlow = ctx.createLinearGradient(0, -cardH / 2, 0, cardH / 2);
    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    innerGlow.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
    ctx.restore();

    if (isFocused) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(0, -cardH / 2 + 80, 0, 0, -cardH / 2 + 80, cardW * 0.8);
      halo.addColorStop(0, `rgba(255, 230, 170, ${0.55 + pulse * 0.35})`);
      halo.addColorStop(1, 'rgba(255, 128, 220, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(-cardW, -cardH, cardW * 2, cardH * 1.6);
      ctx.restore();
    }

    const portrait = opt.assets.portrait;
    if (portrait) {
      const maxW = cardW - 100;
      const maxH = cardH - 190;
      const scale = Math.min(maxW / portrait.width, maxH / portrait.height);
      const pw = portrait.width * scale;
      const ph = portrait.height * scale;
      ctx.drawImage(portrait, -pw / 2, -cardH / 2 + 80 + (maxH - ph) / 2, pw, ph);
    }

    const statsTop = -cardH / 2 + 196;
    const statLabels = ['POWER', 'STYLE', 'CHAOS'];
    const statValues = opt.key === 'corky' ? [0.86, 0.7, 0.64] : [0.78, 0.62, 0.92];
    const statWidth = cardW - 160;
    for (let s = 0; s < statLabels.length; s++) {
      const y = statsTop + s * 24;
      ctx.textAlign = 'left';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = 'rgba(188, 206, 255, 0.9)';
      ctx.fillText(statLabels[s], -cardW / 2 + 28, y - 4);
      ctx.fillStyle = 'rgba(12, 16, 32, 0.85)';
      ctx.fillRect(-cardW / 2 + 118, y - 10, statWidth, 10);
      const statGrad = ctx.createLinearGradient(-cardW / 2 + 118, y - 10, -cardW / 2 + 118 + statWidth, y - 10);
      if (isFocused) {
        statGrad.addColorStop(0, 'rgba(255, 140, 220, 0.9)');
        statGrad.addColorStop(1, 'rgba(255, 240, 180, 0.95)');
      } else {
        statGrad.addColorStop(0, 'rgba(130, 200, 255, 0.85)');
        statGrad.addColorStop(1, 'rgba(180, 255, 210, 0.85)');
      }
      ctx.fillStyle = statGrad;
      ctx.fillRect(-cardW / 2 + 118, y - 10, statWidth * statValues[s], 10);
    }

    ctx.textAlign = 'center';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffe7a8';
    ctx.fillText(opt.label.toUpperCase(), 0, cardH / 2 - 56);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#9fbaff';
    const flavor = opt.key === 'corky' ? 'Whiskey-Fueled Footwork' : 'Mutation-Ready Brawler';
    ctx.fillText(flavor, 0, cardH / 2 - 30);

    ctx.restore();
  });

  const volumeHighlight = section==='volume';
  drawVolumeControlsPanel({
    centerX: CANVAS_WIDTH / 2,
    startY: CANVAS_HEIGHT - 230,
    activeIndex: game.menu.volumeIndex ?? 0,
    highlight: volumeHighlight,
    width: 420,
    header: 'VOLUME'
  });

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillStyle = volumeHighlight ? '#ffe9ba' : 'rgba(214, 224, 255, 0.82)';
  const volumeHint = volumeHighlight ? 'LEFT/RIGHT: ADJUST  //  ENTER: BACK' : 'PRESS UP/DOWN TO TUNE VOLUME';
  ctx.fillText(volumeHint, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 104);
  ctx.restore();

  const pulse = 0.55 + 0.45 * Math.sin(game.menu.blinkTimer * 4);

  const panelWidth = 620;
  const panelX = (CANVAS_WIDTH - panelWidth) / 2;
  const panelY = CANVAS_HEIGHT - 122;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(panelX - 36, panelY);
  ctx.lineTo(panelX + panelWidth + 42, panelY - 18);
  ctx.lineTo(panelX + panelWidth + 12, panelY + 86);
  ctx.lineTo(panelX - 24, panelY + 104);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8, 6, 34, 0.88)';
  ctx.fill();
  const panelGlow = ctx.createLinearGradient(panelX, panelY, panelX + panelWidth, panelY + 60);
  panelGlow.addColorStop(0, 'rgba(120, 200, 255, 0.25)');
  panelGlow.addColorStop(0.5, 'rgba(255, 240, 180, 0.25)');
  panelGlow.addColorStop(1, 'rgba(255, 110, 220, 0.25)');
  ctx.fillStyle = panelGlow;
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillStyle = '#b9c4ff';
  ctx.fillText('X: ATTACK   Z: POWER   SPACE: JUMP   ESC: PAUSE', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 72);
  ctx.font = '18px "Press Start 2P", monospace';
  ctx.fillStyle = `rgba(255, 238, 160, ${pulse})`;
  ctx.fillText('PRESS START (ENTER)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 36);
  ctx.restore();
};


const updateGame = (dt) => {
  if(!game.world) return;
  if(input.wasPressed(INPUT_KEYS.PAUSE)){
    enterPause();
    return;
  }
  game.world.update(dt);
};
const drawGame = () => {
  if(!game.world) return;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  game.world.draw(ctx); drawHUD();
};

const PAUSE_MENU_OPTIONS=[
  { key:'resume', label:'Resume' },
  { key:'restart', label:'Restart Level' },
  { key:'volume', label:'Volume Options' },
  { key:'menu', label:'Main Menu' }
];
const PAUSE_CONFIRM_OPTIONS=['Cancel','Confirm'];
const PAUSE_CONFIRM_MESSAGES={
  restart:'Restart the current level?',
  menu:'Return to the main menu?'
};

const initPauseMenu = () => {
  game.pause = {
    options: PAUSE_MENU_OPTIONS,
    selectedIndex: 0,
    mode: 'options',
    volumeIndex: 0,
    confirm: null
  };
  return game.pause;
};

const enterPause = () => {
  if(game.state!==GAME_STATES.PLAYING) return;
  initPauseMenu();
  game.state=GAME_STATES.PAUSED;
};

const resumeGame = () => {
  if(game.state!==GAME_STATES.PAUSED) return;
  game.pause=null;
  game.state=GAME_STATES.PLAYING;
};

const restartCurrentLevel = () => {
  const key = game.session?.characterKey ?? game.menu.options?.[0]?.key ?? 'corky';
  resumeGame();
  startGameWithCharacter(key);
};

const returnToMainMenu = () => {
  game.pause=null;
  game.world=null;
  game.session.characterKey=null;
  initMenu();
  game.state=GAME_STATES.MENU;
  if(game.audio){
    game.audio.menuMusicPlaying=false;
    setMusic(game.audio.menuMusic ?? null);
    game.audio.menuMusicPlaying=true;
  }
};

const requestPauseConfirmation = (action) => {
  const pause = game.pause ?? initPauseMenu();
  pause.confirm = { action, selection:1 };
  pause.mode='confirm';
};

const handlePauseSelection = (key) => {
  switch(key){
    case 'resume':
      playAudio(game.audio?.menuSelect);
      resumeGame();
      break;
    case 'restart':
      playAudio(game.audio?.menuNavigate);
      requestPauseConfirmation('restart');
      break;
    case 'volume':
      playAudio(game.audio?.menuNavigate);
      if(!game.pause) initPauseMenu();
      game.pause.confirm=null;
      game.pause.mode='volume';
      game.pause.volumeIndex=game.pause.volumeIndex ?? 0;
      break;
    case 'menu':
      playAudio(game.audio?.menuNavigate);
      requestPauseConfirmation('menu');
      break;
    default:
      break;
  }
};

const updatePause = (dt) => {
  if(game.state!==GAME_STATES.PAUSED){
    return;
  }
  const pause = game.pause ?? initPauseMenu();
  if(pause.mode==='confirm'){
    pause.confirm = pause.confirm ?? { action:null, selection:1 };
    const confirm=pause.confirm;
    if(input.wasPressed(INPUT_KEYS.PAUSE)){
      playAudio(game.audio?.menuNavigate);
      pause.mode='options';
      pause.confirm=null;
      return;
    }
    if(input.wasPressed(INPUT_KEYS.LEFT) || input.wasPressed(INPUT_KEYS.UP)){
      playAudio(game.audio?.menuNavigate);
      confirm.selection = (confirm.selection + PAUSE_CONFIRM_OPTIONS.length - 1) % PAUSE_CONFIRM_OPTIONS.length;
    }else if(input.wasPressed(INPUT_KEYS.RIGHT) || input.wasPressed(INPUT_KEYS.DOWN)){
      playAudio(game.audio?.menuNavigate);
      confirm.selection = (confirm.selection + 1) % PAUSE_CONFIRM_OPTIONS.length;
    }else if(input.wasPressed(INPUT_KEYS.ACCEPT)){
      const isConfirm = confirm.selection === 1;
      if(isConfirm){
        playAudio(game.audio?.menuSelect);
        const action=confirm.action;
        pause.confirm=null;
        if(action==='restart'){
          restartCurrentLevel();
        }else if(action==='menu'){
          returnToMainMenu();
        }else{
          pause.mode='options';
        }
      }else{
        playAudio(game.audio?.menuNavigate);
        pause.confirm=null;
        pause.mode='options';
      }
    }
    return;
  }
  if(pause.mode==='volume'){
    pause.confirm=null;
    if(input.wasPressed(INPUT_KEYS.PAUSE)){
      resumeGame();
      return;
    }
    if(input.wasPressed(INPUT_KEYS.ACCEPT)){
      playAudio(game.audio?.menuSelect);
      pause.mode='options';
      pause.confirm=null;
      return;
    }
    if(input.wasPressed(INPUT_KEYS.UP)){
      if(pause.volumeIndex===0){
        playAudio(game.audio?.menuNavigate);
        pause.mode='options';
        pause.confirm=null;
      }else{
        playAudio(game.audio?.menuNavigate);
        pause.volumeIndex=(pause.volumeIndex + VOLUME_KEYS.length - 1) % VOLUME_KEYS.length;
      }
    }else if(input.wasPressed(INPUT_KEYS.DOWN)){
      playAudio(game.audio?.menuNavigate);
      pause.volumeIndex=(pause.volumeIndex + 1) % VOLUME_KEYS.length;
    }else if(input.wasPressed(INPUT_KEYS.LEFT)){
      const key=VOLUME_KEYS[pause.volumeIndex];
      adjustAudioSetting(key, -0.05);
      playAudio(game.audio?.menuNavigate);
    }else if(input.wasPressed(INPUT_KEYS.RIGHT)){
      const key=VOLUME_KEYS[pause.volumeIndex];
      adjustAudioSetting(key, 0.05);
      playAudio(game.audio?.menuNavigate);
    }
    return;
  }
  if(input.wasPressed(INPUT_KEYS.PAUSE)){
    resumeGame();
    return;
  }
  if(input.wasPressed(INPUT_KEYS.UP)){
    playAudio(game.audio?.menuNavigate);
    pause.selectedIndex = (pause.selectedIndex + pause.options.length - 1) % pause.options.length;
  }else if(input.wasPressed(INPUT_KEYS.DOWN)){
    playAudio(game.audio?.menuNavigate);
    pause.selectedIndex = (pause.selectedIndex + 1) % pause.options.length;
  }else if(input.wasPressed(INPUT_KEYS.ACCEPT)){
    const choice=pause.options[pause.selectedIndex];
    if(choice) handlePauseSelection(choice.key);
  }
};

const drawPause = () => {
  if(game.state!==GAME_STATES.PAUSED){
    return;
  }
  drawGame();
  const pause = game.pause ?? initPauseMenu();
  ctx.save();
  ctx.fillStyle='rgba(6, 6, 18, 0.72)';
  ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  ctx.restore();

  ctx.save();
  ctx.textAlign='center';
  ctx.font='36px "Press Start 2P", monospace';
  ctx.fillStyle='#ffeac8';
  ctx.shadowColor='rgba(0,0,0,0.6)';
  ctx.shadowBlur=16;
  ctx.fillText('PAUSED', CANVAS_WIDTH/2, 120);
  ctx.shadowBlur=0;
  ctx.restore();

  const listX = CANVAS_WIDTH/2;
  const listStartY = CANVAS_HEIGHT/2 - 30;
  ctx.save();
  ctx.textAlign='center';
  pause.options.forEach((opt, idx)=>{
    const y = listStartY + idx*44;
    const isActive = (pause.mode==='options' && idx===pause.selectedIndex) ||
      (pause.mode==='volume' && opt.key==='volume') ||
      (pause.mode==='confirm' && pause.confirm?.action===opt.key);
    ctx.font = isActive ? '22px "Press Start 2P", monospace' : '20px "Press Start 2P", monospace';
    ctx.fillStyle = isActive ? '#ffe7b4' : 'rgba(215, 226, 255, 0.9)';
    ctx.fillText(opt.label, listX, y);
  });
  ctx.restore();

  const volumeMode = pause.mode==='volume';
  drawVolumeControlsPanel({
    centerX: CANVAS_WIDTH/2,
    startY: CANVAS_HEIGHT/2 + 90,
    activeIndex: pause.volumeIndex ?? 0,
    highlight: volumeMode,
    width: 380,
    header: 'VOLUME'
  });

  const confirmMode = pause.mode==='confirm';
  const confirm=pause.confirm;
  if(confirmMode && confirm){
    const message = PAUSE_CONFIRM_MESSAGES[confirm.action] ?? 'Are you sure?';
    ctx.save();
    ctx.textAlign='center';
    ctx.font='16px "Press Start 2P", monospace';
    ctx.fillStyle='#ffe9ba';
    ctx.fillText(message, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 32);
    ctx.font='14px "Press Start 2P", monospace';
    PAUSE_CONFIRM_OPTIONS.forEach((label, idx)=>{
      const x = CANVAS_WIDTH/2 + (idx===0 ? -100 : 100);
      const y = CANVAS_HEIGHT/2 + 64;
      const isSel = confirm.selection===idx;
      ctx.fillStyle = isSel ? '#ffe7b4' : 'rgba(215,226,255,0.9)';
      ctx.fillText(label.toUpperCase(), x, y);
    });
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign='center';
  ctx.font='12px "Press Start 2P", monospace';
  if(confirmMode){
    ctx.fillStyle='#ffe8b8';
    ctx.fillText('ENTER: CONFIRM  //  ESC: BACK', CANVAS_WIDTH/2, CANVAS_HEIGHT - 64);
  }else if(volumeMode){
    ctx.fillStyle='#ffe8b8';
    ctx.fillText('LEFT/RIGHT: ADJUST  //  ENTER: BACK  //  ESC: RESUME', CANVAS_WIDTH/2, CANVAS_HEIGHT - 64);
  }else{
    ctx.fillStyle='rgba(215, 226, 255, 0.85)';
    ctx.fillText('ENTER: SELECT  //  ESC: RESUME  //  VOLUME OPTIONS INSIDE', CANVAS_WIDTH/2, CANVAS_HEIGHT - 64);
  }
  ctx.restore();
};

const drawHUD = () => {
  const p=game.world.player; if(!p) return;
  const margin=24, hpW=260, hpH=18;
  ctx.fillStyle='#111'; ctx.fillRect(margin-2, margin-2, hpW+4, hpH+4);
  const hpRatio=p.hp/p.maxHp; ctx.fillStyle='#ff4757'; ctx.fillRect(margin, margin, hpW*hpRatio, hpH);
  ctx.strokeStyle='#f8f8f8'; ctx.lineWidth=2; ctx.strokeRect(margin, margin, hpW, hpH);
  ctx.font='14px "Press Start 2P", monospace'; ctx.fillStyle='#fff'; ctx.textAlign='left';
  ctx.fillText(`${p.name}`, margin, margin + hpH + 24);
  const defeated=game.world?.defeatedCount ?? 0;
  const target=game.world?.defeatedTarget ?? 0;
  ctx.textAlign='right';
  ctx.font='12px "Press Start 2P", monospace';
  ctx.fillStyle='#fff';
  ctx.fillText(`DEFEATED ${defeated}/${target}`, CANVAS_WIDTH - margin, margin + 16);
  ctx.textAlign='left';

  if(p.mutation.enabled){
    const mw=220, mh=12, mx=margin, my=margin + hpH + 48;
    ctx.fillStyle='#111'; ctx.fillRect(mx-2, my-2, mw+4, mh+4);
    const r=p.mutation.meter/p.mutation.max;
    const isBurst=p.mutation.mode==='burst';
    const ready=r>=1;
    const bar = p.mutation.active ? (isBurst ? '#ffd166' : '#ff9f1a') : (ready ? (isBurst ? '#ffe066' : '#1e90ff') : (isBurst ? 'rgba(255,231,120,0.45)' : 'rgba(30,144,255,0.45)'));
    ctx.fillStyle=bar; ctx.fillRect(mx, my, mw*r, mh);
    ctx.strokeStyle='#f8f8f8'; ctx.strokeRect(mx, my, mw, mh);
    ctx.fillStyle='#fff';
    const label=p.mutation.label ?? 'MUTATION';
    let status; if(p.mutation.active) status='ACTIVE'; else if(ready) status='READY'; else status='CHARGING';
    ctx.fillText(`${label}: ${status}`, mx, my+28);
  }

  const boss=game.world?.boss;
  if(boss && !boss.shouldRemove && boss.isAlive()){
    const barW=360, barH=16;
    const barX=(CANVAS_WIDTH - barW)/2;
    const barY=margin;
    ctx.fillStyle='rgba(20,8,8,0.75)';
    ctx.fillRect(barX-3, barY-3, barW+6, barH+6);
    const ratio=clamp(boss.hp / boss.maxHp, 0, 1);
    ctx.fillStyle='#5a0a0f';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle='#ff3b30';
    ctx.fillRect(barX, barY, barW*ratio, barH);
    ctx.strokeStyle='#f8f8f8';
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.font='15px "Press Start 2P", monospace';
    ctx.fillStyle='#fffcca';
    ctx.textAlign='center';
    ctx.fillText('MUTANT', CANVAS_WIDTH/2, barY - 8);
    ctx.textAlign='left';
  }
};

const drawLoading = () => {
  ctx.fillStyle='#05050a'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  ctx.fillStyle='#fff'; ctx.font='20px "Press Start 2P", monospace'; ctx.textAlign='center';
  ctx.fillText('LOADING...', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
};

let lastTimestamp = performance.now();
const gameLoop = (timestamp) => {
  const dt=Math.min((timestamp - lastTimestamp)/1000, 0.05);
  lastTimestamp=timestamp;
  switch(game.state){
    case GAME_STATES.LOADING: drawLoading(); break;
    case GAME_STATES.TITLE: updateTitle(dt); drawTitle(); break;
    case GAME_STATES.MENU: updateMenu(dt); drawMenu(); break;
    case GAME_STATES.PAUSED:
      updatePause(dt);
      if(game.state===GAME_STATES.PAUSED) drawPause();
      else if(game.state===GAME_STATES.PLAYING) drawGame();
      else if(game.state===GAME_STATES.MENU) drawMenu();
      else if(game.state===GAME_STATES.TITLE) drawTitle();
      else if(game.state===GAME_STATES.LOADING) drawLoading();
      else if(game.state===GAME_STATES.LEVEL2 && typeof level2Manager.draw==='function') level2Manager.draw(ctx);
      break;
    case GAME_STATES.PLAYING: updateGame(dt); drawGame(); break;
    case GAME_STATES.LEVEL2:
      if(typeof level2Manager.update==='function') level2Manager.update(dt);
      if(typeof level2Manager.draw==='function') level2Manager.draw(ctx);
      else drawLoading();
      break;
  }
  input.postUpdate();
  requestAnimationFrame(gameLoop);
};

const boot = async () => {
  try{
    const assets = await loadAssets();
    game.assets = assets;
    game.audio = assets.audio ?? null;
    setAudioRegistry(game.audio);
    initTitle(); game.state = GAME_STATES.TITLE;
  }catch(e){
    console.error('Failed to load assets', e);
    ctx.fillStyle='#400'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    ctx.fillStyle='#fff'; ctx.font='18px monospace'; ctx.textAlign='center';
    ctx.fillText('Failed to load assets. Check console.', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
  }
};
boot(); requestAnimationFrame(gameLoop);
/* --- end patched game.js --- */
