import React from 'react';
import Svg, {
  Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText, G,
} from 'react-native-svg';

const W = 148;
const H = 230;
// All backgrounds use width/height "100%" + preserveAspectRatio so they fill any container.
const OP = 0.18; // base opacity for all bg elements

// ─── English — books, pencil, letters ────────────────────────────────────────
export function EnglishBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      {/* Big open book bottom-right */}
      <G opacity={OP}>
        <Path d="M60 170 Q62 155 78 153 L115 153 L115 200 Q100 197 86 200 Q68 200 68 188 Z" fill="white" />
        <Path d="M88 170 Q86 155 70 153 L33 153 L33 200 Q48 197 62 200 Q80 200 80 188 Z" fill="white" opacity={0.8} />
        <Line x1="74" y1="160" x2="74" y2="196" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <Line x1="82" y1="163" x2="110" y2="163" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <Line x1="82" y1="168" x2="110" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <Line x1="38" y1="163" x2="66" y2="163" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <Line x1="38" y1="168" x2="66" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </G>
      {/* Pencil top-left */}
      <G opacity={OP} rotation="-35" origin="28,55">
        <Rect x="20" y="20" width="16" height="55" rx="3" fill="white" />
        <Polygon points="20,75 36,75 28,92" fill="white" opacity={0.9} />
        <Rect x="20" y="20" width="16" height="8" rx="3" fill="white" opacity={0.6} />
      </G>
      {/* Letter A — top right */}
      <SvgText x="98" y="48" fontSize="44" fontWeight="bold" fill="white" opacity={OP * 1.1} textAnchor="middle">A</SvgText>
      {/* Letter B — mid left */}
      <SvgText x="18" y="118" fontSize="36" fontWeight="bold" fill="white" opacity={OP * 0.9} textAnchor="middle">B</SvgText>
      {/* Letter C — small, mid right */}
      <SvgText x="132" y="130" fontSize="28" fontWeight="bold" fill="white" opacity={OP * 0.8} textAnchor="middle">C</SvgText>
      {/* Speech bubble top-left */}
      <G opacity={OP * 0.85}>
        <Path d="M8 10 Q8 4 14 4 L42 4 Q48 4 48 10 L48 22 Q48 28 42 28 L22 28 L16 34 L17 28 Q8 28 8 22 Z" fill="white" />
      </G>
    </Svg>
  );
}

// ─── Math — numbers, shapes, operators ───────────────────────────────────────
export function MathBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      {/* Big + sign centre */}
      <G opacity={OP}>
        <Rect x="64" y="88" width="20" height="54" rx="4" fill="white" />
        <Rect x="37" y="108" width="74" height="14" rx="4" fill="white" />
      </G>
      {/* Number 7 — top right */}
      <SvgText x="122" y="52" fontSize="52" fontWeight="bold" fill="white" opacity={OP} textAnchor="middle">7</SvgText>
      {/* Number 3 — top left */}
      <SvgText x="22" y="44" fontSize="40" fontWeight="bold" fill="white" opacity={OP * 0.9} textAnchor="middle">3</SvgText>
      {/* = sign bottom left */}
      <G opacity={OP * 0.9}>
        <Rect x="10" y="178" width="36" height="6" rx="3" fill="white" />
        <Rect x="10" y="190" width="36" height="6" rx="3" fill="white" />
      </G>
      {/* Circle bottom right */}
      <Circle cx="122" cy="185" r="22" fill="none" stroke="white" strokeWidth="5" opacity={OP} />
      {/* Triangle mid left */}
      <Polygon points="12,130 38,80 64,130" fill="none" stroke="white" strokeWidth="4" opacity={OP * 0.85} />
      {/* Number 5 mid right */}
      <SvgText x="132" y="148" fontSize="32" fontWeight="bold" fill="white" opacity={OP * 0.75} textAnchor="middle">5</SvgText>
    </Svg>
  );
}

