import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';

import LevelIconCave    from '../../assets/level-icon-cave.svg';
import LevelIconPark    from '../../assets/level-icon-park.svg';
import LevelIconDesert  from '../../assets/level-icon-desert.svg';
import StreakCharacter   from '../../assets/level-streak-character.svg';
import IconBack         from '../../assets/icon-back.svg';
import IconDiamond      from '../../assets/icon-diamond.svg';
import IconShare        from '../../assets/icon-share.svg';
import IconStatXP       from '../../assets/icon-stat-xp.svg';
import IconStatSkills   from '../../assets/icon-stat-skills.svg';
import IconStatDays     from '../../assets/icon-stat-days.svg';

const { width: SW } = Dimensions.get('window');
const SC = SW / 375;

const STREAK_HERO = require('../../assets/level-streak-hero.png');

const ACCENT = '#59C8FF';
const DARK   = '#171A1C';
const GREY   = '#5D686F';

// ── Level data ────────────────────────────────────────────────────────────────
type LevelData = {
  id: string;
  name: string;
  levelNum: number;
  totalUnits: number;
  locked: boolean;
  Icon: React.FC<{ width: number; height: number }>;
  description: string;
  unlockCost: number;
  xp: number;
  skillsPct: number;
  days: number;
};

const LEVELS: Record<string, LevelData> = {
  cave: {
    id: 'cave',
    name: 'Incredible Cave',
    levelNum: 4,
    totalUnits: 12,
    locked: false,
    Icon: LevelIconCave,
    description:
      'This level is for very beginners level users to get start with their basic words and info.\n\nLorem ipsum is a dummy or placeholder text comments used in graphic design, publishing, and web development.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    unlockCost: 0,
    xp: 234,
    skillsPct: 64,
    days: 34,
  },
  park: {
    id: 'park',
    name: 'The Unpredictable Park',
    levelNum: 5,
    totalUnits: 12,
    locked: false,
    Icon: LevelIconPark,
    description:
      'Explore the unpredictable park where every corner brings a new language adventure.\n\nLorem ipsum is a dummy or placeholder text comments used in graphic design, publishing, and web development.',
    unlockCost: 0,
    xp: 198,
    skillsPct: 78,
    days: 21,
  },
  desert: {
    id: 'desert',
    name: 'The Flaming Desert',
    levelNum: 6,
    totalUnits: 9,
    locked: true,
    Icon: LevelIconDesert,
    description:
      'This level is for very beginners level users to get start with their basic words and info.\n\nLorem ipsum is a dummy or placeholder text comments used in graphic design, publishing, and web development.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    unlockCost: 350,
    xp: 0,
    skillsPct: 0,
    days: 0,
  },
};

