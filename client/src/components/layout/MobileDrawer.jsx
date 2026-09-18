import React, { useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { LanguageToggle } from '../ui/LanguageToggle';
import { Button } from '../ui/Button';
import FashionNailsLogo from '../common/FashionNailsLogo';

export function MobileDrawer({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { openBooking } = useBooking();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavClick = (anchorId) => {
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lazy-section-mount', { detail: { id: anchorId } }));
    }
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookClick = () => {
    onClose();
    openBooking();
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-drawer__header">
          <FashionNailsLogo size="sm" showSub={false} />
          <button
            type="button"
            className="mobile-drawer__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mobile-drawer__lang" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Ngôn ngữ / Language:</span>
          <LanguageToggle />
        </div>

        <nav className="mobile-drawer__nav" aria-label="Mobile Navigation">
          <button type="button" onClick={() => handleNavClick('hero')} className="mobile-drawer__link">
            {t('nav.home')}
          </button>
          <button type="button" onClick={() => handleNavClick('services')} className="mobile-drawer__link">
            {t('nav.services')}
          </button>
          <button type="button" onClick={() => handleNavClick('about')} className="mobile-drawer__link">
            {t('nav.about')}
          </button>
          <button type="button" onClick={() => handleNavClick('gallery')} className="mobile-drawer__link">
            {t('nav.gallery')}
          </button>
          <button type="button" onClick={() => handleNavClick('reviews')} className="mobile-drawer__link">
            {t('nav.reviews')}
          </button>
          <button type="button" onClick={() => handleNavClick('faq')} className="mobile-drawer__link">
            {t('nav.faq')}
          </button>
        </nav>

        <div className="mobile-drawer__footer">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleBookClick}
            icon={Calendar}
          >
            {t('nav.bookCta')}
          </Button>
          <div className="mobile-drawer__contact-hint">
            <span>Shop SP094 (Opposite Kmart), Morley Galleria</span>
            <a href="tel:+61893752888" className="mobile-drawer__tel">(08) 9375 2888</a>
          </div>
        </div>
      </div>
    </div>
  );
}
