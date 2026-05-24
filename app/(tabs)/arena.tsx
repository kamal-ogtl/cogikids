import React, { useEffect, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { BOSSES, type Boss } from '../../src/constants/bosses';
import { playSound } from '../../src/utils/sounds';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useProgressStore } from '../../src/store/useProgressStore';
import { NumborrChar, LexiChar, ScorpChar, RexChar } from '../../src/components/characters/BossCharacters';
import { BOSS_BG } from '../../src/components/characters/BossBg';
import { ArenaBg } from '../../src/components/characters/CarouselBg';

const { width: SCREEN_W } = Dimensions.get('window');

const BOSS_CHARS: Record<string, React.ComponentType<{ size?: number }>> = {
  numbor: NumborrChar,
  lexi:   LexiChar,
  scorp:  ScorpChar,
  rex:    RexChar,
};

const SUBJECT_LABELS: Record<string, string> = {
  math:    'Math',
  english: 'English',
  science: 'Science',
  social:  'Social Studies',
};

export default function ArenaScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const player       = usePlayerStore((s) => s.player);
  const beatenBosses = useProgressStore((s) => s.beatenBosses);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims  = useRef(BOSSES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(headerAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.stagger(150, cardAnims.map((a) =>
        Animated.spring(a, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true })
      )),
    ]).start();
  }, []);

  function fadeUp(anim: Animated.Value, distance = 32) {
    return {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
    };
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.heroBanner, fadeUp(headerAnim, 20)]}>
        <ArenaBg />
        {/* Glow blobs */}
        <View style={[styles.blob, { backgroundColor: '#FF6B00', width: 120, height: 120, top: -30, left: -20 }]} />
        <View style={[styles.blob, { backgroundColor: '#FFAA00', width: 80, height: 80, bottom: -10, right: 40 }]} />

        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="flash" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.heroTitle}>Battle Arena</Text>
            <Text style={styles.heroSub}>Defeat bosses — earn CP and glory!</Text>
          </View>
        </View>

        {/* Player level chip */}
        <View style={styles.levelChip}>
          <Ionicons name="shield" size={13} color="#FFD700" />
          <Text style={styles.levelChipTxt}>LVL {player?.level ?? 1}</Text>
        </View>
      </Animated.View>

      {/* ── Boss Cards ──────────────────────────────────────────────────────── */}
      <View style={styles.cardsList}>
        {BOSSES.map((boss, i) => {
          const locked = (player?.level ?? 1) < boss.minLevel;
          return (
            <Animated.View key={boss.id} style={fadeUp(cardAnims[i])}>
              <BossCard
                boss={boss}
                locked={locked}
                winCount={beatenBosses[boss.id] ?? 0}
                onPress={() => { playSound('tap'); router.push(`/battle/${boss.id}`); }}
              />
            </Animated.View>
          );
        })}
      </View>

      {/* ── Tip ─────────────────────────────────────────────────────────────── */}
      <View style={styles.tip}>
        <Ionicons name="information-circle-outline" size={15} color={COLORS.text.disabled} />
        <Text style={styles.tipTxt}>Boss questions come from your lessons. Keep studying to get stronger!</Text>
      </View>
    </ScrollView>
  );
}

// ─── Boss Card ────────────────────────────────────────────────────────────────

