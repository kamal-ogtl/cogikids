import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { BeeOwl } from '../../src/components/companion/BeeOwl';
import { KidAvatar } from '../../src/components/characters/KidAvatar';
import { NumborrChar, SkillsChar } from '../../src/components/characters/BossCharacters';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useQuestStore } from '../../src/store/useQuestStore';
import {
  EnglishIcon,
  MathIcon,
  ScienceIcon,
  SocialIcon,
} from '../../src/components/characters/SubjectIcons';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { SUBJECT_BG } from '../../src/components/characters/SubjectBg';
import { CAROUSEL_BG } from '../../src/components/characters/CarouselBg';

const { width: SCREEN_W } = Dimensions.get('window');
const CAROUSEL_CARD_W = SCREEN_W - SPACING.lg * 2;
const CAROUSEL_SNAP   = CAROUSEL_CARD_W + SPACING.md;

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface FeaturedItem {
  id: string;
  title: string;
  sub: string;
  color: string;
  reward: string;
  route: string;
  icon: IoniconsName;
  Char: React.ComponentType<{ size?: number }>;
}

const FEATURED: FeaturedItem[] = [
  {
    id: 'bee',
    title: 'Spelling\nBee',
    sub: 'Spell words, earn CP!',
    color: COLORS.brand.primary,
    reward: '15 CP / word',
    route: '/(tabs)/bee',
    icon: 'mic',
    Char: ({ size }) => <BeeOwl mood="happy" size={size ?? 110} />,
  },
  {
    id: 'arena',
    title: 'Battle\nArena',
    sub: 'Defeat bosses to earn CP!',
    color: '#f97316',
    reward: 'Up to 100 CP',
    route: '/(tabs)/arena',
    icon: 'flash',
    Char: NumborrChar,
  },
  {
    id: 'skills',
    title: 'Skills\nTree',
    sub: 'Master new lessons!',
    color: COLORS.semantic.correct,
    reward: '25 CP / lesson',
    route: '/(tabs)/skills',
    icon: 'git-branch',
    Char: SkillsChar,
  },
];

type SubjectId = 'english' | 'math' | 'science' | 'social';

interface Subject {
  id: SubjectId;
  name: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  route: string | null;
  totalLessons: number;
}

