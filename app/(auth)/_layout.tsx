/**
 * Auth stack layout — headerless stack for the onboarding/profile-setup flow,
 * with the app's primary background applied to every screen.
 */
import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg.primary },
      }}
    />
  );
}
