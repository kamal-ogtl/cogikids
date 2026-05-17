import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface ProgressBarProps {
  value: number;       // 0–1
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  value,
  color = COLORS.brand.primary,
  height = 8,
  backgroundColor = COLORS.bg.border,
}: ProgressBarProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: Math.min(Math.max(value, 0), 1),
      damping: 15,
      useNativeDriver: false,
    }).start();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const widthStyle = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      <Animated.View style={[styles.fill, { height, backgroundColor: color, width: widthStyle }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
