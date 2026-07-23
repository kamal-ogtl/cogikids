import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, {
  Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop,
} from 'react-native-svg';
import * as Speech from 'expo-speech';

import MieoCharacter from '../../assets/mieo-character.svg';
import { FONTS } from '../../src/constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const SC = SW / 375;

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Nature scene ─────────────────────────────────────────────────────────────

function NatureScene() {
  const px = (n: number) => (n / 375) * SW;
  const py = (n: number) => (n / 812) * SH;

  return (
    <Svg width={SW} height={SH} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#6BBDE0" />
          <Stop offset="0.6" stopColor="#A8D9EE" />
          <Stop offset="1"   stopColor="#D4EEFA" />
        </LinearGradient>
        <LinearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3B8C4D" />
          <Stop offset="1" stopColor="#2E6B3A" />
        </LinearGradient>
        <LinearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4CBF61" />
          <Stop offset="1" stopColor="#39A14F" />
        </LinearGradient>
      </Defs>

      {/* Sky */}
      <Rect x={0} y={0} width={SW} height={SH} fill="url(#sky)" />

      {/* Cloud left */}
      <G>
        <Ellipse cx={px(55)}  cy={py(82)}  rx={px(34)} ry={py(17)} fill="white" opacity={0.93} />
        <Ellipse cx={px(82)}  cy={py(70)}  rx={px(30)} ry={py(16)} fill="white" opacity={0.93} />
        <Ellipse cx={px(100)} cy={py(85)}  rx={px(24)} ry={py(15)} fill="white" opacity={0.93} />
      </G>

      {/* Cloud right */}
      <G>
        <Ellipse cx={px(265)} cy={py(94)}  rx={px(30)} ry={py(16)} fill="white" opacity={0.88} />
        <Ellipse cx={px(292)} cy={py(82)}  rx={px(26)} ry={py(14)} fill="white" opacity={0.88} />
        <Ellipse cx={px(313)} cy={py(96)}  rx={px(22)} ry={py(13)} fill="white" opacity={0.88} />
      </G>

      {/* Background hill */}
      <Path
        d={`M -10 ${py(545)} Q ${px(60)} ${py(355)} ${px(210)} ${py(435)} Q ${px(300)} ${py(475)} ${SW + 10} ${py(515)} L ${SW + 10} ${SH} L -10 ${SH} Z`}
        fill="url(#hillGrad)"
      />

      {/* Tree trunk */}
      <Rect x={px(238)} y={py(362)} width={px(20)} height={py(160)} rx={px(4)} fill="#6D4C41" />
      {/* Tree canopy */}
      <Circle cx={px(248)} cy={py(317)} r={px(62)} fill="#2E6B3A" />
      <Circle cx={px(277)} cy={py(290)} r={px(50)} fill="#388E3C" />
      <Circle cx={px(222)} cy={py(300)} r={px(46)} fill="#33691E" />
      <Circle cx={px(252)} cy={py(268)} r={px(40)} fill="#43A047" />
      <Circle cx={px(265)} cy={py(276)} r={px(18)} fill="#4CAF50" opacity={0.4} />

      {/* Small bush left */}
      <Circle cx={px(52)}  cy={py(493)} r={px(30)} fill="#2E6B3A" />
      <Circle cx={px(75)}  cy={py(479)} r={px(24)} fill="#388E3C" />
      <Circle cx={px(38)}  cy={py(483)} r={px(20)} fill="#33691E" />
      <Rect   x={px(58)}   y={py(510)} width={px(8)} height={py(26)} rx={px(2)} fill="#6D4C41" />

      {/* Grass */}
      <Path
        d={`M -10 ${py(508)} Q ${px(95)} ${py(477)} ${px(190)} ${py(497)} Q ${px(295)} ${py(517)} ${SW + 10} ${py(497)} L ${SW + 10} ${SH} L -10 ${SH} Z`}
        fill="url(#grassGrad)"
      />

      {/* Grass blades */}
      <Path d={`M ${px(15)} ${py(502)} C ${px(17)} ${py(477)} ${px(21)} ${py(474)} ${px(19)} ${py(497)}`}
            stroke="#3D9E52" strokeWidth={px(2.5)} fill="none" />
      <Path d={`M ${px(350)} ${py(498)} C ${px(352)} ${py(473)} ${px(356)} ${py(470)} ${px(354)} ${py(493)}`}
            stroke="#3D9E52" strokeWidth={px(2.5)} fill="none" />
      <Path d={`M ${px(170)} ${py(495)} C ${px(172)} ${py(470)} ${px(176)} ${py(467)} ${px(174)} ${py(490)}`}
            stroke="#3D9E52" strokeWidth={px(2)} fill="none" />

      {/* Yellow flower */}
      <Circle cx={px(125)} cy={py(519)} r={px(4)} fill="#FFF176" />
      <Circle cx={px(125)} cy={py(512)} r={px(3)} fill="#FFF176" />
      <Circle cx={px(131)} cy={py(516)} r={px(3)} fill="#FFF176" />
      <Circle cx={px(119)} cy={py(516)} r={px(3)} fill="#FFF176" />
      <Circle cx={px(125)} cy={py(517)} r={px(5)} fill="#FFD600" />

      {/* Pink flower */}
      <Circle cx={px(185)} cy={py(534)} r={px(4)} fill="#F48FB1" />
      <Circle cx={px(185)} cy={py(527)} r={px(3)} fill="#F48FB1" />
      <Circle cx={px(191)} cy={py(531)} r={px(3)} fill="#F48FB1" />
      <Circle cx={px(179)} cy={py(531)} r={px(3)} fill="#F48FB1" />
      <Circle cx={px(185)} cy={py(532)} r={px(5)} fill="#E91E63" />

      {/* Purple flower */}
      <Circle cx={px(315)} cy={py(515)} r={px(3.5)} fill="#CE93D8" />
      <Circle cx={px(315)} cy={py(509)} r={px(2.5)} fill="#CE93D8" />
      <Circle cx={px(320)} cy={py(512)} r={px(2.5)} fill="#CE93D8" />
      <Circle cx={px(310)} cy={py(512)} r={px(2.5)} fill="#CE93D8" />
      <Circle cx={px(315)} cy={py(513)} r={px(4.5)} fill="#9C27B0" />

      {/* Duck 1 */}
      <Ellipse cx={px(102)} cy={py(510)} rx={px(15)} ry={py(9)}   fill="#FFD600" />
      <Circle  cx={px(115)} cy={py(505)} r={px(8)}                  fill="#FFD600" />
      <Path    d={`M ${px(122)} ${py(505)} L ${px(128)} ${py(506.5)} L ${px(122)} ${py(508)} Z`} fill="#FF8F00" />
      <Circle  cx={px(118)} cy={py(503)} r={px(1.5)}                fill="#333" />
      <Path    d={`M ${px(103)} ${py(510)} Q ${px(108)} ${py(505)} ${px(113)} ${py(510)}`}
               stroke="#E6BA00" strokeWidth={px(1.5)} fill="none" />

      {/* Duck 2 */}
      <Ellipse cx={px(332)} cy={py(505)} rx={px(12)} ry={py(7)}   fill="#FFD600" />
      <Circle  cx={px(343)} cy={py(500)} r={px(6.5)}               fill="#FFD600" />
      <Path    d={`M ${px(349)} ${py(500)} L ${px(354)} ${py(501)} L ${px(349)} ${py(502.5)} Z`} fill="#FF8F00" />
      <Circle  cx={px(346)} cy={py(498)} r={px(1.2)}               fill="#333" />
    </Svg>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ClockIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" stroke="#22C55E" strokeWidth="2.2" fill="none" />
    <Path d="M12 7v5l3 3" stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PauseIcon = ({ sz }: { sz: number }) => (
  <Svg width={sz} height={sz} viewBox="0 0 24 24">
    <Rect x="6" y="4" width="4" height="16" rx="1.5" fill="#5d686f" />
    <Rect x="14" y="4" width="4" height="16" rx="1.5" fill="#5d686f" />
  </Svg>
);

const PlayIcon = ({ sz }: { sz: number }) => (
  <Svg width={sz} height={sz} viewBox="0 0 24 24">
    <Path d="M6 4l13 8-13 8V4z" fill="#5d686f" />
  </Svg>
);

const EndCallIcon = ({ sz }: { sz: number }) => (
  <Svg width={sz} height={sz} viewBox="0 0 24 24">
    <Path
      d="M23 1L1 23"
      stroke="white" strokeWidth="2" strokeLinecap="round"
    />
    <Path
      d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55 2 2 0 0 1 19.8 14.8l-.9 3.2a2 2 0 0 1-2.1 1.4A18 18 0 0 1 2.4 4.6 2 2 0 0 1 3.8 2.5l3.2-.9A2 2 0 0 1 9.2 2.4a11 11 0 0 1 1.49 2.28"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  </Svg>
);

const MicOnIcon = ({ sz }: { sz: number }) => (
  <Svg width={sz} height={sz} viewBox="0 0 24 24">
    <Rect x="9" y="2" width="6" height="11" rx="3" stroke="#5d686f" strokeWidth="2" fill="none" />
    <Path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6"
          stroke="#5d686f" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MicOffIcon = ({ sz }: { sz: number }) => (
  <Svg width={sz} height={sz} viewBox="0 0 24 24">
    <Path d="M1 1l22 22" stroke="#DD3636" strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6M17 16.95A7 7 0 0 1 5 10v-1m14 0v1a7 7 0 0 1-.11 1.23M12 19v3M9 22h6"
          stroke="#DD3636" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const CTRL_SZ = 54 * SC;
const END_SZ  = 68 * SC;

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [elapsed, setElapsed] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const [micOn,   setMicOn]   = useState(true);

  const floatY   = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gentle float animation on Mieo
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0,   duration: 1400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Session timer
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const handleEndCall = () => {
    Speech.stop().catch(() => {});
    if (timerRef.current) clearInterval(timerRef.current);
    router.navigate('/(tabs)/');
  };

  const CONTROLS_H = 90 + insets.bottom;
  const CHAR_W     = 170 * SC;
  const CHAR_H     = CHAR_W * 1.045;

  return (
    // position absolute + fixed height to break out of the 90px scene padding from _layout
    <View style={s.root}>
      <NatureScene />

      {/* Timer pill */}
      <View style={[s.timerRow, { top: insets.top + 18 }]}>
        <View style={s.timerPill}>
          <ClockIcon />
          <Text style={s.timerText}>{formatTime(elapsed)}</Text>
        </View>
      </View>

      {/* Mieo */}
      <View style={[s.charWrap, { bottom: CONTROLS_H + 28 * SC }]}>
        <Animated.View style={{ transform: [{ translateY: floatY }] }}>
          <MieoCharacter width={CHAR_W} height={CHAR_H} />
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={[s.controls, { height: CONTROLS_H, paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => setPaused(p => !p)} activeOpacity={0.8}>
          {paused
            ? <PlayIcon  sz={22 * SC} />
            : <PauseIcon sz={22 * SC} />}
        </TouchableOpacity>

        <TouchableOpacity style={[s.ctrlBtn, s.endBtn]} onPress={handleEndCall} activeOpacity={0.85}>
          <EndCallIcon sz={26 * SC} />
        </TouchableOpacity>

        <TouchableOpacity style={s.ctrlBtn} onPress={() => setMicOn(m => !m)} activeOpacity={0.8}>
          {micOn
            ? <MicOnIcon  sz={22 * SC} />
            : <MicOffIcon sz={22 * SC} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: SH,
    backgroundColor: '#6BBDE0',
  },

  timerRow: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  timerText: {
    fontFamily: FONTS.heading,
    fontSize: 15 * SC,
    color: '#171a1c',
    letterSpacing: 1.2,
  },

  charWrap: {
    position: 'absolute',
    alignSelf: 'center',
  },

  controls: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30 * SC,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  ctrlBtn: {
    width: CTRL_SZ,
    height: CTRL_SZ,
    borderRadius: CTRL_SZ / 2,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  endBtn: {
    width: END_SZ,
    height: END_SZ,
    borderRadius: END_SZ / 2,
    backgroundColor: '#E53935',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
});
