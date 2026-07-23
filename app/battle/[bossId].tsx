import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import MieoCharacter from '../../assets/mieo-character.svg';

const { width: SW, height: SH } = Dimensions.get('window');
const SC = SW / 375;

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:        '#0f1923',
  card:      '#1a2535',
  cardLight: '#202f43',
  dark:      '#171a1c',
  light:     '#f5fcff',
  grey:      '#8a9ab0',
  accent:    '#59c8ff',
  correct:   '#34c759',
  wrong:     '#ef4444',
  gold:      '#f59e0b',
  border:    '#2a3d52',
};

const MAX_HEARTS = 5;
const XP_PER_CORRECT = 20;

// ── Boss catalogue ─────────────────────────────────────────────────────────────
const BOSS_DATA: Record<string, {
  name: string; emoji: string;
  color: string; shadowColor: string;
  questions: Question[];
}> = {
  'word-wizard': {
    name: 'Word Wizard',
    emoji: '🧙',
    color: '#7C3AED',
    shadowColor: '#7C3AED',
    questions: [
      { prompt: 'What does "Ruwa" mean in English?',
        options: [{ id:'a', label:'Water' },{ id:'b', label:'Food' },{ id:'c', label:'Fire' },{ id:'d', label:'Air' }],
        correctId: 'a' },
      { prompt: 'Which word means "School" in Hausa?',
        options: [{ id:'a', label:'Abinci' },{ id:'b', label:'Ruwa' },{ id:'c', label:'Makaranta' },{ id:'d', label:'Gida' }],
        correctId: 'c' },
      { prompt: 'What is the English meaning of "Na gode"?',
        options: [{ id:'a', label:'Hello' },{ id:'b', label:'Thank you' },{ id:'c', label:'Goodbye' },{ id:'d', label:'Sorry' }],
        correctId: 'b' },
      { prompt: '"Ina kwana" is said in the…?',
        options: [{ id:'a', label:'Morning' },{ id:'b', label:'Evening' },{ id:'c', label:'Night' },{ id:'d', label:'Afternoon' }],
        correctId: 'a' },
      { prompt: 'Choose the correct Hausa word for "Food":',
        options: [{ id:'a', label:'Ruwa' },{ id:'b', label:'Abinci' },{ id:'c', label:'Gida' },{ id:'d', label:'Wuta' }],
        correctId: 'b' },
    ],
  },
  'grammar-guardian': {
    name: 'Grammar Guardian',
    emoji: '🛡️',
    color: '#0284C7',
    shadowColor: '#0284C7',
    questions: [
      { prompt: 'Which sentence is correct?',
        options: [{ id:'a', label:'She go to school' },{ id:'b', label:'She goes to school' },{ id:'c', label:'She going school' },{ id:'d', label:'She gone school' }],
        correctId: 'b' },
      { prompt: 'Pick the correct plural:',
        options: [{ id:'a', label:'Childs' },{ id:'b', label:'Childrens' },{ id:'c', label:'Children' },{ id:'d', label:'Childes' }],
        correctId: 'c' },
      { prompt: 'What is the past tense of "run"?',
        options: [{ id:'a', label:'Runned' },{ id:'b', label:'Runs' },{ id:'c', label:'Running' },{ id:'d', label:'Ran' }],
        correctId: 'd' },
      { prompt: 'Fill the blank: "I ___ a student."',
        options: [{ id:'a', label:'am' },{ id:'b', label:'is' },{ id:'c', label:'are' },{ id:'d', label:'be' }],
        correctId: 'a' },
      { prompt: 'Which word is a noun?',
        options: [{ id:'a', label:'Run' },{ id:'b', label:'Happy' },{ id:'c', label:'Quickly' },{ id:'d', label:'School' }],
        correctId: 'd' },
    ],
  },
  'number-knight': {
    name: 'Number Knight',
    emoji: '⚔️',
    color: '#CA8A04',
    shadowColor: '#CA8A04',
    questions: [
      { prompt: 'What is 7 × 8?',
        options: [{ id:'a', label:'54' },{ id:'b', label:'56' },{ id:'c', label:'63' },{ id:'d', label:'64' }],
        correctId: 'b' },
      { prompt: 'What is 144 ÷ 12?',
        options: [{ id:'a', label:'11' },{ id:'b', label:'13' },{ id:'c', label:'12' },{ id:'d', label:'14' }],
        correctId: 'c' },
      { prompt: 'What is 25% of 80?',
        options: [{ id:'a', label:'20' },{ id:'b', label:'25' },{ id:'c', label:'40' },{ id:'d', label:'15' }],
        correctId: 'a' },
      { prompt: 'If a triangle has sides 3, 4, 5 — what type is it?',
        options: [{ id:'a', label:'Equilateral' },{ id:'b', label:'Isosceles' },{ id:'c', label:'Right-angled' },{ id:'d', label:'Obtuse' }],
        correctId: 'c' },
      { prompt: 'What is the next prime after 11?',
        options: [{ id:'a', label:'12' },{ id:'b', label:'13' },{ id:'c', label:'14' },{ id:'d', label:'15' }],
        correctId: 'b' },
    ],
  },
};

