// DOM element selection
const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('resetButton');
const difficultySelect = document.getElementById('difficulty');

let currentPlayer = 'X';
let gameActive = true;
let gameState = Array(9).fill(null);

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Create cells dynamically
function createBoard() {
  board.innerHTML = '';
  gameState.forEach((_, index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = index;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  });
}

// Handle click on a cell
function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = cell.dataset.index;

  if (gameState[cellIndex] || !gameActive || currentPlayer === 'O') return;

  gameState[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add('taken');

  if (checkWinner()) {
    statusText.textContent = `¡Ganador: ${currentPlayer}!`;
    gameActive = false;
    return;
  }

  if (gameState.every(cell => cell)) {
    statusText.textContent = '¡Empate!';
    gameActive = false;
    return;
  }

  currentPlayer = 'O';
  statusText.textContent = `Turno de: ${currentPlayer}`;

  if (currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

// Computer movement based on difficulty
function computerMove() {
  const difficulty = difficultySelect.value;

  let move;
  if (difficulty === 'easy') {
    move = getRandomMove();
  } else if (difficulty === 'medium') {
    move = Math.random() > 0.5 ? findBestMove() : getRandomMove();
  } else {
    move = findBestMove();
  }

  gameState[move] = 'O';

  const cell = document.querySelector(`[data-index="${move}"]`);
  cell.textContent = 'O';
  cell.classList.add('taken');

  if (checkWinner()) {
    statusText.textContent = `¡Ganador: O!`;
    gameActive = false;
    return;
  }

  if (gameState.every(cell => cell)) {
    statusText.textContent = '¡Empate!';
    gameActive = false;
    return;
  }

  currentPlayer = 'X';
  statusText.textContent = `Turno de: ${currentPlayer}`;
}

// Get a random move
function getRandomMove() {
  const availableMoves = gameState
    .map((cell, index) => (cell === null ? index : null))
    .filter(index => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Check for a winner
function checkWinner() {
  return winningCombinations.some(combination => {
    const [a, b, c] = combination;
    return (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    );
  });
}

// Minimax algorithm implementation
function minimax(board, depth, isMaximizing) {
  const winner = checkWinnerWithPlayer(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(cell => cell)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Find the best move
function findBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < gameState.length; i++) {
    if (!gameState[i]) {
      gameState[i] = 'O';
      const score = minimax(gameState, 0, false);
      gameState[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// Check for a winner with a specific board (for Minimax)
function checkWinnerWithPlayer(board) {
  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Restart game
resetButton.addEventListener('click', resetGame);

function resetGame() {
  currentPlayer = 'X';
  gameActive = true;
  gameState.fill(null);
  statusText.textContent = `Turno de: ${currentPlayer}`;
  createBoard();
}

// Initialize game
createBoard();
