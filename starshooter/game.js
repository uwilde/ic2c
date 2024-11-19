const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Menu elements
const pauseMenu = document.getElementById('pauseMenu');
const resumeButton = document.getElementById('resumeButton');
const controlsButton = document.getElementById('controlsButton');
const controlsInfo = document.getElementById('controlsInfo');
const gameOverMenu = document.getElementById('gameOverMenu');
const restartButton = document.getElementById('restartButton');

let keys = {};
let player;
let enemies = [];
let bullets = [];
let bonuses = [];
let explosions = [];
let stars = [];
let score = 0;
let lives = 3;
let gameOver = false;
let paused = false;
let enemyDestroyedCount = 0;
let hasSuperBlaster = false;

// Event listeners for key presses
document.addEventListener('keydown', function (e) {
    keys[e.code] = true;

    // Pause/Resume game
    if (e.code === 'Escape') {
        paused = !paused;
        if (paused) {
            showPauseMenu();
        } else {
            hidePauseMenu();
        }
    }

    // Super Blaster activation
    if (e.code === 'ControlLeft' && hasSuperBlaster && !gameOver && !paused) {
        activateSuperBlaster();
    }
});

document.addEventListener('keyup', function (e) {
    keys[e.code] = false;
});

// Menu button events
resumeButton.addEventListener('click', () => {
    paused = false;
    hidePauseMenu();
});

controlsButton.addEventListener('click', () => {
    controlsInfo.classList.toggle('hidden');
});

restartButton.addEventListener('click', () => {
    resetGame();
});

// Player class
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 60;
        this.width = 30;
        this.height = 30;
        this.radius = 15;
        this.speed = 5;
        this.shooting = false;
        this.booster = false;
        this.hit = false;
        this.hitTime = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.hit) {
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.hitTime * 10);
        }
        // Draw player's ship (triangle)
        ctx.fillStyle = this.booster ? 'cyan' : 'lime';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-15, 15);
        ctx.lineTo(15, 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (keys['ArrowLeft'] && this.x - this.speed > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x + this.speed < canvas.width) {
            this.x += this.speed;
        }
        if (keys['Space']) {
            this.shoot();
        }
        if (this.hit) {
            this.hitTime += 0.1;
            if (this.hitTime > 1) {
                this.hit = false;
                this.hitTime = 0;
            }
        }
    }

    shoot() {
        if (!this.shooting) {
            bullets.push(new Bullet(this.x, this.y - 15, this.booster));
            this.shooting = true;
            setTimeout(() => { this.shooting = false; }, this.booster ? 200 : 400);
        }
    }
}

// Bullet class
class Bullet {
    constructor(x, y, booster = false) {
        this.x = x;
        this.y = y;
        this.radius = booster ? 5 : 3;
        this.speed = booster ? 10 : 7;
        this.booster = booster;
    }

    draw() {
        ctx.fillStyle = this.booster ? 'cyan' : 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.y -= this.speed;
    }
}

// Enemy class with different shapes
class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.radius = this.size;
        this.speed = speed;
        this.type = Math.floor(Math.random() * 3); // Different enemy shapes
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = 'red';
        switch (this.type) {
            case 0:
                // Circle enemy
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 1:
                // Square enemy
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
            case 2:
                // Diamond enemy
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size, 0);
                ctx.lineTo(0, this.size);
                ctx.lineTo(-this.size, 0);
                ctx.closePath();
                ctx.fill();
                break;
        }
        ctx.restore();
    }

    update() {
        this.y += this.speed;
    }
}

// Bonus class
class Bonus {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.type = type; // 'life' or 'booster'
        this.speed = 3;
    }

    draw() {
        ctx.fillStyle = this.type === 'life' ? 'green' : 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Draw symbol
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'life' ? '+' : 'B', this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

// Explosion class
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frames = 0;
    }

    draw() {
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.frames * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.frames++;
    }
}

// Star class for background stars
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.random() * 2;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }
}

// Initialize player
player = new Player();

// Create initial stars
for (let i = 0; i < 100; i++) {
    stars.push(new Star());
}

