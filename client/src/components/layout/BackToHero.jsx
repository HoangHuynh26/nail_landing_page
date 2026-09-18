import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function BackToHero() {
  const { language, t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const calculateScroll = useCallback(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

    setScrollProgress(progress);
    setIsVisible(scrollY > 380);
  }, []);

  useEffect(() => {
    calculateScroll();
    window.addEventListener('scroll', calculateScroll, { passive: true });
    window.addEventListener('resize', calculateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', calculateScroll);
      window.removeEventListener('resize', calculateScroll);
    };
  }, [calculateScroll]);

  const scrollToHero = (e) => {
    e?.preventDefault?.();
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tooltipText = t('backToHero.tooltip') || (language === 'vi' ? 'Trở về đầu trang (Hero)' : 'Back to Hero Section');
  const ariaLabelText = t('backToHero.ariaLabel') || (language === 'vi' ? 'Cuộn trở về phần Hero' : 'Scroll back to Hero section');
  const labelText = t('backToHero.label') || (language === 'vi' ? 'Về Hero' : 'Back to Hero');

  // Radius = 19, Circumference ≈ 119.38
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`back-to-hero-container ${isVisible ? 'back-to-hero--visible' : 'back-to-hero--hidden'}`}
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        id="back-to-hero-btn"
        className="back-to-hero-btn"
        onClick={scrollToHero}
        aria-label={ariaLabelText}
        title={tooltipText}
        tabIndex={isVisible ? 0 : -1}
      >
        {/* Circular SVG Scroll Progress Indicator */}
        <svg
          className="back-to-hero__svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          {/* Subtle Background Track */}
          <circle
            className="back-to-hero__track"
            cx="24"
            cy="24"
            r={radius}
            strokeWidth="2.5"
            fill="none"
          />
          {/* Active Gold Progress Track */}
          <circle
            className="back-to-hero__indicator"
            cx="24"
            cy="24"
            r={radius}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Arrow Icon */}
        <span className="back-to-hero__icon-wrapper">
          <ArrowUp size={20} className="back-to-hero__icon" />
        </span>

        {/* Floating Tooltip / Label */}
        <span className="back-to-hero__tooltip" role="tooltip">
          {labelText}
        </span>
      </button>
    </div>
  );
}

export default BackToHero;
