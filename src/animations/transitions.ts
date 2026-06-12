/**
 * Animation presets — reusable Reanimated timing/spring/sequence helpers so
 * screens share consistent motion curves and durations.
 */
import { withTiming, withSpring, withSequence, Easing } from 'react-native-reanimated';

// Reusable Reanimated animation presets

export const SPRING_CONFIG = { damping: 15, stiffness: 120 };

export function fadeIn(duration = 300) {
  return withTiming(1, { duration, easing: Easing.out(Easing.quad) });
}

export function slideUp(duration = 350) {
  return withTiming(0, { duration, easing: Easing.out(Easing.quad) });
}

export function wrongShake() {
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10,  { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(0,   { duration: 50 }),
  );
}

export function correctBounce() {
  return withSequence(
    withSpring(-6, SPRING_CONFIG),
    withSpring(0,  SPRING_CONFIG),
  );
}

export function xpBarFill(targetValue: number) {
  return withSpring(targetValue, SPRING_CONFIG);
}
