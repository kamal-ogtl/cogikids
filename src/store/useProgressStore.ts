import { create } from 'zustand';

export interface NodeProgress {
  nodeId: string;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0–3
  highScore: number;
  lastPlayedAt: string | null;
}

interface ProgressStore {
  nodes: Record<string, NodeProgress>;
  unlockNode: (nodeId: string) => void;
  completeNode: (nodeId: string, stars: number, score: number) => void;
  isUnlocked: (nodeId: string) => boolean;
  isCompleted: (nodeId: string) => boolean;
  hydrateFromServer: (serverNodes: NodeProgress[]) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  nodes: {},

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

  hydrateFromServer: (serverNodes) => {
    const map: Record<string, NodeProgress> = {};
    for (const n of serverNodes) {
      map[n.nodeId] = n;
    }
    set({ nodes: map });
  },
}));
