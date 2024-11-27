let board = null;
let game = new Chess();
let selectedSquare = null;
let aiLevel = 2;

function initChessGame() {
    const chessBoard = document.getElementById('chess-board');
    if (!chessBoard) return;
    
    chessBoard.innerHTML = '';
    
    // Create board squares
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('chess-square');
            square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            square.dataset.position = `${String.fromCharCode(97 + j)}${8 - i}`;
            square.addEventListener('click', handleSquareClick);
            chessBoard.appendChild(square);
        }
    }
    
    updateBoard();
    setupEventListeners();
}

function updateBoard() {
    const position = game.board();
    const squares = document.getElementsByClassName('chess-square');
    
    Array.from(squares).forEach(square => {
        const pos = square.dataset.position;
        const piece = position[8 - parseInt(pos[1])][pos.charCodeAt(0) - 97];
        square.textContent = piece ? getPieceSymbol(piece) : '';
    });
    
    document.getElementById('player-turn').textContent = 
        `${game.turn() === 'w' ? 'White' : 'Black'}'s Turn`;
        
    updateMoveHistory();
    updateCapturedPieces();
}

function getPieceSymbol(piece) {
    const symbols = {
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
    };
    return symbols[piece.type];
}

function handleSquareClick(event) {
    const square = event.target;
    const pos = square.dataset.position;
    
    if (game.game_over() || game.turn() === 'b') return;
    
    if (selectedSquare === null) {
        // Select piece
        const piece = game.get(pos);
        if (piece && piece.color === 'w') {
            selectedSquare = pos;
            square.classList.add('selected');
            showValidMoves(pos);
        }
    } else {
        // Move piece
        const move = {
            from: selectedSquare,
            to: pos,
            promotion: 'q'
        };
        
        const result = game.move(move);
        
        clearSelection();
        
        if (result) {
            updateBoard();
            playSound('move');
            
            // AI move
            setTimeout(makeAIMove, 500);
        }
    }
}

function clearSelection() {
    selectedSquare = null;
    const squares = document.getElementsByClassName('chess-square');
    Array.from(squares).forEach(square => {
        square.classList.remove('selected', 'valid-move');
    });
}

function showValidMoves(pos) {
    const moves = game.moves({ square: pos, verbose: true });
    moves.forEach(move => {
        const square = document.querySelector(`[data-position="${move.to}"]`);
        if (square) square.classList.add('valid-move');
    });
}

function makeAIMove() {
    if (game.game_over()) return;
    
    const move = calculateBestMove(game, aiLevel);
    game.move(move);
    updateBoard();
    playSound('move');
    
    if (game.game_over()) {
        handleGameOver();
    }
}

function handleGameOver() {
    let message = '';
    if (game.in_checkmate()) {
        message = `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`;
    } else if (game.in_draw()) {
        message = 'Game drawn!';
    } else if (game.in_stalemate()) {
        message = 'Game drawn by stalemate!';
    }
    
    setTimeout(() => alert(message), 100);
}

function setupEventListeners() {
    document.getElementById('new-game').addEventListener('click', () => {
        game = new Chess();
        clearSelection();
        updateBoard();
    });
    
    document.getElementById('difficulty').addEventListener('change', (e) => {
        aiLevel = parseInt(e.target.value);
    });
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initChessGame);