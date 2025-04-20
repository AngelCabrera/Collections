'use client';

import { useTranslation } from "@/translations/TranslationContext";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale);
  };

  return (
    <div>
      <Button
        variant="link"
        onClick={() => handleLanguageChange('en')}
        disabled={locale === 'en'}
      >
        English
      </Button>
      <Button
        variant="link"
        onClick={() => handleLanguageChange('es')}
        disabled={locale === 'es'}
      >
        Español
      </Button>
    </div>
  );
}
