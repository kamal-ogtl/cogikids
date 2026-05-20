import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING } from '../../src/constants/theme';
import { LANGUAGES, SupportedLanguage } from '../../src/constants/languages';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import type { AgeGroup } from '../../src/constants/curriculum';
import cache from '../../src/services/offline/cache';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, Path, Polygon as SvgPolygon, Rect } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { playSound } from '../../src/utils/sounds';
import { CogiOwl, ZaraStar, BoltRocket, NikoGlobe } from '../../src/components/characters/OnboardingChars';
import { CogiKidsLogo } from '../../src/components/ui/CogiKidsLogo';
import { HausaFlag, YorubaFlag, IgboFlag, EnglishFlag } from '../../src/components/characters/LanguageIcons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const TOTAL_DATA_STEPS = 3; // steps 1–3 collect data; step 0 is the welcome splash
const STEP_BG    = ['#0c2340', '#0c2a40', '#0c2040', '#091e38'];
const STEP_ACCENT = [COLORS.brand.primary, COLORS.brand.primary, COLORS.brand.primary, COLORS.brand.primary];

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setPlayer, setToken } = usePlayerStore();
  const { setNativeLanguage } = useSettingsStore();

  const [step, setStep]         = useState(0);
  const [name, setName]         = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('explorer');
  const [language, setLanguage] = useState<SupportedLanguage>('hausa');
  const [launching, setLaunching] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Page + character animations
  const pageAnim   = useRef(new Animated.Value(0)).current;
  const charBounce = useRef(new Animated.Value(0)).current;
  const charRotate = useRef(new Animated.Value(0)).current;
  const charScale  = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;

  // Pop character in once
  useEffect(() => {
    Animated.spring(charScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }).start();
  }, []);

  // Idle bounce — active on all steps EXCEPT step 1 (ZaraStar drives its own bounce there)
  useEffect(() => {
    if (step === 1) {
      charBounce.stopAnimation();
      charBounce.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(charBounce, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(charBounce, { toValue: 0,   duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [step]);

  function wiggle() {
    charRotate.setValue(0);
    Animated.sequence([
      Animated.timing(charRotate, { toValue:  1, duration: 70, useNativeDriver: true }),
      Animated.timing(charRotate, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(charRotate, { toValue:  1, duration: 70, useNativeDriver: true }),
      Animated.timing(charRotate, { toValue:  0, duration: 70, useNativeDriver: true }),
    ]).start();
  }

  function pulseBtn() {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.93, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 220, friction: 5, useNativeDriver: true }),
    ]).start();
  }

  function goToStep(nextStep: number) {
    Animated.timing(pageAnim, { toValue: -1, duration: 180, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      pageAnim.setValue(1);
      Animated.spring(pageAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }).start();
    });
    wiggle();
  }

  function handleStart() {
    playSound('tap');
    pulseBtn();
    goToStep(1);
  }

  function goNext() {
    if (step === 1 && !name.trim()) { setError('Please enter your name'); return; }
    setError(null);
    pulseBtn();
    playSound('tap');
    goToStep(step + 1);
  }

  async function handleReady() {
    setError(null);
    pulseBtn();
    playSound('complete');
    setLaunching(true);
  }

  async function finishOnboarding() {
    try {
      const mockPlayer = {
        id: `local_${Date.now()}`,
        name: name.trim(),
        avatarUrl: null,
        ageGroup,
        nativeLanguage: language,
        level: 1,
        xp: 0,
        xpToNextLevel: 500,
        streakDays: 0,
        totalStars: 0,
        lastLoginDate: null,
      };
      cache.setToken('mock_token_pending_backend');
      setToken('mock_token_pending_backend');
      setPlayer(mockPlayer);
      setNativeLanguage(language);
      router.replace('/(tabs)');
    } catch {
      setLaunching(false);
      setError('Something went wrong. Please try again.');
    }
  }

  const accent = STEP_ACCENT[step] ?? COLORS.brand.primary;
  const bg     = STEP_BG[step]    ?? STEP_BG[0];

  const slideStyle = {
    opacity: pageAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
    transform: [{
      translateX: pageAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-SCREEN_W * 0.35, 0, SCREEN_W * 0.35],
      }),
    }],
  };

  const charTransform = {
    transform: [
      { scale: charScale },
      { translateY: charBounce },
      { rotate: charRotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-12deg', '0deg', '12deg'] }) },
    ],
  };

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: bg, paddingTop: insets.top + SPACING.sm, paddingBottom: insets.bottom + SPACING.sm }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress segments */}
        {step > 0 && (
          <View style={styles.progressRow}>
            {Array.from({ length: TOTAL_DATA_STEPS }).map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i < step ? accent : 'rgba(255,255,255,0.15)' }]} />
            ))}
          </View>
        )}

        {/* Character + step content — always vertically centered */}
        <View style={styles.centeredContent}>
          <Animated.View style={[styles.charWrap, charTransform]}>
            {step === 0 && <CogiOwl size={148} />}
            {step === 1 && <ZaraStar size={148} nameLength={name.length} />}
            {step === 2 && <BoltRocket size={148} />}
            {step === 3 && <NikoGlobe size={148} />}
          </Animated.View>

          <Animated.View style={slideStyle}>
            {step === 0 && <WelcomeStep accent={accent} />}
            {step === 1 && <NameStep name={name} setName={setName} error={error} accent={accent} />}
            {step === 2 && <AgeStep ageGroup={ageGroup} setAgeGroup={(v) => { setAgeGroup(v); wiggle(); }} accent={accent} />}
            {step === 3 && <LanguageStep language={language} setLanguage={(v) => { setLanguage(v); wiggle(); }} accent={accent} />}
          </Animated.View>
        </View>

        {/* CTA — pinned to bottom */}
        <Animated.View style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: accent }]}
            onPress={step === 0 ? handleStart : step < TOTAL_DATA_STEPS ? goNext : handleReady}
            activeOpacity={0.9}
          >
            <View style={styles.ctaInner}>
              {step === 0 && <Ionicons name="rocket"        size={20} color="#fff" style={styles.ctaIcon} />}
              {step > 0 && step < TOTAL_DATA_STEPS && <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.ctaIcon} />}
              {step === TOTAL_DATA_STEPS && <Ionicons name="star" size={20} color="#fff" style={styles.ctaIcon} />}
              <Text style={styles.ctaText}>
                {step === 0 ? "Let's Go!" : step < TOTAL_DATA_STEPS ? 'Continue' : "I'm Ready!"}
              </Text>
            </View>
          </TouchableOpacity>

          {step > 1 && (
            <TouchableOpacity onPress={() => goToStep(step - 1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={14} color="rgba(255,255,255,0.4)" />
              <Text style={styles.backText}> Go back</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Rocket launch overlay — rendered on top of everything */}
      {launching && <LaunchOverlay onDone={finishOnboarding} name={name.trim()} />}
    </>
  );
}

// ─── Rocket launch overlay ────────────────────────────────────────────────────

function LaunchOverlay({ onDone, name }: { onDone: () => void; name: string }) {
  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const rocketY      = useRef(new Animated.Value(0)).current;
  const rocketScale  = useRef(new Animated.Value(1)).current;
  // Phase A: "You're all set, [name]!"
  const helloOp      = useRef(new Animated.Value(0)).current;
  const helloScale   = useRef(new Animated.Value(0.6)).current;
  // Phase B: countdown
  const countOp      = useRef(new Animated.Value(0)).current;
  const countScale   = useRef(new Animated.Value(0.8)).current;

  const sparkles = useRef(
    Array.from({ length: 10 }, (_, i) => ({
      x: 20 + (i % 5) * (SCREEN_W / 5),
      y: 40 + Math.floor(i / 5) * (SCREEN_H * 0.48),
      anim: new Animated.Value(0),
      size: 12 + (i % 3) * 8,
      color: ['#FFD700', '#FF4499', '#44DD44', '#00CCEE', '#9944FF'][i % 5],
    }))
  ).current;

  const trail = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      offset: 40 + i * 24,
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    sparkles.forEach(({ anim }, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 110),
          Animated.timing(anim, { toValue: 1, duration: 480, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ])
      ).start();
    });

    Animated.sequence([
      // 1. Dark sky fades in
      Animated.timing(bgOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),

      // 2. "You're all set!" pops in
      Animated.parallel([
        Animated.spring(helloScale, { toValue: 1, tension: 160, friction: 7, useNativeDriver: true }),
        Animated.timing(helloOp,    { toValue: 1, duration: 300,              useNativeDriver: true }),
      ]),

      Animated.delay(1200),

      // 3. "You're all set!" fades, countdown appears
      Animated.parallel([
        Animated.timing(helloOp,   { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(countOp,   { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(countScale,{ toValue: 1, tension: 180, friction: 7, useNativeDriver: true }),
      ]),

      Animated.delay(1000),
    ]).start(() => {
      // Fire rocket sound exactly when the rocket starts moving
      playSound('rocket');

      // 4. Countdown fades, rocket blasts off
      Animated.parallel([
        Animated.timing(countOp,    { toValue: 0,               duration: 200, useNativeDriver: true }),
        ...trail.map(({ opacity }, i) =>
          Animated.sequence([
            Animated.delay(i * 40),
            Animated.timing(opacity, { toValue: 0.75, duration: 200, useNativeDriver: true }),
          ])
        ),
        Animated.timing(rocketY,     { toValue: -(SCREEN_H + 200), duration: 950, useNativeDriver: true }),
        Animated.timing(rocketScale, { toValue: 0.35,               duration: 950, useNativeDriver: true }),
      ]).start(() => onDone());
    });
  }, []);

  return (
    <Animated.View style={[styles.launchOverlay, { opacity: bgOpacity }]}>
      {/* Coloured sparkle stars */}
      {sparkles.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', left: s.x, top: s.y,
            opacity: s.anim,
            transform: [{ scale: s.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.3, 0.3] }) }],
          }}
        >
          <StarShape size={s.size} color={s.color} />
        </Animated.View>
      ))}

      {/* Phase A — personalised greeting */}
      <Animated.View style={[styles.countdownWrap, { opacity: helloOp, transform: [{ scale: helloScale }] }]}>
        <View style={styles.blastRow}>
          <Ionicons name="checkmark-circle" size={32} color="#44DD44" />
          <Text style={[styles.countdownText, { marginLeft: 8 }]}>You're all set!</Text>
        </View>
        {name ? (
          <Text style={[styles.countdownText, { fontSize: 22, color: '#FFD700', marginTop: 6 }]}>
            Welcome, {name}!
          </Text>
        ) : null}
        <Text style={[styles.subTitle, { textAlign: 'center', marginTop: 8 }]}>
          Your adventure is about to begin…
        </Text>
      </Animated.View>

      {/* Phase B — countdown */}
      <Animated.View style={[styles.countdownWrap, { opacity: countOp, transform: [{ scale: countScale }] }]}>
        <Text style={styles.countdownText}>3… 2… 1…</Text>
        <View style={[styles.blastRow, { marginTop: 10 }]}>
          <Ionicons name="rocket" size={30} color="#FF6935" />
          <Text style={[styles.countdownText, { color: '#FF6935', marginLeft: 8 }]}>Blast off!</Text>
        </View>
      </Animated.View>

      {/* Trail flames */}
      {trail.map(({ offset, opacity }, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', alignSelf: 'center',
            width: 8 + i * 4, height: 8 + i * 4,
            borderRadius: 999,
            backgroundColor: i % 2 === 0 ? '#FF6935' : '#FFD700',
            opacity,
            bottom: SCREEN_H / 2 - 80 - offset,
          }}
        />
      ))}

      {/* Rocket */}
      <Animated.View style={[styles.rocketWrap, { transform: [{ translateY: rocketY }, { scale: rocketScale }] }]}>
        <BoltRocket size={130} />
      </Animated.View>
    </Animated.View>
  );
}

