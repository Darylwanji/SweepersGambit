// Survival mode logic
let currentLevel = 0;
const MIN_BOARD_SIZE = 6;
const MAX_BOARD_SIZE = 32;
const LEVEL_INCREMENT = 2;

function initSurvivalMode() {
    currentLevel = 0;
    rows = MIN_BOARD_SIZE;
    cols = MIN_BOARD_SIZE;
    minesCount = Math.floor((rows * cols) * 0.15); // 15% of tiles are mines
    initGame();
    startTimer(); // Start the continuous timer
}

function progressToNextLevel() {
    currentLevel++;
    if (rows < MAX_BOARD_SIZE) {
        rows += LEVEL_INCREMENT;
        cols += LEVEL_INCREMENT;
        minesCount = Math.floor((rows * cols) * 0.15);
        initGame();
        // Don't reset timer - it continues from previous level
    } else {
        // Player has completed all levels
        const finalTime = currentTime;
        endGame(true);
        const playerName = prompt("Congratulations! You've completed Survival Mode! Enter your name:");
        if (playerName) {
            saveSurvivalScore(playerName, finalTime);
        }
    }
}