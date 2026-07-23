import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { FONTS } from '../../src/constants/theme';
import { LANGUAGES, SupportedLanguage } from '../../src/constants/languages';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import type { AgeGroup } from '../../src/constants/curriculum';
import cache from '../../src/services/offline/cache';
import { registerKid } from '../../src/services/api/kidsAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { playSound } from '../../src/utils/sounds';
import { HausaFlag, YorubaFlag, IgboFlag, EnglishFlag } from '../../src/components/characters/LanguageIcons';

// ─── Assets ───────────────────────────────────────────────────────────────────
const BG1          = require('../../assets/onboard-bg1.png');
const BG2          = require('../../assets/onboard-bg2.png');
const BEAR_TABLET  = require('../../assets/onboard-bear-tablet.png');
const BEAR_LOADING = require('../../assets/onboard-bear-loading.png');
const BEAR_TOUGH   = require('../../assets/onboard-bear-tough.png');
const CLOUDS       = require('../../assets/onboard-clouds.png');

const { width: SW } = Dimensions.get('window');

// ─── Design tokens (exact from Figma) ─────────────────────────────────────────
const SKY: [string, string] = ['#B3E6FF', '#FFFFFF'];
const ACCENT   = '#59C8FF';
const DARK     = '#171A1C';
const GREY     = '#5D686F';
const BORDER   = '#E3E6E8';
const ACTIVE_BG = '#F5FCFF';
const BTN_TEXT  = '#F5FCFF';

// ─── Step IDs ─────────────────────────────────────────────────────────────────
const S_WELCOME  = 0;
const S_INTRO    = 1;
const S_LANGUAGE = 2;
const S_SUBJECTS = 3;
const S_LEVEL    = 4;
const S_GOAL     = 5;
const S_LOADING  = 6;
const S_SAVE     = 7;
const S_ACCOUNT  = 8;

const SURVEY_STEPS = [S_LANGUAGE, S_SUBJECTS, S_LEVEL, S_GOAL];

// ─── Bubble text segments (highlighted word shown in ACCENT color) ─────────────
type Seg = { text: string; hi?: boolean };
const BUBBLES: Record<number, Seg[]> = {
  [S_LANGUAGE]: [{ text: 'So.! What ' }, { text: 'Language', hi: true }, { text: '\ndo you speak at home?' }],
  [S_SUBJECTS]: [{ text: "Okay.! What would\nyou like to " }, { text: 'Study', hi: true }, { text: '.?' }],
  [S_LEVEL]:    [{ text: "How much do\nyou already " }, { text: 'Know', hi: true }, { text: '.?' }],
  [S_GOAL]:     [{ text: "What's your daily\nlearning " }, { text: 'goal', hi: true }, { text: '.?' }],
};

// ─── Shared small components ───────────────────────────────────────────────────
function CTAButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={sh.cta} onPress={onPress} activeOpacity={0.85}>
      <Text style={sh.ctaText}>{title}</Text>
      <View style={sh.shine1} />
      <View style={sh.shine2} />
    </TouchableOpacity>
  );
}

