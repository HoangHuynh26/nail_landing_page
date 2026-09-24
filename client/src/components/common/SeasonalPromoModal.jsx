import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';

export function SeasonalPromoModal() {
  const [promo, setPromo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { openBooking } = useBooking();
  const { language } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    async function fetchActivePromo() {
      try {
        const res = await fetch('/api/promotions/active');
        if (!res.ok) return;
        const data = await res.json();

        // ONLY show popup if an active promotion exists with an uploaded image from admin
        if (data.success && data.hasActivePromotion && data.promotion && data.promotion.image_url) {
          const p = data.promotion;
          const dismissedUntil = localStorage.getItem(`promo_dismissed_${p.id}`);

          // If customer dismissed within the last 24 hours, don't show
          if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
            return;
          }

          if (isMounted) {
            setPromo(p);
            // Gentle popup delay (1.8s) so customer first sees the hero
            const timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, 1800);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        // Silently catch network errors
        console.debug('No active promo or network offline:', err.message);
      }
    }

    fetchActivePromo();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen || !promo || !promo.image_url) return null;

  const handleBookNow = () => {
    setIsOpen(false);
    openBooking();
  };

  const handleDismissToday = () => {
    // Dismiss for 24 hours
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`promo_dismissed_${promo.id}`, String(expiresAt));
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="seasonal-promo-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Promotion Announcement"
    >
      <div
        className="seasonal-promo-poster-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          className="seasonal-promo-poster-close-btn"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Uploaded Promotion Image / Poster */}
        <div className="seasonal-promo-poster-wrap" onClick={handleBookNow} style={{ cursor: 'pointer' }}>
          <img
            src={promo.image_url}
            alt={promo.title || 'Holiday Special Promotion'}
            className="seasonal-promo-poster-img"
          />
        </div>

        {/* Actions Bar */}
        <div className="seasonal-promo-poster-actions">
          <button
            type="button"
            className="seasonal-promo-poster-cta-btn"
            onClick={handleBookNow}
          >
            <Calendar size={18} />
            <span>{language === 'vi' ? 'Đặt Lịch Ngay' : 'Book an Appointment'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="seasonal-promo-poster-dismiss-btn"
            onClick={handleDismissToday}
          >
            {language === 'vi' ? 'Không hiển thị lại hôm nay' : "Don't show again today"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeasonalPromoModal;
