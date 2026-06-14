/**
 * SVG characters for the onboarding flow.
 * Each component accepts animated translateY + rotate values
 * so the parent can drive bounce/wiggle animations.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Polygon,
  Rect,
  G,
} from 'react-native-svg';

const AnimatedG       = Animated.createAnimatedComponent(G);
const AnimatedCircle  = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

// ─── Greetings Cogi cycles through ───────────────────────────────────────────
const GREETINGS = [
  { speak: "Hey there! I'm Cogi! Ready to learn and play?",         bubble: "Hey there! I'm Cogi!" },
  { speak: "Woohoo! Let's explore something amazing today!",        bubble: "Let's explore something amazing!" },
  { speak: "Hi friend! Tap Let's Go to start your adventure!",      bubble: "Tap Let's Go to start!" },
  { speak: "Learning is so much fun! I'll be right here with you!", bubble: "Learning is so much fun!" },
];

// ─── Cogi the Owl (welcome) ───────────────────────────────────────────────────
/** CogiOwl — animated owl mascot shown during the onboarding welcome step. */
export function CogiOwl({ size = 160 }: { size?: number }) {
  const waveAnim    = useRef(new Animated.Value(0)).current;
  const twinkleL    = useRef(new Animated.Value(1)).current;
  const twinkleR    = useRef(new Animated.Value(1)).current;
  const mouthOpen   = useRef(new Animated.Value(0)).current;
  const bubbleAnim  = useRef(new Animated.Value(0)).current;
  const greetingIdx = useRef(0);
  const [bubbleText, setBubbleText] = React.useState(GREETINGS[0].bubble);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 360, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 360, useNativeDriver: true }),
        Animated.delay(1400),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(twinkleL, { toValue: 0.05, duration: 100, useNativeDriver: true }),
        Animated.timing(twinkleL, { toValue: 1,    duration: 120, useNativeDriver: true }),
        Animated.delay(220),
        Animated.timing(twinkleR, { toValue: 0.05, duration: 100, useNativeDriver: true }),
        Animated.timing(twinkleR, { toValue: 1,    duration: 120, useNativeDriver: true }),
        Animated.delay(1800),
      ])
    ).start();

    const hideBubble = () =>
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(bubbleAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();

    const doSpeak = () => {
      const greeting = GREETINGS[greetingIdx.current % GREETINGS.length];
      greetingIdx.current += 1;
      setBubbleText(greeting.bubble);

      Animated.spring(bubbleAnim, { toValue: 1, tension: 220, friction: 8, useNativeDriver: true }).start();

      try {
        Speech.stop();
        Speech.speak(greeting.speak, {
          rate: 0.88,
          pitch: 1.15,
          onStart: () => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(mouthOpen, { toValue: 1, duration: 120, useNativeDriver: false }),
                Animated.timing(mouthOpen, { toValue: 0, duration: 120, useNativeDriver: false }),
              ]),
              { iterations: 14 }
            ).start();
          },
          onDone:    hideBubble,
          onStopped: hideBubble,
          onError:   () => hideBubble(),
        });
      } catch {
        hideBubble();
      }
    };

    const initialTimer = setTimeout(doSpeak, 800);
    const repeatTimer  = setInterval(doSpeak, 7000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(repeatTimer);
      Speech.stop();
    };
  }, []);

  const waveRotate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100deg', '-130deg'],
  });

  const mouthRy = mouthOpen.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 5],
  });

  const bubbleScale = bubbleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={{ width: size, alignItems: 'center' }}>
      <Animated.View
        style={{
          opacity: bubbleAnim,
          transform: [{ scale: bubbleScale }],
          backgroundColor: 'white',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 9,
          marginBottom: 6,
          maxWidth: 220,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1b1e', letterSpacing: 0.2 }}>
          {bubbleText}
        </Text>
      </Animated.View>

      <Svg width={size} height={size} viewBox="0 0 160 160">
        {/* Body */}
        <Ellipse cx="80" cy="105" rx="42" ry="48" fill="#8B5E3C" />
        {/* Belly */}
        <Ellipse cx="80" cy="112" rx="24" ry="30" fill="#D4956A" />
        {/* Left wing */}
        <Ellipse cx="42" cy="112" rx="18" ry="28" fill="#6B4226" transform="rotate(-15 42 112)" />
        {/* Right wing — raised upward and waving, pivot at shoulder */}
        <AnimatedG {...{ style: { transform: [
          { translateX: 110 }, { translateY: 100 },
          { rotate: waveRotate },
          { translateX: -110 }, { translateY: -100 },
        ] } } as any}>
          <Ellipse cx="118" cy="112" rx="18" ry="28" fill="#6B4226" />
        </AnimatedG>
        {/* Head */}
        <Circle cx="80" cy="65" r="38" fill="#8B5E3C" />
        {/* Left ear tuft */}
        <Polygon points="58,32 50,10 66,28" fill="#6B4226" />
        {/* Right ear tuft */}
        <Polygon points="102,32 110,10 94,28" fill="#6B4226" />
        {/* Left eye white */}
        <Circle cx="65" cy="65" r="14" fill="white" />
        {/* Right eye white */}
        <Circle cx="95" cy="65" r="14" fill="white" />
        {/* Left eye pupil */}
        <Circle cx="67" cy="65" r="8" fill="#1a1b1e" />
        {/* Right eye pupil */}
        <Circle cx="97" cy="65" r="8" fill="#1a1b1e" />
        {/* Left eye shine — twinkles */}
        <AnimatedCircle cx="70" cy="61" r="3" fill="white" {...{ style: { opacity: twinkleL } } as any} />
        {/* Right eye shine — twinkles with offset */}
        <AnimatedCircle cx="100" cy="61" r="3" fill="white" {...{ style: { opacity: twinkleR } } as any} />
        {/* Beak */}
        <Polygon points="80,72 74,82 86,82" fill="#EF9F27" />
        {/* Mouth smile arc (lips outline) */}
        <Path d="M72,87 Q80,95 88,87" stroke="#5C2D00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Mouth inner — opens and closes when speaking */}
        <AnimatedEllipse cx="80" cy="90" rx="7" ry={mouthRy} fill="#3B1A0A" />
        {/* Feet */}
        <Ellipse cx="65" cy="150" rx="10" ry="6" fill="#EF9F27" />
        <Ellipse cx="95" cy="150" rx="10" ry="6" fill="#EF9F27" />
      </Svg>
    </View>
  );
}