function BackBtn({ onPress, top }: { onPress: () => void; top: number }) {
  return (
    <TouchableOpacity style={[sh.backBtn, { top }]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="chevron-back" size={20} color={DARK} />
    </TouchableOpacity>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={sh.progressTrack}>
      <View style={[sh.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
    </View>
  );
}

function RadioOption({
  icon, label, active, onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[sh.optRow, active && sh.optRowActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={sh.optIcon}>{icon}</View>
      <Text style={[sh.optLabel, active && { color: ACCENT }]}>{label}</Text>
      <View style={[sh.radio, active && sh.radioActive]}>
        {active && <View style={sh.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setPlayer, setToken } = usePlayerStore();
  const { setNativeLanguage }   = useSettingsStore();

  const [step,         setStep]         = useState(S_WELCOME);
  const [language,     setLanguage]     = useState<SupportedLanguage>('hausa');
  const [subjects,     setSubjects]     = useState('all');
  const [level,        setLevel]        = useState('beginner');
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [dailyTime,    setDailyTime]    = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [age,          setAge]          = useState('');
  const [password,     setPassword]     = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  function goTo(s: number) {
    setError(null);
    setStep(s);
    playSound('tap');
  }

  function goBack() {
    if (step === S_WELCOME) return;
    if (step === S_ACCOUNT) { goTo(S_SAVE); return; }
    goTo(step - 1);
  }

  function goNext() {
    if (step === S_GOAL)    { goTo(S_LOADING); return; }
    if (step === S_LOADING) { goTo(S_SAVE);    return; }
    goTo(step + 1);
  }

  async function handleSubmit() {
    const trimName = name.trim();
    const trimEmail = email.trim();
    const ageNum = parseInt(age, 10);
    if (!trimName)                              { setError('Please enter your name'); return; }
    if (!trimEmail || !trimEmail.includes('@')) { setError('Please enter a valid email'); return; }
    if (!age || isNaN(ageNum) || ageNum < 3 || ageNum > 18) { setError('Please enter a valid age (3–18)'); return; }
    if (password.length < 6)                    { setError('Password must be at least 6 characters'); return; }
    setError(null);
    setSubmitting(true);
    const ageGroup: AgeGroup = ageNum <= 9 ? 'explorer' : 'strategist';
    try {
      const { token, player } = await registerKid({
        name: trimName,
        ageGroup,
        nativeLanguage: language,
        password,
      });
      cache.setToken(token);
      setToken(token);
      setPlayer(player);
      setNativeLanguage(language);
      router.replace('/(tabs)');
    } catch {
      setSubmitting(false);
      setError('Could not create your account. Please try again.');
    }
  }

  // ── Routing ─────────────────────────────────────────────────────────────────
  if (step === S_WELCOME) {
    return (
      <WelcomeStep
        onNext={() => goTo(S_INTRO)}
        onBack={() => router.back()}
        insets={insets}
      />
    );
  }

  if (step === S_INTRO) {
    return (
      <IntroStep
        onNext={() => goTo(S_LANGUAGE)}
        onBack={() => goTo(S_WELCOME)}
        insets={insets}
      />
    );
  }

  if (step === S_LOADING) {
    return <LoadingStep onDone={() => goTo(S_SAVE)} insets={insets} />;
  }

  if (step === S_SAVE) {
    return (
      <SaveStep
        onGoogle={() => goTo(S_ACCOUNT)}
        onAccount={() => goTo(S_ACCOUNT)}
        onBack={() => goTo(S_GOAL)}
        insets={insets}
      />
    );
  }

  if (step === S_ACCOUNT) {
    return (
      <AccountStep
        name={name}         setName={setName}
        email={email}       setEmail={setEmail}
        age={age}           setAge={setAge}
        password={password} setPassword={setPassword}
        error={error}
        submitting={submitting}
        onBack={() => goTo(S_SAVE)}
        onSubmit={handleSubmit}
        insets={insets}
      />
    );
  }

  // ── Survey steps (S_LANGUAGE → S_GOAL) ──────────────────────────────────────
  const qIdx     = SURVEY_STEPS.indexOf(step);
  const progress = (qIdx + 1) / SURVEY_STEPS.length;
  const backTop  = insets.top + 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Sky header with clouds + bear + bubble */}
      <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={sv.header}>
        {/* Clouds */}
        <Image source={CLOUDS} style={sv.cloudsImg} resizeMode="contain" />

        {/* TopAppBar */}
        <View style={[sv.topBar, { paddingTop: insets.top + 10 }]}>
          <BackBtn onPress={goBack} top={0} />
          <ProgressBar progress={progress} />
        </View>

        {/* Bear + bubble row */}
        <View style={sv.bearRow}>
          <Image source={BEAR_TABLET} style={sv.bearImg} resizeMode="contain" />
          <View style={sv.bubbleWrap}>
            <View style={sv.bubbleTail} />
            <View style={sv.bubble}>
              <Text style={sv.bubbleText}>
                {BUBBLES[step]?.map((seg, i) => (
                  <Text key={i} style={seg.hi ? sv.bubbleHi : undefined}>{seg.text}</Text>
                ))}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={sv.listWrap}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === S_LANGUAGE && (
          <LanguageOptions language={language} setLanguage={(v) => { setLanguage(v); }} />
        )}
        {step === S_SUBJECTS && (
          <SubjectOptions subjects={subjects} setSubjects={setSubjects} />
        )}
        {step === S_LEVEL && (
          <LevelOptions level={level} setLevel={setLevel} />
        )}
        {step === S_GOAL && (
          <GoalPicker
            minutes={dailyMinutes} setMinutes={setDailyMinutes}
            time={dailyTime}       setTime={setDailyTime}
          />
        )}
      </ScrollView>

      {/* CTA */}
      <View style={[sv.ctaBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <CTAButton title="Next" onPress={goNext} />
      </View>
    </View>
  );
}

// ─── Screen 1: Welcome ────────────────────────────────────────────────────────
function WelcomeStep({ onNext, onBack, insets }: {
  onNext: () => void; onBack: () => void;
  insets: { top: number; bottom: number };
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#B3E6FF' }}>
      <View style={{ flex: 1 }}>
        <Image source={BG1} style={ws.bg} resizeMode="cover" />
        <BackBtn onPress={onBack} top={insets.top + 16} />
      </View>
      <View style={[ws.actionBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <CTAButton title='Say "Hi" to Cogi' onPress={onNext} />
      </View>
    </View>
  );
}

// ─── Screen 2: Intro ──────────────────────────────────────────────────────────
function IntroStep({ onNext, onBack, insets }: {
  onNext: () => void; onBack: () => void;
  insets: { top: number; bottom: number };
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#B3E6FF' }}>
      <View style={{ flex: 1 }}>
        <Image source={BG2} style={ws.bg} resizeMode="cover" />
        <BackBtn onPress={onBack} top={insets.top + 16} />
      </View>
      <View style={[ws.actionBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <CTAButton title="Sure.! Continue" onPress={onNext} />
      </View>
    </View>
  );
}

// ─── Screen 7: Loading ────────────────────────────────────────────────────────
function LoadingStep({ onDone, insets }: { onDone: () => void; insets: { top: number; bottom: number } }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -14, duration: 600, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={ld.wrap}>
      <Animated.Image
        source={BEAR_LOADING}
        style={[ld.bear, { transform: [{ translateY: bounce }] }]}
        resizeMode="contain"
      />
      <Text style={ld.text}>Loading your course</Text>
    </LinearGradient>
  );
}

// ─── Screen 8: Save Journey ───────────────────────────────────────────────────
function SaveStep({ onGoogle, onAccount, onBack, insets }: {
  onGoogle: () => void; onAccount: () => void; onBack: () => void;
  insets: { top: number; bottom: number };
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Sky top with clouds */}
      <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={sv2.skyTop}>
        <Image source={CLOUDS} style={sv2.clouds} resizeMode="contain" />
        <BackBtn onPress={onBack} top={insets.top + 16} />
      </LinearGradient>

      {/* Bear + text */}
      <View style={sv2.body}>
        <Image source={BEAR_TOUGH} style={sv2.bear} resizeMode="contain" />
        <Text style={sv2.title}>Save your journey</Text>
        <Text style={sv2.sub}>
          {"Don't lose your unlocked levels and claimed\nrewards by just Signing-Up in CogniKids"}
        </Text>
      </View>

      {/* Buttons */}
      <View style={[sv2.btnArea, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity style={sv2.outlineBtn} onPress={onGoogle} activeOpacity={0.8}>
          <GoogleIcon />
          <Text style={sv2.outlineText}>Sign Up with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={sv2.outlineBtn} onPress={onAccount} activeOpacity={0.8}>
          <Ionicons name="person-outline" size={20} color={GREY} />
          <Text style={sv2.outlineText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen 9: Create Account ─────────────────────────────────────────────────
function AccountStep({
  name, setName, email, setEmail, age, setAge,
  password, setPassword, error, submitting, onBack, onSubmit, insets,
}: {
  name: string;     setName: (v: string) => void;
  email: string;    setEmail: (v: string) => void;
  age: string;      setAge: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  error: string | null; submitting: boolean;
  onBack: () => void; onSubmit: () => void;
  insets: { top: number; bottom: number };
}) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={SKY} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
        <Image source={CLOUDS} style={ac.cloudsImg} resizeMode="contain" />

        <ScrollView
          contentContainerStyle={[ac.scroll, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BackBtn onPress={onBack} top={0} />

          <View style={ac.headingWrap}>
            <Text style={ac.title}>Create Account</Text>
            <Text style={ac.sub}>Provide your basic details to verify your identity & Save your Progress</Text>
          </View>

          <View style={ac.form}>
            <AccField
              icon="person-outline"
              value={name}
              onChange={setName}
              placeholder="Your name"
              autoCapitalize="words"
              focused={focusedField === 'name'}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
            <AccField
              icon="mail-outline"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              focused={focusedField === 'email'}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            <View style={ac.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={ac.fieldLabel}>Age</Text>
                <View style={[ac.field, focusedField === 'age' && ac.fieldFocused, { borderRadius: 12 }]}>
                  <TextInput
                    style={ac.fieldInput}
                    value={age}
                    onChangeText={setAge}
                    placeholder="8"
                    placeholderTextColor="#B0C4CF"
                    keyboardType="number-pad"
                    maxLength={2}
                    onFocus={() => setFocusedField('age')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>
            <AccField
              icon="lock-closed-outline"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              secureTextEntry
              focused={focusedField === 'pass'}
              onFocus={() => setFocusedField('pass')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {error ? <Text style={ac.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[sh.cta, submitting && { opacity: 0.65 }]}
            onPress={onSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={sh.ctaText}>{submitting ? 'Creating account...' : 'Submit'}</Text>
            <View style={sh.shine1} />
            <View style={sh.shine2} />
          </TouchableOpacity>

          <Text style={ac.footnote}>
            After registering, we'll send a verification link to your email. Please verify using that link.
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function AccField({
  icon, value, onChange, placeholder, secureTextEntry,
  keyboardType, autoCapitalize, focused, onFocus, onBlur,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <View style={[ac.field, focused && ac.fieldFocused]}>
      <Ionicons name={icon} size={20} color={focused ? ACCENT : '#8AA4B0'} style={{ marginRight: 10 }} />
      <TextInput
        style={ac.fieldInput}
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

// ─── Survey Option Lists ───────────────────────────────────────────────────────
const LANG_GREETINGS: Record<SupportedLanguage, { tts: string; lang: string }> = {
  hausa:   { tts: 'Sannu aboki! Ina farin ciki da ganku!', lang: 'ha' },
  yoruba:  { tts: 'E kaabo! E se pupo!',                   lang: 'yo' },
  igbo:    { tts: 'Nnoo! I biri oma!',                     lang: 'ig' },
  english: { tts: "Hello friend! Great choice!",           lang: 'en-US' },
};

const LANG_OPTIONS: { key: SupportedLanguage; label: string; Flag: React.ComponentType<{ size?: number }> }[] = [
  { key: 'hausa',   label: 'Hausa',   Flag: HausaFlag   },
  { key: 'yoruba',  label: 'Yoruba',  Flag: YorubaFlag  },
  { key: 'igbo',    label: 'Igbo',    Flag: IgboFlag    },
  { key: 'english', label: 'English', Flag: EnglishFlag },
];

function LanguageOptions({ language, setLanguage }: { language: SupportedLanguage; setLanguage: (v: SupportedLanguage) => void }) {
  function pick(l: SupportedLanguage) {
    setLanguage(l);
    const g = LANG_GREETINGS[l];
    Speech.stop();
    Speech.speak(g.tts, { language: g.lang, rate: 0.88, pitch: 1.1 });
  }
  return (
    <>
      {LANG_OPTIONS.map(({ key, label, Flag }) => (
        <RadioOption
          key={key}
          icon={<Flag size={26} />}
          label={LANGUAGES[key].nativeName}
          active={language === key}
          onPress={() => pick(key)}
        />
      ))}
    </>
  );
}

const SUBJECT_OPTIONS = [
  { key: 'math',    label: 'Mathematics',       emoji: '🔢' },
  { key: 'science', label: 'Science',            emoji: '🔬' },
  { key: 'english', label: 'English Language',   emoji: '📖' },
  { key: 'stories', label: 'Stories & Reading',  emoji: '📚' },
  { key: 'social',  label: 'Social Studies',     emoji: '🌍' },
  { key: 'all',     label: 'All Subjects',       emoji: '🎯' },
];

function SubjectOptions({ subjects, setSubjects }: { subjects: string; setSubjects: (v: string) => void }) {
  return (
    <>
      {SUBJECT_OPTIONS.map(({ key, label, emoji }) => (
        <RadioOption
          key={key}
          icon={<Text style={{ fontSize: 22 }}>{emoji}</Text>}
          label={label}
          active={subjects === key}
          onPress={() => setSubjects(key)}
        />
      ))}
    </>
  );
}

const LEVEL_OPTIONS = [
  { key: 'beginner',    label: 'Just Starting',       icon: '📶' },
  { key: 'basics',      label: 'Know Some Basics',     icon: '📶' },
  { key: 'comfortable', label: 'Getting Comfortable',  icon: '📶' },
  { key: 'advanced',    label: 'Challenge Mode',       icon: '📶' },
];

function LevelOptions({ level, setLevel }: { level: string; setLevel: (v: string) => void }) {
  const bars = (key: string) => {
    const idx = LEVEL_OPTIONS.findIndex(l => l.key === key);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: 24, height: 20 }}>
        {[1, 2, 3, 4].map((h, i) => (
          <View
            key={i}
            style={{
              flex: 1, borderRadius: 2,
              height: 5 + h * 3,
              backgroundColor: i <= idx ? ACCENT : BORDER,
            }}
          />
        ))}
      </View>
    );
  };
  return (
    <>
      {LEVEL_OPTIONS.map(({ key, label }) => (
        <RadioOption
          key={key}
          icon={bars(key)}
          label={label}
          active={level === key}
          onPress={() => setLevel(key)}
        />
      ))}
    </>
  );
}

// ─── Daily Goal Picker ────────────────────────────────────────────────────────
const MINUTES = [5, 10, 15, 30, 45];
type DayTime = 'morning' | 'afternoon' | 'evening';

function GoalPicker({ minutes, setMinutes, time, setTime }: {
  minutes: number; setMinutes: (v: number) => void;
  time: DayTime;   setTime: (v: DayTime) => void;
}) {
  return (
    <View style={gp.container}>
      {/* Minutes strip */}
      <View style={gp.minuteRow}>
        {MINUTES.map((m) => {
          const active = minutes === m;
          return (
            <View key={m} style={{ alignItems: 'center' }}>
              {active && (
                <View style={gp.niceChip}>
                  <Text style={gp.niceText}>Nice 👍</Text>
                </View>
              )}
              <TouchableOpacity
                style={[gp.minChip, active && gp.minChipActive]}
                onPress={() => setMinutes(m)}
                activeOpacity={0.7}
              >
                <Text style={[gp.minNum, active && gp.minNumActive]}>{String(m).padStart(2, '0')}</Text>
                <Text style={[gp.minLabel, active && gp.minLabelActive]}>Min</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Time of day */}
      <View style={gp.timeRow}>
        {(['morning', 'afternoon', 'evening'] as DayTime[]).map((t) => {
          const active = time === t;
          return (
            <TouchableOpacity
              key={t}
              style={[gp.timeChip, active && gp.timeChipActive]}
              onPress={() => setTime(t)}
              activeOpacity={0.7}
            >
              <Text style={[gp.timeText, active && gp.timeTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Google icon (multicolor G) ───────────────────────────────────────────────
function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 16, fontFamily: FONTS.display, color: '#4285F4' }}>G</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Shared
const sh = StyleSheet.create({
  cta: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1AA3D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaText: { fontFamily: FONTS.display, fontSize: 17, color: BTN_TEXT, zIndex: 1 },
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
  backBtn: {
    position: 'absolute', left: 16, zIndex: 10,
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  progressTrack: {
    flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 5, overflow: 'hidden', marginLeft: 8,
  },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 5 },
  optRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1.5, borderColor: BORDER,
    gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  optRowActive: { borderColor: ACCENT, backgroundColor: ACTIVE_BG },
  optIcon: { width: 28, alignItems: 'center' },
  optLabel: { flex: 1, fontFamily: FONTS.heading, fontSize: 15, color: DARK },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioActive: { borderColor: ACCENT },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: ACCENT },
});

// Welcome / Intro screens
const ws = StyleSheet.create({
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  actionBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

// Survey screens
const sv = StyleSheet.create({
  header: { overflow: 'hidden' },
  cloudsImg: {
    position: 'absolute', width: SW + 170, height: 220,
    left: -(170 / 2), top: 0,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: 80, paddingRight: 16,
    height: 80, zIndex: 1,
  },
  bearRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: 12, paddingRight: 16, paddingBottom: 16, paddingTop: 4,
    zIndex: 1,
  },
  bearImg: { width: 130, height: 148 },
  bubbleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
  bubbleTail: {
    width: 0, height: 0,
    borderTopWidth: 8, borderBottomWidth: 8, borderRightWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  bubble: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  bubbleText: { fontFamily: FONTS.heading, fontSize: 15, color: DARK, lineHeight: 22 },
  bubbleHi:   { color: ACCENT },
  listWrap:   { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 10 },
  ctaBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
});

// Loading screen
const ld = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bear: { width: 185, height: 210 },
  text: { fontFamily: FONTS.display, fontSize: 20, color: DARK, marginTop: 24, textAlign: 'center' },
});

// Save Journey screen
const sv2 = StyleSheet.create({
  skyTop: { height: 260, overflow: 'hidden' },
  clouds: {
    position: 'absolute', width: SW + 170, height: 220,
    left: -(170 / 2), top: 0,
  },
  body: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
  bear: { width: 200, height: 210, marginTop: -60 },
  title: { fontFamily: FONTS.display, fontSize: 28, color: DARK, textAlign: 'center', marginTop: 12 },
  sub: {
    fontFamily: FONTS.body, fontSize: 14, color: GREY,
    textAlign: 'center', lineHeight: 22, marginTop: 8,
  },
  btnArea: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14, height: 52,
    borderWidth: 2, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  outlineText: { fontFamily: FONTS.heading, fontSize: 15, color: DARK },
});

// Account screen
const ac = StyleSheet.create({
  cloudsImg: {
    position: 'absolute', width: SW + 170, height: 220,
    left: -(170 / 2), top: 0,
  },
  scroll: { paddingHorizontal: 16 },
  headingWrap: { paddingTop: 60, marginBottom: 24, alignItems: 'center' },
  title: { fontFamily: FONTS.display, fontSize: 28, color: DARK, textAlign: 'center', marginBottom: 8 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: GREY, textAlign: 'center', lineHeight: 20 },
  form: { gap: 12, marginBottom: 16 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  fieldFocused: { borderColor: ACCENT },
  fieldInput: { flex: 1, fontFamily: FONTS.body, fontSize: 16, color: DARK },
  rowFields: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: GREY, marginBottom: 6 },
  error: { fontFamily: FONTS.body, fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 12 },
  footnote: {
    fontFamily: FONTS.body, fontSize: 12, color: '#9AB5C2',
    textAlign: 'center', lineHeight: 18, marginTop: 16,
  },
});

// Daily goal picker
const gp = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    gap: 16,
  },
  minuteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  minChip: {
    width: (SW - 32 - 64) / 5,
    paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
  },
  minChipActive: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: ACCENT },
  minNum:       { fontFamily: FONTS.display, fontSize: 20, color: DARK },
  minNumActive: { color: DARK },
  minLabel:     { fontFamily: FONTS.body, fontSize: 11, color: '#AAB8C0', marginTop: 2 },
  minLabelActive: { color: ACCENT },
  niceChip: {
    backgroundColor: ACCENT, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6,
  },
  niceText: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: '#FFFFFF' },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeChip: { flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  timeChipActive: { backgroundColor: ACCENT },
  timeText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: '#9AB5C2' },
  timeTextActive: { color: '#FFFFFF', fontFamily: FONTS.heading },
});
