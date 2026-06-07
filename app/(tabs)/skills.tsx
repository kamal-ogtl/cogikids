/**
 * Skills screen — the curriculum skill tree. Lets the player switch between the
 * four subjects and shows each node's unlock/completion state with stars. Opens
 * on the subject passed via the `subject` route param (defaults to English).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BeeOwl } from '../../src/components/companion/BeeOwl';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { CURRICULUM_NODES, type CurriculumNode, type Subject } from '../../src/constants/curriculum';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useProgressStore } from '../../src/store/useProgressStore';
import {
  EnglishIcon, MathIcon, ScienceIcon, SocialIcon,
} from '../../src/components/characters/SubjectIcons';
import { SUBJECT_BG } from '../../src/components/characters/SubjectBg';

interface SubjectConfig {
  id: Subject;
  label: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const SUBJECTS: SubjectConfig[] = [
  { id: 'english', label: 'English', color: COLORS.subjects.english, Icon: EnglishIcon },
  { id: 'math',    label: 'Math',    color: COLORS.subjects.math,    Icon: MathIcon },
  { id: 'science', label: 'Science', color: COLORS.subjects.science, Icon: ScienceIcon },
  { id: 'social',  label: 'Social',  color: COLORS.subjects.social,  Icon: SocialIcon },
];

function getSubjectConfig(subject: Subject) {
  return SUBJECTS.find((s) => s.id === subject)!;
}

function getSubjectNodes(ageGroup: string, subject: Subject) {
  return CURRICULUM_NODES
    .filter((n) => n.ageGroup === ageGroup && n.subject === subject)
    .sort((a, b) => a.level - b.level);
}

export default function SkillsScreen() {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const player      = usePlayerStore((s) => s.player);
  const unlockNode  = useProgressStore((s) => s.unlockNode);
  const isUnlocked  = useProgressStore((s) => s.isUnlocked);
  const isCompleted = useProgressStore((s) => s.isCompleted);
  const nodes       = useProgressStore((s) => s.nodes);

  const { subject: subjectParam } = useLocalSearchParams<{ subject?: string }>();
  const ageGroup = player?.ageGroup ?? 'explorer';
  const validSubjects: Subject[] = ['english', 'math', 'science', 'social'];
  const initialSubject: Subject = validSubjects.includes(subjectParam as Subject)
    ? (subjectParam as Subject)
    : 'english';
  const [activeSubject, setActiveSubject] = useState<Subject>(initialSubject);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const tabsAnim   = useRef(new Animated.Value(0)).current;
  const listAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    CURRICULUM_NODES
      .filter((n) => n.ageGroup === ageGroup && !n.prerequisite)
      .forEach((n) => unlockNode(n.id));
  }, [ageGroup, unlockNode]);

  useEffect(() => {
    CURRICULUM_NODES.forEach((n) => {
      if (n.prerequisite && isCompleted(n.prerequisite)) unlockNode(n.id);
    });
  }, [nodes, unlockNode, isCompleted]);

  useEffect(() => {
    Animated.stagger(70, [
      Animated.spring(headerAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.spring(tabsAnim,   { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.spring(listAnim,   { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    listAnim.setValue(0);
    Animated.spring(listAnim, { toValue: 1, tension: 90, friction: 11, useNativeDriver: true }).start();
  }, [activeSubject]);

  const subjectConfig  = getSubjectConfig(activeSubject);
  const visibleNodes   = useMemo(() => getSubjectNodes(ageGroup, activeSubject), [ageGroup, activeSubject]);
  const completedCount = useMemo(() => visibleNodes.filter((n) => isCompleted(n.id)).length, [visibleNodes, isCompleted]);

  const nextNode = useMemo(
    () => visibleNodes.find((n) => isUnlocked(n.id) && !isCompleted(n.id)) ?? visibleNodes[0],
    [visibleNodes, isUnlocked, isCompleted],
  );

  function fadeUp(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
    };
  }

  function handleNodePress(node: CurriculumNode) {
    if (!isUnlocked(node.id)) return;
    router.push(`/lesson/${node.id}` as any);
  }

  const SubjectBgComp = SUBJECT_BG[activeSubject];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.headerRow, fadeUp(headerAnim)]}>
        <Text style={styles.screenTitle}>Skill Tree</Text>
        <View style={[styles.levelBadge, { backgroundColor: subjectConfig.color + '22', borderColor: subjectConfig.color + '55' }]}>
          <Ionicons name="trophy" size={13} color={subjectConfig.color} />
          <Text style={[styles.levelBadgeTxt, { color: subjectConfig.color }]}>Lv {player?.level ?? 1}</Text>
        </View>
      </Animated.View>

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <Animated.View style={[styles.heroCard, { backgroundColor: subjectConfig.color }, fadeUp(headerAnim)]}>
        {SubjectBgComp && <SubjectBgComp />}
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />

        <View style={styles.heroContent}>
          <View style={styles.heroLeft}>
            <View style={styles.heroNextBadge}>
              <Ionicons name="play" size={10} color="#fff" />
              <Text style={styles.heroNextTxt}>NEXT UP</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {nextNode?.title ?? 'All done!'}
            </Text>
            <View style={styles.heroProgress}>
              <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroProgressTxt}>
                {completedCount} / {visibleNodes.length} lessons done
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heroCTA}
              onPress={() => nextNode && handleNodePress(nextNode)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={13} color={subjectConfig.color} />
              <Text style={[styles.heroCTATxt, { color: subjectConfig.color }]}>
                {completedCount > 0 ? 'Continue' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroOwl}>
            <BeeOwl mood="happy" size={100} />
          </View>
        </View>
      </Animated.View>

      {/* ── Subject tabs ────────────────────────────────────────────────── */}
      <Animated.View style={fadeUp(tabsAnim)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {SUBJECTS.map((subject) => {
            const active = subject.id === activeSubject;
            return (
              <TouchableOpacity
                key={subject.id}
                activeOpacity={0.8}
                onPress={() => setActiveSubject(subject.id)}
              >
                <View style={[
                  styles.tab,
                  active
                    ? { backgroundColor: subject.color, borderColor: subject.color }
                    : { backgroundColor: COLORS.bg.card, borderColor: COLORS.bg.border },
                ]}>
                  <subject.Icon size={16} color={active ? '#fff' : COLORS.text.disabled} />
                  <Text style={[styles.tabLabel, { color: active ? '#fff' : COLORS.text.disabled }]}>
                    {subject.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Path ────────────────────────────────────────────────────────── */}
      <Animated.ScrollView
        style={styles.pathScroll}
        contentContainerStyle={styles.pathContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pathRoot}>
          {/* Centre spine */}
          <View style={[styles.spine, { backgroundColor: subjectConfig.color + '28' }]} />

          {visibleNodes.map((node, index) => {
            const unlocked  = isUnlocked(node.id);
            const completed = isCompleted(node.id);
            const stars     = completed ? 3 : (nodes[node.id]?.stars ?? 0);
            const isCurrent = node.id === nextNode?.id;
            const side      = index % 2 === 0 ? 'left' : 'right';

            return (
              <View key={node.id} style={styles.pathRow}>
                {/* Left slot */}
                <View style={styles.slot}>
                  {side === 'left' && (
                    <PathNode
                      node={node}
                      config={subjectConfig}
                      unlocked={unlocked}
                      completed={completed}
                      stars={stars}
                      isCurrent={isCurrent}
                      side="left"
                      onPress={() => handleNodePress(node)}
                    />
                  )}
                </View>

                {/* Centre connector */}
                <View style={styles.connectorCol}>
                  <View style={[
                    styles.connDot,
                    { backgroundColor: completed ? subjectConfig.color : unlocked ? subjectConfig.color + '88' : COLORS.bg.border },
                  ]} />
                  {index < visibleNodes.length - 1 && (
                    <DotLine color={subjectConfig.color} unlocked={unlocked} />
                  )}
                </View>

                {/* Right slot */}
                <View style={styles.slot}>
                  {side === 'right' && (
                    <PathNode
                      node={node}
                      config={subjectConfig}
                      unlocked={unlocked}
                      completed={completed}
                      stars={stars}
                      isCurrent={isCurrent}
                      side="right"
                      onPress={() => handleNodePress(node)}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Dot connector ────────────────────────────────────────────────────────────

function DotLine({ color, unlocked }: { color: string; unlocked: boolean }) {
  const dots = Array.from({ length: 5 });
  return (
    <View style={styles.dotLine}>
      {dots.map((_, i) => (
        <View
          key={i}
          style={[styles.dotLineDot, { backgroundColor: unlocked ? color + '70' : COLORS.bg.border }]}
        />
      ))}
    </View>
  );
}

// ─── Path node ────────────────────────────────────────────────────────────────

function PathNode({
  node, config, unlocked, completed, stars, isCurrent, side, onPress,
}: {
  node: CurriculumNode;
  config: SubjectConfig;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  isCurrent: boolean;
  side: 'left' | 'right';
  onPress: () => void;
}) {
  const entranceScale = useRef(new Animated.Value(0.88)).current;
  const entranceOp    = useRef(new Animated.Value(0)).current;
  const pressScale    = useRef(new Animated.Value(1)).current;
  const pulseAnim     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entranceScale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
      Animated.timing(entranceOp,   { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isCurrent) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1,  duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => pulseAnim.stopAnimation();
  }, [isCurrent]);

  const bubbleColor = completed
    ? config.color
    : isCurrent
      ? config.color
      : unlocked
        ? COLORS.bg.card
        : COLORS.bg.primary;

  const bubbleBorder = completed || isCurrent
    ? config.color
    : unlocked
      ? config.color + '66'
      : COLORS.bg.border;

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.85 : 1}
      onPress={unlocked ? onPress : undefined}
      onPressIn={() => unlocked && Animated.spring(pressScale, { toValue: 0.94, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => unlocked && Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
    >
      <Animated.View style={[
        styles.nodeWrapper,
        { alignItems: side === 'left' ? 'flex-end' : 'flex-start' },
        { opacity: entranceOp, transform: [{ scale: Animated.multiply(entranceScale, pressScale) }] },
      ]}>
        {/* Current node glow ring */}
        {isCurrent && (
          <Animated.View style={[
            styles.glowRing,
            { borderColor: config.color + '55', transform: [{ scale: pulseAnim }] },
          ]} />
        )}

        {/* Bubble */}
        <View style={[
          styles.nodeBubble,
          {
            backgroundColor: bubbleColor,
            borderColor: bubbleBorder,
            shadowColor: (completed || isCurrent) ? config.color : '#000',
            shadowOpacity: (completed || isCurrent) ? 0.4 : 0.15,
          },
        ]}>
          {completed ? (
            <Ionicons name="checkmark" size={28} color="#fff" />
          ) : !unlocked ? (
            <Ionicons name="lock-closed" size={22} color={COLORS.text.disabled} />
          ) : (
            <config.Icon size={28} color={isCurrent ? '#fff' : config.color} />
          )}
        </View>

        {/* GO badge on current node */}
        {isCurrent && (
          <View style={[styles.goBadge, { backgroundColor: config.color }]}>
            <Text style={styles.goBadgeTxt}>GO!</Text>
          </View>
        )}

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map((i) => (
            <Ionicons
              key={i}
              name={i <= stars ? 'star' : 'star-outline'}
              size={13}
              color={i <= stars ? COLORS.semantic.gold : COLORS.bg.border}
            />
          ))}
        </View>

        {/* Title */}
        <Text
          style={[
            styles.nodeTitle,
            { color: unlocked ? COLORS.text.primary : COLORS.text.disabled,
              textAlign: side === 'left' ? 'right' : 'left' },
          ]}
          numberOfLines={2}
        >
          {node.title}
        </Text>

        {/* Status label */}
        <Text style={[styles.nodeStatus, {
          color: completed ? config.color : isCurrent ? config.color : COLORS.text.disabled,
        }]}>
          {completed ? 'Completed' : isCurrent ? 'Up next' : unlocked ? 'Unlocked' : 'Locked'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg.primary },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  screenTitle: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.text.primary },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  levelBadgeTxt: { fontFamily: FONTS.display, fontSize: 14 },

  // Hero
  heroCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    minHeight: 145,
    ...SHADOWS.lg,
  },
  heroBlob1: {
    position: 'absolute', top: -30, right: 60,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBlob2: {
    position: 'absolute', bottom: -20, right: -10,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  heroLeft:  { flex: 1, gap: SPACING.sm, zIndex: 1 },
  heroOwl:   { width: 100, alignItems: 'center', zIndex: 1 },
  heroNextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  heroNextTxt:    { fontFamily: FONTS.heading, fontSize: 10, color: '#fff', letterSpacing: 0.6 },
  heroTitle:      { fontFamily: FONTS.display, fontSize: 20, color: '#fff', lineHeight: 26 },
  heroProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroProgressTxt: { fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  heroCTATxt: { fontFamily: FONTS.heading, fontSize: 13 },

  // Tabs
  tabs: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.sm },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  tabLabel: { fontFamily: FONTS.heading, fontSize: 13 },

  // Path
  pathScroll:  { flex: 1 },
  pathContent: { paddingBottom: SPACING.xxl * 2 },
  pathRoot: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    position: 'relative',
  },
  spine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 40,
    borderRadius: 20,
    transform: [{ translateX: -20 }],
    zIndex: 0,
    pointerEvents: 'none',
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  slot: { width: '40%' },

  // Connector
  connectorCol: { width: 44, alignItems: 'center', zIndex: 1 },
  connDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.bg.primary,
    marginTop: 30,
  },
  dotLine: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 6 },
  dotLineDot: { width: 5, height: 5, borderRadius: 3 },

  // Node
  nodeWrapper: { alignItems: 'center', gap: SPACING.xs },
  glowRing: {
    position: 'absolute',
    top: -8,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    zIndex: 0,
  },
  nodeBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  goBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    zIndex: 2,
  },
  goBadgeTxt: { fontFamily: FONTS.display, fontSize: 11, color: '#fff' },
  starsRow: { flexDirection: 'row', gap: 3 },
  nodeTitle: {
    fontFamily: FONTS.display,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 18,
    maxWidth: 120,
  },
  nodeStatus: { fontFamily: FONTS.body, fontSize: 11 },
});