const SUBJECTS: Subject[] = [
  { id: 'english', name: 'English', color: COLORS.subjects.english, Icon: EnglishIcon,  route: '/(tabs)/skills', totalLessons: 8 },
  { id: 'math',    name: 'Math',    color: COLORS.subjects.math,    Icon: MathIcon,     route: '/(tabs)/skills', totalLessons: 6 },
  { id: 'science', name: 'Science', color: COLORS.subjects.science, Icon: ScienceIcon,  route: '/(tabs)/skills', totalLessons: 4 },
  { id: 'social',  name: 'Social',  color: COLORS.subjects.social,  Icon: SocialIcon,   route: '/(tabs)/skills', totalLessons: 4 },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const player = usePlayerStore((s) => s.player);

  const xpPercent = Math.min(
    100,
    Math.round(((player?.xp ?? 0) / (player?.xpToNextLevel ?? 500)) * 100),
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef   = useRef<ScrollView>(null);
  const autoTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeSlideRef = useRef(0);

  function startAutoScroll() {
    if (autoTimer.current) return;
    autoTimer.current = setInterval(() => {
      const next = (activeSlideRef.current + 1) % FEATURED.length;
      carouselRef.current?.scrollTo({ x: next * CAROUSEL_SNAP, animated: true });
      activeSlideRef.current = next;
      setActiveSlide(next);
    }, 3000);
  }

  function stopAutoScroll() {
    if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
  }

  const a0 = useRef(new Animated.Value(0)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(
      80,
      [a0, a1, a2, a3].map((a) =>
        Animated.spring(a, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      ),
    ).start();
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  function fadeUp(a: Animated.Value) {
    return {
      opacity: a,
      transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
    };
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.sm }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, fadeUp(a0)]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)} activeOpacity={0.8}>
          <KidAvatar name={player?.name ?? 'L'} size={54} />
        </TouchableOpacity>
        <View style={styles.greetCol}>
          <View style={styles.greetRow}>
            <Text style={styles.greetingText} numberOfLines={1}>
              Hey, {player?.name ?? 'Learner'}!
            </Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color={COLORS.semantic.gold} />
              <Text style={styles.streakText}>{player?.streakDays ?? 0}</Text>
            </View>
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.levelTxt}>LVL {player?.level ?? 1}</Text>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
            </View>
            <Text style={styles.xpPct}>{xpPercent}%</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Featured Carousel ─────────────────────────────────────────── */}
      <Animated.View style={[styles.carouselWrap, fadeUp(a1)]}>
        <ScrollView
          ref={carouselRef}
          horizontal
          snapToInterval={CAROUSEL_SNAP}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          onScrollBeginDrag={stopAutoScroll}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_SNAP);
            const clamped = Math.max(0, Math.min(idx, FEATURED.length - 1));
            activeSlideRef.current = clamped;
            setActiveSlide(clamped);
            startAutoScroll();
          }}
          scrollEventThrottle={16}
        >
          {FEATURED.map((item) => (
            <FeaturedCard
              key={item.id}
              item={item}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </ScrollView>
        <View style={styles.dotRow}>
          {FEATURED.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
          ))}
        </View>
      </Animated.View>

      {/* ── Subjects ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, fadeUp(a2)]}>
        <Text style={styles.sectionTitle}>Subjects</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectScroll}
          style={styles.subjectScrollOuter}
        >
          <SubjectCard subject={SUBJECTS[0]} onPress={() => router.push({ pathname: '/(tabs)/skills', params: { subject: 'english' } } as any)} starsEarned={player?.totalStars ?? 0} />
          <SubjectCard subject={SUBJECTS[1]} onPress={() => router.push({ pathname: '/(tabs)/skills', params: { subject: 'math' } } as any)} starsEarned={0} />
          <SubjectCard subject={SUBJECTS[2]} onPress={() => router.push({ pathname: '/(tabs)/skills', params: { subject: 'science' } } as any)} starsEarned={0} />
          <SubjectCard subject={SUBJECTS[3]} onPress={() => router.push({ pathname: '/(tabs)/skills', params: { subject: 'social' } } as any)} starsEarned={0} />
        </ScrollView>
      </Animated.View>

      {/* ── Daily Quest ───────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, fadeUp(a3)]}>
        <Text style={styles.sectionTitle}>Daily Quest</Text>
        <QuestCard onPress={() => router.push('/(tabs)/bee' as any)} />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

function FeaturedCard({ item, onPress }: { item: FeaturedItem; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.featCard, { backgroundColor: item.color, width: CAROUSEL_CARD_W, transform: [{ scale }] }]}>
        {/* Themed background illustration */}
        {(() => { const Bg = CAROUSEL_BG[item.id]; return Bg ? <Bg /> : null; })()}
        {/* Depth blobs */}
        <View style={[styles.blob, { top: -28, right: 70, width: 110, height: 110 }]} />
        <View style={[styles.blob, { bottom: -18, right: -12, width: 85, height: 85 }]} />

        {/* Left content */}
        <View style={styles.featLeft}>
          <View style={styles.featBadge}>
            <Ionicons name={item.icon} size={11} color="#fff" />
            <Text style={styles.featBadgeText}>{item.id.toUpperCase()}</Text>
          </View>
          <Text style={styles.featTitle}>{item.title}</Text>
          <Text style={styles.featSub}>{item.sub}</Text>
          <View style={styles.featCTA}>
            <Ionicons name="play" size={13} color={item.color} />
            <Text style={[styles.featCTAText, { color: item.color }]}>Play Now</Text>
          </View>
        </View>

        {/* Right: character illustration */}
        <View style={styles.featRight}>
          <item.Char size={110} />
        </View>

        {/* Reward badge */}
        <View style={styles.featReward}>
          <Ionicons name="star" size={11} color={COLORS.semantic.gold} />
          <Text style={styles.featRewardTxt}>{item.reward}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────────

const RING_SIZE = 88;
const RING_R    = 36;
const RING_CIRC = 2 * Math.PI * RING_R;

function ProgressRing({ progress, color, Icon }: { progress: number; color: string; Icon: React.ComponentType<{ size?: number; color?: string }> }) {
  const dashOffset = RING_CIRC * (1 - Math.min(progress, 100) / 100);
  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
        <SvgCircle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          stroke="rgba(255,255,255,0.2)" strokeWidth={6} fill="none" />
        <SvgCircle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          stroke="rgba(255,255,255,0.9)" strokeWidth={6} fill="none"
          strokeDasharray={RING_CIRC} strokeDashoffset={dashOffset}
          strokeLinecap="round" rotation="-90" origin={`${RING_SIZE / 2},${RING_SIZE / 2}`} />
      </Svg>
      <Icon size={36} color="#fff" />
    </View>
  );
}

