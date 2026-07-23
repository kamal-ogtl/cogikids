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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';

import LevelIconCave   from '../../assets/level-icon-cave.svg';
import LevelIconPark   from '../../assets/level-icon-park.svg';
import LevelIconDesert from '../../assets/level-icon-desert.svg';
import IconBack        from '../../assets/icon-back.svg';
import IconDiamond     from '../../assets/icon-diamond.svg';
import IconEnterArrow  from '../../assets/icon-enter-arrow.svg';
import IconLock        from '../../assets/icon-lock.svg';

const { width: SW } = Dimensions.get('window');
const SC = SW / 375;

const CAVE_CARD   = require('../../assets/level-cave-card.png');
const PARK_CARD   = require('../../assets/level-park-card.png');
const DESERT_CARD = require('../../assets/level-desert-card.png');

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
  cardImage: ReturnType<typeof require>;
  Icon: React.FC<{ width: number; height: number }>;
  description: string;
  unlockCost: number;
};

const LEVELS: LevelData[] = [
  {
    id: 'cave',
    name: 'Incredible Cave',
    levelNum: 4,
    totalUnits: 12,
    locked: false,
    cardImage: CAVE_CARD,
    Icon: LevelIconCave,
    description:
      'This level is for very beginners level users to get start with their basic words and info. Lorem ipsum is a dummy or placeholder text comments used in graphic design, publishing, and web development.',
    unlockCost: 0,
  },
  {
    id: 'park',
    name: 'The Unpredictable Park',
    levelNum: 5,
    totalUnits: 12,
    locked: false,
    cardImage: PARK_CARD,
    Icon: LevelIconPark,
    description:
      'Explore the unpredictable park where every corner brings a new language adventure. Lorem ipsum is a dummy or placeholder text comments used in graphic design, publishing, and web development.',
    unlockCost: 0,
  },
  {
    id: 'desert',
    name: 'The Flaming Desert',
    levelNum: 6,
    totalUnits: 9,
    locked: true,
    cardImage: DESERT_CARD,
    Icon: LevelIconDesert,
    description:
      'Journey through the burning sands where ancient languages are carved in stone. Lorem ipsum is a dummy or placeholder text comments used in graphic design, publishing, and web development.',
    unlockCost: 350,
  },
];

// Figma: Progress bar is 23×780 with 3 step dots
const DOT_POSITIONS = [0.12, 0.5, 0.88];
const PROGRESS_FILL = 0.51;

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar() {
  const BAR_H = 660 * SC;
  return (
    <View style={[pb.container, { height: BAR_H }]}>
      <View style={[pb.track, { height: BAR_H }]} />
      <View style={[pb.fill, { height: BAR_H * PROGRESS_FILL }]} />
      <View
        style={[
          pb.brown,
          {
            height: BAR_H * (1 - PROGRESS_FILL) * 0.45,
            top: BAR_H * PROGRESS_FILL,
          },
        ]}
      />
      {DOT_POSITIONS.map((pos, i) => (
        <View
          key={i}
          style={[
            pb.dot,
            i === 1 ? pb.dotActive : pb.dotDone,
            { top: BAR_H * pos - 6.5 * SC },
          ]}
        />
      ))}
    </View>
  );
}

const pb = StyleSheet.create({
  container: { width: 23 * SC, position: 'relative' },
  track:     { position: 'absolute', left: 5 * SC, width: 13 * SC, borderRadius: 8, backgroundColor: '#F5FCFF' },
  fill: {
    position: 'absolute', left: 5 * SC, width: 13 * SC,
    borderRadius: 8, top: 0, backgroundColor: '#1AB3FF',
  },
  brown: {
    position: 'absolute', left: 5 * SC, width: 13 * SC,
    backgroundColor: '#8F5031',
  },
  dot: {
    position: 'absolute', left: 0, width: 13 * SC, height: 13 * SC,
    borderRadius: 8,
  },
  dotDone:   { backgroundColor: '#F5FCFF', borderWidth: 1, borderColor: '#D0EBF7' },
  dotActive: { backgroundColor: '#59C8FF' },
});

