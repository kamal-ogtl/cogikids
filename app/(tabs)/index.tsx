import React, { useState, useCallback, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';

// Small SVG elements imported as components via react-native-svg-transformer
import MieoCharacter from '../../assets/mieo-character.svg';
import HomeClouds    from '../../assets/home-clouds.svg';

// Large backgrounds as PNG — SVG files are too large for Metro transformer
const LEVEL_COVER = require('../../assets/home-levelcover.png');
const LEVEL_STEPS = require('../../assets/home-levelsteps.png');

// ── Dimensions ────────────────────────────────────────────────────────────────
const COVER_FH = 202;
const STEPS_FH = 908;
const { width: SW } = Dimensions.get('window');
const SC = SW / 375;

// ── Tokens ────────────────────────────────────────────────────────────────────
const ACCENT = '#59C8FF';
const DARK   = '#171A1C';
const GREY   = '#5D686F';
const GRASS  = '#79B54E';
const SKY    = '#87CEEB';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ha', label: 'Hausa',   flag: '🇳🇬' },
  { code: 'yo', label: 'Yoruba',  flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo',    flag: '🇳🇬' },
];

// ── Path definition ───────────────────────────────────────────────────────────
// Node centres in 375×908 Level Steps coordinate space
// (from Figma SVG rect positions: cx = x + 36, cy = y + 36)
const PATH_NODES = [
  { cx: 113, cy: 61  },  // 0 – done
  { cx: 180, cy: 185 },  // 1 – active (current)
  { cx: 262, cy: 309 },  // 2 – locked
  { cx: 190, cy: 418 },  // 3 – locked
  { cx: 115, cy: 525 },  // 4 – locked
  { cx: 190, cy: 648 },  // 5 – locked
];

// Cubic bezier control points for each segment (one pair per gap between nodes)
const BEZIER_CP = [
  { cp1x: 140, cp1y: 90,  cp2x: 172, cp2y: 158 }, // 0 → 1
  { cp1x: 222, cp1y: 218, cp2x: 272, cp2y: 268 }, // 1 → 2
  { cp1x: 252, cp1y: 375, cp2x: 218, cp2y: 402 }, // 2 → 3
  { cp1x: 165, cp1y: 458, cp2x: 120, cp2y: 498 }, // 3 → 4
  { cp1x: 138, cp1y: 578, cp2x: 172, cp2y: 626 }, // 4 → 5
];

function cubicBezier(p0: number, cp1: number, cp2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * cp1 + 3 * u * t * t * cp2 + t * t * t * p3;
}

// ── Node data ─────────────────────────────────────────────────────────────────
type NodeState = 'done' | 'active' | 'locked';
type IName = React.ComponentProps<typeof Ionicons>['name'];

type MapNode = {
  id: number; state: NodeState;
  lesson: string; progress: string; xp: number;
  icon: IName; cx: number; cy: number;
};

const INITIAL_NODES: MapNode[] = [
  { id: 1, state: 'done',   icon: 'flag',                     lesson: 'Forest Greetings',  progress: 'Lesson 6 of 6', xp: 25, cx: 113, cy: 61  },
  { id: 2, state: 'active', icon: 'barbell',                  lesson: 'Hanging in Garden', progress: 'Lesson 2 of 6', xp: 25, cx: 180, cy: 185 },
  { id: 3, state: 'locked', icon: 'extension-puzzle-outline', lesson: 'Tree Puzzles',      progress: 'Lesson 1 of 6', xp: 30, cx: 262, cy: 309 },
  { id: 4, state: 'locked', icon: 'star-outline',             lesson: 'Park Adventure',    progress: 'Lesson 1 of 6', xp: 30, cx: 190, cy: 418 },
  { id: 5, state: 'locked', icon: 'star-outline',             lesson: 'Garden Stories',    progress: 'Lesson 1 of 6', xp: 30, cx: 115, cy: 525 },
  { id: 6, state: 'locked', icon: 'star-outline',             lesson: 'Final Challenge',   progress: 'Lesson 1 of 6', xp: 40, cx: 190, cy: 648 },
];

const CHAR_W = 56 * SC;
const CHAR_H = 60 * SC;

const NODE_SIZE = 72 * SC;
const NODE_HALF = 36 * SC;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ── Character animated along bezier path ──────────────────────────────────────
// Uses RN's built-in Animated (not Reanimated) — compatible with all Expo Go versions.
// Animates through 40 interpolated bezier steps for a smooth curved path.
function useCharacterPath(initialNodeIdx: number) {
  const node   = PATH_NODES[Math.min(initialNodeIdx, PATH_NODES.length - 1)];
  const startX = (node.cx - 28) * SC;
  const startY = (node.cy - CHAR_H / SC - 4) * SC;

  const charX = useRef(new Animated.Value(startX)).current;
  const charY = useRef(new Animated.Value(startY)).current;

  const moveTo = useCallback((toIdx: number, fromIdx: number) => {
    const seg    = Math.min(fromIdx, PATH_NODES.length - 2);
    const from   = PATH_NODES[seg];
    const to     = PATH_NODES[Math.min(toIdx, PATH_NODES.length - 1)];
    const cp     = BEZIER_CP[Math.min(seg, BEZIER_CP.length - 1)];
    const STEPS  = 40;
    const DUR    = 1400;
    const stepMs = DUR / STEPS;

    const xSteps = Array.from({ length: STEPS }, (_, i) => {
      const t = (i + 1) / STEPS;
      return cubicBezier(from.cx, cp.cp1x, cp.cp2x, to.cx, t);
    });
    const ySteps = Array.from({ length: STEPS }, (_, i) => {
      const t = (i + 1) / STEPS;
      return cubicBezier(from.cy, cp.cp1y, cp.cp2y, to.cy, t);
    });

    Animated.sequence([
      ...xSteps.map((_, i) =>
        Animated.parallel([
          Animated.timing(charX, {
            toValue: (xSteps[i] - 28) * SC,
            duration: stepMs,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(charY, {
            toValue: (ySteps[i] - CHAR_H / SC - 4) * SC,
            duration: stepMs,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]),
      ),
    ]).start();
  }, [charX, charY]);

  const animStyle = {
    position: 'absolute' as const,
    width:  CHAR_W,
    height: CHAR_H,
    left:   charX,
    top:    charY,
  };

  return { animStyle, moveTo };
}

// ── Node button ───────────────────────────────────────────────────────────────
function NodeButton({
  node, onPress,
}: { node: MapNode; onPress: () => void }) {
  const { state, icon } = node;
  const iSz = Math.round(24 * SC);

  if (state === 'done') {
    return (
      <TouchableOpacity style={nb.wrap} activeOpacity={0.8} onPress={onPress}>
        <View style={[nb.circle, nb.done]}>
          <Ionicons name={icon} size={iSz} color="#7B4B1F" />
        </View>
      </TouchableOpacity>
    );
  }
  if (state === 'active') {
    return (
      <TouchableOpacity style={nb.wrap} activeOpacity={0.8} onPress={onPress}>
        <View style={nb.activeRing} />
        <View style={[nb.circle, nb.active]}>
          <Ionicons name={icon} size={iSz} color="#6B5244" />
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={nb.wrap}>
      <View style={[nb.circle, nb.locked]}>
        <Ionicons name={icon} size={Math.round(20 * SC)} color="rgba(120,100,80,0.45)" />
      </View>
    </View>
  );
}

const nb = StyleSheet.create({
  wrap:   { width: NODE_SIZE, height: NODE_SIZE, alignItems: 'center', justifyContent: 'center' },
  circle: { width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_HALF, alignItems: 'center', justifyContent: 'center' },
  done: {
    backgroundColor: 'rgba(255,255,255,0.89)',
    borderWidth: Math.round(2 * SC), borderColor: '#C49B6A',
    shadowColor: '#7B4B1F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 5,
  },
  active: {
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderWidth: Math.round(3 * SC), borderColor: 'rgba(255,255,255,0.80)',
  },
  activeRing: {
    position: 'absolute',
    width:  NODE_SIZE + Math.round(10 * SC),
    height: NODE_SIZE + Math.round(10 * SC),
    borderRadius: NODE_HALF + Math.round(5 * SC),
    borderWidth: Math.round(4 * SC), borderColor: 'rgba(255,255,255,0.38)',
  },
  locked: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: Math.round(1.5 * SC), borderColor: 'rgba(255,255,255,0.18)',
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const player = usePlayerStore(s => s.player);

  const [nodes,      setNodes]      = useState<MapNode[]>(INITIAL_NODES);
  const [langOpen,   setLangOpen]   = useState(false);
  const [lang,       setLang]       = useState(LANGUAGES[0]);
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);
  const [heartsOpen, setHeartsOpen] = useState(false);
  const [headerH,    setHeaderH]    = useState(180);

  const gems  = (player as any)?.gems  ?? 245;
  const lives = (player as any)?.lives ?? 5;

  const coverH = COVER_FH * SC;
  const stepsH = STEPS_FH * SC;

  // Character starts at the last completed node (index 0 = node 1 done)
  const lastDoneIdx = nodes.findLastIndex(n => n.state === 'done');
  const { animStyle: charStyle, moveTo } = useCharacterPath(
    Math.max(lastDoneIdx, 0),
  );

  // Called when the user completes a lesson from the Quick Play overlay
  const handleLessonComplete = useCallback((node: MapNode) => {
    setActiveNode(null);
    const idx = nodes.findIndex(n => n.id === node.id);
    if (idx < 0) return;

    setNodes(prev => prev.map((n, i) => {
      if (i === idx)     return { ...n, state: 'done'   };
      if (i === idx + 1) return { ...n, state: 'active' };
      return n;
    }));

    // Animate character from current done node to newly completed node
    const prevDoneIdx = nodes.filter((n, i) => i < idx && n.state === 'done').length - 1;
    moveTo(idx, Math.max(prevDoneIdx, 0));
  }, [nodes, moveTo]);

  return (
    <View style={s.root}>
      {/* Grass base everywhere; sky gradient fades in over the top portion */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: GRASS }]} />
      <LinearGradient
        colors={[SKY, '#A8D8F0', '#C4EAFF', 'rgba(135,206,235,0)']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.42 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[s.clouds, { top: insets.top - 30 }]} pointerEvents="none">
        <HomeClouds width={SW + 100} height={250} />
      </View>

      {/* ── Map scroll ── */}
      <ScrollView
        style={[s.scroll, { marginTop: headerH }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Level Cover — park scene with fence, trees, Mieo waving */}
        <Image
          source={LEVEL_COVER}
          style={{ width: SW, height: coverH }}
          resizeMode="stretch"
        />

        {/* Level Steps — winding path with node overlays and animated character */}
        <View style={{ width: SW, height: stepsH, backgroundColor: GRASS }}>
          <Image
            source={LEVEL_STEPS}
            style={{ width: SW, height: stepsH }}
            resizeMode="stretch"
          />

          {/* Node buttons at positions from Figma SVG rects */}
          {nodes.map(node => (
            <View
              key={node.id}
              style={[s.nodeAbs, { left: (node.cx - 36) * SC, top: (node.cy - 36) * SC }]}
            >
              <NodeButton
                node={node}
                onPress={() => node.state !== 'locked' && setActiveNode(node)}
              />
            </View>
          ))}

          {/* Mieo character — animated along bezier path between node centres */}
          <Animated.View style={charStyle}>
            <MieoCharacter width={CHAR_W} height={CHAR_H} />
          </Animated.View>
        </View>
      </ScrollView>

      {/* ── Floating header ── */}
      <View
        style={[s.header, { paddingTop: insets.top + 10 }]}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}
      >
        <View style={s.topBar}>
          <View style={s.greetCol}>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <TouchableOpacity style={s.langRow} activeOpacity={0.8} onPress={() => setLangOpen(v => !v)}>
              <Text style={s.langFlag}>{lang.flag}</Text>
              <Text style={s.langLabel}>{lang.label}</Text>
              <Ionicons name="chevron-down" size={13} color={GREY} />
            </TouchableOpacity>
            {langOpen && (
              <View style={s.langDrop}>
                {LANGUAGES.map(l => (
                  <TouchableOpacity key={l.code} style={s.langOpt} onPress={() => { setLang(l); setLangOpen(false); }}>
                    <Text style={s.langFlag}>{l.flag}</Text>
                    <Text style={[s.langLabel, l.code === lang.code && { color: ACCENT, fontFamily: FONTS.heading }]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={s.statRow}>
            <View style={[s.pill, s.gemPill]}>
              <Text style={s.pillEmoji}>💎</Text>
              <Text style={s.pillNum}>{gems}</Text>
            </View>
            <TouchableOpacity style={[s.pill, s.heartPill]} activeOpacity={0.8} onPress={() => setHeartsOpen(true)}>
              <Text style={s.pillEmoji}>❤️</Text>
              <Text style={s.pillNum}>{lives}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.levelCard} activeOpacity={0.9} onPress={() => router.push('/story/map' as any)}>
          <View style={s.levelIconWrap}>
            <Ionicons name="paw" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.levelSub}>Level {player?.level ?? 5}, Unit 2</Text>
            <Text style={s.levelName}>The Unpredictable Park</Text>
          </View>
          <View style={s.menuBtn}>
            <Ionicons name="reorder-three" size={20} color={ACCENT} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Hearts overlay ── */}
      <Modal transparent visible={heartsOpen} animationType="fade" onRequestClose={() => setHeartsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setHeartsOpen(false)}>
          <View style={s.overlayBg}>
            <TouchableWithoutFeedback>
              <View style={s.overlayCard}>
                <View style={s.heartsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={s.heartIcon}>{i < lives ? '❤️' : '🩶'}</Text>
                  ))}
                </View>
                <CtaBtn label="Watch Ad to Earn 1 Heart" onPress={() => setHeartsOpen(false)} />
                <OutlineBtn label="Or Use  💎 350" onPress={() => setHeartsOpen(false)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Quick Play / lesson start overlay ── */}
      <Modal transparent visible={activeNode !== null} animationType="fade" onRequestClose={() => setActiveNode(null)}>
        <TouchableWithoutFeedback onPress={() => setActiveNode(null)}>
          <View style={s.overlayBg}>
            <TouchableWithoutFeedback>
              <View style={s.overlayCard}>
                <Text style={s.quickTitle}>{activeNode?.lesson}</Text>
                <Text style={s.quickSub}>{activeNode?.progress}</Text>
                {activeNode?.state === 'active' && (
                  <CtaBtn
                    label={`Start +${activeNode?.xp} XP`}
                    onPress={() => {
                      if (activeNode) handleLessonComplete(activeNode);
                    }}
                  />
                )}
                {activeNode?.state === 'done' && (
                  <CtaBtn
                    label="Review Lesson"
                    onPress={() => { setActiveNode(null); router.push('/(tabs)/skills' as any); }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function CtaBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={onPress}>
      <Text style={s.ctaBtnText}>{label}</Text>
      <View style={s.shine1} /><View style={s.shine2} />
    </TouchableOpacity>
  );
}
function OutlineBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.outlineBtn} activeOpacity={0.85} onPress={onPress}>
      <Text style={s.outlineBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { flex: 1 },
  clouds:  { position: 'absolute', width: SW + 100, height: 250, left: -50, overflow: 'hidden' },
  nodeAbs: { position: 'absolute' },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    paddingHorizontal: 20, paddingBottom: 14,
  },
  topBar:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  greetCol:  { flex: 1, position: 'relative' },
  greeting:  { fontFamily: FONTS.display, fontSize: 26, color: DARK, marginBottom: 4 },
  langRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  langFlag:  { fontSize: 18 },
  langLabel: { fontFamily: FONTS.body, fontSize: 14, color: GREY },
  langDrop: {
    position: 'absolute', top: 52, left: 0, zIndex: 100,
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E3E6E8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 12,
    overflow: 'hidden', minWidth: 160,
  },
  langOpt: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F0F2F4',
  },

  statRow:  { flexDirection: 'row', gap: 8, marginTop: 2 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5,
  },
  gemPill:   { borderColor: ACCENT },
  heartPill: { borderColor: '#FF6B6B' },
  pillEmoji: { fontSize: 15 },
  pillNum:   { fontFamily: FONTS.heading, fontSize: 15, color: DARK },

  levelCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1, borderColor: '#CBE8F4',
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#59C8FF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
  },
  levelIconWrap: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#7B4B1F',
    alignItems: 'center', justifyContent: 'center',
  },
  levelSub:  { fontFamily: FONTS.body,    fontSize: 12, color: ACCENT, marginBottom: 2 },
  levelName: { fontFamily: FONTS.display, fontSize: 16, color: DARK },
  menuBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EAF7FF', alignItems: 'center', justifyContent: 'center',
  },

  overlayBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  overlayCard: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 24, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  heartsRow:  { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 4 },
  heartIcon:  { fontSize: 32 },
  quickTitle: { fontFamily: FONTS.display, fontSize: 22, color: DARK },
  quickSub:   { fontFamily: FONTS.body,    fontSize: 14, color: ACCENT },

  ctaBtn: {
    backgroundColor: ACCENT, borderRadius: 28, height: 52,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  ctaBtnText:     { fontFamily: FONTS.display, fontSize: 17, color: '#F5FCFF', zIndex: 1 },
  outlineBtn:     { borderRadius: 28, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E3E6E8' },
  outlineBtnText: { fontFamily: FONTS.display, fontSize: 17, color: DARK },
  shine1: { position: 'absolute', right: -8, top: -18, width: 54, height: 80, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6, transform: [{ rotate: '12deg' }] },
  shine2: { position: 'absolute', right: 36, top: -18, width: 44, height: 76, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 6, transform: [{ rotate: '12deg' }] },
});
