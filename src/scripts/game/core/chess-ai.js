function calculateBestMove(game, depth) {
    const possibleMoves = game.moves();
    let bestMove = null;
    let bestValue = -9999;
    
    for (let i = 0; i < possibleMoves.length; i++) {
        const move = possibleMoves[i];
        game.move(move);
        const value = minimax(game, depth - 1, -10000, 10000, false);
        game.undo();
        
        if (value >= bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }
    
    return bestMove;
}

function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard(game.board());
    }
    
    const possibleMoves = game.moves();
    
    if (isMaximizingPlayer) {
        let bestValue = -9999;
        for (let i = 0; i < possibleMoves.length; i++) {
            game.move(possibleMoves[i]);
            bestValue = Math.max(bestValue, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) {
                break;
            }
        }
        return bestValue;
    } else {
        let bestValue = 9999;
        for (let i = 0; i < possibleMoves.length; i++) {
            game.move(possibleMoves[i]);
            bestValue = Math.min(bestValue, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) {
                break;
            }
        }
        return bestValue;
    }
}

function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece, x, y) {
    if (piece === null) {
        return 0;
    }
    
    const pieceValue = {
        'p': 10,
        'n': 30,
        'b': 30,
        'r': 50,
        'q': 90,
        'k': 900
    };
    
    const absoluteValue = pieceValue[piece.type.toLowerCase()];
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}