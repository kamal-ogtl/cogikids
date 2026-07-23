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
import { registerKid } from '../../src/services/api/kidsAuth';
import type { AgeGroup } from '../../src/constants/curriculum';

const CLOUDS = require('../../assets/onboard-clouds.png');

const { width: SW } = Dimensions.get('window');

const SKY: [string, string] = ['#B3E6FF', '#FFFFFF'];
const ACCENT  = '#59C8FF';
const DARK    = '#171A1C';
const GREY    = '#5D686F';
const BORDER  = '#E3E6E8';
const BTN_TXT = '#F5FCFF';

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { setPlayer, setToken } = usePlayerStore();

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [age,        setAge]        = useState('');
  const [gender,     setGender]     = useState<'Male' | 'Female' | 'Other'>('Female');
  const [focused,    setFocused]    = useState<string | null>(null);
  const [showGender, setShowGender] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSubmit() {
    const trimName = name.trim();
    const trimEmail = email.trim();
    const ageNum = parseInt(age, 10);
    if (!trimName)                                { setError('Please enter your name'); return; }
    if (!trimEmail || !trimEmail.includes('@'))   { setError('Please enter a valid email'); return; }
    if (!age || isNaN(ageNum) || ageNum < 3 || ageNum > 18) { setError('Please enter a valid age (3–18)'); return; }
    setError(null);
    setSubmitting(true);
    const ageGroup: AgeGroup = ageNum <= 9 ? 'explorer' : 'strategist';
    try {
      const { token, player } = await registerKid({
        name: trimName,
        ageGroup,
        nativeLanguage: 'english',
        password: Math.random().toString(36).slice(2, 10),
      });
      cache.setToken(token);
      setToken(token);
      setPlayer(player);
      router.replace('/(tabs)');
    } catch {
      setSubmitting(false);
      setError('Could not save profile. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
        <Image source={CLOUDS} style={s.clouds} resizeMode="contain" />

        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color={DARK} />
          </TouchableOpacity>

          {/* Heading */}
          <View style={s.heading}>
            <Text style={s.title}>Create Profile</Text>
            <Text style={s.sub}>Provide us your some details so we store{'\n'}your all data carefully</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Field
              icon="person-outline"
              value={name}
              onChange={setName}
              placeholder="Your name"
              autoCapitalize="words"
              focused={focused === 'name'}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
            />
            <Field
              icon="mail-outline"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              focused={focused === 'email'}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />

            {/* Gender + Age row */}
            <View style={s.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>Gender</Text>
                <TouchableOpacity
                  style={s.dropdownBtn}
                  onPress={() => setShowGender(v => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={s.dropdownText}>{gender}</Text>
                  <Ionicons name="chevron-down" size={16} color={GREY} />
                </TouchableOpacity>
                {showGender && (
                  <View style={s.dropdownList}>
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <TouchableOpacity
                        key={g}
                        style={s.dropdownItem}
                        onPress={() => { setGender(g); setShowGender(false); }}
                      >
                        <Text style={[s.dropdownItemText, gender === g && { color: ACCENT }]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={{ width: 90 }}>
                <Text style={s.rowLabel}>Age</Text>
                <View style={[s.field, focused === 'age' && s.fieldFocused]}>
                  <TextInput
                    style={[s.input, { textAlign: 'center' }]}
                    value={age}
                    onChangeText={setAge}
                    placeholder="8"
                    placeholderTextColor="#B0C4CF"
                    keyboardType="number-pad"
                    maxLength={2}
                    onFocus={() => setFocused('age')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            </View>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, submitting && { opacity: 0.65 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={s.submitText}>{submitting ? 'Saving...' : 'Submit'}</Text>
            <View style={s.shine1} />
            <View style={s.shine2} />
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function Field({ icon, value, onChange, placeholder, secureTextEntry, keyboardType, autoCapitalize, focused, onFocus, onBlur }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string; onChange: (v: string) => void; placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  focused: boolean; onFocus: () => void; onBlur: () => void;
}) {
  return (
    <View style={[s.field, focused && s.fieldFocused]}>
      <Ionicons name={icon} size={20} color={focused ? ACCENT : '#8AA4B0'} style={{ marginRight: 10 }} />
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#B0C4CF"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

const s = StyleSheet.create({
  clouds: { position: 'absolute', width: SW + 170, height: 220, left: -(170 / 2), top: 0 },
  scroll: { paddingHorizontal: 16 },
  backBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    marginBottom: 8,
  },
  heading: { marginBottom: 28, alignItems: 'center', paddingTop: 32 },
  title:   { fontFamily: FONTS.display, fontSize: 30, color: DARK, marginBottom: 8, textAlign: 'center' },
  sub:     { fontFamily: FONTS.body, fontSize: 14, color: GREY, textAlign: 'center', lineHeight: 21 },
  form:    { gap: 12, marginBottom: 20 },
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
  rowFields: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  rowLabel:  { fontFamily: FONTS.bodyMedium, fontSize: 13, color: GREY, marginBottom: 6 },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  dropdownText: { fontFamily: FONTS.body, fontSize: 16, color: DARK },
  dropdownList: {
    position: 'absolute', top: 56, left: 0, right: 0, zIndex: 99,
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 8, elevation: 6,
    overflow: 'hidden',
  },
  dropdownItem:     { paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: BORDER },
  dropdownItemText: { fontFamily: FONTS.body, fontSize: 15, color: DARK },
  error:  { fontFamily: FONTS.body, fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 12 },
  submitBtn: {
    backgroundColor: ACCENT, borderRadius: 28, height: 52,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#1AA3D4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10, elevation: 6,
  },
  submitText: { fontFamily: FONTS.display, fontSize: 17, color: BTN_TXT, zIndex: 1 },
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
});
