import { Stack } from 'expo-router';

export default function StoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="map" />
      <Stack.Screen name="[levelId]" />
    </Stack>
  );
}
