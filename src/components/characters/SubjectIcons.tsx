/**
 * SVG subject icons for the dashboard.
 * Each draws a distinct, kid-friendly illustration for that subject.
 */
import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, G } from 'react-native-svg';

// ─── English — open book with a speech bubble ────────────────────────────────
export function EnglishIcon({ size = 56, color = '#0ea5e9' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Left page */}
      <Path d="M6 12 Q6 8 10 8 L26 8 L26 44 Q18 42 10 44 Q6 44 6 40 Z" fill={color} opacity={0.9} />
      {/* Right page */}
      <Path d="M50 12 Q50 8 46 8 L30 8 L30 44 Q38 42 46 44 Q50 44 50 40 Z" fill={color} opacity={0.7} />
      {/* Spine */}
      <Rect x="25" y="8" width="6" height="36" rx="1" fill={color} />
      {/* Lines on left page */}
      <Line x1="10" y1="18" x2="22" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
      <Line x1="10" y1="23" x2="22" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
      <Line x1="10" y1="28" x2="20" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
      {/* Speech bubble top-right */}
      <Path d="M36 4 Q36 1 39 1 L52 1 Q55 1 55 4 L55 11 Q55 14 52 14 L42 14 L39 18 L40 14 Q36 14 36 11 Z"
        fill="white" opacity={0.9} />
      <Line x1="40" y1="6.5" x2="50" y2="6.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="40" y1="10" x2="47" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Mathematics — calculator with coloured buttons ───────────────────────────
export function MathIcon({ size = 56, color = '#14b8a6' }: { size?: number; color?: string }) {
  const btn = (x: number, y: number, accent?: boolean) => (
    <Rect key={`${x}${y}`} x={x} y={y} width="9" height="7" rx="2"
      fill={accent ? color : 'rgba(255,255,255,0.18)'} />
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Body */}
      <Rect x="8" y="4" width="40" height="48" rx="6" fill={color} opacity={0.85} />
      {/* Screen */}
      <Rect x="12" y="8" width="32" height="14" rx="3" fill="rgba(0,0,0,0.35)" />
      {/* Screen number */}
      <Line x1="28" y1="11" x2="40" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <Line x1="33" y1="15" x2="40" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Button rows */}
      {btn(12, 26)}{btn(23, 26)}{btn(34, 26, true)}
      {btn(12, 35)}{btn(23, 35)}{btn(34, 35)}
      {btn(12, 44)}{btn(23, 44, true)}{btn(34, 44)}
      {/* Plus sign on accent button */}
      <Line x1="38" y1="28.5" x2="38" y2="31.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="36.5" y1="30" x2="39.5" y2="30" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Science — flask with bubbles ────────────────────────────────────────────
export function ScienceIcon({ size = 56, color = '#f97316' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Flask body */}
      <Path
        d="M20 4 L20 22 L8 40 Q5 46 10 50 Q14 53 28 53 Q42 53 46 50 Q51 46 48 40 L36 22 L36 4 Z"
        fill={color} opacity={0.85}
      />
      {/* Neck */}
      <Rect x="20" y="4" width="16" height="5" rx="2" fill={color} />
      {/* Liquid fill */}
      <Path
        d="M12 42 Q14 36 28 36 Q42 36 44 42 Q44 52 28 52 Q12 52 12 42 Z"
        fill="rgba(255,255,255,0.3)"
      />
      {/* Flask rim */}
      <Rect x="18" y="3" width="20" height="4" rx="2" fill={color} opacity={0.6} />
      {/* Bubbles */}
      <Circle cx="20" cy="44" r="3" fill="white" opacity={0.55} />
      <Circle cx="30" cy="40" r="4" fill="white" opacity={0.4} />
      <Circle cx="38" cy="45" r="2.5" fill="white" opacity={0.6} />
      <Circle cx="25" cy="48" r="2" fill="white" opacity={0.5} />
      {/* Shine */}
      <Path d="M14 28 Q15 24 18 24 L22 24" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"
        strokeLinecap="round" fill="none" />
    </Svg>
  );
}

// ─── Social Studies — globe with face-like continents ─────────────────────────
export function SocialIcon({ size = 56, color = '#a855f7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Globe circle */}
      <Circle cx="28" cy="28" r="24" fill={color} opacity={0.85} />
      {/* Continent shapes */}
      <Ellipse cx="20" cy="22" rx="8" ry="6" fill="rgba(255,255,255,0.3)" />
      <Ellipse cx="34" cy="30" rx="9" ry="7" fill="rgba(255,255,255,0.25)" />
      <Ellipse cx="18" cy="36" rx="5" ry="4" fill="rgba(255,255,255,0.22)" />
      {/* Latitude lines */}
      <Ellipse cx="28" cy="28" rx="23" ry="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" fill="none" />
      <Ellipse cx="28" cy="28" rx="15" ry="22" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" fill="none" />
      {/* Vertical axis line */}
      <Line x1="28" y1="4" x2="28" y2="52" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
      {/* Shine */}
      <Circle cx="19" cy="17" r="5" fill="rgba(255,255,255,0.18)" />
    </Svg>
  );
}
