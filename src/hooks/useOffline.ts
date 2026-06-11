/**
 * useOffline — subscribes to device connectivity via NetInfo and exposes a simple
 * isOnline flag. Drives the OfflineBanner and any connectivity-gated behaviour.
 */
import { useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { flushSyncQueue } from '../services/offline/sync';
import { usePlayerStore } from '../store/usePlayerStore';

interface OfflineState {
  isOnline: boolean;
  isChecking: boolean;
}

// Monitors network connectivity every 60 seconds.
// Automatically flushes the offline sync queue when reconnecting.
export function useOffline(): OfflineState {
  const [state, setState] = useState<OfflineState>({ isOnline: true, isChecking: true });
  const wasOffline = useRef(false);
  const token = usePlayerStore((s) => s.token);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      const online = netState.isConnected === true && netState.isInternetReachable !== false;
      setState({ isOnline: online, isChecking: false });

      if (online && wasOffline.current && token) {
        flushSyncQueue(token).catch(() => {});
      }
      wasOffline.current = !online;
    });

    // Check immediately on mount
    NetInfo.fetch().then((netState: NetInfoState) => {
      const online = netState.isConnected === true && netState.isInternetReachable !== false;
      setState({ isOnline: online, isChecking: false });
      wasOffline.current = !online;
    });

    // Re-check every 60 seconds
    const interval = setInterval(() => {
      NetInfo.fetch().then((netState: NetInfoState) => {
        const online = netState.isConnected === true && netState.isInternetReachable !== false;
        if (online && !state.isOnline && token) {
          flushSyncQueue(token).catch(() => {});
        }
        setState({ isOnline: online, isChecking: false });
        wasOffline.current = !online;
      });
    }, 60_000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
