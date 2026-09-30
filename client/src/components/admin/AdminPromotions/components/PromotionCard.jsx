import React from 'react';
import { Calendar, Edit3, Eye, Trash2 } from 'lucide-react';

export function PromotionCard({
  promo,
  scheduleStatus,
  formatDateDisplay,
  onPreview,
  onToggleActive,
  onEdit,
  onDelete
}) {
  return (
    <div className={`admin-promo-card ${scheduleStatus.status === 'live' ? 'is-active' : ''}`}>
      {/* Poster Preview Thumb */}
      <div
        className="admin-promo-card__thumb"
        onClick={() => onPreview(promo)}
        title="Click to zoom in"
      >
        <img
          src={promo.image_url}
          alt={promo.title}
        />

        {/* Status badge pinned on card top left */}
        <div
          className="admin-promo-card__status-pill"
          data-status={scheduleStatus.status}
        >
          {scheduleStatus.status === 'live' && (
            <span className="admin-promo-card__status-dot" />
          )}
          {scheduleStatus.label}
        </div>
      </div>

      <div className="admin-promo-card__body">
        <h3 className="admin-promo-card__title">
          {promo.title}
        </h3>

        {/* Schedule Date Display */}
        <div className="admin-promo-card__dates-box">
          <Calendar size={13} className="admin-promo-card__dates-icon" />
          <div className="admin-promo-card__dates-text">
            {promo.start_date || promo.end_date ? (
              <>
                <span className="admin-promo-card__date-label">Show:</span> <strong>{formatDateDisplay(promo.start_date) || 'Immediate'}</strong>
                <span className="admin-promo-card__date-arrow">→</span>
                <span className="admin-promo-card__date-label">Hide:</span> <strong>{formatDateDisplay(promo.end_date) || 'Indefinite'}</strong>
              </>
            ) : (
              <span className="admin-promo-card__date-label">No dates set (Shows continuously)</span>
            )}
          </div>
        </div>

        <div className="admin-promo-card__upload-date">
          Uploaded: {promo.created_at ? new Date(promo.created_at).toLocaleDateString('en-AU') : ''}
        </div>
      </div>

      <div className="admin-promo-card__footer">
        <div className="admin-promo-card__footer-toggle">
          <button
            type="button"
            role="switch"
            aria-checked={promo.active}
            onClick={() => onToggleActive(promo)}
            className={`admin-ios-toggle ${promo.active ? 'is-active' : ''}`}
            title={promo.active ? 'Active on website (Click to pause)' : 'Paused (Click to activate)'}
          >
            <span className="admin-ios-toggle__thumb" />
          </button>
          <span className={`admin-promo-card__toggle-label ${promo.active ? 'admin-promo-card__toggle-label--active' : ''}`}>
            {promo.active ? 'Active' : 'Paused'}
          </span>
        </div>

        <div className="admin-action-btn-group">
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => onEdit(promo)}
            title="Edit Display & Auto-hide Dates"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => onPreview(promo)}
            title="Preview visitor pop-up"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="admin-icon-btn danger"
            onClick={() => onDelete(promo)}
            title="Delete image"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromotionCard;
