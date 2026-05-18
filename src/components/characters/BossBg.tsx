import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText, G } from 'react-native-svg';

const W = 360;
const H = 220;
const OP = 0.1;

// ─── Numbor — Math symbols ────────────────────────────────────────────────────
export function NumborrBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      <G opacity={OP}>
        {/* Large + */}
        <Rect x="280" y="30"  width="14" height="60" rx="4" fill="white" />
        <Rect x="256" y="53"  width="62" height="14" rx="4" fill="white" />
        {/* × */}
        <Line x1="20"  y1="30"  x2="55"  y2="65"  stroke="white" strokeWidth="8" strokeLinecap="round" />
        <Line x1="55"  y1="30"  x2="20"  y2="65"  stroke="white" strokeWidth="8" strokeLinecap="round" />
        {/* = */}
        <Rect x="18"  y="130" width="44" height="8"  rx="4" fill="white" />
        <Rect x="18"  y="146" width="44" height="8"  rx="4" fill="white" />
        {/* Numbers */}
        <SvgText x="160" y="55"  fontSize="52" fontWeight="bold" fill="white" textAnchor="middle">7</SvgText>
        <SvgText x="90"  y="155" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle">3</SvgText>
        <SvgText x="290" y="185" fontSize="36" fontWeight="bold" fill="white" textAnchor="middle">9</SvgText>
        {/* Circle shape */}
        <Circle cx="50"  cy="190" r="28" fill="none" stroke="white" strokeWidth="5" />
        {/* Triangle */}
        <Polygon points="310,100 340,150 280,150" fill="none" stroke="white" strokeWidth="4" />
      </G>
    </Svg>
  );
}

// ─── Lexi — Words, letters, sparkles ─────────────────────────────────────────
export function LexiBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      <G opacity={OP}>
        {/* Big A */}
        <SvgText x="60"  y="90"  fontSize="80" fontWeight="bold" fill="white" textAnchor="middle">A</SvgText>
        {/* Z */}
        <SvgText x="295" y="75"  fontSize="55" fontWeight="bold" fill="white" textAnchor="middle">Z</SvgText>
        {/* e */}
        <SvgText x="185" y="185" fontSize="44" fontWeight="bold" fill="white" textAnchor="middle">e</SvgText>
        {/* Speech bubble */}
        <Path d="M 200 25 Q 200 10 215 10 L 300 10 Q 315 10 315 25 L 315 55 Q 315 70 300 70 L 225 70 L 215 84 L 217 70 Q 200 70 200 55 Z" fill="white" opacity={0.9} />
        <Line x1="218" y1="28" x2="298" y2="28" stroke="rgba(0,0,0,0.25)" strokeWidth="3" strokeLinecap="round" />
        <Line x1="218" y1="40" x2="275" y2="40" stroke="rgba(0,0,0,0.25)" strokeWidth="3" strokeLinecap="round" />
        <Line x1="218" y1="52" x2="285" y2="52" stroke="rgba(0,0,0,0.25)" strokeWidth="3" strokeLinecap="round" />
        {/* Star sparkles */}
        <Line x1="140" y1="100" x2="140" y2="120" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="130" y1="110" x2="150" y2="110" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="30"  y1="155" x2="30"  y2="175" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <Line x1="20"  y1="165" x2="40"  y2="165" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* Book outline */}
        <Path d="M 270 130 Q 272 118 285 116 L 340 116 L 340 190 Q 330 187 318 190 Q 302 190 302 180 Z" fill="white" opacity={0.8} />
        <Path d="M 270 130 Q 268 118 255 116 L 200 116 L 200 190 Q 210 187 222 190 Q 238 190 238 180 Z" fill="white" opacity={0.65} />
        <Line x1="270" y1="124" x2="270" y2="188" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
      </G>
    </Svg>
  );
}

