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
import { Ionicons } from '@expo/vector-icons';

import { BeeOwl } from '../../src/components/companion/BeeOwl';
import { WaveformVisualizer } from '../../src/components/companion/WaveformVisualizer';
import { LetterBox } from '../../src/components/spelling/LetterBox';
import { GameKeyboard } from '../../src/components/spelling/GameKeyboard';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { pickWords, getNativeHint } from '../../src/constants/wordBank';
import type { BeeWord } from '../../src/constants/wordBank';
import type { LetterBoxState } from '../../src/components/spelling/LetterBox';
import * as Speech from 'expo-speech';
import { stopSpeaking } from '../../src/services/voice/tts';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useQuestStore } from '../../src/store/useQuestStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'loading' | 'ready' | 'playing' | 'correct' | 'wrong' | 'summary';

const TOTAL_ROUNDS = 10;
const CP_PER_CORRECT = 15;
const SCREEN_W = Dimensions.get('window').width;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BeeScreen() {
  const insets = useSafeAreaInsets();
  const player      = usePlayerStore((s) => s.player);
  const addXP       = usePlayerStore((s) => s.addXP);
  const { nativeLanguage, ttsEnabled } = useSettingsStore();

  const ageGroup = player?.ageGroup ?? 'explorer';
  const incrementRound = useQuestStore((s) => s.incrementRound);

  const [words,        setWords]        = useState<BeeWord[]>([]);
  const [roundIndex,   setRoundIndex]   = useState(0);
  const [input,        setInput]        = useState<string[]>([]);
  const [phase,        setPhase]        = useState<GamePhase>('loading');
  const [score,        setScore]        = useState(0);
  const [xpEarned,     setXpEarned]     = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);  // hint unlocks at 3
  const [hintVisible,   setHintVisible]   = useState(false);
  const [isSpeaking,    setIsSpeaking]    = useState(false);
  const [streak,        setStreak]        = useState(0);
  const [showStreak,    setShowStreak]    = useState(false);

  const currentWord = words[roundIndex];

  // ─── Init ─────────────────────────────────────────────────────────────────

  const loadWords = useCallback(() => {
    // TODO: endpoint /kids/ai/generate-spelling-round
    // Try Flask first, fall back to static bank on failure:
    //   generateSpellingRound({ level: player.level, nativeLanguage, count: TOTAL_ROUNDS }, token)
    //   .then(res => map res.words to BeeWord[])
    //   .catch(() => useStaticBank())
    const staticWords = pickWords(ageGroup, TOTAL_ROUNDS);
    setWords(staticWords);
    setRoundIndex(0);
    setInput([]);
    setScore(0);
    setXpEarned(0);
    setHintVisible(false);
    setStreak(0);
    setShowStreak(false);
    setPhase('ready');
  }, [ageGroup]);

  useEffect(() => {
    loadWords();
  }, []);

  // ─── Speak current word ───────────────────────────────────────────────────

  const speakWord = useCallback((word: string) => {
    if (!ttsEnabled) return;
    // Stop first, then wait a tick before starting — avoids the Android race condition
    // where Speech.stop() arrives after Speech.speak() and silences it.
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

  // Auto-speak on entering playing phase with a new word
  useEffect(() => {
    if (phase === 'playing' && currentWord) {
      speakWord(`Spell the word. ${currentWord.word}`);
    }
    if (phase !== 'playing') {
      Speech.stop().catch(() => {});
      setIsSpeaking(false);
    }
  // speakWord is stable (useCallback with ttsEnabled dep); roundIndex drives word change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex, speakWord]);

  // ─── Idle nudge — repeat word prompt if no input after 4 s ──────────────────
  useEffect(() => {
    if (phase !== 'playing' || input.length > 0 || !currentWord) return;
    const t = setTimeout(() => {
      speakWord(`Can you spell it? ${currentWord.word}`);
    }, 4000);
    return () => clearTimeout(t);
  }, [phase, roundIndex, input.length]);

  // ─── Input handling ───────────────────────────────────────────────────────

  function handleKey(letter: string) {
    if (phase !== 'playing' || !currentWord) return;
    if (input.length >= currentWord.word.length) return;
    setInput(prev => [...prev, letter]);
  }

  function handleBackspace() {
    if (phase !== 'playing') return;
    setInput(prev => prev.slice(0, -1));
  }

  // Auto-submit when all boxes are filled
  useEffect(() => {
    if (phase === 'playing' && currentWord && input.length === currentWord.word.length) {
      checkAnswer();
    }
  }, [input]);

  // ─── Answer check ─────────────────────────────────────────────────────────

  function checkAnswer() {
    if (!currentWord) return;
    const attempt = input.join('').toLowerCase();
    const correct  = currentWord.word.toLowerCase();

    if (attempt === correct) {
      setPhase('correct');
      setScore(s => s + 1);
      const gained = CP_PER_CORRECT;
      setXpEarned(x => x + gained);
      addXP(gained);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > 0 && newStreak % 5 === 0) {
        setShowStreak(true);
        speakWord(`${newStreak} in a row! Amazing!`);
      } else {
        speakWord('Amazing! You got it right!');
      }
    } else {
      setPhase('wrong');
      setWrongAttempts(n => n + 1);
      setStreak(0);
      speakWord('Oops! Give it another try!');
    }
  }

  // ─── Navigation between rounds ────────────────────────────────────────────

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      incrementRound();
      setPhase('summary');
      // TODO: endpoint /kids/leaderboard/spelling
      // apiClient.post('/kids/leaderboard/spelling', { playerId: player?.id, score, total: TOTAL_ROUNDS }, token)
      //   .catch(() => { /* offline — queue for sync */ });
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

  // ─── Render phases ────────────────────────────────────────────────────────

  if (phase === 'loading') return <LoadingView insetTop={insets.top} />;
  if (phase === 'ready')   return <ReadyView ageGroup={ageGroup} onStart={() => setPhase('playing')} insetTop={insets.top} />;
  if (phase === 'summary') return (
    <SummaryView
      score={score}
      total={TOTAL_ROUNDS}
      xpEarned={xpEarned}
      onPlayAgain={loadWords}
      insetTop={insets.top}
    />
  );

  if (!currentWord) return null;

  // ─── Compute letter box size based on word length ─────────────────────────
  const available = SCREEN_W - SPACING.lg * 4; // horizontal padding
  const gap = 8;
  const wordLen = currentWord.word.length;
  const rawBoxW = (available - gap * (wordLen - 1)) / wordLen;
  const boxWidth = Math.min(52, Math.max(32, Math.floor(rawBoxW)));

  // ─── Box states ───────────────────────────────────────────────────────────
  const boxStates: LetterBoxState[] = currentWord.word.split('').map((_, i) => {
    if (phase === 'correct')  return 'correct';
    if (phase === 'wrong')    return i < input.length ? 'wrong' : 'empty';
    return input[i] ? 'filled' : 'empty';
  });

  const owlMood = phase === 'correct' ? 'happy'
    : phase === 'wrong'   ? 'hint'
    : isSpeaking          ? 'speaking'
    : 'idle';

  const bubbleText =
    phase === 'correct'            ? 'Amazing! You got it right!'
    : phase === 'wrong' && wrongAttempts >= 3 ? 'Need a hint? I can help!'
    : phase === 'wrong'            ? 'Oops! Give it another try!'
    : isSpeaking                   ? 'Listen carefully...'
    : input.length > 0             ? 'Keep going, you\'ve got this!'
    : 'Can you spell the word?';

  const bubbleColor =
    phase === 'correct' ? COLORS.semantic.correct + '22'
    : phase === 'wrong' ? COLORS.semantic.wrong + '18'
    : COLORS.brand.primary + '18';

  const bubbleBorder =
    phase === 'correct' ? COLORS.semantic.correct + '66'
    : phase === 'wrong' ? COLORS.semantic.wrong + '55'
    : COLORS.brand.primary + '44';

  const bubbleTextColor =
    phase === 'correct' ? COLORS.semantic.correct
    : phase === 'wrong' ? COLORS.semantic.wrong
    : COLORS.brand.primary;

  return (
  <View style={styles.screen}>
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.gameContent, { paddingTop: insets.top + SPACING.sm }]}
      keyboardShouldPersistTaps="always"
      scrollEnabled={false}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.roundBadge}>
          <Ionicons name="grid-outline" size={14} color={COLORS.brand.primary} />
          <Text style={styles.roundText}>Round {roundIndex + 1} / {TOTAL_ROUNDS}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Ionicons name="star" size={14} color={COLORS.semantic.gold} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* ── Character + Speech bubble ────────────────────────────────────── */}
      <View style={styles.characterSection}>
        {/* Speech bubble */}
        <View style={[styles.bubble, { backgroundColor: bubbleColor, borderColor: bubbleBorder }]}>
          {isSpeaking && <WaveformVisualizer active={isSpeaking} />}
          <Text style={[styles.bubbleText, { color: bubbleTextColor }]}>{bubbleText}</Text>
          {/* Bubble tail pointing down-left toward owl */}
          <View style={[styles.bubbleTail, { borderTopColor: bubbleBorder }]} />
          <View style={[styles.bubbleTailInner, { borderTopColor: bubbleColor }]} />
        </View>

        {/* Owl centered */}
        <View style={styles.owlWrap}>
          <BeeOwl mood={owlMood} size={130} />
          {/* Hear word button below owl */}
          <TouchableOpacity
            style={styles.hearBtn}
            onPress={() => speakWord(`The word is. ${currentWord.word}`)}
            activeOpacity={0.75}
          >
            <Ionicons name="volume-high" size={16} color={COLORS.brand.primary} />
            <Text style={styles.hearText}>Hear it again</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Definition ────────────────────────────────────────────────────── */}
      <View style={styles.defCard}>
        <Ionicons name="book-outline" size={15} color={COLORS.text.muted} style={{ marginTop: 1 }} />
        <Text style={styles.defText}>{currentWord.definition}</Text>
      </View>

      {/* ── Letter boxes ──────────────────────────────────────────────────── */}
      <View style={styles.boxRow}>
        {currentWord.word.split('').map((_, i) => (
          <LetterBox
            key={i}
            letter={input[i] ?? ''}
            state={boxStates[i]}
            boxWidth={boxWidth}
          />
        ))}
      </View>

      {/* ── Hint — unlocks after 3 wrong attempts ─────────────────────────── */}
      {wrongAttempts >= 3 && (
        !hintVisible ? (
          <TouchableOpacity
            style={styles.hintBtn}
            onPress={() => {
              setHintVisible(true);
              speakWord(getNativeHint(currentWord, nativeLanguage));
            }}
          >
            <Ionicons name="bulb-outline" size={16} color={COLORS.semantic.gold} />
            <Text style={styles.hintBtnText}>Show hint</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.hintCard}>
            <Ionicons name="language" size={15} color={COLORS.semantic.gold} />
            <Text style={styles.hintWord}>{getNativeHint(currentWord, nativeLanguage)}</Text>
          </View>
        )
      )}

      {/* ── Feedback actions ─────────────────────────────────────────────── */}
      {phase === 'correct' && (
        <View style={styles.feedbackRow}>
          <View style={[styles.feedbackBadge, styles.feedbackCorrect]}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.semantic.correct} />
            <Text style={[styles.feedbackText, { color: COLORS.semantic.correct }]}>+{CP_PER_CORRECT} CP</Text>
          </View>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnCorrect]} onPress={nextRound}>
            <Text style={styles.actionBtnText}>
              {roundIndex + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Word'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {phase === 'wrong' && (
        <View style={styles.feedbackRow}>
          <View style={[styles.feedbackBadge, styles.feedbackWrong]}>
            <Ionicons name="close-circle" size={18} color={COLORS.semantic.wrong} />
            <Text style={[styles.feedbackText, { color: COLORS.semantic.wrong }]}>Try again!</Text>
          </View>
          <View style={styles.wrongActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnRetry]} onPress={retryRound}>
              <Ionicons name="refresh" size={16} color={COLORS.brand.primary} />
              <Text style={[styles.actionBtnText, { color: COLORS.brand.primary }]}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSkip]} onPress={() => {
              setInput(currentWord.word.toUpperCase().split(''));
              nextRound();
            }}>
              <Text style={[styles.actionBtnText, { color: COLORS.text.muted }]}>Skip</Text>
              <Ionicons name="play-skip-forward" size={16} color={COLORS.text.muted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Keyboard ──────────────────────────────────────────────────────── */}
      {phase === 'playing' && (
        <GameKeyboard
          onKey={handleKey}
          onBackspace={handleBackspace}
          disabled={input.length >= currentWord.word.length}
        />
      )}
    </ScrollView>

    {/* ── Icon burst on correct ─────────────────────────────────────────── */}
    {phase === 'correct' && <CelebrationBurst key={`burst-${roundIndex}`} />}

    {/* ── Streak overlay every 5 in a row ──────────────────────────────── */}
    {showStreak && (
      <StreakOverlay
        streak={streak}
        onDone={() => setShowStreak(false)}
      />
    )}
  </View>
  );
}

