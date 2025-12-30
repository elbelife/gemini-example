export const BOARD_SIZE = 15;

export function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

export function checkWin(board, x, y, player) {
    const directions = [
        [1, 0],  // Horizontal
        [0, 1],  // Vertical
        [1, 1],  // Diagonal \
        [1, -1]  // Diagonal /
    ];

    for (const [dx, dy] of directions) {
        let count = 1;
        const winningCells = [{ x, y }];

        // Check forward
        let i = 1;
        while (true) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
            if (board[ny][nx] !== player) break;
            count++;
            winningCells.push({ x: nx, y: ny });
            i++;
        }

        // Check backward
        i = 1;
        while (true) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
            if (board[ny][nx] !== player) break;
            count++;
            winningCells.push({ x: nx, y: ny });
            i++;
        }

        if (count >= 5) {
            return winningCells;
        }
    }
    return null;
}

// AI Logic
export function getComputerMove(board, difficulty) {
    // Easy: Random mistakes
    if (difficulty === 'easy') {
        if (Math.random() < 0.3) {
            return getRandomMove(board);
        }
    }

    // 1. Check for immediate win
    const winMove = findBestMove(board, 'white');
    if (winMove && winMove.score === Infinity) {
        return { x: winMove.x, y: winMove.y };
    }

    // 2. Block opponent's immediate win
    const blockMove = findBestMove(board, 'black');
    if (blockMove && blockMove.score === Infinity) {
        return { x: blockMove.x, y: blockMove.y };
    }

    // Hard: Look deeper for threats
    if (difficulty === 'hard') {
        const blockStrategic = findBestMove(board, 'black');
        const myStrategic = findBestMove(board, 'white');

        if (blockStrategic && blockStrategic.score > 4000) {
            if (!myStrategic || myStrategic.score < blockStrategic.score) {
                return { x: blockStrategic.x, y: blockStrategic.y };
            }
        }
    }

    // 3. Strategic placement
    const bestMove = findBestMove(board, 'white');
    if (bestMove) {
        return { x: bestMove.x, y: bestMove.y };
    } else {
        return getRandomMove(board);
    }
}

function getRandomMove(board) {
    const emptyCells = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (!board[y][x]) emptyCells.push({ x, y });
        }
    }

    // Try center if board empty
    const center = Math.floor(BOARD_SIZE / 2);
    if (!board[center][center]) return { x: center, y: center };

    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    return null;
}

function findBestMove(board, player) {
    let bestScore = -Infinity;
    let moves = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x]) continue;

            const score = evaluatePosition(board, x, y, player);
            if (score > bestScore) {
                bestScore = score;
                moves = [{ x, y }];
            } else if (score === bestScore) {
                moves.push({ x, y });
            }
        }
    }

    if (bestScore === Infinity && moves.length > 0) return { x: moves[0].x, y: moves[0].y, score: bestScore };

    if (moves.length > 0) {
        const rand = Math.floor(Math.random() * moves.length);
        return { ...moves[rand], score: bestScore };
    }
    return null;
}

function evaluatePosition(board, x, y, player) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    let totalScore = 0;

    for (const [dx, dy] of directions) {
        const line = getLine(board, x, y, dx, dy, player);
        const score = scoreLine(line);
        if (score === Infinity) return Infinity;
        totalScore += score;
    }

    const center = BOARD_SIZE / 2;
    const dist = Math.abs(x - center) + Math.abs(y - center);
    totalScore -= dist;

    return totalScore;
}

function getLine(board, x, y, dx, dy, player) {
    let line = "";
    for (let i = -4; i <= 4; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;

        if (i === 0) {
            line += "P";
            continue;
        }

        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
            line += "W";
        } else {
            const cell = board[ny][nx];
            if (cell === null) line += "_";
            else if (cell === player) line += "P";
            else line += "O";
        }
    }
    return line;
}

function scoreLine(line) {
    if (line.includes("PPPPP")) return Infinity;
    if (line.includes("_PPPP_")) return 100000;
    if (line.includes("_PPPP") || line.includes("PPPP_") || line.includes("P_PPP") || line.includes("PPP_P")) return 10000;
    if (line.includes("_PPP_") || line.includes("_P_PP_") || line.includes("_PP_P_")) return 5000;

    let score = 0;
    if (line.match(/_PPP_/)) score += 5000;
    if (line.match(/_PP_/)) score += 500;
    if (line.match(/_P_/)) score += 50;
    return score;
}
