import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/theme';

const ROWS: string[][] = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O'],
  ['P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y'],
  ['Z', '⌫'],
];

// Design tokens matching bee.tsx
const C = {
  card:   '#ffffff',
  dark:   '#171a1c',
  grey:   '#5d686f',
  border: '#c9edff',
  keyBg:  '#f5fcff',
};

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
              <LetterKey key={key} letter={key} onPress={() => onKey(key)} disabled={disabled} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

function LetterKey({ letter, onPress, disabled }: { letter: string; onPress: () => void; disabled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={()  => Animated.spring(scale, { toValue: 0.84, useNativeDriver: true, tension: 400, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 250, friction: 8 }).start()}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[styles.key, disabled && styles.keyDisabled, { transform: [{ scale }] }]}>
        <Text style={styles.keyText}>{letter}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function BackspaceKey({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={()  => Animated.spring(scale, { toValue: 0.84, useNativeDriver: true, tension: 400, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 250, friction: 8 }).start()}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[styles.key, styles.keyBackspace, disabled && styles.keyDisabled, { transform: [{ scale }] }]}>
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M21 4H7l-6 8 6 8h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
            stroke={C.grey}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M18 9l-6 6M12 9l6 6"
            stroke={C.grey}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  keyboard: { gap: 8, alignSelf: 'center' },
  row:      { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  key: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#59c8ff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
  },
  keyBackspace: {
    width: 70,
    backgroundColor: C.keyBg,
  },
  keyDisabled: { opacity: 0.35 },
  keyText: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    color: C.dark,
  },
});
