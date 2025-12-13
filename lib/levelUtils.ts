
export const LEVEL_THRESHOLDS = [
    0,      // Level 1: 0+
    3600,   // Level 2: 1 hour+
    18000,  // Level 3: 5 hours+
    72000,  // Level 4: 20 hours+
    180000  // Level 5: 50 hours+
];

export const MAX_LEVEL = 5;

export function calculateLevel(totalSeconds: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalSeconds >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

export function getLevelProgress(totalSeconds: number): { current: number, next: number, percentage: number, remaining: number } {
    const level = calculateLevel(totalSeconds);
    if (level >= MAX_LEVEL) {
        return { current: totalSeconds, next: totalSeconds, percentage: 100, remaining: 0 };
    }
    
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = LEVEL_THRESHOLDS[level];
    const progress = totalSeconds - currentThreshold;
    const totalNeeded = nextThreshold - currentThreshold;
    
    return {
        current: progress,
        next: totalNeeded,
        percentage: Math.min(100, Math.max(0, (progress / totalNeeded) * 100)),
        remaining: nextThreshold - totalSeconds
    };
}
