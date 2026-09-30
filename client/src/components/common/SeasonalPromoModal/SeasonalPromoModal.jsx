import './SeasonalPromoModal.css';
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooking } from '../../../context/BookingContext';
import { useLanguage } from '../../../context/LanguageContext';

export function SeasonalPromoModal() {
  const [promos, setPromos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { openBooking } = useBooking();
  const { language } = useLanguage();
  const touchStartX = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivePromos() {
      try {
        const res = await fetch('/api/promotions/active');
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && (data.promotions?.length > 0 || (data.promotion && data.promotion.image_url))) {
          const list = Array.isArray(data.promotions) && data.promotions.length > 0
            ? data.promotions
            : [data.promotion];

          const today = new Date().toISOString().split('T')[0];

          // Check if customer dismissed all promos today
          const dismissedAllUntil = localStorage.getItem('promo_dismissed_all');
          if (dismissedAllUntil && Date.now() < parseInt(dismissedAllUntil, 10)) {
            return;
          }

          // Filter valid promos by active date & image URL
          const validList = list.filter(p => {
            if (!p || !p.image_url) return false;
            if (p.active === false) return false;
            if (p.start_date && p.start_date > today) return false;
            if (p.end_date && p.end_date < today) return false;

            // Also check individual dismissal
            const dismissedUntil = localStorage.getItem(`promo_dismissed_${p.id}`);
            if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
              return false;
            }
            return true;
          });

          if (validList.length > 0 && isMounted) {
            setPromos(validList);
            setCurrentIndex(0);
            // Gentle popup delay (1.8s) so customer first sees the hero
            const timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, 1800);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.debug('No active promo or network offline:', err.message);
      }
    }

    fetchActivePromos();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen || promos.length <= 1) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % promos.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + promos.length) % promos.length);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, promos.length]);

  if (!isOpen || promos.length === 0) return null;

  const currentPromo = promos[currentIndex] || promos[0];
  if (!currentPromo || !currentPromo.image_url) return null;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % promos.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + promos.length) % promos.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const handleBookNow = () => {
    setIsOpen(false);
    openBooking();
  };

  const handleDismissToday = () => {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    // Dismiss all active promos for 24h
    localStorage.setItem('promo_dismissed_all', String(expiresAt));
    promos.forEach(p => {
      localStorage.setItem(`promo_dismissed_${p.id}`, String(expiresAt));
    });
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

        {/* Counter Pill when multiple posters exist */}
        {promos.length > 1 && (
          <div className="seasonal-promo-counter-pill">
            <span>{currentIndex + 1} / {promos.length}</span>
          </div>
        )}

        {/* Previous Poster Button */}
        {promos.length > 1 && (
          <button
            type="button"
            className="seasonal-promo-nav-btn seasonal-promo-nav-btn--prev"
            onClick={handlePrev}
            aria-label="Previous Promotion"
            title="Previous Promotion"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next Poster Button */}
        {promos.length > 1 && (
          <button
            type="button"
            className="seasonal-promo-nav-btn seasonal-promo-nav-btn--next"
            onClick={handleNext}
            aria-label="Next Promotion"
            title="Next Promotion"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Uploaded Promotion Image / Poster */}
        <div className="seasonal-promo-poster-wrap" onClick={handleBookNow}>
          <img
            key={currentPromo.id || currentIndex}
            src={currentPromo.image_url}
            alt={currentPromo.title || 'Holiday Special Promotion'}
            className="seasonal-promo-poster-img"
          />
        </div>

        {/* Actions Bar */}
        <div className="seasonal-promo-poster-actions">
          {/* Indicator Dots when multiple posters exist */}
          {promos.length > 1 && (
            <div className="seasonal-promo-dots" role="tablist" aria-label="Promotion slides">
              {promos.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  className={`seasonal-promo-dot ${idx === currentIndex ? 'is-active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to promotion ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="seasonal-promo-poster-cta-btn"
            onClick={handleBookNow}
          >
            <Calendar size={18} />
            <span>Book an Appointment</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="seasonal-promo-poster-dismiss-btn"
            onClick={handleDismissToday}
          >
            "Don't show again today"
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeasonalPromoModal;
