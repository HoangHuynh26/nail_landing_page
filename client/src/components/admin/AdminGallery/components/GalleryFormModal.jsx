import React, { useRef } from 'react';
import { X, Upload, Trash2, RefreshCw, Check } from 'lucide-react';

export function GalleryFormModal({
  isOpen,
  onClose,
  isSaving,
  editingItem,
  formData,
  setFormData,
  categories,
  services,
  previewImage,
  setPreviewImage,
  selectedFile,
  setSelectedFile,
  onFileChange,
  onSelectLinkedService,
  onSubmit
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="admin-gallery-modal-overlay" onClick={() => !isSaving && onClose()}>
      <div className="admin-gallery-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="admin-gallery-modal-header">
          <div>
            <h3 className="admin-gallery-modal-title">
              {editingItem ? 'Edit Gallery Showcase' : 'Add New Gallery Showcase'}
            </h3>
            <div className="admin-gallery-modal-subtitle">
              Upload HD showcase photo and specify technique details & client highlights.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="admin-gallery-modal-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="admin-gallery-modal-form">
          {/* Image Upload Area */}
          <div>
            <label className="admin-gallery-field-label">
              Showcase HD Photo <span className="admin-gallery-req">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={onFileChange}
              className="admin-gallery-file-input"
            />

            {previewImage ? (
              <div className="admin-gallery-preview-box">
                <img src={previewImage} alt="Preview" className="admin-gallery-preview-img" />
                <div className="admin-gallery-preview-info">
                  <div className="admin-gallery-preview-name">
                    {selectedFile ? selectedFile.name : (editingItem ? 'Current Showcase Photo' : 'Selected Photo')}
                  </div>
                  <div className="admin-gallery-preview-desc">
                    Image ready to display on the 3D showcase carousel and high-definition lightbox.
                  </div>
                  <div className="admin-gallery-preview-actions">
                    <button
                      type="button"
                      className="admin-primary-btn admin-gallery-preview-btn-change"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      <span>Change Photo</span>
                    </button>
                    <button
                      type="button"
                      className="admin-secondary-btn admin-gallery-btn-remove"
                      onClick={() => { setSelectedFile(null); setPreviewImage(''); }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-gallery-dropzone" onClick={() => fileInputRef.current?.click()}>
                <Upload size={38} className="admin-gallery-dropzone-icon" />
                <div className="admin-gallery-dropzone-title">
                  Click to upload an HD nail photo
                </div>
                <div className="admin-gallery-dropzone-sub">
                  Select photo from your computer (JPG, PNG, WEBP up to 15MB)
                </div>
              </div>
            )}
          </div>

          {/* Showcase Title */}
          <div>
            <label className="admin-gallery-field-label">
              Showcase Title <span className="admin-gallery-req">*</span>
            </label>
            <input
              type="text"
              required
              className="admin-gallery-input"
              placeholder="e.g. Classic BIAB Almond with Micro-French Smile Lines"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            />
          </div>

          {/* Category & Service Linking */}
          <div className="admin-gallery-grid-2col">
            <div>
              <label className="admin-gallery-field-label">
                Art Category <span className="admin-gallery-req">*</span>
              </label>
              <select
                className="admin-gallery-select"
                value={formData.categoryKey}
                onChange={(e) => {
                  const k = e.target.value;
                  const cat = categories.find((c) => c.key === k);
                  setFormData((prev) => ({
                    ...prev,
                    categoryKey: k,
                    category_en: cat ? cat.label : prev.category_en,
                    category_vi: cat ? (cat.label_vi || cat.label) : prev.category_vi
                  }));
                }}
              >
                {categories.filter((c) => c.key !== 'all').map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-gallery-field-label">Link Salon Service (Optional)</label>
              <select
                className="admin-gallery-select"
                value={formData.serviceId}
                onChange={onSelectLinkedService}
              >
                <option value="">-- No specific linked service --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en} (${s.price} AUD)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nail Shape, Price, Duration */}
          <div className="admin-gallery-grid-3col">
            <div>
              <label className="admin-gallery-field-label">Nail Shape</label>
              <input
                type="text"
                className="admin-gallery-input"
                placeholder="e.g. Slim Almond, Coffin, Oval"
                value={formData.shape_en}
                onChange={(e) => setFormData({ ...formData, shape_en: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-gallery-field-label">Price (AUD)</label>
              <input
                type="text"
                className="admin-gallery-input"
                placeholder="e.g. $60 or From $75"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-gallery-field-label">Duration</label>
              <input
                type="text"
                className="admin-gallery-input"
                placeholder="e.g. 55 mins"
                value={formData.duration_en}
                onChange={(e) => setFormData({ ...formData, duration_en: e.target.value })}
              />
            </div>
          </div>

          {/* Technique Details */}
          <div>
            <label className="admin-gallery-field-label">Technique & Artistry Details</label>
            <input
              type="text"
              className="admin-gallery-input"
              placeholder="e.g. BIAB apex reinforcement + Razor-sharp French smile line + high-gloss gel top"
              value={formData.technique_en}
              onChange={(e) => setFormData({ ...formData, technique_en: e.target.value })}
            />
          </div>

          {/* Highlights & Tags */}
          <div>
            <div className="admin-gallery-highlights-header">
              <label className="admin-gallery-field-label">
                Showcase Highlights & Feature Tags (Comma-separated)
              </label>
              <span className="admin-gallery-highlights-hint">Separated by commas</span>
            </div>
            <div className="admin-gallery-field-hint">
              Enter key selling points. Each tag will appear as a luxury highlight badge on the showcase card.
            </div>
            <textarea
              rows={3}
              className="admin-gallery-textarea"
              placeholder="e.g. 100% natural nail protection, 4+ weeks durability, Flawless apex sculpting, High-gloss mirror shine"
              value={formData.highlights_en}
              onChange={(e) => setFormData({ ...formData, highlights_en: e.target.value })}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="admin-gallery-field-label">Full Description</label>
            <textarea
              rows={4}
              className="admin-gallery-textarea"
              placeholder="Describe the aesthetic inspiration, materials used, technique, and client styling recommendations..."
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>

          {/* Visibility & Sort Order */}
          <div className="admin-gallery-sort-row">
            <div className="admin-gallery-sort-left">
              <input
                type="checkbox"
                id="gallery-active-toggle"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="admin-gallery-checkbox"
              />
              <label htmlFor="gallery-active-toggle" className="admin-gallery-checkbox-label">
                Publish to Website Landing Page Immediately
              </label>
            </div>

            <div className="admin-gallery-sort-right">
              <label className="admin-gallery-sort-label">Sort Order:</label>
              <input
                type="number"
                className="admin-gallery-sort-input"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 1 })}
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="admin-gallery-modal-actions">
            <button
              type="button"
              className="admin-secondary-btn admin-gallery-modal-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-btn admin-gallery-modal-btn-submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="admin-spin" />
                  <span>Saving Showcase...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{editingItem ? 'Save Changes' : 'Publish Showcase'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GalleryFormModal;
