import React, { useState } from 'react';
import { Sparkles, Clock, ArrowRight, Plus, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export function OverviewPromoCard({ activePromo, activePromos = [], setActiveTab }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const promos = (Array.isArray(activePromos) && activePromos.length > 0)
    ? activePromos
    : (activePromo ? [activePromo] : []);

  const total = promos.length;
  // Ensure safe circular index
  const safeIndex = total > 0 ? ((currentIndex % total) + total) % total : 0;
  const currentPromo = total > 0 ? promos[safeIndex] : null;

  const handleNavigate = () => {
    setActiveTab('promotions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <div
      className="admin-card admin-overview-promo-card"
      onClick={handleNavigate}
      title="Click to manage Holiday Pop-up Posters"
    >
      <div className="admin-card__header admin-promo-card-header">
        <div className="admin-promo-card-header-left">
          <h3 className="admin-card__title">
            <Sparkles size={18} className="text-gold" />
            <span>Live Holiday Pop-up {total > 1 ? 'Posters' : 'Poster'}</span>
          </h3>
          {total > 1 && (
            <span className="admin-promo-count-badge">
              <Layers size={11} />
              <span>{total} Active</span>
            </span>
          )}
        </div>

        <div className="admin-promo-card-header-right">
          {total > 1 && (
            <div className="admin-promo-nav-group" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="admin-promo-nav-btn"
                onClick={handlePrev}
                title="Previous active pop-up"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="admin-promo-nav-indicator">
                {safeIndex + 1} / {total}
              </span>
              <button
                type="button"
                className="admin-promo-nav-btn"
                onClick={handleNext}
                title="Next active pop-up"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="admin-secondary-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            <span>Manage</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {currentPromo ? (
        <div className="admin-promo-content-wrap">
          {/* Main Active Banner Card */}
          <div className="admin-promo-live-wrap">
            <div className="admin-promo-img-container">
              <img
                src={currentPromo.image_url}
                alt={currentPromo.title || 'Promotional Poster'}
                className="admin-promo-live-img"
              />
              {total > 1 && (
                <div className="admin-promo-img-badge">
                  #{safeIndex + 1}
                </div>
              )}
            </div>

            <div className="admin-promo-live-info">
              <div className="admin-promo-live-tag">
                🟢 LIVE ON SALON WEBSITE {total > 1 ? `(${safeIndex + 1}/${total})` : ''}
              </div>
              <div className="admin-promo-live-title" title={currentPromo.title}>
                {currentPromo.title || 'Promotional Poster'}
              </div>
              {(currentPromo.start_date || currentPromo.end_date) && (
                <div className="admin-promo-live-dates">
                  <Clock size={12} />
                  <span>
                    {currentPromo.start_date?.split('-').reverse().join('-') || 'Today'} → {currentPromo.end_date?.split('-').reverse().join('-') || 'Indefinite'}
                  </span>
                </div>
              )}
              {currentPromo.voucher_code && (
                <div className="admin-promo-live-voucher">
                  <span>Code: <strong>{currentPromo.voucher_code}</strong></span>
                </div>
              )}
              <div className="admin-promo-live-btn-mobile admin-overview-mobile-only">
                <span>Manage Holiday Pop-up</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Quick switcher thumbnail strip when multiple pop-ups are active */}
          {total > 1 && (
            <div className="admin-promo-switcher-strip" onClick={(e) => e.stopPropagation()}>
              <div className="admin-promo-switcher-label">
                Active Pop-ups ({total}):
              </div>
              <div className="admin-promo-thumbs-row">
                {promos.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    className={`admin-promo-thumb-card ${idx === safeIndex ? 'is-active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Click to preview: ${p.title || `Pop-up #${idx + 1}`}`}
                  >
                    <img
                      src={p.image_url}
                      alt=""
                      className="admin-promo-thumb-mini-img"
                    />
                    <div className="admin-promo-thumb-mini-info">
                      <span className="admin-promo-thumb-mini-title">
                        #{idx + 1} {p.title || 'Pop-up'}
                      </span>
                      <span className="admin-promo-thumb-mini-badge">
                        🟢 Active
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-promo-empty-box">
          <p className="admin-promo-empty-text">
            No promotional pop-up poster is currently running or within active dates.
          </p>
          <button
            type="button"
            className="admin-promo-schedule-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            <Plus size={15} />
            <span>Schedule Holiday Pop-up</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default OverviewPromoCard;