function BossCard({ boss, locked, winCount, onPress }: { boss: Boss; locked: boolean; winCount: number; onPress: () => void }) {
  const scale    = useRef(new Animated.Value(1)).current;
  const BossChar = BOSS_CHARS[boss.id];
  const BossBgComp = BOSS_BG[boss.id];

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={locked}
      onPressIn={() =>
        !locked && Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start()
      }
      onPressOut={() =>
        !locked && Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start()
      }
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: boss.cardBg,
            borderColor: locked ? COLORS.bg.border : boss.color + '55',
            transform: [{ scale }],
          },
        ]}
      >
        {/* SVG background illustration */}
        {BossBgComp && <BossBgComp />}

        {/* Colour gradient tint over bg */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: RADIUS.xl, backgroundColor: boss.cardBg + 'AA' },
          ]}
        />

        {/* Defeated badge */}
        {winCount > 0 && (
          <View style={styles.defeatedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#FFD700" />
            <Text style={styles.defeatedTxt}>DEFEATED {winCount > 1 ? `×${winCount}` : ''}</Text>
          </View>
        )}

        <View style={styles.cardInner}>
          {/* ── Left: character ── */}
          <View style={[styles.charCol, locked && { opacity: 0.25 }]}>
            {BossChar ? <BossChar size={115} /> : null}
          </View>

          {/* ── Right: info ── */}
          <View style={styles.infoCol}>
            {/* Subject badge */}
            <View style={[styles.subjectBadge, { backgroundColor: boss.color + '28', borderColor: boss.color + '55' }]}>
              <Text style={[styles.subjectBadgeTxt, { color: boss.color }]}>
                {SUBJECT_LABELS[boss.subject]}
              </Text>
            </View>

            {/* Name + title */}
            <Text style={[styles.bossName, { color: locked ? COLORS.text.muted : '#FFFFFF' }]}>
              {boss.name}
            </Text>
            <Text style={[styles.bossTitle, { color: locked ? COLORS.text.disabled : boss.color }]}>
              {boss.title}
            </Text>

            {/* Tagline */}
            <Text style={styles.tagline} numberOfLines={2}>
              {boss.tagline}
            </Text>

            {/* HP hearts */}
            <View style={styles.hpRow}>
              {Array.from({ length: boss.hp }).map((_, d) => (
                <Ionicons
                  key={d}
                  name="heart"
                  size={14}
                  color={locked ? COLORS.bg.border : boss.color}
                />
              ))}
            </View>

            {/* Reward */}
            <View style={styles.rewardRow}>
              <Ionicons name="star" size={13} color={locked ? COLORS.text.disabled : '#FFD700'} />
              <Text style={[styles.rewardTxt, { color: locked ? COLORS.text.disabled : '#FFD700' }]}>
                {boss.rewardCP} CP reward
              </Text>
            </View>

            {/* CTA button */}
            {locked ? (
              <View style={[styles.cta, styles.ctaLocked]}>
                <Ionicons name="lock-closed" size={13} color={COLORS.text.disabled} />
                <Text style={[styles.ctaTxt, { color: COLORS.text.disabled }]}>
                  Level {boss.minLevel} to unlock
                </Text>
              </View>
            ) : (
              <View style={[styles.cta, { backgroundColor: boss.color, shadowColor: boss.color }]}>
                <Ionicons name="flash" size={14} color="#fff" />
                <Text style={[styles.ctaTxt, { color: '#fff' }]}>Battle!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Full lock overlay */}
        {locked && (
          <View style={[styles.lockOverlay, { borderRadius: RADIUS.xl }]}>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={22} color={COLORS.text.muted} />
            </View>
            <Text style={styles.lockLbl}>Level {boss.minLevel} required</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { paddingBottom: SPACING.xxl, gap: SPACING.lg },

  // ── Hero banner
  heroBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#C05000',
    minHeight: 110,
    ...SHADOWS.lg,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.25,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  heroIconWrap: {
    width: 54, height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontFamily: FONTS.display, fontSize: 26, color: '#fff' },
  heroSub:   { fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginLeft: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  levelChipTxt: { fontFamily: FONTS.heading, fontSize: 12, color: '#FFD700' },

  // ── Card list
  cardsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 160,
    ...SHADOWS.md,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },

  // ── Character column
  charCol: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Info column
  infoCol: {
    flex: 1,
    gap: 4,
  },

  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 2,
  },
  subjectBadgeTxt: { fontFamily: FONTS.bodyMedium, fontSize: 10 },

  bossName:  { fontFamily: FONTS.display, fontSize: 22, lineHeight: 26 },
  bossTitle: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  tagline: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 15,
    marginTop: 2,
  },

  hpRow: { flexDirection: 'row', gap: 3, marginTop: 4 },

  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rewardTxt: { fontFamily: FONTS.heading, fontSize: 11 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    marginTop: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaLocked: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.bg.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaTxt: { fontFamily: FONTS.heading, fontSize: 13 },

  // ── Defeated badge
  defeatedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: '#FFD70055',
    zIndex: 10,
  },
  defeatedTxt: { fontFamily: FONTS.heading, fontSize: 10, color: '#FFD700' },

  // ── Lock overlay
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  lockBadge: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.bg.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.bg.border,
  },
  lockLbl: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.text.muted },

  // ── Tip
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  tipTxt: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.disabled,
    flex: 1,
    lineHeight: 18,
  },
});
