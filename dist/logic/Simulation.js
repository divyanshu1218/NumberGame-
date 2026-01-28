import { GameLogic } from './GameLogic';
import { getLevelConfig } from './GameConfig';
function printBoard(board) {
    const values = board.map(c => c.value);
    console.log(`Board (${values.length} cells): ${values.join(', ')}`);
}
function runSimulation() {
    console.log("=== Number Match Logic Simulation ===\n");
    // 1. Verify Sawtooth Configuration
    console.log("--- Difficulty Curve (Levels 1-10) ---");
    console.log("Lvl | Time | XP  | Decoy% | Phase");
    for (let i = 1; i <= 10; i++) {
        const cfg = getLevelConfig(i);
        console.log(`${cfg.level.toString().padEnd(3)} | ${cfg.targetTimeSeconds.toString().padEnd(4)} | ${cfg.experienceGoal.toString().padEnd(3)} | ${cfg.decoyRatio.toFixed(2)}   | ${cfg.sawtoothPhase}`);
    }
    console.log("\n");
    // 2. Verify Data Seeding (Level 1)
    console.log("--- Level 1 Board Generation ---");
    const boardL1 = GameLogic.generateInitialBoard(1);
    printBoard(boardL1);
    // Basic validation
    const matches = boardL1.filter((c, i) => {
        // Simple check: does it have ANY match in the set?
        return boardL1.some((other, j) => i !== j && GameLogic.isMatch(c.value, other.value));
    });
    console.log(`Solvability Check: ${matches.length}/${boardL1.length} cells have at least one potential match partner in the set.`);
    console.log("\n");
    // 3. Verify Add Row Logic (Straggler Check)
    console.log("--- Add Row Mechanic Test ---");
    // Create a board with a known straggler (e.g., a single '5' and no other numbers)
    const stragglerBoard = [{ value: 5, id: 's1', isCleared: false }];
    console.log("Initial Board: [5]");
    const newBoard = GameLogic.addRow(stragglerBoard, 1);
    console.log("After Add Row (Level 1 - High Helpfulness):");
    printBoard(newBoard);
    const addedCells = newBoard.slice(1);
    const hasMatchFor5 = addedCells.some(c => GameLogic.isMatch(5, c.value));
    console.log(`Did we spawn a match for 5? ${hasMatchFor5 ? 'YES' : 'NO'}`);
    // 4. Verify Rescue Request
    console.log("\n--- Rescue Mechanic Test ---");
    // Board with match
    const goodBoard = [
        { value: 1, id: '1', isCleared: false },
        { value: 9, id: '2', isCleared: false }
    ];
    const rescue1 = GameLogic.getRescueSuggestion(goodBoard);
    console.log(`Board [1, 9] Rescue Suggestion: ${JSON.stringify(rescue1)} (Expected: valid index pair)`);
    // Board with NO match (simulated)
    const badBoard = [
        { value: 1, id: '1', isCleared: false },
        { value: 2, id: '2', isCleared: false } // 1 and 2 don't match
    ];
    const rescue2 = GameLogic.getRescueSuggestion(badBoard);
    console.log(`Board [1, 2] Rescue Suggestion: ${JSON.stringify(rescue2)} (Expected: null)`);
}
runSimulation();
