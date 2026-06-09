/**
 * Lesson screen — the four-phase lesson runner for a single curriculum node:
 * intro → learn (slides) → quiz → complete. Reads lesson content by nodeId,
 * awards CP and stars on completion and records progress in the progress store.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { CURRICULUM_NODES, type CurriculumNode } from '../../src/constants/curriculum';
import { getLessonContent, type LessonContent, type LessonSlide, type QuizQuestion } from '../../src/constants/lessonContent';
import { useProgressStore } from '../../src/store/useProgressStore';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import * as Speech from 'expo-speech';
import { playSound } from '../../src/utils/sounds';
import { BeeOwl, type OwlMood } from '../../src/components/companion/BeeOwl';

const { width: SW } = Dimensions.get('window');

// ─── Subject palette (bright for kids) ───────────────────────────────────────

const SUBJECT = {
  english: { label: 'English',        accent: '#0ea5e9', bg: '#0c1929', cardBg: '#0f2744' },
  math:    { label: 'Mathematics',    accent: '#14b8a6', bg: '#0c1f1e', cardBg: '#0e2825' },
  science: { label: 'Science',        accent: '#f97316', bg: '#1e120a', cardBg: '#2a1a0c' },
  social:  { label: 'Social Studies', accent: '#a855f7', bg: '#160c26', cardBg: '#1e1035' },
};

// Kahoot-style option colours
const OPT_COLORS = ['#2563eb', '#dc2626', '#d97706', '#16a34a'];
const OPT_ICONS: React.ComponentProps<typeof Ionicons>['name'][] = [
  'triangle', 'square', 'ellipse', 'star',
];

type SubjectPalette = { label: string; accent: string; bg: string; cardBg: string };

const CP_PER_LESSON = 40;

type Phase = 'intro' | 'learn' | 'quiz' | 'complete';

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

  const [phase, setPhase]       = useState<Phase>('intro');
  const [slideIdx, setSlideIdx] = useState(0);
  const [quizIdx, setQuizIdx]   = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers]   = useState<boolean[]>([]);
  const [owlMood, setOwlMood]   = useState<OwlMood>('idle');
  const [showConfetti, setShowConfetti] = useState(false);

  const screenFade = useRef(new Animated.Value(1)).current;

  function transition(cb: () => void) {
    Animated.timing(screenFade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(screenFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  function handleStart() {
    playSound('tap');
    setOwlMood('speaking');
    transition(() => { setPhase('learn'); setSlideIdx(0); });
  }

  function handleNextSlide() {
    if (!content) return;
    playSound('slide');
    if (slideIdx < content.slides.length - 1) {
      transition(() => setSlideIdx((i) => i + 1));
    } else {
      setOwlMood('idle');
      transition(() => { setPhase('quiz'); setQuizIdx(0); setSelected(null); setAnswers([]); });
    }
  }

  function handleSelectAnswer(idx: number) {
    if (selected !== null || !content) return;
    setSelected(idx);
    const correct = idx === content.quiz[quizIdx].correct;
    if (correct) {
      playSound('correct');
      setOwlMood('happy');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    } else {
      playSound('wrong');
      setOwlMood('hint');
    }
  }

  function handleNextQuestion() {
    if (!content || selected === null) return;
    const correct = selected === content.quiz[quizIdx].correct;
    const newAnswers = [...answers, correct];
    setOwlMood('idle');

    if (quizIdx < content.quiz.length - 1) {
      transition(() => { setAnswers(newAnswers); setQuizIdx((i) => i + 1); setSelected(null); });
    } else {
      const score = newAnswers.filter(Boolean).length;
      const stars = score === content.quiz.length ? 3 : score >= content.quiz.length - 1 ? 2 : 1;
      completeNode(node!.id, stars, score);
      addXP(CP_PER_LESSON);
      playSound('complete');
      setOwlMood('happy');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      transition(() => { setAnswers(newAnswers); setPhase('complete'); });
    }
  }

  if (!node) {
    return <View style={styles.screen}><Text style={styles.err}>Lesson not found.</Text></View>;
  }

  const sub      = SUBJECT[node.subject];
  const completed = isCompleted(node.id);
  const stars     = nodes[node.id]?.stars ?? 0;
  const score     = answers.filter(Boolean).length;

  return (
    <View style={[styles.screen, { backgroundColor: sub.bg, paddingTop: insets.top }]}>
      {/* Confetti layer */}
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.subjectPill, { backgroundColor: sub.accent + '28', borderColor: sub.accent + '66' }]}>
          <Text style={[styles.subjectPillTxt, { color: sub.accent }]}>{sub.label}  ·  Lv {node.level}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Owl mascot */}
      <View style={styles.owlWrap}>
        <BeeOwl mood={owlMood} size={96} />
      </View>

      <Animated.View style={{ flex: 1, opacity: screenFade }}>
        {phase === 'intro'    && <IntroPhase    node={node} sub={sub} completed={completed} stars={stars} content={content} onStart={handleStart} setOwlMood={setOwlMood} />}
        {phase === 'learn'    && content && <LearnPhase  sub={sub} slides={content.slides} slideIdx={slideIdx} onNext={handleNextSlide} setOwlMood={setOwlMood} />}
        {phase === 'quiz'     && content && <QuizPhase   sub={sub} questions={content.quiz} quizIdx={quizIdx} selected={selected} onSelect={handleSelectAnswer} onNext={handleNextQuestion} />}
        {phase === 'complete' && content && <CompletePhase sub={sub} score={score} total={content.quiz.length} answers={answers} onBack={() => router.back()} />}
      </Animated.View>
    </View>
  );
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntroPhase({ node, sub, completed, stars, content, onStart, setOwlMood }: {
  node: CurriculumNode; sub: SubjectPalette; completed: boolean; stars: number;
  content: LessonContent; onStart: () => void; setOwlMood: (m: OwlMood) => void;
}) {
  const titleTy  = useRef(new Animated.Value(24)).current;
  const titleOp  = useRef(new Animated.Value(0)).current;
  const chipAnims = useRef(
    Array.from({ length: 5 }, () => ({ op: new Animated.Value(0), ty: new Animated.Value(16) }))
  ).current;
  const bottomOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title entrance
    Animated.parallel([
      Animated.spring(titleTy, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.timing(titleOp, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Slide preview chips stagger in
    chipAnims.forEach(({ op, ty }, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(op, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.spring(ty, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
        ]).start();
      }, 200 + i * 100);
    });

    // Stats + button fade in
    setTimeout(() => {
      Animated.timing(bottomOp, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 500);

    // Owl speaks the tagline
    if (content?.tagline) {
      setTimeout(() => {
        setOwlMood?.('speaking');
        Speech.speak(`Let's learn about ${node.title}! ${content.tagline}`, {
          language: 'en-US', rate: 0.84, pitch: 1.05,
          onDone:    () => setOwlMood?.('happy'),
          onStopped: () => setOwlMood?.('happy'),
          onError:   () => setOwlMood?.('happy'),
        });
      }, 700);
    }

    return () => { Speech.stop(); };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.phase, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Title block */}
      <Animated.View style={{ opacity: titleOp, transform: [{ translateY: titleTy }] }}>
        <Text style={[styles.introTitle, { color: sub.accent }]}>{node.title}</Text>
        {content && (
          <Text style={styles.introTagline}>"{content.tagline}"</Text>
        )}
        {completed && (
          <View style={[styles.starsRow, { marginTop: SPACING.sm }]}>
            {[0, 1, 2].map((i) => (
              <Ionicons key={i} name={i < stars ? 'star' : 'star-outline'} size={24} color={i < stars ? '#EF9F27' : '#ffffff22'} />
            ))}
          </View>
        )}
      </Animated.View>

      {/* What you'll learn */}
      {content && (
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>What you'll learn</Text>
          {content.slides.map((slide: LessonSlide, i: number) => {
            const { op, ty } = chipAnims[i] ?? chipAnims[0];
            return (
              <Animated.View
                key={i}
                style={[
                  styles.slidePreviewRow,
                  { backgroundColor: sub.cardBg, borderColor: sub.accent + '33' },
                  { opacity: op, transform: [{ translateY: ty }] },
                ]}
              >
                <View style={[styles.slidePreviewIcon, { backgroundColor: sub.accent + '20' }]}>
                  <Ionicons name={slide.icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color={sub.accent} />
                </View>
                <Text style={styles.slidePreviewText}>{slide.heading}</Text>
                <Ionicons name="chevron-forward" size={14} color={sub.accent + '88'} />
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Stats + CTA */}
      <Animated.View style={[styles.introBottom, { opacity: bottomOp }]}>
        <View style={styles.statRow}>
          <StatChip icon="layers-outline"      label="Slides"     value={String(content?.slides?.length ?? '–')} color={sub.accent} />
          <StatChip icon="help-circle-outline"  label="Questions" value={String(content?.quiz?.length   ?? '–')} color={sub.accent} />
          <StatChip icon="flash-outline"        label="CP Reward" value={`+${CP_PER_LESSON}`}                    color="#EF9F27"  />
        </View>

        {content ? (
          <BigButton
            color={sub.accent}
            icon={completed ? 'refresh' : 'play'}
            label={completed ? 'Play Again' : 'Start Lesson'}
            onPress={onStart}
          />
        ) : (
          <View style={[styles.noContent, { borderColor: sub.accent + '44' }]}>
            <Text style={[styles.noContentTxt, { color: sub.accent }]}>Content coming soon!</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

// ─── Learn (tutor-style) ─────────────────────────────────────────────────────

function LearnPhase({ sub, slides, slideIdx, onNext, setOwlMood }: {
  sub: SubjectPalette; slides: LessonSlide[]; slideIdx: number;
  onNext: () => void; setOwlMood: (m: OwlMood) => void;
}) {
  const slide  = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;

  // Split body into individual lines; filter blanks
  const lines = useMemo(
    () => slide.body.split('\n').filter((l: string) => l.trim()),
    [slide.body],
  );

  const [revealed, setRevealed] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-allocate animations for up to 12 lines
  const lineAnims = useRef(
    Array.from({ length: 12 }, () => ({
      op: new Animated.Value(0),
      ty: new Animated.Value(20),
    })),
  ).current;

  function speakLine(text: string) {
    setOwlMood?.('speaking');
    Speech.stop();
    Speech.speak(text.replace(/^[•·]\s*/, ''), {
      language: 'en-US', rate: 0.82, pitch: 1.05,
      onDone:    () => setOwlMood?.('happy'),
      onStopped: () => setOwlMood?.('happy'),
      onError:   () => setOwlMood?.('happy'),
    });
  }

  function revealLine(idx: number) {
    if (idx >= lines.length) return;
    const { op, ty } = lineAnims[idx];
    op.setValue(0); ty.setValue(20);
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(ty, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
    speakLine(lines[idx]);
    setRevealed(idx + 1);
  }

  // On slide change: reset, then begin revealing
  useEffect(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    Speech.stop();
    setOwlMood?.('happy');
    lineAnims.forEach(({ op, ty }) => { op.setValue(0); ty.setValue(20); });
    setRevealed(0);
    autoTimer.current = setTimeout(() => revealLine(0), 350);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      Speech.stop();
    };
  }, [slideIdx]);

  // Auto-advance to next line after current finishes
  useEffect(() => {
    if (revealed > 0 && revealed < lines.length) {
      autoTimer.current = setTimeout(() => revealLine(revealed), 2400);
    }
  }, [revealed]);

  const allShown = revealed >= lines.length;

  return (
    <ScrollView
      contentContainerStyle={[styles.phase, { paddingBottom: 140 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Slide progress dots */}
      <View style={styles.slideDots}>
        {slides.map((_: any, i: number) => (
          <Animated.View
            key={i}
            style={[styles.slideDot, {
              backgroundColor: i === slideIdx ? sub.accent : sub.accent + '33',
              width: i === slideIdx ? 28 : 10,
            }]}
          />
        ))}
      </View>

      {/* Tutor card — icon + heading + hear-again */}
      <View style={[styles.tutorCard, { backgroundColor: sub.cardBg, borderColor: sub.accent + '55' }]}>
        <View style={[styles.slideIconBadge, { backgroundColor: sub.accent + '20' }]}>
          <Ionicons name={slide.icon as React.ComponentProps<typeof Ionicons>['name']} size={32} color={sub.accent} />
        </View>
        <View style={styles.tutorCardBody}>
          <Text style={[styles.tutorHeading, { color: sub.accent }]}>{slide.heading}</Text>
          <TouchableOpacity
            style={styles.hearAgainBtn}
            onPress={() => { if (revealed > 0) speakLine(lines[revealed - 1]); }}
          >
            <Ionicons name="volume-high" size={14} color={sub.accent} />
            <Text style={[styles.hearAgainTxt, { color: sub.accent }]}>Hear again</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lines revealed one at a time */}
      <View style={styles.linesWrap}>
        {lines.map((line: string, i: number) => {
          if (i >= revealed) return null;
          const { op, ty } = lineAnims[i];
          const isCurrent  = i === revealed - 1;
          return (
            <Animated.View
              key={i}
              style={[
                styles.lineBubble,
                {
                  backgroundColor: isCurrent ? sub.accent + '18' : sub.cardBg,
                  borderColor:     isCurrent ? sub.accent + '66'  : sub.accent + '22',
                },
                { opacity: op, transform: [{ translateY: ty }] },
              ]}
            >
              <View style={[styles.lineDot, { backgroundColor: sub.accent }]} />
              <Text style={styles.lineText}>{line.replace(/^[•·]\s*/, '')}</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Controls */}
      {!allShown && revealed > 0 && (
        <TouchableOpacity
          style={[styles.tapContinueBtn, { borderColor: sub.accent + '55' }]}
          onPress={() => {
            if (autoTimer.current) clearTimeout(autoTimer.current);
            revealLine(revealed);
          }}
        >
          <Ionicons name="chevron-down-circle" size={20} color={sub.accent} />
          <Text style={[styles.tapContinueTxt, { color: sub.accent }]}>Tap to continue</Text>
        </TouchableOpacity>
      )}

      {allShown && (
        <BigButton
          color={sub.accent}
          icon={isLast ? 'checkmark-circle' : 'arrow-forward'}
          label={isLast ? 'Take the Quiz' : 'Next'}
          onPress={onNext}
        />
      )}
    </ScrollView>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function QuizPhase({ sub, questions, quizIdx, selected, onSelect, onNext }: {
  sub: SubjectPalette; questions: QuizQuestion[]; quizIdx: number;
  selected: number | null; onSelect: (i: number) => void; onNext: () => void;
}) {
  const q        = questions[quizIdx];
  const answered = selected !== null;
  const pct      = ((quizIdx + 1) / questions.length) * 100;

  const qSlide   = useRef(new Animated.Value(30)).current;
  const qOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    qSlide.setValue(30); qOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(qSlide,   { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.timing(qOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [quizIdx]);

  return (
    <ScrollView contentContainerStyle={[styles.phase, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
      {/* Progress bar */}
      <KidsProgressBar pct={pct} color={sub.accent} label={`${quizIdx + 1} / ${questions.length}`} />

      {/* Question bubble */}
      <Animated.View
        style={[styles.qBubble, { backgroundColor: sub.cardBg, borderColor: sub.accent + '55' }, { opacity: qOpacity, transform: [{ translateY: qSlide }] }]}
      >
        <Text style={styles.qText}>{q.question}</Text>
      </Animated.View>

      {/* Options — Kahoot grid */}
      <View style={styles.optGrid}>
        {q.options.map((opt: string, idx: number) => (
          <KidsOption
            key={idx}
            idx={idx}
            text={opt}
            color={OPT_COLORS[idx]}
            icon={OPT_ICONS[idx]}
            selected={selected}
            correct={q.correct}
            answered={answered}
            onPress={() => onSelect(idx)}
          />
        ))}
      </View>

      {answered && <FeedbackBanner correct={selected === q.correct} />}
      {answered && (
        <BigButton
          color={sub.accent}
          icon={quizIdx < questions.length - 1 ? 'arrow-forward' : 'flag'}
          label={quizIdx < questions.length - 1 ? 'Next Question' : 'See Results'}
          onPress={onNext}
        />
      )}
    </ScrollView>
  );
}

// ─── Kids Option (Kahoot style) ───────────────────────────────────────────────

function KidsOption({ idx, text, color, icon, selected, correct, answered, onPress }: {
  idx: number; text: string; color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  selected: boolean; correct: boolean; answered: boolean; onPress: () => void;
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
        Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
    if (isRight && isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 350, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 350, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [answered]);

  let bg      = color;
  let opacity = 1;
  let border  = 'transparent';

  if (answered) {
    if (isCorrect)       { bg = color; border = '#fff'; opacity = 1; }
    else if (isSelected) { bg = '#4b4f57'; opacity = 1; }
    else                 { bg = color; opacity = 0.25; }
  }

  return (
    <TouchableOpacity
      activeOpacity={answered ? 1 : 0.85}
      onPress={answered ? undefined : onPress}
      onPressIn={() => !answered && Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => !answered && Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
      style={{ width: (SW - SPACING.lg * 2 - 10) / 2 }}
    >
      <Animated.View
        style={[
          styles.kidsOpt,
          { backgroundColor: bg, borderColor: border, borderWidth: 2.5, opacity },
          { transform: [{ scale: Animated.multiply(scale, pulse) }, { translateX: shakeX }] },
        ]}
      >
        {/* Shape icon */}
        <View style={styles.kidsOptIcon}>
          <Ionicons name={answered && isCorrect ? 'checkmark-circle' : answered && isSelected && !isCorrect ? 'close-circle' : icon} size={22} color="#fff" />
        </View>
        <Text style={styles.kidsOptTxt} numberOfLines={3}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Feedback Banner ──────────────────────────────────────────────────────────

function FeedbackBanner({ correct }: { correct: boolean }) {
  const ty    = useRef(new Animated.Value(16)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const op    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(ty,    { toValue: 0, tension: 100, friction: 7, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
      Animated.timing(op,    { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  const bg      = correct ? '#14b8a626' : '#ef444426';
  const bc      = correct ? '#14b8a6'   : '#ef4444';
  const icon    = correct ? 'checkmark-circle' : 'close-circle';
  const title   = correct ? 'Correct!'         : 'Not quite!';
  const subtitle = correct ? 'Amazing work — keep going!' : 'The highlighted answer is right.';

  return (
    <Animated.View style={[styles.feedBanner, { backgroundColor: bg, borderColor: bc }, { opacity: op, transform: [{ translateY: ty }, { scale }] }]}>
      <View style={styles.feedRow}>
        <Ionicons name={icon as any} size={22} color={bc} />
        <Text style={[styles.feedTitle, { color: bc }]}>{title}</Text>
      </View>
      <Text style={[styles.feedSub, { color: bc }]}>{subtitle}</Text>
    </Animated.View>
  );
}

// ─── Complete ─────────────────────────────────────────────────────────────────

function CompletePhase({ sub, score, total, answers, onBack }: {
  sub: SubjectPalette; score: number; total: number;
  answers: (number | null)[]; onBack: () => void;
}) {
  const stars = score === total ? 3 : score >= total - 1 ? 2 : 1;

  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOp    = useRef(new Animated.Value(0)).current;
  const star0     = useRef(new Animated.Value(0)).current;
  const star1     = useRef(new Animated.Value(0)).current;
  const star2     = useRef(new Animated.Value(0)).current;
  const starScales = [star0, star1, star2];
  const bottomOp  = useRef(new Animated.Value(0)).current;
  const bottomTy  = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }),
      Animated.timing(cardOp, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      starScales.forEach((s, i) => setTimeout(() =>
        Animated.spring(s, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }).start(),
        i * 180
      ));
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(bottomTy, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
          Animated.timing(bottomOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 700);
    });
  }, []);

  const msgs = ['Keep practising!', 'Good effort!', 'Almost perfect!', 'PERFECT SCORE!'];

  return (
    <ScrollView contentContainerStyle={styles.phase} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.completeCard, { backgroundColor: sub.cardBg, borderColor: sub.accent + '55' }, { opacity: cardOp, transform: [{ scale: cardScale }] }]}>
        <View style={[styles.completeIconWrap, { backgroundColor: sub.accent + '22' }]}>
            <Ionicons name={score === total ? 'trophy' : 'school'} size={56} color={score === total ? '#EF9F27' : sub.accent} />
          </View>
        <Text style={[styles.completeTitle, { color: sub.accent }]}>Lesson Complete!</Text>
        <Text style={styles.completeMsg}>{msgs[score] ?? msgs[0]}</Text>

        {/* Stars pop in */}
        <View style={styles.bigStarsRow}>
          {starScales.map((s, i) => (
            <Animated.View key={i} style={{ transform: [{ scale: s }] }}>
              <Ionicons name={i < stars ? 'star' : 'star-outline'} size={48} color={i < stars ? '#EF9F27' : '#ffffff22'} />
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Score + CP tiles */}
      <Animated.View style={[styles.resultRow, { opacity: bottomOp, transform: [{ translateY: bottomTy }] }]}>
        <ResultBlock icon="trophy-outline" value={`${score}/${total}`} label="Score"     bg={sub.cardBg}  border={sub.accent} />
        <ResultBlock icon="flash"          value={`+${CP_PER_LESSON}`} label="CP Earned" bg="#2a1e04"    border="#EF9F27"  />
      </Animated.View>

      {/* Per-Q review */}
      <Animated.View style={[{ opacity: bottomOp, transform: [{ translateY: bottomTy }] }]}>
        <View style={[styles.reviewCard, { backgroundColor: sub.cardBg, borderColor: sub.accent + '33' }]}>
          {answers.map((ok: boolean, i: number) => (
            <View key={i} style={styles.reviewRow}>
              <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={18} color={ok ? '#14b8a6' : '#ef4444'} />
              <Text style={[styles.reviewTxt, { color: ok ? '#14b8a6' : '#ef4444' }]}>
                Question {i + 1} — {ok ? 'Correct!' : 'Wrong'}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[{ opacity: bottomOp }]}>
        <BigButton color={sub.accent} icon="git-branch" label="Back to Skill Tree" onPress={onBack} />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#f97316', '#0ea5e9', '#a855f7', '#14b8a6', '#EF9F27', '#ec4899', '#22c55e'];

const N_CONFETTI = 22;

function Confetti() {
  const anims = useRef(
    Array.from({ length: N_CONFETTI }, () => ({
      x: new Animated.Value(SW / 2),
      y: new Animated.Value(180),
      op: new Animated.Value(1),
      rot: new Animated.Value(0),
    }))
  ).current;

  const meta = useRef(
    Array.from({ length: N_CONFETTI }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      angle: (i / N_CONFETTI) * Math.PI * 2,
      dist: 100 + Math.random() * 140,
      size: 7 + Math.random() * 7,
    }))
  ).current;

  const particles = anims.map((a, i) => ({ ...a, ...meta[i] }));

  useEffect(() => {
    particles.forEach((p) => {
      const tx = (p.x as any)._value + Math.cos(p.angle) * p.dist;
      const ty = (p.y as any)._value + Math.sin(p.angle) * p.dist;
      Animated.parallel([
        Animated.timing(p.x,   { toValue: tx, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(p.y,   { toValue: ty + 80, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: false }),
        Animated.timing(p.op,  { toValue: 0, duration: 800, useNativeDriver: false }),
        Animated.timing(p.rot, { toValue: Math.random() > 0.5 ? 1 : -1, duration: 800, useNativeDriver: false }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rot.interpolate({ inputRange: [-1, 1], outputRange: ['-180deg', '180deg'] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: p.size, height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              left: p.x, top: p.y,
              opacity: p.op,
              transform: [{ rotate }],
            }}
          />
        );
      })}
    </View>
  );
}

// ─── KidsProgressBar ──────────────────────────────────────────────────────────

function KidsProgressBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(w, { toValue: pct, tension: 60, friction: 8, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={styles.progWrap}>
      <View style={styles.progTrack}>
        <Animated.View style={[styles.progFill, { backgroundColor: color, width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
      </View>
      <Text style={[styles.progLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View style={[styles.statChip, { borderColor: color + '44' }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

// ─── BigButton ────────────────────────────────────────────────────────────────

function BigButton({ color, label, icon, onPress }: {
  color: string;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
    >
      <Animated.View style={[styles.bigBtn, { backgroundColor: color, transform: [{ scale }] }]}>
        {icon && <Ionicons name={icon} size={20} color="#fff" />}
        <Text style={styles.bigBtnTxt}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── ResultBlock ──────────────────────────────────────────────────────────────

function ResultBlock({ icon, value, label, bg, border }: { icon: React.ComponentProps<typeof Ionicons>['name']; value: string; label: string; bg: string; border: string }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => { Animated.spring(scale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={[styles.resultBlock, { backgroundColor: bg, borderColor: border + '66' }, { transform: [{ scale }] }]}>
      <Ionicons name={icon} size={32} color={border} />
      <Text style={[styles.resultVal, { color: border }]}>{value}</Text>
      <Text style={styles.resultLbl}>{label}</Text>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  err: { color: '#fff', fontFamily: FONTS.body, fontSize: 15, textAlign: 'center', marginTop: 60 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ffffff18', alignItems: 'center', justifyContent: 'center',
  },
  subjectPill: {
    paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  subjectPillTxt: { fontFamily: FONTS.heading, fontSize: 12 },

  owlWrap: { alignItems: 'center', paddingBottom: SPACING.xs },

  phase: { paddingHorizontal: SPACING.lg, paddingBottom: 120, gap: SPACING.lg },

  // Intro
  introTitle:  { fontFamily: FONTS.display, fontSize: 28, color: '#fff' },
  introTagline: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: '#ffffffaa', fontStyle: 'italic', marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: SPACING.sm },

  previewSection: { gap: SPACING.sm },
  previewLabel: {
    fontFamily: FONTS.heading, fontSize: 13,
    color: 'rgba(255,255,255,0.45)', letterSpacing: 0.6, textTransform: 'uppercase',
  },
  slidePreviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: 14, borderWidth: 1.5, padding: SPACING.md, ...SHADOWS.sm,
  },
  slidePreviewIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  slidePreviewText: {
    flex: 1, fontFamily: FONTS.bodyMedium, fontSize: 14, color: '#ffffffcc',
  },
  introBottom: { gap: SPACING.md },

  statRow: { flexDirection: 'row', gap: SPACING.md },
  statChip: {
    flex: 1, alignItems: 'center', gap: 4, padding: SPACING.md,
    backgroundColor: '#ffffff08', borderRadius: RADIUS.lg, borderWidth: 1.5,
  },
  statVal: { fontFamily: FONTS.heading, fontSize: 15 },
  statLbl: { fontFamily: FONTS.body, fontSize: 11, color: '#ffffff66' },

  noContent: {
    padding: SPACING.xl, alignItems: 'center', borderRadius: RADIUS.xl, borderWidth: 2,
    backgroundColor: '#ffffff08',
  },
  noContentTxt: { fontFamily: FONTS.heading, fontSize: 15 },

  // Slide progress
  slideDots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  slideDot:  { height: 10, borderRadius: 5 },

  // Tutor card
  tutorCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: 18, borderWidth: 1.5, padding: SPACING.lg, ...SHADOWS.sm,
  },
  slideIconBadge: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tutorCardBody: { flex: 1, gap: 6 },
  tutorHeading:  { fontFamily: FONTS.heading, fontSize: 17, color: '#fff' },
  hearAgainBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  hearAgainTxt:  { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // Revealed lines
  linesWrap: { gap: SPACING.sm },
  lineBubble: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    borderRadius: 14, borderWidth: 1.5, padding: SPACING.md,
  },
  lineDot:  { width: 8, height: 8, borderRadius: 4, marginTop: 7, flexShrink: 0 },
  lineText: {
    flex: 1, fontFamily: FONTS.bodyMedium, fontSize: 15,
    color: '#ffffffcc', lineHeight: 24,
  },
  tapContinueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1.5,
  },
  tapContinueTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13 },

  // Quiz
  progWrap:  { gap: 4 },
  progTrack: { height: 10, backgroundColor: '#ffffff18', borderRadius: 5, overflow: 'hidden' },
  progFill:  { height: '100%', borderRadius: 5 },
  progLabel: { fontFamily: FONTS.heading, fontSize: 13, textAlign: 'right' },

  qBubble: {
    borderRadius: 20, borderWidth: 2, padding: SPACING.xl, ...SHADOWS.sm,
  },
  qText: { fontFamily: FONTS.heading, fontSize: 18, color: '#fff', lineHeight: 28, textAlign: 'center' },

  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kidsOpt: {
    borderRadius: 18, padding: SPACING.lg,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 100, gap: SPACING.sm, ...SHADOWS.md,
  },
  kidsOptIcon: { /* just the icon */ },
  kidsOptTxt: {
    fontFamily: FONTS.heading, fontSize: 14, color: '#fff',
    textAlign: 'center', lineHeight: 20,
  },

  // Feedback
  feedBanner: {
    borderRadius: 18, borderWidth: 2, padding: SPACING.lg, alignItems: 'center', gap: 6,
  },
  feedRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedTitle: { fontFamily: FONTS.display, fontSize: 18, color: '#fff' },
  feedSub:   { fontFamily: FONTS.bodyMedium, fontSize: 13 },

  // BigButton
  bigBtn: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingVertical: 18, borderRadius: 20, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: SPACING.xl, ...SHADOWS.md,
  },
  bigBtnTxt: { fontFamily: FONTS.display, fontSize: 18, color: '#fff' },

  // Complete
  completeCard: {
    borderRadius: 24, borderWidth: 2, padding: SPACING.xl,
    alignItems: 'center', gap: SPACING.md, ...SHADOWS.md,
  },
  completeIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  completeTitle: { fontFamily: FONTS.display, fontSize: 28 },
  completeMsg:   { fontFamily: FONTS.bodyMedium, fontSize: 15, color: '#ffffffaa', textAlign: 'center' },
  bigStarsRow:   { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },

  resultRow:  { flexDirection: 'row', gap: SPACING.md },
  resultBlock: {
    flex: 1, alignItems: 'center', gap: SPACING.sm, padding: SPACING.xl,
    borderRadius: 20, borderWidth: 2, ...SHADOWS.sm,
  },
  resultVal:   { fontFamily: FONTS.display, fontSize: 26 },
  resultLbl:   { fontFamily: FONTS.body, fontSize: 12, color: '#ffffff88' },

  reviewCard: {
    borderRadius: 20, borderWidth: 1.5, padding: SPACING.lg, gap: SPACING.md,
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewTxt:  { fontFamily: FONTS.heading, fontSize: 14 },
});
