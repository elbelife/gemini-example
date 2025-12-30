const BOARD_SIZE = 15;
let currentPlayer = 'black'; // 'black' or 'white'
let gameActive = true;
let boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
let lastMove = null; // {x, y}
let gameMode = 'pvp'; // 'pvp' or 'pve'
let difficulty = 'medium'; // 'easy', 'medium', 'hard'

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const modeSelect = document.getElementById('mode-select');
const difficultySelect = document.getElementById('difficulty-select');

function initGame() {
    createBoard();
    resetBtn.addEventListener('click', resetGame);
    modeSelect.addEventListener('change', changeMode);
    difficultySelect.addEventListener('change', changeDifficulty);

    // Initial UI state
    updateControls();
    updateStatus();
}

function changeMode(e) {
    gameMode = e.target.value;
    updateControls();
    resetGame();
}

function changeDifficulty(e) {
    difficulty = e.target.value;
    resetGame();
}

function updateControls() {
    if (gameMode === 'pve') {
        difficultySelect.style.display = 'block';
    } else {
        difficultySelect.style.display = 'none';
    }
}

function createBoard() {
    boardElement.innerHTML = '';
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Preview shadow element
            const shadow = document.createElement('div');
            shadow.classList.add('shadow-stone');
            cell.appendChild(shadow);

            cell.addEventListener('click', () => handleCellClick(x, y));
            cell.addEventListener('mouseenter', () => handleCellHover(cell));

            boardElement.appendChild(cell);
        }
    }
}

function handleCellHover(cell) {
    if (!gameActive) return;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    // In PvE, if it's AI's turn (white), don't show shadow for human
    if (gameMode === 'pve' && currentPlayer === 'white') return;

    if (boardState[y][x]) return; // Already occupied

    const shadow = cell.querySelector('.shadow-stone');
    // Remove both classes then add current
    shadow.classList.remove('black', 'white');
    shadow.classList.add(currentPlayer);
}

function handleCellClick(x, y) {
    if (!gameActive || boardState[y][x]) return;

    // In PvE, prevent human from clicking during AI turn
    if (gameMode === 'pve' && currentPlayer === 'white') return;

    performMove(x, y);

    if (gameActive && gameMode === 'pve' && currentPlayer === 'white') {
        setTimeout(computerMove, 500); // Delay for realism
    }
}

function performMove(x, y) {
    // Place stone logic
    boardState[y][x] = currentPlayer;
    renderStone(x, y, currentPlayer);

    // Check win
    if (checkWin(x, y, currentPlayer)) {
        gameActive = false;
        statusElement.textContent = `${currentPlayer === 'black' ? 'Black' : 'White'} Wins!`;
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    lastMove = { x, y };
    updateLastMoveVisuals();
    updateStatus();
}

function computerMove() {
    if (!gameActive) return;

    // 1. Check for immediate win
    const winMove = findBestMove('white'); // AI is white
    if (winMove && winMove.score === Infinity) {
        performMove(winMove.x, winMove.y);
        return;
    }

    // 2. Block opponent's immediate win
    const blockMove = findBestMove('black'); // Opponent is black
    if (blockMove && blockMove.score === Infinity) {
        performMove(blockMove.x, blockMove.y);
        return;
    }

    // 3. Strategic placement (heuristic)
    // We reuse evaluateBoard for 'white' to find best spot
    const bestMove = findBestMove('white');
    if (bestMove) {
        performMove(bestMove.x, bestMove.y);
    } else {
        // Fallback (center or random) if board is empty (?) unlikely 
        const center = Math.floor(BOARD_SIZE / 2);
        if (!boardState[center][center]) {
            performMove(center, center);
        } else {
            // Just find first empty
            for (let y = 0; y < BOARD_SIZE; y++) {
                for (let x = 0; x < BOARD_SIZE; x++) {
                    if (!boardState[y][x]) {
                        performMove(x, y);
                        return;
                    }
                }
            }
        }

    }
}

function findBestMove(player) {
    let bestScore = -Infinity;
    let moves = [];

    // Simple heuristic: Iterate all empty cells
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (boardState[y][x]) continue;

            const score = evaluatePosition(x, y, player);
            if (score > bestScore) {
                bestScore = score;
                moves = [{ x, y }];
            } else if (score === bestScore) {
                moves.push({ x, y });
            }
        }
    }

    // If win found (Infinity), return immediately
    if (bestScore === Infinity && moves.length > 0) return { x: moves[0].x, y: moves[0].y, score: bestScore };

    // Otherwise pick random from best
    if (moves.length > 0) {
        const rand = Math.floor(Math.random() * moves.length);
        return { ...moves[rand], score: bestScore };
    }
    return null;
}

