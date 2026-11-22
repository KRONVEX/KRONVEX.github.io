import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { LOCALE_OPTIONS, type LocaleCode, type TranslationSchema } from './types';
import { en } from './locales/en';

const STORAGE_KEY = 'kronvex-locale';

const localeCache: Partial<Record<LocaleCode, TranslationSchema>> = {
  en,
};

async function loadLocale(code: LocaleCode): Promise<TranslationSchema> {
  if (localeCache[code]) return localeCache[code]!;
  let dict: TranslationSchema;
  switch (code) {
    case 'ar':
      dict = (await import('./locales/ar')).ar;
      break;
    case 'fr':
      dict = (await import('./locales/fr')).fr;
      break;
    case 'es':
      dict = (await import('./locales/es')).es;
      break;
    case 'de':
      dict = (await import('./locales/de')).de;
      break;
    case 'zh-CN':
      dict = (await import('./locales/zh-CN')).zhCN;
      break;
    default:
      dict = en;
  }
  localeCache[code] = dict;
  return dict;
}

interface I18nContextValue {
  locale: LocaleCode;
  dir: 'ltr' | 'rtl';
  t: TranslationSchema;
  loading: boolean;
  setLocale: (code: LocaleCode) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  dir: 'ltr',
  t: en,
  loading: false,
  setLocale: () => {},
});

function getInitialLocale(): LocaleCode {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
  if (saved && LOCALE_OPTIONS.some((o) => o.code === saved)) return saved;
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);
  const [dict, setDict] = useState<TranslationSchema>(() => localeCache[getInitialLocale()] || en);
  const [loading, setLoading] = useState<boolean>(false);

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  useEffect(() => {
    let active = true;
    if (localeCache[locale]) {
      setDict(localeCache[locale]!);
      return;
    }
    setLoading(true);
    loadLocale(locale)
      .then((loaded) => {
        if (active) setDict(loaded);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, dir, t: dict, loading, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
