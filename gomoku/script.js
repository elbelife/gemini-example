const BOARD_SIZE = 15;
let currentPlayer = 'black'; // 'black' or 'white'
let gameActive = true;
let boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
let lastMove = null; // {x, y}

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

function initGame() {
    createBoard();
    resetBtn.addEventListener('click', resetGame);
    updateStatus();
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
    
    if (boardState[y][x]) return; // Already occupied

    const shadow = cell.querySelector('.shadow-stone');
    // Remove both classes then add current
    shadow.classList.remove('black', 'white');
    shadow.classList.add(currentPlayer);
}

function handleCellClick(x, y) {
    if (!gameActive || boardState[y][x]) return;

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
    lastMove = {x, y};
    updateLastMoveVisuals();
    updateStatus();
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
    // Optional: Add a marker for the last move
    // First remove existing markers
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
        statusElement.textContent = `${currentPlayer === 'black' ? "Player 1 (Black)" : "Player 2 (White)"}'s Turn`;
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
        const winningCells = [{x, y}];

        // Check forward
        let i = 1;
        while (true) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
            if (boardState[ny][nx] !== player) break;
            count++;
            winningCells.push({x: nx, y: ny});
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
            winningCells.push({x: nx, y: ny});
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
    
    // Clear board visually but keep grid structure? 
    // Easier to just re-create or clear contents. Re-creating is safer for state sync.
    createBoard();
    updateStatus();
}

// Start
initGame();
