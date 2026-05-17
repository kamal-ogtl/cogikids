/**
 * CogiKids animated toy logo.
 *
 * Each letter is a toy character — C is a bunny, o is a smiley, g has frog
 * legs, i has cat ears, K has a robot antenna, the second i has wings, d has
 * dino spikes, and s is a snake.
 *
 * Phase 1 — write-on: left-to-right clip reveal with a glowing cursor.
 * Phase 2 — idle: per-letter bounce wave, star twinkle, gentle sway.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  G,
  Rect,
  Circle,
  Ellipse,
  Line,
  Path,
  Text as SvgText,
  Defs,
  ClipPath,
} from 'react-native-svg';

const AnimatedG    = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── Canvas ────────────────────────────────────────────────────────────────────
const VW       = 268;
const VH       = 110;   // extra room above (ears/antennae) and below (legs)
const BASELINE = 74;
const FS       = 54;    // font size
const FONT     = 'FredokaOne_400Regular';

// ── Letter data ───────────────────────────────────────────────────────────────
const LETTERS = [
  { char: 'C', cx: 24,  fill: '#FF6935', tilt: -5 },
  { char: 'o', cx: 58,  fill: '#FFD700', tilt:  4 },
  { char: 'g', cx: 92,  fill: '#44DD44', tilt: -3 },
  { char: 'i', cx: 118, fill: '#FF4499', tilt:  6 },
  { char: 'K', cx: 148, fill: '#9944FF', tilt: -4 },
  { char: 'i', cx: 175, fill: '#00CCEE', tilt:  3 },
  { char: 'd', cx: 205, fill: '#FF7722', tilt: -4 },
  { char: 's', cx: 232, fill: '#FFEE00', tilt:  5 },
] as const;

// ── Per-letter toy decorations ────────────────────────────────────────────────
// All positions are absolute SVG coords (same space as the letter's cx/BASELINE).
// Each decoration is rendered INSIDE the letter's AnimatedG so it bounces with it.
function ToyFeature({ char, cx, fill }: { char: string; cx: number; fill: string }) {
  switch (char) {

    // C → bunny — two tall ears with pink inner
    case 'C':
      return (
        <G>
          <Ellipse cx={cx - 8} cy={14} rx={3.5} ry={9}   fill={fill} stroke="white" strokeWidth={2} />
          <Ellipse cx={cx - 8} cy={14} rx={1.8} ry={5.5} fill="#FFB3C6" />
          <Ellipse cx={cx + 3} cy={10} rx={3.5} ry={9}   fill={fill} stroke="white" strokeWidth={2} />
          <Ellipse cx={cx + 3} cy={10} rx={1.8} ry={5.5} fill="#FFB3C6" />
        </G>
      );

    // o → smiley face — eyes and smile inside the o circle
    case 'o':
      return (
        <G>
          <Circle cx={cx - 7} cy={50} r={2.5} fill="#553300" />
          <Circle cx={cx + 7} cy={50} r={2.5} fill="#553300" />
          <Path
            d={`M${cx - 7},58 Q${cx},64 ${cx + 7},58`}
            stroke="#553300" strokeWidth={2} fill="none" strokeLinecap="round"
          />
        </G>
      );

    // g → frog — two bent legs below the descender with round feet
    case 'g':
      return (
        <G>
          <Path d={`M${cx - 8},76 L${cx - 14},89 L${cx - 20},91`}
            stroke={fill} strokeWidth={3.5} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={cx - 21} cy={92} r={3.5} fill={fill} stroke="white" strokeWidth={1.5} />
          <Path d={`M${cx + 8},76 L${cx + 14},89 L${cx + 20},91`}
            stroke={fill} strokeWidth={3.5} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={cx + 21} cy={92} r={3.5} fill={fill} stroke="white" strokeWidth={1.5} />
        </G>
      );

    // i (first) → cat — triangular ears on the dot + tiny whiskers
    case 'i':
      if (cx < 140) return (
        <G>
          {/* left ear */}
          <Path d={`M${cx - 8},27 L${cx - 6},14 L${cx + 1},24 Z`}
            fill={fill} stroke="white" strokeWidth={1.5} />
          <Path d={`M${cx - 7},25 L${cx - 5.5},17 L${cx},23 Z`} fill="#FFB3D9" />
          {/* right ear */}
          <Path d={`M${cx + 8},27 L${cx + 6},14 L${cx - 1},24 Z`}
            fill={fill} stroke="white" strokeWidth={1.5} />
          <Path d={`M${cx + 7},25 L${cx + 5.5},17 L${cx},23 Z`} fill="#FFB3D9" />
          {/* whiskers */}
          <Line x1={cx - 12} y1={36} x2={cx - 4} y2={38} stroke="white" strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={cx + 12} y1={36} x2={cx + 4} y2={38} stroke="white" strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
      // i (second) → fairy wings spread from the letter sides
      return (
        <G>
          <Path d={`M${cx - 2},44 Q${cx - 14},50 ${cx - 2},63 Q${cx + 1},55 ${cx - 2},44 Z`}
            fill={fill} opacity={0.55} stroke={fill} strokeWidth={1} />
          <Path d={`M${cx + 2},44 Q${cx + 14},50 ${cx + 2},63 Q${cx - 1},55 ${cx + 2},44 Z`}
            fill={fill} opacity={0.55} stroke={fill} strokeWidth={1} />
        </G>
      );

    // K → robot — antenna with glowing tip
    case 'K':
      return (
        <G>
          <Line x1={cx} y1={32} x2={cx} y2={18}
            stroke={fill} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={cx} cy={14} r={5.5} fill={fill} stroke="white" strokeWidth={2} />
          <Circle cx={cx - 2} cy={12} r={1.8} fill="white" />
        </G>
      );

    // d → dino — three upward spikes along the ascender
    case 'd':
      return (
        <G>
          <Path d={`M${cx + 4},22 L${cx + 8},10 L${cx + 12},22 Z`}
            fill={fill} stroke="white" strokeWidth={1.5} />
          <Path d={`M${cx + 10},30 L${cx + 14},19 L${cx + 18},30 Z`}
            fill={fill} stroke="white" strokeWidth={1.5} />
          <Path d={`M${cx + 16},38 L${cx + 19},28 L${cx + 22},38 Z`}
            fill={fill} stroke="white" strokeWidth={1.5} />
        </G>
      );

    // s → snake — two eyes on the top curve + forked tongue
    case 's':
      return (
        <G>
          <Circle cx={cx - 7} cy={43} r={2.8} fill="#443300" />
          <Circle cx={cx + 2} cy={39} r={2.8} fill="#443300" />
          <Circle cx={cx - 6} cy={42} r={1}   fill="white" />
          <Circle cx={cx + 3} cy={38} r={1}   fill="white" />
          {/* forked tongue */}
          <Path d={`M${cx - 2},50 L${cx - 2},57 M${cx - 6},57 L${cx - 2},57 L${cx + 2},57`}
            stroke="#FF2222" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </G>
      );

    default:
      return null;
  }
}

