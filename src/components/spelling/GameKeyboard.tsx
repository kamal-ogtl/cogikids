import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

// 6-wide alphabetical layout — 5 rows total, fits on screen
const ROWS: string[][] = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['Y', 'Z', '⌫'],
];

// Bright kid-friendly palette — all work with white text
const PALETTE = ['#EF4444', '#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'];

// Assign each letter a fixed color from the palette
const KEY_COLORS: Record<string, string> = {};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((l, i) => {
  KEY_COLORS[l] = PALETTE[i % PALETTE.length];
});

interface GameKeyboardProps {
  onKey: (letter: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

export function GameKeyboard({ onKey, onBackspace, disabled }: GameKeyboardProps) {
  return (
    <View style={styles.keyboard}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) =>
            key === '⌫' ? (
              <BackspaceKey key="bsp" onPress={onBackspace} disabled={disabled} />
            ) : (
              <LetterKey key={key} letter={key} color={KEY_COLORS[key]} onPress={() => onKey(key)} disabled={disabled} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

// ─── Letter key ───────────────────────────────────────────────────────────────

function LetterKey({
  letter, color, onPress, disabled,
}: {
  letter: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale     = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  function pressIn() {
    Animated.parallel([
      Animated.spring(scale,      { toValue: 0.88, useNativeDriver: true, tension: 500, friction: 8 }),
      Animated.spring(translateY, { toValue: 3,    useNativeDriver: true, tension: 500, friction: 8 }),
    ]).start();
  }
  function pressOut() {
    Animated.parallel([
      Animated.spring(scale,      { toValue: 1, useNativeDriver: true, tension: 300, friction: 7 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 300, friction: 7 }),
    ]).start();
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      activeOpacity={1}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Letter ${letter}`}
    >
      <Animated.View
        style={[
          styles.key,
          { backgroundColor: disabled ? COLORS.bg.card : color, transform: [{ scale }, { translateY }] },
          disabled && styles.keyDisabled,
        ]}
      >
        <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>{letter}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Backspace key ────────────────────────────────────────────────────────────

function BackspaceKey({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const scale      = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  function pressIn() {
    Animated.parallel([
      Animated.spring(scale,      { toValue: 0.88, useNativeDriver: true, tension: 500, friction: 8 }),
      Animated.spring(translateY, { toValue: 3,    useNativeDriver: true, tension: 500, friction: 8 }),
    ]).start();
  }
  function pressOut() {
    Animated.parallel([
      Animated.spring(scale,      { toValue: 1, useNativeDriver: true, tension: 300, friction: 7 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 300, friction: 7 }),
    ]).start();
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      activeOpacity={1}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Backspace"
    >
      <Animated.View
        style={[
          styles.key,
          styles.keyBackspace,
          disabled && styles.keyDisabled,
          { transform: [{ scale }, { translateY }] },
        ]}
      >
        <Ionicons name="backspace" size={22} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  keyboard: { gap: 6, alignSelf: 'center' },
  row:      { flexDirection: 'row', gap: 6, justifyContent: 'center' },

  key: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // 3-D bottom edge
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.22)',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  keyBackspace: {
    width: 98,
    backgroundColor: '#64748B',
  },
  keyDisabled: { opacity: 0.30 },

  keyText: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: '#fff',
    lineHeight: 22,
  },
  keyTextDisabled: {
    color: COLORS.text.disabled,
  },
});
