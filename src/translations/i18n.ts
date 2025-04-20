import en from './en.json';
import es from './es.json';

const translations = {
  en,
  es,
};

export const getTranslations = (locale: string) => {
  return translations[locale as keyof typeof translations] || translations.en;
};
