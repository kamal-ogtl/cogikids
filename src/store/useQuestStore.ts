import { create } from 'zustand';

export interface QuestStore {
  date: string;          // YYYY-MM-DD of current quest day
  roundsToday: number;   // spelling bee rounds completed today
  dailyGoal: number;
  incrementRound: () => void;
  resetIfNewDay: () => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  date: today(),
  roundsToday: 0,
  dailyGoal: 5,

  incrementRound: () => {
    get().resetIfNewDay();
    set((s) => ({ roundsToday: s.roundsToday + 1 }));
  },

  resetIfNewDay: () => {
    const t = today();
    if (get().date !== t) {
      set({ date: t, roundsToday: 0 });
    }
  },
}));
