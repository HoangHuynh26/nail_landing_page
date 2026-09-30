import React from 'react';

export function ServiceFormModal({
  isOpen,
  onClose,
  editingService,
  formData,
  setFormData,
  categories,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h3>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-form-grid-2col">
            <div className="admin-form-group">
              <label>Category</label>
              <select
                className="admin-form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Duration (Minutes)</label>
              <input
                type="number"
                className="admin-form-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Service Name</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Builder Gel - BIAB (Full Set)"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-grid-1-2col">
            <div className="admin-form-group">
              <label>Price ($ AUD)</label>
              <input
                type="number"
                step="1"
                min="0"
                className="admin-form-input"
                placeholder="e.g. 80"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Price Prefix (Optional)</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. From or Extra"
                value={formData.price_prefix}
                onChange={(e) => setFormData({ ...formData, price_prefix: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Description (Optional)</label>
            <textarea
              className="admin-form-textarea"
              rows="3"
              placeholder="Enter service details, technique, or aftercare notes..."
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>

          <div className="admin-form-toggles-row">
            <div
              className="admin-form-toggle-item"
              onClick={() => setFormData({ ...formData, active: !formData.active })}
            >
              <button
                type="button"
                role="switch"
                aria-checked={formData.active}
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData({ ...formData, active: !formData.active });
                }}
                className={`admin-ios-toggle ${formData.active ? 'is-active' : ''}`}
              >
                <span className="admin-ios-toggle__thumb" />
              </button>
              <span className={`admin-form-toggle-label ${formData.active ? 'admin-form-toggle-label--active' : 'admin-form-toggle-label--inactive'}`}>
                {formData.active ? 'Active' : 'Hidden'}
              </span>
            </div>

            <div
              className="admin-form-toggle-item"
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
            >
              <button
                type="button"
                role="switch"
                aria-checked={formData.featured}
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData({ ...formData, featured: !formData.featured });
                }}
                className={`admin-ios-toggle ${formData.featured ? 'is-active' : ''}`}
              >
                <span className="admin-ios-toggle__thumb" />
              </button>
              <span className={`admin-form-toggle-label ${formData.featured ? 'admin-form-toggle-label--featured' : 'admin-form-toggle-label--inactive'}`}>
                {formData.featured ? 'Featured Highlight' : 'Standard'}
              </span>
            </div>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-primary-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceFormModal;
