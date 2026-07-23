import type { KidPlayer } from '../db/schema';

const XP_PER_LEVEL = 500;

export function playerToDict(p: KidPlayer) {
  return {
    id:             String(p.id),
    name:           p.name,
    avatarUrl:      p.avatarUrl ?? null,
    ageGroup:       p.ageGroup,
    nativeLanguage: p.nativeLanguage,
    level:          p.level,
    xp:             p.xp % XP_PER_LEVEL,
    xpToNextLevel:  XP_PER_LEVEL,
    streakDays:     p.streakDays,
    totalStars:     p.totalStars,
  };
}
