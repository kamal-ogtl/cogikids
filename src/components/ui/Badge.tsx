/**
 * Badge — small pill label with an optional leading icon. Five colour variants
 * (gold, primary, correct, wrong, muted) map to the shared theme palette.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

type BadgeVariant = 'gold' | 'primary' | 'correct' | 'wrong' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const BG: Record<BadgeVariant, string> = {
  gold:    '#3d2e00',
  primary: '#0c3a50',
  correct: '#0d2e2b',
  wrong:   '#2e0d0d',
  muted:   COLORS.bg.cardAlt,
};

const FG: Record<BadgeVariant, string> = {
  gold:    COLORS.semantic.gold,
  primary: COLORS.brand.primary,
  correct: COLORS.semantic.correct,
  wrong:   COLORS.semantic.wrong,
  muted:   COLORS.text.muted,
};

export function Badge({ label, variant = 'primary', icon }: BadgeProps) {
  return (
    <View style={[styles.base, { backgroundColor: BG[variant] }]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, { color: FG[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  icon: { marginRight: SPACING.xs },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
});
