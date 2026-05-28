/**
 * Player store — holds the authenticated player profile and auth token.
 * Exposes XP/level progression and a daily-streak check. Cleared on sign-out,
 * which also wipes the cached token so the root index redirects to onboarding.
 */
import { create } from 'zustand';
import type { AgeGroup } from '../constants/curriculum';
import type { SupportedLanguage } from '../constants/languages';

export interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
  ageGroup: AgeGroup;
  nativeLanguage: SupportedLanguage;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  totalStars: number;
  lastLoginDate: string | null;
}

export interface PlayerStore {
  player: Player | null;
  token: string | null;
  setPlayer: (player: Player) => void;
  setToken: (token: string) => void;
  addXP: (amount: number) => void;
  clearPlayer: () => void;
  checkAndUpdateStreak: () => void;
}

const XP_PER_LEVEL = 500;

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: null,
  token: null,

  setPlayer: (player) => set({ player }),

  setToken: (token) => set({ token }),

  addXP: (amount) =>
    set((state) => {
      if (!state.player) return state;
      const newXP = state.player.xp + amount;
      const levelsGained = Math.floor(newXP / XP_PER_LEVEL);
      return {
        player: {
          ...state.player,
          xp: newXP % XP_PER_LEVEL,
          level: state.player.level + levelsGained,
          xpToNextLevel: XP_PER_LEVEL,
        },
      };
    }),

  checkAndUpdateStreak: () =>
    set((state) => {
      if (!state.player) return state;
      const today = new Date().toISOString().slice(0, 10);
      const last  = state.player.lastLoginDate;
      if (last === today) return state; // already counted today
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = last === yesterday ? state.player.streakDays + 1 : 1;
      return { player: { ...state.player, streakDays: newStreak, lastLoginDate: today } };
    }),

  clearPlayer: () => {
    // Also wipe the cached token so the root index redirects to onboarding
    import('../services/offline/cache').then((m) => m.default.clearToken());
    set({ player: null, token: null });
  },
}));
