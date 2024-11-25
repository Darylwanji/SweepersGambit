document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme handler
    initThemeHandler();

    // Check which page we're on
    const isGamePage = window.location.pathname.includes('game.html');
    
    if (isGamePage) {
        // Game page initialization
        initGame();
        document.getElementById('restart-button').addEventListener('click', initGame);
    } else {
        // Menu page initialization
        const mainMenu = document.getElementById('main-menu');
        const controlsScreen = document.getElementById('controls-screen');
        
        // Controls button
        document.getElementById('controls-button').addEventListener('click', () => {
            mainMenu.classList.add('hidden');
            controlsScreen.classList.remove('hidden');
        });
        
        // Quit button
        document.getElementById('quit-button').addEventListener('click', () => {
            if (confirm('Are you sure you want to quit?')) {
                window.close();
            }
        });
        
        // Back to menu button
        document.getElementById('back-to-menu').addEventListener('click', () => {
            controlsScreen.classList.add('hidden');
            mainMenu.classList.remove('hidden');
        });
    }
});

// Theme handling
function initThemeHandler() {
    const themeSelect = document.getElementById('theme');
    if (!themeSelect) {
        console.error('Theme selector not found!');
        return;
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('board-theme') || 'classic';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;

    // Theme change handler
    themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('board-theme', newTheme);
    });
}

// Game variables
let rows = 10;
let cols = 10;
let minesCount = 15;
let cells = [];
let gameOver = false;

// Game initialization
function initGame() {
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    const difficultySelect = document.getElementById('difficulty');

    updateDifficulty();
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
    gameBoard.innerHTML = '';
    cells = [];
    message.textContent = '';
    gameOver = false;

    // Create cells
    for (let i = 0; i < rows; i++) {
        cells[i] = [];
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((i + j) % 2 === 0 ? 'cell-light' : 'cell-dark');
            
            cell.dataset.row = i;
            cell.dataset.col = j;
            gameBoard.appendChild(cell);
            cells[i][j] = { 
                element: cell, 
                isMine: false, 
                revealed: false,
                flagged: false,
                surroundingMines: 0 
            };

            // Add event listeners
            cell.addEventListener('click', () => revealCell(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(i, j);
            });
        }
    }

    placeMines();
    calculateSurroundingMines();
}

// Update difficulty
function updateDifficulty() {
    const difficultySelect = document.getElementById('difficulty');
    const difficulty = difficultySelect.value;
    if (difficulty === 'easy') {
        rows = 8;
        cols = 8;
        minesCount = 10;
    } else if (difficulty === 'medium') {
        rows = 10;
        cols = 10;
        minesCount = 15;
    } else if (difficulty === 'hard') {
        rows = 12;
        cols = 12;
        minesCount = 25;
    }
}

// Place mines randomly
function placeMines() {
    let placedMines = 0;
    while (placedMines < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (!cells[row][col].isMine) {
            cells[row][col].isMine = true;
            placedMines++;
        }
    }
}

// Calculate surrounding mines
function calculateSurroundingMines() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Check all adjacent cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = i + di;
                    const nj = j + dj;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && cells[ni][nj].isMine) {
                        count++;
                    }
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}

// Reveal cell
function revealCell(row, col) {
    const cell = cells[row][col];
    if (gameOver || cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');

    if (cell.isMine) {
        cell.element.textContent = '💣';
        cell.element.classList.add('mine');
        endGame(false);
    } else {
        if (cell.surroundingMines > 0) {
            cell.element.textContent = cell.surroundingMines;
            cell.element.setAttribute('data-mines', cell.surroundingMines);
        } else {
            // Reveal adjacent cells for empty cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !cells[ni][nj].revealed) {
                        revealCell(ni, nj);
                    }
                }
            }
        }
        checkWin();
    }
}

// Flag cell
function flagCell(row, col) {
    const cell = cells[row][col];
    if (gameOver || cell.revealed) return;

    cell.flagged = !cell.flagged;
    cell.element.textContent = cell.flagged ? '🚩' : '';
}

// Check win condition
function checkWin() {
    let unrevealedSafeCells = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!cells[i][j].isMine && !cells[i][j].revealed) {
                unrevealedSafeCells++;
            }
        }
    }
    
    if (unrevealedSafeCells === 0) {
        endGame(true);
    }
}

// End game
function endGame(won) {
    gameOver = true;
    const message = document.getElementById('message');
    message.textContent = won ? 'Congratulations! You won!' : 'Game Over!';
    message.style.color = won ? 'green' : 'red';

    // Reveal all mines
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = cells[i][j];
            if (cell.isMine) {
                cell.element.textContent = '💣';
                cell.element.classList.add('revealed');
                if (won) {
                    cell.element.style.backgroundColor = '#90EE90';
                }
            }
        }
    }
}
