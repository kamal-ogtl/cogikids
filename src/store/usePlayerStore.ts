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
}

interface PlayerStore {
  player: Player | null;
  token: string | null;
  setPlayer: (player: Player) => void;
  setToken: (token: string) => void;
  addXP: (amount: number) => void;
  clearPlayer: () => void;
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

  clearPlayer: () => set({ player: null, token: null }),
}));
