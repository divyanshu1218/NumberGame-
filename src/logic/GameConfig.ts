export interface LevelConfig {
    level: number;
    targetTimeSeconds: number; // For "Three Stars"
    experienceGoal: number; // XP to advance
    addRowBudget: number; // How many times player can add rows
    decoyRatio: number; // 0.0 to 1.0 (0 = all helpful, 1 = all random/decoy)
    sawtoothPhase: 'ramp' | 'peak' | 'relief';
}

export const MAX_LEVEL = 50;

// Base configuration with "Sawtooth" pattern
export function getLevelConfig(level: number): LevelConfig {
    // Clamp level
    const lvl = Math.max(1, Math.min(level, MAX_LEVEL));

    // Sawtooth pattern: 5-level cycle
    // 1, 2, 3, 4 (Ramp/Peak), 5 (Relief)
    const cyclePos = (lvl - 1) % 5;
    
    let phase: 'ramp' | 'peak' | 'relief' = 'ramp';
    let decoyRatio = 0.3; // Default balanced
    let timeModifier = 1.0;

    if (cyclePos === 3) {
        phase = 'peak';
        decoyRatio = 0.6; // Harder
        timeModifier = 1.2; // Require more time/focus
    } else if (cyclePos === 4) {
        phase = 'relief';
        decoyRatio = 0.1; // Mostly helpful matches
        timeModifier = 0.8; // Faster, fun feel
    } else {
        // Ramp (0, 1, 2)
        decoyRatio = 0.2 + (cyclePos * 0.1);
    }

    // Difficulty scaling over total levels
    const difficultyTier = Math.floor((lvl - 1) / 10) + 1; // 1 to 5
    const baseTime = 120 + (difficultyTier * 30);
    
    // Config Object
    return {
        level: lvl,
        targetTimeSeconds: Math.floor(baseTime * timeModifier),
        experienceGoal: 100 * difficultyTier,
        addRowBudget: 6, // Constant as per requirement
        decoyRatio: Math.min(0.9, decoyRatio + (difficultyTier * 0.05)), // Slowly gets harder overall
        sawtoothPhase: phase
    };
}
