import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../../src/constants/theme';

const CLOUDS    = require('../../assets/onboard-clouds.png');
const SPLASH_COGI = require('../../assets/splash-cogi.png');

const { width: SW } = Dimensions.get('window');

const SKY: [string, string] = ['#B3E6FF', '#FFFFFF'];

export default function SplashScreen() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    const t = setTimeout(() => router.replace('/(auth)/entry'), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={s.wrap}>
      <Image source={CLOUDS} style={s.clouds} resizeMode="contain" />

      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <Text style={s.sub}>Learning with</Text>
        <Text style={s.title}>CogiKids</Text>

        <Animated.Image
          source={SPLASH_COGI}
          style={[s.cogi, { transform: [{ translateY: floatAnim }] }]}
          resizeMode="contain"
        />
      </Animated.View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  wrap:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  clouds:  { position: 'absolute', width: SW + 170, height: 260, left: -(170 / 2), top: 0 },
  content: { alignItems: 'center', paddingTop: 60 },
  sub:     { fontFamily: FONTS.body, fontSize: 16, color: '#5D686F', letterSpacing: 0.5, marginBottom: 4 },
  title:   { fontFamily: FONTS.display, fontSize: 42, color: '#171A1C', letterSpacing: -0.5 },
  cogi:    { width: 300, height: 280, marginTop: 20 },
});
