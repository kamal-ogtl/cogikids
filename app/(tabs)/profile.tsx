import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import MieoCharacter from '../../assets/mieo-character.svg';
import IconStatXP     from '../../assets/icon-stat-xp.svg';
import IconStatDays   from '../../assets/icon-stat-days.svg';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { LANGUAGES } from '../../src/constants/languages';
import { HausaFlag, YorubaFlag, IgboFlag, EnglishFlag } from '../../src/components/characters/LanguageIcons';
import type { SupportedLanguage } from '../../src/constants/languages';

const { width: SW } = Dimensions.get('window');
const SC = SW / 375;

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  goldBg:    '#fff8e0',
};

const FLAG_MAP: Record<SupportedLanguage, React.ComponentType<{ size?: number }>> = {
  hausa:   HausaFlag,
  yoruba:  YorubaFlag,
  igbo:    IgboFlag,
  english: EnglishFlag,
};

// ─── Inline icons ─────────────────────────────────────────────────────────────

const FlameIcon = ({ size = 14, color = C.gold }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2C6.5 7 4 10.5 4 14a8 8 0 0 0 16 0c0-4.5-2.5-8-8-12zM12 20a5 5 0 0 1-5-5c0-3 2-5.5 5-8 3 2.5 5 5 5 8a5 5 0 0 1-5 5z"
      fill={color} />
  </Svg>
);

const SettingsIcon = ({ size = 16, color = C.grey }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20 7h-9M14 17H5M17 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM3 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"
      stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </Svg>
);

