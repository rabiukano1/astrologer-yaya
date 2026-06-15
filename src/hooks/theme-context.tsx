import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  userTheme: ThemeMode;
  setUserTheme: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}

function loadSavedTheme(): ThemeMode {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('astrologer-theme');
      if (val === 'light' || val === 'dark' || val === 'system') return val;
    }
  } catch {}
  return 'system';
}

function saveTheme(mode: ThemeMode) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('astrologer-theme', mode);
    }
  } catch {}
}

function useSystemTheme(): 'light' | 'dark' {
  const scheme = useColorScheme();
  const [sys, setSys] = useState<'light' | 'dark'>(
    scheme === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSys(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (scheme === 'dark' || scheme === 'light') setSys(scheme);
  }, [scheme]);

  return sys;
}

const ThemeContext = createContext<ThemeContextValue>({
  userTheme: 'system',
  setUserTheme: () => {},
  resolvedTheme: 'dark',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [userTheme, setUserTheme] = useState<ThemeMode>(loadSavedTheme);
  const systemTheme = useSystemTheme();

  const handleSetTheme = (mode: ThemeMode) => {
    setUserTheme(mode);
    saveTheme(mode);
  };

  const resolvedTheme: 'light' | 'dark' =
    userTheme === 'system' ? systemTheme : userTheme;

  return (
    <ThemeContext.Provider value={{ userTheme, setUserTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
