import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Apple-inspired Segmented Control for Dual Language Switching [ VI | EN ]
 * Full accessibility: role="tablist", aria-selected, keyboard ArrowLeft / ArrowRight support
 */
export function LanguageSwitch({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  const handleKeyDown = (e, targetLang) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const newLang = language === 'vi' ? 'en' : 'vi';
      setLanguage(newLang);
    }
  };

  return (
    <div
      className={`segmented-lang-switch ${className}`.trim()}
      role="tablist"
      aria-label="Language selection"
    >
      <button
        id="lang-btn-vi"
        type="button"
        role="tab"
        aria-selected={language === 'vi'}
        aria-controls="content-vi"
        tabIndex={language === 'vi' ? 0 : -1}
        className={`segmented-lang-switch__btn ${language === 'vi' ? 'is-active' : ''}`}
        onClick={() => setLanguage('vi')}
        onKeyDown={(e) => handleKeyDown(e, 'vi')}
      >
        <span>VI</span>
      </button>

      <button
        id="lang-btn-en"
        type="button"
        role="tab"
        aria-selected={language === 'en'}
        aria-controls="content-en"
        tabIndex={language === 'en' ? 0 : -1}
        className={`segmented-lang-switch__btn ${language === 'en' ? 'is-active' : ''}`}
        onClick={() => setLanguage('en')}
        onKeyDown={(e) => handleKeyDown(e, 'en')}
      >
        <span>EN</span>
      </button>

      {/* Sliding active pill indicator */}
      <div
        className="segmented-lang-switch__indicator"
        style={{
          transform: language === 'en' ? 'translateX(100%)' : 'translateX(0%)'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
