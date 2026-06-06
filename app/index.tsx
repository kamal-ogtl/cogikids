/**
 * Root index — entry redirect. Sends signed-in users (player in memory or a
 * cached token) straight to the tabs, and everyone else to onboarding.
 */
import { Redirect } from 'expo-router';
import { usePlayerStore } from '../src/store/usePlayerStore';
import cache from '../src/services/offline/cache';

export default function RootIndex() {
  const player = usePlayerStore((s) => s.player);
  const cachedToken = cache.getToken();

  // If player is loaded in memory or we have a cached token, go to tabs.
  // Otherwise send to onboarding.
  if (player || cachedToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}
