// Mine placement utility functions
function showMinePlacementGuidelines() {
    const squares = document.querySelectorAll('.square-55d63');
    squares.forEach(square => {
        const squareName = square.getAttribute('data-square');
        if (canPlaceMineOnSquare(squareName)) {
            square.classList.add('valid-mine-square');
        }
    });
}

function hideMinePlacementGuidelines() {
    const squares = document.querySelectorAll('.valid-mine-square');
    squares.forEach(square => {
        square.classList.remove('valid-mine-square');
    });
}

function canPlaceMineOnSquare(square) {
    const currentPlayer = game.turn();
    const piece = game.get(square);
    
    // Basic requirements
    if (!piece || piece.color !== currentPlayer) return false;
    if (!canPlaceMinesBasedOnMoves()) return false;
    if (mines[currentPlayer].length >= minesPerPlayer) return false;
    
    // Check king's moves
    const opponentColor = currentPlayer === 'w' ? 'b' : 'w';
    const opponentKingMoves = getKingPossibleMoves(opponentColor);
    if (opponentKingMoves.includes(square)) return false;
    
    return true;
}

// Update styles for mine placement visualization
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .valid-mine-square {
        background: radial-gradient(circle, rgba(0,255,0,0.2) 0%, transparent 100%) !important;
    }
    .mine-placement-active .square-55d63:hover {
        cursor: crosshair;
    }
`;
document.head.appendChild(styleSheet);