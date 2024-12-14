// Game mode handling functions
function initializeGameMode(mode) {
    gameMode = mode;
    currentGameMode = mode;
    
    // Reset the game state
    initializeBoard();
    
    // Reset move counts
    whiteMovesCount = 0;
    blackMovesCount = 0;
    mines = { 'w': [], 'b': [] };
    inactiveMines = [];
    
    // Update UI based on game mode
    document.getElementById('difficulty').style.display = 
        (mode === 'pvp') ? 'none' : 'inline-block';
    
    // Set board orientation
    if (mode === 'ai') {
        board.orientation('white');
    }
    
    // Start AI vs AI mode if selected
    if (mode === 'aivsai') {
        setTimeout(makeAiMove, 1000);
    }
}

// Event listener for game mode changes
document.getElementById('game-mode').addEventListener('change', function(e) {
    initializeGameMode(e.target.value);
});

// Function to handle AI vs AI moves
function handleAiResponse(isBlackMove) {
    if (gameMode !== 'aivsai' || game.game_over()) return;
    
    setTimeout(() => {
        makeAiMove();
    }, 1000);
}