// ─── Celebration burst — icon particles on correct answer ─────────────────────

const BURST_ICONS: Array<React.ComponentProps<typeof Ionicons>['name']> = [
  'star', 'heart', 'sparkles', 'star', 'trophy', 'heart', 'star', 'ribbon', 'sparkles', 'star',
];
const BURST_COLORS = ['#FFD700','#FF6B6B','#A78BFA','#34D399','#60A5FA','#F97316','#EC4899','#FFD700','#A78BFA','#34D399'];

function CelebrationBurst() {
  const particles = useRef(
    Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const dist  = 70 + (i % 3) * 35;
      return {
        progress: new Animated.Value(0),
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 40,
        icon:  BURST_ICONS[i],
        color: BURST_COLORS[i],
        size:  i % 3 === 0 ? 28 : 20,
      };
    })
  ).current;

  useEffect(() => {
    Animated.stagger(40, particles.map((p) =>
      Animated.timing(p.progress, { toValue: 1, duration: 700, useNativeDriver: true })
    )).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            opacity: p.progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 0] }),
            transform: [
              { translateX: p.progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.tx] }) },
              { translateY: p.progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.ty] }) },
              { scale:      p.progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 1.4, 0.8] }) },
            ],
          }}
        >
          <Ionicons name={p.icon} size={p.size} color={p.color} />
        </Animated.View>
      ))}
    </View>
  );
}