function LevelCard({ level, onPress }: { level: LevelData; onPress: () => void }) {
  const { Icon } = level;
  const CARD_W   = 304 * SC;
  const COVER_H  = 188 * SC;
  const INFO_H   = 56 * SC;
  const ICON_SZ  = 44 * SC;
  const BTN_SZ   = 36 * SC;

  return (
    <TouchableOpacity
      style={[s.card, { width: CARD_W }]}
      activeOpacity={level.locked ? 1 : 0.9}
      onPress={level.locked ? undefined : onPress}
    >
      {/* Cover image — Figma: 304×188 */}
      <View style={{ width: CARD_W, height: COVER_H, borderRadius: 12 * SC, overflow: 'hidden' }}>
        <Image
          source={level.cardImage}
          style={{ width: CARD_W, height: COVER_H }}
          resizeMode="cover"
        />
        {level.locked && (
          <View style={s.lockOverlay}>
            <IconLock width={28 * SC} height={28 * SC} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      </View>

      {/* Info row — Figma: 304×44 */}
      <View style={[s.infoRow, { height: INFO_H }]}>
        {/* Level icon SVG — Figma: 44×44 */}
        <Icon width={ICON_SZ} height={ICON_SZ} />

        {/* Details */}
        <View style={s.details}>
          <Text style={[s.levelName, { fontSize: 15 * SC }]} numberOfLines={1}>
            {level.name}
          </Text>
          <Text style={[s.levelSub, { fontSize: 12 * SC }]}>
            Level {level.levelNum}, Total Units {level.totalUnits}
          </Text>
        </View>

        {/* Enter / lock button — Figma: 36×36 */}
        <View
          style={[
            s.enterBtn,
            { width: BTN_SZ, height: BTN_SZ, borderRadius: BTN_SZ / 2 },
            level.locked ? s.enterBtnLocked : s.enterBtnOpen,
          ]}
        >
          {level.locked ? (
            <IconLock
              width={16 * SC}
              height={16 * SC}
              color="#A0A8AF"
            />
          ) : (
            <IconEnterArrow
              width={16 * SC}
              height={16 * SC}
              color={ACCENT}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ExploreLevelsScreen() {
  const insets = useSafeAreaInsets();
  const player = usePlayerStore(s => s.player);

  const gems  = (player as any)?.gems  ?? 245;
  const lives = (player as any)?.lives ?? 5;

  return (
    <View style={s.root}>
      {/* ── Top App Bar — Figma: 375×80, white ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <IconBack width={22} height={22} color={DARK} />
        </TouchableOpacity>

        <View style={s.topCenter}>
          <Text style={s.topTitle}>Explore Levels</Text>
        </View>

        <View style={s.topActions}>
          <View style={[s.pill, s.gemPill]}>
            <IconDiamond width={16} height={16} color={ACCENT} />
            <Text style={s.pillNum}>{gems}</Text>
          </View>
          <View style={[s.pill, s.heartPill]}>
            <Text style={s.pillEmoji}>❤️</Text>
            <Text style={s.pillNum}>{lives}</Text>
          </View>
        </View>
      </View>

      {/* ── Body: progress bar + levels list ── */}
      <View style={s.body}>
        {/* Progress indicator — Figma: 23px wide vertical */}
        <View style={s.progressWrap}>
          <ProgressBar />
        </View>

        {/* Levels list — Figma: 304px wide */}
        <ScrollView
          style={s.listScroll}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        >
          {LEVELS.map(level => (
            <LevelCard
              key={level.id}
              level={level}
              onPress={() =>
                router.push({
                  pathname: '/story/[levelId]',
                  params: { levelId: level.id },
                } as any)
              }
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },

  // Top App Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F7F8',
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle:  { fontFamily: FONTS.display, fontSize: 18, color: DARK },
  topActions: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5,
  },
  gemPill:   { borderColor: ACCENT },
  heartPill: { borderColor: '#FF6B6B' },
  pillEmoji: { fontSize: 13 },
  pillNum:   { fontFamily: FONTS.heading, fontSize: 13, color: DARK },

  // Body layout
  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  progressWrap: {
    width: 30 * SC,
    alignItems: 'center',
    paddingTop: 20 * SC,
  },
  listScroll: { flex: 1 },
  listContent: {
    gap: 24 * SC,
    paddingBottom: 100,
    paddingLeft: 8,
    paddingRight: 4,
  },

  // Level Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14 * SC,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10 * SC,
    paddingHorizontal: 10 * SC,
  },
  details:  { flex: 1 },
  levelName: { fontFamily: FONTS.display, color: DARK, marginBottom: 2 },
  levelSub:  { fontFamily: FONTS.body, color: GREY },
  enterBtn:  { alignItems: 'center', justifyContent: 'center' },
  enterBtnOpen:   { backgroundColor: '#DFF4FF' },
  enterBtnLocked: { backgroundColor: '#E3E6E8' },
});
