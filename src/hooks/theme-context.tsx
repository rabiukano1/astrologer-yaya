import { createContext, useContext, useState, type ReactNode } from 'react';

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

const ThemeContext = createContext<ThemeContextValue>({
  userTheme: 'system',
  setUserTheme: () => {},
  resolvedTheme: 'dark',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [userTheme, setUserTheme] = useState<ThemeMode>(loadSavedTheme);

  const handleSetTheme = (mode: ThemeMode) => {
    setUserTheme(mode);
    saveTheme(mode);
  };

  const resolvedTheme = userTheme === 'system' ? 'dark' : userTheme;

  return (
    <ThemeContext.Provider value={{ userTheme, setUserTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
