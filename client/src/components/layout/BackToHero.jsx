import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function BackToHero() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const indicatorRef = useRef(null);

  // Radius = 19, Circumference ≈ 119.38
  const radius = 19;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      const offset = circumference - (progress / 100) * circumference;

      // Direct GPU/DOM update without triggering React Virtual DOM reconciliation
      if (indicatorRef.current) {
        indicatorRef.current.style.strokeDashoffset = `${offset}`;
      }

      const shouldShow = scrollY > 380;
      if (shouldShow !== isVisibleRef.current) {
        isVisibleRef.current = shouldShow;
        setIsVisible(shouldShow);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateScrollProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [circumference]);

  const scrollToHero = (e) => {
    e?.preventDefault?.();
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tooltipText = t('backToHero.tooltip') || 'Back to Hero Section';
  const ariaLabelText = t('backToHero.ariaLabel') || 'Scroll back to Hero section';
  const labelText = t('backToHero.label') || 'Back to Hero';

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
          {/* Active Gold Progress Track with Direct Hardware Rendering */}
          <circle
            ref={indicatorRef}
            className="back-to-hero__indicator"
            cx="24"
            cy="24"
            r={radius}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
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