// ─── Star sparkle shape ───────────────────────────────────────────────────────

function StarShape({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <SvgPolygon
        points="10,1 12.9,7.3 19.5,8.1 15,13.1 16.2,19.5 10,16.5 3.8,19.5 5,13.1 0.5,8.1 7.1,7.3"
        fill={color}
      />
    </Svg>
  );
}

// ─── Step sub-components ──────────────────────────────────────────────────────

const FEATURE_CARDS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  bg: string;
  border: string;
  color: string;
}[] = [
  { icon: 'trophy',    label: 'Earn Stars',    bg: '#FF693520', border: '#FF693560', color: '#FF6935' },
  { icon: 'flame',     label: 'Daily Streaks', bg: '#FF449920', border: '#FF449960', color: '#FF4499' },
  { icon: 'game-controller', label: 'Fun Lessons', bg: '#9944FF20', border: '#9944FF60', color: '#9944FF' },
];

function WelcomeStep({ accent }: { accent: string }) {
  return (
    <View style={styles.welcomeInner}>
      <CogiKidsLogo width={SCREEN_W * 0.9} />

      <Text style={styles.welcomeTagline}>Learn. Play. Grow!</Text>
      <Text style={styles.welcomeSub}>
        Adventures in maths, science, languages{'\n'}and so much more — just for you!
      </Text>

      <View style={styles.featureRow}>
        {FEATURE_CARDS.map((c) => (
          <View key={c.label} style={[styles.featureCard, { backgroundColor: c.bg, borderColor: c.border }]}>
            <Ionicons name={c.icon} size={26} color={c.color} />
            <Text style={[styles.featureLabel, { color: c.color }]}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function NameStep({ name, setName, error, accent }: {
  name: string; setName: (v: string) => void; error: string | null; accent: string;
}) {
  return (
    <View style={styles.stepInner}>
      <Text style={styles.mainTitle}>What's your name?</Text>
      <Text style={styles.subTitle}>I'll use it to cheer you on!</Text>
      <TextInput
        style={[styles.input, { borderColor: error ? COLORS.semantic.wrong : accent }]}
        value={name}
        onChangeText={setName}
        placeholder="Type your name…"
        placeholderTextColor={COLORS.text.disabled}
        autoCapitalize="words"
        maxLength={30}
        autoFocus
        returnKeyType="done"
      />
      {error ? <Text style={styles.errTxt}>{error}</Text> : null}
    </View>
  );
}

function AgeStep({ ageGroup, setAgeGroup, accent }: {
  ageGroup: AgeGroup; setAgeGroup: (v: AgeGroup) => void; accent: string;
}) {
  return (
    <View style={styles.stepInner}>
      <Text style={styles.mainTitle}>How old are you?</Text>
      <Text style={styles.subTitle}>I'll make lessons just right for you!</Text>
      <View style={styles.ageRow}>
        {AGE_OPTIONS.map((opt) => {
          const active = ageGroup === opt.value;
          const tint   = active ? opt.color : 'rgba(255,255,255,0.55)';
          return (
            <SpringCard key={opt.value} active={active} accent={opt.color} onPress={() => setAgeGroup(opt.value)}>
              {opt.value === 'explorer'
                ? <ExplorerIcon color={tint} />
                : <StrategistIcon color={tint} />
              }
              <Text style={[styles.cardLabel, { color: active ? opt.color : COLORS.white }]}>{opt.label}</Text>
              <Text style={[styles.cardRange,  { color: active ? opt.color : 'rgba(255,255,255,0.55)' }]}>{opt.range}</Text>
              <Text style={[styles.cardDesc,   { color: active ? opt.color : 'rgba(255,255,255,0.38)', opacity: active ? 0.9 : 1 }]}>{opt.desc}</Text>
            </SpringCard>
          );
        })}
      </View>
    </View>
  );
}

// Explorer — a little star-kid face
function ExplorerIcon({ color }: { color: string }) {
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52">
      {/* Star body */}
      <SvgPolygon
        points="26,4 30.5,18 44,18 33,26.5 37.5,40 26,32 14.5,40 19,26.5 8,18 21.5,18"
        fill={color}
      />
      {/* Eyes */}
      <Circle cx="21" cy="21" r="2.5" fill="#1a1b1e" />
      <Circle cx="31" cy="21" r="2.5" fill="#1a1b1e" />
      {/* Shine */}
      <Circle cx="22.2" cy="19.8" r="1" fill="white" />
      <Circle cx="32.2" cy="19.8" r="1" fill="white" />
      {/* Smile */}
      <Path d="M21,27 Q26,32 31,27" stroke="#1a1b1e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Backpack strap */}
      <Rect x="22" y="36" width="8" height="10" rx="3" fill={color} stroke="#1a1b1e" strokeWidth="1.5" />
    </Svg>
  );
}

// Strategist — a light-bulb brain character
function StrategistIcon({ color }: { color: string }) {
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52">
      {/* Bulb glass */}
      <Path d="M26,6 C17,6 11,13 11,21 C11,27 14,32 19,35 L19,42 L33,42 L33,35 C38,32 41,27 41,21 C41,13 35,6 26,6 Z"
        fill={color} />
      {/* Base bands */}
      <Rect x="19" y="43" width="14" height="3" rx="1.5" fill={color} opacity={0.7} />
      <Rect x="20" y="47" width="12" height="3" rx="1.5" fill={color} opacity={0.5} />
      {/* Eyes */}
      <Circle cx="22" cy="22" r="2.8" fill="#1a1b1e" />
      <Circle cx="30" cy="22" r="2.8" fill="#1a1b1e" />
      <Circle cx="23" cy="21" r="1.1" fill="white" />
      <Circle cx="31" cy="21" r="1.1" fill="white" />
      {/* Smile */}
      <Path d="M21,29 Q26,34 31,29" stroke="#1a1b1e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Shine lines in bulb */}
      <Path d="M32,11 L35,8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
      <Path d="M36,17 L40,16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

const LANGUAGE_GREETINGS: Record<SupportedLanguage, {
  phrase: string;       // shown in the bubble, written in the language
  translation: string;  // English gloss shown below
  tts: string;          // what expo-speech says
  ttsLang: string;      // BCP-47 locale hint
}> = {
  hausa: {
    phrase:      'Sannu, aboki!',
    translation: 'Hello, friend!',
    tts:         'Sannu aboki! Ina farin ciki da ganku!',
    ttsLang:     'ha',
  },
  yoruba: {
    phrase:      'E kaabo!',
    translation: 'Welcome!',
    tts:         'E kaabo! E se pupo!',
    ttsLang:     'yo',
  },
  igbo: {
    phrase:      'Nnọọ!',
    translation: 'Welcome!',
    tts:         'Nnoo! I biri oma!',
    ttsLang:     'ig',
  },
  english: {
    phrase:      'Hello, friend!',
    translation: 'Great choice!',
    tts:         'Hello friend! Great choice! Let\'s learn together!',
    ttsLang:     'en-US',
  },
};

function LanguageStep({ language, setLanguage, accent }: {
  language: SupportedLanguage; setLanguage: (v: SupportedLanguage) => void; accent: string;
}) {
  const bubbleAnim  = useRef(new Animated.Value(0)).current;
  const [bubble, setBubble] = useState<SupportedLanguage | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function selectLanguage(lang: SupportedLanguage) {
    setLanguage(lang);

    // Reset any pending hide
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // Pop the bubble in
    setBubble(lang);
    bubbleAnim.setValue(0);
    Animated.spring(bubbleAnim, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }).start();

    // Speak in the chosen language; fall back silently if unsupported
    const g = LANGUAGE_GREETINGS[lang];
    Speech.stop();
    Speech.speak(g.tts, { language: g.ttsLang, rate: 0.88, pitch: 1.12 });

    // Auto-dismiss after 2.8 s
    hideTimer.current = setTimeout(() => {
      Animated.timing(bubbleAnim, { toValue: 0, duration: 280, useNativeDriver: true })
        .start(() => setBubble(null));
    }, 2800);
  }

  const bubbleScale = bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View style={styles.stepInner}>
      <Text style={styles.mainTitle}>Home language?</Text>
      <Text style={styles.subTitle}>Tap your language — I'll say hello!</Text>

      {/* Speech bubble */}
      {bubble && (
        <Animated.View style={[
          styles.langBubble,
          { opacity: bubbleAnim, transform: [{ scale: bubbleScale }] },
        ]}>
          {/* Tail pointing down toward the grid */}
          <View style={styles.langBubbleTail} />
          <Text style={styles.langBubblePhrase}>{LANGUAGE_GREETINGS[bubble].phrase}</Text>
          <Text style={styles.langBubbleGloss}>{LANGUAGE_GREETINGS[bubble].translation}</Text>
        </Animated.View>
      )}

      <View style={styles.langGrid}>
        {LANG_OPTIONS.map((opt) => (
          <SpringCard
            key={opt.key}
            active={language === opt.key}
            accent={accent}
            onPress={() => selectLanguage(opt.key)}
            style={{ width: '47%' }}
          >
            {opt.FlagIcon && <opt.FlagIcon size={64} />}
            <Text style={[styles.langName, language === opt.key && { color: accent }]}>
              {LANGUAGES[opt.key].nativeName}
            </Text>
          </SpringCard>
        ))}
      </View>
    </View>
  );
}

// ─── Reusable spring-animated card ───────────────────────────────────────────

function SpringCard({ children, active, accent, onPress, style }: {
  children: React.ReactNode;
  active: boolean;
  accent: string;
  onPress: () => void;
  style?: object;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: active ? 1.05 : 1, tension: 220, friction: 6, useNativeDriver: true }).start();
  }, [active]);

  function handlePress() {
    playSound('tap');
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.91, useNativeDriver: true }),
      Animated.spring(scale, { toValue: active ? 1 : 1.05, tension: 220, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={[{ flex: style ? undefined : 1 }, style]}>
      <Animated.View style={[
        styles.selCard,
        active && { borderColor: accent, backgroundColor: `${accent}22` },
        { transform: [{ scale }] },
      ]}>
        {active && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={20} color={accent} />
          </View>
        )}
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGE_OPTIONS: { value: AgeGroup; label: string; range: string; desc: string; color: string }[] = [
  { value: 'explorer',   label: 'Explorer',   range: 'Ages 5 – 9',   desc: 'Fun, simple adventures', color: '#FFB020' },
  { value: 'strategist', label: 'Strategist', range: 'Ages 10 – 15', desc: 'Big brain challenges',   color: '#9944FF' },
];

const LANG_OPTIONS: { key: SupportedLanguage; FlagIcon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'hausa',   FlagIcon: HausaFlag   },
  { key: 'yoruba',  FlagIcon: YorubaFlag  },
  { key: 'igbo',    FlagIcon: IgboFlag    },
  { key: 'english', FlagIcon: EnglishFlag },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },

  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },

  welcomeInner: {
    alignItems: 'center',
    gap: SPACING.md,
  },

  welcomeTitle: {
    textAlign: 'center',
    fontSize: 40,
  },

  welcomeTagline: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  welcomeSub: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: -SPACING.xs,
  },

  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.xs,
  },

  featureCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 6,
  },

  featureLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  progressRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  seg: { flex: 1, height: 6, borderRadius: RADIUS.full },

  charWrap: { alignItems: 'center', marginBottom: SPACING.sm },

  stepInner: { gap: SPACING.md },

  mainTitle: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.white,
    lineHeight: 38,
  },
  subTitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 21,
    marginTop: -SPACING.xs,
  },

  input: {
    fontFamily: FONTS.body,
    fontSize: 18,
    color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  errTxt: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.semantic.wrong },

  ageRow: { flexDirection: 'row', gap: SPACING.md },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  langName: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  langBubble: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 180,
  },
  langBubbleTail: {
    position: 'absolute',
    bottom: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  langBubblePhrase: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 22,
    color: '#1a1b1e',
    textAlign: 'center',
  },
  langBubbleGloss: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: 'rgba(0,0,0,0.45)',
    textAlign: 'center',
  },

  selCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    minHeight: 108,
  },
  cardLabel: { fontFamily: FONTS.heading, fontSize: 15, color: COLORS.white, textAlign: 'center' },
  cardRange: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  cardDesc:  { fontFamily: FONTS.body, fontSize: 11, color: 'rgba(255,255,255,0.38)', textAlign: 'center' },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  btnWrap: { marginTop: SPACING.lg, marginBottom: SPACING.xl, gap: SPACING.sm },
  ctaBtn: {
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  ctaIcon:  {},
  ctaText:  { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.white, letterSpacing: 0.3 },
  backBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm },
  backText: { fontFamily: FONTS.body, fontSize: 14, color: 'rgba(255,255,255,0.4)' },

  // Launch overlay
  launchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#05071a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  rocketWrap: {
    position: 'absolute',
    bottom: SCREEN_H / 2 - 65,
    alignSelf: 'center',
  },
  countdownWrap: {
    position: 'absolute',
    top: SCREEN_H * 0.22,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  countdownText: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 42,
  },
  blastRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
