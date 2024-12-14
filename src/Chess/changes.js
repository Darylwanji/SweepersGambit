// Add new state variables for move tracking
let whiteMovesCount = 0;
let blackMovesCount = 0;

// Add function to check if mine placement is allowed based on move count
function canPlaceMinesBasedOnMoves() {
    return whiteMovesCount >= 4 && blackMovesCount >= 4;
}

// Update move counts after each move
function updateMoveCounts(move) {
    if (move.color === 'w') {
        whiteMovesCount++;
    } else {
        blackMovesCount++;
    }
}

// Function to notify players when mine placement becomes available
function checkAndNotifyMinePlacement() {
    if (whiteMovesCount === 4 && blackMovesCount === 4) {
        statusElement.textContent = "Mine placement is now available for both players!";
        playSound(moveSound); // Add distinctive sound for this notification
    }
}