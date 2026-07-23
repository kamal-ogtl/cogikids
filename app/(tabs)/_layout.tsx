import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ACCENT     = '#59C8FF';
const ACTIVE_BG  = '#EAF7FF';
const ICON_OFF   = '#2D3A40';

type IName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; on: IName; off: IName }[] = [
  { name: 'index',        on: 'shield',            off: 'shield-outline' },
  { name: 'skills',       on: 'trophy',            off: 'trophy-outline' },
  { name: 'bee',          on: 'flame',             off: 'flame-outline' },
  { name: 'conversation', on: 'videocam',          off: 'videocam-outline' },
  { name: 'arena',        on: 'flash',             off: 'flash-outline' },
  { name: 'profile',      on: 'person',            off: 'person-outline' },
];

// Screens that get the full-screen treatment (tab bar hidden)
const FULLSCREEN_TABS = new Set(['conversation']);

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Hide tab bar entirely on full-screen tabs
  if (FULLSCREEN_TABS.has(state.routes[state.index]?.name)) return null;

  // Only show tabs that are in the TABS config (hides arena etc.)
  const visibleRoutes = state.routes.filter(r => TABS.some(t => t.name === r.name));

  return (
    <View style={[s.outer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={s.pill}>
        {visibleRoutes.map(route => {
          const idx     = state.routes.findIndex(r => r.key === route.key);
          const focused = state.index === idx;
          const tab     = TABS.find(t => t.name === route.name) ?? TABS[0];
          return (
            <TouchableOpacity
              key={route.key}
              style={s.item}
              activeOpacity={0.8}
              onPress={() => {
                const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !ev.defaultPrevented) navigation.navigate(route.name);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            >
              <View style={[s.iconBox, focused && s.iconBoxActive]}>
                <Ionicons
                  name={focused ? tab.on : tab.off}
                  size={22}
                  color={focused ? ACCENT : ICON_OFF}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { paddingBottom: 90 } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="skills" />
      <Tabs.Screen name="bee" />
      <Tabs.Screen name="conversation" options={{ sceneStyle: { paddingBottom: 0 } }} />
      <Tabs.Screen name="arena" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pill: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: ACTIVE_BG,
  },
});
