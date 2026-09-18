import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageToggle({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  const handleToggle = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="switch"
      aria-checked={language === 'en'}
      aria-label="Toggle language between Vietnamese and English"
      tabIndex={0}
      className={`lang-toggle-switch ${language === 'en' ? 'is-en' : 'is-vi'} ${className}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      title={language === 'vi' ? 'Chuyển sang English' : 'Switch to Tiếng Việt'}
    >
      {/* Sliding Pill Thumb */}
      <span className="lang-toggle-thumb" aria-hidden="true" />

      {/* Label Options */}
      <span className={`lang-toggle-label ${language === 'vi' ? 'is-active' : ''}`}>
        VI
      </span>
      <span className={`lang-toggle-label ${language === 'en' ? 'is-active' : ''}`}>
        EN
      </span>
    </div>
  );
}

export default LanguageToggle;
