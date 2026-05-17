import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'alt';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export function Card({ variant = 'default', padding = 'md', shadow = false, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'alt' && styles.alt,
        padding === 'none' && styles.padNone,
        padding === 'sm' && styles.padSm,
        padding === 'md' && styles.padMd,
        padding === 'lg' && styles.padLg,
        shadow && SHADOWS.md,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
  },
  alt: {
    backgroundColor: COLORS.bg.cardAlt,
  },
  padNone: { padding: 0 },
  padSm:   { padding: SPACING.sm },
  padMd:   { padding: SPACING.lg },
  padLg:   { padding: SPACING.xl },
});
