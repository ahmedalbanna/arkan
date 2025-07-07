'use client';

import { useLocalization } from '@/context/LocalizationContext';
import React, { useEffect } from 'react';

export default function LanguageDirectionManager({ children }: { children: React.ReactNode }) {
  const { locale } = useLocalization();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return <>{children}</>;
}
