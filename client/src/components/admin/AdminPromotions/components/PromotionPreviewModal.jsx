import React from 'react';
import { Calendar } from 'lucide-react';

export function PromotionPreviewModal({ previewPromo, onClose }) {
  if (!previewPromo) return null;

  return (
    <div className="seasonal-promo-overlay" onClick={onClose}>
      <div className="seasonal-promo-poster-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="seasonal-promo-poster-close-btn"
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>

        <div className="seasonal-promo-poster-wrap">
          <img
            src={previewPromo.image_url}
            alt={previewPromo.title}
            className="seasonal-promo-poster-img"
          />
        </div>

        <div className="seasonal-promo-poster-actions">
          <button
            type="button"
            className="seasonal-promo-poster-cta-btn"
            onClick={() => alert('Preview Mode: Clicking this button on the website opens the Appointment Booking form.')}
          >
            <Calendar size={18} />
            <span>Book an Appointment</span>
          </button>

          <button
            type="button"
            className="seasonal-promo-poster-dismiss-btn"
            onClick={onClose}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromotionPreviewModal;