const FALLBACK_BOSS = BOSS_DATA['word-wizard'];

// ── Types ──────────────────────────────────────────────────────────────────────
type Option   = { id: string; label: string };
type Question = { prompt: string; options: Option[]; correctId: string };
type Phase    = 'playing' | 'answered' | 'victory' | 'gameover';
type CharState = 'idle' | 'attack' | 'hit';

// ── Arena background SVG ───────────────────────────────────────────────────────
const ARENA_H = SH * 0.38;

function ArenaScene() {
  const px = (n: number) => (n / 375) * SW;
  const py = (n: number) => (n / 812) * SH;

  return (
    <Svg width={SW} height={ARENA_H} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#080e18" />
          <Stop offset="0.6" stopColor="#0f1f35" />
          <Stop offset="1"   stopColor="#162840" />
        </LinearGradient>
        <LinearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1e2e42" />
          <Stop offset="1" stopColor="#141e2c" />
        </LinearGradient>
        <LinearGradient id="torchL" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF9500" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#FF9500" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="torchR" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF9500" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#FF9500" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Sky */}
      <Rect x={0} y={0} width={SW} height={ARENA_H} fill="url(#sky)" />

      {/* Stone arches in background */}
      <Rect x={px(20)} y={py(40)} width={px(50)} height={py(120)} rx={4} fill="#1a2535" opacity={0.7} />
      <Rect x={px(305)} y={py(40)} width={px(50)} height={py(120)} rx={4} fill="#1a2535" opacity={0.7} />
      <Rect x={px(130)} y={py(60)} width={px(40)} height={py(100)} rx={3} fill="#1a2535" opacity={0.5} />
      <Rect x={px(205)} y={py(60)} width={px(40)} height={py(100)} rx={3} fill="#1a2535" opacity={0.5} />

      {/* Floor/stage */}
      <Rect x={0} y={ARENA_H * 0.68} width={SW} height={ARENA_H * 0.32} fill="url(#floor)" />
      {/* Stage edge highlight */}
      <Rect x={0} y={ARENA_H * 0.68} width={SW} height={2} fill="#2a3d52" />

      {/* Torch glow left */}
      <Ellipse cx={px(30)} cy={ARENA_H * 0.38} rx={px(28)} ry={ARENA_H * 0.22} fill="url(#torchL)" />
      {/* Torch left */}
      <Rect x={px(26)} y={ARENA_H * 0.3} width={px(7)} height={px(22)} rx={2} fill="#4a3520" />
      <Ellipse cx={px(29.5)} cy={ARENA_H * 0.28} rx={px(5)} ry={px(8)} fill="#FF9500" opacity={0.95} />
      <Ellipse cx={px(29.5)} cy={ARENA_H * 0.24} rx={px(3)} ry={px(5)} fill="#FFDD00" opacity={0.9} />

      {/* Torch glow right */}
      <Ellipse cx={px(345)} cy={ARENA_H * 0.38} rx={px(28)} ry={ARENA_H * 0.22} fill="url(#torchR)" />
      {/* Torch right */}
      <Rect x={px(341)} y={ARENA_H * 0.3} width={px(7)} height={px(22)} rx={2} fill="#4a3520" />
      <Ellipse cx={px(344.5)} cy={ARENA_H * 0.28} rx={px(5)} ry={px(8)} fill="#FF9500" opacity={0.95} />
      <Ellipse cx={px(344.5)} cy={ARENA_H * 0.24} rx={px(3)} ry={px(5)} fill="#FFDD00" opacity={0.9} />

      {/* Center spotlight */}
      <Ellipse cx={SW / 2} cy={ARENA_H * 0.75} rx={SW * 0.3} ry={ARENA_H * 0.1} fill="#2a4060" opacity={0.6} />
    </Svg>
  );
}

