class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 30;
        this.score = 0;
        
        // Tetris board dimensions
        this.cols = 10;
        this.rows = 20;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        // Tetromino shapes and colors
        this.shapes = {
            I: [[1,1,1,1]], 
            O: [[1,1],[1,1]],
            T: [[0,1,0],[1,1,1]],
            S: [[0,1,1],[1,1,0]],
            Z: [[1,1,0],[0,1,1]],
            J: [[1,0,0],[1,1,1]],
            L: [[0,0,1],[1,1,1]]
        };
        
        this.colors = {
            I: '#00f0f0',
            O: '#f0f000',
            T: '#a000f0',
            S: '#00f000',
            Z: '#f00000',
            J: '#0000f0',
            L: '#f0a000'
        };
        
        this.currentPiece = null;
        this.gameLoop = null;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        // Set canvas size
        this.canvas.width = this.cols * this.gridSize;
        this.canvas.height = this.rows * this.gridSize;
        
        // Event listeners
        document.addEventListener('keydown', this.handleInput.bind(this));
        
        // Start game
        this.spawnPiece();
        this.gameLoop = setInterval(() => this.update(), 1000);
    }
    
    spawnPiece() {
        const pieces = Object.keys(this.shapes);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        
        this.currentPiece = {
            shape: this.shapes[randomPiece],
            color: this.colors[randomPiece],
            x: Math.floor(this.cols / 2) - Math.floor(this.shapes[randomPiece][0].length / 2),
            y: 0
        };
    }
    
    handleInput(event) {
        if (this.gameOver) return;
        
        switch(event.keyCode) {
            case 37: // Left
                if (this.isValidMove(this.currentPiece.x - 1, this.currentPiece.y)) {
                    this.currentPiece.x--;
                }
                break;
            case 39: // Right
                if (this.isValidMove(this.currentPiece.x + 1, this.currentPiece.y)) {
                    this.currentPiece.x++;
                }
                break;
            case 40: // Down
                if (this.isValidMove(this.currentPiece.x, this.currentPiece.y + 1)) {
                    this.currentPiece.y++;
                }
                break;
            case 38: // Rotate
                this.rotatePiece();
                break;
        }
        
        this.draw();
    }
    
    isValidMove(x, y) {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    if (y + row >= this.rows || 
                        x + col < 0 || 
                        x + col >= this.cols || 
                        this.board[y + row][x + col]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) => 
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (!this.isValidMove(this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    update() {
        if (this.gameOver) return;
        
        if (this.isValidMove(this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
            
            if (!this.isValidMove(this.currentPiece.x, this.currentPiece.y)) {
                this.endGame();
            }
        }
        
        this.draw();
    }
    
    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    this.board[this.currentPiece.y + row][this.currentPiece.x + col] = this.currentPiece.color;
                }
            }
        }
    }
    
    clearLines() {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                this.score += 100;
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(
                        col * this.gridSize, 
                        row * this.gridSize, 
                        this.gridSize - 1, 
                        this.gridSize - 1
                    );
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + col) * this.gridSize,
                            (this.currentPiece.y + row) * this.gridSize,
                            this.gridSize - 1,
                            this.gridSize - 1
                        );
                    }
                }
            }
        }
        
        // Draw score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
    
    endGame() {
        this.gameOver = true;
        clearInterval(this.gameLoop);
        
        // Save score
        const scores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
        scores.push(this.score);
        scores.sort((a, b) => b - a);
        scores.splice(5); // Keep top 5 scores
        localStorage.setItem('tetrisScores', JSON.stringify(scores));
        
        // Show game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tetris;
}
