import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

// Phase 8: Avatar selection and profile customisation
export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.lg }]}>
      <Text style={styles.title}>Choose Your Avatar</Text>
      <Text style={styles.subtitle}>Coming in Phase 8</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: COLORS.bg.primary, alignItems: 'center', justifyContent: 'center' },
  title:    { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text.primary },
  subtitle: { fontFamily: FONTS.body,    fontSize: 15, color: COLORS.text.muted, marginTop: 8 },
});
