import React, { useState, useEffect } from 'react';
import { Calendar, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

export function MobileStickyCTA() {
  const { t } = useLanguage();
  const { openBooking, isBookingOpen } = useBooking();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA when scrolled past 380px and booking modal is closed
      const shouldShow = window.scrollY > 380 && !isBookingOpen;
      setIsVisible(shouldShow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBookingOpen]);

  if (!isVisible || isBookingOpen) return null;

  return (
    <aside className="mobile-sticky-cta" aria-label="Quick Booking Bar">
      <div className="mobile-sticky-cta__inner">
        <a
          href="tel:+61893752888"
          className="mobile-sticky-cta__call"
          aria-label="Call salon directly at (08) 9375 2888"
        >
          <Phone size={18} />
        </a>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => openBooking()}
          icon={Calendar}
          className="mobile-sticky-cta__btn"
        >
          {t('nav.bookCta')}
        </Button>
      </div>
    </aside>
  );
}
