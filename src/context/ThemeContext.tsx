import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { darkColors, lightColors, type ThemeColors } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveMode: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = '@theme_preference';

function isThemeMode(v: string | null): v is ThemeMode {
  return v === 'light' || v === 'dark' || v === 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');

  const getSystemMode = (): 'light' | 'dark' =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(getSystemMode);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (isThemeMode(stored)) setModeState(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    localStorage.setItem(THEME_KEY, nextMode);
  }, []);

  const effectiveMode = mode === 'system' ? systemMode : mode;

  useEffect(() => {
    const html = document.documentElement;
    if (effectiveMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [effectiveMode]);

  const colors = effectiveMode === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, effectiveMode, colors, isDark: effectiveMode === 'dark' }),
    [mode, setMode, effectiveMode, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
