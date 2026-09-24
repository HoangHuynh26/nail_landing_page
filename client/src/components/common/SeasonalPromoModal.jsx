import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Calendar, ArrowRight, Tag } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';

export function SeasonalPromoModal() {
  const [promo, setPromo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { openBooking } = useBooking();
  const { language } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    async function fetchActivePromo() {
      try {
        const res = await fetch('/api/promotions/active');
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.hasActivePromotion && data.promotion) {
          const p = data.promotion;
          const dismissedUntil = localStorage.getItem(`promo_dismissed_${p.id}`);

          // If dismissed within the last 24 hours, don't show
          if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
            return;
          }

          if (isMounted) {
            setPromo(p);
            // Graceful popup delay so user isn't immediately bombarded upon initial paint
            const timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, 1800);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        // Silently catch network or offline errors
        console.debug('No active promo or network offline:', err.message);
      }
    }

    fetchActivePromo();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen || !promo) return null;

  const handleCopyCode = () => {
    if (promo.voucher_code) {
      navigator.clipboard.writeText(promo.voucher_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClaimOffer = () => {
    handleCopyCode();
    setIsOpen(false);
    // Open the booking modal with the voucher prefilled
    openBooking(null, { voucher: promo.voucher_code });
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
      aria-labelledby="promo-title"
    >
      <div
        className="seasonal-promo-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="seasonal-promo-close-btn"
          onClick={handleClose}
          aria-label="Close promotion dialog"
        >
          <X size={18} />
        </button>

        {/* Promotion Banner Visual */}
        <div className="seasonal-promo-banner-wrap">
          <img
            src={promo.image_url || '/images/hero-1.jpg'}
            alt={promo.title}
            className="seasonal-promo-banner-img"
            onError={(e) => {
              e.currentTarget.src = '/images/hero-1.jpg';
            }}
          />
          <div className="seasonal-promo-banner-overlay" />
          
          {/* Badge */}
          <div className="seasonal-promo-badge">
            <Sparkles size={13} className="text-gold" />
            <span>{promo.badge || 'SPECIAL CELEBRATION'}</span>
          </div>

          {/* Discount Pill */}
          {promo.discount_text && (
            <div className="seasonal-promo-discount-tag">
              {promo.discount_text}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="seasonal-promo-content">
          <h2 id="promo-title" className="seasonal-promo-title">
            {promo.title}
          </h2>

          <p className="seasonal-promo-desc">
            {promo.subtitle || 'Celebrate the festive season with our signature nail artistry at exclusive promotional prices.'}
          </p>

          {/* Voucher Code Box */}
          {promo.voucher_code && (
            <div className="seasonal-promo-code-box">
              <div className="seasonal-promo-code-info">
                <span className="seasonal-promo-code-label">
                  <Tag size={12} /> PROMO CODE
                </span>
                <span className="seasonal-promo-code-val">{promo.voucher_code}</span>
              </div>
              <button
                type="button"
                className={`seasonal-promo-copy-btn ${copied ? 'is-copied' : ''}`}
                onClick={handleCopyCode}
                title="Copy voucher code"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
          )}

          {/* CTA Actions */}
          <div className="seasonal-promo-actions">
            <button
              type="button"
              className="seasonal-promo-claim-btn"
              onClick={handleClaimOffer}
            >
              <span>{language === 'vi' ? 'Nhận Ưu Đãi & Đặt Lịch Ngay' : 'Claim Offer & Book Appointment'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="seasonal-promo-dismiss-btn"
              onClick={handleDismissToday}
            >
              {language === 'vi' ? 'Không hiển thị lại hôm nay' : "Don't show again today"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeasonalPromoModal;