const VolumeIcon = ({ size = 18, color = C.accent, muted = false }: { size?: number; color?: string; muted?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M11 5L6 9H2v6h4l5 4V5z" fill={color} />
    {muted ? (
      <Path d="M23 9l-6 6M17 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    ) : (
      <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    )}
  </Svg>
);

const SignOutIcon = ({ size = 18, color = C.wrong }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PuzzleIcon = ({ size = 13, color = '#a855f7' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20.5 11H19V7C19 5.9 18.1 5 17 5h-4V3.5A2.5 2.5 0 1 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5a2.7 2.7 0 0 1 0 5.4H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 0 1 5.4 0V22H17a2 2 0 0 0 2-2v-4h1.5A2.5 2.5 0 1 0 20.5 11z"
      fill={color} />
  </Svg>
);

const LeafIcon = ({ size = 13, color = '#a855f7' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 8"
      stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── XP Progress bar (brand-colored) ─────────────────────────────────────────

function XPBar({ xp, maxXP }: { xp: number; maxXP: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(progress, { toValue: xp / maxXP, damping: 15, useNativeDriver: false }).start();
  }, [xp, maxXP]);
  const widthPct = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  return (
    <View style={xpStyles.track}>
      <Animated.View style={[xpStyles.fill, { width: widthPct }]} />
    </View>
  );
}

const xpStyles = StyleSheet.create({
  track: { height: 10, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden' },
  fill:  { height: 10, backgroundColor: C.accent,  borderRadius: 99 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets      = useSafeAreaInsets();
  const player      = usePlayerStore((s) => s.player);
  const clearPlayer = usePlayerStore((s) => s.clearPlayer);
  const { nativeLanguage, ttsEnabled, setTtsEnabled } = useSettingsStore();

  const FlagIcon = FLAG_MAP[nativeLanguage] ?? HausaFlag;

  const heroAnim  = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const settAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(heroAnim,  { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
      Animated.spring(settAnim,  { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  function fadeUp(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
    };
  }

  const xp         = player?.xp ?? 0;
  const maxXP      = player?.xpToNextLevel ?? 500;
  const xpPercent  = Math.min(100, Math.round((xp / maxXP) * 100));
  const level      = player?.level ?? 1;
  const name       = player?.name ?? 'Player';
  const streak     = player?.streakDays ?? 0;
  const stars      = player?.totalStars ?? 0;
  const isStrategist = player?.ageGroup === 'strategist';

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[s.content, { paddingTop: insets.top + 16 * SC }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero card ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[s.heroCard, fadeUp(heroAnim)]}>
        {/* Character + avatar ring */}
        <View style={s.avatarSection}>
          {/* Pulsing accent ring */}
          <View style={s.avatarRingOuter}>
            <View style={s.avatarRingInner}>
              <MieoCharacter width={72 * SC} height={76 * SC} />
            </View>
          </View>
          {/* Level badge */}
          <View style={s.levelBadge}>
            <Text style={s.levelBadgeTxt}>{level}</Text>
          </View>
        </View>

        {/* Name */}
        <Text style={s.playerName}>{name}</Text>

        {/* Chips row */}
        <View style={s.chipsRow}>
          {/* Streak */}
          <View style={[s.chip, s.chipGold]}>
            <FlameIcon size={13} color={C.gold} />
            <Text style={[s.chipTxt, { color: C.gold }]}>{streak} day streak</Text>
          </View>
          {/* Language */}
          <View style={[s.chip, { backgroundColor: C.accentBg, borderColor: C.border }]}>
            <FlagIcon size={16} />
            <Text style={[s.chipTxt, { color: C.grey }]}>{LANGUAGES[nativeLanguage].label}</Text>
          </View>
          {/* Age group */}
          <View style={[s.chip, { backgroundColor: '#f3e8ff', borderColor: '#d8b4fe' }]}>
            {isStrategist
              ? <PuzzleIcon size={13} color="#a855f7" />
              : <LeafIcon   size={13} color="#a855f7" />
            }
            <Text style={[s.chipTxt, { color: '#a855f7' }]}>
              {isStrategist ? 'Strategist' : 'Explorer'}
            </Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={s.xpSection}>
          <View style={s.xpTopRow}>
            <Text style={s.xpLabel}>Level {level} Progress</Text>
            <Text style={s.xpPct}>{xpPercent}%</Text>
          </View>
          <XPBar xp={xp} maxXP={maxXP} />
          <Text style={s.xpSub}>{xp} / {maxXP} CP to next level</Text>
        </View>
      </Animated.View>

      {/* ── Stats row ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[s.statsRow, fadeUp(statsAnim)]}>
        <StatCard
          Icon={<IconStatXP width={42 * SC} height={42 * SC} />}
          value={String(stars)}
          label="Stars Earned"
        />
        <StatCard
          Icon={<IconStatDays width={42 * SC} height={42 * SC} />}
          value={`Lv ${level}`}
          label="Current Level"
        />
        <StatCard
          Icon={
            <View style={s.xpIconWrap}>
              <FlameIcon size={22} color={C.gold} />
            </View>
          }
          value={`${streak}d`}
          label="Streak"
        />
      </Animated.View>

      {/* ── Settings card ─────────────────────────────────────────────────────── */}
      <Animated.View style={[s.settCard, fadeUp(settAnim)]}>
        {/* Header */}
        <View style={s.settHeader}>
          <SettingsIcon size={15} />
          <Text style={s.settHeaderTxt}>Settings</Text>
        </View>

        {/* TTS row */}
        <View style={s.settRow}>
          <View style={s.settLeft}>
            <View style={[s.settIconWrap, { backgroundColor: C.accentBg }]}>
              <VolumeIcon size={18} color={C.accent} muted={!ttsEnabled} />
            </View>
            <View style={s.settLabelWrap}>
              <Text style={s.settLabel}>Read Words Aloud</Text>
              <Text style={s.settSub}>Text-to-speech in Spelling Bee</Text>
            </View>
          </View>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            trackColor={{ false: '#e3e6e8', true: C.accent + '88' }}
            thumbColor={ttsEnabled ? C.accent : '#9ca3af'}
            ios_backgroundColor="#e3e6e8"
          />
        </View>
      </Animated.View>

      {/* ── Sign out ──────────────────────────────────────────────────────────── */}
      <Animated.View style={fadeUp(settAnim)}>
        <SignOutButton onPress={clearPlayer} />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  Icon, value, label,
}: {
  Icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const sc = useRef(new Animated.Value(0.85)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, { toValue: 1, tension: 160, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.statCard, { transform: [{ scale: sc }], opacity: op }]}>
      {Icon}
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

function SignOutButton({ onPress }: { onPress: () => void }) {
  const sc = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={()  => Animated.spring(sc, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(sc, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[s.signOutBtn, { transform: [{ scale: sc }] }]}>
        <SignOutIcon size={18} color={C.wrong} />
        <Text style={s.signOutTxt}>Sign Out</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 16 * SC, paddingBottom: 32, gap: 14 * SC },

  // Hero card
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingVertical: 24 * SC,
    paddingHorizontal: 20 * SC,
    alignItems: 'center',
    gap: 12 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },

  // Avatar
  avatarSection: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatarRingOuter: {
    width: 100 * SC,
    height: 100 * SC,
    borderRadius: 50 * SC,
    borderWidth: 2.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentBg,
  },
  avatarRingInner: {
    width: 88 * SC,
    height: 88 * SC,
    borderRadius: 44 * SC,
    backgroundColor: '#ddf4ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.card,
  },
  levelBadgeTxt: { fontFamily: FONTS.display, fontSize: 12, color: '#fff' },

  playerName: { fontFamily: FONTS.display, fontSize: 22 * SC, color: C.dark },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipGold:   { backgroundColor: C.goldBg, borderColor: '#f0d070' },
  chipTxt:    { fontFamily: FONTS.bodyMedium, fontSize: 12 * SC },

  // XP section
  xpSection: { width: '100%', gap: 6, marginTop: 4 },
  xpTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel:   { fontFamily: FONTS.bodyMedium, fontSize: 13 * SC, color: C.grey },
  xpPct:     { fontFamily: FONTS.heading,    fontSize: 13 * SC, color: C.accent },
  xpSub:     { fontFamily: FONTS.body,       fontSize: 11 * SC, color: C.grey, opacity: 0.8, textAlign: 'right' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 * SC },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 14 * SC,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  xpIconWrap: {
    width: 42 * SC,
    height: 42 * SC,
    borderRadius: 21 * SC,
    backgroundColor: C.goldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontFamily: FONTS.display, fontSize: 18 * SC, color: C.dark },
  statLabel: { fontFamily: FONTS.body,    fontSize: 11 * SC, color: C.grey, textAlign: 'center' },

  // Settings
  settCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  settHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16 * SC,
    paddingTop: 14 * SC,
    paddingBottom: 12 * SC,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  settHeaderTxt: { fontFamily: FONTS.heading, fontSize: 14 * SC, color: C.grey },
  settRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16 * SC,
    paddingVertical: 14 * SC,
  },
  settLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  settLabelWrap: { flex: 1 },
  settLabel:  { fontFamily: FONTS.bodyMedium, fontSize: 14 * SC, color: C.dark },
  settSub:    { fontFamily: FONTS.body,       fontSize: 11 * SC, color: C.grey, marginTop: 2 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  signOutTxt: { fontFamily: FONTS.heading, fontSize: 15 * SC, color: C.wrong },
});
