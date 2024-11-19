const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load Images
const horseImage = new Image();
const logImage = new Image();
const enemyImage = new Image();
const coinImage = new Image();
const platformImage = new Image();
const powerUpImage = new Image();
const bgLayer1 = new Image();
const bgLayer2 = new Image();
const bgLayer3 = new Image();

const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const pauseButton = document.getElementById('pauseButton');
const jumpButton = document.getElementById('jumpButton');
const stompButton = document.getElementById('stompButton');

let imagesLoaded = 0;

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 9) {
        gameLoop();
    }
}

horseImage.onload = checkImagesLoaded;
logImage.onload = checkImagesLoaded;
enemyImage.onload = checkImagesLoaded;
coinImage.onload = checkImagesLoaded;
platformImage.onload = checkImagesLoaded;
powerUpImage.onload = checkImagesLoaded;
bgLayer1.onload = checkImagesLoaded;
bgLayer2.onload = checkImagesLoaded;
bgLayer3.onload = checkImagesLoaded;

// Ensure all images are in your directory
horseImage.src = 'APACHE.png';
logImage.src = 'LOG.png';
enemyImage.src = 'ENEMY.png';
coinImage.src = 'COIN.png';
platformImage.src = 'PLATFORM.png';
powerUpImage.src = 'POWERUP.png';
bgLayer1.src = 'BG_LAYER1.png';
bgLayer2.src = 'BG_LAYER2.png';
bgLayer3.src = 'BG_LAYER3.png';

// Load Sounds (Ensure audio files are in your directory)
const jumpSound = new Audio('jump.mp3');
const stompSound = new Audio('stomp.mp3');
const collectSound = new Audio('collect.mp3');
const gameOverSound = new Audio('gameover.mp3');

let horse = {
    x: 50,
    y: 300,
    width: 64,
    height: 64,
    stomping: false,
    stompCount: 0,
    score: 0,
    speed: 5,
    isJumping: false,
    velocityY: 0,
    gravity: 0.5,
    onGround: true,
    trampleAngle: 0,
    lives: 3,
    invincible: false,
    invincibleTimer: 0
};

let logs = [];
let enemies = [];
let coins = [];
let platforms = [];
let powerUps = [];
let keys = {};

let gameSpeed = 2;
let frame = 0;
let level = 1;
let isPaused = false;
let animationId;

let bgLayer1X = 0;
let bgLayer2X = 0;
let bgLayer3X = 0;

document.addEventListener('keydown', function(e) {
    keys[e.code] = true;

    if (e.code === 'Space' && !horse.stomping) {
        horse.stomping = true;
        horse.stompCount = 0;
    }

    if (e.code === 'ControlLeft' && horse.onGround) {
        horse.isJumping = true;
        horse.velocityY = -10;
        horse.onGround = false;
        jumpSound.play();
    }

    if (e.code === 'Escape') {
        isPaused = !isPaused;
        if (!isPaused) {
            gameLoop();
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        }
    }
});

document.addEventListener('keyup', function(e) {
    keys[e.code] = false;

    if (e.code === 'Space') {
        horse.stomping = false;
        horse.trampleAngle = 0;
    }
});

function createLog() {
    logs.push({
        x: canvas.width,
        y: 300,
        width: 64,
        height: 64,
        stomped: 0,
        isBlocking: true
    });
}

function createEnemy() {
    enemies.push({
        x: canvas.width,
        y: 300,
        width: 64,
        height: 64,
        stomped: false,
        moveDirection: 1,
        moveAmplitude: 30,
        moveSpeed: 1,
        baseX: canvas.width
    });
}

function createCoin() {
    coins.push({
        x: canvas.width,
        y: Math.random() * 200 + 100,
        width: 32,
        height: 32,
        collected: false
    });
}

function createPlatform() {
    platforms.push({
        x: canvas.width,
        y: Math.random() * 150 + 150,
        width: 128,
        height: 32
    });
}

function createPowerUp() {
    powerUps.push({
        x: canvas.width,
        y: Math.random() * 200 + 100,
        width: 32,
        height: 32,
        collected: false
    });
}

