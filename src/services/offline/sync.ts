import apiClient from '../api/client';
import cache from './cache';

interface SessionEvent {
  playerId: string;
  nodeId: string;
  xpEarned: number;
  correct: number;
  total: number;
  timestamp: string;
}

// Flush all queued offline progress to Flask.
// Called when the app comes back online.
export async function flushSyncQueue(token: string): Promise<void> {
  const queue = cache.getSyncQueue<SessionEvent>();
  if (queue.length === 0) return;

  try {
    // TODO: endpoint /kids/progress/sync
    await apiClient.post('/kids/progress/sync', { events: queue }, token);
    cache.clearSyncQueue();
  } catch {
    // Leave queue intact — will retry on next reconnect
  }
}

export function queueSessionEvent(event: SessionEvent): void {
  cache.enqueueSyncItem(event);
}
