import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/usePlayerStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
}

const TABS: TabConfig[] = [
  { name: 'index',  title: 'Home',   icon: 'home-outline',      activeIcon: 'home' },
  { name: 'skills', title: 'Skills', icon: 'git-branch-outline', activeIcon: 'git-branch' },
  { name: 'arena',  title: 'Arena',  icon: 'flash-outline',      activeIcon: 'flash' },
  { name: 'bee',    title: 'Bee',    icon: 'mic-outline',        activeIcon: 'mic' },
];

// Liquid glass pill background
function GlassPill() {
  return (
    <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill}>
      {/* base dark tint */}
      <View style={[StyleSheet.absoluteFill, styles.glassBase]} />
      {/* top highlight — simulates curved light refraction */}
      <View style={styles.glassTopHighlight} />
      {/* subtle inner bottom shadow */}
      <View style={styles.glassBottomShadow} />
      {/* faint primary color tint for "liquid" iridescence */}
      <View style={styles.glassColorTint} />
    </BlurView>
  );
}

export default function TabsLayout() {
  const checkAndUpdateStreak = usePlayerStore((s) => s.checkAndUpdateStreak);

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.brand.primary,
        tabBarInactiveTintColor: 'rgba(193,194,197,0.65)',
        tabBarLabelStyle: styles.label,
        sceneStyle: styles.scene,
        tabBarBackground: () => <GlassPill />,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={size + 1} color={color} />
            ),
          }}
        />
      ))}
      {/* Profile — hidden from tab bar, accessible via header avatar */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    paddingBottom: 100,
    backgroundColor: COLORS.bg.primary,
  },

  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    right: 18,
    height: 68,
    borderRadius: 26,
    // transparent so only GlassPill provides the background
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    paddingBottom: 0,
    overflow: 'hidden',
  },

  label: {
    fontFamily: FONTS.body,
    fontSize: 11,
  },

  // ── Glass pill layers ──────────────────────────────────────────────────────
  glassBase: {
    backgroundColor: 'rgba(18, 19, 24, 0.58)',
    borderRadius: 26,
  },

  glassTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  glassBottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },

  glassColorTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 34,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    // very faint blue iridescence
    backgroundColor: 'rgba(14, 165, 233, 0.04)',
  },
});
