import { GameLogic, Board, Cell } from '../logic/GameLogic.js';
import { getLevelConfig } from '../logic/GameConfig.js';

// Global Game State
let currentBoard: Board = [];
let level = 1;
let timeLeft = 0;
let timerInterval: number | null = null;
let isGameOver = false;

// DOM Elements
const boardElement = document.getElementById('board')!;
const addRowBtn = document.getElementById('addRowBtn')!;
const rescueBtn = document.getElementById('rescueBtn')!;
const levelDisplay = document.getElementById('levelDisplay')!;
const timeDisplay = document.getElementById('timeDisplay')!;
const messageDisplay = document.getElementById('messageDisplay')!;

function init() {
    // Reset State
    isGameOver = false;
    const config = getLevelConfig(level);
    currentBoard = GameLogic.generateInitialBoard(level);
    timeLeft = config.targetTimeSeconds;

    // UI Init
    messageDisplay.textContent = "";
    messageDisplay.className = "message"; // hidden

    startTimer();
    render();
    updateInfo();

    // Bind Events (Check if already bound to avoid duplicates in a real app, 
    // but for simple demo, pure replacement is fine or we rely on browser reload)
    // Actually, adding listeners repeatedly on re-init calls is bad if init is called multiple times.
    // Ideally we'd remove them or just bind once. 
    // For this demo, let's assume init runs once per page load.
}

// Event Listeners (Bound once at module load)
addRowBtn.addEventListener('click', () => {
    if (isGameOver) return;
    currentBoard = GameLogic.addRow(currentBoard, level);
    render();
});

rescueBtn.addEventListener('click', () => {
    if (isGameOver) return;
    const suggestion = GameLogic.getRescueSuggestion(currentBoard);
    if (suggestion) {
        showMessage(`💡 Try matching ${currentBoard[suggestion.index1].value} and ${currentBoard[suggestion.index2].value}`, 'info');

        // Highlight logic
        const el1 = document.getElementById(`cell_${suggestion.index1}`);
        const el2 = document.getElementById(`cell_${suggestion.index2}`);
        if (el1) el1.classList.add('highlight');
        if (el2) el2.classList.add('highlight');

        setTimeout(() => {
            if (el1) el1.classList.remove('highlight');
            if (el2) el2.classList.remove('highlight');
        }, 1500);

    } else {
        showMessage("No matches found! Try adding a row.", 'warning');
    }
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = window.setInterval(() => {
        if (!isGameOver) {
            timeLeft--;
            updateInfo();

            if (timeLeft <= 0) {
                endGame(false);
            }
        }
    }, 1000);
}

function endGame(win: boolean) {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);

    if (win) {
        showMessage("🎉 Level Complete!", 'success');
    } else {
        showMessage("⌛ Time's Up! Game Over.", 'error');
    }
}

function render() {
    boardElement.innerHTML = '';

    currentBoard.forEach((cell, index) => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.id = `cell_${index}`;
        div.textContent = cell.value.toString();

        if (cell.isCleared) {
            div.classList.add('cleared');
        } else {
            div.onclick = () => handleCellClick(index);
            // Add hover/interaction classes could go here
        }

        boardElement.appendChild(div);
    });
}

// Game Play Logic
let selectedIndex: number | null = null;

function handleCellClick(index: number) {
    if (isGameOver) return;

    const cellEl = document.getElementById(`cell_${index}`)!;

    if (selectedIndex === null) {
        // Select
        selectedIndex = index;
        cellEl.classList.add('selected');
    } else {
        if (selectedIndex === index) {
            // Deselect self
            cellEl.classList.remove('selected');
            selectedIndex = null;
            return;
        }

        const cellA = currentBoard[selectedIndex];
        const cellB = currentBoard[index];
        const prevEl = document.getElementById(`cell_${selectedIndex}`)!;

        if (GameLogic.isMatch(cellA.value, cellB.value)) {
            // Valid Match
            cellA.isCleared = true;
            cellB.isCleared = true;

            // Visual feedback before re-rendering?
            // For now, instant update
            selectedIndex = null;
            render();
            checkWin();
        } else {
            // Invalid Match - Error feedback
            cellEl.classList.add('shake');
            prevEl.classList.add('shake');
            setTimeout(() => {
                cellEl.classList.remove('shake');
                prevEl.classList.remove('shake', 'selected');
            }, 500);

            selectedIndex = null;
        }
    }
}

function checkWin() {
    const active = currentBoard.filter(c => !c.isCleared);
    if (active.length === 0) {
        endGame(true);
    }
}

function updateInfo() {
    levelDisplay.textContent = `Level ${level}`;
    timeDisplay.textContent = formatTime(timeLeft);

    if (timeLeft <= 10) {
        timeDisplay.classList.add('urgent');
    } else {
        timeDisplay.classList.remove('urgent');
    }
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function showMessage(text: string, type: 'info' | 'success' | 'error' | 'warning') {
    messageDisplay.textContent = text;
    messageDisplay.className = `message show ${type}`;

    // Auto hide after 3s if info
    if (type !== 'success' && type !== 'error') {
        setTimeout(() => {
            messageDisplay.className = 'message'; // hide
        }, 3000);
    }
}

// Start
init();
