/**
 * XP and star-rating helpers shared across lessons and games.
 * XP rewards correct answers, scaling with the current streak, with a bonus
 * for perfect rounds. Stars map a score percentage to a 0–3 rating.
 */
const BASE_XP = 10;
const STREAK_BONUS = 5;
const PERFECT_ROUND_BONUS = 30;

/** Returns XP earned for a single answer. Wrong answers earn nothing. */
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

/** Maps a correct/total ratio to a 0–3 star rating: 90% → 3, 70% → 2, 50% → 1. */
export function starsFromScore(correct: number, total: number): 0 | 1 | 2 | 3 {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}