// ─── Science — flask, atom, bubbles ──────────────────────────────────────────
export function ScienceBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      {/* Flask — bottom centre */}
      <G opacity={OP}>
        <Path d="M52 140 L52 170 L30 198 Q26 206 34 210 Q48 215 74 215 Q100 215 114 210 Q122 206 118 198 L96 170 L96 140 Z" fill="white" />
        <Rect x="52" y="135" width="44" height="8" rx="3" fill="white" opacity={0.9} />
        {/* Liquid */}
        <Path d="M34 200 Q48 192 74 192 Q100 192 114 200 Q110 212 74 212 Q38 212 34 200 Z" fill="white" opacity={0.35} />
        {/* Bubbles in liquid */}
        <Circle cx="55" cy="204" r="4" fill="white" opacity={0.5} />
        <Circle cx="74" cy="200" r="5" fill="white" opacity={0.4} />
        <Circle cx="92" cy="205" r="3" fill="white" opacity={0.5} />
      </G>
      {/* Atom — top right */}
      <G opacity={OP} rotation="30" origin="112,50">
        <Circle cx="112" cy="50" r="6" fill="white" />
        <Ellipse cx="112" cy="50" rx="30" ry="12" fill="none" stroke="white" strokeWidth="3" />
        <Ellipse cx="112" cy="50" rx="30" ry="12" fill="none" stroke="white" strokeWidth="3" rotation="60" origin="112,50" />
        <Ellipse cx="112" cy="50" rx="30" ry="12" fill="none" stroke="white" strokeWidth="3" rotation="120" origin="112,50" />
      </G>
      {/* Rising bubbles left */}
      <Circle cx="18" cy="160" r="7" fill="none" stroke="white" strokeWidth="2.5" opacity={OP} />
      <Circle cx="28" cy="130" r="5" fill="none" stroke="white" strokeWidth="2.5" opacity={OP * 0.85} />
      <Circle cx="14" cy="105" r="9" fill="none" stroke="white" strokeWidth="2.5" opacity={OP * 0.7} />
      {/* Star sparkle top left */}
      <G opacity={OP * 0.9}>
        <Line x1="20" y1="30" x2="20" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="10" y1="40" x2="30" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="13" y1="33" x2="27" y2="47" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <Line x1="27" y1="33" x2="13" y2="47" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

// ─── Social — people, house, globe, heart ─────────────────────────────────────
export function SocialBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      {/* Two people — bottom */}
      <G opacity={OP}>
        {/* Person 1 */}
        <Circle cx="46" cy="162" r="12" fill="white" />
        <Path d="M28 215 Q28 185 46 185 Q64 185 64 215" fill="white" />
        {/* Person 2 */}
        <Circle cx="96" cy="158" r="14" fill="white" opacity={0.9} />
        <Path d="M76 215 Q76 183 96 183 Q116 183 116 215" fill="white" opacity={0.9} />
      </G>
      {/* House — top left */}
      <G opacity={OP * 0.9}>
        <Polygon points="12,72 46,38 80,72" fill="white" />
        <Rect x="18" y="72" width="56" height="42" rx="2" fill="white" opacity={0.9} />
        <Rect x="35" y="88" width="22" height="26" rx="2" fill="white" opacity={0.45} />
      </G>
      {/* Globe — top right */}
      <G opacity={OP}>
        <Circle cx="116" cy="52" r="26" fill="none" stroke="white" strokeWidth="4" />
        <Ellipse cx="116" cy="52" rx="25" ry="10" fill="none" stroke="white" strokeWidth="2" />
        <Line x1="116" y1="26" x2="116" y2="78" stroke="white" strokeWidth="2" />
        <Ellipse cx="116" cy="52" rx="14" ry="25" fill="none" stroke="white" strokeWidth="2" />
      </G>
      {/* Heart — mid right */}
      <G opacity={OP * 0.85}>
        <Path d="M128 115 Q128 107 136 107 Q144 107 144 115 Q144 123 128 133 Q112 123 112 115 Q112 107 120 107 Q128 107 128 115 Z" fill="white" />
      </G>
    </Svg>
  );
}

export const SUBJECT_BG: Record<string, React.ComponentType> = {
  english: EnglishBg,
  math:    MathBg,
  science: ScienceBg,
  social:  SocialBg,
};
