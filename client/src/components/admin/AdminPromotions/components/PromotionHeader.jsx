import React from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

export function PromotionHeader({ livePromoCount, totalCount, onOpenCreate }) {
  return (
    <>
      <div className="admin-card__header">
        <div>
          <h2 className="admin-card__title">
            <ImageIcon size={20} className="text-gold" />
            <span>Holiday & Special Event Pop-up Manager</span>
          </h2>
          <p className="admin-promotions-header-desc">
            Upload holiday promotional posters and set the exact start date (to show) and end date (to auto-hide).
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={onOpenCreate}
        >
          <Upload size={16} />
          <span>Upload New Poster</span>
        </button>
      </div>

      {/* Status explanation banner */}
      <div className={`admin-promo-status-banner ${livePromoCount > 0 ? 'admin-promo-status-banner--active' : ''}`}>
        <div className="admin-promo-status-banner-left">
          <span className={`admin-promo-status-dot ${livePromoCount > 0 ? 'admin-promo-status-dot--active' : ''}`} />
          <span className={`admin-promo-status-text ${livePromoCount > 0 ? 'admin-promo-status-text--active' : ''}`}>
            {livePromoCount > 0
              ? 'ACTIVE'
              : 'NO LIVE POP-UP'}
          </span>
        </div>

        <span className="admin-promo-status-total">
          Total: {totalCount} posters
        </span>
      </div>
    </>
  );
}

export default PromotionHeader;
