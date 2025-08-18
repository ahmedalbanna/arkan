'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Locale = 'en' | 'ar';

interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, any>) => string;
}

const translations: Record<Locale, Record<string, any>> = { en, ar };

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['en', 'ar'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, variables?: Record<string, any>): string => {
    const keys = key.split('.');

    const findTranslation = (localeToTry: Locale): string | undefined => {
      let result: any = translations[localeToTry];
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) return undefined;
      }
      return typeof result === 'string' ? result : undefined;
    };

    // Attempt to find translation, then fallback, finally default to key
    let translated: string = findTranslation(locale) || findTranslation('en') || key;

    // Interpolate variables if provided
    if (variables) {
      Object.keys(variables).forEach((varName) => {
        translated = translated.replace(`{${varName}}`, variables[varName]);
      });
    }

    return translated;
  };

  return (
    <LocalizationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