// ─── Streak overlay — big cheer every 5 in a row ──────────────────────────────

function StreakOverlay({ streak, onDone }: { streak: number; onDone: () => void }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 0.7, tension: 100, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.streakOverlay, { opacity }]}>
      <Animated.View style={[styles.streakCard, { transform: [{ scale }] }]}>
        <BeeOwl mood="happy" size={110} />
        <View style={styles.streakTrophyRow}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
          <Text style={styles.streakCount}>{streak}</Text>
          <Ionicons name="trophy" size={32} color="#FFD700" />
        </View>
        <Text style={styles.streakTitle}>in a row!</Text>
        <Text style={styles.streakSub}>You're on fire! Keep going!</Text>
        <View style={styles.streakStars}>
          {[1,2,3,4,5].map(n => (
            <Ionicons key={n} name="star" size={22} color="#FFD700" />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingView({ insetTop }: { insetTop: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.centeredScreen, { paddingTop: insetTop }]}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons name="sync-outline" size={40} color={COLORS.brand.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>Loading words…</Text>
    </View>
  );
}

// ─── Ready screen ─────────────────────────────────────────────────────────────

function ReadyView({
  ageGroup,
  onStart,
  insetTop,
}: {
  ageGroup: string;
  onStart: () => void;
  insetTop: number;
}) {
  const cardScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale,   { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.centeredScreen, { paddingTop: insetTop }]}>
      {/* Owl with intro speech bubble */}
      <View style={styles.readyCharWrap}>
        <Animated.View style={[styles.readyBubble, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
          <Text style={styles.readyBubbleText}>
            {ageGroup === 'strategist'
              ? 'Ready for the challenge? I\'ll say a word — you spell it!'
              : 'Hi! I\'ll say a word and you spell it. Ready?'}
          </Text>
          <View style={[styles.bubbleTail, { borderTopColor: COLORS.brand.primary + '44' }]} />
          <View style={[styles.bubbleTailInner, { borderTopColor: COLORS.bg.card }]} />
        </Animated.View>
        <BeeOwl mood="happy" size={140} />
      </View>

      <Animated.View style={[styles.readyCard, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
        <Text style={styles.readyTitle}>Spelling Bee</Text>
        <View style={styles.readyStats}>
          <ReadyStat icon="grid-outline"   label={`${TOTAL_ROUNDS} words to spell`} />
          <ReadyStat icon="star-outline"   label={`${CP_PER_CORRECT} CP for each correct`} />
          <ReadyStat icon="volume-high"    label="I'll read each word aloud" />
          <ReadyStat icon="bulb-outline"   label="Hints unlock after 3 tries" />
        </View>
      </Animated.View>

      <TouchableOpacity
        onPress={onStart}
        onPressIn={() => Animated.spring(btnScale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
        onPressOut={() => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
        activeOpacity={1}
      >
        <Animated.View style={[styles.startBtn, { transform: [{ scale: btnScale }] }]}>
          <Text style={styles.startBtnText}>Let's Go!</Text>
          <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

function ReadyStat({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.readyStatRow}>
      <Ionicons name={icon} size={16} color={COLORS.brand.primary} />
      <Text style={styles.readyStatText}>{label}</Text>
    </View>
  );
}

// ─── Summary screen ───────────────────────────────────────────────────────────

function SummaryView({
  score, total, xpEarned, onPlayAgain, insetTop,
}: {
  score: number;
  total: number;
  xpEarned: number;
  onPlayAgain: () => void;
  insetTop: number;
}) {
  const starCount = score >= total * 0.9 ? 3 : score >= total * 0.6 ? 2 : score >= total * 0.3 ? 1 : 0;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }).start();
  }, []);

  const btnScale = useRef(new Animated.Value(1)).current;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.summaryContent, { paddingTop: insetTop + SPACING.lg }]}
    >
      <BeeOwl mood={starCount >= 2 ? 'happy' : 'idle'} size={120} />

      <Animated.View
        style={[
          styles.summaryCard,
          {
            opacity: entrance,
            transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          },
        ]}
      >
        <Text style={styles.summaryTitle}>Round Complete!</Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map(n => (
            <Ionicons
              key={n}
              name={n <= starCount ? 'star' : 'star-outline'}
              size={36}
              color={n <= starCount ? COLORS.semantic.gold : COLORS.bg.border}
            />
          ))}
        </View>

        {/* Score */}
        <Text style={styles.scoreDisplay}>
          {score} <Text style={styles.scoreOf}>/ {total}</Text>
        </Text>
        <Text style={styles.scoreLabel}>words correct</Text>

        {/* XP */}
        <View style={styles.xpRow}>
          <Ionicons name="flash" size={18} color={COLORS.semantic.gold} />
          <Text style={styles.xpEarned}>+{xpEarned} CP earned</Text>
        </View>

        {/* Motivational message */}
        <Text style={styles.motivation}>
          {starCount === 3 ? 'Outstanding! You\'re a spelling champion!' :
           starCount === 2 ? 'Great job! Keep practising!' :
           starCount === 1 ? 'Good effort! Try again to improve!' :
           'Keep practising — you\'ll get better!'}
        </Text>
      </Animated.View>

      {/* Buttons */}
      <TouchableOpacity
        onPress={onPlayAgain}
        onPressIn={() => Animated.spring(btnScale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
        onPressOut={() => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
        activeOpacity={1}
      >
        <Animated.View style={[styles.startBtn, { transform: [{ scale: btnScale }] }]}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.startBtnText}>Play Again</Text>
        </Animated.View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.bg.primary },
  flex:    { flex: 1 },

  // ── Streak overlay
  streakOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  streakCard: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: '#FFD700' + '55',
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    width: '80%',
    ...SHADOWS.lg,
  },
  streakTrophyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  streakCount:     { fontFamily: FONTS.display, fontSize: 56, color: '#FFD700', lineHeight: 64 },
  streakTitle:     { fontFamily: FONTS.display, fontSize: 28, color: COLORS.text.primary },
  streakSub:       { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
  streakStars:     { flexDirection: 'row', gap: SPACING.sm },

  // ── Game layout
  gameContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.brand.primary + '22',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  roundText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.brand.primary },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#3d2e00',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  scoreText: { fontFamily: FONTS.heading, fontSize: 14, color: COLORS.semantic.gold },

  // ── Character section
  characterSection: {
    alignItems: 'center',
    gap: 0,
  },
  bubble: {
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    maxWidth: '88%',
    position: 'relative',
  },
  bubbleText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  // CSS triangle pointing down toward owl
  bubbleTail: {
    position: 'absolute',
    bottom: -13,
    alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 13,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  bubbleTailInner: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  owlWrap: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  hearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.brand.primary + '18',
    borderWidth: 1,
    borderColor: COLORS.brand.primary + '44',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  hearText: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.brand.primary },

  // Definition
  defCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    padding: SPACING.md,
  },
  defText: { flex: 1, fontFamily: FONTS.body, fontSize: 13, color: COLORS.text.muted, lineHeight: 19 },

  // Letter boxes
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.sm,
  },

  // Hint
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.semantic.gold + '55',
    backgroundColor: '#3d2e00',
  },
  hintBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.semantic.gold },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    alignSelf: 'center',
    backgroundColor: '#3d2e00',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.semantic.gold + '44',
  },
  hintWord: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.semantic.gold },

  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  feedbackCorrect: { backgroundColor: COLORS.semantic.correct + '22' },
  feedbackWrong:   { backgroundColor: COLORS.semantic.wrong + '22' },
  feedbackText:    { fontFamily: FONTS.heading, fontSize: 14 },
  wrongActions:    { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    borderRadius: RADIUS.lg,
  },
  actionBtnCorrect: { backgroundColor: COLORS.semantic.correct },
  actionBtnRetry:   { borderWidth: 1.5, borderColor: COLORS.brand.primary + '66', backgroundColor: COLORS.brand.primary + '15' },
  actionBtnSkip:    { borderWidth: 1.5, borderColor: COLORS.bg.border },
  actionBtnText:    { fontFamily: FONTS.heading, fontSize: 14, color: '#fff' },

  // ── Centered screens (loading, ready)
  centeredScreen: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.text.muted },

  // Ready
  readyCharWrap: {
    alignItems: 'center',
    gap: 0,
  },
  readyBubble: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.brand.primary + '44',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    maxWidth: '90%',
    position: 'relative',
    marginBottom: 8,
    ...SHADOWS.sm,
  },
  readyBubbleText: {
    fontFamily: FONTS.display,
    fontSize: 15,
    color: COLORS.brand.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  readyCard: {
    width: '100%',
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  readyTitle: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text.primary },
  readyStats: { width: '100%', gap: SPACING.sm },
  readyStatRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  readyStatText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.text.muted },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  startBtnText: { fontFamily: FONTS.heading, fontSize: 18, color: '#fff' },

  // ── Summary
  summaryContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.xl,
    alignItems: 'center',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.lg,
    ...SHADOWS.md,
  },
  summaryTitle: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text.primary },
  starsRow:     { flexDirection: 'row', gap: SPACING.md },
  scoreDisplay: { fontFamily: FONTS.display, fontSize: 52, color: COLORS.brand.primary },
  scoreOf:      { fontFamily: FONTS.body, fontSize: 28, color: COLORS.text.muted },
  scoreLabel:   { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text.muted, marginTop: -SPACING.lg },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#3d2e00',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  xpEarned:    { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.semantic.gold },
  motivation:  {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