function evaluatePosition(x, y, player) {
    // Check 4 directions
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    let totalScore = 0;

    for (const [dx, dy] of directions) {
        const line = getLine(x, y, dx, dy, player);
        const score = scoreLine(line);
        if (score === Infinity) return Infinity; // Win
        totalScore += score;
    }

    // Add positional bias (center is better)
    const center = BOARD_SIZE / 2;
    const dist = Math.abs(x - center) + Math.abs(y - center);
    totalScore -= dist; // Slight penalty for edges

    return totalScore;
}

function getLine(x, y, dx, dy, player) {
    // Get sequence of stones including (x,y) if we placed there
    // We look 4 steps back and 4 steps forward to see the potential 5-in-a-row context
    let line = "";
    // Because we are evaluating a Hypothetical move at x,y for 'player':
    // We treat boardState[y][x] as 'player' for this check.

    for (let i = -4; i <= 4; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;

        if (i === 0) {
            line += "P"; // Player (hypothetical)
            continue;
        }

        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
            line += "W"; // Wall/Edge
        } else {
            const cell = boardState[ny][nx];
            if (cell === null) line += "_";
            else if (cell === player) line += "P";
            else line += "O"; // Opponent
        }
    }
    return line;
}

function scoreLine(line) {
    // Regex based patterns
    // P = Player (us), _ = Empty, O = Opponent

    if (line.includes("PPPPP")) return Infinity; // Win

    // Open 4: _PPPP_
    if (line.includes("_PPPP_")) return 100000;

    // Blocked 4: OPPPP_ or _PPPPO or P_PPP etc (simplified)
    if (line.includes("_PPPP") || line.includes("PPPP_") || line.includes("P_PPP") || line.includes("PPP_P")) return 10000;

    // Open 3: _PPP_  -> allows creating open 4
    if (line.includes("_PPP_") || line.includes("_P_PP_") || line.includes("_PP_P_")) return 5000;

    // This is valid but primitive.
    // To make it smarter, we sum occurrences.

    let score = 0;
    // Check various patterns
    if (line.match(/_PPP_/)) score += 5000;
    if (line.match(/_PP_/)) score += 500;
    if (line.match(/_P_/)) score += 50;

    return score;
}


function renderStone(x, y, player) {
    const index = y * BOARD_SIZE + x;
    const cell = boardElement.children[index];

    const stone = document.createElement('div');
    stone.classList.add('stone', player);
    cell.appendChild(stone);

    // Remove shadow preview immediately to avoid visual glitch if mouse stays
    const shadow = cell.querySelector('.shadow-stone');
    shadow.classList.remove('black', 'white');
}

function updateLastMoveVisuals() {
    document.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));

    if (lastMove) {
        const index = lastMove.y * BOARD_SIZE + lastMove.x;
        const cell = boardElement.children[index];
        const stone = cell.querySelector('.stone');
        if (stone) stone.classList.add('last-move');
    }
}

function updateStatus() {
    if (gameActive) {
        if (gameMode === 'pve') {
            statusElement.textContent = currentPlayer === 'black' ? "Your Turn (Black)" : "Computer thinking...";
        } else {
            statusElement.textContent = `${currentPlayer === 'black' ? "Player 1 (Black)" : "Player 2 (White)"}'s Turn`;
        }
    }
}

function checkWin(x, y, player) {
    const directions = [
        [1, 0],  // Horizontal
        [0, 1],  // Vertical
        [1, 1],  // Diagonal \
        [1, -1]  // Diagonal /
    ];

    for (const [dx, dy] of directions) {
        let count = 1; // Count current stone
        const winningCells = [{ x, y }];

        // Check forward
        let i = 1;
        while (true) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
            if (boardState[ny][nx] !== player) break;
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
            if (boardState[ny][nx] !== player) break;
            count++;
            winningCells.push({ x: nx, y: ny });
            i++;
        }

        if (count >= 5) {
            highlightWinningCells(winningCells);
            return true;
        }
    }
    return false;
}

function highlightWinningCells(cells) {
    cells.forEach(pos => {
        const index = pos.y * BOARD_SIZE + pos.x;
        const cell = boardElement.children[index];
        const stone = cell.querySelector('.stone');
        if (stone) stone.classList.add('winning-stone');
    });
}

function resetGame() {
    boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    gameActive = true;
    lastMove = null;
    createBoard();
    updateStatus();

    // If AI is black (not doing that yet) or resetting during AI turn...
}

// Start
initGame();
