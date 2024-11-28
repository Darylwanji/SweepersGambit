// DOM elements
const boardElement = document.getElementById("board");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");
const statusElement = document.getElementById("status");
const pgnElement = document.getElementById("pgn");
const moveSound = document.getElementById("moveSound");
const captureSound = document.getElementById("captureSound");


// Music and sound state
let isMusicPlaying = false;
let isSoundEnabled = true;

// Background music
const backgroundMusic = new Audio('../assets/audio/CheckmateDreams.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;

// Sound controls
function initSoundControls() {
    // Load saved preferences
    const savedMusicState = localStorage.getItem('chess-music-enabled') === 'true';
    const savedSoundState = localStorage.getItem('chess-sound-enabled') !== 'false'; // Default to true
    
    isSoundEnabled = savedSoundState;
    isMusicPlaying = savedMusicState;
    
    // Initialize buttons
    const musicButton = document.getElementById('music-toggle');
    const soundButton = document.getElementById('sound-toggle');
    
    musicButton.addEventListener('click', toggleBackgroundMusic);
    soundButton.addEventListener('click', toggleSoundEffects);
    
    updateMusicButton();
    updateSoundButton();
    
    // Start music if it was enabled
    if (isMusicPlaying) {
        playBackgroundMusic();
    }
}

function playBackgroundMusic() {
    backgroundMusic.currentTime = 0;
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isMusicPlaying = true;
                updateMusicButton();
            })
            .catch(error => {
                console.error('Error playing music:', error);
            });
    }
}
// Toggle background music
function toggleBackgroundMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        isMusicPlaying = false;
    } else {
        playBackgroundMusic();
    }
    // Save the new state
    localStorage.setItem('chess-music-enabled', isMusicPlaying);
    updateMusicButton();
}

function toggleSoundEffects() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('chess-sound-enabled', isSoundEnabled);
    updateSoundButton();
}
// Update music button
function updateMusicButton() {
    const musicButton = document.getElementById('music-toggle');
    musicButton.textContent = isMusicPlaying ? '🎵 Music On' : '🎵 Music Off';
    musicButton.classList.toggle('active', isMusicPlaying);
}
// Update sound button
function updateSoundButton() {
    const soundButton = document.getElementById('sound-toggle');
    soundButton.textContent = isSoundEnabled ? '🔊 Sound On' : '🔊 Sound Off';
    soundButton.classList.toggle('active', isSoundEnabled);
}

// Modify the existing playSound function
function playSound(sound) {
    if (isSoundEnabled) {
        try {
            sound.currentTime = 0;
            sound.play().catch(error => console.log('Sound play failed:', error));
        } catch (error) {
            console.log('Sound play error:', error);
        }
    }
}
// Add visibility change handler
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isMusicPlaying) {
            backgroundMusic.pause();
        }
    } else {
        if (isMusicPlaying) {
            backgroundMusic.play()
                .catch(error => console.error('Error resuming music:', error));
        }
    }
});


// Game state
let board = null;
let game = new Chess();
let userColor = 'w';
let lastMove = null;

// Initialize Stockfish
const stockfish = new Worker("stockfish.js");

// Initialize Stockfish with optimal settings
function initializeStockfish() {
    stockfish.postMessage('uci');
    stockfish.postMessage('isready');
    stockfish.postMessage('ucinewgame');
    stockfish.postMessage('setoption name MultiPV value 1');
    stockfish.postMessage('setoption name Skill Level value ' + (difficultySelect.value * 5));
    console.log('Stockfish initialized');
}

// Handle Stockfish responses
stockfish.onmessage = function(event) {
    const message = event.data;
    console.log('Stockfish:', message);
    
    if (message.startsWith("bestmove")) {
        const moveStr = message.split(" ")[1];
        if (!moveStr) return;

        const from = moveStr.slice(0, 2);
        const to = moveStr.slice(2, 4);
        const promotion = moveStr.length > 4 ? moveStr[4] : 'q';

        // Make the AI move
        const move = game.move({
            from: from,
            to: to,
            promotion: promotion
        });

        if (move) {
            // Update board position
            board.position(game.fen());

            // Play sound
            if (move.captured) {
                playSound(captureSound);
            } else {
                playSound(moveSound);
            }

            // Update UI
            updateStatus();
            updateMoveHistory();
            updateCapturedPieces();

            // Highlight the AI's move
            highlightLastMove(from, to);
        }
    }
};

// Initialize the board
function initializeBoard() {
    const config = {
        draggable: true,
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };
    
    board = Chessboard('board', config);
    
    // Ensure proper sizing
    $(window).resize(() => {
        board.resize();
    });
    
    updateStatus();
}

// Handle piece movement validation
function onDragStart(source, piece, position, orientation) {
    // Only pick up pieces for the current side to move
    if (game.game_over() || 
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        game.turn() !== userColor) {
        return false;
    }
}

