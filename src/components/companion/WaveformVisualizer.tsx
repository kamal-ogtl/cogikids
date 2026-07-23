import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

// Natural waveform heights — tallest in the middle
const BAR_HEIGHTS = [18, 28, 40, 52, 40, 28, 18];
const BAR_COUNT = BAR_HEIGHTS.length;

interface WaveformVisualizerProps {
  active: boolean;
  color?: string;
}

export function WaveformVisualizer({ active, color = COLORS.brand.primary }: WaveformVisualizerProps) {
  const scales = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.25))
  ).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      loop.current = Animated.loop(
        Animated.stagger(
          70,
          scales.map((s, i) =>
            Animated.sequence([
              Animated.timing(s, { toValue: 1,    duration: 280 + i * 25, useNativeDriver: true }),
              Animated.timing(s, { toValue: 0.25, duration: 280 + i * 25, useNativeDriver: true }),
            ])
          )
        )
      );
      loop.current.start();
    } else {
      loop.current?.stop();
      loop.current = null;
      // Settle all bars to resting height
      Animated.parallel(
        scales.map(s => Animated.timing(s, { toValue: 0.25, duration: 180, useNativeDriver: true }))
      ).start();
    }

    return () => {
      loop.current?.stop();
    };
  }, [active]);

  return (
    <View style={styles.wrap}>
      {scales.map((s, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: BAR_HEIGHTS[i],
              backgroundColor: color,
              opacity: active ? 1 : 0.3,
              transform: [{ scaleY: s }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 56,
  },
  bar: {
    width: 7,
    borderRadius: 4,
  },
});
