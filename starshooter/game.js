// Galaga-ish Starshooter — Mobile‑optimized + powerups + progressive difficulty
// Modified version of the original game.js.  Changes include a wider boss laser,
// differentiated enemy visuals based on difficulty, and shooter enemies that
// fire projectiles at the player.  Additional minor fixes reset new arrays
// when starting or progressing the game.

/**************
 * Canvas/UI  *
 **************/
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d', { alpha: false });

const titleEl    = document.getElementById('title');
const pausedEl   = document.getElementById('paused');
const gameoverEl = document.getElementById('gameover');

const startBtn   = document.getElementById('startBtn');
const resumeBtn  = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const stageEl = document.getElementById('stage');

const leftBtn  = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const fireBtn  = document.getElementById('fireBtn');
const pauseBtn = document.getElementById('pauseBtn');

const gestureLayer = document.getElementById('gestureLayer');

/********************
 * World dimensions *
 ********************/
let WORLD_W = 480;   // logical CSS pixels (never use canvas.width for gameplay)
let WORLD_H = 640;

/** Hi‑DPI aware resize: draw in CSS pixels, scale backing store to DPR */
function resizeCanvas() {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const rect = canvas.getBoundingClientRect();
  // guard against transient 0×0 during layout/iframes
  if (rect.width < 2 || rect.height < 2) {
    // keep previous WORLD_W/H and try again later
    requestAnimationFrame(resizeCanvas);
    return;
  }
  WORLD_W = Math.round(rect.width);
  WORLD_H = Math.round(rect.height);
  canvas.width  = Math.max(1, Math.round(WORLD_W * dpr));
  canvas.height = Math.max(1, Math.round(WORLD_H * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
}
new ResizeObserver(resizeCanvas).observe(canvas);
// Run once after DOM & styles settle (important inside iframes)
window.addEventListener('DOMContentLoaded', resizeCanvas);
window.addEventListener('load', resizeCanvas);

/************
 * Helpers  *
 ************/
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd   = (a, b) => a + Math.random() * (b - a);
function circColl(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, rr = (a.r + b.r);
  return (dx*dx + dy*dy) <= rr*rr;
}
function circleRect(cx, cy, rx, ry, rw, rh, r = 15) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nx, dy = cy - ny;
  return dx*dx + dy*dy <= r*r;
}
function roundRect(x,y,w,h,r,fill=true,stroke=false){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}
function mobileHaptic(ms=15){ if(navigator.vibrate) navigator.vibrate(ms); }

/****************
 * Game state   *
 ****************/
let keys = {};
let started = false, paused = false, gameOver = false;

let lastTime = 0;
let score = 0, lives = 3, stage = 1;

let enemySpawnTimer    = 0;
let enemySpawnInterval = 0.9; // will shrink slightly per stage
let enemyBaseSpeed     = 80;  // will grow slightly per stage

let player;
let stars     = [];
let enemies   = [];
let bullets   = [];
let explosions= [];
let powerups  = [];
// enemyShots holds bullets fired by shooter‑type enemies.
let enemyShots= [];

let boss = null;
let nextBossScore = 300;

/****************
 * Powerups     *
 ****************/
/* Types:
 * - 'life'    : +1 life
 * - 'rapid'   : faster cooldown
 * - 'spread'  : enable triple shot
 * - 'shield'  : temporary invulnerability with visual ring
 * - 'slowmo'  : slow enemies briefly
 * - 'pierce'  : bullets pierce one enemy
 */
const POWERUP_TYPES = [
  {type:'life',   weight: 0.12},
  {type:'rapid',  weight: 0.22},
  {type:'spread', weight: 0.22},
  {type:'shield', weight: 0.20},
  {type:'slowmo', weight: 0.14},
  {type:'pierce', weight: 0.10},
];
const TOTAL_WEIGHT = POWERUP_TYPES.reduce((s,p)=>s+p.weight,0);
function getRandomPowerupType(){
  let r = Math.random() * TOTAL_WEIGHT;
  for(const p of POWERUP_TYPES){
    r -= p.weight;
    if(r <= 0) return p.type;
  }
  return 'rapid';
}
class Powerup {
  constructor(x,y,type){
    this.x=x; this.y=y; this.r=11;
    this.type  = type;
    this.speed = 150;
  }
  update(dt){
    this.y += this.speed * dt;
  }
  draw(){
    // token color/icons
    const color = {
      life:'#34d399', rapid:'#60a5fa', spread:'#ffd166',
      shield:'#a78bfa', slowmo:'#67e8f9', pierce:'#fb7185'
    }[this.type] || '#d1d5db';
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#0b1020';
    ctx.font      = 'bold 12px system-ui, Arial';
    ctx.textAlign = 'center'; ctx.textBaseline='middle';
    const text = {
      life:'❤', rapid:'R', spread:'S', shield:'⛨', slowmo:'⏳', pierce:'P'
    }[this.type] || '?';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
}

/**************
 * Entities   *
 **************/
class Player {
  constructor(){
    this.x = WORLD_W / 2;
    this.y = WORLD_H - 60;
    this.r = 15;
    this.speed = 260;
    this.touchLerp = 12;
    this.baseCooldown = 0.22;
    this.cooldown     = this.baseCooldown;
    this.shootTimer   = 0;
    // power states
    this.spread = false;
    this.spreadTime = 0;
    this.rapidTime  = 0;
    this.pierce     = false;
    this.pierceTime = 0;
    this.shield     = 0; // seconds remaining
    // effects
    this.hit=false; this.hitTime=0; this.invuln=0;
  }
  update(dt){
    let dx=0;
    if(keys['ArrowLeft']||keys['KeyA'])  dx -= 1;
    if(keys['ArrowRight']||keys['KeyD']) dx += 1;
    this.x += dx * this.speed * dt;
    if(touchMoveActive && touchTargetX!=null){
      this.x += (touchTargetX - this.x) * Math.min(1, this.touchLerp*dt);
    }
    this.x = clamp(this.x, this.r, WORLD_W - this.r);
    // timers
    this.shootTimer -= dt;
    if(this.spread){ this.spreadTime -= dt; if(this.spreadTime<=0){ this.spread=false; } }
    if(this.rapidTime>0){ this.rapidTime -= dt; if(this.rapidTime<=0){ this.cooldown=this.baseCooldown; } }
    if(this.pierce){ this.pierceTime -= dt; if(this.pierceTime<=0){ this.pierce=false; } }
    if(this.shield>0){ this.shield -= dt; }
    if(this.invuln>0) this.invuln -= dt;
    if(this.hit){ this.hitTime += dt; if(this.hitTime>1){ this.hit=false; this.hitTime=0; } }
    // fire
    if((keys['Space']||keys['KeyK']) && this.shootTimer<=0){
      if(this.spread){
        bullets.push(new Bullet(this.x, this.y - this.r, this.pierce, 0));
        bullets.push(new Bullet(this.x, this.y - this.r, this.pierce, -0.22));
        bullets.push(new Bullet(this.x, this.y - this.r, this.pierce,  0.22));
      } else {
        bullets.push(new Bullet(this.x, this.y - this.r, this.pierce, 0));
      }
      this.shootTimer = this.cooldown;
    }
  }
  draw(){
    ctx.save(); ctx.translate(this.x, this.y);
    if(this.hit) ctx.globalAlpha = 0.6 + 0.4 * Math.sin(this.hitTime*16);
    const g = ctx.createLinearGradient(0,-18,0,18);
    g.addColorStop(0, this.spread ? '#ffd166' : '#8dffb2');
    g.addColorStop(1, this.spread ? '#ff7a00' : '#14c27a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(-14, 16); ctx.lineTo(14, 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1c2bff';
    ctx.beginPath(); ctx.arc(0,2,5,0,Math.PI*2); ctx.fill();
    // Shield ring
    if(this.shield>0){
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth   = 3;
      ctx.beginPath(); ctx.arc(0,2, this.r+6 + Math.sin(performance.now()/120)*1.5, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Thruster
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffcf33';
    ctx.beginPath(); ctx.ellipse(0, 20, 5, 8 + Math.random()*1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  give(type){
    switch(type){
      case 'life':   lives++; resetHUD(); break;
      case 'rapid':  this.cooldown = 0.12; this.rapidTime = 8; break;
      case 'spread': this.spread   = true; this.spreadTime = 10; break;
      case 'shield': this.shield   = 6; this.invuln = Math.max(this.invuln, 0.2); break;
      case 'slowmo': slowmoTimer   = 4; break;
      case 'pierce': this.pierce   = true; this.pierceTime = 8; break;
    }
    mobileHaptic(12);
  }
  takeHit(){
    if(this.shield>0 || this.invuln>0) return false;
    lives--;
    this.hit = true;
    this.invuln = 1.0;
    mobileHaptic(25);
    resetHUD();
    if(lives<=0){ gameOverNow(); return true; }
    return true;
  }
}

class Bullet {
  constructor(x,y,pierce=false,angle=0){
    this.x = x; this.y = y; this.r = 3;
    this.speed = 420;
    this.vx    = Math.sin(angle) * 180;
    // keep strong upward bias; use angle to skew left/right
    this.vy    = -this.speed * Math.cos(angle === 0 ? 0 : 0.35);
    this.pierce  = pierce;
    this.pierced = 0; // count enemies pierced
  }
  update(dt){
    this.x += this.vx * dt;
    this.y += -this.speed * dt;
  }
  draw(){
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }
}

// EnemyShot: bullets fired by shooter‑type enemies.  They travel downward
// toward the player.
class EnemyShot {
  constructor(x, y){
    this.x = x; this.y = y; this.r = 4;
    this.speed = 200;
  }
  update(dt){
    this.y += this.speed * dt;
  }
  draw(){
    ctx.fillStyle = '#ff5f6d';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
  }
}

class Enemy {
  constructor(x,y,speed){
    this.x = x;
    this.y = y;
    this.r = 15;
    this.speed   = speed;
    this.wobbleT = Math.random() * Math.PI * 2;
    // tint colours reused for all types
    this.tint    = ['#4af5ff','#ff90e8','#ffd166'][ (Math.random()*3)|0 ];
    // determine enemy type based on relative speed and randomness
    this.type = 'normal';
    const ratio = speed / Math.max(1, enemyBaseSpeed);
    if(ratio >= 1.5) { this.type = 'fast';  this.r = 13; }
    else if(ratio <= 1.05) { this.type = 'slow'; this.r = 18; }
    else if(Math.random() < 0.2) { this.type = 'shooter'; this.r = 16; }
    // shooter enemies need a timer to fire
    if(this.type === 'shooter'){
      this.shotTimer = rnd(1.5, 3.0);
    }
  }
  update(dt){
    const slowFactor = slowmoTimer>0 ? 0.55 : 1;
    this.y += this.speed * dt * slowFactor;
    this.wobbleT += dt * 2 * slowFactor;
    // slight horizontal wobble for all enemies
    this.x += Math.sin(this.wobbleT) * 20 * dt;
    // shooter enemies fire periodically
    if(this.type === 'shooter'){
      this.shotTimer -= dt;
      if(this.shotTimer <= 0){
        enemyShots.push(new EnemyShot(this.x, this.y + this.r));
        this.shotTimer = rnd(1.5, 3.0);
      }
    }
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    // rotate slightly for wobble
    ctx.rotate(Math.sin(this.wobbleT*1.5) * 0.08);
    // choose drawing based on type
    if(this.type === 'fast'){
      // fast enemies are diamond‑shaped and geometric
      ctx.save();
      ctx.rotate(Math.sin(this.wobbleT * 2) * 0.3);
      ctx.fillStyle = this.tint;
      ctx.beginPath();
      ctx.moveTo(0, -this.r);
      ctx.lineTo(this.r, 0);
      ctx.lineTo(0, this.r);
      ctx.lineTo(-this.r, 0);
      ctx.closePath();
      ctx.fill();
      // small eye highlight in centre
      ctx.fillStyle='#dfe9ff';
      ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(this.type === 'slow'){
      // slow enemies are round and bulky
      ctx.fillStyle = this.tint;
      ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fill();
      // highlight
      ctx.fillStyle = '#dfe9ff';
      ctx.beginPath(); ctx.arc(0, -this.r*0.35, 4, 0, Math.PI*2); ctx.fill();
    } else if(this.type === 'shooter'){
      // shooter enemies pulsate to telegraph danger
      const pulsate = 1 + 0.2 * Math.sin(performance.now()/100 + this.wobbleT);
      ctx.save();
      ctx.scale(pulsate, pulsate);
      ctx.fillStyle = this.tint;
      ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2); ctx.fill();
      // inner core
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(0,0,this.r*0.4,0,Math.PI*2); ctx.fill();
      ctx.restore();
    } else {
      // normal enemies retain the original rounded‑rectangle design
      const g = ctx.createLinearGradient(0,-10,0,10);
      g.addColorStop(0, '#0b1426'); g.addColorStop(1, '#1c2c4a');
      ctx.fillStyle = g; roundRect(-12,-10,24,20,6,true,false);
      ctx.fillStyle = this.tint; roundRect(-12,-2,24,4,2,true,false);
      ctx.fillStyle='#dfe9ff'; ctx.beginPath(); ctx.arc(0,-1,4,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}

class Boss {
  constructor(hpBoost = 0){
    this.x = WORLD_W/2;
    this.y = 100;
    this.w = 120;
    this.h = 48;
    this.hpMax = 40 + hpBoost;
    this.hp    = this.hpMax;
    this.dir   = 1;
    this.speed = 110;
    // Laser cycle (seconds)
    this.fireInterval   = 2.5;
    this.chargeDuration = 1.2;
    this.beamDuration   = 0.7;
    this.timer = this.fireInterval;
    this.state = 'idle';          // 'idle' -> 'charge' -> 'beam' -> 'idle'
    this.beamHitApplied = false;
    // widen the boss laser for added challenge
    this.beamWidth = 80;
  }
  update(dt){
    // Guard against weird dt/NaN
    if (!Number.isFinite(dt) || dt <= 0) dt = 0.016;
    // Movement always progresses (slowmo only dampens, never freezes)
    const slowFactorMove  = slowmoTimer > 0 ? 0.7 : 1;
    this.x += this.dir * this.speed * dt * slowFactorMove;
    // Bounds
    const leftBound  = 60;
    const rightBound = Math.max(leftBound + 1, WORLD_W - 60);
    if (this.x < leftBound)  { this.x = leftBound;   this.dir = 1;  }
    if (this.x > rightBound) { this.x = rightBound;  this.dir = -1; }
    // State timer (slowmo affects cadence but must never stall)
    const slowFactorCycle = slowmoTimer > 0 ? 0.7 : 1;
    const dec = Math.max(0.001, dt * slowFactorCycle);
    if (!Number.isFinite(this.timer)) this.timer = this.fireInterval;
    this.timer -= dec;
    // State transitions
    switch (this.state) {
      case 'idle':
        if (this.timer <= 0) {
          this.state = 'charge';
          this.timer = this.chargeDuration;
        }
        break;
      case 'charge':
        if (this.timer <= 0) {
          this.state = 'beam';
          this.timer = this.beamDuration;
          this.beamHitApplied = false;
        }
        break;
      case 'beam': {
        // Apply damage once if player crosses the column
        const half = this.getBeamWidth() / 2;
        if (!this.beamHitApplied &&
            Math.abs((player?.x ?? 0) - this.x) < (half + (player?.r ?? 15)) &&
            (player?.y ?? 0) > this.y - this.h/2) {
          if (player.takeHit()) this.beamHitApplied = true;
        }
        if (this.timer <= 0) {
          this.state = 'idle';
          this.timer = this.fireInterval;
        }
        break;
      }
    }
  }
  draw(){
    // body
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.state === 'charge'){
      const glow = 0.4 + Math.sin(performance.now()/70) * 0.2;
      ctx.shadowColor = '#ff2e63';
      ctx.shadowBlur  = 30 * glow;
    } else {
      ctx.shadowBlur = 0;
    }
    const g = ctx.createLinearGradient(0, -this.h/2, 0, this.h/2);
    g.addColorStop(0, '#2e0f1c'); g.addColorStop(1, '#4a1d30');
    ctx.fillStyle = g;
    roundRect(-this.w/2, -this.h/2, this.w, this.h, 12, true, false);
    ctx.fillStyle = '#ffd166'; roundRect(-18, -10, 36, 20, 6, true, false);
    ctx.fillStyle = '#ff2e63';
    roundRect(-this.w/2+6, -6, 20, 12, 6, true, false);
    roundRect( this.w/2-26, -6, 20, 12, 6, true, false);
    ctx.restore();
    // HP bar
    const bw = Math.max(120, WORLD_W - 140), bh = 10, bx = (WORLD_W - bw)/2, by = 20;
    ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle='#ff2e63';        ctx.fillRect(bx,by,Math.max(0,(this.hp/this.hpMax)*bw),bh);
    ctx.strokeStyle='#ff9fb4';      ctx.strokeRect(bx,by,bw,bh);
    // Laser visuals
    if (this.state === 'charge'){
      const w = this.getBeamWidth() * 0.5;
      const a = 0.15 + 0.15 * Math.sin(performance.now()/90);
      ctx.save(); ctx.globalAlpha = a;
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, WORLD_H);
      grad.addColorStop(0,   'rgba(255,46,99,0.0)');
      grad.addColorStop(0.2, 'rgba(255,46,99,0.2)');
      grad.addColorStop(1,   'rgba(255,46,99,0.02)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(this.x - w, this.y + this.h/2);
      ctx.lineTo(this.x + w, this.y + this.h/2);
      ctx.lineTo(this.x + w*1.5, WORLD_H);
      ctx.lineTo(this.x - w*1.5, WORLD_H);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (this.state === 'beam'){
      const w = this.getBeamWidth();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, WORLD_H);
      grad.addColorStop(0,   'rgba(255,46,99,0.9)');
      grad.addColorStop(0.4, 'rgba(255,171,0,0.7)');
      grad.addColorStop(1,   'rgba(255,255,255,0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x - w/2, this.y + this.h/2, w, WORLD_H);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(this.x - w*0.18, this.y + this.h/2, w*0.36, WORLD_H);
      ctx.restore();
    }
  }
  getBeamWidth(){
    if (this.state === 'charge'){
      const denom = Math.max(0.001, this.chargeDuration);
      const p = 1 - (this.timer / denom);
      return this.beamWidth * (0.4 + 0.6 * clamp(p,0,1));
    }
    return this.beamWidth;
  }
}

class Star {
  constructor(){ this.reset(); this.y = Math.random()*WORLD_H; }
  reset(){
    this.x    = Math.random()*WORLD_W;
    this.y    = -10;
    this.speed= 60 + Math.random()*140;
    this.size = Math.random()*2;
  }
  update(dt){
    const slowFactor = slowmoTimer>0 ? 0.7 : 1;
    this.y += this.speed * dt * slowFactor;
    if(this.y > WORLD_H) this.reset();
  }
  draw(){
    ctx.fillStyle='white';
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

class Explosion {
  constructor(x,y){ this.x=x; this.y=y; this.t=0; this.dur=.45; }
  update(dt){ this.t += dt; }
  draw(){
    const p = clamp(this.t/this.dur,0,1);
    ctx.fillStyle = `rgba(255, ${Math.floor(255*(1-p))}, 0, ${1-p})`;
    ctx.beginPath(); ctx.arc(this.x, this.y, p*28, 0, Math.PI*2); ctx.fill();
  }
}

/*****************
 * Input (touch) *
 *****************/
let touchMoveActive = false;
let touchTargetX    = null;
let touchPointerId  = null;
let fireTouchPointers = new Set();
function setFireActive(on){ keys['Space'] = !!on; }
const touchTarget = gestureLayer || canvas; // fallback if gestureLayer not in DOM
['touchstart','touchmove','touchend','gesturestart'].forEach(ev=>{
  document.addEventListener(ev, e=>{
    if(e.target===touchTarget || e.target===canvas) e.preventDefault();
  }, {passive:false});
});
touchTarget.addEventListener('pointerdown', (e)=>{
  e.preventDefault();
  try { touchTarget.setPointerCapture(e.pointerId); } catch {}
  const rect = touchTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (WORLD_W / Math.max(1, rect.width));
  if(touchPointerId===null){
    touchPointerId = e.pointerId;
    touchMoveActive = true;
    touchTargetX = x;
  }
  if(isRightHalf(e.clientX)){
    fireTouchPointers.add(e.pointerId);
    setFireActive(true);
  }
}, {passive:false});
touchTarget.addEventListener('pointermove', (e)=>{
  const rect = touchTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (WORLD_W / Math.max(1, rect.width));
  if(e.pointerId===touchPointerId){
    touchTargetX = clamp(x, player?.r||15, WORLD_W - (player?.r||15));
  }
}, {passive:true});
function endPointer(e){
  if(e.pointerId===touchPointerId){
    touchPointerId=null; touchMoveActive=false; touchTargetX=null;
  }
  if(fireTouchPointers.has(e.pointerId)){
    fireTouchPointers.delete(e.pointerId);
    if(fireTouchPointers.size===0) setFireActive(false);
  }
}
touchTarget.addEventListener('pointerup', endPointer, {passive:true});
touchTarget.addEventListener('pointercancel', endPointer, {passive:true});
touchTarget.addEventListener('pointerleave', endPointer, {passive:true});
function isRightHalf(clientX){
  const rect = touchTarget.getBoundingClientRect();
  return clientX >= rect.left + rect.width/2;
}

/*****************
 * Input (keys)  *
 *****************/
addEventListener('keydown', e=>{
  if(e.code==='Space') e.preventDefault();
  keys[e.code] = true;
  if(!started && (e.code==='Enter' || e.code==='Space')) startGame();
  if(e.code==='KeyP') togglePause();
}, {passive:false});
addEventListener('keyup', e=>{ keys[e.code] = false; }, {passive:true});
function bindPress(btn, code){
  if(!btn) return;
  const on  = ()=>{ keys[code] = true; mobileHaptic(8); };
  const off = ()=>{ keys[code] = false; };
  btn.addEventListener('pointerdown', e=>{ e.preventDefault(); on(); });
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('pointercancel', off);
}
bindPress(leftBtn,'ArrowLeft');
bindPress(rightBtn,'ArrowRight');
bindPress(fireBtn,'Space');
pauseBtn?.addEventListener('click', ()=>{ mobileHaptic(8); togglePause(); });

/****************
 * Game flow    *
 ****************/
let slowmoTimer = 0;
function resetStars(){ stars.length = 0; for(let i=0;i<120;i++) stars.push(new Star()); }
function resetHUD(){
  scoreEl.textContent = String(score).padStart(6,'0');
  stageEl.textContent = String(stage);
  // hearts; use textContent to avoid layout thrash/HTML parsing
  livesEl.textContent = '❤'.repeat(Math.max(0, lives));
}
function showOverlay(el){ el?.classList.add('show'); }
function hideOverlay(el){ el?.classList.remove('show'); }
function startGame(){
  started=true; paused=false; gameOver=false;
  hideOverlay(titleEl); hideOverlay(gameoverEl); hideOverlay(pausedEl);
  player = new Player();
  enemies.length=0; bullets.length=0; explosions.length=0; powerups.length=0; enemyShots.length=0;
  score=0; lives=3; stage=1;
  boss=null; nextBossScore=300;
  enemySpawnTimer=0;
  enemySpawnInterval=0.9;
  enemyBaseSpeed=80;
  slowmoTimer = 0;
  lastTime = performance.now();
  resetStars(); resetHUD();
}
function gameOverNow(){
  gameOver=true; started=false;
  document.getElementById('finalScore').textContent = `Final Score: ${score}`;
  showOverlay(gameoverEl);
}
function togglePause(force){
  if(!started || gameOver) return;
  paused = force===undefined ? !paused : !!force;
  if(paused){ showOverlay(pausedEl); }
  else { hideOverlay(pausedEl); lastTime = performance.now(); }
}
startBtn?.addEventListener('click', ()=>{ if(!started) { mobileHaptic(8); startGame(); } });
resumeBtn?.addEventListener('click', ()=>{ if(paused){ mobileHaptic(8); togglePause(false); } });
restartBtn?.addEventListener('click', ()=>{ mobileHaptic(8); startGame(); });

/************
 * Spawning *
 ************/
function spawnEnemy(){
  const x = 20 + Math.random() * (WORLD_W - 40);
  const speed = enemyBaseSpeed + Math.random()*120 + stage*5;
  enemies.push(new Enemy(x, -30, speed));
}

/****************
 * Main loop    *
 ****************/
function update(dt){
  if (slowmoTimer>0) slowmoTimer -= dt;
  stars.forEach(s=>s.update(dt));
  if(!started) return;
  // spawn enemies if no boss
  if(!boss){
    enemySpawnTimer += dt;
    if(enemySpawnTimer >= enemySpawnInterval){
      enemySpawnTimer -= enemySpawnInterval;
      spawnEnemy();
    }
  }
  // update player
  player.update(dt);
  // update boss
  if (boss) boss.update(dt);
  // update bullets and filter out of bounds
  bullets = bullets.filter(b => b.y + b.r > 0 && b.x > -20 && b.x < WORLD_W+20);
  bullets.forEach(b => b.update(dt));
  // update enemy shots
  enemyShots = enemyShots.filter(s => s.y - s.r < WORLD_H);
  for(let si=enemyShots.length-1; si>=0; si--){
    const shot = enemyShots[si];
    shot.update(dt);
    // check collision with player
    if(circColl(shot, player)){
      explosions.push(new Explosion(player.x, player.y));
      enemyShots.splice(si,1);
      player.takeHit();
      continue;
    }
  }
  // update enemies
  for(let i=enemies.length-1; i>=0; i--){
    const e = enemies[i];
    e.update(dt);
    if(e.y - e.r > WORLD_H){
      enemies.splice(i,1);
      player.takeHit();
    }
  }
  // collisions: bullets vs enemies
  for(let bi=bullets.length-1; bi>=0; bi--){
    const bullet = bullets[bi];
    for(let ei=enemies.length-1; ei>=0; ei--){
      if(circColl(bullet, enemies[ei])){
        explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
        const dropX = enemies[ei].x, dropY = enemies[ei].y;
        enemies.splice(ei,1);
        score += 10;
        if(Math.random() < 0.13){
          powerups.push(new Powerup(dropX, dropY, getRandomPowerupType()));
        }
        if(bullet.pierce && bullet.pierced < 1){ bullet.pierced++; }
        else { bullets.splice(bi,1); }
        resetHUD();
        break;
      }
    }
  }
  // bullets vs boss
  if(boss){
    for(let bi=bullets.length-1; bi>=0; bi--){
      const b = bullets[bi];
      if(circleRect(b.x, b.y, boss.x-boss.w/2, boss.y-boss.h/2, boss.w, boss.h, b.r)){
        explosions.push(new Explosion(boss.x, boss.y));
        if(b.pierce && b.pierced < 1){ b.pierced++; }
        else { bullets.splice(bi,1); }
        boss.hp -= 2;
        if(boss.hp <= 0){
          explosions.push(new Explosion(boss.x,boss.y));
          score += 200;
          boss = null;
          afterBossDifficultyBump();
          resetHUD();
          break;
        }
      }
    }
  }
  // player vs enemies
  for(let ei=enemies.length-1; ei>=0; ei--){
    if(circColl(player, enemies[ei])){
      explosions.push(new Explosion(player.x, player.y));
      enemies.splice(ei,1);
      player.takeHit();
    }
  }
  // powerups
  for(let i=powerups.length-1; i>=0; i--){
    const p = powerups[i];
    p.update(dt);
    if(circColl({x:player.x,y:player.y,r:player.r}, p)){
      player.give(p.type);
      powerups.splice(i,1);
    } else if(p.y > WORLD_H + 20){
      powerups.splice(i,1);
    }
  }
  // explosions cleanup
  for(let i=explosions.length-1; i>=0; i--){
    explosions[i].update(dt);
    if(explosions[i].t>explosions[i].dur) explosions.splice(i,1);
  }
  // boss spawn
  if(!boss && score>=nextBossScore){
    const hpBoost = Math.round((stage-1) * 10);
    boss = new Boss(hpBoost);
    nextBossScore += 300;
  }
}
function draw(){
  ctx.clearRect(0,0,WORLD_W,WORLD_H);
  stars.forEach(s=>s.draw());
  if(started){
    player.draw();
    bullets.forEach(b=>b.draw());
    enemyShots.forEach(s=>s.draw());
    enemies.forEach(e=>e.draw());
    powerups.forEach(p=>p.draw());
    explosions.forEach(ex=>ex.draw());
    if(boss) boss.draw();
  }
}
function loop(ts){
  if(!lastTime) lastTime = ts;
  if(!paused && !gameOver){
    // clamp dt to avoid huge jumps (e.g., after tab restore)
    let dt = (ts - lastTime) / 1000;
    if(!Number.isFinite(dt) || dt < 0) dt = 0.016;
    dt = Math.min(dt, 0.05);
    lastTime = ts;
    update(dt);
    draw();
  } else {
    lastTime = ts; // keep clocks in sync while paused/game over
  }
  requestAnimationFrame(loop);
}

/**************************
 * Difficulty progression *
 **************************/
function afterBossDifficultyBump(){
  stage++;
  // slightly tougher each time
  enemySpawnInterval = Math.max(0.55, enemySpawnInterval * 0.95);
  enemyBaseSpeed     = Math.min(220, enemyBaseSpeed + 10);
  resetHUD();
}

/********************
 * Boot & behavior  *
 ********************/
resetStars(); resetHUD(); draw();
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden && started && !paused && !gameOver) togglePause(true);
});
requestAnimationFrame(loop);
