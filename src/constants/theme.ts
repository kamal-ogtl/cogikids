// Design tokens extracted from the main CogniEdufy frontend.
// Source: cogniedufy_frontend/tailwind.config.js and src/index.css
// All UI components must import from here — never hardcode color strings.

export const COLORS = {
  bg: {
    primary: '#1a1b1e',   // dark.bg from main app
    card: '#25262b',       // dark.card
    cardAlt: '#2c2d32',   // dark.hover
    border: '#2e2f34',    // dark.border
  },
  brand: {
    primary: '#0ea5e9',   // primary-500
    deep: '#0284c7',      // primary-600 (pressed/hover)
    gradient: ['#2563eb', '#9333ea'] as const, // blue-600 → purple-600 (CTA gradient)
  },
  semantic: {
    gold: '#EF9F27',      // XP and rewards
    correct: '#14b8a6',   // teal-500 — success/correct (text-gradient-secondary source)
    wrong: '#ef4444',     // red-500 — error/wrong
    warning: '#f97316',   // orange-500
  },
  text: {
    primary: '#f9fafb',   // near-white for dark background
    muted: '#c1c2c5',     // dark.text from main app
    disabled: '#6b7280',  // gray-500
  },
  subjects: {
    english: '#0ea5e9',   // brand primary
    math: '#14b8a6',      // teal — correct/success tone
    science: '#f97316',   // orange — warm accent
    social: '#a855f7',    // purple-500 — secondary accent
  },
  // Raw palette (for one-off use when semantic tokens don't apply)
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const FONTS = {
  display: 'FredokaOne_400Regular', // rounded kids display font
  heading: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