function updateHorse() {
    // Horizontal Movement
    if (keys['ArrowLeft']) {
        horse.x -= horse.speed;
    }
    if (keys['ArrowRight']) {
        horse.x += horse.speed;
    }

    // Prevent going off-screen
    if (horse.x < 0) horse.x = 0;
    if (horse.x + horse.width > canvas.width) horse.x = canvas.width - horse.width;

    // Vertical Movement (Jumping)
    if (horse.isJumping) {
        horse.velocityY += horse.gravity;
        horse.y += horse.velocityY;

        platforms.forEach(platform => {
            if (collision(horse, platform)) {
                if (horse.velocityY > 0 && horse.y + horse.height - horse.velocityY <= platform.y) {
                    horse.y = platform.y - horse.height;
                    horse.velocityY = 0;
                    horse.isJumping = false;
                    horse.onGround = true;
                }
            }
        });

        if (horse.y >= 300) { // Ground level
            horse.y = 300;
            horse.velocityY = 0;
            horse.isJumping = false;
            horse.onGround = true;
        }
    }

    // Trample Action
    if (horse.stomping) {
        horse.trampleAngle = Math.sin(Date.now() / 50) * 30;
    }

    // Invincibility Timer
    if (horse.invincible) {
        horse.invincibleTimer--;
        if (horse.invincibleTimer <= 0) {
            horse.invincible = false;
        }
    }

    // Fall Off Screen
    if (horse.y > canvas.height) {
        horse.lives--;
        if (horse.lives <= 0) {
            gameOver();
        } else {
            resetHorsePosition();
        }
    }
}

function updateLogs() {
    logs.forEach((log, index) => {
        log.x -= gameSpeed;

        if (log.x + log.width < 0) {
            logs.splice(index, 1);
            return;
        }

        if (collision(horse, log)) {
            if (horse.isJumping) {
                log.isBlocking = false;
            } else if (horse.stomping && log.isBlocking) {
                log.stomped++;
                stompSound.play();
                if (log.stomped >= 5) {
                    logs.splice(index, 1);
                    horse.score += 10;
                }
            } else if (log.isBlocking) {
                blockHorseMovement(log);
            }
        }
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x -= gameSpeed;

        enemy.x += enemy.moveDirection * enemy.moveSpeed;
        if (Math.abs(enemy.x - enemy.baseX) > enemy.moveAmplitude) {
            enemy.moveDirection *= -1;
        }

        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
            return;
        }

        if (collision(horse, enemy)) {
            if (horse.velocityY > 0 && horse.y + horse.height - horse.velocityY <= enemy.y) {
                if ((horse.stomping || horse.isJumping) && !enemy.stomped) {
                    enemy.stomped = true;
                    enemies.splice(index, 1);
                    horse.score += 20;
                    horse.velocityY = -5;
                    stompSound.play();
                }
            } else {
                if (!horse.invincible) {
                    horse.lives--;
                    horse.invincible = true;
                    horse.invincibleTimer = 120;

                    if (horse.lives <= 0) {
                        gameOver();
                    } else {
                        resetHorsePosition();
                    }
                }
            }
        }
    });
}

function updateCoins() {
    coins.forEach((coin, index) => {
        coin.x -= gameSpeed;

        if (coin.x + coin.width < 0) {
            coins.splice(index, 1);
            return;
        }

        if (collision(horse, coin) && !coin.collected) {
            coin.collected = true;
            coins.splice(index, 1);
            horse.score += 5;
            collectSound.play();
        }
    });
}

function updatePlatforms() {
    platforms.forEach((platform, index) => {
        platform.x -= gameSpeed;

        if (platform.x + platform.width < 0) {
            platforms.splice(index, 1);
            return;
        }
    });
}

function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.x -= gameSpeed;

        if (powerUp.x + powerUp.width < 0) {
            powerUps.splice(index, 1);
            return;
        }

        if (collision(horse, powerUp) && !powerUp.collected) {
            powerUp.collected = true;
            powerUps.splice(index, 1);
            horse.invincible = true;
            horse.invincibleTimer = 600;
            collectSound.play();
        }
    });
}

