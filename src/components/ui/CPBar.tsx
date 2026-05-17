import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

interface CPBarProps {
  xp: number;
  maxXP: number;
  level: number;
  showLabel?: boolean;
}

export function CPBar({ xp, maxXP, level, showLabel = true }: CPBarProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: xp / maxXP,
      damping: 15,
      useNativeDriver: false,
    }).start();
  }, [xp, maxXP]); // eslint-disable-line react-hooks/exhaustive-deps

  const widthStyle = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <View style={styles.header}>
          <Text style={styles.levelText}>Lv {level}</Text>
          <Text style={styles.cpText}>{xp} / {maxXP} CP</Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthStyle }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { gap: SPACING.xs },
  header:    { flexDirection: 'row', justifyContent: 'space-between' },
  levelText: { fontFamily: FONTS.heading, fontSize: 13, color: COLORS.semantic.gold },
  cpText:    { fontFamily: FONTS.body,    fontSize: 12, color: COLORS.text.muted },
  track:     { height: 10, backgroundColor: COLORS.bg.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill:      { height: 10, backgroundColor: COLORS.semantic.gold, borderRadius: RADIUS.full },
});
