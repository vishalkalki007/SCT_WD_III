// Game Core State Storage
let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let isGameActive = true;
let isComputerMode = false;

// Selection Win Condition Matrix
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Target DOM Elements
const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const resetBtn = document.getElementById('resetBtn');
const pvpModeBtn = document.getElementById('pvpModeBtn');
const aiModeBtn = document.getElementById('aiModeBtn');

// Controller: Handles User Board Clicks
function handleCellClick(event) {
    const clickedCell = event.target;
    if (!clickedCell.classList.contains('cell')) return;

    const clickedIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    // Block interactions if index spot is filled or game has concluded
    if (boardState[clickedIndex] !== "" || !isGameActive) return;

    executeMove(clickedCell, clickedIndex);

    // If Mode is set to AI, and match isn't over, trigger Computer move after short delay
    if (isGameActive && isComputerMode && currentPlayer === "O") {
        gameBoard.style.pointerEvents = "none"; // Temporarily freeze user clicks
        setTimeout(() => {
            makeComputerMove();
            gameBoard.style.pointerEvents = "auto";
        }, 400); 
    }
}

// Sub-Module: Place tokens and update states
function executeMove(cellElement, index) {
    boardState[index] = currentPlayer;
    cellElement.textContent = currentPlayer;
    cellElement.classList.add(currentPlayer === "X" ? "x-marker" : "o-marker");

    checkGameEvaluations();
}

// Sub-Module: Turn Alternation Switch
function swapPlayerTurn() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (isComputerMode && currentPlayer === "O") {
        statusMessage.textContent = "Computer thinking...";
    } else {
        statusMessage.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

// Sub-Module: Check for Win or Tie conditions
function checkGameEvaluations() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            winningLine = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        statusMessage.textContent = `Game Over! Player ${currentPlayer} Wins!`;
        isGameActive = false;
        highlightWinningCells(winningLine);
        return;
    }

    // Tie Condition checking (No remaining empty strings)
    if (!boardState.includes("")) {
        statusMessage.textContent = "Match is a Tie / Draw!";
        isGameActive = false;
        return;
    }

    swapPlayerTurn();
}

// Visual layout decorator highlighting winning line
function highlightWinningCells(indexes) {
    indexes.forEach(index => {
        cells[index].classList.add('winner-cell');
    });
}

/* ==========================================
   COMPUTER OPPONENT STRATEGY ENGINE (AI)
   ========================================== */
function makeComputerMove() {
    let targetIndex = -1;

    // 1. Offensive Check: Can Computer (O) win in this exact turn?
    targetIndex = findWinningMoveFor("O");

    // 2. Defensive Check: Does Player (X) have an immediate winning line to block?
    if (targetIndex === -1) {
        targetIndex = findWinningMoveFor("X");
    }

    // 3. Positional Check: Take the middle square if it is free
    if (targetIndex === -1 && boardState[4] === "") {
        targetIndex = 4;
    }

    // 4. Fallback Check: Pick an available spot at random
    if (targetIndex === -1) {
        const availableIndexes = boardState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
        targetIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    }

    if (targetIndex !== -1) {
        const targetCell = document.querySelector(`[data-cell-index="${targetIndex}"]`);
        executeMove(targetCell, targetIndex);
    }
}

// Helper: Scans paths to find an immediate tactical winning or blocking index
function findWinningMoveFor(playerMarker) {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        const matchValues = [boardState[a], boardState[b], boardState[c]];
        
        // Look for lines containing exactly two spots filled by the target player and one empty spot
        const markerCount = matchValues.filter(val => val === playerMarker).length;
        const emptyCount = matchValues.filter(val => val === "").length;

        if (markerCount === 2 && emptyCount === 1) {
            if (boardState[a] === "") return a;
            if (boardState[b] === "") return b;
            if (boardState[c] === "") return c;
        }
    }
    return -1;
}

/* ==========================================
   GAME MANAGEMENT & CONTROLS
   ========================================== */
function resetMatch() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusMessage.textContent = "Player X's Turn";
    
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell"; // Removes custom style classes like x-marker, o-marker, and winner-cell
    });
}

function switchMode(activateAi) {
    isComputerMode = activateAi;
    if (isComputerMode) {
        aiModeBtn.classList.add('active');
        pvpModeBtn.classList.remove('active');
    } else {
        pvpModeBtn.classList.add('active');
        aiModeBtn.classList.remove('active');
    }
    resetMatch();
}

// Bind Operational Event Listeners
gameBoard.addEventListener('click', handleCellClick);
resetBtn.addEventListener('click', resetMatch);
pvpModeBtn.addEventListener('click', () => switchMode(false));
aiModeBtn.addEventListener('click', () => switchMode(true));