function blockHorseMovement(obstacle) {
    if (horse.x + horse.width > obstacle.x) {
        horse.x = obstacle.x - horse.width;
    }
}

function resetHorsePosition() {
    horse.x = 50;
    horse.y = 300;
    horse.velocityY = 0;
    horse.isJumping = false;
    horse.onGround = true;
}

function drawBackground() {
    // Parallax Background
    bgLayer1X -= gameSpeed * 0.2;
    bgLayer2X -= gameSpeed * 0.5;
    bgLayer3X -= gameSpeed * 1;

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

    if (horse.stomping) {
        ctx.rotate((-horse.trampleAngle * Math.PI) / 180);
    }

    if (horse.invincible && Math.floor(Date.now() / 100) % 2) {
        ctx.globalAlpha = 0.5;
    }

    ctx.drawImage(
        horseImage,
        -horse.width / 2,
        -horse.height / 2,
        horse.width,
        horse.height
    );
    ctx.restore();
    ctx.globalAlpha = 1.0;
}

function drawLogs() {
    logs.forEach(log => {
        ctx.drawImage(logImage, log.x, log.y, log.width, log.height);

        if (log.stomped > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(log.x, log.y, log.width, log.height * (log.stomped / 5));
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawCoins() {
    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
    });
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + horse.score, 10, 30);
    ctx.fillText('Lives: ' + horse.lives, 10, 60);
    ctx.fillText('Level: ' + level, 10, 90);
    ctx.fillText('High Score: ' + (localStorage.getItem('highScore') || 0), 10, 120);
}

function collision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y
    );
}

function gameOver() {
    cancelAnimationFrame(animationId);
    gameOverSound.play();

    if (localStorage.getItem('highScore') === null || horse.score > localStorage.getItem('highScore')) {
        localStorage.setItem('highScore', horse.score);
        ctx.fillText('New High Score!', canvas.width / 2, canvas.height / 2 + 100);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '30px Arial';
    ctx.fillText('Final Score: ' + horse.score, canvas.width / 2, canvas.height / 2 + 50);
}

function gameLoop() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    drawBackground();

    if (frame % 150 === 0) createLog();
    if (frame % 300 === 0) createEnemy();
    if (frame % 100 === 0) createCoin();
    if (frame % 200 === 0) createPlatform();
    if (frame % 500 === 0) createPowerUp();

    updateHorse();
    updateLogs();
    updateEnemies();
    updateCoins();
    updatePlatforms();
    updatePowerUps();

    drawPlatforms();
    drawCoins();
    drawPowerUps();
    drawLogs();
    drawEnemies();
    drawHorse();
    drawScore();

    if (horse.score >= level * 100) {
        level++;
        gameSpeed += 0.5;
    }

    animationId = requestAnimationFrame(gameLoop);
}


leftButton.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    keys['ArrowLeft'] = true;
});

leftButton.addEventListener('pointerup', function(e) {
    e.preventDefault();
    keys['ArrowLeft'] = false;
});

// Right Button Events
rightButton.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    keys['ArrowRight'] = true;
});

rightButton.addEventListener('pointerup', function(e) {
    e.preventDefault();
    keys['ArrowRight'] = false;
});

// Pause Button Event
pauseButton.addEventListener('pointerup', function(e) {
    e.preventDefault();
    isPaused = !isPaused;
    if (!isPaused) {
        gameLoop();
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }
});

// Jump Button Event
jumpButton.addEventListener('pointerup', function(e) {
    e.preventDefault();
    if (horse.onGround) {
        horse.isJumping = true;
        horse.velocityY = -10;
        horse.onGround = false;
        jumpSound.play();
    }
});

// Stomp Button Events
stompButton.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    if (!horse.stomping) {
        horse.stomping = true;
        horse.stompCount = 0;
    }
});

stompButton.addEventListener('pointerup', function(e) {
    e.preventDefault();
    horse.stomping = false;
    horse.trampleAngle = 0;
});