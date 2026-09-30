import React, { useRef } from 'react';
import { Upload, Calendar, Clock } from 'lucide-react';

export function PromotionUploadModal({
  isOpen,
  onClose,
  isUploading,
  onSubmit,
  title,
  setTitle,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  previewImageUrl,
  onFileChange,
  getFutureDate
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={() => !isUploading && onClose()}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-promo-modal-header">
          <h3 className="admin-promo-modal-title">
            Upload Holiday / Discount Pop-up Poster
          </h3>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={onClose}
            disabled={isUploading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {/* Image Picker Dropzone */}
          <div className="admin-form-group">
            <label>Select image file from device</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="admin-promo-dropzone"
            >
              {previewImageUrl ? (
                <div>
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="admin-promo-dropzone-preview-img"
                  />
                  <div className="admin-promo-dropzone-change-text">
                    Click to choose a different image
                  </div>
                </div>
              ) : (
                <div>
                  <Upload size={38} className="admin-promo-dropzone-icon" />
                  <div className="admin-promo-dropzone-prompt">
                    Click or drag to select an image from your device
                  </div>
                  <div className="admin-promo-dropzone-subtext">
                    Supports JPG, PNG, WEBP 
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="admin-promo-hidden-input"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Promotion Title / Holiday Occasion</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Easter Special 2026, Lunar New Year, Mother's Day..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Schedule Dates: Start Date & End Date */}
          <div className="admin-promo-date-grid">
            <div className="admin-form-group">
              <label className="admin-promo-date-label">
                <Calendar size={14} className="text-gold" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                className="admin-form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-promo-date-label">
                <Clock size={14} className="text-gold" />
                <span>End Date</span>
              </label>
              <input
                type="date"
                className="admin-form-input"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Quick schedule preset buttons */}
          <div className="admin-promo-presets-row">
            <span className="admin-promo-presets-label">Quick Presets:</span>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEndDate(getFutureDate(7, startDate))}
            >
              +7 Days
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEndDate(getFutureDate(14, startDate))}
            >
              +14 Days (2 Weeks)
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEndDate(getFutureDate(30, startDate))}
            >
              +30 Days (1 Month)
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-promo-preset-btn"
              onClick={() => setEndDate('')}
            >
              No Expiry
            </button>
          </div>

          <div className="admin-promo-schedule-note">
            ✨ Pop-up will display between <strong>{startDate?.split('-').reverse().join('-') || 'Today'}</strong> and <strong>{endDate?.split('-').reverse().join('-') || 'indefinitely'}</strong>
          </div>

          <div className="admin-promo-modal-footer">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-primary-btn"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading Poster...' : 'Upload & Schedule Pop-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PromotionUploadModal;
