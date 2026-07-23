/**
 * Proper SVG flag icons for each supported language.
 * Nigerian flag (green-white-green) with a distinct cultural symbol
 * for each of the three Nigerian languages, plus a Union Jack for English.
 */
import React from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';

const W = 80;
const H = 54;
const RX = 8; // rounded corners

// ─── Nigerian flag base ───────────────────────────────────────────────────────
// Three equal vertical bands: green | white | green
function NigerianFlagBase({ id }: { id: string }) {
  const band = W / 3;
  return (
    <>
      <Defs>
        <ClipPath id={id}>
          <Rect x="0" y="0" width={W} height={H} rx={RX} />
        </ClipPath>
      </Defs>
      {/* Green left */}
      <Rect x="0" y="0" width={band} height={H} fill="#008751" clipPath={`url(#${id})`} />
      {/* White center */}
      <Rect x={band} y="0" width={band} height={H} fill="#FFFFFF" clipPath={`url(#${id})`} />
      {/* Green right */}
      <Rect x={band * 2} y="0" width={band} height={H} fill="#008751" clipPath={`url(#${id})`} />
      {/* Border */}
      <Rect x="0" y="0" width={W} height={H} rx={RX} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    </>
  );
}

// ─── Hausa — Nigerian flag + crescent & star (symbol of northern Nigeria) ────
export function HausaFlag({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
      <NigerianFlagBase id="ng-ha" />
      {/* Crescent */}
      <Path
        d={`M ${W / 2 - 2} ${H * 0.22}
            A 11 11 0 1 1 ${W / 2 - 2} ${H * 0.78}
            A 8 8 0 1 0 ${W / 2 - 2} ${H * 0.22} Z`}
        fill="#008751"
      />
      {/* Star */}
      <Polygon
        points={`${W / 2 + 8},${H * 0.3} ${W / 2 + 9.5},${H * 0.35} ${W / 2 + 11},${H * 0.3} ${W / 2 + 10},${H * 0.37} ${W / 2 + 11},${H * 0.43} ${W / 2 + 8},${H * 0.38} ${W / 2 + 5},${H * 0.43} ${W / 2 + 6},${H * 0.37} ${W / 2 + 5},${H * 0.3} ${W / 2 + 6.5},${H * 0.35}`}
        fill="#008751"
      />
    </Svg>
  );
}

// ─── Yoruba — Nigerian flag + Yoruba Ade (beaded crown) ──────────────────────
export function YorubaFlag({ size = 80 }: { size?: number }) {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <Svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
      <NigerianFlagBase id="ng-yo" />
      {/* Crown base */}
      <Rect x={cx - 9} y={cy + 2} width={18} height={5} rx="2" fill="#008751" />
      {/* Crown body */}
      <Path
        d={`M ${cx - 9} ${cy + 2} L ${cx - 9} ${cy - 8} L ${cx - 5} ${cy - 13} L ${cx} ${cy - 8} L ${cx + 5} ${cy - 13} L ${cx + 9} ${cy - 8} L ${cx + 9} ${cy + 2} Z`}
        fill="#008751"
      />
      {/* Crown dots (beads) */}
      {[cx - 6, cx, cx + 6].map((x, i) => (
        <Circle key={i} cx={x} cy={cy - 3} r="2" fill="white" />
      ))}
    </Svg>
  );
}

// ─── Igbo — Nigerian flag + Igbo Uli sun (concentric half-circle art) ────────
export function IgboFlag({ size = 80 }: { size?: number }) {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <Svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
      <NigerianFlagBase id="ng-ig" />
      {/* Outer circle */}
      <Circle cx={cx} cy={cy} r="12" fill="none" stroke="#008751" strokeWidth="2.5" />
      {/* Inner circle */}
      <Circle cx={cx} cy={cy} r="7" fill="none" stroke="#008751" strokeWidth="2" />
      {/* Center dot */}
      <Circle cx={cx} cy={cy} r="3" fill="#008751" />
      {/* Four direction lines (Uli-inspired cross) */}
      <Line x1={cx} y1={cy - 7} x2={cx} y2={cy - 12} stroke="#008751" strokeWidth="2" strokeLinecap="round" />
      <Line x1={cx} y1={cy + 7} x2={cx} y2={cy + 12} stroke="#008751" strokeWidth="2" strokeLinecap="round" />
      <Line x1={cx - 7} y1={cy} x2={cx - 12} y2={cy} stroke="#008751" strokeWidth="2" strokeLinecap="round" />
      <Line x1={cx + 7} y1={cy} x2={cx + 12} y2={cy} stroke="#008751" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ─── English — Union Jack ─────────────────────────────────────────────────────
export function EnglishFlag({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <ClipPath id="ukClip">
          <Rect x="0" y="0" width={W} height={H} rx={RX} />
        </ClipPath>
      </Defs>
      {/* Navy background */}
      <Rect x="0" y="0" width={W} height={H} fill="#012169" rx={RX} />
      {/* White St Andrew diagonals (wide) */}
      <G clipPath="url(#ukClip)">
        <Line x1="0" y1="0" x2={W} y2={H} stroke="white" strokeWidth="14" />
        <Line x1={W} y1="0" x2="0" y2={H} stroke="white" strokeWidth="14" />
        {/* Red St Patrick diagonals (offset, narrow) */}
        <Line x1="0" y1="0" x2={W} y2={H} stroke="#C8102E" strokeWidth="5"
          strokeDasharray={`${W / 2 - 4} 8 ${W / 2 - 4}`} />
        <Line x1={W} y1="0" x2="0" y2={H} stroke="#C8102E" strokeWidth="5"
          strokeDasharray={`${W / 2 - 4} 8 ${W / 2 - 4}`} />
        {/* White St George cross (vertical + horizontal) */}
        <Rect x={W / 2 - 8} y="0" width="16" height={H} fill="white" />
        <Rect x="0" y={H / 2 - 6} width={W} height="12" fill="white" />
        {/* Red St George cross (thinner, on top) */}
        <Rect x={W / 2 - 5} y="0" width="10" height={H} fill="#C8102E" />
        <Rect x="0" y={H / 2 - 4} width={W} height="8" fill="#C8102E" />
      </G>
      {/* Border */}
      <Rect x="0" y="0" width={W} height={H} rx={RX} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </Svg>
  );
}
