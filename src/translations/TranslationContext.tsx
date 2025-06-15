'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import enTranslations from './en.json';
import esTranslations from './es.json';

export type TranslationKey = keyof typeof enTranslations;
type TranslationParams = Record<string, string | React.ReactNode>;

interface TranslationContextType {
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  t: (key: TranslationKey, params?: TranslationParams) => React.ReactNode;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  const t = (key: TranslationKey, params?: TranslationParams): React.ReactNode => {
    const translations = language === 'en' ? enTranslations : esTranslations;
    const text = translations[key] as string;

    if (params) {
      const parts = text.split(/(\{[^}]+\})/);
      return parts.map((part, index) => {
        const match = part.match(/\{([^}]+)\}/);
        if (match && params[match[1]]) {
          return <React.Fragment key={index}>{params[match[1]]}</React.Fragment>;
        }
        return part;
      });
    }

    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
