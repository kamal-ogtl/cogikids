/**
 * Settings store — user preferences: native language (for hints/TTS), sound
 * effects toggle and text-to-speech toggle. Read in non-hook contexts via
 * useSettingsStore.getState() (e.g. the playSound utility).
 */
import { create } from 'zustand';
import type { SupportedLanguage } from '../constants/languages';

export interface SettingsStore {
  nativeLanguage: SupportedLanguage;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  setNativeLanguage: (lang: SupportedLanguage) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTtsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  nativeLanguage: 'hausa',
  soundEnabled: true,
  ttsEnabled: true,

  setNativeLanguage: (lang) => set({ nativeLanguage: lang }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setTtsEnabled: (enabled) => set({ ttsEnabled: enabled }),
}));
