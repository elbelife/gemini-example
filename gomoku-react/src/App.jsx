import { useState, useEffect } from 'react'
import './App.css'
import { createEmptyBoard, checkWin, getComputerMove, BOARD_SIZE } from './gameLogic'

function App() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState('black')
  const [gameActive, setGameActive] = useState(true)
  const [winner, setWinner] = useState(null)
  const [winningCells, setWinningCells] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [gameMode, setGameMode] = useState('pvp') // 'pvp' or 'pve'
  const [difficulty, setDifficulty] = useState('medium') // 'easy', 'medium', 'hard'

  useEffect(() => {
    if (gameActive && gameMode === 'pve' && currentPlayer === 'white') {
      // AI Turn
      const timer = setTimeout(() => {
        const move = getComputerMove(board, difficulty);
        if (move) {
          handleMove(move.x, move.y);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameActive, gameMode, board, difficulty]);

  const handleMove = (x, y) => {
    if (!gameActive || board[y][x]) return;

    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = currentPlayer;
    setBoard(newBoard);
    setLastMove({ x, y });

    const winResult = checkWin(newBoard, x, y, currentPlayer);
    if (winResult) {
      setGameActive(false);
      setWinner(currentPlayer);
      setWinningCells(winResult);
    } else {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  const handleCellClick = (x, y) => {
    if (gameMode === 'pve' && currentPlayer === 'white') return; // Block input during AI turn
    handleMove(x, y);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setGameActive(true);
    setWinner(null);
    setWinningCells([]);
    setLastMove(null);
  };

  const getStatusMessage = () => {
    if (winner) {
      return `${winner === 'black' ? 'Black' : 'White'} Wins!`;
    }
    if (!gameActive) return 'Game Over';

    if (gameMode === 'pve') {
      return currentPlayer === 'black' ? "Your Turn (Black)" : "Computer thinking...";
    }
    return `${currentPlayer === 'black' ? "Player 1 (Black)" : "Player 2 (White)"}'s Turn`;
  };

  return (
    <div className="game-container">
      <header>
        <h1>Gomoku</h1>
        <p className="subtitle">Five in a row to win</p>
      </header>

      <div className="controls">
        <select value={gameMode} onChange={(e) => {
          setGameMode(e.target.value);
          resetGame();
        }}>
          <option value="pvp">Player vs Player</option>
          <option value="pve">Player vs Computer</option>
        </select>

        {gameMode === 'pve' && (
          <select value={difficulty} onChange={(e) => {
            setDifficulty(e.target.value);
            resetGame(); // Reset to fair start
          }}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        )}

        <button onClick={resetGame}>New Game</button>
      </div>

      <div id="status">{getStatusMessage()}</div>

      <div className="board">
        {board.map((row, y) => (
          row.map((cell, x) => {
            const isWinning = winningCells.some(wc => wc.x === x && wc.y === y);
            const isLast = lastMove && lastMove.x === x && lastMove.y === y;
            return (
              <div
                key={`${x}-${y}`}
                className="cell"
                onClick={() => handleCellClick(x, y)}
              >
                {/* Shadow/Hover Preview */}
                {gameActive && !cell && (gameMode !== 'pve' || currentPlayer === 'black') && (
                  <div className={`shadow-stone ${currentPlayer}`}></div>
                )}

                {/* Stone */}
                {cell && (
                  <div className={`stone ${cell} ${isWinning ? 'winning-stone' : ''} ${isLast ? 'last-move' : ''}`}></div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  )
}

export default App
