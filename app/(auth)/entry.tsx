import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../src/constants/theme';

const ENTRY_BODY = require('../../assets/entry-body.png');

const { width: SW } = Dimensions.get('window');

const ACCENT = '#59C8FF';
const DARK   = '#171A1C';
const BORDER = '#E3E6E8';

// Shield-check icon for the "100% Kids Safe" badge
function ShieldCheck() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path
        d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
        fill={ACCENT}
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function EntryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Illustration — image fills the top portion */}
      <Image
        source={ENTRY_BODY}
        style={s.bodyImg}
        resizeMode="cover"
      />

      {/* White overlay: covers the baked-in "Learn any Language" text in the image */}
      <View style={[s.textOverlay, { paddingTop: insets.top + 22 }]}>
        {/* 100% Kids Safe badge */}
        <View style={s.safeBadge}>
          <ShieldCheck />
          <Text style={s.safeText}>100% Kids Safe</Text>
        </View>

        {/* New headline */}
        <Text style={s.headline}>
          {'Smart Learning for\n'}
          <Text style={s.headlineAccent}>Curious</Text>
          {' Kids.'}
        </Text>
      </View>

      {/* Buttons */}
      <View style={[s.btnArea, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.push('/(auth)/onboarding')}
          activeOpacity={0.85}
        >
          <Text style={s.primaryText}>Let's Get a Fresh Start</Text>
          <View style={s.shine1} />
          <View style={s.shine2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={s.secondaryText}>Resume Journey</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bodyImg: {
    width: SW,
    flex: 1,
  },

  // Covers the top text area of entry-body.png with new content
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },

  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F0FBFF',
    borderWidth: 1.5,
    borderColor: '#C9EDFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 18,
  },
  safeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: ACCENT,
  },

  headline: {
    fontFamily: FONTS.display,
    fontSize: 36,
    color: DARK,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  headlineAccent: {
    color: ACCENT,
  },

  // Buttons
  btnArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1AA3D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryText: {
    fontFamily: FONTS.display,
    fontSize: 17,
    color: '#F5FCFF',
    zIndex: 1,
  },
  shine1: {
    position: 'absolute', right: -8, top: -18,
    width: 54, height: 80,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },
  shine2: {
    position: 'absolute', right: 36, top: -18,
    width: 44, height: 76,
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BORDER,
  },
  secondaryText: {
    fontFamily: FONTS.display,
    fontSize: 17,
    color: DARK,
  },
});
