import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../src/constants/theme';

// Phase 8: Parent dashboard — weekly report from Flask, AI insight via Gemini
export default function ParentDashboardScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Parent Dashboard</Text>
      <Text style={styles.subtitle}>Coming in Phase 8</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: COLORS.bg.primary, alignItems: 'center', justifyContent: 'center' },
  title:    { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text.primary },
  subtitle: { fontFamily: FONTS.body,    fontSize: 15, color: COLORS.text.muted, marginTop: 8 },
});
