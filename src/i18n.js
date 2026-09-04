import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import gu from './locales/gu.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import pa from './locales/pa.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  gu: { translation: gu },
  ta: { translation: ta },
  kn: { translation: kn },
  mr: { translation: mr },
  bn: { translation: bn },
  pa: { translation: pa },
};

const savedLang = localStorage.getItem('bovine_lang') || localStorage.getItem('bovine_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;