// Handle piece drops
function onDrop(source, target) {
    removeHighlights();

    // Try to make the move
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });

    // If illegal move, snapback
    if (move === null) return 'snapback';

    // Update board position
    board.position(game.fen());

    // Play move sound
    if (move.captured) {
        playSound(captureSound);
    } else {
        playSound(moveSound);
    }

    // Update UI
    updateStatus();
    updateMoveHistory();
    updateCapturedPieces();

    // Highlight last move
    highlightLastMove(source, target);

    // Make AI move after a short delay
    setTimeout(makeAiMove, 250);
}

function onSnapEnd() {
    board.position(game.fen());
}

// Handle legal move highlighting
function onMouseoverSquare(square, piece) {
    // Don't show hints if it's not the player's turn
    if (game.game_over() || game.turn() !== userColor) return;

    // Get list of possible moves for this square
    const moves = game.moves({
        square: square,
        verbose: true
    });

    // Exit if there are no moves available for this square
    if (moves.length === 0) return;

    // Highlight the square they moused over
    highlightSquare(square);

    // Highlight the possible moves
    moves.forEach(move => {
        highlightSquare(move.to);
    });
}

function onMouseoutSquare(square, piece) {
    removeHighlights();
}

// Square highlighting
function highlightSquare(square) {
    const squareEl = $(`.square-${square}`);
    squareEl.addClass('highlight-square');
}

function removeHighlights() {
    $('.square-55d63').removeClass('highlight-square');
}

function highlightLastMove(source, target) {
    $('.square-55d63').removeClass('highlight-last-move');
    $(`.square-${source}`).addClass('highlight-last-move');
    $(`.square-${target}`).addClass('highlight-last-move');
    lastMove = target;
}

// Make AI move
function makeAiMove() {
    if (game.game_over()) return;

    // Send current position to Stockfish
    stockfish.postMessage('position fen ' + game.fen());
    
    // Calculate appropriate depth based on difficulty
    const depth = difficultySelect.value * 2 + 1;
    console.log('Calculating move at depth:', depth);
    
    // Start calculation
    stockfish.postMessage('go depth ' + depth);
}

// Play sound with error handling
function playSound(sound) {
    try {
        sound.currentTime = 0;
        sound.play().catch(error => console.log('Sound play failed:', error));
    } catch (error) {
        console.log('Sound play error:', error);
    }
}

// Update game status
function updateStatus() {
    let status = '';
    
    if (game.in_checkmate()) {
        status = `Game over, ${game.turn() === 'w' ? 'black' : 'white'} wins by checkmate!`;
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
        if (game.in_check()) {
            status += ', check!';
        }
    }
    
    statusElement.textContent = status;
}

// Update move history
function updateMoveHistory() {
    pgnElement.textContent = game.pgn({ max_width: 5, newline_char: '\n' });
    pgnElement.scrollTop = pgnElement.scrollHeight;
    console.log('Move history updated:', game.pgn());
}

// Update captured pieces
function updateCapturedPieces() {
    const history = game.history({ verbose: true });
    const capturedWhite = document.getElementById('captured-white');
    const capturedBlack = document.getElementById('captured-black');
    
    if (!capturedWhite || !capturedBlack) return;

    capturedWhite.innerHTML = '';
    capturedBlack.innerHTML = '';
    
    const capturedPieces = {
        w: [],
        b: []
    };
    
    history.forEach(move => {
        if (move.captured) {
            const color = move.color === 'w' ? 'b' : 'w';
            capturedPieces[color].push(move.captured);
        }
    });
    
    const pieceSymbols = {
        p: '♟',
        n: '♞',
        b: '♝',
        r: '♜',
        q: '♛'
    };
    
    capturedPieces.w.forEach(piece => {
        const span = document.createElement('span');
        span.className = 'captured-piece';
        span.textContent = pieceSymbols[piece];
        capturedWhite.appendChild(span);
    });
    
    capturedPieces.b.forEach(piece => {
        const span = document.createElement('span');
        span.className = 'captured-piece';
        span.textContent = pieceSymbols[piece];
        capturedBlack.appendChild(span);
    });
}

// Event listeners
restartButton.addEventListener('click', () => {
    game = new Chess();
    stockfish.postMessage('ucinewgame');
    board.start();
    userColor = 'w';
    lastMove = null;
    $('.square-55d63').removeClass('highlight-last-move');
    updateStatus();
    updateMoveHistory();
    updateCapturedPieces();
});

difficultySelect.addEventListener('change', function() {
    const skillLevel = this.value * 5; // Scale 1-4 to skill levels 5-20
    stockfish.postMessage('setoption name Skill Level value ' + skillLevel);
});

// Initialize everything
$(document).ready(() => {
    initializeBoard();
    initializeStockfish();
    initSoundControls();  
    
    // Start audio on first click (browser policy)
    document.addEventListener('click', function initAudio() {
        if (isMusicPlaying) {
            playBackgroundMusic();
        }
        // Remove the click listener after it has run once
        document.removeEventListener('click', initAudio);
    }, { once: true });
});