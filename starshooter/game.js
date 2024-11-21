let lastTime = 0;
let enemySpawnTimer = 0;
const enemySpawnInterval = 1.0; // Spawn an enemy every 1 second

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
        if (!paused) {
            pauseGame();
        } else {
            resumeGame();
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
    resumeGame();
});

controlsButton.addEventListener('click', () => {
    controlsInfo.classList.toggle('hidden');
});

restartButton.addEventListener('click', () => {
    resetGame();
});

// Pause and Resume functions
function pauseGame() {
    paused = true;
    showPauseMenu();
}

function resumeGame() {
    paused = false;
    hidePauseMenu();
    // Reset lastTime to avoid deltaTime issues
    lastTime = performance.now();
}

// Player class
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 60;
        this.width = 30;
        this.height = 30;
        this.radius = 15;
        this.speed = 200; // Units per second
        this.booster = false;
        this.hit = false;
        this.hitTime = 0;
        this.shootCooldown = 0.4; // Seconds
        this.shootTimer = 0;
        this.boosterDuration = 0; // Remaining booster time
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

    update(deltaTime) {
        const distance = this.speed * deltaTime;

        if (keys['ArrowLeft'] && this.x - distance > 0) {
            this.x -= distance;
        }
        if (keys['ArrowRight'] && this.x + distance < canvas.width) {
            this.x += distance;
        }

        // Shooting logic
        this.shootTimer -= deltaTime;
        if (keys['Space'] && this.shootTimer <= 0) {
            this.shoot();
        }

        // Booster timing
        if (this.booster) {
            this.boosterDuration -= deltaTime;
            if (this.boosterDuration <= 0) {
                this.booster = false;
                this.shootCooldown = 0.4;
            }
        }

        // Hit effect timing
        if (this.hit) {
            this.hitTime += deltaTime;
            if (this.hitTime > 1) {
                this.hit = false;
                this.hitTime = 0;
            }
        }
    }

    shoot() {
        bullets.push(new Bullet(this.x, this.y - 15, this.booster));
        this.shootTimer = this.booster ? 0.2 : 0.4; // Reset the timer based on booster
    }

    activateBooster() {
        this.booster = true;
        this.boosterDuration = 10; // Booster lasts for 10 seconds
        this.shootCooldown = 0.2;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, booster = false) {
        this.x = x;
        this.y = y;
        this.radius = booster ? 5 : 3;
        this.speed = booster ? 500 : 350; // Units per second
        this.booster = booster;
    }

    draw() {
        ctx.fillStyle = this.booster ? 'cyan' : 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update(deltaTime) {
        this.y -= this.speed * deltaTime;
    }
}

// Enemy class with different shapes
class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.radius = this.size;
        this.speed = speed; // Units per second
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

    update(deltaTime) {
        this.y += this.speed * deltaTime;
    }
}

// Bonus class
class Bonus {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.type = type; // 'life' or 'booster'
        this.speed = 150; // Units per second
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

    update(deltaTime) {
        this.y += this.speed * deltaTime;
    }
}

// Explosion class
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.duration = 0.5; // Seconds
        this.elapsedTime = 0;
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
    }

    draw() {
        const progress = this.elapsedTime / this.duration;
        if (progress < 1) {
            ctx.fillStyle = `rgba(255, ${Math.floor(255 * (1 - progress))}, 0, ${1 - progress})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, progress * 30, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Star class for background stars
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 100 + 50; // Units per second
        this.size = Math.random() * 2;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime;
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
function gameLoop(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }

    if (gameOver) {
        showGameOverMenu();
        return;
    }

    if (!paused) {
        const deltaTime = (timestamp - lastTime) / 1000; // Convert milliseconds to seconds
        lastTime = timestamp;

        update(deltaTime);
        draw();
    } else {
        // Reset lastTime to prevent deltaTime from accumulating
        lastTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Update stars
    stars.forEach(star => star.update(deltaTime));

    player.update(deltaTime);

    bullets.forEach((bullet, index) => {
        bullet.update(deltaTime);
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.update(deltaTime);
        if (enemy.y > canvas.height) {
            enemies.splice(eIndex, 1);
            lives--;
            player.hit = true;
            if (lives <= 0) {
                gameOver = true;
            }
        }
    });

    // Check for bullet and enemy collisions
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
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
    });

    // Check for player and enemy collisions
    enemies.forEach((enemy, eIndex) => {
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
        bonus.update(deltaTime);
        if (collisionCircleCircle(player, bonus)) {
            if (bonus.type === 'life') {
                lives++;
            } else if (bonus.type === 'booster') {
                player.activateBooster();
            }
            bonuses.splice(index, 1);
        } else if (bonus.y > canvas.height) {
            bonuses.splice(index, 1);
        }
    });

    explosions.forEach((explosion, index) => {
        explosion.update(deltaTime);
        if (explosion.elapsedTime > explosion.duration) {
            explosions.splice(index, 1);
        }
    });

    // Enemy spawning
    enemySpawnTimer += deltaTime;
    if (enemySpawnTimer >= enemySpawnInterval) {
        enemySpawnTimer -= enemySpawnInterval;
        spawnEnemy();
    }
}

// Spawn enemy function
function spawnEnemy() {
    let x = Math.random() * (canvas.width - 30) + 15;
    let speed = Math.random() * 100 + 50; // Units per second
    enemies.push(new Enemy(x, -30, speed));
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
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    const margin = 20;
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
    lastTime = 0;
    enemySpawnTimer = 0;

    // Recreate stars
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);
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
    if (!paused) {
        pauseGame();
    } else {
        resumeGame();
    }
});

// Start the game
requestAnimationFrame(gameLoop);
