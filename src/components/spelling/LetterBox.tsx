import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';

export type LetterBoxState = 'empty' | 'filled' | 'correct' | 'wrong' | 'revealed';

interface LetterBoxProps {
  letter: string;
  state: LetterBoxState;
  boxWidth?: number;
}

const BG: Record<LetterBoxState, string> = {
  empty:    '#f5fcff',
  filled:   '#e8f8ff',
  correct:  '#edfff2',
  wrong:    '#ffeded',
  revealed: '#fff8e9',
};

const BORDER: Record<LetterBoxState, string> = {
  empty:    '#c9edff',
  filled:   '#59c8ff',
  correct:  '#34c759',
  wrong:    '#dd3636',
  revealed: '#ff894f',
};

const LETTER_COLOR: Record<LetterBoxState, string> = {
  empty:    'transparent',
  filled:   '#171a1c',
  correct:  '#34c759',
  wrong:    '#dd3636',
  revealed: '#ff894f',
};

export function LetterBox({ letter, state, boxWidth = 48 }: LetterBoxProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const prevLetter = useRef('');

  // Pop animation on letter fill
  useEffect(() => {
    if (letter && letter !== prevLetter.current) {
      prevLetter.current = letter;
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, tension: 400, friction: 6 }),
        Animated.spring(scale, { toValue: 1,   useNativeDriver: true, tension: 250, friction: 8 }),
      ]).start();
    }
    if (!letter) {
      prevLetter.current = '';
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();
    }
  }, [letter]);

  // Shake on wrong state
  useEffect(() => {
    if (state === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:   0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);

  // Celebrate bounce on correct state
  useEffect(() => {
    if (state === 'correct') {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, tension: 300, friction: 6 }),
        Animated.spring(scale, { toValue: 1,   useNativeDriver: true, tension: 200, friction: 8 }),
      ]).start();
    }
  }, [state]);

  const height = Math.round(boxWidth * 1.15);

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: boxWidth,
          height,
          backgroundColor: BG[state],
          borderColor: BORDER[state],
          transform: [{ scale }, { translateX: shakeX }],
        },
      ]}
    >
      <Text style={[styles.letter, { color: LETTER_COLOR[state], fontSize: boxWidth * 0.46 }]}>
        {letter.toUpperCase()}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: FONTS.display,
  },
});
