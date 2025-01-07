const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const winnerElement = document.getElementById('winner');
    
let board = Array(9).fill(null);
let currentPlayer = 'X';
let scores = { X: 0, O: 0 };
let aiDifficulty;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function initGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    winnerElement.style.display = 'none';
    winnerElement.textContent = '';
    aiDifficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');
      if (cell) {
        cellElement.textContent = cell;
        cellElement.classList.add(cell.toLowerCase());
        cellElement.classList.add('taken');
      }
      cellElement.addEventListener('click', () => handleMove(index));
      boardElement.appendChild(cellElement);
    });
}

function handleMove(index) {
    if (board[index] || checkWinner()) return;
    board[index] = currentPlayer;
    renderBoard();
    if (checkWinner()) {
      scores[currentPlayer]++;
      updateScores();
      highlightWinningCells();
      displayWinner(`Jugador ${currentPlayer} gana!`);
      return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (currentPlayer === 'O') {
      aiMove();
    }
}

function aiMove() {
    let move;
    if (aiDifficulty === 'hard') {
      move = minimax(board, 'O').index;
    } else if (aiDifficulty === 'medium') {
      move = Math.random() > 0.5 ? minimax(board, 'O').index : randomMove();
    } else {
      move = randomMove();
    }
    board[move] = 'O';
    renderBoard();
    if (checkWinner()) {
      scores['O']++;
      updateScores();
      highlightWinningCells();
      displayWinner('Jugador O gana!');
      return;
    }
    currentPlayer = 'X';
}

function randomMove() {
    const available = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function minimax(newBoard, player) {
    const available = newBoard.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
    if (checkWinner(newBoard, 'X')) return { score: -10 };
    if (checkWinner(newBoard, 'O')) return { score: 10 };
    if (available.length === 0) return { score: 0 };

    const moves = [];
    available.forEach(index => {
      const move = {};
      move.index = index;
      newBoard[index] = player;
      move.score = minimax(newBoard, player === 'O' ? 'X' : 'O').score;
      newBoard[index] = null;
      moves.push(move);
    });

    return moves.reduce((bestMove, move) => (
      (player === 'O' && move.score > bestMove.score) ||
      (player === 'X' && move.score < bestMove.score) ? move : bestMove
    ));
}

function checkWinner(boardState = board, player = currentPlayer) {
    return winningCombinations.find(combination => 
      combination.every(index => boardState[index] === player)
    );
}

function highlightWinningCells() {
    const winningCombination = checkWinner(board);
    if (winningCombination) {
      winningCombination.forEach(index => {
        document.querySelectorAll('.cell')[index].classList.add('winning');
      });
    }
}

function displayWinner(message) {
    winnerElement.textContent = message;
    winnerElement.style.display = 'block';
}

function updateScores() {
    scoreXElement.textContent = scores['X'];
    scoreOElement.textContent = scores['O'];
}

resetButton.addEventListener('click', initGame);
initGame();
