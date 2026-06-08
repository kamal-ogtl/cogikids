/**
 * Profile screen — player hero card (avatar, level, streak, language, age group),
 * XP progress and lifetime stats, plus settings toggles for text-to-speech and
 * sound effects, and a sign-out action.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CPBar } from '../../src/components/ui/CPBar';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { LANGUAGES } from '../../src/constants/languages';
import { HausaFlag, YorubaFlag, IgboFlag, EnglishFlag } from '../../src/components/characters/LanguageIcons';
import type { SupportedLanguage } from '../../src/constants/languages';

const FLAG_MAP: Record<SupportedLanguage, React.ComponentType<{ size?: number }>> = {
  hausa:   HausaFlag,
  yoruba:  YorubaFlag,
  igbo:    IgboFlag,
  english: EnglishFlag,
};

export default function ProfileScreen() {
  const insets      = useSafeAreaInsets();
  const player      = usePlayerStore((s) => s.player);
  const clearPlayer = usePlayerStore((s) => s.clearPlayer);
  const { nativeLanguage, ttsEnabled, setTtsEnabled, soundEnabled, setSoundEnabled } = useSettingsStore();

  const FlagIcon = FLAG_MAP[nativeLanguage] ?? HausaFlag;

  const heroAnim  = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const settAnim  = useRef(new Animated.Value(0)).current;

  const ringScale   = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(heroAnim,  { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.spring(settAnim,  { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale,   { toValue: 1.12, duration: 1000, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.2,  duration: 1000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale,   { toValue: 1,   duration: 1000, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  function fadeUp(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    };
  }

  const xpPercent = Math.round(((player?.xp ?? 0) / (player?.xpToNextLevel ?? 500)) * 100);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.hero, fadeUp(heroAnim)]}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{(player?.name ?? 'L')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeTxt}>{player?.level ?? 1}</Text>
          </View>
        </View>

        <Text style={styles.playerName}>{player?.name ?? 'Player'}</Text>

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.heroBadge, { backgroundColor: '#3d2e00' }]}>
            <Ionicons name="flame" size={13} color={COLORS.semantic.gold} />
            <Text style={[styles.heroBadgeTxt, { color: COLORS.semantic.gold }]}>
              {player?.streakDays ?? 0} day streak
            </Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: COLORS.bg.cardAlt }]}>
            <FlagIcon size={20} />
            <Text style={[styles.heroBadgeTxt, { color: COLORS.text.muted }]}>
              {LANGUAGES[nativeLanguage].label}
            </Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: '#1a0a2e' }]}>
            <Ionicons
              name={player?.ageGroup === 'strategist' ? 'bulb-outline' : 'leaf-outline'}
              size={13}
              color="#a855f7"
            />
            <Text style={[styles.heroBadgeTxt, { color: '#a855f7' }]}>
              {player?.ageGroup === 'strategist' ? 'Strategist' : 'Explorer'}
            </Text>
          </View>
        </View>

        {/* XP progress — inline at the bottom of the hero */}
        <View style={styles.xpSection}>
          <View style={styles.xpTopRow}>
            <Text style={styles.xpLabel}>Level {player?.level ?? 1} Progress</Text>
            <Text style={styles.xpPct}>{xpPercent}%</Text>
          </View>
          <CPBar
            xp={player?.xp ?? 0}
            maxXP={player?.xpToNextLevel ?? 500}
            level={player?.level ?? 1}
            showLabel={false}
          />
          <Text style={styles.xpSub}>
            {player?.xp ?? 0} / {player?.xpToNextLevel ?? 500} CP
          </Text>
        </View>
      </Animated.View>

      {/* ── Stats — Stars & Level only (streak + age group are in the hero) ── */}
      <Animated.View style={[styles.statsRow, fadeUp(statsAnim)]}>
        <StatCard
          icon="star"
          color={COLORS.semantic.gold}
          bg="#3d2e00"
          value={String(player?.totalStars ?? 0)}
          label="Stars Earned"
        />
        <StatCard
          icon="trophy"
          color={COLORS.brand.primary}
          bg="#062233"
          value={`Lv ${player?.level ?? 1}`}
          label="Current Level"
        />
      </Animated.View>

      {/* ── Settings ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.settCard, fadeUp(settAnim)]}>
        <View style={styles.settHeader}>
          <Ionicons name="settings-sharp" size={16} color={COLORS.text.muted} />
          <Text style={styles.settHeaderTxt}>Settings</Text>
        </View>
        <View style={styles.settRow}>
          <View style={styles.settLeft}>
            <View style={[styles.settIcon, { backgroundColor: COLORS.brand.primary + '22' }]}>
              <Ionicons
                name={ttsEnabled ? 'volume-high' : 'volume-mute'}
                size={18}
                color={COLORS.brand.primary}
              />
            </View>
            <View>
              <Text style={styles.settLabel}>Read Words Aloud</Text>
              <Text style={styles.settSub}>Text-to-speech in Spelling Bee</Text>
            </View>
          </View>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            trackColor={{ false: COLORS.bg.border, true: COLORS.brand.primary + '88' }}
            thumbColor={ttsEnabled ? COLORS.brand.primary : COLORS.text.disabled}
            ios_backgroundColor={COLORS.bg.border}
          />
        </View>
        <View style={[styles.settRow, { borderTopWidth: 1, borderTopColor: COLORS.bg.border }]}>
          <View style={styles.settLeft}>
            <View style={[styles.settIcon, { backgroundColor: COLORS.semantic.gold + '22' }]}>
              <Ionicons
                name={soundEnabled ? 'musical-notes' : 'musical-notes-outline'}
                size={18}
                color={COLORS.semantic.gold}
              />
            </View>
            <View>
              <Text style={styles.settLabel}>Sound Effects</Text>
              <Text style={styles.settSub}>Taps, correct & wrong sounds</Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: COLORS.bg.border, true: COLORS.semantic.gold + '88' }}
            thumbColor={soundEnabled ? COLORS.semantic.gold : COLORS.text.disabled}
            ios_backgroundColor={COLORS.bg.border}
          />
        </View>
      </Animated.View>

      {/* ── Sign out ──────────────────────────────────────────────── */}
      <Animated.View style={fadeUp(settAnim)}>
        <SignOutButton onPress={clearPlayer} />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, color, bg, value, label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
  value: string;
  label: string;
}) {
  const scale   = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, tension: 160, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { backgroundColor: bg, borderColor: color + '33', transform: [{ scale }], opacity }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Sign out button ──────────────────────────────────────────────────────────

function SignOutButton({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.signOutBtn, { transform: [{ scale }] }]}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.semantic.wrong} />
        <Text style={styles.signOutTxt}>Sign Out</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.lg },

  // Hero
  hero: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    ...SHADOWS.sm,
  },
  avatarWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  avatarRing: {
    position: 'absolute',
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: COLORS.brand.primary,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.brand.primary + '33',
    borderWidth: 2.5, borderColor: COLORS.brand.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontFamily: FONTS.display, fontSize: 34, color: COLORS.brand.primary },
  levelBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.bg.card,
  },
  levelBadgeTxt: { fontFamily: FONTS.heading, fontSize: 11, color: '#fff' },
  playerName:    { fontFamily: FONTS.display, fontSize: 22, color: COLORS.text.primary },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  heroBadgeTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // XP inline in hero
  xpSection: { width: '100%', gap: SPACING.xs, marginTop: SPACING.xs },
  xpTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel:   { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.text.muted },
  xpPct:     { fontFamily: FONTS.heading, fontSize: 13, color: COLORS.brand.primary },
  xpSub:     { fontFamily: FONTS.body, fontSize: 11, color: COLORS.text.disabled, textAlign: 'right' },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.md },
  statCard: {
    flex: 1, alignItems: 'center', gap: SPACING.sm,
    padding: SPACING.lg, borderRadius: RADIUS.xl,
    borderWidth: 1.5, ...SHADOWS.sm,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontFamily: FONTS.display, fontSize: 20 },
  statLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text.muted, textAlign: 'center' },

  // Settings
  settCard: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.bg.border,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  settHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.bg.border,
  },
  settHeaderTxt: { fontFamily: FONTS.heading, fontSize: 14, color: COLORS.text.muted },
  settRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  settLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  settIcon:  { width: 38, height: 38, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  settLabel: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.text.primary },
  settSub:   { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text.muted, marginTop: 1 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl, borderWidth: 1.5,
    borderColor: COLORS.semantic.wrong + '55',
    backgroundColor: COLORS.semantic.wrong + '12',
  },
  signOutTxt: { fontFamily: FONTS.heading, fontSize: 15, color: COLORS.semantic.wrong },
});
