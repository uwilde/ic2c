
// Simple Eagles Club Beat'em Up
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // UI Elements
  const menuModal = document.getElementById('menuModal');
  const scoresModal = document.getElementById('scoresModal');
  const btnMenu = document.getElementById('btnMenu');
  const btnNew = document.getElementById('btnNew');
  const btnLoad = document.getElementById('btnLoad');
  const btnHighScores = document.getElementById('btnHighScores');
  const menuNew = document.getElementById('menuNew');
  const menuLoad = document.getElementById('menuLoad');
  const menuScores = document.getElementById('menuScores');
  const menuClose = document.getElementById('menuClose');
  const selectButtons = [...document.querySelectorAll('[data-choose]')];
  const difficultySel = document.getElementById('difficulty');
  const volumeSlider = document.getElementById('volume');
  const volLabel = document.getElementById('volLabel');

  const scoresClose = document.getElementById('scoresClose');
  const scoresClear = document.getElementById('scoresClear');
  const scoresTableBody = document.querySelector('#scoresTable tbody');

  // Audio (WebAudio tones)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let masterGain = audioCtx.createGain();
  masterGain.gain.value = parseFloat(volumeSlider.value);
  masterGain.connect(audioCtx.destination);
  const beep = (freq=440, dur=0.06, type='square', vol=0.15) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(masterGain);
    o.start();
    setTimeout(()=>{o.stop(); o.disconnect(); g.disconnect();}, dur*1000);
  };

  volumeSlider.addEventListener('input', ()=>{
    masterGain.gain.value = parseFloat(volumeSlider.value);
    volLabel.textContent = Math.round(parseFloat(volumeSlider.value)*100)+'%';
  });

  // Asset loader with graceful fallback
  const loadImage = (src) => new Promise(res => {
    const img = new Image();
    img.onload = ()=>res(img);
    img.onerror = ()=>res(null);
    img.src = src;
  });
  const ASSETS = {
    bg: 'assets/eaglesclub.png',
    Boner: {
      walk: Array.from({length:9}, (_,i)=>`assets/Boner/walk${i+1}.png`),
      punch: Array.from({length:5}, (_,i)=>`assets/Boner/punch${i+1}.png`),
      power: Array.from({length:9}, (_,i)=>`assets/Boner/power${i+1}.png`),
    },
    BigBoner: {
      walk: Array.from({length:9}, (_,i)=>`assets/BigBoner/walk${i+2}.png`), // 2..10
      idle: 'assets/BigBoner/walk2.png'
    },
    Corky: {
      walk: Array.from({length:10}, (_,i)=>`assets/Corky/walk${i+1}.png`),
      kick: Array.from({length:6}, (_,i)=>`assets/Corky/kick${i+1}.png`)
    },
    Entrado: {
      walk: Array.from({length:13}, (_,i)=>`assets/Entrado/walk${i+1}.png`)
    },
    Peppers: {
      walk: Array.from({length:16}, (_,i)=>`assets/Peppers/walk${i+1}.png`)
    }
  };

  const images = {};
  const loadAll = async () => {
    for (const [k,v] of Object.entries(ASSETS)){
      if (typeof v === 'string'){
        images[k] = await loadImage(v);
      } else if (Array.isArray(v)){
        images[k] = await Promise.all(v.map(loadImage));
      } else {
        images[k] = {};
        for (const [k2,v2] of Object.entries(v)){
          if (Array.isArray(v2)) images[k][k2] = await Promise.all(v2.map(loadImage));
          else images[k][k2] = await loadImage(v2);
        }
      }
    }
  };

  // Utility draw functions
  const drawPlaceholder = (x,y,w,h,text, color='#2e3a4a') => {
    ctx.fillStyle = color; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = '#708090'; ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '14px monospace';
    ctx.fillText(text, x+6, y+18);
  };
  const drawSprite = (img, x,y,w,h, flip=false) => {
    if (!img){
      drawPlaceholder(x,y,w,h,'(missing png)');
      return;
    }
    ctx.save();
    if (flip){
      ctx.translate(x+w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
    ctx.restore();
  };

  // Game state
  let state = {
    running: true,
    paused: false,
    scrollX: 0,
    player: null,
    playerChoice: 'Boner',
    difficulty: 'normal',
    score: 0,
    lives: 3,
    power: 0, // 0..100
    wave: 1,
    enemies: [],
    projectiles: [],
    t: 0
  };

  const DIFF = {
    easy:   {enemyHP: 3, enemyDmg: 4, spawn: 120},
    normal: {enemyHP: 4, enemyDmg: 6, spawn: 90},
    hard:   {enemyHP: 6, enemyDmg: 8, spawn: 70},
  };

  // Player/Enemy classes
  class Entity {
    constructor(opts){
      Object.assign(this, {x:100, y:H-190, w:80, h:120, vx:0, vy:0, dir:1, onGround:true, hp:10, maxhp:10, type:'entity'}, opts);
    }
    rect(){return {x:this.x, y:this.y, w:this.w, h:this.h};}
    hitbox(){return this.rect();}
    intersects(b){
      const a = this.hitbox();
      return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
    }
  }

  class Player extends Entity {
    constructor(kind){
      super({type:'player', kind});
      this.anim = {t:0, i:0, name:'idle'};
      this.bigMode = false;
      this.bigTimer = 0;
      this.invuln = 0;
    }
    get speed(){ return this.bigMode ? 3.2 : 2.6; }
    get dmg(){ return this.bigMode ? 4 : 2; }
    get laser(){ return this.bigMode; }
    get frames(){
      if (this.kind==='Boner'){
        return {
          idle: images.Boner.walk?.[0],
          walk: images.Boner.walk,
          hit: images.Boner.punch,
          power: images.Boner.power,
          bigIdle: images.BigBoner.idle,
          bigWalk: images.BigBoner.walk
        };
      } else {
        return {
          idle: images.Corky.walk?.[0],
          walk: images.Corky.walk,
          hit: images.Corky.kick,
          power: null,
          bigIdle: null,
          bigWalk: null
        };
      }
    }
    update(keys){
      // physics
      this.vy += 0.7;
      this.y += this.vy;
      if (this.y > H-170){ this.y = H-170; this.vy = 0; this.onGround = true; } else this.onGround = false;
      this.x = Math.max(40, Math.min(W-120, this.x + this.vx));

      // scrolling
      if (this.x > W*0.65) state.scrollX += (this.x - W*0.65);
      if (this.x < W*0.35) state.scrollX -= (W*0.35 - this.x);
      this.x = Math.max(W*0.15, Math.min(W*0.85, this.x));

      // animations
      this.anim.t++;
      const spd = (this.anim.name==='walk'||this.anim.name==='hit'||this.anim.name==='bigWalk')? 6 : 10;
      if (this.anim.t>spd){ this.anim.t=0; this.anim.i++; }

      // timers
      if (this.invuln>0) this.invuln--;
      if (this.bigMode){
        this.bigTimer--;
        if (this.bigTimer <= 0){
          // play power animation reverse back to normal
          this.bigMode = false;
          this.anim = {t:0,i: (this.frames.power? this.frames.power.length-1:0), name:'powerReverse'};
        }
      }
    }
    control(keys){
      if (this.anim.name.startsWith('power')){
        // locked during power anims
        return;
      }
      this.vx = 0;
      if (keys.left){ this.vx = -this.speed; this.dir = -1; this._setAnim(this.bigMode?'bigWalk':'walk'); }
      else if (keys.right){ this.vx = this.speed; this.dir = 1; this._setAnim(this.bigMode?'bigWalk':'walk'); }
      else { this._setAnim(this.bigMode?'bigIdle':'idle'); }
      if (keys.up && this.onGround){ this.vy = -12; beep(160,0.06,'triangle',0.12); }
      if (keys.hit && !this._hitLock){
        this._hitLock = true;
        this._setAnim('hit', true);
        setTimeout(()=>{ this._hitLock=false; }, 220);
        // apply damage to nearby enemy
        const reach = {x:this.x + (this.dir>0? this.w-10:-40), y:this.y+30, w: 50, h:40};
        state.enemies.forEach(e=>{
          if (rectsIntersect(reach, e.hitbox())){ e.hurt(this.dmg); }
        });
        beep(420,0.05,'square',0.15);
      }
      if (keys.power && !this.bigMode && state.power>=100 && this.kind==='Boner'){
        // play power anim forward, then enter big mode
        this._setAnim('power', true);
        state.power = 0;
        this.vx = 0;
        setTimeout(()=>{
          this.bigMode = true;
          this.bigTimer = 60*8; // 8 seconds
          this._setAnim('bigIdle');
          beep(220,0.2,'sawtooth',0.2);
        }, (this.frames.power? this.frames.power.length*80: 800));
      }
    }
    _setAnim(name, reset=false){
      if (this.anim.name!==name || reset){
        this.anim = {name, t:0, i:0};
      }
    }
    draw(){
      const f = this.frames;
      let img=null, flip=false;
      switch(this.anim.name){
        case 'idle': img=f.idle; break;
        case 'walk': img=f.walk?.[this.anim.i % (f.walk?.length||1)]; break;
        case 'hit': img=f.hit?.[this.anim.i % (f.hit?.length||1)]; break;
        case 'power': img=f.power?.[this.anim.i % (f.power?.length||1)]; break;
        case 'powerReverse':
          if (f.power){
            const idx = Math.max(0, (f.power.length-1) - (this.anim.i % f.power.length));
            img = f.power[idx];
            if (this.anim.i >= f.power.length){ this._setAnim('idle'); }
          }
          break;
        case 'bigIdle': img=f.bigIdle; break;
        case 'bigWalk': img=f.bigWalk?.[this.anim.i % (f.bigWalk?.length||1)]; break;
        default: img=f.idle;
      }
      // Direction flip logic
      flip = (this.kind==='Corky') ? (this.dir>0) : (this.dir<0);
      drawSprite(img, this.x, this.y, this.w, this.h, flip);

      // Eyelaser
      if (this.bigMode && state.t%8<4){
        const eyeY = this.y+45;
        const eyeX = this.x + (this.dir>0? this.w-22: 22);
        ctx.strokeStyle = '#ff3'; ctx.lineWidth=4; ctx.beginPath();
        ctx.moveTo(eyeX, eyeY);
        ctx.lineTo(eyeX + this.dir* (W), eyeY);
        ctx.stroke();
        // Damage enemies in path
        state.enemies.forEach(e=>{
          const hb = e.hitbox();
          const minX = Math.min(eyeX, eyeX+this.dir*W), maxX = Math.max(eyeX, eyeX+this.dir*W);
          if (eyeY > hb.y && eyeY < hb.y+hb.h && hb.x < maxX && hb.x+hb.w > minX){
            e.hurt(2);
          }
        });
      }

      // HUD
      drawHUD();
    }
  }

  class Enemy extends Entity {
    constructor(kind, x){
      super({type:'enemy', kind, x, w:80, h:110, hp: DIFF[state.difficulty].enemyHP});
      this.anim = {t:0,i:0};
      this.dir = -1;
      this.dead = false;
    }
    get frames(){
      const src = images[this.kind]?.walk;
      return src || [];
    }
    update(){
      if (this.dead) return;
      this.anim.t++; if (this.anim.t>6){ this.anim.t=0; this.anim.i++; }
      // simple AI: walk toward player
      const p = state.player;
      this.dir = (p.x < this.x) ? -1 : 1;
      this.vx = 1.6 * this.dir;
      this.x += this.vx;
      if (this.intersects(p.hitbox())){
        this.attack();
      }
    }
    attack(){
      if (Math.random()<0.02 && state.player.invuln<=0){
        state.player.hp -= DIFF[state.difficulty].enemyDmg;
        state.player.invuln = 40;
        beep(130,0.05,'sine',0.2);
        if (state.player.hp<=0){ gameOver(); }
      }
    }
    hurt(dmg){
      if (this.dead) return;
      this.hp -= dmg;
      beep(300,0.04,'square',0.1);
      if (this.hp<=0){
        this.dead = true;
        state.score += 100;
        state.power = Math.min(100, state.power+15);
        // remove later
        setTimeout(()=>{
          const idx = state.enemies.indexOf(this);
          if (idx>=0) state.enemies.splice(idx,1);
        }, 10);
      }
    }
    draw(){
      const img = this.frames.length ? this.frames[this.anim.i % this.frames.length] : null;
      drawSprite(img, this.x, this.y, this.w, this.h, this.dir<0?false:true); // flip if moving right (enemy sprites face right by default in Peppers)
      if (!img){
        drawPlaceholder(this.x,this.y,this.w,this.h,this.kind);
      }
    }
  }

  // Helpers
  const rectsIntersect = (a,b)=> a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;

  // Background scrolling
  let bgImg = null;
  const drawBackground = () => {
    const img = bgImg;
    ctx.fillStyle='#1b0f0f'; ctx.fillRect(0,0,W,H);
    if (!img){
      drawPlaceholder(0,0,W,H,'(drop assets/eaglesclub.png)', '#291a1a');
      return;
    }
    const scale = H/img.height;
    const tileW = img.width*scale;
    // parallax: slight offset
    const offX = -state.scrollX*0.6 % tileW;
    for (let x=offX - tileW; x<W+tileW; x+=tileW){
      ctx.drawImage(img, x, 0, tileW, H);
    }
  };

  // HUD
  function drawHUD(){
    // Bars
    ctx.fillStyle='#0008'; ctx.fillRect(12,12, W-24, 42);
    // Health
    const p = state.player;
    const hpPct = Math.max(0, p.hp/p.maxhp);
    ctx.fillStyle='#a22'; ctx.fillRect(16,16, (W-32)*0.5*hpPct, 14);
    // Power
    const pwPct = state.power/100;
    ctx.fillStyle='#28f'; ctx.fillRect(16,36, (W-32)*0.5*pwPct, 14);
    // Score
    ctx.fillStyle='#fff'; ctx.font='16px monospace';
    ctx.fillText(`Score: ${state.score}`, W-220, 28);
    ctx.fillText(`Wave: ${state.wave}`, W-220, 44);
    ctx.fillText(`Player: ${state.playerChoice}${state.player.bigMode?' (BIG)':''}`, W-400, 44);
  }

  // Spawning
  function spawnEnemy(){
    const kinds = ['Entrado','Peppers'];
    const k = kinds[Math.floor(Math.random()*kinds.length)];
    const side = Math.random()<0.5? -1: 1;
    const x = side<0? -120 : W+40;
    state.enemies.push(new Enemy(k, x));
  }

  // Input
  const keys = {left:false,right:false,up:false,hit:false,power:false};
  const KEYMAP = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up','x':'hit','X':'hit','c':'power','C':'power','p':'pause','P':'pause'};
  window.addEventListener('keydown',e=>{
    if (KEYMAP[e.key]==='pause'){ state.paused = !state.paused; return; }
    if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = true;
  });
  window.addEventListener('keyup',e=>{ if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });

  // Loop
  function tick(){
    requestAnimationFrame(tick);
    if (!state.running) return;
    if (state.paused) return;

    state.t++;

    // Update & draw
    drawBackground();

    if (state.player){
      state.player.control(keys);
      state.player.update(keys);
      state.player.draw();
    }

    // Enemies
    // spawn pace tied to difficulty; reduce when BigBoner active
    if (state.t % (state.player?.bigMode? DIFF[state.difficulty].spawn*1.2 : DIFF[state.difficulty].spawn) === 0){
      spawnEnemy();
    }
    state.enemies.forEach(e=>e.update());
    state.enemies.forEach(e=>e.draw());
  }

  // Menus & Scores
  const local = {
    save(){
      const data = {
        playerChoice: state.playerChoice,
        score: state.score,
        difficulty: state.difficulty
      };
      localStorage.setItem('eagles_save', JSON.stringify(data));
    },
    load(){
      const s = localStorage.getItem('eagles_save');
      return s? JSON.parse(s): null;
    },
    addScore(name, score, difficulty){
      const list = JSON.parse(localStorage.getItem('eagles_scores')||'[]');
      list.push({name, score, difficulty, date: new Date().toISOString()});
      list.sort((a,b)=>b.score-a.score);
      localStorage.setItem('eagles_scores', JSON.stringify(list.slice(0,20)));
    },
    getScores(){
      return JSON.parse(localStorage.getItem('eagles_scores')||'[]');
    },
    clearScores(){ localStorage.removeItem('eagles_scores'); }
  };

  function openScores(){
    const rows = local.getScores().map((s,i)=>`<tr><td>${i+1}</td><td>${s.name}</td><td>${s.score}</td><td>${s.difficulty}</td><td>${new Date(s.date).toLocaleString()}</td></tr>`).join('');
    scoresTableBody.innerHTML = rows || `<tr><td colspan="5">No local scores yet.</td></tr>`;
    scoresModal.classList.add('active');
  }

  scoresClose.onclick = ()=>scoresModal.classList.remove('active');
  scoresClear.onclick = ()=>{ local.clearScores(); openScores(); };

  btnHighScores.onclick = openScores;
  menuScores.onclick = openScores;

  btnMenu.onclick = ()=>menuModal.classList.add('active');
  menuClose.onclick = ()=>menuModal.classList.remove('active');

  btnNew.onclick = ()=>startNew();
  btnLoad.onclick = ()=>{
    const s = local.load(); if (s){ state.playerChoice = s.playerChoice; difficultySel.value = s.difficulty; startNew(s.score); }
  };
  menuNew.onclick = btnNew.onclick;
  menuLoad.onclick = btnLoad.onclick;

  selectButtons.forEach(b=> b.onclick = ()=>{
    state.playerChoice = b.dataset.choose;
    beep(600,0.1);
  });

  difficultySel.onchange = ()=>{ state.difficulty = difficultySel.value; };

  function startNew(score=0){
    menuModal.classList.remove('active');
    state = {
      running: true, paused:false, scrollX:0,
      player: new Player(state.playerChoice),
      playerChoice: state.playerChoice,
      difficulty: difficultySel.value,
      score: score || 0,
      lives: 3, power:0, wave:1,
      enemies:[], projectiles:[], t:0
    };
    bgImg = images.bg; // background loaded earlier
    state.player.maxhp = 40;
    state.player.hp = 40;
    beep(480,0.12,'square',0.2);
  }

  function gameOver(){
    state.running = false;
    const name = prompt("Game Over! Enter your name for high scores:","Player");
    local.addScore(name||'Player', state.score, state.difficulty);
    local.save();
    openScores();
    menuModal.classList.add('active');
  }

  // Boot
  (async function boot(){
    await loadAll();
    bgImg = images.bg;
    state.player = new Player(state.playerChoice);
    tick();
  })();
})();
