/**
 * Carousel + arena backgrounds — decorative SVG scenes used behind the home
 * carousel cards and the Battle Arena hero banner.
 */
import React from 'react';
import Svg, {
  Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText, G,
} from 'react-native-svg';

// viewBox matches carousel card: ~360 wide × 175 tall
const W = 360;
const H = 175;
const OP = 0.13;

// ─── Spelling Bee — honeycombs, letters, stars ────────────────────────────────
export function BeeBg() {
  // flat-top hex helper: "cx+r cy  cx+r/2 cy+h  cx-r/2 cy+h  cx-r cy  cx-r/2 cy-h  cx+r/2 cy-h"
  function hex(cx: number, cy: number, r: number) {
    const h = r * 0.866;
    return `${cx + r},${cy} ${cx + r / 2},${cy + h} ${cx - r / 2},${cy + h} ${cx - r},${cy} ${cx - r / 2},${cy - h} ${cx + r / 2},${cy - h}`;
  }
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }} preserveAspectRatio="xMidYMid slice">
      {/* Honeycomb cluster — top-right */}
      <G opacity={OP}>
        <Polygon points={hex(300, 28, 22)} fill="none" stroke="white" strokeWidth="3" />
        <Polygon points={hex(338, 28, 22)} fill="none" stroke="white" strokeWidth="3" />
        <Polygon points={hex(319, 62, 22)} fill="none" stroke="white" strokeWidth="3" />
        <Polygon points={hex(357, 62, 22)} fill="none" stroke="white" strokeWidth="3" />
        <Polygon points={hex(338, 96, 22)} fill="none" stroke="white" strokeWidth="3" />
      </G>
      {/* Honeycomb cluster — bottom-left */}
      <G opacity={OP * 0.7}>
        <Polygon points={hex(18, 130, 16)} fill="none" stroke="white" strokeWidth="2.5" />
        <Polygon points={hex(46, 130, 16)} fill="none" stroke="white" strokeWidth="2.5" />
        <Polygon points={hex(32, 158, 16)} fill="none" stroke="white" strokeWidth="2.5" />
      </G>
      {/* Letters */}
      <SvgText x="80"  y="52"  fontSize="38" fontWeight="bold" fill="white" opacity={OP * 1.2} textAnchor="middle">B</SvgText>
      <SvgText x="22"  y="90"  fontSize="28" fontWeight="bold" fill="white" opacity={OP}        textAnchor="middle">E</SvgText>
      <SvgText x="130" y="155" fontSize="24" fontWeight="bold" fill="white" opacity={OP * 0.9}  textAnchor="middle">E</SvgText>
      {/* Stars */}
      <G opacity={OP * 1.1}>
        <Circle cx="170" cy="22"  r="4" fill="white" />
        <Circle cx="200" cy="155" r="3" fill="white" />
        <Circle cx="100" cy="140" r="5" fill="white" />
        <Circle cx="250" cy="140" r="3" fill="white" />
      </G>
      {/* Mic silhouette — mid left */}
      <G opacity={OP * 0.9}>
        <Rect x="55" y="100" width="14" height="26" rx="7" fill="white" />
        <Path d="M 46 118 Q 46 135 62 135 Q 78 135 78 118" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="62" y1="135" x2="62" y2="148" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="54" y1="148" x2="70" y2="148" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

