'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslations } from './i18n';

interface TranslationContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const LOCAL_STORAGE_LOCALE_KEY = 'app_locale';

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState('en'); // Default to English
  const translations = getTranslations(locale);

  useEffect(() => {
    // Check local storage first
    const savedLocale = localStorage.getItem(LOCAL_STORAGE_LOCALE_KEY);
    if (savedLocale) {
      setLocaleState(savedLocale);
    } else if (typeof navigator !== 'undefined') {
      // Detect browser language if no saved locale
      const browserLanguage = navigator.language.split('-')[0];
      const supportedLocales = Object.keys(translations);
      if (supportedLocales.includes(browserLanguage)) {
        setLocaleState(browserLanguage);
      }
    }
  }, []); // Run only once on mount

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCAL_STORAGE_LOCALE_KEY, newLocale);
  };

  const t = (key: string) => {
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
