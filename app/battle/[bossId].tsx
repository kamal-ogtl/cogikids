import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { getBossById, getBossQuestions, type Boss, type BattleQuestion } from '../../src/constants/bosses';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useProgressStore } from '../../src/store/useProgressStore';
import { NumborrChar, LexiChar, ScorpChar, RexChar } from '../../src/components/characters/BossCharacters';
import { playSound } from '../../src/utils/sounds';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_QUESTIONS = 10;
const TIMER_SECS = 10;

const BOSS_CHARS = {
  numbor: NumborrChar,
  lexi:   LexiChar,
  scorp:  ScorpChar,
  rex:    RexChar,
} as const;

// Kahoot-style answer colors
const ANSWER_COLORS = ['#1d4ed8', '#be123c', '#a16207', '#15803d'];
const ANSWER_ICONS: React.ComponentProps<typeof Ionicons>['name'][] = [
  'triangle', 'diamond', 'square', 'ellipse',
];

type Phase = 'ready' | 'battle' | 'win' | 'lose';

export default function BossBattleScreen() {
  const { bossId }   = useLocalSearchParams<{ bossId: string }>();
  const insets       = useSafeAreaInsets();
  const router       = useRouter();
  const player         = usePlayerStore((s) => s.player);
  const addXP          = usePlayerStore((s) => s.addXP);
  const markBossBeaten = useProgressStore((s) => s.markBossBeaten);

  const boss = getBossById(bossId ?? '');

  const [phase, setPhase]       = useState<Phase>('ready');
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [qIdx, setQIdx]         = useState(0);
  const [playerHP, setPlayerHP] = useState(3);
  const [bossHP, setBossHP]     = useState(boss?.hp ?? 5);
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Timer
  const timerAnim    = useRef(new Animated.Value(1)).current;
  const timerRunning = useRef<Animated.CompositeAnimation | null>(null);

  // Boss animations
  const bossShakeX = useRef(new Animated.Value(0)).current;
  const bossFlash  = useRef(new Animated.Value(0)).current;
  const bossScale  = useRef(new Animated.Value(1)).current;

  // Screen flash on player hit
  const screenFlash = useRef(new Animated.Value(0)).current;

  // Entrance animation (ready phase)
  const readyAnim = useRef(new Animated.Value(0)).current;

  // Win/Lose overlay
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // ── Load questions on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!boss) return;
    const qs = getBossQuestions(boss.subject, player?.ageGroup ?? 'explorer').slice(0, MAX_QUESTIONS);
    setQuestions(qs);
    setBossHP(boss.hp);
  }, [boss?.id]);

  // ── Ready phase entrance ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'ready') {
      readyAnim.setValue(0);
      Animated.spring(readyAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }).start();
    }
    if (phase === 'win' || phase === 'lose') {
      overlayAnim.setValue(0);
      Animated.spring(overlayAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }).start();
      if (phase === 'win') {
        playSound('complete');
        addXP(boss?.rewardCP ?? 0);
        if (boss) markBossBeaten(boss.id);
      }
    }
  }, [phase]);

  // ── Timer management ─────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    timerAnim.setValue(1);
    timerRunning.current = Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIMER_SECS * 1000,
      useNativeDriver: false,
    });
    timerRunning.current.start(({ finished }) => {
      if (finished) handleTimeout();
    });
  }, [qIdx, playerHP, bossHP]);

  const stopTimer = useCallback(() => {
    timerRunning.current?.stop();
  }, []);

  useEffect(() => {
    if (phase === 'battle' && selected === null && !timedOut && questions.length > 0) {
      startTimer();
      return () => { stopTimer(); };
    }
  }, [phase, qIdx]);

  // ── Boss animations ───────────────────────────────────────────────────────
  function shakeBoss() {
    Animated.sequence([
      Animated.timing(bossShakeX, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: 14,  duration: 55, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: -8,  duration: 55, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: 8,   duration: 55, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  }

  function flashBoss() {
    Animated.sequence([
      Animated.timing(bossFlash, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(bossFlash, { toValue: 0, duration: 70, useNativeDriver: true }),
      Animated.timing(bossFlash, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(bossFlash, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  }

  function bounceBoss() {
    Animated.sequence([
      Animated.timing(bossScale, { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.timing(bossScale, { toValue: 0.9,  duration: 80,  useNativeDriver: true }),
      Animated.timing(bossScale, { toValue: 1,    duration: 80,  useNativeDriver: true }),
    ]).start();
  }

  function flashScreen() {
    Animated.sequence([
      Animated.timing(screenFlash, { toValue: 0.5, duration: 80,  useNativeDriver: true }),
      Animated.timing(screenFlash, { toValue: 0,   duration: 250, useNativeDriver: true }),
    ]).start();
  }

  // ── Answer handling ───────────────────────────────────────────────────────
  function handleTimeout() {
    stopTimer();
    setTimedOut(true);
    setSelected(-1); // no option selected = timeout = wrong
    playSound('wrong');
    bounceBoss();
    const nextHP = playerHP - 1;
    setPlayerHP(nextHP);
    flashScreen();
    setTimeout(() => advanceQuestion(nextHP, bossHP), 1200);
  }

  function handleAnswer(idx: number) {
    if (selected !== null || timedOut) return;
    stopTimer();
    setSelected(idx);

    const q = questions[qIdx];
    if (idx === q.correct) {
      // Correct — damage boss
      playSound('correct');
      shakeBoss();
      flashBoss();
      const nextBossHP = bossHP - 1;
      setBossHP(nextBossHP);
      setTimeout(() => advanceQuestion(playerHP, nextBossHP), 900);
    } else {
      // Wrong — damage player
      playSound('wrong');
      bounceBoss();
      const nextHP = playerHP - 1;
      setPlayerHP(nextHP);
      flashScreen();
      setTimeout(() => advanceQuestion(nextHP, bossHP), 900);
    }
  }

  function advanceQuestion(curPlayerHP: number, curBossHP: number) {
    if (curBossHP <= 0) { setPhase('win');  return; }
    if (curPlayerHP <= 0) { setPhase('lose'); return; }

    const nextIdx = qIdx + 1;
    if (nextIdx >= questions.length) {
      // Ran out of questions — boss wins if it has HP left
      setPhase(curBossHP <= 0 ? 'win' : 'lose');
      return;
    }
    setSelected(null);
    setTimedOut(false);
    setQIdx(nextIdx);
  }

  // ── Early exits ───────────────────────────────────────────────────────────
  if (!boss) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorTxt}>Boss not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnTxt, { color: COLORS.brand.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const BossChar = BOSS_CHARS[boss.id as keyof typeof BOSS_CHARS];
  const q = questions[qIdx];

  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
  });
  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: boss.bgColor }]}>
      {/* Red screen flash on player hit */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#ef4444', opacity: screenFlash, zIndex: 999 }]}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text.muted} />
        </TouchableOpacity>
        <Text style={styles.arenaLabel}>Battle Arena</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── READY PHASE ────────────────────────────────────────────────── */}
      {phase === 'ready' && (
        <Animated.View
          style={[
            styles.readyContainer,
            {
              opacity: readyAnim,
              transform: [{ scale: readyAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
            },
          ]}
        >
          <View style={[styles.readyBossGlow, { backgroundColor: boss.color + '18' }]} />

          <Text style={[styles.readyVs, { color: boss.color }]}>BOSS BATTLE</Text>

          <View style={styles.readyCharWrap}>
            {BossChar && <BossChar size={180} />}
          </View>

          <Text style={[styles.readyBossName, { color: boss.color }]}>{boss.name}</Text>
          <Text style={styles.readyBossTitle}>{boss.title}</Text>
          <Text style={styles.readyTagline}>"{boss.tagline}"</Text>

          <View style={styles.readyMeta}>
            <View style={[styles.readyMetaChip, { backgroundColor: boss.color + '22' }]}>
              <Ionicons name="heart" size={13} color={COLORS.semantic.wrong} />
              <Text style={[styles.readyMetaTxt, { color: COLORS.text.muted }]}>{boss.hp} HP</Text>
            </View>
            <View style={[styles.readyMetaChip, { backgroundColor: COLORS.semantic.gold + '22' }]}>
              <Ionicons name="star" size={13} color={COLORS.semantic.gold} />
              <Text style={[styles.readyMetaTxt, { color: COLORS.text.muted }]}>{boss.rewardCP} CP reward</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.fightBtn, { backgroundColor: boss.color }]}
            onPress={() => { playSound('tap'); setPhase('battle'); }}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.fightBtnTxt}>Tap to Fight!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── BATTLE PHASE ───────────────────────────────────────────────── */}
      {phase === 'battle' && q && (
        <View style={styles.battleContainer}>
          {/* Health row */}
          <View style={styles.healthRow}>
            {/* Player hearts */}
            <View style={styles.heartsWrap}>
              {[0, 1, 2].map((i) => (
                <Ionicons
                  key={i}
                  name={i < playerHP ? 'heart' : 'heart-outline'}
                  size={22}
                  color={i < playerHP ? COLORS.semantic.wrong : COLORS.bg.border}
                />
              ))}
            </View>

            {/* VS divider */}
            <Text style={styles.vsLabel}>VS</Text>

            {/* Boss HP bar */}
            <View style={styles.bossHPWrap}>
              <Text style={[styles.bossHPName, { color: boss.color }]}>{boss.name}</Text>
              <View style={styles.bossHPTrack}>
                <View
                  style={[
                    styles.bossHPFill,
                    {
                      backgroundColor: boss.color,
                      width: `${(bossHP / (boss?.hp ?? 5)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.bossHPCount}>{bossHP}/{boss.hp}</Text>
            </View>
          </View>

          {/* Boss character */}
          <View style={styles.bossStage}>
            <Animated.View
              style={{
                transform: [
                  { translateX: bossShakeX },
                  { scale: bossScale },
                ],
              }}
            >
              <Animated.View style={{ opacity: bossFlash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }}>
                {BossChar && <BossChar size={140} />}
              </Animated.View>
            </Animated.View>
          </View>

          {/* Timer bar */}
          <View style={styles.timerWrap}>
            <Animated.View style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
          </View>

          {/* Question card */}
          <View style={[styles.questionCard, { borderColor: boss.color + '33' }]}>
            <Text style={styles.questionCounter}>
              Question {qIdx + 1} / {Math.min(questions.length, MAX_QUESTIONS)}
            </Text>
            <Text style={styles.questionTxt}>{q.question}</Text>
          </View>

          {/* Answer grid */}
          <View style={styles.answerGrid}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = selected === i;
              const revealed = selected !== null || timedOut;

              let bgColor = ANSWER_COLORS[i] + 'cc';
              let borderColor = ANSWER_COLORS[i];
              let textColor = '#fff';
              let opacityVal = 1;

              if (revealed) {
                if (isCorrect) {
                  bgColor = COLORS.semantic.correct + 'dd';
                  borderColor = COLORS.semantic.correct;
                } else if (isSelected) {
                  bgColor = COLORS.semantic.wrong + 'dd';
                  borderColor = COLORS.semantic.wrong;
                } else {
                  opacityVal = 0.35;
                }
              }

              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.85}
                  disabled={selected !== null || timedOut}
                  style={[styles.answerBtn, { backgroundColor: bgColor, borderColor, opacity: opacityVal }]}
                  onPress={() => handleAnswer(i)}
                >
                  <Ionicons name={ANSWER_ICONS[i]} size={14} color={textColor} />
                  <Text style={[styles.answerTxt, { color: textColor }]}>{opt}</Text>
                  {revealed && isCorrect && (
                    <Ionicons name="checkmark-circle" size={18} color="#fff" style={styles.answerCheck} />
                  )}
                  {revealed && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={18} color="#fff" style={styles.answerCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Timeout message */}
          {timedOut && !selected && (
            <Text style={styles.timeoutTxt}>Time's up!</Text>
          )}
        </View>
      )}

      {/* ── WIN OVERLAY ────────────────────────────────────────────────── */}
      {phase === 'win' && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnim,
              transform: [{ translateY: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
            },
          ]}
        >
          <View style={[styles.overlayCard, { borderColor: COLORS.semantic.gold + '55' }]}>
            <View style={[styles.overlayIconWrap, { backgroundColor: COLORS.semantic.gold + '22' }]}>
              <Ionicons name="trophy" size={48} color={COLORS.semantic.gold} />
            </View>
            <Text style={[styles.overlayTitle, { color: COLORS.semantic.gold }]}>Victory!</Text>
            <Text style={styles.overlaySubtitle}>
              You defeated {boss.name}!
            </Text>
            <View style={styles.overlayReward}>
              <Ionicons name="star" size={18} color={COLORS.semantic.gold} />
              <Text style={[styles.overlayRewardTxt, { color: COLORS.semantic.gold }]}>
                +{boss.rewardCP} CP earned
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.overlayBtn, { backgroundColor: COLORS.semantic.gold }]}
              onPress={() => router.back()}
            >
              <Text style={styles.overlayBtnTxt}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── LOSE OVERLAY ───────────────────────────────────────────────── */}
      {phase === 'lose' && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnim,
              transform: [{ translateY: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
            },
          ]}
        >
          <View style={[styles.overlayCard, { borderColor: COLORS.semantic.wrong + '55' }]}>
            <View style={[styles.overlayIconWrap, { backgroundColor: COLORS.semantic.wrong + '22' }]}>
              <Ionicons name="skull" size={48} color={COLORS.semantic.wrong} />
            </View>
            <Text style={[styles.overlayTitle, { color: COLORS.semantic.wrong }]}>Defeated!</Text>
            <Text style={styles.overlaySubtitle}>
              {boss.name} was too strong this time.{'\n'}Study more and try again!
            </Text>
            <View style={styles.overlayActions}>
              <TouchableOpacity
                style={[styles.overlayBtn, { backgroundColor: COLORS.bg.cardAlt, flex: 1 }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.overlayBtnTxt, { color: COLORS.text.muted }]}>Retreat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.overlayBtn, { backgroundColor: COLORS.semantic.wrong, flex: 1 }]}
                onPress={() => {
                  setPhase('ready');
                  setQIdx(0);
                  setPlayerHP(3);
                  setBossHP(boss.hp);
                  setSelected(null);
                  setTimedOut(false);
                  const qs = getBossQuestions(boss.subject, player?.ageGroup ?? 'explorer').slice(0, MAX_QUESTIONS);
                  setQuestions(qs);
                }}
              >
                <Ionicons name="refresh" size={15} color="#fff" />
                <Text style={styles.overlayBtnTxt}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  errorTxt: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.text.muted, textAlign: 'center', marginTop: 80 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backBtn:    { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  backBtnTxt: { fontFamily: FONTS.heading, fontSize: 15 },
  arenaLabel: { fontFamily: FONTS.heading, fontSize: 15, color: COLORS.text.muted },

  // ── Ready ─────────────────────────────────────────────────────────────────
  readyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  readyBossGlow: {
    position: 'absolute',
    width: 260, height: 260,
    borderRadius: 130,
    top: '50%',
    marginTop: -130,
  },
  readyVs:      { fontFamily: FONTS.display, fontSize: 13, letterSpacing: 4 },
  readyCharWrap: { marginVertical: SPACING.md },
  readyBossName: { fontFamily: FONTS.display, fontSize: 32 },
  readyBossTitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text.disabled },
  readyTagline: {
    fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.text.muted,
    fontStyle: 'italic', textAlign: 'center',
  },
  readyMeta:     { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  readyMetaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  readyMetaTxt:  { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  fightBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.full, marginTop: SPACING.lg,
    ...SHADOWS.lg,
  },
  fightBtnTxt: { fontFamily: FONTS.display, fontSize: 18, color: '#fff' },

  // ── Battle ────────────────────────────────────────────────────────────────
  battleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },

  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  heartsWrap: { flexDirection: 'row', gap: 4 },
  vsLabel:    { fontFamily: FONTS.display, fontSize: 12, color: COLORS.text.disabled, flex: 0 },
  bossHPWrap: { flex: 1, gap: 4 },
  bossHPName: { fontFamily: FONTS.heading, fontSize: 11 },
  bossHPTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  bossHPFill:  { height: '100%', borderRadius: RADIUS.full },
  bossHPCount: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.text.disabled },

  bossStage: { alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 140 },

  timerWrap: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: RADIUS.full },

  questionCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: RADIUS.xl, borderWidth: 1,
    padding: SPACING.lg, gap: SPACING.xs,
  },
  questionCounter: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.text.disabled },
  questionTxt: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.text.primary, lineHeight: 22 },

  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  answerBtn: {
    width: (SCREEN_W - SPACING.lg * 2 - SPACING.sm) / 2,
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 2,
    minHeight: 52,
  },
  answerTxt:   { fontFamily: FONTS.heading, fontSize: 13, color: '#fff', flex: 1 },
  answerCheck: { marginLeft: 'auto' },

  timeoutTxt: {
    fontFamily: FONTS.heading, fontSize: 14,
    color: COLORS.semantic.wrong, textAlign: 'center',
  },

  // ── Overlays ──────────────────────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  overlayCard: {
    width: '100%',
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl, borderWidth: 1.5,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  overlayIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  overlayTitle:    { fontFamily: FONTS.display, fontSize: 32 },
  overlaySubtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text.muted, textAlign: 'center', lineHeight: 20 },
  overlayReward: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  overlayRewardTxt: { fontFamily: FONTS.display, fontSize: 18 },
  overlayActions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  overlayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.xl,
  },
  overlayBtnTxt: { fontFamily: FONTS.heading, fontSize: 16, color: '#fff' },
});