// ── Stat tile — icon is a complete 42×42 Figma SVG (circle + icon) ───────────
function StatTile({
  StatIcon,
  value,
  label,
}: {
  StatIcon: React.FC<{ width: number; height: number }>;
  value: string;
  label: string;
}) {
  const TILE_W  = 104 * SC;
  const ICON_SZ = 42 * SC;
  return (
    <View style={[st.tile, { width: TILE_W }]}>
      {/* Complete icon circle from Figma — Figma: 42×42 */}
      <StatIcon width={ICON_SZ} height={ICON_SZ} />
      <Text style={[st.value, { fontSize: 20 * SC }]}>{value}</Text>
      <Text style={[st.label, { fontSize: 11 * SC }]}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14 * SC,
    alignItems: 'center',
    paddingVertical: 14 * SC,
    gap: 4 * SC,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  value: { fontFamily: FONTS.display, color: DARK },
  label: { fontFamily: FONTS.body,    color: GREY },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function LevelDetailScreen() {
  const insets = useSafeAreaInsets();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const player = usePlayerStore(s => s.player);

  const level = LEVELS[levelId ?? 'cave'] ?? LEVELS.cave;
  const { Icon } = level;

  const gems  = (player as any)?.gems  ?? 245;
  const HERO_H  = 267 * SC;
  const ICON_SZ = 44 * SC;
  const CHAR_W  = 98 * SC;
  const CHAR_H  = 83 * SC;

  return (
    <View style={s.root}>
      {/* ── Top App Bar — Figma: 375×80, white ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <IconBack width={22} height={22} color={DARK} />
        </TouchableOpacity>

        <View style={s.topCenter}>
          <Text style={s.topTitle} numberOfLines={1}>{level.name}</Text>
          <Text style={s.topSub}>Level {level.levelNum}, Total Units {level.totalUnits}</Text>
        </View>

        <View style={[s.pill, s.gemPill]}>
          <IconDiamond width={15} height={15} color={ACCENT} />
          <Text style={s.pillNum}>{gems}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Cover Image — Figma: 375×267 ── */}
        <View style={[s.heroWrap, { height: HERO_H }]}>
          <Image
            source={STREAK_HERO}
            style={{ width: SW, height: HERO_H }}
            resizeMode="cover"
          />
          {/* Mieo Character SVG — individual Figma element overlaid */}
          <View
            style={[
              s.heroChar,
              {
                right:  24 * SC,
                bottom: 8 * SC,
                width:  CHAR_W,
                height: CHAR_H,
              },
            ]}
          >
            <StreakCharacter width={CHAR_W} height={CHAR_H} />
          </View>
        </View>

        {/* ── Container — white cards section ── */}
        <View style={s.container}>

          {/* Level Info Card — Figma: 343×76, white, rounded */}
          <View style={s.infoCard}>
            {/* Level icon SVG — Figma: 44×44 */}
            <Icon width={ICON_SZ} height={ICON_SZ} />

            <View style={s.infoDetails}>
              <Text style={[s.infoName, { fontSize: 16 * SC }]}>{level.name}</Text>
              <Text style={[s.infoSub, { fontSize: 13 * SC }]}>
                Level {level.levelNum}, Total Units {level.totalUnits}
              </Text>
            </View>

            {/* Share button — Figma: 36×36, #E3E6E8 bg */}
            <TouchableOpacity style={s.shareBtn} activeOpacity={0.7}>
              <IconShare width={18 * SC} height={18 * SC} color={GREY} />
            </TouchableOpacity>
          </View>

          {/* ── Performance Section — Figma: 343×166 ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={[s.sectionTitle, { fontSize: 18 * SC }]}>Performance</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[s.viewAll, { fontSize: 13 * SC }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* 3 stat tiles — Figma: 104×106 each, with Figma icon circles */}
            <View style={s.statRow}>
              <StatTile
                StatIcon={IconStatXP}
                value={level.xp > 0 ? String(level.xp) : '–'}
                label="Total XP"
              />
              <StatTile
                StatIcon={IconStatSkills}
                value={level.skillsPct > 0 ? `${level.skillsPct}%` : '–'}
                label="Skills"
              />
              <StatTile
                StatIcon={IconStatDays}
                value={level.days > 0 ? String(level.days) : '–'}
                label="Days"
              />
            </View>
          </View>

          {/* ── About this level — Figma: 343×148+ ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={[s.sectionTitle, { fontSize: 18 * SC }]}>About this level</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[s.viewAll, { fontSize: 13 * SC }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.description, { fontSize: 13 * SC, lineHeight: 20 * SC }]}>
              {level.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action — Figma: 375×96, fixed ── */}
      <View style={[s.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {level.locked ? (
          /* Locked: "Unlock with 💎 350" — Figma: white bg, outlined */
          <TouchableOpacity style={s.unlockBtn} activeOpacity={0.85}>
            <Text style={s.unlockText}>Unlock with</Text>
            <View style={s.gemRow}>
              <IconDiamond width={18} height={18} color={ACCENT} />
              <Text style={s.unlockCost}>{level.unlockCost}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          /* Unlocked: "Re-Start - 30XP" — Figma: #59C8FF bg, shine overlay */
          <TouchableOpacity style={s.restartBtn} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/game/play', params: { type: 'mc' } } as any)}
          >
            <Text style={s.restartText}>Re-Start – 30XP</Text>
            <View style={s.shine1} />
            <View style={s.shine2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flex: 1 },

  // Top App Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F7F8',
  },
  topCenter: { flex: 1 },
  topTitle:  { fontFamily: FONTS.display, fontSize: 16, color: DARK },
  topSub:    { fontFamily: FONTS.body, fontSize: 12, color: ACCENT, marginTop: 1 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5,
  },
  gemPill:  { borderColor: ACCENT },
  pillNum:  { fontFamily: FONTS.heading, fontSize: 13, color: DARK },

  // Hero
  heroWrap: { position: 'relative', overflow: 'hidden' },
  heroChar: { position: 'absolute' },

  // Container
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  // Level Info Card — Figma: 343×76
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  infoDetails: { flex: 1 },
  infoName:    { fontFamily: FONTS.display, color: DARK, marginBottom: 2 },
  infoSub:     { fontFamily: FONTS.body, color: ACCENT },
  shareBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E3E6E8',
    alignItems: 'center', justifyContent: 'center',
  },

  // Section
  section: { gap: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontFamily: FONTS.display, color: DARK },
  viewAll:      { fontFamily: FONTS.body, color: GREY },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  // Description
  description: { fontFamily: FONTS.body, color: GREY },

  // Bottom action
  bottomAction: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F4',
  },
  restartBtn: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1AA3D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  restartText: { fontFamily: FONTS.display, fontSize: 17, color: '#F5FCFF', zIndex: 1 },
  shine1: {
    position: 'absolute', right: -8, top: -18,
    width: 56, height: 84, backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 6, transform: [{ rotate: '12deg' }],
  },
  shine2: {
    position: 'absolute', right: 38, top: -18,
    width: 46, height: 80, backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 6, transform: [{ rotate: '12deg' }],
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 52,
    borderWidth: 2,
    borderColor: '#E3E6E8',
  },
  unlockText: { fontFamily: FONTS.display, fontSize: 17, color: DARK },
  gemRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  unlockCost: { fontFamily: FONTS.display, fontSize: 17, color: DARK },
});
