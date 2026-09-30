import React from 'react';
import { Clock, Tag, Edit2, Trash2 } from 'lucide-react';

export function GalleryCard({
  item,
  onPreview,
  onToggleActive,
  onEdit,
  onDelete
}) {
  const isItemActive = item.active !== false;

  return (
    <div className={`admin-gallery-card ${isItemActive ? 'is-active' : ''}`}>
      {/* Photo Container */}
      <div
        className="admin-gallery-photo-box"
        onClick={() => onPreview(item)}
        title="Click to view full HD photo"
      >
        <img
          src={item.src}
          alt={item.title_en}
          className="admin-gallery-img"
          loading="lazy"
        />

        {/* Top Overlay Badges */}
        <div className="admin-gallery-top-badges">
          <span className="admin-gallery-cat-badge">{item.categoryKey?.toUpperCase()}</span>
          <span className={`admin-gallery-live-badge ${isItemActive ? 'is-live' : 'is-hidden'}`}>
            {isItemActive ? 'Live' : 'Hidden'}
          </span>
        </div>

        {/* Bottom Price & Duration Badge */}
        <div className="admin-gallery-bottom-badges">
          <span className="admin-gallery-price-badge">
            {item.price?.includes('$') ? item.price : `$${item.price}`} AUD
          </span>
          {item.duration_en && (
            <span className="admin-gallery-dur-badge">
              <Clock size={11} /> {item.duration_en}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="admin-gallery-card-body">
        <h4 className="admin-gallery-card-title">
          {item.title_en}
        </h4>

        {item.title_vi && item.title_vi !== item.title_en && (
          <div className="admin-gallery-card-sub">
            {item.title_vi}
          </div>
        )}

        {item.shape_en && (
          <div className="admin-gallery-card-shape">
            <Tag size={12} className="text-gold" />
            <span>Shape:</span> {item.shape_en}
          </div>
        )}

        {item.technique_en && (
          <p className="admin-gallery-card-technique">
            {item.technique_en}
          </p>
        )}

        {/* Highlights tags */}
        {Array.isArray(item.highlights_en) && item.highlights_en.length > 0 && (
          <div className="admin-gallery-highlights-wrap">
            {item.highlights_en.slice(0, 2).map((h, i) => (
              <span key={i} className="admin-gallery-highlight-tag">✓ {h}</span>
            ))}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="admin-gallery-card-footer">
          {/* Publish / Hide Toggle */}
          <div className="admin-gallery-toggle-wrap">
            <button
              type="button"
              className={`admin-ios-toggle ${isItemActive ? 'is-active' : ''}`}
              onClick={(e) => onToggleActive(item, e)}
              title={isItemActive ? 'Click to hide from customer landing page' : 'Click to publish on landing page'}
            >
              <span className="admin-ios-toggle__thumb" />
            </button>
            <span className={`admin-gallery-toggle-status ${isItemActive ? 'is-live' : ''}`}>
              {isItemActive ? 'ACTIVE' : 'HIDDEN'}
            </span>
          </div>

          {/* Edit & Delete Action Buttons */}
          <div className="admin-gallery-card-actions">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="admin-gallery-btn-edit"
              title="Edit showcase details"
            >
              <Edit2 size={13} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              className="admin-gallery-btn-delete"
              title="Delete showcase"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GalleryCard;