// ─── Scorp — Science: flasks, atoms, formulas ─────────────────────────────────
export function ScorpBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      <G opacity={OP}>
        {/* Large flask */}
        <Path d="M 270 20 L 270 80 L 240 130 Q 232 148 244 158 Q 258 166 290 166 Q 322 166 336 158 Q 348 148 340 130 L 310 80 L 310 20 Z" fill="white" />
        <Rect x="270" y="15" width="40" height="8" rx="3" fill="white" />
        <Path d="M 244 148 Q 258 140 290 140 Q 322 140 336 148 Q 334 162 290 162 Q 246 162 244 148 Z" fill="white" opacity={0.4} />
        <Circle cx="260" cy="152" r="5"  fill="white" opacity={0.55} />
        <Circle cx="290" cy="148" r="7"  fill="white" opacity={0.45} />
        <Circle cx="318" cy="153" r="4"  fill="white" opacity={0.6} />
        {/* Atom top-left */}
        <Circle cx="60"  cy="60"  r="8"  fill="white" />
        <Ellipse cx="60" cy="60" rx="38" ry="14" fill="none" stroke="white" strokeWidth="3.5" />
        <Ellipse cx="60" cy="60" rx="38" ry="14" fill="none" stroke="white" strokeWidth="3.5" rotation="60" origin="60,60" />
        <Ellipse cx="60" cy="60" rx="38" ry="14" fill="none" stroke="white" strokeWidth="3.5" rotation="120" origin="60,60" />
        {/* Formula text */}
        <SvgText x="105" y="150" fontSize="28" fill="white" fontWeight="bold" textAnchor="middle">H₂O</SvgText>
        {/* Bubbles */}
        <Circle cx="160" cy="50"  r="10" fill="none" stroke="white" strokeWidth="3" />
        <Circle cx="182" cy="28"  r="7"  fill="none" stroke="white" strokeWidth="3" />
        <Circle cx="145" cy="22"  r="5"  fill="none" stroke="white" strokeWidth="2.5" />
        {/* Stars */}
        <Line x1="200" y1="170" x2="200" y2="196" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <Line x1="187" y1="183" x2="213" y2="183" stroke="white" strokeWidth="4" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

// ─── Rex — History: scales, crown, scroll ─────────────────────────────────────
export function RexBg() {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
      <G opacity={OP}>
        {/* Crown top-left */}
        <Path d="M 20 80 L 20 40 L 38 60 L 55 22 L 72 60 L 90 40 L 90 80 Z" fill="white" />
        <Rect x="16" y="78" width="78" height="12" rx="4" fill="white" opacity={0.9} />
        <Circle cx="55" cy="32" r="5" fill="white" opacity={0.6} />
        <Circle cx="20" cy="50" r="4" fill="white" opacity={0.5} />
        <Circle cx="90" cy="50" r="4" fill="white" opacity={0.5} />
        {/* Dragon scale pattern — repeating arcs */}
        <G opacity={0.85}>
          {[0,1,2,3].map(row => [0,1,2,3,4].map(col => (
            <Path
              key={`${row}-${col}`}
              d={`M ${160 + col * 36 + (row % 2 === 0 ? 18 : 0)} ${80 + row * 28} Q ${160 + col * 36 + (row % 2 === 0 ? 18 : 0) + 18} ${80 + row * 28} ${160 + col * 36 + (row % 2 === 0 ? 18 : 0) + 18} ${80 + row * 28 + 18}`}
              fill="none" stroke="white" strokeWidth="2" opacity={0.7}
            />
          )))}
        </G>
        {/* Scroll */}
        <Rect x="28"  y="130" width="80" height="56" rx="4"  fill="white" opacity={0.9} />
        <Ellipse cx="28"  cy="158" rx="8"  ry="28" fill="white" />
        <Ellipse cx="108" cy="158" rx="8"  ry="28" fill="white" />
        <Line x1="40" y1="148" x2="96" y2="148" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="40" y1="160" x2="96" y2="160" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="40" y1="172" x2="80" y2="172" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Wings outline top-right */}
        <Path d="M 290 20 Q 260 40 255 70 Q 265 65 290 75 Z" fill="white" opacity={0.85} />
        <Path d="M 290 20 Q 320 40 325 70 Q 315 65 290 75 Z" fill="white" opacity={0.85} />
      </G>
    </Svg>
  );
}

export const BOSS_BG: Record<string, React.ComponentType> = {
  numbor: NumborrBg,
  lexi:   LexiBg,
  scorp:  ScorpBg,
  rex:    RexBg,
};
