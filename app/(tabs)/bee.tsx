/**
 * Spelling Bee — Phase 2
 * Game flow: loading → ready → playing → correct/wrong → (10 rounds) → summary
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import MieoCharacter from '../../assets/mieo-character.svg';
import GameIconSound from '../../assets/game-icon-sound.svg';
import GameIconHint  from '../../assets/game-icon-hint.svg';
import { LetterBox }    from '../../src/components/spelling/LetterBox';
import { GameKeyboard } from '../../src/components/spelling/GameKeyboard';
import { FONTS } from '../../src/constants/theme';
import { pickWords, getNativeHint } from '../../src/constants/wordBank';
import type { BeeWord } from '../../src/constants/wordBank';
import type { LetterBoxState } from '../../src/components/spelling/LetterBox';
import * as Speech from 'expo-speech';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';

// ─── Design tokens ────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get('window');
const SC = SW / 375;

const C = {
  bg:        '#f5fcff',
  card:      '#ffffff',
  dark:      '#171a1c',
  grey:      '#5d686f',
  accent:    '#59c8ff',
  accentBg:  '#e8f8ff',
  border:    '#c9edff',
  correct:   '#34c759',
  correctBg: '#edfff2',
  wrong:     '#dd3636',
  wrongBg:   '#ffeded',
  hintFg:    '#ff894f',
  hintBg:    '#fff8e9',
  gold:      '#f59e0b',
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const StarIcon = ({ filled, size = 14 }: { filled?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? C.gold : 'none'}
      stroke={filled ? C.gold : C.border}
      strokeWidth="1.5"
    />
  </Svg>
);

const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={C.correct} />
    <Path d="M7 12.5l3.5 3.5L17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={C.wrong} />
    <Path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ArrowIcon = ({ size = 16, color = 'white' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RefreshIcon = ({ size = 16, color = 'white' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoIcon = ({ size = 15 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke={C.grey} strokeWidth="1.5" fill="none" />
    <Path d="M12 16v-4M12 8h.01" stroke={C.grey} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SkipIcon = ({ size = 15, color = C.grey }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 4l10 8-10 8V4zM19 5v14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'loading' | 'ready' | 'playing' | 'correct' | 'wrong' | 'summary';

const TOTAL_ROUNDS    = 10;
const CP_PER_CORRECT  = 15;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BeeScreen() {
  const insets = useSafeAreaInsets();
  const player      = usePlayerStore((s) => s.player);
  const addXP       = usePlayerStore((s) => s.addXP);
  const { nativeLanguage, ttsEnabled } = useSettingsStore();

  const ageGroup = player?.ageGroup ?? 'explorer';

  const [words,         setWords]         = useState<BeeWord[]>([]);
  const [roundIndex,    setRoundIndex]    = useState(0);
  const [input,         setInput]         = useState<string[]>([]);
  const [phase,         setPhase]         = useState<GamePhase>('loading');
  const [score,         setScore]         = useState(0);
  const [xpEarned,      setXpEarned]      = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintVisible,   setHintVisible]   = useState(false);
  const [isSpeaking,    setIsSpeaking]    = useState(false);

  const currentWord = words[roundIndex];

  // ─── Init ──────────────────────────────────────────────────────────────────

  const loadWords = useCallback(() => {
    const staticWords = pickWords(ageGroup, TOTAL_ROUNDS);
    setWords(staticWords);
    setRoundIndex(0);
    setInput([]);
    setScore(0);
    setXpEarned(0);
    setHintVisible(false);
    setPhase('ready');
  }, [ageGroup]);

  useEffect(() => { loadWords(); }, []);

  // ─── Speak ─────────────────────────────────────────────────────────────────

  const speakWord = useCallback((word: string) => {
    if (!ttsEnabled) return;
    Speech.stop().catch(() => {});
    setIsSpeaking(true);
    setTimeout(() => {
      Speech.speak(word, {
        language: 'en-US',
        rate: 0.85,
        pitch: 1.0,
        onDone:    () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError:   () => setIsSpeaking(false),
      });
    }, 80);
  }, [ttsEnabled]);

  useEffect(() => {
    if (phase === 'playing' && currentWord) speakWord(currentWord.word);
    if (phase !== 'playing') { Speech.stop().catch(() => {}); setIsSpeaking(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex, speakWord]);

  // ─── Input ─────────────────────────────────────────────────────────────────

  function handleKey(letter: string) {
    if (phase !== 'playing' || !currentWord) return;
    if (input.length >= currentWord.word.length) return;
    setInput(prev => [...prev, letter]);
  }

  function handleBackspace() {
    if (phase !== 'playing') return;
    setInput(prev => prev.slice(0, -1));
  }

  useEffect(() => {
    if (phase === 'playing' && currentWord && input.length === currentWord.word.length) {
      checkAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // ─── Answer check ──────────────────────────────────────────────────────────

  function checkAnswer() {
    if (!currentWord) return;
    const attempt = input.join('').toLowerCase();
    const correct  = currentWord.word.toLowerCase();
    if (attempt === correct) {
      setPhase('correct');
      setScore(s => s + 1);
      setXpEarned(x => x + CP_PER_CORRECT);
      addXP(CP_PER_CORRECT);
      speakWord('Correct! Well done!');
    } else {
      setPhase('wrong');
      setWrongAttempts(n => n + 1);
      speakWord('Try again!');
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      setPhase('summary');
    } else {
      setRoundIndex(next);
      setInput([]);
      setWrongAttempts(0);
      setHintVisible(false);
      setPhase('playing');
    }
  }

  function retryRound() {
    setInput([]);
    setHintVisible(false);
    setPhase('playing');
  }

  // ─── Phase routing ─────────────────────────────────────────────────────────

  if (phase === 'loading') return <LoadingView insetTop={insets.top} />;
  if (phase === 'ready')
    return <ReadyView ageGroup={ageGroup} onStart={() => setPhase('playing')} insetTop={insets.top} insetBottom={insets.bottom} />;
  if (phase === 'summary')
    return <SummaryView score={score} total={TOTAL_ROUNDS} xpEarned={xpEarned} onPlayAgain={loadWords} insetTop={insets.top} insetBottom={insets.bottom} />;
  if (!currentWord) return null;

  // ─── Letter box sizing ─────────────────────────────────────────────────────

  const available = SW - 40 * SC * 2;
  const gap       = 8;
  const wordLen   = currentWord.word.length;
  const rawBoxW   = (available - gap * (wordLen - 1)) / wordLen;
  const boxWidth  = Math.min(52, Math.max(30, Math.floor(rawBoxW)));

  const boxStates: LetterBoxState[] = currentWord.word.split('').map((_, i) => {
    if (phase === 'correct') return 'correct';
    if (phase === 'wrong')   return i < input.length ? 'wrong' : 'empty';
    return input[i] ? 'filled' : 'empty';
  });

  const bubbleText =
    isSpeaking        ? 'Listen carefully...' :
    phase === 'correct' ? 'Amazing! You got it! 🎉' :
    phase === 'wrong'   ? "Oops! Try again, you've got this!" :
    'Can you spell this word?';

  return (
    <ScrollView
      style={[s.screen, { paddingTop: insets.top }]}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="always"
      scrollEnabled={false}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.roundBadge}>
          <Text style={s.roundText}>Round {roundIndex + 1} / {TOTAL_ROUNDS}</Text>
        </View>
        <View style={s.scoreBadge}>
          <StarIcon filled size={14} />
          <Text style={s.scoreText}>{score}</Text>
        </View>
      </View>

      {/* ── Mieo + Speech bubble ─────────────────────────────────────────────── */}
      <View style={s.charSection}>
        <MieoCharacter width={80 * SC} height={84 * SC} />
        <View style={s.bubble}>
          {/* Border triangle — drawn first so fill triangle covers its center */}
          <View style={s.bubbleTailBorder} />
          <View style={s.bubbleTailFill} />
          <Text style={s.bubbleText}>{bubbleText}</Text>
        </View>
      </View>

      {/* ── Hear word button ─────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={s.hearBtn}
        onPress={() => speakWord(currentWord.word)}
        activeOpacity={0.8}
      >
        <GameIconSound width={16} height={16} />
        <Text style={s.hearText}>{isSpeaking ? 'Playing...' : 'Tap to hear the word'}</Text>
      </TouchableOpacity>

      {/* ── Definition card ──────────────────────────────────────────────────── */}
      <View style={s.defCard}>
        <InfoIcon />
        <Text style={s.defText} numberOfLines={2}>{currentWord.definition}</Text>
      </View>

      {/* ── Letter boxes ─────────────────────────────────────────────────────── */}
      <View style={s.boxRow}>
        {currentWord.word.split('').map((_, i) => (
          <LetterBox key={i} letter={input[i] ?? ''} state={boxStates[i]} boxWidth={boxWidth} />
        ))}
      </View>

      {/* ── Hint ─────────────────────────────────────────────────────────────── */}
      {wrongAttempts >= 3 && (
        !hintVisible ? (
          <TouchableOpacity
            style={s.hintBtn}
            onPress={() => { setHintVisible(true); speakWord(getNativeHint(currentWord, nativeLanguage)); }}
          >
            <GameIconHint width={16} height={16} />
            <Text style={s.hintBtnText}>Show hint</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.hintCard}>
            <GameIconHint width={15} height={15} />
            <Text style={s.hintWord}>{getNativeHint(currentWord, nativeLanguage)}</Text>
          </View>
        )
      )}

      {/* ── Correct feedback ─────────────────────────────────────────────────── */}
      {phase === 'correct' && (
        <View style={s.feedbackRow}>
          <View style={[s.feedbackBadge, s.feedbackCorrect]}>
            <CheckIcon />
            <Text style={[s.feedbackText, { color: C.correct }]}>+{CP_PER_CORRECT} CP</Text>
          </View>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnCorrect]} onPress={nextRound} activeOpacity={0.85}>
            <Text style={s.actionBtnText}>{roundIndex + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Word'}</Text>
            <ArrowIcon />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Wrong feedback ───────────────────────────────────────────────────── */}
      {phase === 'wrong' && (
        <View style={s.feedbackRow}>
          <View style={[s.feedbackBadge, s.feedbackWrong]}>
            <XIcon />
            <Text style={[s.feedbackText, { color: C.wrong }]}>Try again!</Text>
          </View>
          <View style={s.wrongActions}>
            <TouchableOpacity style={[s.actionBtn, s.actionBtnRetry]} onPress={retryRound} activeOpacity={0.85}>
              <RefreshIcon size={15} color={C.accent} />
              <Text style={[s.actionBtnText, { color: C.accent }]}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnSkip]}
              onPress={() => { setInput(currentWord.word.toUpperCase().split('')); nextRound(); }}
              activeOpacity={0.85}
            >
              <Text style={[s.actionBtnText, { color: C.grey }]}>Skip</Text>
              <SkipIcon />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Keyboard ─────────────────────────────────────────────────────────── */}
      {phase === 'playing' && (
        <GameKeyboard
          onKey={handleKey}
          onBackspace={handleBackspace}
          disabled={input.length >= currentWord.word.length}
        />
      )}
    </ScrollView>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function LoadingView({ insetTop }: { insetTop: number }) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -16, duration: 500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0,   duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[s.centeredScreen, { paddingTop: insetTop }]}>
      <Animated.View style={{ transform: [{ translateY: bounce }] }}>
        <MieoCharacter width={100} height={104} />
      </Animated.View>
      <Text style={s.loadingText}>Loading words…</Text>
    </View>
  );
}