// ── Icon helpers ───────────────────────────────────────────────────────────────
function HeartIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={filled ? '#ff4d6d' : '#2a3d52'}
        stroke={filled ? '#ff4d6d' : '#3a5068'}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function BackIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 12H5M12 5l-7 7 7 7" stroke={C.light} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={C.gold} stroke={C.gold} strokeWidth="1"
      />
    </Svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6L9 17l-5-5" stroke={C.correct} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M18 6L6 18M6 6l12 12" stroke={C.wrong} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function BossBattleScreen() {
  const insets  = useSafeAreaInsets();
  const addXP   = usePlayerStore(s => s.addXP);
  const { bossId } = useLocalSearchParams<{ bossId: string }>();

  const boss      = BOSS_DATA[bossId ?? ''] ?? FALLBACK_BOSS;
  const questions = boss.questions;
  const totalQ    = questions.length;

  const [questionIdx, setQuestionIdx] = useState(0);
  const [hearts,      setHearts]      = useState(MAX_HEARTS);
  const [bossHpPct,   setBossHpPct]   = useState(100);
  const [score,       setScore]       = useState(0);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [phase,       setPhase]       = useState<Phase>('playing');

  // Mieo animations
  const mieoY     = useRef(new Animated.Value(0)).current;
  const mieoShakeX = useRef(new Animated.Value(0)).current;
  const mieoScale  = useRef(new Animated.Value(1)).current;
  // Boss animations
  const bossScale  = useRef(new Animated.Value(1)).current;
  const bossShakeX = useRef(new Animated.Value(0)).current;
  const bossOpacity = useRef(new Animated.Value(1)).current;
  // HP bar
  const bossHpAnim = useRef(new Animated.Value(100)).current;
  // Bottom panel
  const bottomSlide = useRef(new Animated.Value(120)).current;
  // Flash overlay
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Idle float for Mieo
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(mieoY, { toValue: -6, duration: 1000, useNativeDriver: true }),
        Animated.timing(mieoY, { toValue: 0,  duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Slide feedback bar up on answered, back down on playing
  useEffect(() => {
    if (phase === 'answered') {
      Animated.spring(bottomSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
    } else if (phase === 'playing') {
      Animated.timing(bottomSlide, { toValue: 120, duration: 200, useNativeDriver: true }).start();
    }
  }, [phase]);

  const currentQ = questions[questionIdx];

  function mieoAttack() {
    Animated.sequence([
      Animated.timing(mieoScale, { toValue: 1.25, duration: 120, useNativeDriver: true }),
      Animated.timing(mieoScale, { toValue: 0.9,  duration: 80,  useNativeDriver: true }),
      Animated.spring(mieoScale, { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
    ]).start();
  }

  function bossHit() {
    // Boss staggers
    Animated.sequence([
      Animated.timing(bossShakeX, { toValue: 14, duration: 55, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: 8,  duration: 45, useNativeDriver: true }),
      Animated.timing(bossShakeX, { toValue: 0,  duration: 45, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(bossOpacity, { toValue: 0.35, duration: 80, useNativeDriver: true }),
      Animated.timing(bossOpacity, { toValue: 1,    duration: 80, useNativeDriver: true }),
      Animated.timing(bossOpacity, { toValue: 0.35, duration: 80, useNativeDriver: true }),
      Animated.timing(bossOpacity, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    // Flash green
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.18, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start();
  }

  function mieoHit() {
    Animated.sequence([
      Animated.timing(mieoShakeX, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(mieoShakeX, { toValue:  12, duration: 55, useNativeDriver: true }),
      Animated.timing(mieoShakeX, { toValue: -8,  duration: 45, useNativeDriver: true }),
      Animated.timing(mieoShakeX, { toValue:  0,  duration: 45, useNativeDriver: true }),
    ]).start();
    // Flash red
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.18, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start();
  }

  function handleSelect(id: string) {
    if (phase !== 'playing') return;
    setSelectedId(id);

    const correct = id === currentQ.correctId;

    if (correct) {
      const newHp = Math.max(0, bossHpPct - Math.ceil(100 / totalQ));
      setBossHpPct(newHp);
      setScore(s => s + 1);
      addXP(XP_PER_CORRECT);
      mieoAttack();
      setTimeout(bossHit, 100);
      Animated.timing(bossHpAnim, { toValue: newHp, duration: 400, useNativeDriver: false }).start();
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      mieoHit();
      if (newHearts <= 0) {
        setPhase('answered');
        setTimeout(() => setPhase('gameover'), 1000);
        return;
      }
    }

    setPhase('answered');

    // Auto-advance after brief feedback window
    const next = questionIdx + 1;
    setTimeout(() => {
      if (next >= totalQ) {
        setPhase('victory');
      } else {
        setQuestionIdx(next);
        setSelectedId(null);
        setPhase('playing');
      }
    }, 1100);
  }

  const isCorrect = selectedId === currentQ?.correctId;

  // ── Victory ──────────────────────────────────────────────────────────────────
  if (phase === 'victory') {
    return (
      <View style={[end.root, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
        <View style={end.confettiRow}>
          {['🌟','✨','🎉','🏆','⚡'].map((e,i) => <Text key={i} style={end.confetti}>{e}</Text>)}
        </View>
        <Text style={end.bigEmoji}>{boss.emoji}</Text>
        <Text style={[end.defeatedTxt, { color: boss.color }]}>{boss.name} defeated!</Text>

        <View style={end.card}>
          <Text style={end.winTitle}>Victory! 🏆</Text>
          <View style={end.starsRow}>
            {[0,1,2].map(i => <StarIcon key={i} size={32} />)}
          </View>
          <Text style={end.scoreNum}>{score}/{totalQ}</Text>
          <Text style={end.scoreSub}>correct answers</Text>
          <View style={end.xpRow}>
            <StarIcon size={13} />
            <Text style={end.xpTxt}>+{score * XP_PER_CORRECT} XP earned</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[end.btn, { backgroundColor: boss.color }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={end.btnTxt}>Back to Arena</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Game over ─────────────────────────────────────────────────────────────────
  if (phase === 'gameover') {
    return (
      <View style={[end.root, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
        <Text style={end.bigEmoji}>{boss.emoji}</Text>
        <Text style={[end.defeatedTxt, { color: C.wrong }]}>You were defeated!</Text>

        <View style={end.card}>
          <Text style={end.winTitle}>Game Over 💔</Text>
          <Text style={end.scoreNum}>{score}/{totalQ}</Text>
          <Text style={end.scoreSub}>before your hearts ran out</Text>
          <Text style={end.motivTxt}>{"Don't give up — every defeat makes you stronger!"}</Text>
        </View>

        <TouchableOpacity
          style={[end.btn, { backgroundColor: C.wrong }]}
          onPress={() => {
            setQuestionIdx(0); setHearts(MAX_HEARTS);
            setBossHpPct(100); bossHpAnim.setValue(100);
            setScore(0); setSelectedId(null); setPhase('playing');
          }}
          activeOpacity={0.85}
        >
          <Text style={end.btnTxt}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={end.backLink}>Back to Arena</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* ── Arena scene ─────────────────────────────────────────────────────── */}
      <View style={[s.arena, { paddingTop: insets.top }]}>
        <ArenaScene />

        {/* Flash overlay (attack feedback) */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isCorrect ? C.correct : C.wrong,
              opacity: flashOpacity,
            },
          ]}
        />

        {/* Top bar: back + progress label */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <BackIcon size={18} />
          </TouchableOpacity>
          <Text style={s.progressTxt}>
            {questionIdx + 1} / {totalQ}
          </Text>
        </View>

        {/* Characters row */}
        <View style={s.charsRow}>
          {/* Boss */}
          <View style={s.bossSide}>
            <Animated.View style={{
              transform: [{ translateX: bossShakeX }, { scale: bossScale }],
              opacity: bossOpacity,
            }}>
              <View style={[s.bossAvatarRing, { borderColor: boss.color, shadowColor: boss.color }]}>
                <Text style={s.bossAvatarEmoji}>{boss.emoji}</Text>
              </View>
            </Animated.View>
            <Text style={[s.bossLabel, { color: boss.color }]}>{boss.name}</Text>
            {/* Boss HP bar */}
            <View style={s.hpTrack}>
              <Animated.View
                style={[
                  s.hpFill,
                  {
                    backgroundColor: boss.color,
                    width: bossHpAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* VS */}
          <View style={s.vsWrap}>
            <Text style={s.vsTxt}>VS</Text>
          </View>

          {/* Mieo */}
          <View style={s.mieoSide}>
            <Animated.View style={{
              transform: [{ translateY: mieoY }, { translateX: mieoShakeX }, { scale: mieoScale }],
            }}>
              <MieoCharacter width={72 * SC} height={75 * SC} />
            </Animated.View>
            <Text style={s.mieoLabel}>Mieo</Text>
            {/* Hearts */}
            <View style={s.heartsRow}>
              {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <HeartIcon key={i} filled={i < hearts} size={15} />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── Question section ─────────────────────────────────────────────────── */}
      <View style={s.questionSection}>
        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(questionIdx / totalQ) * 100}%` as any }]} />
        </View>

        {/* Question prompt */}
        <View style={s.promptCard}>
          <Text style={s.promptText}>{currentQ.prompt}</Text>
        </View>

        {/* Options 2×2 */}
        <View style={s.optionsGrid}>
          {currentQ.options.map(opt => {
            let bg = C.card, border = C.border, textColor = C.light;
            if (phase === 'answered') {
              if (opt.id === currentQ.correctId)  { bg = '#0f2e1a'; border = C.correct; textColor = C.correct; }
              else if (opt.id === selectedId)      { bg = '#2e0f0f'; border = C.wrong;   textColor = C.wrong; }
            } else if (opt.id === selectedId) {
              bg = '#0f2040'; border = C.accent; textColor = C.accent;
            }

            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.85}
                disabled={phase === 'answered'}
                onPress={() => handleSelect(opt.id)}
                style={[s.option, { backgroundColor: bg, borderColor: border }]}
              >
                <Text style={[s.optionTxt, { color: textColor }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Bottom feedback (slides up after answering) ───────────────────────── */}
      <Animated.View
        style={[
          s.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
          {
            backgroundColor: phase === 'answered'
              ? (isCorrect ? '#0d2218' : '#2a0f0f')
              : C.card,
            borderTopColor: phase === 'answered'
              ? (isCorrect ? C.correct : C.wrong)
              : C.border,
            transform: [{ translateY: bottomSlide }],
          },
        ]}
      >
        {phase === 'answered' && (
          <View style={s.bottomInner}>
            {isCorrect ? <CheckIcon size={22} /> : <XIcon size={22} />}
            <Text style={[s.bottomLabel, { color: isCorrect ? C.correct : C.wrong }]}>
              {isCorrect ? 'Correct! ⚡' : 'Wrong! Keep going 💪'}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Arena
  arena: {
    height: ARENA_H,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressTxt: {
    fontFamily: FONTS.heading,
    fontSize: 13 * SC,
    color: C.grey,
    letterSpacing: 0.5,
  },

  charsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // Boss side
  bossSide: { flex: 1, alignItems: 'center', gap: 6 },
  bossAvatarRing: {
    width: 72 * SC,
    height: 72 * SC,
    borderRadius: 36 * SC,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  bossAvatarEmoji: { fontSize: 36 * SC },
  bossLabel: { fontFamily: FONTS.heading, fontSize: 11 * SC, textAlign: 'center' },
  hpTrack: {
    width: '90%', height: 6, borderRadius: 3,
    backgroundColor: '#1e2e42', overflow: 'hidden',
    borderWidth: 1, borderColor: '#2a3d52',
  },
  hpFill: { height: '100%', borderRadius: 3 },

  // VS
  vsWrap: { width: 36, alignItems: 'center', paddingBottom: 28 },
  vsTxt:  { fontFamily: FONTS.display, fontSize: 13 * SC, color: C.grey, letterSpacing: 1 },

  // Mieo side
  mieoSide: { flex: 1, alignItems: 'center', gap: 6 },
  mieoLabel: { fontFamily: FONTS.heading, fontSize: 11 * SC, color: C.light },
  heartsRow: { flexDirection: 'row', gap: 2 },

  // Question section
  questionSection: {
    flex: 1,
    paddingHorizontal: 16 * SC,
    paddingTop: 12 * SC,
    gap: 10 * SC,
  },
  progressTrack: {
    height: 5, borderRadius: 3,
    backgroundColor: C.cardLight, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: C.accent,
  },
  promptCard: {
    backgroundColor: C.card,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    padding: 14 * SC,
  },
  promptText: {
    fontFamily: FONTS.heading,
    fontSize: 15 * SC, color: C.light,
    lineHeight: 22 * SC,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 9 * SC,
  },
  option: {
    width: (SW - 32 * SC - 9 * SC) / 2,
    minHeight: 52,
    borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 12,
  },
  optionTxt: {
    fontFamily: FONTS.heading,
    fontSize: 14 * SC,
    textAlign: 'center',
  },

  // Bottom feedback bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1.5,
    paddingTop: 14, paddingHorizontal: 16,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bottomLabel: { fontFamily: FONTS.display, fontSize: 17 * SC },
  nextBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  nextBtnTxt: { fontFamily: FONTS.display, fontSize: 15 * SC, color: '#fff' },
});

// ── End screens (victory / gameover) ──────────────────────────────────────────
const end = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: C.bg,
    alignItems: 'center',
    paddingHorizontal: 20 * SC,
    gap: 16 * SC,
  },
  confettiRow: { flexDirection: 'row', gap: 8 },
  confetti:   { fontSize: 24 * SC },
  bigEmoji:   { fontSize: 72 * SC },
  defeatedTxt: { fontFamily: FONTS.heading, fontSize: 14 * SC },
  card: {
    width: '100%', backgroundColor: C.card,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    padding: 24 * SC, alignItems: 'center', gap: 8 * SC,
  },
  winTitle:   { fontFamily: FONTS.display, fontSize: 24 * SC, color: C.light },
  starsRow:   { flexDirection: 'row', gap: 8 },
  scoreNum:   { fontFamily: FONTS.display, fontSize: 52 * SC, color: C.accent },
  scoreSub:   { fontFamily: FONTS.body, fontSize: 13 * SC, color: C.grey, marginTop: -6 },
  xpRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2a2010', borderWidth: 1, borderColor: '#4a3a10',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  xpTxt:    { fontFamily: FONTS.heading, fontSize: 13 * SC, color: C.gold },
  motivTxt: { fontFamily: FONTS.body, fontSize: 13 * SC, color: C.grey, textAlign: 'center', lineHeight: 20 * SC },
  btn: {
    width: '100%',
    paddingVertical: 15, borderRadius: 28, alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnTxt:  { fontFamily: FONTS.display, fontSize: 17 * SC, color: '#fff' },
  backLink: { fontFamily: FONTS.bodyMedium, fontSize: 14 * SC, color: C.grey, textDecorationLine: 'underline' },
});
