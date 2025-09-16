// Galaga-ish Starshooter — Cool enemies + Boss laser every 2.5s
// Works with starshooter.html & style.css in this folder

/***********************
 * Canvas + UI handles *
 ***********************/
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Overlays
const titleEl   = document.getElementById('title');
const pausedEl  = document.getElementById('paused');
const gameoverEl= document.getElementById('gameover');

// Buttons
const startBtn   = document.getElementById('startBtn');
const resumeBtn  = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');

// HUD
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const stageEl = document.getElementById('stage');

// Mobile controls
const leftBtn  = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const fireBtn  = document.getElementById('fireBtn');
const pauseBtn = document.getElementById('pauseBtn');

/****************
 * Game state   *
 ****************/
let keys = {};
let started = false;
let paused  = false;
let gameOver = false;

let lastTime = 0;
let enemySpawnTimer = 0;
const enemySpawnInterval = 0.9;

let score = 0;
let lives = 3;
let stage = 1;

let player;
let enemies = [];
let bullets = [];
let stars = [];
let explosions = [];
let bonuses = [];

// Boss
let boss = null;
let nextBossScore = 300;
let hasSuperBlaster = false;
let enemyDestroyedCount = 0;

/****************
 * Entities     *
 ****************/
class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 60;
    this.radius = 15;
    this.speed = 260;        // px/sec (smoothed by dt)
    this.hit = false;
    this.hitTime = 0;
    this.shootTimer = 0;
    this.baseCooldown = 0.22;
    this.cooldown = this.baseCooldown;
    this.booster = false;
    this.boosterTime = 0;
    this.invuln = 0; // brief invulnerability after a hit
  }
  update(dt) {
    const move = this.speed * dt;
    if (keys['ArrowLeft'] || keys['KeyA']) this.x -= move;
    if (keys['ArrowRight']|| keys['KeyD']) this.x += move;
    this.x = clamp(this.x, this.radius, canvas.width - this.radius);

    // Fire
    this.shootTimer -= dt;
    if ((keys['Space'] || keys['KeyK']) && this.shootTimer <= 0) {
      bullets.push(new Bullet(this.x, this.y - this.radius, this.booster));
      this.shootTimer = this.cooldown;
    }

    // Booster
    if (this.booster) {
      this.boosterTime -= dt;
      if (this.boosterTime <= 0) {
        this.booster = false;
        this.cooldown = this.baseCooldown;
      }
    }

    if(this.invuln>0) this.invuln -= dt;

    // Hit flash
    if (this.hit) {
      this.hitTime += dt;
      if (this.hitTime > 1) { this.hit = false; this.hitTime = 0; }
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.hit) ctx.globalAlpha = 0.6 + 0.4*Math.sin(this.hitTime*16);
    // Ship body
    const g = ctx.createLinearGradient(0,-18,0,18);
    g.addColorStop(0, this.booster ? '#08f7ff' : '#8dffb2');
    g.addColorStop(1, this.booster ? '#0078ff' : '#14c27a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-14, 16);
    ctx.lineTo(14, 16);
    ctx.closePath();
    ctx.fill();
    // Cockpit
    ctx.fillStyle = '#1c2bff';
    ctx.beginPath(); ctx.arc(0,2,5,0,Math.PI*2); ctx.fill();
    // Thruster glow
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffcf33';
    ctx.beginPath(); ctx.ellipse(0, 20, 5, 8 + Math.random()*1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  giveBooster(sec=8){
    this.booster = true;
    this.boosterTime = sec;
    this.cooldown = 0.12;
  }
  takeHit(){
    if(this.invuln>0) return false;
    lives--; this.hit=true; this.invuln = 1.0;
    resetHUD();
    if(lives<=0){ gameOverNow(); return true; }
    return true;
  }
}

class Bullet {
  constructor(x,y,boost=false){
    this.x=x; this.y=y; this.r = boost?5:3;
    this.speed = boost?560:380;
  }
  update(dt){ this.y -= this.speed*dt; }
  draw(){
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
  }
}

class Enemy {
  constructor(x,y,speed){
    this.x=x; this.y=y;
    this.r = 15;
    this.speed=speed;
    this.type = (Math.random()*3)|0;
    this.wobbleT = Math.random()*Math.PI*2;
    this.roll = (Math.random()*0.5+0.3) * (Math.random()<.5?-1:1);
    this.tint = ['#4af5ff','#ff90e8','#ffd166'][this.type];
  }
  update(dt){
    this.y += this.speed*dt;
    // gentle horizontal wobble for feel
    this.wobbleT += dt*2;
    this.x += Math.sin(this.wobbleT)*20*dt;
  }
  draw(){
    // Modernized Galaga-like enemy: wings + cockpit + accent glow
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(Math.sin(this.wobbleT*1.5)*0.08);
    const bodyW=28, bodyH=18;

    // Wings
    ctx.globalAlpha = 0.9;
    const wingGrad = ctx.createLinearGradient(-bodyW,0,bodyW,0);
    wingGrad.addColorStop(0, 'rgba(120,198,255,0.15)');
    wingGrad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    wingGrad.addColorStop(1, 'rgba(255,101,120,0.15)');
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(-bodyW, 3);
    ctx.lineTo(-10, -6);
    ctx.lineTo(-2, 4);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bodyW, 3);
    ctx.lineTo(10, -6);
    ctx.lineTo(2, 4);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();

    // Body
    const g = ctx.createLinearGradient(0,-bodyH,0,bodyH);
    g.addColorStop(0, '#0b1426');
    g.addColorStop(1, '#1c2c4a');
    ctx.fillStyle = g;
    roundRect(-12,-10,24,20,6,true,false);

    // Accent stripe
    ctx.fillStyle = this.tint;
    roundRect(-12,-2,24,4,2,true,false);

    // Cockpit
    ctx.fillStyle='#dfe9ff';
    ctx.beginPath(); ctx.arc(0,-1,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=this.tint;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(0,-1,6,0,Math.PI*2); ctx.strokeStyle=this.tint; ctx.lineWidth=1; ctx.stroke();
    ctx.globalAlpha = 1;

    // Belly glow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = this.tint;
    ctx.beginPath(); ctx.ellipse(0, 11, 10, 5, 0, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  }
}

class Boss {
  constructor(){
    this.x = canvas.width/2; this.y = 100;
    this.w=120; this.h=48; this.hpMax=40; this.hp=this.hpMax;
    this.dir=1; this.speed=110;

    // Laser cycle
    this.fireInterval = 2.5;              // total cycle time requested
    this.chargeDuration = 1.2;            // telegraph time
    this.beamDuration = 0.7;              // beam is active
    this.timer = this.fireInterval;       // counts down when idle
    this.state = 'idle';                  // 'idle' | 'charge' | 'beam'
    this.beamHitApplied = false;          // prevent multi-hit per beam
    this.beamWidth = 44;                  // base beam width
  }
  update(dt){
    // strafe
    this.x += this.dir*this.speed*dt;
    if(this.x<60){this.x=60; this.dir=1;}
    if(this.x>canvas.width-60){this.x=canvas.width-60; this.dir=-1;}

    // laser state machine
    this.timer -= dt;
    if(this.state==='idle'){
      if(this.timer<=0){ this.state='charge'; this.timer=this.chargeDuration; }
    } else if(this.state==='charge'){
      if(this.timer<=0){ this.state='beam'; this.timer=this.beamDuration; this.beamHitApplied=false; }
    } else if(this.state==='beam'){
      // check collision while beam active
      const half = this.getBeamWidth()/2;
      if(!this.beamHitApplied && Math.abs(player.x - this.x) < (half + player.radius) && player.y > this.y - this.h/2){
        if(player.takeHit()) this.beamHitApplied = true;
      }
      if(this.timer<=0){ this.state='idle'; this.timer=this.fireInterval; }
    }
  }
  draw(){
    // Body
    ctx.save(); ctx.translate(this.x,this.y);

    // Charging glow
    if(this.state==='charge'){
      const p = 1 - (this.timer/this.chargeDuration);
      const pulse = 0.4 + Math.sin(performance.now()/70)*0.2;
      ctx.shadowColor = '#ff2e63';
      ctx.shadowBlur = 30*(p+pulse);
    } else {
      ctx.shadowBlur = 0;
    }

    // Hull
    const g = ctx.createLinearGradient(0,-this.h/2,0,this.h/2);
    g.addColorStop(0,'#2e0f1c');
    g.addColorStop(1,'#4a1d30');
    ctx.fillStyle = g;
    roundRect(-this.w/2,-this.h/2,this.w,this.h,12,true,false);

    // Core
    ctx.fillStyle = '#ffd166';
    roundRect(-18,-10,36,20,6,true,false);

    // Face accents
    ctx.fillStyle = '#ff2e63';
    roundRect(-this.w/2+6,-6,20,12,6,true,false);
    roundRect(this.w/2-26,-6,20,12,6,true,false);

    ctx.restore();

    // HP bar
    const bw = canvas.width-140, bh=10, bx=70, by=20;
    ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle='#ff2e63';
    ctx.fillRect(bx,by,Math.max(0,(this.hp/this.hpMax)*bw),bh);
    ctx.strokeStyle='#ff9fb4'; ctx.strokeRect(bx,by,bw,bh);

    // Beam rendering (draw after boss for layering)
    if(this.state==='charge'){
      // Telegraph vertical guide line and cone
      const w = this.getBeamWidth() * 0.5;
      const alpha = 0.15 + 0.15*Math.sin(performance.now()/90);
      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, canvas.height);
      grad.addColorStop(0, 'rgba(255,46,99,0.0)');
      grad.addColorStop(0.2, 'rgba(255,46,99,0.2)');
      grad.addColorStop(1, 'rgba(255,46,99,0.02)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(this.x - w, this.y + this.h/2);
      ctx.lineTo(this.x + w, this.y + this.h/2);
      ctx.lineTo(this.x + w*1.5, canvas.height);
      ctx.lineTo(this.x - w*1.5, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if(this.state==='beam'){
      // Actual beam
      const w = this.getBeamWidth();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, canvas.height);
      grad.addColorStop(0, 'rgba(255,46,99,0.9)');
      grad.addColorStop(0.4, 'rgba(255,171,0,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x - w/2, this.y + this.h/2, w, canvas.height);
      // beam core
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(this.x - w*0.18, this.y + this.h/2, w*0.36, canvas.height);
      ctx.restore();
    }
  }
  getBeamWidth(){
    if(this.state==='charge'){
      const p = 1 - (this.timer/this.chargeDuration);
      return this.beamWidth * (0.4 + 0.6*p);
    }
    return this.beamWidth;
  }
}

class Star {
  constructor(){
    this.reset();
    this.y = Math.random()*canvas.height;
  }
  reset(){
    this.x = Math.random()*canvas.width;
    this.y = -10;
    this.speed = 60 + Math.random()*140;
    this.size = Math.random()*2;
  }
  update(dt){
    this.y += this.speed*dt;
    if(this.y>canvas.height) this.reset();
  }
  draw(){
    ctx.fillStyle='white';
    ctx.fillRect(this.x,this.y,this.size,this.size);
  }
}

class Explosion {
  constructor(x,y){ this.x=x; this.y=y; this.t=0; this.dur=.45; }
  update(dt){ this.t+=dt; }
  draw(){
    const p = clamp(this.t/this.dur,0,1);
    ctx.fillStyle = `rgba(255, ${Math.floor(255*(1-p))}, 0, ${1-p})`;
    ctx.beginPath(); ctx.arc(this.x,this.y, p*28, 0, Math.PI*2); ctx.fill();
  }
}

/****************
 * Utilities    *
 ****************/
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function circColl(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return (dx*dx+dy*dy) <= (a.r+b.r)*(a.r+b.r); }
function circleRect(cx,cy,rx,ry,rw,rh,r=15){
  const closestX = Math.max(rx, Math.min(cx, rx+rw));
  const closestY = Math.max(ry, Math.min(cy, ry+rh));
  const dx=cx-closestX, dy=cy-closestY;
  return dx*dx+dy*dy <= r*r;
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

/****************
 * Core loop    *
 ****************/

// Seed objects
function resetStars(){ stars.length=0; for(let i=0;i<120;i++) stars.push(new Star()); }
function resetHUD(){
  scoreEl.textContent = String(score).padStart(6,'0');
  stageEl.textContent = String(stage);
  livesEl.innerHTML = Array.from({length:lives}).map(()=>'<i class="life"></i>').join('');
}

function startGame(fresh=true){
  started = true; paused=false; gameOver=false;
  hideOverlay(titleEl); hideOverlay(gameoverEl); hideOverlay(pausedEl);

  player = new Player();
  enemies.length=bullets.length=explosions.length=bonuses.length=0;
  score=0; lives=3; stage=1;
  boss=null; nextBossScore=300; hasSuperBlaster=false; enemyDestroyedCount=0;
  enemySpawnTimer=0; lastTime=performance.now();
  resetStars(); resetHUD();
}

function gameOverNow(){
  gameOver = true; started = false;
  document.getElementById('finalScore').textContent = `Final Score: ${score}`;
  showOverlay(gameoverEl);
}

function update(dt){
  stars.forEach(s=>s.update(dt));

  if(!started){ return; }

  if(boss){ /* suspend normal spawns */ } else {
    enemySpawnTimer += dt;
    if(enemySpawnTimer>=enemySpawnInterval){
      enemySpawnTimer -= enemySpawnInterval;
      spawnEnemy();
    }
  }

  player.update(dt);
  bullets = bullets.filter(b=> (b.y+b.r)>0);
  bullets.forEach(b=>b.update(dt));

  enemies.forEach((e,ei)=>{
    e.update(dt);
    if(e.y-e.r>canvas.height){
      enemies.splice(ei,1);
      player.takeHit();
    }
  });

  // collisions
  // bullets vs enemies
  for(let bi=bullets.length-1; bi>=0; bi--){
    for(let ei=enemies.length-1; ei>=0; ei--){
      if(circColl(bullets[bi], enemies[ei])){
        explosions.push(new Explosion(enemies[ei].x, enemies[ei].y));
        enemies.splice(ei,1);
        bullets.splice(bi,1);
        score+=10; enemyDestroyedCount++;
        if(enemyDestroyedCount>=20 && !hasSuperBlaster){ hasSuperBlaster=true; enemyDestroyedCount=0; }
        if(Math.random()<0.1){ // drop
          bonuses.push({x:bullets[bi]?.x||Math.random()*canvas.width, y:bullets[bi]?.y||0, r:10, type: Math.random()<0.5?'life':'booster', speed:150});
        }
        resetHUD();
        break;
      }
    }
  }

  // bullets vs boss
  if(boss){
    for(let bi=bullets.length-1; bi>=0; bi--){
      if(circleRect(bullets[bi].x, bullets[bi].y, boss.x-boss.w/2, boss.y-boss.h/2, boss.w, boss.h, bullets[bi].r)){
        explosions.push(new Explosion(boss.x,boss.y));
        bullets.splice(bi,1);
        boss.hp -= 2;
        if(boss.hp<=0){
          explosions.push(new Explosion(boss.x,boss.y));
          score+=200; boss=null; resetHUD();
        }
      }
    }
  }

  // player vs enemies
  for(let ei=enemies.length-1; ei>=0; ei--){
    if(circColl(player,enemies[ei])){
      explosions.push(new Explosion(player.x,player.y));
      enemies.splice(ei,1);
      player.takeHit();
    }
  }

  // bonuses
  for(let i=bonuses.length-1; i>=0; i--){
    const b = bonuses[i];
    b.y += b.speed*dt;
    if(circColl({x:player.x,y:player.y,r:player.radius}, {x:b.x,y:b.y,r:b.r||10})){
      if(b.type==='life'){ lives++; }
      else { player.giveBooster(); }
      bonuses.splice(i,1); resetHUD();
    } else if(b.y>canvas.height){ bonuses.splice(i,1); }
  }

  // explosions
  for(let i=explosions.length-1;i>=0;i--){
    explosions[i].update(dt);
    if(explosions[i].t>explosions[i].dur) explosions.splice(i,1);
  }

  // boss spawn
  if(!boss && score>=nextBossScore){
    boss = new Boss();
    nextBossScore += 300;
  }
  if(boss) boss.update(dt);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  stars.forEach(s=>s.draw());
  if(!started){
    // attract mode hint rendered by overlay text; keep starfield only
  } else {
    player.draw();
    bullets.forEach(b=>b.draw());
    enemies.forEach(e=>e.draw());
    bonuses.forEach(b=>{
      ctx.fillStyle = b.type==='life'?'#34d399':'#60a5fa';
      ctx.beginPath(); ctx.arc(b.x,b.y,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='12px system-ui, Arial';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(b.type==='life'?'+':'B', b.x, b.y);
    });
    explosions.forEach(ex=>ex.draw());
    if(boss) boss.draw();
  }
}

function spawnEnemy(){
  const x = 20 + Math.random()*(canvas.width-40);
  const speed = 80 + Math.random()*120 + stage*5;
  enemies.push(new Enemy(x,-30,speed));
}

/****************
 * Loop & input *
 ****************/
function loop(ts){
  if(!lastTime) lastTime = ts;
  if(!paused && !gameOver){
    const dt = (ts-lastTime)/1000;
    lastTime = ts;
    update(dt);
    draw();
  } else {
    lastTime = ts; // prevent dt jump after pause
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Keyboard
addEventListener('keydown', e=>{
  if(e.code==='Space') e.preventDefault();
  keys[e.code]=true;

  if(!started && (e.code==='Enter' || e.code==='Space')) {
    startGame();
  }
  if(e.code==='KeyP'){
    togglePause();
  }
});
addEventListener('keyup', e=>{ keys[e.code]=false; });

// Buttons
function bindPress(btn, down, up){
  if(!btn) return;
  const on = ()=>{ keys[down]=true; };
  const off= ()=>{ keys[down]=false; };
  btn.addEventListener('pointerdown', e=>{ e.preventDefault(); on(); });
  btn.addEventListener('pointerup',   e=>{ e.preventDefault(); off(); });
  btn.addEventListener('pointerleave',off);
  btn.addEventListener('pointercancel',off);
}

bindPress(leftBtn,'ArrowLeft');
bindPress(rightBtn,'ArrowRight');
bindPress(fireBtn,'Space');

pauseBtn?.addEventListener('click', ()=> togglePause());
startBtn?.addEventListener('click', ()=> { if(!started) startGame(); });
resumeBtn?.addEventListener('click', ()=> { if(paused) togglePause(false); });
restartBtn?.addEventListener('click', ()=> { startGame(true); });

function togglePause(force){
  if(!started || gameOver) return;
  paused = force===undefined ? !paused : !!force;
  if(paused){ showOverlay(pausedEl); } else { hideOverlay(pausedEl); lastTime=performance.now(); }
}

// Overlay helpers
function showOverlay(el){ el?.classList.add('show'); }
function hideOverlay(el){ el?.classList.remove('show'); }

// Initialize some stars on load so the title screen has motion
resetStars();
resetHUD();
draw();
