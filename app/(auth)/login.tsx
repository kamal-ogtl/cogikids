import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import cache from '../../src/services/offline/cache';
import { loginKid } from '../../src/services/api/kidsAuth';

const CLOUDS = require('../../assets/onboard-clouds.png');

const { width: SW } = Dimensions.get('window');

const SKY: [string, string]  = ['#B3E6FF', '#FFFFFF'];
const ACCENT  = '#59C8FF';
const DARK    = '#171A1C';
const GREY    = '#5D686F';
const BORDER  = '#E3E6E8';
const ACTIVE  = '#F5FCFF';
const BTN_TXT = '#F5FCFF';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { setPlayer, setToken } = usePlayerStore();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [focused,    setFocused]    = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleLogin() {
    const trimEmail = email.trim();
    if (!trimEmail || !trimEmail.includes('@')) { setError('Please enter a valid email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(null);
    setSubmitting(true);
    try {
      const { token, player } = await loginKid(trimEmail, password);
      cache.setToken(token);
      setToken(token);
      setPlayer(player);
      router.replace('/(tabs)');
    } catch {
      setSubmitting(false);
      setError('Invalid email or password. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
        <Image source={CLOUDS} style={s.clouds} resizeMode="contain" />

        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <View style={s.heading}>
            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.sub}>Please login with your Account by entering{'\n'}your valid credentials</Text>
          </View>

          {/* Fields */}
          <View style={s.form}>
            <View style={[s.field, focused === 'email' && s.fieldFocused]}>
              <Ionicons name="mail-outline" size={20} color={focused === 'email' ? ACCENT : '#8AA4B0'} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#B0C4CF"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={[s.field, focused === 'pass' && s.fieldFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focused === 'pass' ? ACCENT : '#8AA4B0'} style={{ marginRight: 10 }} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#B0C4CF"
                secureTextEntry={!showPass}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} activeOpacity={0.7}>
                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#8AA4B0" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={s.forgotRow} activeOpacity={0.7}>
            <Text style={s.forgot}>Forgot Password .?</Text>
          </TouchableOpacity>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* Login button */}
          <TouchableOpacity
            style={[s.loginBtn, submitting && { opacity: 0.65 }]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={s.loginText}>{submitting ? 'Logging in...' : 'Login Now'}</Text>
            <View style={s.shine1} />
            <View style={s.shine2} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>Or Continue With</Text>
            <View style={s.divLine} />
          </View>

          {/* Social buttons */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
              <Text style={s.googleG}>G</Text>
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={20} color={DARK} />
              <Text style={s.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={s.signupRow}>
            <Text style={s.signupLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/onboarding')} activeOpacity={0.7}>
              <Text style={s.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  clouds: { position: 'absolute', width: SW + 170, height: 220, left: -(170 / 2), top: 0 },
  scroll: { paddingHorizontal: 16 },

  heading: { marginBottom: 28, alignItems: 'center', paddingTop: 40 },
  title:   { fontFamily: FONTS.display, fontSize: 30, color: DARK, marginBottom: 8, textAlign: 'center' },
  sub:     { fontFamily: FONTS.body, fontSize: 14, color: GREY, textAlign: 'center', lineHeight: 21 },

  form: { gap: 12, marginBottom: 8 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  fieldFocused: { borderColor: ACCENT },
  input: { flex: 1, fontFamily: FONTS.body, fontSize: 16, color: DARK },

  forgotRow: { alignItems: 'flex-end', marginBottom: 20 },
  forgot:    { fontFamily: FONTS.bodyMedium, fontSize: 14, color: DARK, textDecorationLine: 'underline' },

  error: { fontFamily: FONTS.body, fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 12 },

  loginBtn: {
    backgroundColor: ACCENT, borderRadius: 28, height: 52,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#1AA3D4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10, elevation: 6,
    marginBottom: 24,
  },
  loginText: { fontFamily: FONTS.display, fontSize: 17, color: BTN_TXT, zIndex: 1 },
  shine1: {
    position: 'absolute', right: -8, top: -18, width: 54, height: 80,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },
  shine2: {
    position: 'absolute', right: 36, top: -18, width: 44, height: 76,
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },

  divider:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine:  { flex: 1, height: 1, backgroundColor: BORDER },
  divText:  { fontFamily: FONTS.bodyMedium, fontSize: 13, color: GREY },

  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 14, height: 52,
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  googleG:    { fontFamily: FONTS.display, fontSize: 18, color: '#4285F4' },
  socialText: { fontFamily: FONTS.heading, fontSize: 15, color: DARK },

  signupRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupLabel: { fontFamily: FONTS.body, fontSize: 14, color: GREY },
  signupLink:  { fontFamily: FONTS.heading, fontSize: 14, color: ACCENT },
});
