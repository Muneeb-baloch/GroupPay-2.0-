import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'gp_theme_pref';

export const lightColors = {
  isDark: false,
  statusBar: 'dark-content',
  background: '#f8fffe',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  card: '#ffffff',
  cardBorder: '#f1f5f9',
  cardBorderMedium: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textLight: '#9ca3af',
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  inputText: '#1f2937',
  inputPlaceholder: '#9ca3af',
  headerBg: '#ffffff',
  tabBarBg: '#ffffff',
  tabBarText: '#64748b',
  tabBarTextActive: '#0b7285',
  modalBg: '#ffffff',
  overlay: 'rgba(15, 23, 42, 0.35)',
  divider: '#f1f5f9',
  skeleton: '#e2e8f0',
  skeletonHighlight: '#f1f5f9',
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  primaryLight: '#ecfeff',
  primaryBorder: '#e0f2fe',
  success: '#10b981',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  labelBg: '#f1f5f9',
  labelText: '#475569',
};

export const darkColors = {
  isDark: true,
  statusBar: 'light-content',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#162032',
  card: '#1e293b',
  cardBorder: '#334155',
  cardBorderMedium: '#475569',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textLight: '#475569',
  inputBg: '#1e293b',
  inputBorder: '#334155',
  inputText: '#f1f5f9',
  inputPlaceholder: '#64748b',
  headerBg: '#1e293b',
  tabBarBg: '#1e293b',
  tabBarText: '#64748b',
  tabBarTextActive: '#06b6d4',
  modalBg: '#1e293b',
  overlay: 'rgba(0, 0, 0, 0.65)',
  divider: '#334155',
  skeleton: '#334155',
  skeletonHighlight: '#475569',
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  primaryLight: 'rgba(6, 182, 212, 0.15)',
  primaryBorder: 'rgba(6, 182, 212, 0.25)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#ef4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  labelBg: '#334155',
  labelText: '#94a3b8',
};

const ThemeContext = createContext({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val !== null) {
        setIsDark(val === 'dark');
      }
      setLoaded(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
