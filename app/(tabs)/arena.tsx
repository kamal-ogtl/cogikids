import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import MieoCharacter from '../../assets/mieo-character.svg';

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
  wrong:     '#dd3636',
};

// ── Boss definitions ──────────────────────────────────────────────────────────

const BOSSES = [
  {
    id:         'word-wizard',
    name:       'Word Wizard',
    subtitle:   'Vocabulary & phrases',
    emoji:      '🧙',
    difficulty: 1,
    xp:         120,
    bgColor:    '#EDE9FE',
    accentColor:'#7C3AED',
  },
  {
    id:         'grammar-guardian',
    name:       'Grammar Guardian',
    subtitle:   'Sentences & structure',
    emoji:      '🛡️',
    difficulty: 2,
    xp:         200,
    bgColor:    '#E0F2FE',
    accentColor:'#0284C7',
  },
  {
    id:         'number-knight',
    name:       'Number Knight',
    subtitle:   'Math & logic',
    emoji:      '⚔️',
    difficulty: 3,
    xp:         300,
    bgColor:    '#FEF9C3',
    accentColor:'#CA8A04',
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const StarIcon = ({ filled, size = 14 }: { filled: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? '#F59E0B' : '#E5E7EB'}
      stroke={filled ? '#F59E0B' : '#E5E7EB'}
      strokeWidth="1"
    />
  </Svg>
);

const XpIcon = ({ size = 13 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="#F59E0B" />
    <Path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FlashIcon = ({ size = 14, color = C.accent }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h5.5L11 22l9.09-10.96A1 1 0 0 0 19 9.5h-5.5L13 2z"
          fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ArenaScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const player  = usePlayerStore(s => s.player);
  const charBounce = useRef(new Animated.Value(0)).current;

  function jiggleChar() {
    Animated.sequence([
      Animated.timing(charBounce, { toValue: -14, duration: 160, useNativeDriver: true }),
      Animated.spring(charBounce, { toValue: 0, tension: 130, friction: 6, useNativeDriver: true }),
    ]).start();
  }

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 12, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.pageTitle}>Battle Arena</Text>
            <Text style={s.pageSub}>Choose your challenger</Text>
          </View>
          {player && (
            <View style={s.xpPill}>
              <XpIcon size={13} />
              <Text style={s.xpText}>{player.xp ?? 0} XP</Text>
            </View>
          )}
        </View>

        {/* ── Mieo hero ───────────────────────────────────────────────────── */}
        <TouchableOpacity activeOpacity={0.9} onPress={jiggleChar} style={s.hero}>
          <Animated.View style={{ transform: [{ translateY: charBounce }] }}>
            <MieoCharacter width={88 * SC} height={92 * SC} />
          </Animated.View>
          <View style={s.bubble}>
            <View style={s.bubbleTailBorder} />
            <View style={s.bubbleTailFill} />
            <Text style={s.bubbleText}>
              {"Pick a boss and\ntest your knowledge! 🔥"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Boss cards ──────────────────────────────────────────────────── */}
        <View style={s.cardList}>
          {BOSSES.map(boss => (
            <BossCard
              key={boss.id}
              boss={boss}
              onPress={() => router.push(`/battle/${boss.id}`)}
            />
          ))}
        </View>

        {/* ── Coming soon teaser ──────────────────────────────────────────── */}
        <View style={s.teaser}>
          <View style={s.teaserIcon}>
            <FlashIcon size={18} color="#5d686f" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.teaserTitle}>Daily Challenge</Text>
            <Text style={s.teaserSub}>New boss every day • Coming soon</Text>
          </View>
          <View style={s.teaserBadge}>
            <Text style={s.teaserBadgeTxt}>Soon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Boss card ─────────────────────────────────────────────────────────────────

function BossCard({
  boss,
  onPress,
}: {
  boss: (typeof BOSSES)[number];
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={()  => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        {/* Boss avatar */}
        <View style={[s.bossAvatar, { backgroundColor: boss.bgColor }]}>
          <Text style={s.bossEmoji}>{boss.emoji}</Text>
        </View>

        {/* Info */}
        <View style={s.bossInfo}>
          <Text style={s.bossName}>{boss.name}</Text>
          <Text style={s.bossSub}>{boss.subtitle}</Text>

          {/* Stars + XP */}
          <View style={s.bossMetaRow}>
            <View style={s.stars}>
              {[1, 2, 3].map(i => (
                <StarIcon key={i} filled={i <= boss.difficulty} size={13} />
              ))}
            </View>
            <View style={s.xpTag}>
              <XpIcon size={11} />
              <Text style={s.xpTagTxt}>+{boss.xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Challenge button */}
        <TouchableOpacity style={[s.challengeBtn, { backgroundColor: boss.accentColor }]} onPress={onPress} activeOpacity={0.85}>
          <Text style={s.challengeTxt}>Fight</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16 * SC, gap: 16 * SC },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4 * SC,
  },
  pageTitle: { fontFamily: FONTS.display, fontSize: 22 * SC, color: C.dark },
  pageSub:   { fontFamily: FONTS.body, fontSize: 13 * SC, color: C.grey, marginTop: 2 },
  xpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5, borderColor: '#FDE68A',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  xpText: { fontFamily: FONTS.heading, fontSize: 13 * SC, color: '#92400E' },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * SC,
    paddingVertical: 8 * SC,
  },
  bubble: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 12 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleTailBorder: {
    position: 'absolute', left: -12, top: 16,
    width: 0, height: 0,
    borderTopWidth: 9, borderBottomWidth: 9, borderRightWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: C.border,
  },
  bubbleTailFill: {
    position: 'absolute', left: -9, top: 18,
    width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: C.card,
  },
  bubbleText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13 * SC,
    color: C.dark,
    lineHeight: 19 * SC,
  },

  // Cards list
  cardList: { gap: 12 * SC },

  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14 * SC,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bossAvatar: {
    width: 56 * SC,
    height: 56 * SC,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossEmoji: { fontSize: 28 * SC },
  bossInfo:  { flex: 1 },
  bossName:  { fontFamily: FONTS.heading, fontSize: 15 * SC, color: C.dark },
  bossSub:   { fontFamily: FONTS.body, fontSize: 12 * SC, color: C.grey, marginTop: 2 },
  bossMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  stars: { flexDirection: 'row', gap: 2 },
  xpTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF9C3', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  xpTagTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 * SC, color: '#92400E' },
  challengeBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center',
  },
  challengeTxt: { fontFamily: FONTS.heading, fontSize: 13 * SC, color: '#fff' },

  // Teaser
  teaser: {
    flexDirection: 'row', alignItems: 'center', gap: 12 * SC,
    backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, padding: 14 * SC,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  teaserIcon: {
    width: 40 * SC, height: 40 * SC, borderRadius: 12,
    backgroundColor: C.accentBg,
    alignItems: 'center', justifyContent: 'center',
  },
  teaserTitle: { fontFamily: FONTS.heading, fontSize: 14 * SC, color: C.dark },
  teaserSub:   { fontFamily: FONTS.body, fontSize: 12 * SC, color: C.grey, marginTop: 2 },
  teaserBadge: {
    backgroundColor: C.accentBg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
  },
  teaserBadgeTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 * SC, color: C.accent },
});
