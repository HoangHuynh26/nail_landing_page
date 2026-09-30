import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export function PromotionScheduleModal({
  editingPromo,
  onClose,
  isSavingEdit,
  onSubmit,
  editTitle,
  setEditTitle,
  editStartDate,
  setEditStartDate,
  editEndDate,
  setEditEndDate,
  getFutureDate,
  todayStr
}) {
  if (!editingPromo) return null;

  return (
    <div className="admin-modal-overlay" onClick={() => !isSavingEdit && onClose()}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-promo-modal-header">
          <h3 className="admin-promo-modal-title">
            Edit Pop-up Schedule & Dates
          </h3>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={onClose}
            disabled={isSavingEdit}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-form-group">
            <label>Promotion Title</label>
            <input
              type="text"
              className="admin-form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          <div className="admin-promo-date-grid">
            <div className="admin-form-group">
              <label className="admin-promo-date-label">
                <Calendar size={14} className="text-gold" />
                <span>Start Date (Show Pop-up)</span>
              </label>
              <input
                type="date"
                className="admin-form-input"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
              />
              <div className="admin-promo-date-help">
                Leave blank to show immediately.
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-promo-date-label">
                <Clock size={14} className="text-gold" />
                <span>End Date (Auto-hide)</span>
              </label>
              <input
                type="date"
                className="admin-form-input"
                value={editEndDate}
                min={editStartDate}
                onChange={(e) => setEditEndDate(e.target.value)}
              />
              <div className="admin-promo-date-help">
                Leave blank for no expiration.
              </div>
            </div>
          </div>

          <div className="admin-promo-presets-row">
            <span className="admin-promo-presets-label">Quick Adjust:</span>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEditEndDate(getFutureDate(7, editStartDate || todayStr))}
            >
              +7 Days
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEditEndDate(getFutureDate(14, editStartDate || todayStr))}
            >
              +14 Days
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEditEndDate(getFutureDate(30, editStartDate || todayStr))}
            >
              +30 Days
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEditEndDate('')}
            >
              Clear End Date
            </button>
          </div>

          <div className="admin-promo-modal-footer">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={onClose}
              disabled={isSavingEdit}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-primary-btn"
              disabled={isSavingEdit}
            >
              {isSavingEdit ? 'Saving Dates...' : 'Update Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PromotionScheduleModal;