// ─── Battle Arena — lightning bolts, shields, stars ───────────────────────────
export function ArenaBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }} preserveAspectRatio="xMidYMid slice">
      {/* Big lightning bolt — centre-left */}
      <G opacity={OP * 1.1}>
        <Path d="M 95 10 L 72 72 L 90 72 L 68 140 L 112 65 L 92 65 L 115 10 Z" fill="white" />
      </G>
      {/* Small lightning — right */}
      <G opacity={OP * 0.85}>
        <Path d="M 270 30 L 258 60 L 266 60 L 254 92 L 274 62 L 265 62 L 278 30 Z" fill="white" />
      </G>
      {/* Shield — top left */}
      <G opacity={OP}>
        <Path d="M 30 12 L 60 12 L 60 42 Q 60 62 45 72 Q 30 62 30 42 Z" fill="white" />
        <Path d="M 36 22 L 54 22 L 54 40 Q 54 54 45 60 Q 36 54 36 40 Z" fill="white" opacity={0.4} />
      </G>
      {/* Shield small — bottom right */}
      <G opacity={OP * 0.8}>
        <Path d="M 310 110 L 334 110 L 334 132 Q 334 148 322 156 Q 310 148 310 132 Z" fill="white" />
      </G>
      {/* Crossed swords — bottom left */}
      <G opacity={OP * 0.9}>
        <Line x1="14"  y1="140" x2="70"  y2="170" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <Line x1="70"  y1="140" x2="14"  y2="170" stroke="white" strokeWidth="5" strokeLinecap="round" />
        {/* Guards */}
        <Line x1="28"  y1="148" x2="40"  y2="145" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="56"  y1="163" x2="68"  y2="160" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </G>
      {/* Stars scattered */}
      <G opacity={OP * 1.2}>
        <Circle cx="155" cy="18"  r="5"   fill="white" />
        <Circle cx="200" cy="155" r="4"   fill="white" />
        <Circle cx="140" cy="145" r="3.5" fill="white" />
        <Circle cx="240" cy="20"  r="3"   fill="white" />
      </G>
    </Svg>
  );
}

// ─── Skills Tree — stars, branches, books, trophy ────────────────────────────
export function SkillsBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }} preserveAspectRatio="xMidYMid slice">
      {/* Tree branches — left */}
      <G opacity={OP * 1.1}>
        <Line x1="50"  y1="175" x2="50"  y2="80"  stroke="white" strokeWidth="5" strokeLinecap="round" />
        <Line x1="50"  y1="120" x2="20"  y2="90"  stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <Line x1="50"  y1="105" x2="78"  y2="75"  stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <Line x1="50"  y1="88"  x2="28"  y2="64"  stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="50"  y1="88"  x2="70"  y2="58"  stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <Circle cx="20"  cy="88"  r="8"  fill="white" />
        <Circle cx="78"  cy="73"  r="7"  fill="white" />
        <Circle cx="28"  cy="62"  r="6"  fill="white" />
        <Circle cx="70"  cy="56"  r="9"  fill="white" />
        <Circle cx="50"  cy="78"  r="5"  fill="white" />
      </G>
      {/* Trophy — top right */}
      <G opacity={OP}>
        <Path d="M 298 16 L 340 16 L 340 50 Q 340 72 319 78 Q 298 72 298 50 Z" fill="white" />
        <Rect x="311" y="78" width="16" height="14" rx="2" fill="white" />
        <Rect x="302" y="92" width="34" height="6"  rx="3" fill="white" />
        {/* Handles */}
        <Path d="M 298 28 Q 284 28 284 40 Q 284 52 298 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 340 28 Q 354 28 354 40 Q 354 52 340 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
      </G>
      {/* Open book — bottom centre */}
      <G opacity={OP * 0.9}>
        <Path d="M 130 148 Q 132 136 148 134 L 188 134 L 188 168 Q 172 165 158 168 Q 138 168 138 158 Z" fill="white" />
        <Path d="M 208 148 Q 206 136 190 134 L 150 134 L 150 168 Q 166 165 180 168 Q 200 168 200 158 Z" fill="white" opacity={0.85} />
        <Line x1="169" y1="140" x2="169" y2="165" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </G>
      {/* Stars */}
      <G opacity={OP * 1.3}>
        <Circle cx="110" cy="22"  r="5.5" fill="white" />
        <Circle cx="240" cy="152" r="4"   fill="white" />
        <Circle cx="260" cy="28"  r="3.5" fill="white" />
        <Circle cx="170" cy="110" r="3"   fill="white" />
      </G>
      {/* Sparkle — mid right */}
      <G opacity={OP}>
        <Line x1="290" y1="95" x2="290" y2="117" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <Line x1="279" y1="106" x2="301" y2="106" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <Line x1="283" y1="99" x2="297" y2="113" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="297" y1="99" x2="283" y2="113" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

export const CAROUSEL_BG: Record<string, React.ComponentType> = {
  bee:    BeeBg,
  arena:  ArenaBg,
  skills: SkillsBg,
};
