/**
 * Button — primary pressable with five variants (primary, secondary, danger,
 * ghost, gradient), optional loading spinner and leading/trailing icon slots.
 */
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? COLORS.brand.primary : COLORS.white} />
      ) : (
        <View style={styles.content}>
          {typeof children === 'string' ? (
            <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary:   { backgroundColor: COLORS.brand.primary },
  secondary: { backgroundColor: COLORS.bg.cardAlt, borderWidth: 1, borderColor: COLORS.bg.border },
  danger:    { backgroundColor: COLORS.semantic.wrong },
  ghost:     { backgroundColor: COLORS.transparent },
  gradient:  { backgroundColor: COLORS.brand.primary }, // LinearGradient wrapper handled by caller if needed

  // Sizes
  sm: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  md: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  lg: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },

  // Labels
  label: { fontFamily: FONTS.bodyMedium },
  primaryLabel:   { color: COLORS.white },
  secondaryLabel: { color: COLORS.text.primary },
  dangerLabel:    { color: COLORS.white },
  ghostLabel:     { color: COLORS.brand.primary },
  gradientLabel:  { color: COLORS.white },

  smLabel: { fontSize: 13 },
  mdLabel: { fontSize: 15 },
  lgLabel: { fontSize: 17 },
});
