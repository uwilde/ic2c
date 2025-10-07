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
  MENU: 'menu',
  PLAYING: 'playing'
};

const INPUT_KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  ATTACK: 'KeyX',
  POWER: 'KeyZ',
  ACCEPT: 'Enter'
};

const preventDefaultKeys = new Set([
  INPUT_KEYS.LEFT,
  INPUT_KEYS.RIGHT,
  INPUT_KEYS.UP,
  INPUT_KEYS.DOWN,
  INPUT_KEYS.ATTACK,
  INPUT_KEYS.POWER,
  'Space'
]);

/** utils */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const range = (s, e) => { const a=[]; for(let i=s;i<=e;i++) a.push(i); return a; };
const framePaths = (s, e, t) => range(s, e).map((n)=>t.replace('%', n));
const createImage = (src) => new Promise((res, rej)=>{ const img=new Image(); img.src=src; img.onload=()=>res(img); img.onerror=(e)=>rej(e); });
const loadAudio = (src, { loop = false, volume = 1 } = {}) => new Promise((resolve, reject)=>{
  const audio = new Audio();
  audio.src = src;
  audio.loop = loop;
  audio.volume = volume;
  audio.preload = 'auto';
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
const playAudio = (audio, { reset = true } = {}) => {
  if(!audio) return;
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
  if(currentMusic) playAudio(currentMusic, { reset:true });
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
  players: {
    corky: {
      name: 'Corky',
      nativeFacing: 'left',
      walk: framePaths(1, 10, 'Corky/walk%.png'),
      attack: framePaths(1, 6, 'Corky/kick%.png'),
      hurt: framePaths(1, 2, 'Corky/hurt%.png'),
      power: framePaths(1, 21, 'Corky/power%.png'),
      portrait: 'corky_left_1.png'
    },
    boner: {
      name: 'Boiner',
      nativeFacing: 'right',
      walk: framePaths(1, 9, 'Boner/walk%.png'),
      attack: framePaths(1, 7, 'Boner/punch%.png'),
      hurt: framePaths(1, 2, 'Boner/hurt%.png'),
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
      mudball: framePaths(1, 15, 'Entrado/Mutant/mudball/mudball%.png')
    }
  }
};

const audioManifest = {
  menuMusic: { src:'start.mp3', loop:true, volume:0.5 },
  gameMusic: { src:'barsong.mp3', loop:true, volume:0.65 },
  menuNavigate: { src:'button1.mp3', volume:0.85 },
  menuSelect: { src:'startbutton.mp3', volume:0.85 },
  corkyPower: { src:'Corky/doplar.mp3', volume:0.9 },
  bonerPower: { src:'Boner/transform.mp3', volume:0.9 }
};

const loadFrameSet = async (paths) => Promise.all(paths.map((p)=>createImage(p)));

const loadAssets = async () => {
  const background = await createImage(assetManifest.background);

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
    if (data.power) players[key].power = await loadFrameSet(data.power);
  }

  const bigBoner = {
    walk: await loadFrameSet(assetManifest.bigBoner.walk),
    portrait: await createImage(assetManifest.bigBoner.portrait),
    nativeFacing: assetManifest.bigBoner.nativeFacing ?? 'right'
  };

  const enemies = {};
  for (const [key, data] of Object.entries(assetManifest.enemies)) {
    enemies[key] = {
      walk: await loadFrameSet(data.walk),
      hurt: await loadFrameSet(data.hurt),
      portrait: await createImage(data.portrait),
      nativeFacing: data.nativeFacing ?? 'right',
      explode: data.explode ? await loadFrameSet(data.explode) : null
    };
  }

  const boss = {};
  for (const [key, data] of Object.entries(assetManifest.boss)) {
    boss[key] = {
      idle: await loadFrameSet(data.idle),
      blast: await loadFrameSet(data.blast),
      damage: await createImage(data.damage),
      mudball: await loadFrameSet(data.mudball)
    };
  }

  const audio = {};
  for (const [key, data] of Object.entries(audioManifest)) {
    audio[key] = await loadAudio(data.src, data);
  }

  return { background, players, bigBoner, enemies, boss, audio };
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
    this.range=420;
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
    if(this.state===s) return;
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

    this.setAnimations({
      idle: ()=>new Animation([this.assets.walk[0]], 1, {loop:false}),
      walk: ()=>new Animation(this.assets.walk, 0.1),
      attack: ()=>new Animation(this.assets.attack, 0.07, {loop:false}),
      hurt: ()=>new Animation(this.assets.hurt, 0.15, {loop:false}),
      power: this.assets.power ? ()=>{ const a=new Animation(this.assets.power, 0.09, {loop:false}); a.reset(); return a; } : null,
      powerReverse: this.assets.power ? ()=>{ const r=[...this.assets.power].reverse(); const a=new Animation(r, 0.09, {loop:false}); a.reset(); return a; } : null
    });

    this.setState('idle');
  }

  setAnimations(f){ this.animationFactories=f; }
  setState(s){
    if(this.state===s) return;
    const factory=this.animationFactories[s]; if(!factory) return;
    this.state=s; this.currentAnimation=factory(); this.refreshMetrics();
    if(s!=='attack') this.isInAttackWindow=false;
    if(s==='power') this.powerSoundPlayed=false;
  }

  /** transformation progress for scaling during power anims */
  getPowerProgress(){
    const anim=this.currentAnimation; if(!this.isDuringPowerAnimation || !anim) return 0;
    const total=anim.frames?.length ?? 0; if(total<=1) return 0;
    return clamp(anim.index / (total - 1), 0, 1);
  }

  updateGameplay(dt, input, world, enemies){
    if(this.hurtTimer>0){
      this.hurtTimer=Math.max(0, this.hurtTimer-dt);
      if(this.hurtTimer===0 && this.isAlive()) this.setState('idle');
    }
    if(this.attackCooldown>0) this.attackCooldown=Math.max(0, this.attackCooldown-dt);

    if(this.mutation.enabled) this.updateMutation(dt, input, world, enemies);

    // During power animation: freeze motion & drive transform logic
    if(this.isDuringPowerAnimation){
      this.velocity.x=0; this.velocity.y=0;
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
    const movingLeft=input.isDown(INPUT_KEYS.LEFT);
    const movingRight=input.isDown(INPUT_KEYS.RIGHT);
    const movingUp=input.isDown(INPUT_KEYS.UP);
    const movingDown=input.isDown(INPUT_KEYS.DOWN);
    const wantsAttack=input.wasPressed(INPUT_KEYS.ATTACK);
    let vx=0, vy=0;
    if(movingLeft){ vx-=this.speed; this.facing=-1; }
    if(movingRight){ vx+=this.speed; this.facing=1; }
    if(movingUp) vy-=this.depthSpeed;
    if(movingDown) vy+=this.depthSpeed;
    this.velocity.x=vx; this.velocity.y=vy;

    if(this.mutation.state==='active') this.updateMutationActive(dt, enemies, world);

    if(this.hurtTimer<=0){
      if(wantsAttack && this.attackCooldown===0) this.performAttack(enemies, world);
      else if(vx!==0 || vy!==0){ if(this.state!=='attack') this.setState('walk'); }
      else if(this.state!=='attack' && this.state!=='hurt') this.setState('idle');
    }

    // keep in bounds
    this.position.x=clamp(this.position.x, world.bounds.left, world.bounds.right);
    this.position.y=clamp(this.position.y, FLOOR_Y - WALKWAY_HEIGHT, FLOOR_Y);

    // update lasers & particles
    this.updateLasers(dt, enemies, world);

    super.update(dt);
    this.resolveBossCollision(world);
  }

  performAttack(enemies, world){
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
      if(Math.abs(enemy.position.y - this.position.y) > 40) return;
      const reach=this.attackHitbox.width;
      const f=this.facing;
      const dx=(enemy.position.x - this.position.x)*f;
      if(dx<0 || dx>reach) return;
      if(enemy.receiveDamage(damage, f, context)){
        if(this.mutation.enabled && !this.mutation.active){
          this.mutation.meter=Math.min(this.mutation.max, this.mutation.meter + this.mutationGainOnHit);
        }
      }
    });
  }

  resolveBossCollision(world){
    const boss=world?.boss;
    if(!boss || boss.shouldRemove || boss.dying || !boss.isAlive()) return;
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
    this.setState('hurt');
    this.invulnerableTimer=0.85;
    this.velocity.x = sourceX < this.position.x ? 80 : -80;
    this.velocity.y = -20;
    return true;
  }

  updateMutation(dt, input, world, enemies){
    const m=this.mutation; if(!m.enabled) return;
    if(m.state==='idle'){
      if(m.meter>=m.max && input.wasPressed(INPUT_KEYS.POWER)){
        if(!this.animationFactories.power){ m.active=false; m.state='idle'; m.meter=m.max; console.warn(`[Player:${this.type}] Power animation missing`); return; }
        m.active=true; this.isDuringPowerAnimation=true; this.powerAnimationTimer=0; this.velocity.x=0; this.velocity.y=0;
        m.state = (m.mode==='burst') ? 'burst' : 'charging';
        this.setState('power');
        if(this.state!=='power' || !this.currentAnimation){ this.isDuringPowerAnimation=false; this.powerAnimationTimer=0; m.active=false; m.state='idle'; return; }
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

    // Big Boner walk cycle
    if(this.bigBonerWalk){
      this.bigBonerWalk.update(dt);
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
  }

  exitMutation(){
    if(!this.mutation.active || this.mutation.mode==='burst') return;
    this.mutation.state='draining'; this.mutation.active=false;
    this.isDuringPowerAnimation=true; this.powerAnimationTimer=0; this.pendingMutationReverse=true;
    this.setState('powerReverse');
  }

  finishMutationCooldown(){
    if(this.mutation.mode==='burst'){ this.finishBurst(); return; }
    this.mutation.state='idle'; this.mutation.meter=0; this.mutation.timer=0; this.setState('idle');
  }

  finishBurst(){
    if(this.burst){ this.burst.intensity=0; this.burst.hasWiped=false; }
    this.mutation.active=false; this.mutation.state='idle'; this.mutation.meter=0; this.mutation.timer=0; this.setState('idle');
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
    const screenY=Math.round(this.position.y - (this.height ?? 160)*0.55);
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
    const drawX=Math.round(this.position.x - cameraX - w/2);
    const drawY=Math.round(this.position.y - h);

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
    const endX = originX + 360 * this.facing;
    const endYTop = originY - 6;
    const endYBot = originY + 6;

    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const drawBeam=(yEnd)=>{
      const grad=ctx.createLinearGradient(originX, originY, endX, yEnd);
      grad.addColorStop(0, 'rgba(255,255,215,0.25)');
      grad.addColorStop(1, 'rgba(255,70,0,0)');
      ctx.lineWidth=4;
      ctx.strokeStyle=grad;
      ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(endX, yEnd); ctx.stroke();
    };
    drawBeam(endYTop); drawBeam(endYBot);
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
    this.speed=config.speed ?? 110; this.depthSpeed=config.depthSpeed ?? 100;
    this.attackRange=config.attackRange ?? 55; this.attackDamage=config.attackDamage ?? 10;
    this.attackCooldown=0; this.maxHp=config.maxHp ?? 60; this.hp=this.maxHp;
    this.baseScale=config.baseScale ?? computeScale(this.assets.walk[0], ENEMY_HEIGHT);
    this.hurtTimer=0; this.dying=false; this.shouldRemove=false;
    this.exitSpeed = config.exitSpeed ?? 180;
    this.exiting=false;
    this.countsTowardKill = config.countsTowardKill ?? true;
    this.onDefeated = config.onDefeated ?? null;
    this.isBoss=false;
    this._defeatNotified=false;

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
      if(this.position.x > world.bounds.right + 240) this.shouldRemove=true;
      return;
    }
    if(this.dying){
      this.velocity.x=0; this.velocity.y=0; super.update(dt);
      if(this.currentAnimation?.done) this.shouldRemove=true; return;
    }
    if(!this.isAlive()){ this.beginDefeat(); return; }

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
    this.position.x=clamp(this.position.x, world.bounds.left, world.bounds.right);
    super.update(dt);
  }
  tryAttack(player){
    if(this.attackCooldown>0) return;
    this.setState('attack'); this.attackCooldown=1.1;
    const resolve=()=>{
      const i=this.currentAnimation.index;
      if(i===2 && player) player.receiveDamage(this.attackDamage, this.position.x);
      if(this.currentAnimation.done) this.setState('walk');
    };
    const original=this.currentAnimation.update.bind(this.currentAnimation);
    this.currentAnimation.update=(dt)=>{ original(dt); resolve(); };
  }
  receiveDamage(amount, sourceX){
    if(this.dying) return false;
    const took=super.receiveDamage(amount, sourceX);
    if(!took) return false;
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
    this.frames=config.frames;
    this.baseScale=config.baseScale ?? computeScale(this.frames[0], config.targetHeight ?? 88);
    this.setAnimations({ fly: ()=>new Animation(this.frames, config.frameDuration ?? 0.06) });
    this.setState('fly');
    this.maxHp=config.maxHp ?? 3; this.hp=this.maxHp;
    this.speed=config.speed ?? 155;
    this.turnRate=config.turnRate ?? 3.6;
    this.damage=config.damage ?? 16;
    this.shouldRemove=false;
    this.countsTowardKill=false;
    this.isMudball=true;
    this.isBoss=false;
    this.wasStruck=false;
    this.nativeFacing='right';
    this.velocity.x = config.initialVelocity ?? -125;
    this.velocity.y = 0;
  }
  update(dt, world, player){
    if(this.shouldRemove) return;
    if(this.invulnerableTimer>0) this.invulnerableTimer=Math.max(0, this.invulnerableTimer-dt);
    const target=player;
    if(target){
      const targetX=target.position.x;
      const targetY=target.position.y - 28;
      const dx=targetX - this.position.x;
      const dy=targetY - this.position.y;
      const dist=Math.max(1, Math.hypot(dx, dy));
      const desiredVx=(dx/dist)*this.speed;
      const desiredVy=(dy/dist)*(this.speed*0.55);
      const blend = 1 - Math.exp(-this.turnRate*dt);
      this.velocity.x += (desiredVx - this.velocity.x) * blend;
      this.velocity.y += (desiredVy - this.velocity.y) * blend;
    }
    super.update(dt);
    this.refreshMetrics();
    this.position.y=clamp(this.position.y, FLOOR_Y - WALKWAY_HEIGHT + 8, FLOOR_Y - 6);
    this.zOrder=this.position.y;
    if(player) this.checkCollision(player);
    if(this.position.x < world.bounds.left - 320 || this.position.x > world.bounds.right + 480) this.shouldRemove=true;
  }
  checkCollision(player){
    if(!player || this.shouldRemove) return;
    const dx=Math.abs(player.position.x - this.position.x);
    const dy=Math.abs(player.position.y - this.position.y);
    const reachX=((player.width ?? 80)*0.45) + ((this.width ?? 40)*0.45);
    const reachY=((player.height ?? 160)*0.15) + ((this.height ?? 70)*0.25);
    if(dx <= reachX && dy <= reachY){
      player.receiveDamage(this.damage, this.position.x);
      this.shouldRemove=true;
    }
  }
  receiveDamage(amount, sourceX, context={}){
    if(this.shouldRemove) return false;
    const type=context.type ?? context.source ?? 'normal';
    if(type==='melee'){
      this.wasStruck=true;
      this.hp=0;
      this.shouldRemove=true;
      this.invulnerableTimer=0;
      return true;
    }
    if(this.invulnerableTimer>0) return false;
    this.wasStruck=true;
    const hits=context.isSpecial ? this.maxHp : 1;
    this.hp=Math.max(0, this.hp - hits);
    this.invulnerableTimer=0.18;
    if(this.hp===0) this.shouldRemove=true;
    return true;
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
    this.spawnHandOffset=config.spawnHandOffset ?? {x:-110, y:-220};
    this.nativeFacing='left';
    this.facing=-1;
    this.spawnedMudball1=false;
    this.spawnedMudball2=false;
    this.contactDamage=config.contactDamage ?? 20;
    this.contactCooldown=0;
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
    this.spawnedMudball1=false;
    this.spawnedMudball2=false;
    this.setState('windup');
  }
  handleWindupEvents(player){
    const anim=this.currentAnimation; if(!anim) return;
    const idx=anim.index;
    if(!this.spawnedMudball1 && idx>=11){ this.spawnMudball(player, 1); this.spawnedMudball1=true; }
    if(!this.spawnedMudball2 && idx>=17){ this.spawnMudball(player, 2); this.spawnedMudball2=true; }
  }
  spawnMudball(player, order=1){
    if(!this.world || !Array.isArray(this.mudballFrames)) return;
    const scale=this.baseScale;
    const offset=this.spawnHandOffset;
    const spawnX=this.position.x + offset.x*scale;
    const spawnY=this.position.y + offset.y*scale;
    const baseSpeed=155;
    const speedFactor = order===2 ? 0.72 : 1;
    const speed=baseSpeed * speedFactor;
    const initialVelocity=-125 * speedFactor;
    const ball=new Mudball({
      spawnX,
      spawnY,
      frames:this.mudballFrames,
      targetHeight:90,
      speed,
      turnRate:3.9,
      damage:20,
      initialVelocity
    });
    this.world.addMudball(ball);
    if(this.world) this.world.triggerShake(0.22, 4);
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
    let applied=amount;
    if(isSpecial){
      if(type==='burst') applied=Math.max(applied, 80);
      else if(type==='laser') applied=Math.max(applied, 28);
      else if(type==='mutation_melee') applied=Math.max(applied, amount*1.6);
      else applied=Math.max(applied, amount*1.35);
    }else if(type==='melee'){
      applied = Math.max(4, Math.min(amount*0.35, 7));
    }
    this.hp=Math.max(0, this.hp - applied);
    this.damageFlashTimer=0.32;
    this.invulnerableTimer=isSpecial ? 0.45 : 0.35;
    if(this.hp<=0){ this.beginDefeat(); }
    return true;
  }
  applySpecialDamage(kind, sourceX){
    const mapping={
      burst:80,
      laser:30,
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
  constructor(assets){
    this.assets=assets;
    this.bounds={ left:100, right: assets.background.width - 100 };
    this.cameraX=0; this.entities=[]; this.player=null; this.enemies=[];
    this.spawnTimer=3; this.spawnInterval=4.5; this.maxEnemies=4;
    this.spawnEnabled=true;
    this.defeatedCount=0;
    this.encounterPhase='normal';
    this.boss=null;
    this.mudballs=new Set();
    this.shake={ timer:0, duration:0, magnitude:0, offsetX:0, offsetY:0 };
    this.backgroundScale = CANVAS_HEIGHT / assets.background.height;
    this.backgroundWidth = assets.background.width * this.backgroundScale;
  }
  setPlayer(p){ this.player=p; this.entities.push(p); }
  spawnEnemy(){
    if(!this.player || !this.spawnEnabled) return;
    const keys=Object.keys(this.assets.enemies);
    const key=keys[Math.floor(Math.random()*keys.length)];
    const assets=this.assets.enemies[key];
    const spawnX=this.player.position.x + (Math.random()>0.5 ? 600 : -600);
    const enemyBaseScale = computeScale(assets.walk[0], ENEMY_HEIGHT + Math.random()*12);
    const mult = SCALE_OVERRIDES.enemies[key] ?? 1;
    const config={
      assets,
      spawnX: clamp(spawnX, this.bounds.left+80, this.bounds.right-80),
      spawnY: FLOOR_Y - 40 - Math.random()*90,
      speed: 90 + Math.random()*40,
      attackDamage: 8 + Math.random()*6,
      baseScale: enemyBaseScale * mult,
      nativeFacing: assets.nativeFacing ?? 'right',
      initialFacing: (assets.nativeFacing ?? 'right') === 'left' ? -1 : 1,
      explode: assets.explode,
      onDefeated: (enemy)=>this.handleEnemyDefeated(enemy)
    };
    const e=new Enemy(config); this.enemies.push(e); this.entities.push(e);
  }
  update(dt){
    if(!this.player) return;
    this.player.updateGameplay(dt, input, this, this.enemies);
    for(const e of this.enemies) e.update(dt, this, this.player);
    this.enemies = this.enemies.filter(e=>!e.shouldRemove);
    for(const ball of [...this.mudballs]){ if(ball.shouldRemove) this.mudballs.delete(ball); }
    if(this.boss && this.boss.shouldRemove) this.boss=null;
    this.updateCamera(); this.handleSpawning(dt);
    this.updateShake(dt);
    this.handleEncounterProgress();
  }
  addMudball(ball){
    if(!ball) return;
    this.mudballs.add(ball);
    this.enemies.push(ball);
  }
  handleEnemyDefeated(enemy){
    if(!enemy || !enemy.countsTowardKill) return;
    this.defeatedCount+=1;
    if(this.defeatedCount>=25) this.startBossEvac();
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
      scaleMultiplier:1.25,
      contactDamage:24,
      collision:{
        widthFactor:0.46,
        heightFactor:0.88,
        offsetXFactor:0.1,
        offsetYFactor:0.02
      },
      onDefeated:()=>this.handleBossDefeated()
    });
    this.boss=boss;
    this.enemies.push(boss);
    this.triggerShake(2.5, 11);
  }
  handleBossDefeated(){
    this.encounterPhase='cleared';
    this.triggerShake(1.5, 6);
  }
  updateCamera(){
    if(!this.player) return;
    const half=CANVAS_WIDTH/2;
    const maxCam=this.assets.background.width*this.backgroundScale - CANVAS_WIDTH;
    this.cameraX = clamp(this.player.position.x * this.backgroundScale - half, 0, maxCam);
  }
  handleSpawning(dt){
    if(!this.spawnEnabled) return;
    if(this.enemies.length>=this.maxEnemies) return;
    this.spawnTimer-=dt;
    if(this.spawnTimer<=0){ this.spawnEnemy(); this.spawnTimer=this.spawnInterval + Math.random(); }
  }
  handleEncounterProgress(){
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
  menu: { options: [], selectedIndex: 0, blinkTimer: 0 },
  loading: { progress: 0 }
};

const initMenu = () => {
  game.menu.options = [
    { key: 'corky', label: 'Corky', assets: game.assets.players.corky },
    { key: 'boner', label: 'Boiner', assets: game.assets.players.boner }
  ];
  game.menu.selectedIndex=0; game.menu.blinkTimer=0; game.menu.gridPhase=0;
  if(game.audio){
    game.audio.menuMusicPlaying=false;
  }
};

const startGameWithCharacter = (characterKey) => {
  const world = new GameWorld(game.assets);
  const spawnX=200, spawnY=FLOOR_Y - 12;

  if(characterKey==='corky'){
    const base=computeScale(game.assets.players.corky.walk[0], PLAYER_HEIGHT);
    const mult=SCALE_OVERRIDES.players.corky ?? 1;
    const scale=base*mult;
    const player = new Player({
      type:'corky', name:'Corky', assets:game.assets.players.corky,
      spawnX, spawnY, attackPower:18, hitFrameWindow:{start:2,end:4},
      baseScale:scale, mutationEnabled:true, mutationMode:'burst', mutationLabel:'POWER',
      mutationGainOnHit:18, burstPeakFrame:15, burstRadius:520,
      nativeFacing: game.assets.players.corky.nativeFacing
    });
    world.setPlayer(player);
  } else if (characterKey==='boner'){
    const bonerBase = computeScale(game.assets.players.boner.walk[0], PLAYER_HEIGHT);
    const player = new Player({
      type:'boner', name:'Boiner', assets:game.assets.players.boner,
      spawnX, spawnY, attackPower:16, hitFrameWindow:{start:3,end:5},
      baseScale: bonerBase,
      mutationEnabled:true, mutationMode:'transform', mutationGainOnHit:22,
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
  game.menu.blinkTimer+=dt;
  if(input.wasPressed(INPUT_KEYS.LEFT)){
    playAudio(game.audio?.menuNavigate);
    game.menu.selectedIndex = (game.menu.selectedIndex + game.menu.options.length - 1) % game.menu.options.length;
  } else if(input.wasPressed(INPUT_KEYS.RIGHT)){
    playAudio(game.audio?.menuNavigate);
    game.menu.selectedIndex = (game.menu.selectedIndex + 1) % game.menu.options.length;
  }
  if(input.wasPressed(INPUT_KEYS.ACCEPT)){
    playAudio(game.audio?.menuSelect);
    const choice=game.menu.options[game.menu.selectedIndex];
    startGameWithCharacter(choice.key);
  }
};

const drawMenu = () => {
  const bg=game.assets?.background;
  if(bg){
    const scale=Math.max(CANVAS_WIDTH/bg.width, CANVAS_HEIGHT/bg.height);
    const w=bg.width*scale, h=bg.height*scale;
    const ox=(CANVAS_WIDTH-w)/2, oy=(CANVAS_HEIGHT-h)/2;
    ctx.drawImage(bg, ox, oy, w, h);
  } else {
    ctx.fillStyle='#0f0a23'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  }
  ctx.fillStyle='rgba(6,4,22,0.75)'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha=0.18; ctx.strokeStyle='#4c58ff'; ctx.lineWidth=1; ctx.setLineDash([6,18]);
  const grid=48, phase=game.menu.gridPhase ?? 0;
  const sx=-grid + (phase % grid);
  for(let x=sx; x<CANVAS_WIDTH+grid; x+=grid){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,CANVAS_HEIGHT); ctx.stroke(); }
  const sy=-grid + ((phase*0.6) % grid);
  for(let y=sy; y<CANVAS_HEIGHT+grid; y+=grid){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_WIDTH,y); ctx.stroke(); }
  ctx.restore();

  ctx.save();
  const tg=ctx.createLinearGradient(CANVAS_WIDTH/2-220,0,CANVAS_WIDTH/2+220,0);
  tg.addColorStop(0,'#ff5ef6'); tg.addColorStop(0.5,'#ffe066'); tg.addColorStop(1,'#5ecbff');
  ctx.shadowColor='#ffb347'; ctx.shadowBlur=18; ctx.fillStyle=tg;
  ctx.font='36px "Press Start 2P", monospace'; ctx.textAlign='center';
  ctx.fillText('HANKYPANKAPOCOLYPSE', CANVAS_WIDTH/2, 86);
  ctx.restore();

  ctx.font='16px "Press Start 2P", monospace'; ctx.fillStyle='#bfd2ff';
  ctx.fillText('SELECT YOUR WARRIOR', CANVAS_WIDTH/2, 140);

  const cardsY=172, cardW=260, cardH=280, spacing=320;
  const centerOffset=(game.menu.options.length-1)*spacing*0.5;

  game.menu.options.forEach((opt, i)=>{
    const x=CANVAS_WIDTH/2 + i*spacing - centerOffset;
    const cardX = x - cardW/2;
    const g=ctx.createLinearGradient(0,cardsY,0,cardsY+cardH);
    g.addColorStop(0,'rgba(8,13,48,0.95)'); g.addColorStop(1,'rgba(18,20,60,0.95)');
    ctx.fillStyle=g; ctx.fillRect(cardX, cardsY, cardW, cardH);
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.strokeRect(cardX, cardsY, cardW, cardH);

    const portrait=opt.assets.portrait;
    const maxW=cardW-60, maxH=cardH-150;
    const s=Math.min(maxW/portrait.width, maxH/portrait.height);
    const w=portrait.width*s, h=portrait.height*s;
    ctx.drawImage(portrait, x - w/2, cardsY + 36 + (maxH - h)/2, w, h);

    ctx.font='18px "Press Start 2P", monospace'; ctx.fillStyle='#ffe07d';
    ctx.fillText(opt.label.toUpperCase(), x, cardsY + cardH - 40);

    ctx.font='12px "Press Start 2P", monospace'; ctx.fillStyle='#99aaff';
    const flavor = opt.key==='corky' ? 'Whiskey-Fueled Footwork' : 'Mutation-Ready Brawler';
    ctx.fillText(flavor, x, cardsY + cardH - 18);

    if(i===game.menu.selectedIndex){
      const pulse=(Math.sin(game.menu.blinkTimer*5)+1)*0.5;
      ctx.save();
      const hg=ctx.createLinearGradient(cardX, cardsY, cardX+cardW, cardsY+cardH);
      hg.addColorStop(0,`rgba(255,208,120,${0.55 + pulse*0.25})`);
      hg.addColorStop(1,`rgba(255,99,71,${0.4 + pulse*0.25})`);
      ctx.lineWidth=4; ctx.strokeStyle=hg;
      ctx.shadowColor='rgba(255,225,160,0.8)'; ctx.shadowBlur=24 + pulse*14;
      ctx.strokeRect(cardX-6, cardsY-6, cardW+12, cardH+12);
      ctx.restore();

      ctx.save(); ctx.fillStyle='rgba(255,220,160,0.25)';
      ctx.fillRect(cardX, cardsY, cardW, 72); ctx.restore();
    }
  });

  const pulse=0.55 + 0.45*Math.abs(Math.sin(game.menu.blinkTimer*4));
  ctx.font='14px "Press Start 2P", monospace'; ctx.fillStyle='#b9c4ff';
  ctx.fillText('ARROWS TO MOVE   X: ATTACK   Z: MUTATION', CANVAS_WIDTH/2, CANVAS_HEIGHT-86);
  ctx.fillStyle=`rgba(255,238,140,${pulse})`;
  ctx.fillText('PRESS ENTER TO BEGIN', CANVAS_WIDTH/2, CANVAS_HEIGHT-52);
};

const updateGame = (dt) => { if(!game.world) return; game.world.update(dt); };
const drawGame = () => {
  if(!game.world) return;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  game.world.draw(ctx); drawHUD();
};

const drawHUD = () => {
  const p=game.world.player; if(!p) return;
  const margin=24, hpW=260, hpH=18;
  ctx.fillStyle='#111'; ctx.fillRect(margin-2, margin-2, hpW+4, hpH+4);
  const hpRatio=p.hp/p.maxHp; ctx.fillStyle='#ff4757'; ctx.fillRect(margin, margin, hpW*hpRatio, hpH);
  ctx.strokeStyle='#f8f8f8'; ctx.lineWidth=2; ctx.strokeRect(margin, margin, hpW, hpH);
  ctx.font='14px "Press Start 2P", monospace'; ctx.fillStyle='#fff'; ctx.textAlign='left';
  ctx.fillText(`${p.name}`, margin, margin + hpH + 24);

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
    case GAME_STATES.MENU: updateMenu(dt); drawMenu(); break;
    case GAME_STATES.PLAYING: updateGame(dt); drawGame(); break;
  }
  input.postUpdate();
  requestAnimationFrame(gameLoop);
};

const boot = async () => {
  try{
    const assets = await loadAssets();
    game.assets = assets;
    game.audio = assets.audio ?? null;
    initMenu(); game.state = GAME_STATES.MENU;
  }catch(e){
    console.error('Failed to load assets', e);
    ctx.fillStyle='#400'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    ctx.fillStyle='#fff'; ctx.font='18px monospace'; ctx.textAlign='center';
    ctx.fillText('Failed to load assets. Check console.', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
  }
};
boot(); requestAnimationFrame(gameLoop);
/* --- end patched game.js --- */
