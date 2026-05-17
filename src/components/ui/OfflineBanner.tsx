import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useOffline } from '../../hooks/useOffline';

export function OfflineBanner() {
  const { isOnline } = useOffline();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + SPACING.xs }]}>
      <Text style={styles.text}>Offline Mode — progress will sync when reconnected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#3d2000',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  text: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.semantic.warning,
  },
});