// Game loop
function gameLoop() {
    if (gameOver) {
        showGameOverMenu();
        return;
    }

    if (!paused) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Update stars
    stars.forEach(star => star.update());

    player.update();

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        if (enemy.y > canvas.height) {
            enemies.splice(eIndex, 1);
            lives--;
            player.hit = true;
            if (lives <= 0) {
                gameOver = true;
            }
        }

        bullets.forEach((bullet, bIndex) => {
            if (collisionCircleCircle(bullet, enemy)) {
                explosions.push(new Explosion(enemy.x, enemy.y));
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                enemyDestroyedCount++;
                if (enemyDestroyedCount >= 20 && !hasSuperBlaster) {
                    hasSuperBlaster = true;
                    enemyDestroyedCount = 0;
                }
                if (Math.random() < 0.1) {
                    // Spawn bonus
                    bonuses.push(new Bonus(enemy.x, enemy.y, Math.random() < 0.5 ? 'life' : 'booster'));
                }
            }
        });

        if (collisionCircleCircle(player, enemy)) {
            explosions.push(new Explosion(player.x, player.y));
            enemies.splice(eIndex, 1);
            lives--;
            player.hit = true;
            if (lives <= 0) {
                gameOver = true;
            }
        }
    });

    bonuses.forEach((bonus, index) => {
        bonus.update();
        if (collisionCircleCircle(player, bonus)) {
            if (bonus.type === 'life') {
                lives++;
            } else if (bonus.type === 'booster') {
                player.booster = true;
                setTimeout(() => { player.booster = false; }, 10000);
            }
            bonuses.splice(index, 1);
        } else if (bonus.y > canvas.height) {
            bonuses.splice(index, 1);
        }
    });

    explosions.forEach((explosion, index) => {
        explosion.update();
        if (explosion.frames > 15) {
            explosions.splice(index, 1);
        }
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
        let x = Math.random() * (canvas.width - 30) + 15;
        enemies.push(new Enemy(x, -30, 1 + Math.random() * 1));
    }
}

// Draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => star.draw());

    player.draw();

    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
    bonuses.forEach(bonus => bonus.draw());
    explosions.forEach(explosion => explosion.draw());

    // Draw score, lives, and super blaster indicator
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Lives: ' + lives, 100, 20);
    ctx.fillText('Super Blaster: ' + (hasSuperBlaster ? 'Ready' : 'Not Ready'), 200, 20);
}

// Collision detection functions
function collisionCircleCircle(c1, c2) {
    let dx = c1.x - c2.x;
    let dy = c1.y - c2.y;
    let distanceSq = dx * dx + dy * dy;
    let radiusSum = c1.radius + c2.radius;
    return distanceSq <= radiusSum * radiusSum;
}

// Show and hide pause menu
function showPauseMenu() {
    pauseMenu.classList.remove('hidden');
}

function hidePauseMenu() {
    pauseMenu.classList.add('hidden');
    controlsInfo.classList.add('hidden');
}

// Show game over menu
function showGameOverMenu() {
    gameOverMenu.classList.remove('hidden');
}

// Reset game
function resetGame() {
    // Reset all variables and arrays
    player = new Player();
    enemies = [];
    bullets = [];
    bonuses = [];
    explosions = [];
    stars = [];
    score = 0;
    lives = 3;
    gameOver = false;
    paused = false;
    enemyDestroyedCount = 0;
    hasSuperBlaster = false;
    gameOverMenu.classList.add('hidden');

    // Recreate stars
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    gameLoop();
}

// Activate super blaster
function activateSuperBlaster() {
    enemies.forEach(enemy => {
        explosions.push(new Explosion(enemy.x, enemy.y));
    });
    score += 10 * enemies.length;
    enemies = [];
    hasSuperBlaster = false;
}

const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const touchPauseButton = document.getElementById('touchPauseButton');
const shootButton = document.getElementById('shootButton');
const superBlasterButton = document.getElementById('superBlasterButton');

// Prevent default scrolling behavior on touch controls
const touchControls = document.getElementById('touchControls');
touchControls.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

// Movement buttons
leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = true;
});
leftButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = false;
});
leftButton.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = false;
});
leftButton.addEventListener('mousedown', () => {
    keys['ArrowLeft'] = true;
});
leftButton.addEventListener('mouseup', () => {
    keys['ArrowLeft'] = false;
});
leftButton.addEventListener('mouseleave', () => {
    keys['ArrowLeft'] = false;
});

rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = true;
});
rightButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = false;
});
rightButton.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = false;
});
rightButton.addEventListener('mousedown', () => {
    keys['ArrowRight'] = true;
});
rightButton.addEventListener('mouseup', () => {
    keys['ArrowRight'] = false;
});
rightButton.addEventListener('mouseleave', () => {
    keys['ArrowRight'] = false;
});

// Shoot button
shootButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['Space'] = true;
});
shootButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['Space'] = false;
});
shootButton.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    keys['Space'] = false;
});
shootButton.addEventListener('mousedown', () => {
    keys['Space'] = true;
});
shootButton.addEventListener('mouseup', () => {
    keys['Space'] = false;
});

// Super Blaster button
superBlasterButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (hasSuperBlaster && !gameOver && !paused) {
        activateSuperBlaster();
    }
});

// Pause button
touchPauseButton.addEventListener('click', (e) => {
    e.preventDefault();
    paused = !paused;
    if (paused) {
        showPauseMenu();
    } else {
        hidePauseMenu();
    }
});

// Start the game
gameLoop();