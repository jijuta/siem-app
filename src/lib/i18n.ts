import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from '../../public/locales/ko/common.json';
import en from '../../public/locales/en/common.json';
import ja from '../../public/locales/ja/common.json';
import zh from '../../public/locales/zh/common.json';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
};

// Get saved language from localStorage or use default
const getSavedLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18n-language') || 'ko';
  }
  return 'ko';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(), // Use saved language or default to Korean
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language to localStorage when it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18n-language', lng);
  }
});

export default i18n;