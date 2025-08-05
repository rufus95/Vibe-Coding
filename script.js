class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X'; // Player is X, AI is O
        this.gameActive = true;
        this.difficulty = 'medium';
        this.scores = {
            player: 0,
            ai: 0,
            draws: 0
        };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Cell click events
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.handleCellClick(index);
            });
        });
        
        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideGameOver();
            this.resetBoard();
        });
        
        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateStatus();
        });
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.currentPlayer !== 'X') {
            return;
        }
        
        this.makeMove(index, 'X');
        
        if (this.checkGameEnd()) {
            return;
        }
        
        // AI's turn
        this.currentPlayer = 'O';
        this.updateStatus();
        
        // Add a small delay to make AI moves feel more natural
        setTimeout(() => {
            this.makeAIMove();
        }, 500);
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateCell(index, player);
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getEasyMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            default:
                move = this.getMediumMove();
        }
        
        if (move !== null) {
            this.makeMove(move, 'O');
            this.currentPlayer = 'X';
            this.updateStatus();
            this.checkGameEnd();
        }
    }
    
    getEasyMove() {
        // Easy: Random moves with some basic blocking
        const availableMoves = this.getAvailableMoves();
        
        // 70% chance of random move, 30% chance of smart move
        if (Math.random() < 0.7) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else {
            // Try to block player's winning move or make a winning move
            const blockingMove = this.findBlockingMove();
            if (blockingMove !== null) {
                return blockingMove;
            }
            
            // Try to win
            const winningMove = this.findWinningMove('O');
            if (winningMove !== null) {
                return winningMove;
            }
            
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
    
    getMediumMove() {
        // Medium: Smart moves with some randomness
        const availableMoves = this.getAvailableMoves();
        
        // Try to win first
        const winningMove = this.findWinningMove('O');
        if (winningMove !== null) {
            return winningMove;
        }
        
        // Try to block player's winning move
        const blockingMove = this.findBlockingMove();
        if (blockingMove !== null) {
            return blockingMove;
        }
        
        // Try to take center
        if (this.board[4] === '') {
            return 4;
        }
        
        // Try to take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Random move
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    getHardMove() {
        // Hard: Perfect play using minimax algorithm
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        // Check for terminal states
        if (this.checkWinner(board) === 'O') {
            return 10 - depth;
        }
        if (this.checkWinner(board) === 'X') {
            return depth - 10;
        }
        if (this.isBoardFull(board)) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    findWinningMove(player) {
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                if (this.checkWinner(this.board) === player) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        return null;
    }
    
    findBlockingMove() {
        return this.findWinningMove('X');
    }
    
    getAvailableMoves() {
        return this.board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    }
    
    checkWinner(board = this.board) {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    isBoardFull(board = this.board) {
        return board.every(cell => cell !== '');
    }
    
    checkGameEnd() {
        const winner = this.checkWinner();
        
        if (winner) {
            this.gameActive = false;
            this.highlightWinningCombination();
            this.updateScores(winner);
            this.showGameOver(winner === 'X' ? 'You win!' : 'AI wins!');
            return true;
        }
        
        if (this.isBoardFull()) {
            this.gameActive = false;
            this.updateScores('draw');
            this.showGameOver('It\'s a draw!');
            return true;
        }
        
        return false;
    }
    
    highlightWinningCombination() {
        const winner = this.checkWinner();
        if (!winner) return;
        
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] === winner && this.board[b] === winner && this.board[c] === winner) {
                combination.forEach(index => {
                    const cell = document.querySelector(`[data-index="${index}"]`);
                    cell.classList.add('winning');
                });
                break;
            }
        }
    }
    
    updateCell(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }
    
    updateStatus() {
        const statusElement = document.getElementById('status');
        const difficultyText = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        
        if (this.currentPlayer === 'X') {
            statusElement.textContent = `Your turn (X) - ${difficultyText} difficulty`;
        } else {
            statusElement.textContent = `AI is thinking... (${difficultyText} difficulty)`;
        }
    }
    
    updateScores(result) {
        switch (result) {
            case 'X':
                this.scores.player++;
                break;
            case 'O':
                this.scores.ai++;
                break;
            case 'draw':
                this.scores.draws++;
                break;
        }
        
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
        document.getElementById('drawScore').textContent = this.scores.draws;
    }
    
    showGameOver(message) {
        document.getElementById('gameResult').textContent = message;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    hideGameOver() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Reset scores
        this.scores = {
            player: 0,
            ai: 0,
            draws: 0
        };
        
        // Clear board display
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateStatus();
        this.updateScores(''); // Update the display with reset scores
    }
    
    resetBoard() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear board display
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateStatus();
    }
    
    updateDisplay() {
        this.updateStatus();
        this.updateScores(''); // Just update the display without changing scores
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 