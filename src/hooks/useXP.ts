/**
 * useXP — convenience hook over the player store for awarding XP. awardXP grants
 * a base amount per correct answer plus a streak bonus, and exposes the current
 * XP, level and threshold for the next level.
 */
import { usePlayerStore } from '../store/usePlayerStore';

const XP_PER_CORRECT = 10;
const XP_STREAK_BONUS = 5; // extra XP per correct in a streak

export function useXP() {
  const { player, addXP } = usePlayerStore();

  function awardXP(correct: boolean, streakCount: number = 0): number {
    if (!correct) return 0;
    const earned = XP_PER_CORRECT + streakCount * XP_STREAK_BONUS;
    addXP(earned);
    return earned;
  }

  return {
    currentXP: player?.xp ?? 0,
    level: player?.level ?? 1,
    xpToNextLevel: player?.xpToNextLevel ?? 500,
    awardXP,
  };
}
