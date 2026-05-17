// Lottie wrapper with Expo Go fallback.
// In a real dev/production build, renders the actual Lottie animation.
// In Expo Go where lottie-react-native is unavailable, shows a plain emoji.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LottieViewProps {
  source: unknown;
  style?: object;
  autoPlay?: boolean;
  loop?: boolean;
  fallbackEmoji?: string;
  speed?: number;
}

let NativeLottie: React.ComponentType<{
  source: unknown;
  style?: object;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
}> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NativeLottie = require('lottie-react-native').default;
} catch {
  // Running in Expo Go — NativeLottie stays null
}

export function LottieView({ source, style, autoPlay = true, loop = true, fallbackEmoji = '✨', speed = 1 }: LottieViewProps) {
  if (NativeLottie) {
    return <NativeLottie source={source} style={style} autoPlay={autoPlay} loop={loop} speed={speed} />;
  }

  // Expo Go fallback
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.emoji}>{fallbackEmoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  emoji:    { fontSize: 48 },
});
