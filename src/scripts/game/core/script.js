const gameBoard = document.getElementById('game-board');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const difficultySelect = document.getElementById('difficulty');

let rows = 10;
let cols = 10;
let minesCount = 15;
let cells = [];

// Update the game parameters based on difficulty
function updateDifficulty() {
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

// Initialize or restart the game
function initGame() {
  updateDifficulty();
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
  gameBoard.innerHTML = '';
  cells = [];
  message.textContent = '';

  // Create cells
  for (let i = 0; i < rows; i++) {
    cells[i] = [];
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;
      gameBoard.appendChild(cell);
      cells[i][j] = { element: cell, isMine: false, revealed: false, surroundingMines: 0 };

      cell.addEventListener('click', () => revealCell(i, j));
    }
  }

  placeMines();
  calculateSurroundingMines();
}

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

function calculateSurroundingMines() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (cells[i][j].isMine) continue;

      let surroundingMines = 0;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          const ni = i + x;
          const nj = j + y;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && cells[ni][nj].isMine) {
            surroundingMines++;
          }
        }
      }
      cells[i][j].surroundingMines = surroundingMines;
    }
  }
}

function revealCell(row, col) {
  const cell = cells[row][col];
  if (cell.revealed) return;

  cell.revealed = true;
  cell.element.classList.add('revealed');

  if (cell.isMine) {
    cell.element.textContent = '💣';
    cell.element.classList.add('mine');
    endGame(false);
  } else if (cell.surroundingMines > 0) {
    cell.element.textContent = cell.surroundingMines;
  } else {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const ni = row + x;
        const nj = col + y;
        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
          revealCell(ni, nj);
        }
      }
    }
  }

  checkWin();
}

function checkWin() {
  let allRevealed = true;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = cells[i][j];
      if (!cell.isMine && !cell.revealed) {
        allRevealed = false;
      }
    }
  }

  if (allRevealed) {
    endGame(true);
  }
}

function endGame(win) {
  message.textContent = win ? 'You Win! 🎉' : 'Game Over! 💥';
  gameBoard.querySelectorAll('.cell').forEach(cell => cell.style.pointerEvents = 'none');
}

// Restart button functionality
restartButton.addEventListener('click', initGame);

// Start the game
initGame();
