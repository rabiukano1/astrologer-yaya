import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import { translations, type Locale } from '@/constants/translations';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

function loadSavedLocale(): Locale {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('astrologer-locale');
      if (val === 'en' || val === 'ar' || val === 'ha') return val;
    }
  } catch {}
  return 'ar';
}

function saveLocale(locale: Locale) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('astrologer-locale', locale);
    }
  } catch {}
}

function applyRTL(locale: Locale) {
  if (Platform.OS === 'web') return;
  const shouldBeRTL = locale === 'ar';
  I18nManager.forceRTL(shouldBeRTL);
  I18nManager.allowRTL(shouldBeRTL);
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ar',
  setLocale: () => {},
  t: (key: string) => key,
  isRTL: true,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadSavedLocale);

  const handleSetLocale = (l: Locale) => {
    setLocaleState(l);
    saveLocale(l);
    applyRTL(l);
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] ?? translations.en[key] ?? key;
  };

  useEffect(() => {
    applyRTL(locale);
  }, [locale]);

  const isRTL = locale === 'ar';

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
