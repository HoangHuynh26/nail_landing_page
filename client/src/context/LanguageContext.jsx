import React, { createContext, useContext, useState, useEffect } from 'react';
import vi from '../i18n/vi.json';
import en from '../i18n/en.json';

const translations = { vi, en };

const LanguageContext = createContext({
  language: 'vi',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('atelier_lumiere_lang');
      return saved === 'en' ? 'en' : 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = (lang) => {
    const validLang = lang === 'en' ? 'en' : 'vi';
    setLanguageState(validLang);
    try {
      localStorage.setItem('atelier_lumiere_lang', validLang);
      document.documentElement.lang = validLang;
    } catch (err) {
      console.warn('Unable to persist language preference', err);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Helper to retrieve nested keys e.g. t('hero.titleLine1')
   */
  const t = (path) => {
    const keys = path.split('.');
    let current = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to Vietnamese if not found
        let fallback = translations.vi;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