// ─── Zara the Star Kid (name step) ─────────────────────────────────────────
export function ZaraStar({ size = 160, nameLength = 0 }: { size?: number; nameLength?: number }) {
  const prevLength = useRef(0);

  // Body squash & stretch + jump
  const bounceY  = useRef(new Animated.Value(0)).current;
  const scaleX   = useRef(new Animated.Value(1)).current;
  const scaleY   = useRef(new Animated.Value(1)).current;

  // Head shake (on delete)
  const headTilt = useRef(new Animated.Value(0)).current;

  // Right arm wave
  const armAngle = useRef(new Animated.Value(0)).current;

  // Eye squint (ry shrinks to happy slits)
  const eyeRy = useRef(new Animated.Value(6)).current;

  // Cheek blush
  const cheekOpacity = useRef(new Animated.Value(0)).current;

  // Main star
  const starScale  = useRef(new Animated.Value(1)).current;
  const starRotate = useRef(new Animated.Value(0)).current;

  // 5 burst particles around the star
  const BURST_COUNT = 5;
  const burst = useRef(
    Array.from({ length: BURST_COUNT }, (_, i) => ({
      angle: (i / BURST_COUNT) * Math.PI * 2,
      dist:    new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale:   new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const adding = nameLength > prevLength.current;
    prevLength.current = nameLength;

    if (nameLength === 0) return;

    if (adding) {
      // ── Jump with squash & stretch ────────────────────────────────
      Animated.sequence([
        // Stretch up on takeoff
        Animated.parallel([
          Animated.timing(bounceY, { toValue: -20, duration: 90,  useNativeDriver: true }),
          Animated.timing(scaleY,  { toValue: 1.18, duration: 90, useNativeDriver: true }),
          Animated.timing(scaleX,  { toValue: 0.86, duration: 90, useNativeDriver: true }),
        ]),
        // Squash on landing
        Animated.parallel([
          Animated.spring(bounceY, { toValue: 0, friction: 4, tension: 300, useNativeDriver: true }),
          Animated.timing(scaleY,  { toValue: 0.84, duration: 70, useNativeDriver: true }),
          Animated.timing(scaleX,  { toValue: 1.16, duration: 70, useNativeDriver: true }),
        ]),
        // Settle back to normal
        Animated.parallel([
          Animated.spring(scaleY, { toValue: 1, tension: 280, friction: 7, useNativeDriver: true }),
          Animated.spring(scaleX, { toValue: 1, tension: 280, friction: 7, useNativeDriver: true }),
        ]),
      ]).start();

      // ── Right arm waves up ────────────────────────────────────────
      Animated.sequence([
        Animated.timing(armAngle, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.spring(armAngle, { toValue: 0, tension: 260, friction: 5, useNativeDriver: true }),
      ]).start();

      // ── Eye happy squint ─────────────────────────────────────────
      Animated.sequence([
        Animated.timing(eyeRy, { toValue: 1.5, duration: 80,  useNativeDriver: false }),
        Animated.delay(100),
        Animated.timing(eyeRy, { toValue: 6,   duration: 140, useNativeDriver: false }),
      ]).start();

      // ── Cheek blush ───────────────────────────────────────────────
      Animated.sequence([
        Animated.timing(cheekOpacity, { toValue: 0.75, duration: 80,  useNativeDriver: true }),
        Animated.delay(180),
        Animated.timing(cheekOpacity, { toValue: 0,    duration: 380, useNativeDriver: true }),
      ]).start();

      // ── Star pop + spin ───────────────────────────────────────────
      Animated.sequence([
        Animated.parallel([
          Animated.spring(starScale,  { toValue: 1.7, tension: 320, friction: 4, useNativeDriver: true }),
          Animated.timing(starRotate, { toValue: 1,   duration: 180, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(starScale,  { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
          Animated.timing(starRotate, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();

      // ── Star burst particles ──────────────────────────────────────
      burst.forEach(({ dist, opacity, scale }) => {
        dist.setValue(0);
        opacity.setValue(1);
        scale.setValue(0);
        Animated.parallel([
          Animated.timing(dist,    { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: true }),
          Animated.spring(scale,   { toValue: 1, tension: 280, friction: 6, useNativeDriver: true }),
        ]).start();
      });

    } else {
      // ── Delete: head shake left-right ─────────────────────────────
      Animated.sequence([
        Animated.timing(headTilt, { toValue:  1, duration: 55, useNativeDriver: true }),
        Animated.timing(headTilt, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(headTilt, { toValue:  1, duration: 55, useNativeDriver: true }),
        Animated.timing(headTilt, { toValue:  0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [nameLength]);

  const starRotateDeg = starRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '72deg'] });
  const headTiltDeg   = headTilt.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-14deg', '0deg', '14deg'] });
  const armRotateDeg  = armAngle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-28deg'] });
  const BURST_RADIUS  = 26;

  return (
    <Animated.View style={{ transform: [{ translateY: bounceY }, { scaleX }, { scaleY }] }}>
      <Svg width={size} height={size} viewBox="0 0 160 160">

        {/* Body */}
        <Ellipse cx="80" cy="118" rx="28" ry="32" fill="#0ea5e9" />

        {/* Left arm (static) */}
        <Path d="M52 100 Q30 80 22 60 Q18 52 26 50 Q34 48 38 58 Q44 74 56 90 Z" fill="#0ea5e9" />

        {/* Right arm — waves up on each keystroke, pivot near shoulder */}
        <AnimatedG {...{ style: { transform: [
          { translateX: 108 }, { translateY: 96 },
          { rotate: armRotateDeg },
          { translateX: -108 }, { translateY: -96 },
        ] } } as any}>
          <Path d="M108 100 Q126 92 132 80 Q136 72 130 68 Q124 64 120 72 Q114 84 104 96 Z" fill="#0ea5e9" />
        </AnimatedG>

        {/* Legs */}
        <Rect x="66" y="146" width="12" height="10" rx="5" fill="#0284c7" />
        <Rect x="82" y="146" width="12" height="10" rx="5" fill="#0284c7" />

        {/* Head group — shakes on delete */}
        <AnimatedG {...{ style: { transform: [
          { translateX: 80 }, { translateY: 68 },
          { rotate: headTiltDeg },
          { translateX: -80 }, { translateY: -68 },
        ] } } as any}>
          <Circle cx="80" cy="68" r="34" fill="#FDDCB5" />
          <Path d="M46 58 Q50 30 80 28 Q110 30 114 58 Q106 44 80 44 Q54 44 46 58 Z" fill="#3B2314" />

          {/* Eyes — ry squints to slits on each letter */}
          <AnimatedEllipse cx="68" cy="68" rx="6" ry={eyeRy} fill="#3B2314" />
          <AnimatedEllipse cx="92" cy="68" rx="6" ry={eyeRy} fill="#3B2314" />
          <Circle cx="70" cy="65" r="2.5" fill="white" />
          <Circle cx="94" cy="65" r="2.5" fill="white" />

          {/* Cheek blush — fades in and out per keystroke */}
          <AnimatedEllipse cx="57" cy="76" rx="9" ry="5" fill="#f9a8d4" {...{ style: { opacity: cheekOpacity } } as any} />
          <AnimatedEllipse cx="103" cy="76" rx="9" ry="5" fill="#f9a8d4" {...{ style: { opacity: cheekOpacity } } as any} />

          {/* Smile */}
          <Path d="M68 80 Q80 92 92 80" stroke="#3B2314" strokeWidth="3" fill="none" strokeLinecap="round" />
        </AnimatedG>

        {/* Burst particles — shoot out from star on each keystroke */}
        {burst.map((b, i) => {
          const tx = b.dist.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(b.angle) * BURST_RADIUS] });
          const ty = b.dist.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(b.angle) * BURST_RADIUS] });
          return (
            <AnimatedG
              key={i}
              {...{ style: { transform: [{ translateX: tx }, { translateY: ty }, { scale: b.scale }], opacity: b.opacity } } as any}
            >
              <Polygon points="80,1 82,5 86,6 82,7 80,11 78,7 74,6 78,5" fill={i % 2 === 0 ? '#EF9F27' : '#ffffff'} />
            </AnimatedG>
          );
        })}

        {/* Main star above head */}
        <AnimatedG {...{ style: { transform: [
          { translateX: 80 }, { translateY: 19 },
          { rotate: starRotateDeg },
          { scale: starScale },
          { translateX: -80 }, { translateY: -19 },
        ] } } as any}>
          <Polygon points="80,6 83,16 94,16 85,22 88,32 80,26 72,32 75,22 66,16 77,16" fill="#EF9F27" />
        </AnimatedG>

      </Svg>
    </Animated.View>
  );
}

// ─── Bolt the Rocket Kid (age step) ──────────────────────────────────────────
export function BoltRocket({ size = 160 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      {/* Rocket body */}
      <Path d="M80 10 Q96 30 96 80 L80 90 L64 80 Q64 30 80 10 Z" fill="#a855f7" />
      {/* Rocket nose cone */}
      <Path d="M64 80 L80 90 L96 80 L96 100 Q80 108 64 100 Z" fill="#7e22ce" />
      {/* Rocket window */}
      <Circle cx="80" cy="55" r="12" fill="#e9d5ff" />
      {/* Face in window */}
      <Circle cx="80" cy="55" r="10" fill="#FDDCB5" />
      <Circle cx="76" cy="53" r="3" fill="#3B2314" />
      <Circle cx="84" cy="53" r="3" fill="#3B2314" />
      <Circle cx="77" cy="51.5" r="1.2" fill="white" />
      <Circle cx="85" cy="51.5" r="1.2" fill="white" />
      <Path d="M74 59 Q80 65 86 59" stroke="#3B2314" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Left fin */}
      <Path d="M64 88 L46 108 L64 102 Z" fill="#9333ea" />
      {/* Right fin */}
      <Path d="M96 88 L114 108 L96 102 Z" fill="#9333ea" />
      {/* Flames */}
      <Ellipse cx="80" cy="112" rx="10" ry="14" fill="#f97316" />
      <Ellipse cx="74" cy="116" rx="6" ry="10" fill="#EF9F27" />
      <Ellipse cx="86" cy="116" rx="6" ry="10" fill="#EF9F27" />
      <Ellipse cx="80" cy="118" rx="5" ry="8" fill="#fef08a" />
      {/* Stars */}
      <Circle cx="28" cy="30" r="3" fill="#EF9F27" />
      <Circle cx="132" cy="20" r="2" fill="#EF9F27" />
      <Circle cx="140" cy="60" r="4" fill="#a855f7" />
      <Circle cx="20" cy="80" r="2.5" fill="#0ea5e9" />
    </Svg>
  );
}

// ─── Niko the Globe (language step) ──────────────────────────────────────────
export function NikoGlobe({ size = 160 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      {/* Globe body */}
      <Circle cx="80" cy="85" r="60" fill="#0ea5e9" />
      {/* Land masses */}
      <Ellipse cx="65" cy="70" rx="20" ry="14" fill="#22c55e" />
      <Ellipse cx="95" cy="90" rx="16" ry="12" fill="#22c55e" />
      <Ellipse cx="60" cy="105" rx="12" ry="8" fill="#22c55e" />
      <Ellipse cx="100" cy="65" rx="10" ry="8" fill="#22c55e" />
      {/* Latitude lines */}
      <Ellipse cx="80" cy="85" rx="59" ry="12" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <Ellipse cx="80" cy="85" rx="50" ry="28" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      {/* Face */}
      <Circle cx="80" cy="42" r="28" fill="#FDDCB5" />
      {/* Eyes */}
      <Circle cx="72" cy="40" r="5" fill="#3B2314" />
      <Circle cx="88" cy="40" r="5" fill="#3B2314" />
      <Circle cx="73.5" cy="38" r="2" fill="white" />
      <Circle cx="89.5" cy="38" r="2" fill="white" />
      {/* Smile */}
      <Path d="M70 50 Q80 60 90 50" stroke="#3B2314" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <Circle cx="62" cy="46" r="6" fill="#f9a8d4" opacity="0.6" />
      <Circle cx="98" cy="46" r="6" fill="#f9a8d4" opacity="0.6" />
      {/* Globe stand */}
      <Rect x="72" y="144" width="16" height="8" rx="4" fill="#0284c7" />
      <Rect x="62" y="150" width="36" height="6" rx="3" fill="#0284c7" />
      {/* Speech bubbles */}
      <Path d="M18 20 Q18 10 28 10 L48 10 Q58 10 58 20 Q58 30 48 30 L30 30 L22 38 L26 30 Q18 30 18 20 Z" fill="white" />
      <Path d="M102 14 Q102 6 110 6 L126 6 Q134 6 134 14 Q134 22 126 22 L112 22 L106 28 L108 22 Q102 22 102 14 Z" fill="white" />
      {/* Text in bubbles */}
      <Path d="M26 18 L50 18" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M26 24 L44 24" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M109 12 L126 12" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M109 18 L120 18" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}
