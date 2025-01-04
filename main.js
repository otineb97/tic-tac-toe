// DOM Elements
const gameContainer = document.getElementById("game-container");
const resultDisplay = document.getElementById("result-display");
const resetButton = document.getElementById("reset-button");
const historyContainer = document.getElementById("history-container");
const difficultySelector = document.getElementById("difficulty");

// Game Variables
let board = Array.from({ length: 3 }, () => Array(3).fill(""));
let currentPlayer = "X";
let gameActive = true;
let history = [];
let difficulty = "hard";

// Initialize Game
function createBoard() {
  gameContainer.innerHTML = "";
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Add the click event
      cell.addEventListener("click", handlePlayerMove);
      gameContainer.appendChild(cell);
    }
  }
}

// Handle Player's Move
function handlePlayerMove(event) {
  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (board[row][col] || !gameActive) return;

  board[row][col] = currentPlayer;
  cell.textContent = currentPlayer;

  const winner = checkWinner();
  if (winner) return endGame(winner);

  currentPlayer = "O";
  setTimeout(computerMove, 500);
}

// Computer's Move
function computerMove() {
  const move = getBestMove();

  if (move) {
    const { row, col } = move;
    board[row][col] = currentPlayer;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.textContent = currentPlayer;

    const winner = checkWinner();
    if (winner) return endGame(winner);

    currentPlayer = "X";
  }
}

// Determine Best Move
function getBestMove() {
  switch (difficulty) {
    case "easy":
      return findRandomMove();
    case "medium":
      return Math.random() < 0.5 ? findBestMove() : findRandomMove();
    case "hard":
    default:
      return findBestMove();
  }
}

// Find Random Move
function findRandomMove() {
  const availableMoves = board.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => (cell === "" ? { row: rowIndex, col: colIndex } : null))
  ).filter(Boolean);

  return availableMoves.length > 0
    ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
    : null;
}

// Find Best Move
function findBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) {
        board[rowIndex][colIndex] = "O";
        const score = minimax(board, 0, false);
        board[rowIndex][colIndex] = "";

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row: rowIndex, col: colIndex };
        }
      }
    });
  });

  return bestMove;
}

// Minimax Algorithm
function minimax(board, depth, isMaximizing) {
  const winner = checkWinner();
  if (winner) return winner === "O" ? 10 - depth : winner === "X" ? depth - 10 : 0;

  const scores = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) {
        board[rowIndex][colIndex] = isMaximizing ? "O" : "X";
        scores.push(minimax(board, depth + 1, !isMaximizing));
        board[rowIndex][colIndex] = "";
      }
    });
  });

  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

// Check Winner or Draw
function checkWinner() {
  const lines = [
    ...board,
    ...board[0].map((_, colIndex) => board.map((row) => row[colIndex])),
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];

  for (const line of lines) {
    if (line.every((cell) => cell === "X")) return "X";
    if (line.every((cell) => cell === "O")) return "O";
  }

  return board.flat().includes("") ? null : "draw";
}

// End Game
function endGame(winner) {
  gameActive = false;
  resultDisplay.textContent = winner === "draw" ? "It's a draw!" : `Player ${winner} wins!`;
  history.push(winner === "draw" ? "Draw" : winner === "X" ? "Player won!" : "Computer won!");
  updateHistory();
}

// Reset Game
function resetGame() {
  board = Array.from({ length: 3 }, () => Array(3).fill(""));
  currentPlayer = "X";
  gameActive = true;
  resultDisplay.textContent = "";
  createBoard();
}

// Update History
function updateHistory() {
  historyContainer.innerHTML = history
    .map((entry, index) => `<li class="list-group-item">${index + 1}. ${entry}</li>`)
    .join("");
}

// Event Listeners
resetButton.addEventListener("click", resetGame);
difficultySelector.addEventListener("change", (e) => (difficulty = e.target.value));

// Start Game
createBoard();
