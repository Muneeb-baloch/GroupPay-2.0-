// ============================================================
// App Theme Constants
// Single source of truth for all colors, spacing, typography
// ============================================================

export const COLORS = {
  // Primary
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  primaryDarker: '#0e7490',
  primaryLight: '#ecfeff',
  primaryLighter: '#f0fdfa',
  primaryBorder: '#e0f2fe',

  // Status
  success: '#10b981',
  successLight: '#dcfce7',
  successDark: '#166534',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  errorDark: '#991b1b',

  // Neutrals
  white: '#ffffff',
  background: '#f8fffe',
  cardBg: '#ffffff',
  surfaceLight: '#f8fafc',
  border: '#f1f5f9',
  borderMedium: '#e2e8f0',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textLight: '#9ca3af',

  // Accents
  purple: '#8b5cf6',
  blue: '#3b82f6',
  orange: '#f97316',
  pink: '#ec4899',

  // Group colors palette
  groupColors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899', '#f97316'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

export const FONT = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 28,
};

export const SHADOW = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  primary: {
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
};
