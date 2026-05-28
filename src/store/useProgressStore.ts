/**
 * Progress store — tracks per-node lesson completion (stars, high score, unlock
 * state) and boss win counts for the Battle Arena. Hydrates from the server when
 * online and falls back to in-memory state when offline.
 */
import { create } from 'zustand';

export interface NodeProgress {
  nodeId: string;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0–3
  highScore: number;
  lastPlayedAt: string | null;
}

export interface ProgressStore {
  nodes: Record<string, NodeProgress>;
  beatenBosses: Record<string, number>; // bossId → win count
  unlockNode: (nodeId: string) => void;
  completeNode: (nodeId: string, stars: number, score: number) => void;
  isUnlocked: (nodeId: string) => boolean;
  isCompleted: (nodeId: string) => boolean;
  markBossBeaten: (bossId: string) => void;
  hydrateFromServer: (serverNodes: NodeProgress[]) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  nodes: {},
  beatenBosses: {},

  unlockNode: (nodeId) =>
    set((state) => {
      if (state.nodes[nodeId]) return state; // already tracked
      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            nodeId,
            unlocked: true,
            completed: false,
            stars: 0,
            highScore: 0,
            lastPlayedAt: null,
          },
        },
      };
    }),

  completeNode: (nodeId, stars, score) =>
    set((state) => {
      const existing = state.nodes[nodeId];
      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            nodeId,
            unlocked: true,
            completed: true,
            stars: Math.max(stars, existing?.stars ?? 0),
            highScore: Math.max(score, existing?.highScore ?? 0),
            lastPlayedAt: new Date().toISOString(),
          },
        },
      };
    }),

  isUnlocked: (nodeId) => get().nodes[nodeId]?.unlocked ?? false,
  isCompleted: (nodeId) => get().nodes[nodeId]?.completed ?? false,

  markBossBeaten: (bossId) =>
    set((state) => ({
      beatenBosses: {
        ...state.beatenBosses,
        [bossId]: (state.beatenBosses[bossId] ?? 0) + 1,
      },
    })),

  hydrateFromServer: (serverNodes) => {
    const map: Record<string, NodeProgress> = {};
    for (const n of serverNodes) {
      map[n.nodeId] = n;
    }
    set({ nodes: map });
  },
}));