// ── Star path ─────────────────────────────────────────────────────────────────
const STAR = 'M0,-9 L2.1,-2.9 L8.6,-2.9 L3.4,1.1 L5.3,7.6 L0,3.8 L-5.3,7.6 L-3.4,1.1 L-8.6,-2.9 L-2.1,-2.9 Z';

// ── Component ─────────────────────────────────────────────────────────────────
export function CogiKidsLogo({ width = 280 }: { width?: number }) {
  const h = (width / VW) * VH;

  // Write-on — JS driver (SVG geometry)
  const revealW = useRef(new Animated.Value(0)).current;
  const cursorX = useRef(new Animated.Value(0)).current;
  const cursorR = useRef(new Animated.Value(4)).current;

  // Idle — native driver (transforms only)
  const b0 = useRef(new Animated.Value(0)).current;
  const b1 = useRef(new Animated.Value(0)).current;
  const b2 = useRef(new Animated.Value(0)).current;
  const b3 = useRef(new Animated.Value(0)).current;
  const b4 = useRef(new Animated.Value(0)).current;
  const b5 = useRef(new Animated.Value(0)).current;
  const b6 = useRef(new Animated.Value(0)).current;
  const b7 = useRef(new Animated.Value(0)).current;
  const bounces = [b0, b1, b2, b3, b4, b5, b6, b7];

  const s0 = useRef(new Animated.Value(0)).current;
  const s1 = useRef(new Animated.Value(0)).current;
  const s2 = useRef(new Animated.Value(0)).current;
  const s3 = useRef(new Animated.Value(0)).current;
  const starScales = [s0, s1, s2, s3];

  const sway = useRef(new Animated.Value(0)).current;

  const [phase, setPhase] = useState<'writing' | 'idle'>('writing');

  useEffect(() => {
    const WRITE_MS = 1500;

    Animated.timing(revealW, {
      toValue: VW, duration: WRITE_MS,
      easing: Easing.inOut(Easing.quad), useNativeDriver: false,
    }).start();

    Animated.timing(cursorX, {
      toValue: VW, duration: WRITE_MS,
      easing: Easing.inOut(Easing.quad), useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(cursorR, { toValue: 7,   duration: 300, useNativeDriver: false }),
      Animated.timing(cursorR, { toValue: 3.5, duration: 300, useNativeDriver: false }),
    ]));
    pulse.start();

    setTimeout(() => {
      pulse.stop();
      setPhase('idle');

      starScales.forEach((s, i) => {
        setTimeout(() =>
          Animated.spring(s, { toValue: 1, tension: 120, friction: 5, useNativeDriver: false }).start()
        , i * 120);
      });

      bounces.forEach((b, i) => {
        setTimeout(() =>
          Animated.loop(Animated.sequence([
            Animated.timing(b, { toValue: -9, duration: 340, easing: Easing.out(Easing.back(1.4)), useNativeDriver: false }),
            Animated.timing(b, { toValue:  0, duration: 300, easing: Easing.in(Easing.quad),       useNativeDriver: false }),
            Animated.delay(1800),
          ])).start()
        , i * 90 + 300);
      });

      starScales.forEach((s, i) => {
        setTimeout(() =>
          Animated.loop(Animated.sequence([
            Animated.timing(s, { toValue: 1.6, duration: 420 + i * 80, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(s, { toValue: 0.6, duration: 420 + i * 80, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          ])).start()
        , i * 250 + 700);
      });

      Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue:  1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();
    }, WRITE_MS + 100);
  }, []);

  const swayDeg = sway.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-1.8deg', '0deg', '1.8deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate: swayDeg }] }}>
      <Svg width={width} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Defs>
          <ClipPath id="writeReveal">
            <AnimatedRect x={0} y={0} height={VH} width={revealW} />
          </ClipPath>
        </Defs>

        {/* Ghost outline visible before the reveal catches up */}
        <SvgText
          x={VW / 2} y={BASELINE} textAnchor="middle"
          fontSize={FS} fontFamily={FONT}
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={6} strokeLinejoin="round"
        >
          CogiKids
        </SvgText>

        {/* Everything clipped to the growing reveal rect */}
        <G clipPath="url(#writeReveal)">

          {/* White cartoon outline pass */}
          <SvgText
            x={VW / 2} y={BASELINE} textAnchor="middle"
            fontSize={FS} fontFamily={FONT}
            fill="white" stroke="white" strokeWidth={8} strokeLinejoin="round"
          >
            CogiKids
          </SvgText>

          {/* Per-letter: drop shadow + coloured fill + toy decoration */}
          {LETTERS.map(({ char, cx, fill, tilt }, i) => (
            <AnimatedG
              key={i}
              {...({ style: { transform: [{ translateY: bounces[i] }] } } as any)}
            >
              {/* Shadow */}
              <SvgText
                x={cx + 2} y={BASELINE + 3} textAnchor="middle"
                fontSize={FS} fontFamily={FONT}
                fill={fill} opacity={0.28}
                transform={`rotate(${tilt}, ${cx + 2}, ${BASELINE + 3})`}
              >
                {char}
              </SvgText>
              {/* Coloured letter */}
              <SvgText
                x={cx} y={BASELINE} textAnchor="middle"
                fontSize={FS} fontFamily={FONT}
                fill={fill} stroke="white" strokeWidth={2.5} strokeLinejoin="round"
                transform={`rotate(${tilt}, ${cx}, ${BASELINE})`}
              >
                {char}
              </SvgText>
              {/* Toy character decoration */}
              <ToyFeature char={char} cx={cx} fill={fill} />
            </AnimatedG>
          ))}
        </G>

        {/* Pen cursor — only during write-on, conditional avoids native/JS mixing */}
        {phase === 'writing' && (
          <>
            <AnimatedCircle cy={BASELINE - 20} cx={cursorX} r={cursorR} fill="white" />
            <AnimatedCircle
              cy={BASELINE - 20} cx={cursorX} r={cursorR as any}
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4}
            />
          </>
        )}

        {/* Stars */}
        <AnimatedG transform="translate(12,12)"  {...({ style: { transform: [{ scale: s0 }] } } as any)}><Path d={STAR} fill="#FFD700" /></AnimatedG>
        <AnimatedG transform="translate(256,11)" {...({ style: { transform: [{ scale: s1 }] } } as any)}><Path d={STAR} fill="#FF4499" /></AnimatedG>
        <AnimatedG transform="translate(134,4)"  {...({ style: { transform: [{ scale: s2 }] } } as any)}><Path d={STAR} fill="#44DD44" /></AnimatedG>
        <AnimatedG transform="translate(260,76)" {...({ style: { transform: [{ scale: s3 }] } } as any)}><Path d={STAR} fill="#00CCEE" /></AnimatedG>

        {/* Decorative dots */}
        <Circle cx={4}   cy={40} r={4.5} fill="#9944FF" opacity={0.7} />
        <Circle cx={263} cy={52} r={3.5} fill="#FF6935" opacity={0.7} />
        <Circle cx={5}   cy={80} r={3}   fill="#FF4499" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
}
