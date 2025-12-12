"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

type Locale = 'zh-CN' | 'en-US';
type Translations = typeof zhCN;

// Helper to access nested keys like "settings.title"
function getNested(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || path;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh-CN'); // Default to zh-CN as per request context
  const [translations, setTranslations] = useState<Translations>(zhCN);

  useEffect(() => {
    // Load saved locale from localStorage if available
    const savedLocale = localStorage.getItem('app_locale') as Locale;
    if (savedLocale && (savedLocale === 'zh-CN' || savedLocale === 'en-US')) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    setTranslations(locale === 'zh-CN' ? zhCN : enUS);
    localStorage.setItem('app_locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string) => {
    return getNested(translations, key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