// ─── Subject card ─────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  onPress,
  starsEarned,
}: {
  subject: Subject;
  onPress: (() => void) | null;
  starsEarned: number;
}) {
  const scale    = useRef(new Animated.Value(1)).current;
  const isLocked = onPress === null;
  const progress = isLocked ? 0 : Math.min(100, Math.round((starsEarned / (subject.totalLessons * 3)) * 100));

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 0.7 : 1}
      onPressIn={isLocked ? undefined : () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 8 }).start()}
      onPressOut={isLocked ? undefined : () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 6 }).start()}
      onPress={onPress ?? undefined}
      disabled={isLocked}
    >
      <Animated.View
        style={[
          styles.subjectCard,
          {
            backgroundColor: isLocked ? COLORS.bg.card : subject.color,
            borderColor: isLocked ? COLORS.bg.border : 'rgba(255,255,255,0.2)',
            transform: [{ scale }],
          },
        ]}
      >
        {/* Subject-themed background illustration */}
        {(() => { const Bg = SUBJECT_BG[subject.id]; return Bg ? <Bg /> : null; })()}
        {/* Subtle colour blobs on top of illustration */}
        <View style={[styles.subjectBlob1, { backgroundColor: 'rgba(0,0,0,0.06)' }]} />
        <View style={[styles.subjectBlob2, { backgroundColor: 'rgba(0,0,0,0.04)' }]} />

        {/* Progress ring with icon */}
        <View style={styles.subjectRingWrap}>
          {isLocked
            ? (
              <View style={styles.subjectRingLocked}>
                <Ionicons name="lock-closed" size={28} color={COLORS.text.disabled} />
              </View>
            )
            : <ProgressRing progress={progress} color={subject.color} Icon={subject.Icon} />
          }
        </View>

        {/* Name */}
        <Text style={[styles.subjectName, { color: isLocked ? COLORS.text.disabled : '#fff' }]} numberOfLines={1}>
          {subject.name}
        </Text>

        {/* Lessons count */}
        <Text style={[styles.subjectLessons, { color: isLocked ? COLORS.text.disabled : 'rgba(255,255,255,0.75)' }]}>
          {subject.totalLessons} lessons
        </Text>

        {/* Stars row */}
        <View style={styles.subjectStarsRow}>
          <Ionicons name="star" size={12} color={isLocked ? COLORS.text.disabled : COLORS.semantic.gold} />
          <Text style={[styles.subjectStarsTxt, { color: isLocked ? COLORS.text.disabled : COLORS.semantic.gold }]}>
            {isLocked ? '—' : `${starsEarned} earned`}
          </Text>
        </View>

        {/* CTA */}
        <View style={[
          styles.subjectCTA,
          isLocked
            ? { backgroundColor: COLORS.bg.cardAlt, borderColor: COLORS.bg.border }
            : { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: 'rgba(255,255,255,0.35)' },
        ]}>
          {isLocked
            ? <Text style={[styles.subjectCTATxt, { color: COLORS.text.disabled }]}>Coming soon</Text>
            : <>
                <Ionicons name="play" size={11} color="#fff" />
                <Text style={[styles.subjectCTATxt, { color: '#fff' }]}>
                  {progress > 0 ? 'Continue' : 'Start'}
                </Text>
              </>
          }
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Quest card ───────────────────────────────────────────────────────────────

