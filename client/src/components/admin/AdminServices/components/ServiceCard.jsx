import React from 'react';
import { Clock, Check, Edit2, Trash2 } from 'lucide-react';

export function ServiceCard({
  service,
  categories,
  inlinePrice,
  onInlinePriceChange,
  onInlinePriceSave,
  savingPriceId,
  onToggleActive,
  onEdit,
  onDelete
}) {
  const s = service;
  const currentPrice = inlinePrice !== undefined ? inlinePrice : s.price;
  const hasPriceChanged =
    inlinePrice !== undefined &&
    parseFloat(inlinePrice) !== parseFloat(s.price);

  const categoryLabel = categories.find((c) => c.id === s.category)?.label || s.category;

  return (
    <tr
      key={s.id}
      className={`admin-service-row ${s.active ? 'admin-service-row--active' : 'admin-service-row--inactive'}`}
    >
      {/* 1. Main Info Cell (Name, Description, Mobile Header & Mobile Badges) */}
      <td className="admin-service-cell admin-service-cell--name">
        <div className="admin-service-card-top-row">
          <div className="admin-service-name">{s.name_en || s.name_vi}</div>

          {/* Mobile-only Toggle Switch */}
          <div className="admin-service-mobile-status">
            <button
              type="button"
              role="switch"
              aria-checked={s.active}
              onClick={() => onToggleActive(s)}
              className={`admin-ios-toggle ${s.active ? 'is-active' : ''}`}
              title={s.active ? 'Active on website (Click to hide)' : 'Hidden from website (Click to activate)'}
            >
              <span className="admin-ios-toggle__thumb" />
            </button>
            <span className={`admin-service-status-label ${s.active ? 'is-active' : 'is-hidden'}`}>
              {s.active ? 'Active' : 'Hidden'}
            </span>
          </div>
        </div>

        {s.description_en && (
          <div className="admin-service-desc">
            {s.description_en}
          </div>
        )}

        {/* Mobile Badges Row (Category & Duration) */}
        <div className="admin-service-mobile-badges">
          <span className="admin-service-category-tag">
            {categoryLabel}
          </span>
          <span className="admin-service-duration">
            <Clock size={12} /> {s.duration} mins
          </span>
        </div>
      </td>

      {/* 2. Category (Desktop Only) */}
      <td className="admin-service-cell admin-service-cell--category admin-service-desktop-only">
        <span className="admin-service-category-tag">
          {categoryLabel}
        </span>
      </td>

      {/* 3. Duration (Desktop Only) */}
      <td className="admin-service-cell admin-service-cell--duration admin-service-desktop-only">
        <span className="admin-service-duration">
          <Clock size={13} /> {s.duration} mins
        </span>
      </td>

      {/* 4. Live Price Adjuster */}
      <td className="admin-service-cell admin-service-cell--price">
        <div className="admin-service-price-adjuster-wrap">
          <span className="admin-service-mobile-price-label">Price:</span>
          <div className="admin-service-price-adjuster">
            <span className="admin-service-price-prefix">
              {s.price_prefix || s.pricePrefix || '$'}
            </span>
            <input
              type="number"
              step="1"
              min="0"
              value={currentPrice}
              onChange={(e) => onInlinePriceChange(s.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onInlinePriceSave(s.id, currentPrice);
              }}
              className={`admin-service-price-input ${hasPriceChanged ? 'is-changed' : ''}`}
            />
            {hasPriceChanged && (
              <button
                type="button"
                className="admin-icon-btn admin-service-price-save-btn"
                onClick={() => onInlinePriceSave(s.id, currentPrice)}
                disabled={savingPriceId === s.id}
                title="Save new price"
              >
                <Check size={14} />
              </button>
            )}
          </div>
        </div>
      </td>

      {/* 5. Status Toggle (Desktop Only) */}
      <td className="admin-service-cell admin-service-cell--status admin-service-desktop-only">
        <div className="admin-service-status-toggle">
          <button
            type="button"
            role="switch"
            aria-checked={s.active}
            onClick={() => onToggleActive(s)}
            className={`admin-ios-toggle ${s.active ? 'is-active' : ''}`}
            title={s.active ? 'Active on website (Click to hide)' : 'Hidden from website (Click to activate)'}
          >
            <span className="admin-ios-toggle__thumb" />
          </button>
          <span className={`admin-service-status-label ${s.active ? 'is-active' : 'is-hidden'}`}>
            {s.active ? 'Active' : 'Hidden'}
          </span>
        </div>
      </td>

      {/* 6. Action Buttons */}
      <td className="admin-service-cell admin-service-cell--actions">
        <div className="admin-action-btn-group">
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => onEdit(s)}
            title="Edit Service Details"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="admin-icon-btn danger"
            onClick={() => onDelete(s)}
            title="Delete Service"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ServiceCard;
