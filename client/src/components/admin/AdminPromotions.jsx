import React, { useState, useEffect, useRef } from 'react';
import {
  Tag, Plus, Image as ImageIcon, Sparkles, Check, Trash2,
  Eye, ToggleLeft, ToggleRight, Calendar, AlertCircle, Upload
} from 'lucide-react';

export function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPromo, setPreviewPromo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'HOLIDAY SPECIAL',
    voucher_code: '',
    discount_text: '15% OFF',
    active: true,
    start_date: '',
    end_date: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promotions');
      if (!res.ok) throw new Error('Failed to fetch promotions');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions || []);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      subtitle: '',
      badge: 'HOLIDAY SPECIAL',
      voucher_code: '',
      discount_text: '15% OFF',
      active: true,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: ''
    });
    setSelectedFile(null);
    setPreviewImageUrl('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageUrl(objectUrl);
    }
  };

  const handleSavePromotion = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.voucher_code || !formData.discount_text) {
      alert('Please fill in Title, Voucher Code, and Discount Text.');
      return;
    }

    setIsUploading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('subtitle', formData.subtitle);
      formPayload.append('badge', formData.badge);
      formPayload.append('voucher_code', formData.voucher_code);
      formPayload.append('discount_text', formData.discount_text);
      formPayload.append('active', formData.active);
      formPayload.append('start_date', formData.start_date);
      formPayload.append('end_date', formData.end_date);

      if (selectedFile) {
        formPayload.append('image', selectedFile);
      }

      const res = await fetch('/api/promotions', {
        method: 'POST',
        body: formPayload
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        alert('Failed to save: ' + data.message);
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (promo) => {
    const newActive = !promo.active;
    try {
      const res = await fetch(`/api/promotions/${promo.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive })
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev =>
          prev.map(p => {
            if (p.id === promo.id) return { ...p, active: newActive };
            // If turning on, others become inactive
            return newActive ? { ...p, active: false } : p;
          })
        );
      }
    } catch (err) {
      alert('Error updating active state: ' + err.message);
    }
  };

  const handleDeletePromotion = async (promo) => {
    if (!window.confirm(`Delete promotion campaign "${promo.title}"?`)) return;
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev => prev.filter(p => p.id !== promo.id));
      }
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">
              <Tag size={20} className="text-gold" />
              <span>Seasonal & Holiday Discount Pop-up Campaigns</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Upload festive celebration banners (Tết, Easter, Christmas, Mother's Day) and configure the discount popup shown to website visitors.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Promotion Campaigns Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading campaigns...
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            No promotion campaigns created yet. Click "Create Campaign" to add your first seasonal banner!
          </div>
        ) : (
          <div className="admin-promos-grid">
            {promotions.map((p) => (
              <div key={p.id} className={`admin-promo-card ${p.active ? 'is-active' : ''}`}>
                <div className="admin-promo-card__thumb">
                  <img
                    src={p.image_url || '/images/hero-1.jpg'}
                    alt={p.title}
                    onError={(e) => {
                      e.currentTarget.src = '/images/hero-1.jpg';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#d4af37'
                  }}>
                    {p.badge || 'PROMO'}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: '#d4af37',
                    color: '#000',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800'
                  }}>
                    {p.discount_text}
                  </div>
                </div>

                <div className="admin-promo-card__body">
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '700' }}>
                    {p.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                    {p.subtitle}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px dashed rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    marginTop: 'auto'
                  }}>
                    <span style={{ fontSize: '11px', color: '#d4af37', fontWeight: '600' }}>
                      VOUCHER CODE:
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#fff' }}>
                      {p.voucher_code}
                    </span>
                  </div>
                </div>

                <div className="admin-promo-card__footer">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(p)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: p.active ? '#10b981' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    {p.active ? (
                      <>
                        <ToggleRight size={22} /> POPUP ACTIVE
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={22} /> INACTIVE
                      </>
                    )}
                  </button>

                  <div className="admin-action-btn-group">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => setPreviewPromo(p)}
                      title="Preview Visitor Popup"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn danger"
                      onClick={() => handleDeletePromotion(p)}
                      title="Delete Campaign"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => !isUploading && setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: '700' }}>
                Create Seasonal / Holiday Promotion Campaign
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={isUploading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromotion}>
              {/* Banner Upload Area */}
              <div className="admin-form-group">
                <label>Holiday Banner / Promotion Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(212, 175, 55, 0.4)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#090c13',
                    transition: 'border-color 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {previewImageUrl ? (
                    <div>
                      <img
                        src={previewImageUrl}
                        alt="Preview"
                        style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '12px', color: '#d4af37', marginTop: '8px' }}>
                        Click to change image
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} style={{ color: '#d4af37', margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>
                        Click to browse or drop promotion image
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Lunar New Year Special Glow - 20% OFF"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Offer Subtitle / Description</label>
                <textarea
                  className="admin-form-textarea"
                  rows="2"
                  placeholder="e.g. Ring in the new season with our signature BIAB and gel enhancements. Limited appointments available!"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Voucher Code</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. LUNAR20"
                    value={formData.voucher_code}
                    onChange={(e) => setFormData({ ...formData, voucher_code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Discount Badge Text</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 20% OFF or $15 OFF"
                    value={formData.discount_text}
                    onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Ribbon Header</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. FESTIVE GLOW OFFER"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Valid Until Date</label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ margin: '16px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Activate immediately on landing page (shows pop-up to visitors)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading & Saving...' : 'Save & Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Pop-up Preview Modal */}
      {previewPromo && (
        <div className="seasonal-promo-overlay" onClick={() => setPreviewPromo(null)}>
          <div className="seasonal-promo-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="seasonal-promo-close-btn"
              onClick={() => setPreviewPromo(null)}
            >
              ✕
            </button>

            <div className="seasonal-promo-banner-wrap">
              <img
                src={previewPromo.image_url || '/images/hero-1.jpg'}
                alt={previewPromo.title}
                className="seasonal-promo-banner-img"
                onError={(e) => {
                  e.currentTarget.src = '/images/hero-1.jpg';
                }}
              />
              <div className="seasonal-promo-banner-overlay" />
              <div className="seasonal-promo-badge">
                <Sparkles size={13} className="text-gold" />
                <span>{previewPromo.badge || 'PROMOTION'}</span>
              </div>
              {previewPromo.discount_text && (
                <div className="seasonal-promo-discount-tag">
                  {previewPromo.discount_text}
                </div>
              )}
            </div>

            <div className="seasonal-promo-content">
              <h2 className="seasonal-promo-title">{previewPromo.title}</h2>
              <p className="seasonal-promo-desc">{previewPromo.subtitle}</p>

              <div className="seasonal-promo-code-box">
                <div className="seasonal-promo-code-info">
                  <span className="seasonal-promo-code-label">
                    <Tag size={12} /> PROMO CODE
                  </span>
                  <span className="seasonal-promo-code-val">{previewPromo.voucher_code}</span>
                </div>
                <button type="button" className="seasonal-promo-copy-btn">
                  Copy
                </button>
              </div>

              <div className="seasonal-promo-actions">
                <button
                  type="button"
                  className="seasonal-promo-claim-btn"
                  onClick={() => alert(`Preview mode: Customer clicking this would open the booking modal with code ${previewPromo.voucher_code} prefilled!`)}
                >
                  <span>Claim Offer & Book Appointment</span>
                </button>
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#d4af37', marginTop: '4px' }}>
                  (Preview Mode: Visitor experience representation)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotions;
