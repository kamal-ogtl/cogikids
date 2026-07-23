/**
 * Boss characters — animated SVG character illustrations for the four arena
 * bosses (Numborr, Lexi, Scorp, Rex) plus shared subject/skills mascots.
 */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

// ─── Numbor — Math Monster (teal) — squash & stretch bounce ──────────────────
export function NumborrChar({ size = 120 }: { size?: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleX     = useRef(new Animated.Value(1)).current;
  const scaleY     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        // Squash anticipation
        Animated.parallel([
          Animated.timing(scaleX, { toValue: 1.14, duration: 110, useNativeDriver: true }),
          Animated.timing(scaleY, { toValue: 0.86, duration: 110, useNativeDriver: true }),
        ]),
        // Jump + stretch
        Animated.parallel([
          Animated.timing(translateY, { toValue: -20, duration: 280, useNativeDriver: true }),
          Animated.timing(scaleX, { toValue: 0.9,  duration: 180, useNativeDriver: true }),
          Animated.timing(scaleY, { toValue: 1.12, duration: 180, useNativeDriver: true }),
        ]),
        // Peak normalise
        Animated.parallel([
          Animated.timing(scaleX, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(scaleY, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
        // Fall
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        // Land squash
        Animated.parallel([
          Animated.timing(scaleX, { toValue: 1.12, duration: 80, useNativeDriver: true }),
          Animated.timing(scaleY, { toValue: 0.88, duration: 80, useNativeDriver: true }),
        ]),
        // Recover
        Animated.parallel([
          Animated.timing(scaleX, { toValue: 1, duration: 110, useNativeDriver: true }),
          Animated.timing(scaleY, { toValue: 1, duration: 110, useNativeDriver: true }),
        ]),
        // Idle pause
        Animated.delay(1400),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }, { scaleX }, { scaleY }] }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.18)" />
        <Circle cx="50" cy="52" r="42" fill="#0d9488" />
        <Circle cx="50" cy="50" r="39" fill="#14b8a6" />
        <Path d="M 30 20 L 24 3 L 38 17 Z" fill="#0f766e" />
        <Path d="M 70 20 L 76 3 L 62 17 Z" fill="#0f766e" />
        <Circle cx="35" cy="45" r="10" fill="white" />
        <Circle cx="65" cy="45" r="10" fill="white" />
        <Circle cx="36" cy="46" r="5.5" fill="#111" />
        <Circle cx="66" cy="46" r="5.5" fill="#111" />
        <Circle cx="38" cy="43" r="2" fill="white" />
        <Circle cx="68" cy="43" r="2" fill="white" />
        <Path d="M 22 33 L 44 40" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 56 40 L 78 33" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 28 63 Q 50 82 72 63 L 68 60 Q 50 76 32 60 Z" fill="#073b38" />
        <Rect x="34" y="58" width="7" height="9" rx="2" fill="white" />
        <Rect x="44" y="59" width="7" height="9" rx="2" fill="white" />
        <Rect x="54" y="59" width="7" height="9" rx="2" fill="white" />
        <Rect x="63" y="58" width="7" height="9" rx="2" fill="white" />
        <Line x1="50" y1="15" x2="50" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
        <Line x1="45" y1="20" x2="55" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

// ─── Lexi — Word Witch (blue) ─────────────────────────────────────────────────
export function LexiChar({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.18)" />
      <Ellipse cx="50" cy="46" rx="36" ry="10" fill="#0369a1" />
      <Path d="M 50 2 L 22 46 L 78 46 Z" fill="#0284c7" />
      <Rect x="22" y="41" width="56" height="8" rx="2" fill="#0ea5e9" opacity={0.5} />
      <Path
        d="M50 14 L52.4 21.3 L60 21.3 L53.8 25.7 L56.2 33 L50 28.6 L43.8 33 L46.2 25.7 L40 21.3 L47.6 21.3 Z"
        fill="rgba(255,255,255,0.5)"
      />
      <Circle cx="50" cy="67" r="24" fill="#bfdbfe" />
      <Circle cx="41" cy="65" r="5" fill="#0ea5e9" />
      <Circle cx="59" cy="65" r="5" fill="#0ea5e9" />
      <Circle cx="41" cy="65" r="2.5" fill="#0c4a6e" />
      <Circle cx="59" cy="65" r="2.5" fill="#0c4a6e" />
      <Circle cx="42.5" cy="63.5" r="1.5" fill="rgba(255,255,255,0.8)" />
      <Circle cx="60.5" cy="63.5" r="1.5" fill="rgba(255,255,255,0.8)" />
      <Path d="M 39 76 Q 46 82 50 78 Q 54 74 58 72 Q 62 70 64 74" fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 50 68 L 46 75 L 54 75" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="15" y1="58" x2="21" y2="58" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="18" y1="55" x2="18" y2="61" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="82" y1="62" x2="88" y2="62" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="85" y1="59" x2="85" y2="65" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Scorp — Science Fiend (orange) ──────────────────────────────────────────
export function ScorpChar({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.18)" />
      <Circle cx="50" cy="58" r="34" fill="#c2410c" />
      <Circle cx="50" cy="56" r="32" fill="#f97316" />
      <Path d="M 30 74 Q 50 85 70 74 L 70 82 Q 50 92 30 82 Z" fill="white" opacity={0.85} />
      <Path d="M 50 74 L 44 86 L 50 84 L 56 86 Z" fill="#f97316" />
      <Rect x="28" y="46" width="44" height="19" rx="9" fill="#7c2d12" />
      <Circle cx="39" cy="55" r="8" fill="#fed7aa" />
      <Circle cx="61" cy="55" r="8" fill="#fed7aa" />
      <Circle cx="36" cy="52" r="2.5" fill="rgba(255,255,255,0.6)" />
      <Circle cx="58" cy="52" r="2.5" fill="rgba(255,255,255,0.6)" />
      <Circle cx="39" cy="55" r="4" fill="#1a0900" />
      <Circle cx="61" cy="55" r="4" fill="#1a0900" />
      <Rect x="72" y="52" width="14" height="4" rx="2" fill="#7c2d12" />
      <Rect x="14" y="52" width="14" height="4" rx="2" fill="#7c2d12" />
      <Path d="M 14 64 Q 8 60 6 52 Q 10 48 16 54 Q 18 50 24 56 Q 20 66 14 64 Z" fill="#ea580c" />
      <Path d="M 86 64 Q 92 60 94 52 Q 90 48 84 54 Q 82 50 76 56 Q 80 66 86 64 Z" fill="#ea580c" />
      <Path d="M 70 42 Q 88 26 84 14 Q 80 6 74 10" fill="none" stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="72" cy="8" r="6" fill="#fb923c" />
      <Circle cx="72" cy="8" r="3" fill="rgba(255,255,255,0.5)" />
      <Path d="M 69 10 Q 72 14 75 10" fill="rgba(255,255,255,0.3)" />
      <Path d="M 38 72 Q 50 80 62 72" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Rex — History Dragon (purple) ───────────────────────────────────────────
export function RexChar({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.18)" />
      <Path d="M 50 44 Q 20 26 8 36 Q 16 52 36 52 Z" fill="#7e22ce" opacity={0.85} />
      <Path d="M 50 44 Q 80 26 92 36 Q 84 52 64 52 Z" fill="#7e22ce" opacity={0.85} />
      <Path d="M 50 44 Q 28 40 14 38" stroke="#6b21a8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M 50 44 Q 72 40 86 38" stroke="#6b21a8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="50" cy="75" rx="22" ry="26" fill="#7e22ce" />
      <Ellipse cx="50" cy="73" rx="20" ry="24" fill="#a855f7" />
      <Path d="M 36 28 L 30 6 L 42 22 Z" fill="#6b21a8" />
      <Path d="M 64 28 L 70 6 L 58 22 Z" fill="#6b21a8" />
      <Ellipse cx="50" cy="44" rx="28" ry="26" fill="#7e22ce" />
      <Ellipse cx="50" cy="43" rx="26" ry="24" fill="#a855f7" />
      <Ellipse cx="50" cy="58" rx="17" ry="10" fill="#7e22ce" />
      <Ellipse cx="50" cy="57" rx="15" ry="8" fill="#9333ea" />
      <Ellipse cx="45" cy="60" rx="2.5" ry="1.5" fill="#581c87" />
      <Ellipse cx="55" cy="60" rx="2.5" ry="1.5" fill="#581c87" />
      <Ellipse cx="38" cy="38" rx="8" ry="7" fill="#fbbf24" />
      <Ellipse cx="62" cy="38" rx="8" ry="7" fill="#fbbf24" />
      <Ellipse cx="38" cy="39" rx="3.5" ry="5" fill="#1a0a00" />
      <Ellipse cx="62" cy="39" rx="3.5" ry="5" fill="#1a0a00" />
      <Circle cx="39.5" cy="37" r="1.5" fill="rgba(255,255,255,0.7)" />
      <Circle cx="63.5" cy="37" r="1.5" fill="rgba(255,255,255,0.7)" />
      <Path d="M 36 64 L 39 70 L 43 64" fill="white" stroke="#7e22ce" strokeWidth="1" />
      <Path d="M 57 64 L 61 70 L 65 64" fill="white" stroke="#7e22ce" strokeWidth="1" />
      <Path d="M 38 76 Q 44 72 50 76 Q 56 72 62 76" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Path d="M 36 84 Q 44 80 50 84 Q 56 80 64 84" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </Svg>
  );
}

// ─── Skills Star — graduation star, bounce + sparkle twinkle ─────────────────
export function SkillsChar({ size = 120 }: { size?: number }) {
  const translateY   = useRef(new Animated.Value(0)).current;
  const scaleBody    = useRef(new Animated.Value(1)).current;
  const sparkleOpacity = useRef(new Animated.Value(0.3)).current;
  const capRotate    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce: quick jump with squash on land
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: -18, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleBody,  { toValue: 0.94, duration: 250, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleBody,  { toValue: 1,   duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(1200),
      ])
    ).start();

    // Sparkle twinkle
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, { toValue: 1,   duration: 600, useNativeDriver: true }),
        Animated.timing(sparkleOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Cap gentle tilt back and forth
    Animated.loop(
      Animated.sequence([
        Animated.timing(capRotate, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(capRotate, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const capDeg = capRotate.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: scaleBody }] }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Shadow — compresses when landing */}
        <Ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.15)" />
        {/* Star body */}
        <Path
          d="M50 18 L62 44 L90 44 L68 61 L76 88 L50 72 L24 88 L32 61 L10 44 L38 44 Z"
          fill="#f59e0b"
        />
        <Path
          d="M50 26 L59 46 L81 46 L64 58 L71 79 L50 67 L29 79 L36 58 L19 46 L41 46 Z"
          fill="#fcd34d"
          opacity={0.5}
        />
        {/* Eyes */}
        <Circle cx="40" cy="56" r="6" fill="white" />
        <Circle cx="60" cy="56" r="6" fill="white" />
        <Circle cx="41" cy="57" r="3.5" fill="#1a1b1e" />
        <Circle cx="61" cy="57" r="3.5" fill="#1a1b1e" />
        <Circle cx="42" cy="55.5" r="1.4" fill="white" />
        <Circle cx="62" cy="55.5" r="1.4" fill="white" />
        {/* Smile */}
        <Path d="M 41 66 Q 50 75 59 66" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Sparkle dots — animated opacity */}
        <Circle cx="16" cy="28" r="2.5" fill="#fcd34d" opacity={0.8} />
        <Circle cx="84" cy="22" r="2"   fill="#fcd34d" opacity={0.7} />
        <Circle cx="88" cy="72" r="3"   fill="#fcd34d" opacity={0.6} />
        <Circle cx="12" cy="70" r="2"   fill="#fcd34d" opacity={0.7} />
      </Svg>
      {/* Graduation cap — animated tilt, layered on top */}
      <Animated.View
        style={{
          position: 'absolute',
          top: size * 0.01,
          left: size * 0.33,
          width: size * 0.34,
          transform: [{ rotate: capDeg }],
        }}
      >
        <Svg width={size * 0.34} height={size * 0.14} viewBox="0 0 34 14">
          <Rect x="0"  y="6"  width="30" height="6"  rx="2" fill="#1a1b1e" />
          <Rect x="3"  y="2"  width="24" height="6"  rx="2" fill="#25262b" />
          <Path d="M 27 4 L 32 10 L 30 13" stroke="#EF9F27" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <Circle cx="30" cy="13" r="2" fill="#EF9F27" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
