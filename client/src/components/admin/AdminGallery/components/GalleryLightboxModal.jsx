import React from 'react';
import { X, Edit2 } from 'lucide-react';

export function GalleryLightboxModal({ previewItem, onClose, onEdit }) {
  if (!previewItem) return null;

  return (
    <div className="admin-gallery-lightbox-overlay" onClick={onClose}>
      <div className="admin-gallery-lightbox-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="admin-gallery-lightbox-close"
        >
          <X size={18} />
        </button>

        <img
          src={previewItem.src}
          alt={previewItem.title_en}
          className="admin-gallery-lightbox-img"
        />

        <div className="admin-gallery-lightbox-caption">
          <div className="admin-gallery-lightbox-row">
            <div>
              <h4 className="admin-gallery-lightbox-title">
                {previewItem.title_en}
              </h4>
              <div className="admin-gallery-lightbox-meta">
                {previewItem.category_en} • {previewItem.price} AUD
              </div>
            </div>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={() => {
                const it = previewItem;
                onClose();
                onEdit(it);
              }}
            >
              <Edit2 size={13} />
              <span>Edit Showcase</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GalleryLightboxModal;
