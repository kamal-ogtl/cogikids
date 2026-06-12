/**
 * Session store — ephemeral, in-memory state for the currently active lesson or
 * game session (current node, score, progress). Not persisted; reset between runs.
 */
import { create } from 'zustand';

// Tracks the currently active lesson/game session in memory.
// Persisted to MMKV sync queue on session end.

export interface SessionAnswer {
  questionIndex: number;
  userAnswer: string;
  correct: boolean;
  xpEarned: number;
}

interface SessionStore {
  nodeId: string | null;
  answers: SessionAnswer[];
  xpEarned: number;
  startedAt: string | null;
  active: boolean;

  startSession: (nodeId: string) => void;
  recordAnswer: (answer: SessionAnswer) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  nodeId: null,
  answers: [],
  xpEarned: 0,
  startedAt: null,
  active: false,

  startSession: (nodeId) =>
    set({
      nodeId,
      answers: [],
      xpEarned: 0,
      startedAt: new Date().toISOString(),
      active: true,
    }),

  recordAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      xpEarned: state.xpEarned + answer.xpEarned,
    })),

  endSession: () => set({ active: false }),
}));
