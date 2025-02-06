// DOM Elements
const sections = document.querySelectorAll('.section');
const navBtns = document.querySelectorAll('.nav-btn');
const gameArea = document.getElementById('currentGame');
const backBtn = document.getElementById('backBtn');
const scoresList = document.getElementById('scoresList');

// Game instances
let currentGame = null;

// Navigation
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    navBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (sectionId !== 'gameArea') {
        document.getElementById(sectionId + 'Btn').classList.add('active');
    }

    // Hide all control instructions
    document.querySelectorAll('.controls-info').forEach(control => {
        control.style.display = 'none';
    });
}

// Event Listeners
document.getElementById('homeBtn').addEventListener('click', () => showSection('home'));
document.getElementById('gamesBtn').addEventListener('click', () => showSection('games'));
document.getElementById('highscoresBtn').addEventListener('click', () => {
    showSection('highscores');
    updateAllHighScores();
});
backBtn.addEventListener('click', () => {
    if (currentGame) {
        if (currentGame.gameLoop) {
            clearInterval(currentGame.gameLoop);
        }
        currentGame = null;
        gameArea.innerHTML = '';
    }
    showSection('games');
});

// Snake Game Implementation
class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.setupControls();
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });
    }

    update() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.saveScore();
        alert(`Game Over! Score: ${this.score}`);
    }

    saveScore() {
        let scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
        scores.push(this.score);
        scores.sort((a, b) => b - a);
        scores = scores.slice(0, 5);
        localStorage.setItem('snakeScores', JSON.stringify(scores));
        updateHighScores('snake');
    }

    start() {
        this.gameLoop = setInterval(() => this.update(), 100);
    }
}

function loadGame(gameName) {
    showSection('gameArea');
    gameArea.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    gameArea.appendChild(canvas);
    
    // Show relevant controls
    document.querySelectorAll('.controls-info').forEach(control => {
        control.style.display = 'none';
    });
    document.getElementById(`${gameName}Controls`).style.display = 'block';
    
    if (gameName === 'snake') {
        currentGame = new SnakeGame(canvas);
        currentGame.start();
    } else if (gameName === 'tetris') {
        currentGame = new Tetris(canvas);
    } else if (gameName === 'pong') {
        currentGame = new Pong(canvas);
    }
}

function updateHighScores(game) {
    const scoresDiv = document.querySelector(`#${game}Scores .scores-list`);
    const scores = JSON.parse(localStorage.getItem(`${game}Scores`) || '[]');
    
    scoresDiv.innerHTML = scores.length ? 
        scores.map((score, index) => `<p>${index + 1}. ${score}</p>`).join('') :
        '<p>No scores yet!</p>';
}

function updateAllHighScores() {
    updateHighScores('snake');
    updateHighScores('tetris');
    updateHighScores('pong');
}

// Initialize high scores
updateAllHighScores();