function QuestCard({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { roundsToday, dailyGoal } = useQuestStore();
  const done = Math.min(roundsToday, dailyGoal);
  const completed = done >= dailyGoal;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.questCard, { transform: [{ scale }] }]}>
        <View style={styles.questIconWrap}>
          <Ionicons
            name={completed ? 'shield-checkmark' : 'shield-checkmark-outline'}
            size={28}
            color={completed ? COLORS.semantic.correct : COLORS.semantic.gold}
          />
        </View>
        <View style={styles.questBody}>
          <Text style={styles.questTitle}>Complete {dailyGoal} Spelling Rounds</Text>
          <Text style={styles.questSub}>{done}/{dailyGoal} done today</Text>
          <View style={styles.questDots}>
            {Array.from({ length: dailyGoal }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.questDot,
                  i < done && { backgroundColor: COLORS.semantic.gold },
                ]}
              />
            ))}
          </View>
        </View>
        <View style={styles.questRight}>
          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={11} color={COLORS.semantic.gold} />
            <Text style={styles.rewardText}> +50 CP</Text>
          </View>
          {!completed && (
            <View style={styles.questPlay}>
              <Ionicons name="play" size={15} color="#fff" />
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  greetCol: { flex: 1, gap: 6 },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.text.primary, flex: 1 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3d2e00',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    flexShrink: 0,
    marginLeft: SPACING.sm,
  },
  streakText: { fontFamily: FONTS.display, fontSize: 15, color: COLORS.semantic.gold },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelTxt: { fontFamily: FONTS.heading, fontSize: 11, color: COLORS.brand.primary, flexShrink: 0 },
  xpBarTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.bg.border,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.brand.primary,
  },
  xpPct: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.text.muted, flexShrink: 0 },

  // Carousel — break out of parent paddingHorizontal to span full screen width
  carouselWrap: { gap: SPACING.sm, marginHorizontal: -SPACING.lg },
  carouselContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.bg.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.brand.primary,
  },

  // Featured card
  featCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 170,
    ...SHADOWS.lg,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  featLeft: { flex: 1, gap: SPACING.sm, zIndex: 1 },
  featBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
  },
  featBadgeText: { fontFamily: FONTS.heading, fontSize: 10, color: '#fff', letterSpacing: 0.6 },
  featTitle:     { fontFamily: FONTS.display, fontSize: 30, color: '#fff', lineHeight: 34 },
  featSub:       { fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  featCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  featCTAText: { fontFamily: FONTS.heading, fontSize: 13 },
  featRight: { width: 115, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  featIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featReward: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  featRewardTxt: { fontFamily: FONTS.heading, fontSize: 11, color: COLORS.semantic.gold },

  // Section
  section:      { gap: SPACING.md },
  sectionTitle: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.text.primary },

  // Subjects horizontal scroll
  subjectScrollOuter: { marginHorizontal: -SPACING.lg },
  subjectScroll: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xs },

  subjectCard: {
    width: 148,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.md,
    gap: SPACING.xs,
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  subjectBlob1: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  subjectBlob2: {
    position: 'absolute',
    bottom: -18,
    left: -18,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  subjectRingWrap: { marginVertical: SPACING.xs },
  subjectRingLocked: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: COLORS.bg.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.bg.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectName:     { fontFamily: FONTS.display, fontSize: 16, textAlign: 'center' },
  subjectLessons:  { fontFamily: FONTS.body, fontSize: 11, textAlign: 'center' },
  subjectStarsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  subjectStarsTxt: { fontFamily: FONTS.heading, fontSize: 11 },
  subjectCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  subjectCTATxt: { fontFamily: FONTS.heading, fontSize: 12 },

  // Quest
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.semantic.gold + '50',
    padding: SPACING.lg,
    ...SHADOWS.md,
    shadowColor: COLORS.semantic.gold,
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  questIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3d2e00',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questBody:  { flex: 1, minWidth: 0, gap: 4 },
  questTitle: { fontFamily: FONTS.display, fontSize: 15, color: COLORS.text.primary },
  questSub:   { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text.muted },
  questDots:  { flexDirection: 'row', gap: 5, marginTop: 2 },
  questDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.bg.border,
  },
  questRight:  { alignItems: 'center', gap: SPACING.sm, flexShrink: 0 },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d2e00',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  rewardText: { fontFamily: FONTS.heading, fontSize: 11, color: COLORS.semantic.gold },
  questPlay: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.semantic.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
});