// ─── Ready ────────────────────────────────────────────────────────────────────

function ReadyView({
  ageGroup, onStart, insetTop, insetBottom,
}: {
  ageGroup: string;
  onStart: () => void;
  insetTop: number;
  insetBottom: number;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }).start();
  }, []);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[s.readyContent, { paddingTop: insetTop + 24, paddingBottom: insetBottom + 24 }]}
    >
      {/* Character */}
      <View style={{ alignItems: 'center' }}>
        <MieoCharacter width={110 * SC} height={115 * SC} />
      </View>

      {/* Speech bubble (centered, no tail on ready screen) */}
      <View style={s.readyBubble}>
        <Text style={s.readyBubbleText}>{"Let's practice\nspelling together! 🐝"}</Text>
      </View>

      {/* Info card */}
      <Animated.View style={[
        s.readyCard,
        {
          opacity: entrance,
          transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        <Text style={s.readyTitle}>Spelling Bee</Text>
        <Text style={s.readySub}>
          {ageGroup === 'strategist' ? 'Strategist Challenge' : 'Explorer Round'}
        </Text>
        <View style={s.readyDivider} />
        <ReadyStat label={`${TOTAL_ROUNDS} words to spell`} />
        <ReadyStat label={`${CP_PER_CORRECT} CP for each correct answer`} />
        <ReadyStat label="Words read aloud for you" />
        <ReadyStat label="Hints unlock after 3 tries" />
      </Animated.View>

      {/* Start button */}
      <TouchableOpacity
        onPress={onStart}
        onPressIn={()  => Animated.spring(btnScale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
        onPressOut={() => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
        activeOpacity={1}
        style={{ paddingHorizontal: 24 * SC }}
      >
        <Animated.View style={[s.startBtn, { transform: [{ scale: btnScale }] }]}>
          <Text style={s.startBtnText}>Start Round!</Text>
          <ArrowIcon size={20} />
        </Animated.View>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ReadyStat({ label }: { label: string }) {
  return (
    <View style={s.readyStatRow}>
      <View style={s.statDot} />
      <Text style={s.readyStatText}>{label}</Text>
    </View>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SummaryView({
  score, total, xpEarned, onPlayAgain, insetTop, insetBottom,
}: {
  score: number;
  total: number;
  xpEarned: number;
  onPlayAgain: () => void;
  insetTop: number;
  insetBottom: number;
}) {
  const starCount = score >= total * 0.9 ? 3 : score >= total * 0.6 ? 2 : score >= total * 0.3 ? 1 : 0;
  const entrance  = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }).start();
  }, []);

  const motivation =
    starCount === 3 ? "Outstanding! You're a spelling champion!" :
    starCount === 2 ? 'Great job! Keep practising!' :
    starCount === 1 ? 'Good effort! Try again to improve!' :
    "Keep practising — you'll get better!";

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[s.summaryContent, { paddingTop: insetTop + 24, paddingBottom: insetBottom + 24 }]}
    >
      <MieoCharacter width={110 * SC} height={115 * SC} />

      <Animated.View style={[
        s.summaryCard,
        {
          opacity: entrance,
          transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        },
      ]}>
        <Text style={s.summaryTitle}>Round Complete!</Text>

        <View style={s.starsRow}>
          {[1, 2, 3].map(n => <StarIcon key={n} filled={n <= starCount} size={34} />)}
        </View>

        <Text style={s.scoreDisplay}>
          {score}<Text style={s.scoreOf}> / {total}</Text>
        </Text>
        <Text style={s.scoreLabel}>words correct</Text>

        <View style={s.xpRow}>
          <StarIcon filled size={15} />
          <Text style={s.xpEarned}>+{xpEarned} CP earned</Text>
        </View>

        <Text style={s.motivation}>{motivation}</Text>
      </Animated.View>

      <TouchableOpacity
        onPress={onPlayAgain}
        onPressIn={()  => Animated.spring(btnScale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
        onPressOut={() => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
        activeOpacity={1}
        style={{ paddingHorizontal: 24 * SC, width: '100%' }}
      >
        <Animated.View style={[s.startBtn, { transform: [{ scale: btnScale }] }]}>
          <RefreshIcon size={20} />
          <Text style={s.startBtnText}>Play Again</Text>
        </Animated.View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },

  content: {
    paddingHorizontal: 20 * SC,
    paddingBottom: 16,
    gap: 10 * SC,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12 * SC,
  },
  roundBadge: {
    backgroundColor: C.accentBg,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14 * SC,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roundText:  { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.accent },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff8e0',
    borderWidth: 1,
    borderColor: '#f0d070',
    paddingHorizontal: 12 * SC,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: { fontFamily: FONTS.heading, fontSize: 13 * SC, color: C.gold },

  // Character + bubble row
  charSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10 * SC,
    paddingTop: 4 * SC,
  },
  bubble: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  // Two-layer CSS triangle tail (border + fill) pointing left toward Mieo
  bubbleTailBorder: {
    position: 'absolute',
    left: -12,
    top: 16,
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: C.border,
  },
  bubbleTailFill: {
    position: 'absolute',
    left: -9,
    top: 18,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: C.card,
  },
  bubbleText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13 * SC,
    color: C.dark,
    lineHeight: 20 * SC,
  },

  // Hear word button
  hearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: C.accentBg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 24,
    paddingHorizontal: 20 * SC,
    paddingVertical: 10,
  },
  hearText: { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.accent },

  // Definition card
  defCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f2',
    padding: 12 * SC,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  defText: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 12.5 * SC,
    color: C.grey,
    lineHeight: 18 * SC,
  },

  // Letter boxes
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },

  // Hint
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 18 * SC,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffdccb',
    backgroundColor: C.hintBg,
  },
  hintBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.hintFg },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: C.hintBg,
    borderRadius: 12,
    paddingHorizontal: 16 * SC,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ffdccb',
  },
  hintWord: { fontFamily: FONTS.heading, fontSize: 15 * SC, color: C.hintFg },

  // Feedback
  feedbackRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  feedbackBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12 * SC, paddingVertical: 7, borderRadius: 20 },
  feedbackCorrect: { backgroundColor: C.correctBg },
  feedbackWrong:   { backgroundColor: C.wrongBg },
  feedbackText:    { fontFamily: FONTS.heading, fontSize: 13 * SC },
  wrongActions:    { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14 * SC,
    paddingVertical: 9,
    borderRadius: 14,
  },
  actionBtnCorrect: { backgroundColor: C.correct },
  actionBtnRetry:   { borderWidth: 1.5, borderColor: C.border, backgroundColor: C.accentBg },
  actionBtnSkip:    { borderWidth: 1.5, borderColor: '#e3e6e8', backgroundColor: C.card },
  actionBtnText:    { fontFamily: FONTS.heading, fontSize: 13 * SC, color: 'white' },

  // Centered (loading)
  centeredScreen: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: { fontFamily: FONTS.body, fontSize: 14, color: C.grey },

  // Ready screen
  readyContent: {
    paddingHorizontal: 20 * SC,
    gap: 16 * SC,
  },
  readyBubble: {
    alignSelf: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 20 * SC,
    paddingVertical: 12,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  readyBubbleText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14 * SC,
    color: C.dark,
    textAlign: 'center',
    lineHeight: 22 * SC,
  },
  readyCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 20 * SC,
    gap: 10,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  readyTitle:   { fontFamily: FONTS.display, fontSize: 24 * SC, color: C.dark },
  readySub:     { fontFamily: FONTS.body, fontSize: 13 * SC, color: C.grey },
  readyDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  readyStatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent },
  readyStatText: { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.grey },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.accent,
    paddingVertical: 15,
    borderRadius: 28,
    shadowColor: '#1AA3D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: { fontFamily: FONTS.display, fontSize: 17 * SC, color: '#f5fcff' },

  // Summary screen
  summaryContent: {
    paddingHorizontal: 20 * SC,
    gap: 20 * SC,
    alignItems: 'center',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 24 * SC,
    alignItems: 'center',
    gap: 12,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: { fontFamily: FONTS.display, fontSize: 22 * SC, color: C.dark },
  starsRow:     { flexDirection: 'row', gap: 8 },
  scoreDisplay: { fontFamily: FONTS.display, fontSize: 52 * SC, color: C.accent },
  scoreOf:      { fontFamily: FONTS.body, fontSize: 28 * SC, color: C.grey },
  scoreLabel:   { fontFamily: FONTS.body, fontSize: 13 * SC, color: C.grey, marginTop: -8 },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff8e0',
    borderWidth: 1,
    borderColor: '#f0d070',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpEarned:   { fontFamily: FONTS.heading, fontSize: 14 * SC, color: C.gold },
  motivation: { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.grey, textAlign: 'center', lineHeight: 20 * SC },
});
