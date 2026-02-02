import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import cn from './cn.json';
import tw from './tw.json';
import ko from './ko.json';

export const resources = {
  en: {
    translation: en,
  },
  cn: {
    translation: cn,
  },
  tw: {
    translation: tw,
  },
  ko: {
    translation: ko,
  },
} as const;

// Language mapping for better browser detection
const languageMap: Record<string, string> = {
  zh: 'cn', // Chinese -> Simplified Chinese
  'zh-CN': 'cn', // Chinese (China) -> Simplified Chinese
  'zh-Hans': 'cn', // Chinese (Simplified) -> Simplified Chinese
  'zh-TW': 'tw', // Chinese (Taiwan) -> Traditional Chinese
  'zh-HK': 'tw', // Chinese (Hong Kong) -> Traditional Chinese
  'zh-Hant': 'tw', // Chinese (Traditional) -> Traditional Chinese
  ko: 'ko', // Korean -> Korean
  'ko-KR': 'ko', // Korean (South Korea) -> Korean
  en: 'en', // English -> English
  'en-US': 'en', // English (US) -> English
  'en-GB': 'en', // English (UK) -> English
};

// Custom language detector function
const detectLanguage = (): string => {
  // Check localStorage first
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && Object.keys(resources).includes(savedLang)) {
    console.log('Using saved language:', savedLang);
    return savedLang;
  }

  // Check browser languages
  const browserLangs = navigator.languages || [navigator.language];
  console.log('Browser languages:', browserLangs);

  for (const lang of browserLangs) {
    // Direct match
    if (Object.keys(resources).includes(lang)) {
      console.log('Direct language match:', lang);
      return lang;
    }
    // Mapped match
    if (languageMap[lang]) {
      console.log('Mapped language match:', lang, '->', languageMap[lang]);
      return languageMap[lang];
    }
    // Partial match (e.g., 'zh-CN' -> 'zh')
    const shortLang = lang.split('-')[0];
    if (languageMap[shortLang]) {
      console.log(
        'Partial language match:',
        lang,
        '->',
        languageMap[shortLang],
      );
      return languageMap[shortLang];
    }
  }

  console.log('Using fallback language: en');
  return 'en'; // fallback
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: detectLanguage(), // Use our custom detection
    fallbackLng: 'en',
    debug: false,
    resources,
    detection: {
      // Simplified detection order
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
