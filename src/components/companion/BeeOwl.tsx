/**
 * BeeOwl — animated SVG owl companion for the Spelling Bee screen.
 * Moods: idle | speaking | happy | hint
 *
 * Wings use translateY (lift upward) to avoid SVG transform-origin issues.
 * Eyes use AnimatedEllipse ry via direct prop for squinting.
 * Beak lower jaw uses AnimatedG translateY for the open/close effect.
 */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';

export type OwlMood = 'idle' | 'speaking' | 'happy' | 'hint';

interface BeeOwlProps {
  mood?: OwlMood;
  size?: number;
}

const GOLD = '#EF9F27';

const AnimatedG        = Animated.createAnimatedComponent(G);
const AnimatedEllipse  = Animated.createAnimatedComponent(Ellipse);

export function BeeOwl({ mood = 'idle', size = 120 }: BeeOwlProps) {
  const bounceY   = useRef(new Animated.Value(0)).current;
  const wingsUp   = useRef(new Animated.Value(0)).current;  // 0=rest 1=raised
  const eyeRyL    = useRef(new Animated.Value(4.5)).current;
  const eyeRyR    = useRef(new Animated.Value(4.5)).current;
  const beakDrop  = useRef(new Animated.Value(0)).current;  // 0=closed 1=open

  useEffect(() => {
    bounceY.stopAnimation();
    wingsUp.stopAnimation();
    eyeRyL.stopAnimation();
    eyeRyR.stopAnimation();
    beakDrop.stopAnimation();

    wingsUp.setValue(0);
    eyeRyL.setValue(4.5);
    eyeRyR.setValue(4.5);
    beakDrop.setValue(0);

    const speed  = mood === 'speaking' ? 360 : mood === 'happy' ? 260 : 700;
    const height = mood === 'happy' ? -13 : -5;

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: height, duration: speed, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,      duration: speed, useNativeDriver: true }),
      ])
    ).start();

    if (mood === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(beakDrop, { toValue: 1, duration: 170, useNativeDriver: true }),
          Animated.timing(beakDrop, { toValue: 0, duration: 170, useNativeDriver: true }),
        ])
      ).start();
    }

    if (mood === 'happy') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wingsUp, { toValue: 1, duration: 210, useNativeDriver: true }),
          Animated.timing(wingsUp, { toValue: 0, duration: 210, useNativeDriver: true }),
        ])
      ).start();

      // Eyes squint
      [eyeRyL, eyeRyR].forEach((v, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(v, { toValue: 1.4, duration: 250 + i * 40, useNativeDriver: false }),
            Animated.timing(v, { toValue: 4.5, duration: 250 + i * 40, useNativeDriver: false }),
          ])
        ).start()
      );
    }

    if (mood === 'hint') {
      // Left eyebrow raise (one eye slightly squints)
      Animated.loop(
        Animated.sequence([
          Animated.timing(eyeRyL, { toValue: 2.8, duration: 600, useNativeDriver: false }),
          Animated.timing(eyeRyL, { toValue: 4.5, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    }

    return () => {
      bounceY.stopAnimation();
      wingsUp.stopAnimation();
      eyeRyL.stopAnimation();
      eyeRyR.stopAnimation();
      beakDrop.stopAnimation();
    };
  }, [mood]);

  // Wings rise by translating upward 0 → -14 SVG units
  const wingTranslate = wingsUp.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  // Lower jaw drops 0 → 6 SVG units
  const beakTranslate = beakDrop.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  return (
    <Animated.View style={{ transform: [{ translateY: bounceY }], width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 115">

        {/* ── Graduation cap ───────────────────────────────────────────── */}
        <Path d="M50 6 L26 13 L50 20 L74 13 Z" fill="#1a1b1e" />
        <Rect x="26" y="13" width="48" height="7" rx="2" fill="#1a1b1e" />
        {/* Tassel */}
        <Path d="M74 13 L82 13 L82 22" stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" />
        <Circle cx="82" cy="24" r="3" fill={GOLD} />

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <Ellipse cx="50" cy="80" rx="26" ry="30" fill="#7c5c2e" />
        {/* Belly */}
        <Ellipse cx="50" cy="86" rx="17" ry="20" fill="#c9a96e" opacity={0.55} />
        {/* Subtle horizontal stripes on belly */}
        <Rect x="34" y="78" width="32" height="3" rx="1.5" fill="#5a3e1b" opacity={0.22} />
        <Rect x="34" y="87" width="32" height="3" rx="1.5" fill="#5a3e1b" opacity={0.22} />

        {/* ── Left wing (rises on happy) ────────────────────────────────── */}
        <AnimatedG
          {...({ style: { transform: [{ translateY: wingTranslate }] } } as any)}
        >
          <Path d="M24 68 Q7 76 11 90 Q20 84 28 74 Z" fill="#5a3e1b" />
        </AnimatedG>

        {/* ── Right wing ───────────────────────────────────────────────── */}
        <AnimatedG
          {...({ style: { transform: [{ translateY: wingTranslate }] } } as any)}
        >
          <Path d="M76 68 Q93 76 89 90 Q80 84 72 74 Z" fill="#5a3e1b" />
        </AnimatedG>

        {/* ── Head ─────────────────────────────────────────────────────── */}
        <Circle cx="50" cy="48" r="26" fill="#7c5c2e" />
        {/* Ear tufts */}
        <Path d="M33 26 Q29 17 37 21 Q35 27 33 26 Z" fill="#5a3e1b" />
        <Path d="M67 26 Q71 17 63 21 Q65 27 67 26 Z" fill="#5a3e1b" />
        {/* Face disc */}
        <Ellipse cx="50" cy="50" rx="19" ry="17" fill="#c9a96e" opacity={0.45} />

        {/* ── Left eye ─────────────────────────────────────────────────── */}
        <Circle cx="41" cy="46" r="7.5" fill="white" />
        <AnimatedEllipse cx={41} cy={46} rx={5} {...{ ry: eyeRyL, fill: '#1a0800' } as any} />
        <Circle cx="43" cy="44" r="1.4" fill="white" />

        {/* ── Right eye ────────────────────────────────────────────────── */}
        <Circle cx="59" cy="46" r="7.5" fill="white" />
        <AnimatedEllipse cx={59} cy={46} rx={5} {...{ ry: eyeRyR, fill: '#1a0800' } as any} />
        <Circle cx="61" cy="44" r="1.4" fill="white" />

        {/* ── Beak ─────────────────────────────────────────────────────── */}
        {/* Upper jaw — static */}
        <Path d="M46 55 Q50 53 54 55 Q52 58 50 58 Q48 58 46 55 Z" fill="#e07b30" />
        {/* Lower jaw — drops when speaking */}
        <AnimatedG {...({ style: { transform: [{ translateY: beakTranslate }] } } as any)}>
          <Path d="M46 57 Q50 59 54 57 Q52 63 50 64 Q48 63 46 57 Z" fill="#c05c18" />
        </AnimatedG>

        {/* ── Feet ─────────────────────────────────────────────────────── */}
        <Path d="M38 108 Q34 112 36 115 L38 112 L40 115 L42 112 L44 115 Q46 112 44 108 Z" fill="#e07b30" />
        <Path d="M62 108 Q58 112 60 115 L62 112 L64 115 L66 112 L68 115 Q70 112 68 108 Z" fill="#e07b30" />

      </Svg>
    </Animated.View>
  );
}
