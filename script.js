const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 화면 크기에 맞게 캔버스 크기 조정
function resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const size = Math.min(screenWidth * 0.95, screenHeight * 0.95);
    canvas.width = size;
    canvas.height = size;
    initGame(); // 리사이즈할 때마다 게임 재초기화
}

// 초기 리사이즈 및 이벤트 리스너 추가
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 게임 객체 크기 계산
let unit;
function calculateSizes() {
    unit = canvas.width / 20; // 기준 단위 (캔버스 너비의 1/20)
    paddle.width = unit * 4;
    paddle.height = unit * 0.5;
    paddle.y = canvas.height - unit * 2;
    ball.radius = unit * 0.3;
    ball.speed = unit * 0.3; // 속도도 화면 크기에 비례하게 조정
    
    // 벽돌 크기 조정
    brick.width = (canvas.width - unit * 6) / 5;
    brick.height = unit;
    brick.padding = unit * 0.2;
}

// 패들 객체
const paddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dx: 8,
    color: '#00FF00'
};

// 공 객체
const ball = {
    x: 0,
    y: 0,
    radius: 0,
    dx: 0,
    dy: 0,
    speed: 7,
    isLaunched: false,
    color: '#FFFFFF'
};

// 벽돌 객체
const brick = {
    width: 0,
    height: 0,
    padding: 2,
    color: '#FF0000'
};

// 벽돌 배열 (5x5)
let bricks = [];
function createBricks() {
    bricks = [];
    const startX = (canvas.width - (5 * brick.width + 4 * brick.padding)) / 2;
    const startY = unit * 2;
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            bricks.push({
                x: startX + col * (brick.width + brick.padding),
                y: startY + row * (brick.height + brick.padding),
                visible: true
            });
        }
    }
}

// 게임 초기화
function initGame() {
    calculateSizes();
    paddle.x = (canvas.width - paddle.width) / 2;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dx = 0;
    ball.dy = 0;
    ball.isLaunched = false;
    createBricks();
}

// 충돌 감지
function detectCollision() {
    // 벽과의 충돌
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // 패들과의 충돌
    if (ball.y + ball.radius > paddle.y && 
        ball.x > paddle.x && 
        ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        // 패들의 위치에 따라 공의 x방향 속도 조정
        const hitPoint = (ball.x - paddle.x) / paddle.width;
        ball.dx = ball.speed * (hitPoint - 0.5) * 2;
    }

    // 벽돌과의 충돌
    bricks.forEach(brick => {
        if (brick.visible &&
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height) {
            brick.visible = false;
            ball.dy = -ball.dy;
        }
    });
}

// 터치 이벤트 처리
let touchX = null;
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.clientX;
    
    // 공이 발사되지 않은 상태에서 탭하면 공 발사
    if (!ball.isLaunched) {
        ball.isLaunched = true;
        ball.dx = 0;
        ball.dy = -ball.speed;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (touchX === null) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchX;
    touchX = touch.clientX;
    
    paddle.x += deltaX;
    
    // 패들이 화면 밖으로 나가지 않도록 제한
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
    
    // 공이 발사되지 않은 경우 공도 패들과 함께 이동
    if (!ball.isLaunched) {
        ball.x = paddle.x + paddle.width / 2;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    touchX = null;
}

// 게임 상태 업데이트
function update() {
    if (ball.isLaunched) {
        ball.x += ball.dx;
        ball.y += ball.dy;
        detectCollision();
    }
}

// 게임 화면 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 패들 그리기
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // 공 그리기
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
    
    // 벽돌 그리기
    bricks.forEach(brick => {
        if (brick.visible) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}

// 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 시작
initGame();
gameLoop();