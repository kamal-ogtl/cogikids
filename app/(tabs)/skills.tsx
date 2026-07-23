import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { CURRICULUM_NODES } from '../../src/constants/curriculum';
import type { CurriculumNode, Subject } from '../../src/constants/curriculum';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useProgressStore } from '../../src/store/useProgressStore';

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = 'all' | Subject;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'english', label: 'English' },
  { id: 'math',    label: 'Math' },
  { id: 'science', label: 'Science' },
  { id: 'social',  label: 'Social' },
];

const SUBJECT_COLORS: Record<Subject, string> = {
  english: COLORS.subjects.english,
  math:    COLORS.subjects.math,
  science: COLORS.subjects.science,
  social:  COLORS.subjects.social,
};

const SUBJECT_BG: Record<Subject, string> = {
  english: '#EDE9FE',
  math:    '#D1FAE5',
  science: '#FEF3C7',
  social:  '#DBEAFE',
};

const ORDINALS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SkillsScreen() {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const player      = usePlayerStore((s) => s.player);
  const unlockNode  = useProgressStore((s) => s.unlockNode);
  const isUnlocked  = useProgressStore((s) => s.isUnlocked);
  const isCompleted = useProgressStore((s) => s.isCompleted);
  const nodes       = useProgressStore((s) => s.nodes);

  const ageGroup = player?.ageGroup ?? 'explorer';
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim   = useRef(new Animated.Value(0)).current;

  // Auto-unlock first node of each subject on mount
  useEffect(() => {
    CURRICULUM_NODES
      .filter((n) => n.ageGroup === ageGroup && !n.prerequisite)
      .forEach((n) => unlockNode(n.id));
  }, [ageGroup]);

  // Unlock dependents when a node is completed
  useEffect(() => {
    CURRICULUM_NODES.forEach((n) => {
      if (n.prerequisite && isCompleted(n.prerequisite)) {
        unlockNode(n.id);
      }
    });
  }, [nodes]);

  useEffect(() => {
    Animated.stagger(60, [
      Animated.spring(headerAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.spring(listAnim,   { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    listAnim.setValue(0);
    Animated.spring(listAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }).start();
  }, [filter]);

  const visibleNodes: CurriculumNode[] = useMemo(() => {
    let list = CURRICULUM_NODES.filter((n) => n.ageGroup === ageGroup);
    if (filter !== 'all') list = list.filter((n) => n.subject === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.level - b.level);
  }, [filter, search, ageGroup]);

  // Per-subject ordinal index for lesson numbering
  const subjectCounters: Record<string, number> = {};

  function handleNodePress(node: CurriculumNode) {
    if (!isUnlocked(node.id)) return;
    router.push(`/lesson/${node.id}` as any);
  }

  function fadeUp(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
    };
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.md }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <Animated.View style={fadeUp(headerAnim)}>
        <Text style={styles.heading}>Pick a New</Text>
        <Text style={styles.headingAccent}>Learning Lesson</Text>
      </Animated.View>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.searchWrap, fadeUp(headerAnim)]}>
        <Ionicons name="search-outline" size={18} color={COLORS.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={COLORS.text.disabled}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
          </TouchableOpacity>
        )}
        <View style={styles.searchDivider} />
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={18} color={COLORS.brand.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Filter pills ────────────────────────────────────────────────── */}
      <Animated.View style={fadeUp(headerAnim)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.filterPill, active && styles.filterPillActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Lesson list ─────────────────────────────────────────────────── */}
      <Animated.View style={[styles.lessonList, fadeUp(listAnim)]}>
        {visibleNodes.map((node) => {
          subjectCounters[node.subject] = (subjectCounters[node.subject] ?? 0) + 1;
          const ordinal = ORDINALS[(subjectCounters[node.subject] - 1) % ORDINALS.length] ?? String(subjectCounters[node.subject]);
          const unlocked  = isUnlocked(node.id);
          const completed = isCompleted(node.id);
          const stars     = nodes[node.id]?.stars ?? 0;
          const totalXP   = (nodes[node.id]?.completed ? stars * 15 + 10 : 0);
          return (
            <LessonCard
              key={node.id}
              node={node}
              ordinal={ordinal}
              unlocked={unlocked}
              completed={completed}
              stars={stars}
              onPress={() => handleNodePress(node)}
            />
          );
        })}

        {visibleNodes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>No lessons found</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

// ─── Lesson card ──────────────────────────────────────────────────────────────

function LessonCard({
  node,
  ordinal,
  unlocked,
  completed,
  stars,
  onPress,
}: {
  node: CurriculumNode;
  ordinal: string;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  onPress: () => void;
}) {
  const color = SUBJECT_COLORS[node.subject];
  const bg    = SUBJECT_BG[node.subject];
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start()
      }
      onPress={unlocked ? onPress : undefined}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {/* Left: text */}
        <View style={styles.cardLeft}>
          {/* "Lesson {Ordinal}" label */}
          <View style={styles.lessonLabelRow}>
            <Text style={[styles.lessonWord, { color }]}>Lesson </Text>
            <View style={[styles.ordinalBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.ordinalText, { color }]}>{ordinal}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{node.title}</Text>
          <Text style={styles.cardSubject} numberOfLines={1}>{node.subject.charAt(0).toUpperCase() + node.subject.slice(1)} · Level {node.level}</Text>

          {/* Stars or progress */}
          {completed ? (
            <View style={styles.starsRow}>
              {[1, 2, 3].map((n) => (
                <Ionicons key={n} name={n <= stars ? 'star' : 'star-outline'} size={14} color={n <= stars ? COLORS.semantic.gold : COLORS.bg.border} />
              ))}
            </View>
          ) : null}

          {/* CTA button */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: unlocked ? (completed ? COLORS.semantic.correct : color) : COLORS.bg.secondary },
            ]}
            onPress={unlocked ? onPress : undefined}
            activeOpacity={0.8}
          >
            {!unlocked && <Ionicons name="lock-closed" size={12} color={COLORS.text.muted} />}
            <Text style={[styles.ctaText, { color: unlocked ? '#fff' : COLORS.text.muted }]}>
              {completed ? 'Redo' : unlocked ? 'Start' : 'Unlock'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: icon circle + progress badge */}
        <View style={styles.cardRight}>
          <View style={[styles.cardIconCircle, { backgroundColor: bg }]}>
            <Text style={styles.cardIconEmoji}>{subjectEmoji(node.subject)}</Text>
          </View>
          <View style={[styles.progressBadge, { backgroundColor: completed ? COLORS.semantic.correct + '22' : COLORS.bg.secondary }]}>
            <Text style={[styles.progressBadgeText, { color: completed ? COLORS.semantic.correct : COLORS.text.muted }]}>
              {completed ? `${stars}/3 ⭐` : `0/${node.level}`}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function subjectEmoji(subject: Subject): string {
  switch (subject) {
    case 'english':  return '📖';
    case 'math':     return '🔢';
    case 'science':  return '🔬';
    case 'social':   return '🌍';
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 110, gap: SPACING.lg },

  // Heading
  heading:       { fontFamily: FONTS.display, fontSize: 28, color: COLORS.text.primary, lineHeight: 34 },
  headingAccent: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.brand.primary, fontStyle: 'italic', lineHeight: 36 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.primary,
    paddingVertical: 4,
  },
  searchDivider: { width: 1, height: 20, backgroundColor: COLORS.bg.border },
  filterBtn: { paddingLeft: SPACING.xs },

  // Filter pills
  filterRow: { gap: SPACING.sm, paddingRight: SPACING.sm },
  filterPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bg.secondary,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  filterLabel: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.text.muted },
  filterLabelActive: { color: '#fff' },

  // Lesson list
  lessonList: { gap: SPACING.md },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  cardLeft: { flex: 1, gap: SPACING.xs },
  lessonLabelRow: { flexDirection: 'row', alignItems: 'center' },
  lessonWord: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  ordinalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  ordinalText: { fontFamily: FONTS.heading, fontSize: 12 },
  cardTitle: { fontFamily: FONTS.display, fontSize: 16, color: COLORS.text.primary, lineHeight: 21, marginTop: 2 },
  cardSubject: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text.muted },
  starsRow: { flexDirection: 'row', gap: 2 },

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  ctaText: { fontFamily: FONTS.heading, fontSize: 13 },

  cardRight: { alignItems: 'center', gap: SPACING.sm, flexShrink: 0 },
  cardIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconEmoji: { fontSize: 28 },
  progressBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  progressBadgeText: { fontFamily: FONTS.heading, fontSize: 11 },

  // Empty
  emptyState: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.xxl },
  emptyEmoji: { fontSize: 40 },
  emptyText:  { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text.disabled },
});
