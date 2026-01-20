'server-only';

import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { cookies } from 'next/headers';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

export async function getTranslator() {
  const cookieStore = await cookies();
  const lng = cookieStore.get('locale')?.value || 'en';

  const i18n = createInstance();
  await i18n
    .use(initReactI18next)
    .init({
      supportedLngs: ['en', 'ar'],
      fallbackLng: 'en',
      lng,
      resources,
    });
  
  return i18n.t;
}
