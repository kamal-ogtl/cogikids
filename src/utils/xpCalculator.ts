const BASE_XP = 10;
const STREAK_BONUS = 5;
const PERFECT_ROUND_BONUS = 30;

export function calculateXP(params: {
  correct: boolean;
  streakCount: number;
  isPerfectRound?: boolean;
}): number {
  if (!params.correct) return 0;
  let xp = BASE_XP + params.streakCount * STREAK_BONUS;
  if (params.isPerfectRound) xp += PERFECT_ROUND_BONUS;
  return xp;
}

export function starsFromScore(correct: number, total: number): 0 | 1 | 2 | 3 {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}
