/**
 * Lesson screen — Duolingo-style step flow.
 * Steps: intro → [teach → quiz] × N → celebrate
 * Each step fills the screen. Mieo reacts to answers.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FONTS } from '../../src/constants/theme';
import { CURRICULUM_NODES } from '../../src/constants/curriculum';
import { getLessonContent } from '../../src/constants/lessonContent';
import type { LessonSlide, QuizQuestion } from '../../src/constants/lessonContent';
import { useProgressStore } from '../../src/store/useProgressStore';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { playSound } from '../../src/utils/sounds';

import MieoCharacter   from '../../assets/mieo-character.svg';
import ChearsCharacter from '../../assets/game-chears-character.svg';

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
  gold:      '#f59e0b',
};

// Subject accent (used for pill label only — everything else uses brand blue)
const SUBJECT_ACCENT: Record<string, string> = {
  english: '#59c8ff',
  math:    '#34c759',
  science: '#ff894f',
  social:  '#a855f7',
};

// 2×2 quiz option palette
const OPT_COLORS = ['#4f9ef8', '#f87171', '#fb923c', '#4ade80'];

const CP_PER_LESSON = 40;

// ─── Step type ────────────────────────────────────────────────────────────────

type Step =
  | { type: 'intro' }
  | { type: 'teach'; slideIdx: number }
  | { type: 'quiz';  quizIdx: number }
  | { type: 'celebrate' };

function buildSteps(slides: LessonSlide[], quiz: QuizQuestion[]): Step[] {
  const steps: Step[] = [{ type: 'intro' }];
  const maxPairs = Math.max(slides.length, quiz.length);
  for (let i = 0; i < maxPairs; i++) {
    if (i < slides.length) steps.push({ type: 'teach', slideIdx: i });
    if (i < quiz.length)   steps.push({ type: 'quiz',  quizIdx: i });
  }
  steps.push({ type: 'celebrate' });
  return steps;
}

// ─── Mieo mood ────────────────────────────────────────────────────────────────

type MieoMood = 'idle' | 'happy' | 'wrong' | 'speaking';

function useMieoAnimation(mood: MieoMood) {
  const bounceY = useRef(new Animated.Value(0)).current;
  const shakeX  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    bounceY.stopAnimation();
    shakeX.stopAnimation();
    shakeX.setValue(0);

    if (mood === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:   0, duration: 60, useNativeDriver: true }),
      ]).start();
      return;
    }

    const speed  = mood === 'happy' ? 280 : mood === 'speaking' ? 500 : 900;
    const height = mood === 'happy' ? -14 : -5;
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: height, duration: speed, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,      duration: speed, useNativeDriver: true }),
      ])
    ).start();
  }, [mood]);

  return { bounceY, shakeX };
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

const BackIcon = ({ color = C.dark }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={C.correct} />
    <Path d="M7 12.5l3.5 3.5L17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={C.wrong} />
    <Path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ArrowIcon = ({ size = 18, color = 'white' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StarIcon = ({ filled, size = 32 }: { filled?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? C.gold : 'none'}
      stroke={filled ? C.gold : C.border}
      strokeWidth="1.5"
    />
  </Svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const insets     = useSafeAreaInsets();
  const router     = useRouter();

  const isCompleted  = useProgressStore((s) => s.isCompleted);
  const completeNode = useProgressStore((s) => s.completeNode);
  const nodes        = useProgressStore((s) => s.nodes);
  const addXP        = usePlayerStore((s) => s.addXP);

  const node    = CURRICULUM_NODES.find((n) => n.id === nodeId);
  const content = node ? getLessonContent(node.id) : null;

  const steps: Step[] = content
    ? buildSteps(content.slides, content.quiz)
    : [{ type: 'intro' }, { type: 'celebrate' }];

  const [stepIdx,   setStepIdx]   = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [answers,   setAnswers]   = useState<boolean[]>([]);
  const [mieoMood,  setMieoMood]  = useState<MieoMood>('idle');
  const [showConfetti, setShowConfetti] = useState(false);

  // Slide transition
  const slideX = useRef(new Animated.Value(0)).current;

  function advanceStep(nextIdx: number) {
    Animated.timing(slideX, { toValue: -SW, duration: 180, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(() => {
      setStepIdx(nextIdx);
      setSelected(null);
      slideX.setValue(SW);
      Animated.spring(slideX, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }).start();
    });
  }

  function handleStart() {
    playSound('tap');
    setMieoMood('speaking');
    advanceStep(1);
  }

  function handleTeachNext() {
    playSound('slide');
    advanceStep(stepIdx + 1);
  }

  function handleSelectAnswer(quizIdx: number, idx: number) {
    if (selected !== null || !content) return;
    setSelected(idx);
    const correct = idx === content.quiz[quizIdx].correct;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    if (correct) {
      playSound('correct');
      setMieoMood('happy');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
    } else {
      playSound('wrong');
      setMieoMood('wrong');
      setTimeout(() => setMieoMood('idle'), 600);
    }
  }

  function handleQuizNext(quizIdx: number) {
    if (selected === null) return;
    const nextIdx = stepIdx + 1;
    const isLast  = nextIdx >= steps.length - 1;
    setMieoMood('idle');

    if (isLast) {
      // Last quiz before celebrate
      const score = answers.filter(Boolean).length;
      const stars = score >= (content?.quiz.length ?? 0) ? 3 : score >= Math.ceil((content?.quiz.length ?? 0) * 0.6) ? 2 : 1;
      completeNode(node!.id, stars, score);
      addXP(CP_PER_LESSON);
      playSound('complete');
      setMieoMood('happy');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    advanceStep(nextIdx);
  }

  if (!node) {
    return (
      <View style={s.screen}>
        <Text style={s.err}>Lesson not found.</Text>
      </View>
    );
  }

  const currentStep   = steps[stepIdx];
  const subjectAccent = SUBJECT_ACCENT[node.subject] ?? C.accent;
  const completed     = isCompleted(node.id);
  const stars         = nodes[node.id]?.stars ?? 0;
  const score         = answers.filter(Boolean).length;
  const totalQuiz     = content?.quiz.length ?? 0;
  const progressPct   = steps.length > 1 ? stepIdx / (steps.length - 1) : 0;

  const { bounceY, shakeX } = useMieoAnimation(mieoMood);

  const MieoSize   = 96 * SC;
  const ChearsSize = 110 * SC;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {showConfetti && <Confetti />}

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressFill, { width: `${progressPct * 100}%`, backgroundColor: subjectAccent }]} />
          </View>
        </View>

        {/* Subject pill */}
        <View style={[s.subjectPill, { borderColor: subjectAccent + '66', backgroundColor: subjectAccent + '18' }]}>
          <Text style={[s.subjectPillTxt, { color: subjectAccent }]}>
            Lv {node.level}
          </Text>
        </View>
      </View>

      {/* ── Mieo character (persistent across steps) ─────────────────────────── */}
      {currentStep.type !== 'celebrate' && (
        <View style={s.mieoWrap}>
          <Animated.View style={{ transform: [{ translateY: bounceY }, { translateX: shakeX }] }}>
            <MieoCharacter width={MieoSize} height={MieoSize} />
          </Animated.View>
        </View>
      )}

      {/* ── Step content (animated slide) ────────────────────────────────────── */}
      <Animated.View style={[s.stepContainer, { transform: [{ translateX: slideX }] }]}>
        {currentStep.type === 'intro' && (
          <IntroStep
            node={node}
            content={content}
            completed={completed}
            stars={stars}
            subjectAccent={subjectAccent}
            onStart={handleStart}
            insetBottom={insets.bottom}
          />
        )}

        {currentStep.type === 'teach' && content && (
          <TeachStep
            slide={content.slides[currentStep.slideIdx]}
            slideIdx={currentStep.slideIdx}
            totalSlides={content.slides.length}
            subjectAccent={subjectAccent}
            onNext={handleTeachNext}
            insetBottom={insets.bottom}
          />
        )}

        {currentStep.type === 'quiz' && content && (
          <QuizStep
            question={content.quiz[currentStep.quizIdx]}
            quizIdx={currentStep.quizIdx}
            totalQuiz={content.quiz.length}
            selected={selected}
            subjectAccent={subjectAccent}
            onSelect={(idx) => handleSelectAnswer(currentStep.quizIdx, idx)}
            onNext={() => handleQuizNext(currentStep.quizIdx)}
            insetBottom={insets.bottom}
          />
        )}

        {currentStep.type === 'celebrate' && (
          <CelebrateStep
            score={score}
            total={totalQuiz}
            answers={answers}
            subjectAccent={subjectAccent}
            chearsSize={ChearsSize}
            onBack={() => router.back()}
            insetBottom={insets.bottom}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ─── Intro Step ───────────────────────────────────────────────────────────────

function IntroStep({ node, content, completed, stars, subjectAccent, onStart, insetBottom }: {
  node: any;
  content: any;
  completed: boolean;
  stars: number;
  subjectAccent: string;
  onStart: () => void;
  insetBottom: number;
}) {
  const slideIn = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideIn, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[s.stepContent, { paddingBottom: Math.max(insetBottom, 20) + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity, transform: [{ translateY: slideIn }], gap: 16 }}>
        {/* Speech bubble from Mieo */}
        <SpeechBubble>
          <Text style={s.bubbleTxt}>
            {content
              ? `Today we're learning about\n${node.title}! Let's go! 🚀`
              : `Get ready to learn about ${node.title}!`}
          </Text>
        </SpeechBubble>

        {/* Lesson card */}
        <View style={s.introCard}>
          <Text style={s.introEmoji}>{content?.slides?.[0]?.emoji ?? '📖'}</Text>
          <Text style={[s.introTitle, { color: C.dark }]}>{node.title}</Text>
          {content && (
            <Text style={s.introTagline}>"{content.tagline}"</Text>
          )}
          {completed && (
            <View style={s.starsRow}>
              {[0, 1, 2].map((i) => <StarIcon key={i} filled={i < stars} size={26} />)}
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={s.statRow}>
          <StatChip color={subjectAccent} value={String(content?.slides?.length ?? '–')} label="Slides" />
          <StatChip color={subjectAccent} value={String(content?.quiz?.length ?? '–')}   label="Questions" />
          <StatChip color={C.gold}        value={`+${CP_PER_LESSON}`}                    label="CP Reward" />
        </View>

        {content ? (
          <ActionButton onPress={onStart} label={completed ? 'Play Again' : 'Start Learning'} />
        ) : (
          <View style={s.noContent}>
            <Text style={[s.noContentTxt, { color: subjectAccent }]}>Content coming soon!</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

// ─── Teach Step ───────────────────────────────────────────────────────────────

function TeachStep({ slide, slideIdx, totalSlides, subjectAccent, onNext, insetBottom }: {
  slide: LessonSlide;
  slideIdx: number;
  totalSlides: number;
  subjectAccent: string;
  onNext: () => void;
  insetBottom: number;
}) {
  const emojiScale  = useRef(new Animated.Value(0.4)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    emojiScale.setValue(0.4);
    cardOpacity.setValue(0);
    cardSlide.setValue(20);
    Animated.parallel([
      Animated.spring(emojiScale,  { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(cardSlide,   { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [slideIdx]);

  const isLast = slideIdx === totalSlides - 1;

  return (
    <View style={[s.stepContent, { paddingBottom: Math.max(insetBottom, 20) + 20 }]}>
      {/* Mieo says... */}
      <SpeechBubble>
        <Text style={s.bubbleTxt}>
          {slideIdx === 0
            ? `Let me teach you about\n"${slide.heading}"!`
            : `Now let's learn about\n"${slide.heading}"!`}
        </Text>
      </SpeechBubble>

      {/* Slide dot progress */}
      <View style={s.dotRow}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: i === slideIdx ? subjectAccent : C.border,
                width: i === slideIdx ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Slide card */}
      <Animated.View style={[s.slideCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
        <Animated.Text style={[s.bigEmoji, { transform: [{ scale: emojiScale }] }]}>
          {slide.emoji}
        </Animated.Text>
        <Text style={[s.slideHeading, { color: subjectAccent }]}>{slide.heading}</Text>
        <Text style={s.slideBody}>{slide.body}</Text>
      </Animated.View>

      <ActionButton onPress={onNext} label={isLast ? 'Ready for questions!' : 'Got it!'} />
    </View>
  );
}

// ─── Quiz Step ────────────────────────────────────────────────────────────────

function QuizStep({ question, quizIdx, totalQuiz, selected, subjectAccent, onSelect, onNext, insetBottom }: {
  question: QuizQuestion;
  quizIdx: number;
  totalQuiz: number;
  selected: number | null;
  subjectAccent: string;
  onSelect: (idx: number) => void;
  onNext: () => void;
  insetBottom: number;
}) {
  const qOpacity = useRef(new Animated.Value(0)).current;
  const qSlide   = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    qOpacity.setValue(0);
    qSlide.setValue(20);
    Animated.parallel([
      Animated.timing(qOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(qSlide,   { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [quizIdx]);

  const answered  = selected !== null;
  const isLastQ   = quizIdx === totalQuiz - 1;

  return (
    <ScrollView
      contentContainerStyle={[s.stepContent, { paddingBottom: Math.max(insetBottom, 20) + 20 }]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {/* Speech bubble */}
      <SpeechBubble>
        <Text style={s.bubbleTxt}>
          {answered
            ? selected === question.correct ? "Correct! Amazing work! 🎉" : "Not quite! Let me show you."
            : `Question ${quizIdx + 1} of ${totalQuiz}:`}
        </Text>
      </SpeechBubble>

      {/* Question card */}
      <Animated.View style={[s.qCard, { opacity: qOpacity, transform: [{ translateY: qSlide }] }]}>
        <Text style={s.qText}>{question.question}</Text>
      </Animated.View>

      {/* 2×2 option grid */}
      <View style={s.optGrid}>
        {question.options.map((opt, idx) => (
          <QuizOption
            key={idx}
            idx={idx}
            text={opt}
            color={OPT_COLORS[idx % OPT_COLORS.length]}
            correct={question.correct}
            selected={selected}
            answered={answered}
            onPress={() => onSelect(idx)}
          />
        ))}
      </View>

      {answered && (
        <ActionButton
          onPress={onNext}
          label={isLastQ ? 'See Results' : 'Next'}
          color={selected === question.correct ? C.correct : C.accent}
        />
      )}
    </ScrollView>
  );
}

// ─── Quiz Option ──────────────────────────────────────────────────────────────

function QuizOption({ idx, text, color, correct, selected, answered, onPress }: {
  idx: number;
  text: string;
  color: string;
  correct: number;
  selected: number | null;
  answered: boolean;
  onPress: () => void;
}) {
  const scale  = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const pulse  = useRef(new Animated.Value(1)).current;

  const isSelected = selected === idx;
  const isCorrect  = idx === correct;
  const isWrong    = answered && isSelected && !isCorrect;
  const isRight    = answered && isCorrect;

  useEffect(() => {
    if (isWrong) {
      Animated.sequence([
        Animated.timing(shakeX, { toValue:  10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:   6, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:   0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
    if (isRight) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 400, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [answered]);

  let bg      = color;
  let opacity = 1;
  let borderColor = 'transparent';

  if (answered) {
    if (isCorrect) {
      bg = color;
      borderColor = '#ffffff';
    } else if (isSelected) {
      bg = '#9ca3af';
      opacity = 0.9;
    } else {
      opacity = 0.3;
    }
  }

  const optW = (SW - 40 * SC * 2 - 10) / 2;

  return (
    <TouchableOpacity
      onPress={answered ? undefined : onPress}
      onPressIn={() =>  !answered && Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => !answered && Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
      activeOpacity={answered ? 1 : 0.9}
      style={{ width: optW }}
    >
      <Animated.View
        style={[
          s.optBtn,
          { backgroundColor: bg, borderColor, borderWidth: 2.5, opacity },
          { transform: [{ scale: Animated.multiply(scale, pulse) }, { translateX: shakeX }] },
        ]}
      >
        {/* State icon overlay */}
        {answered && (
          <View style={s.optIcon}>
            {isCorrect ? <CheckIcon size={20} /> : isSelected ? <XIcon size={20} /> : null}
          </View>
        )}
        <Text style={s.optTxt} numberOfLines={3}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Celebrate Step ───────────────────────────────────────────────────────────

function CelebrateStep({ score, total, answers, subjectAccent, chearsSize, onBack, insetBottom }: {
  score: number;
  total: number;
  answers: boolean[];
  subjectAccent: string;
  chearsSize: number;
  onBack: () => void;
  insetBottom: number;
}) {
  const stars  = score >= total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : 1;

  const cardOp    = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const star0     = useRef(new Animated.Value(0)).current;
  const star1     = useRef(new Animated.Value(0)).current;
  const star2     = useRef(new Animated.Value(0)).current;
  const starScales = [star0, star1, star2];
  const bottomOp  = useRef(new Animated.Value(0)).current;
  const bottomTy  = useRef(new Animated.Value(20)).current;
  const charBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(charBounce, { toValue: -14, duration: 420, useNativeDriver: true }),
        Animated.timing(charBounce, { toValue: 0,   duration: 420, useNativeDriver: true }),
      ])
    ).start();

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }),
      Animated.timing(cardOp,    { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      starScales.forEach((s, i) =>
        setTimeout(() =>
          Animated.spring(s, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }).start(),
          i * 180
        )
      );
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(bottomTy, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
          Animated.timing(bottomOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 650);
    });
  }, []);

  const motivation =
    stars === 3 ? "Perfect score! You're amazing! 🏆" :
    stars === 2 ? 'Great job! Keep it up! 👏' :
    'Good effort! Try again to improve! 💪';

  return (
    <ScrollView
      contentContainerStyle={[s.stepContent, { paddingBottom: Math.max(insetBottom, 20) + 20, alignItems: 'center' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cheers character */}
      <Animated.View style={{ transform: [{ translateY: charBounce }] }}>
        <ChearsCharacter width={chearsSize} height={chearsSize} />
      </Animated.View>

      {/* Score card */}
      <Animated.View style={[s.celebCard, { opacity: cardOp, transform: [{ scale: cardScale }] }]}>
        <Text style={s.celebTitle}>Lesson Complete!</Text>

        <View style={s.starsRow}>
          {starScales.map((sv, i) => (
            <Animated.View key={i} style={{ transform: [{ scale: sv }] }}>
              <StarIcon filled={i < stars} size={38} />
            </Animated.View>
          ))}
        </View>

        <Text style={[s.scoreDisplay, { color: subjectAccent }]}>
          {score}<Text style={s.scoreOf}> / {total}</Text>
        </Text>
        <Text style={s.scoreLabel}>questions correct</Text>

        <View style={s.cpRow}>
          <Text style={s.cpTxt}>+{CP_PER_LESSON} CP earned!</Text>
        </View>

        <Text style={s.motivation}>{motivation}</Text>
      </Animated.View>

      {/* Per-question review */}
      {answers.length > 0 && (
        <Animated.View style={[s.reviewCard, { opacity: bottomOp, transform: [{ translateY: bottomTy }] }]}>
          {answers.map((ok, i) => (
            <View key={i} style={s.reviewRow}>
              {ok ? <CheckIcon size={18} /> : <XIcon size={18} />}
              <Text style={[s.reviewTxt, { color: ok ? C.correct : C.wrong }]}>
                Question {i + 1} — {ok ? 'Correct!' : 'Wrong'}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}

      <Animated.View style={[{ width: '100%', opacity: bottomOp }]}>
        <ActionButton onPress={onBack} label="Back to Skill Tree" />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#59c8ff', '#ff894f', '#34c759', '#f59e0b', '#ec4899', '#a855f7'];
const N_CONFETTI = 24;

function Confetti() {
  const anims = useRef(
    Array.from({ length: N_CONFETTI }, () => ({
      x:   new Animated.Value(SW / 2),
      y:   new Animated.Value(200),
      op:  new Animated.Value(1),
      rot: new Animated.Value(0),
    }))
  ).current;

  const meta = useRef(
    Array.from({ length: N_CONFETTI }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      angle: (i / N_CONFETTI) * Math.PI * 2,
      dist:  90 + Math.random() * 130,
      size:  6 + Math.random() * 8,
    }))
  ).current;

  useEffect(() => {
    anims.forEach((a, i) => {
      const m  = meta[i];
      const tx = (a.x as any)._value + Math.cos(m.angle) * m.dist;
      const ty = (a.y as any)._value + Math.sin(m.angle) * m.dist + 60;
      Animated.parallel([
        Animated.timing(a.x,   { toValue: tx, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(a.y,   { toValue: ty, duration: 800, easing: Easing.in(Easing.quad),  useNativeDriver: false }),
        Animated.timing(a.op,  { toValue: 0,  duration: 800, useNativeDriver: false }),
        Animated.timing(a.rot, { toValue: Math.random() > 0.5 ? 1 : -1, duration: 800, useNativeDriver: false }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((a, i) => {
        const m = meta[i];
        const rotate = a.rot.interpolate({ inputRange: [-1, 1], outputRange: ['-180deg', '180deg'] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: m.size, height: m.size,
              borderRadius: m.size / 4,
              backgroundColor: m.color,
              left: a.x, top: a.y,
              opacity: a.op,
              transform: [{ rotate }],
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bubbleWrap}>
      <View style={s.bubbleTailBorder} />
      <View style={s.bubbleTailFill} />
      <View style={s.bubbleInner}>{children}</View>
    </View>
  );
}

function ActionButton({ onPress, label, color = C.accent }: { onPress: () => void; label: string; color?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={()  => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
      activeOpacity={1}
    >
      <Animated.View style={[s.actionBtn, { backgroundColor: color, transform: [{ scale }] }]}>
        <Text style={s.actionBtnTxt}>{label}</Text>
        <ArrowIcon />
      </Animated.View>
    </TouchableOpacity>
  );
}

function StatChip({ color, value, label }: { color: string; value: string; label: string }) {
  return (
    <View style={[s.statChip, { borderColor: color + '55' }]}>
      <Text style={[s.statVal, { color }]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  err:    { color: C.grey, fontFamily: FONTS.body, fontSize: 15, textAlign: 'center', marginTop: 60 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16 * SC,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressWrap: { flex: 1 },
  progressTrack: {
    height: 10,
    backgroundColor: C.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  subjectPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  subjectPillTxt: { fontFamily: FONTS.heading, fontSize: 12 * SC },

  // Mieo
  mieoWrap: { alignItems: 'center', paddingVertical: 4 },

  // Step slide wrapper
  stepContainer: { flex: 1 },

  stepContent: {
    paddingHorizontal: 20 * SC,
    paddingTop: 8,
    gap: 14 * SC,
    flexGrow: 1,
  },

  // Speech bubble (points up-left toward Mieo)
  bubbleWrap: {
    position: 'relative',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleTailBorder: {
    position: 'absolute',
    top: -10,
    left: 28,
    width: 0, height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.border,
  },
  bubbleTailFill: {
    position: 'absolute',
    top: -7,
    left: 30,
    width: 0, height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.card,
  },
  bubbleInner: {},
  bubbleTxt: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14 * SC,
    color: C.dark,
    lineHeight: 22 * SC,
  },

  // Intro
  introCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 20 * SC,
    alignItems: 'center',
    gap: 10,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  introEmoji: { fontSize: 64 },
  introTitle: { fontFamily: FONTS.display, fontSize: 22 * SC, textAlign: 'center' },
  introTagline: {
    fontFamily: FONTS.body,
    fontSize: 13 * SC,
    color: C.grey,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  starsRow: { flexDirection: 'row', gap: 6 },

  statRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    padding: 12 * SC,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  statVal: { fontFamily: FONTS.heading, fontSize: 16 * SC },
  statLbl: { fontFamily: FONTS.body, fontSize: 11 * SC, color: C.grey },

  noContent: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  noContentTxt: { fontFamily: FONTS.heading, fontSize: 15 },

  // Teach
  dotRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot:    { height: 8, borderRadius: 4 },

  slideCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 20 * SC,
    alignItems: 'center',
    gap: 12,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 200 * SC,
  },
  bigEmoji:    { fontSize: 72 },
  slideHeading:{ fontFamily: FONTS.display, fontSize: 20 * SC, textAlign: 'center' },
  slideBody: {
    fontFamily: FONTS.body,
    fontSize: 13.5 * SC,
    color: C.grey,
    textAlign: 'center',
    lineHeight: 22 * SC,
  },

  // Quiz
  qCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 18 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  qText: {
    fontFamily: FONTS.heading,
    fontSize: 17 * SC,
    color: C.dark,
    textAlign: 'center',
    lineHeight: 26 * SC,
  },

  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optBtn: {
    borderRadius: 18,
    padding: 14 * SC,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90 * SC,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  optIcon: { position: 'absolute', top: 10, right: 10 },
  optTxt: {
    fontFamily: FONTS.heading,
    fontSize: 14 * SC,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 20 * SC,
  },

  // Action button
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 28,
    shadowColor: '#1AA3D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  actionBtnTxt: { fontFamily: FONTS.display, fontSize: 17 * SC, color: '#f5fcff' },

  // Celebrate
  celebCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 22 * SC,
    alignItems: 'center',
    gap: 12,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  celebTitle:   { fontFamily: FONTS.display, fontSize: 24 * SC, color: C.dark },
  scoreDisplay: { fontFamily: FONTS.display, fontSize: 52 * SC },
  scoreOf:      { fontFamily: FONTS.body,    fontSize: 28 * SC, color: C.grey },
  scoreLabel:   { fontFamily: FONTS.body,    fontSize: 13 * SC, color: C.grey, marginTop: -8 },
  cpRow: {
    backgroundColor: '#fff8e0',
    borderWidth: 1, borderColor: '#f0d070',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
  },
  cpTxt:      { fontFamily: FONTS.heading, fontSize: 14 * SC, color: C.gold },
  motivation: { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.grey, textAlign: 'center', lineHeight: 20 * SC },

  reviewCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16 * SC,
    gap: 10,
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewTxt: { fontFamily: FONTS.heading, fontSize: 13 * SC },
});
