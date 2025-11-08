
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import React, { useEffect } from 'react';

export default function LanguageDirectionManager({ children }: { children: React.ReactNode }) {
  const { locale } = useLocalization();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';

    if (locale === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [locale]);

  return <>{children}</>;
}
