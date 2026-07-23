export const COLORS = {
  bg: {
    primary: '#FFFFFF',
    secondary: '#F5F3FF',   // lavender-50
    card: '#FFFFFF',
    cardAlt: '#F9F7FF',
    border: '#E9E5FF',
  },
  brand: {
    primary: '#7C3AED',     // violet-700
    deep: '#6D28D9',        // violet-800 — pressed state
    light: '#EDE9FE',       // violet-100 — tinted backgrounds
    gradient: ['#7C3AED', '#9333EA'] as const,
  },
  semantic: {
    gold: '#F59E0B',
    correct: '#10B981',
    wrong: '#EF4444',
    warning: '#F97316',
  },
  text: {
    primary: '#111827',
    muted: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  subjects: {
    english: '#7C3AED',
    math: '#10B981',
    science: '#F97316',
    social: '#3B82F6',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const FONTS = {
  display: 'Inter_700Bold',
  heading: 'Inter_600SemiBold',
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
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
};
