import React, { createContext, useContext, useEffect } from 'react';
import en from '../i18n/en.json';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const language = 'en';

  useEffect(() => {
    try {
      localStorage.setItem('atelier_lumiere_lang', 'en');
      document.documentElement.lang = 'en';
    } catch {
      // ignore
    }
  }, []);

  /**
   * Helper to retrieve nested keys e.g. t('hero.titleLine1') from en.json
   */
  const t = (path) => {
    const keys = path.split('.');
    let current = en;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return path;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

