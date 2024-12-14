// Movement calculation functions
function calculateSurroundingMinesRook() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Rook's movement (up to 2 squares in each direction)
            const directions = [
                [-1, 0], [-2, 0],  // Up
                [1, 0], [2, 0],    // Down
                [0, -1], [0, -2],  // Left
                [0, 1], [0, 2]     // Right
            ];

            for (const [di, dj] of directions) {
                const ni = i + di;
                const nj = j + dj;
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && cells[ni][nj].isMine) {
                    count++;
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}

function calculateSurroundingMinesBishop() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Bishop's movement (up to 2 squares in each diagonal)
            const directions = [
                [-1, -1], [-2, -2],  // Top-left
                [-1, 1], [-2, 2],    // Top-right
                [1, -1], [2, -2],    // Bottom-left
                [1, 1], [2, 2]       // Bottom-right
            ];

            for (const [di, dj] of directions) {
                const ni = i + di;
                const nj = j + dj;
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && cells[ni][nj].isMine) {
                    count++;
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}

function calculateSurroundingMinesKnight() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Knight's L-shaped movements
            const directions = [
                [-2, -1], [-2, 1],  // Two up, one left/right
                [2, -1], [2, 1],    // Two down, one left/right
                [-1, -2], [1, -2],  // One up/down, two left
                [-1, 2], [1, 2]     // One up/down, two right
            ];

            for (const [di, dj] of directions) {
                const ni = i + di;
                const nj = j + dj;
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && cells[ni][nj].isMine) {
                    count++;
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}

function calculateSurroundingMinesKing() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Check all adjacent cells (King's movement)
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
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