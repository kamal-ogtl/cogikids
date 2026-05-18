import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon } from 'react-native-svg';

const BG_COLORS = ['#7c3aed', '#f97316', '#0ea5e9', '#EF9F27', '#14b8a6'];

function Owl({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Circle cx="30" cy="34" r="19" fill="rgba(255,255,255,0.92)" />
      <Polygon points="18,22 23,12 28,22" fill="rgba(255,255,255,0.92)" />
      <Polygon points="32,22 37,12 42,22" fill="rgba(255,255,255,0.92)" />
      <Circle cx="23" cy="32" r="7" fill="white" />
      <Circle cx="37" cy="32" r="7" fill="white" />
      <Circle cx="23" cy="32" r="4.5" fill="#1a1b1e" />
      <Circle cx="37" cy="32" r="4.5" fill="#1a1b1e" />
      <Circle cx="24.5" cy="30.5" r="1.5" fill="white" />
      <Circle cx="38.5" cy="30.5" r="1.5" fill="white" />
      <Polygon points="27,38 33,38 30,43" fill="#f97316" />
    </Svg>
  );
}

function Cat({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Circle cx="30" cy="34" r="19" fill="rgba(255,255,255,0.92)" />
      <Polygon points="13,26 20,12 27,26" fill="rgba(255,255,255,0.92)" />
      <Polygon points="33,26 40,12 47,26" fill="rgba(255,255,255,0.92)" />
      <Polygon points="15,25 20,14 25,25" fill="rgba(255,120,120,0.4)" />
      <Polygon points="35,25 40,14 45,25" fill="rgba(255,120,120,0.4)" />
      <Ellipse cx="23" cy="31" rx="4" ry="5" fill="#1a1b1e" />
      <Ellipse cx="37" cy="31" rx="4" ry="5" fill="#1a1b1e" />
      <Circle cx="24" cy="29.5" r="1.5" fill="white" />
      <Circle cx="38" cy="29.5" r="1.5" fill="white" />
      <Polygon points="28,38 32,38 30,41" fill="rgba(255,100,150,0.85)" />
    </Svg>
  );
}

function Fox({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Circle cx="30" cy="34" r="19" fill="rgba(255,255,255,0.92)" />
      <Polygon points="11,24 19,9 27,24" fill="rgba(255,255,255,0.92)" />
      <Polygon points="33,24 41,9 49,24" fill="rgba(255,255,255,0.92)" />
      <Polygon points="13.5,23 19,11.5 24.5,23" fill="rgba(255,110,60,0.5)" />
      <Polygon points="35.5,23 41,11.5 46.5,23" fill="rgba(255,110,60,0.5)" />
      <Ellipse cx="30" cy="41" rx="9" ry="5.5" fill="rgba(240,200,170,0.5)" />
      <Circle cx="23" cy="30" r="4" fill="#1a1b1e" />
      <Circle cx="37" cy="30" r="4" fill="#1a1b1e" />
      <Circle cx="24" cy="28.5" r="1.5" fill="white" />
      <Circle cx="38" cy="28.5" r="1.5" fill="white" />
      <Ellipse cx="30" cy="37" rx="2.5" ry="2" fill="#1a1b1e" />
    </Svg>
  );
}

function Bear({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Circle cx="13" cy="17" r="9" fill="rgba(255,255,255,0.92)" />
      <Circle cx="47" cy="17" r="9" fill="rgba(255,255,255,0.92)" />
      <Circle cx="13" cy="17" r="6" fill="rgba(255,190,130,0.45)" />
      <Circle cx="47" cy="17" r="6" fill="rgba(255,190,130,0.45)" />
      <Circle cx="30" cy="34" r="19" fill="rgba(255,255,255,0.92)" />
      <Ellipse cx="30" cy="41" rx="9" ry="6" fill="rgba(240,210,185,0.55)" />
      <Circle cx="23" cy="30" r="4" fill="#1a1b1e" />
      <Circle cx="37" cy="30" r="4" fill="#1a1b1e" />
      <Circle cx="24" cy="28.5" r="1.5" fill="white" />
      <Circle cx="38" cy="28.5" r="1.5" fill="white" />
      <Ellipse cx="30" cy="38" rx="3" ry="2" fill="#1a1b1e" />
    </Svg>
  );
}

function Bunny({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Ellipse cx="21" cy="14" rx="6.5" ry="13" fill="rgba(255,255,255,0.92)" />
      <Ellipse cx="39" cy="14" rx="6.5" ry="13" fill="rgba(255,255,255,0.92)" />
      <Ellipse cx="21" cy="14" rx="3.5" ry="9.5" fill="rgba(255,160,190,0.5)" />
      <Ellipse cx="39" cy="14" rx="3.5" ry="9.5" fill="rgba(255,160,190,0.5)" />
      <Circle cx="30" cy="36" r="18" fill="rgba(255,255,255,0.92)" />
      <Circle cx="23" cy="33" r="4" fill="#1a1b1e" />
      <Circle cx="37" cy="33" r="4" fill="#1a1b1e" />
      <Circle cx="24" cy="31.5" r="1.5" fill="white" />
      <Circle cx="38" cy="31.5" r="1.5" fill="white" />
      <Ellipse cx="30" cy="40" rx="2" ry="1.5" fill="rgba(255,150,180,0.9)" />
    </Svg>
  );
}

const ANIMALS = [Owl, Cat, Fox, Bear, Bunny];

export function KidAvatar({ name, size = 46 }: { name: string; size?: number }) {
  const idx = name.length > 0 ? name.charCodeAt(0) % ANIMALS.length : 0;
  const Animal = ANIMALS[idx];
  const bg = BG_COLORS[idx];
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Animal size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
