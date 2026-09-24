import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon, Plus, Eye, Trash2, ToggleLeft, ToggleRight,
  Upload, Sparkles, Check, AlertCircle, Calendar
} from 'lucide-react';

export function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPromo, setPreviewPromo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state - Image & Title only!
  const [title, setTitle] = useState('');
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
    setTitle('');
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
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUploadPromotion = async (e) => {
    e.preventDefault();
    if (!selectedFile && !previewImageUrl) {
      alert('Please select a promotional poster or banner image to upload!');
      return;
    }

    setIsUploading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', title.trim() || 'Holiday Special');
      formPayload.append('active', 'true'); // Automatically activate newly uploaded promo

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
        alert('Upload failed: ' + data.message);
      }
    } catch (err) {
      alert('Upload connection error: ' + err.message);
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
            // If turning on, other popups turn off
            return newActive ? { ...p, active: false } : p;
          })
        );
      }
    } catch (err) {
      alert('Status update error: ' + err.message);
    }
  };

  const handleDeletePromotion = async (promo) => {
    if (!window.confirm(`Are you sure you want to delete promotional image "${promo.title}"?`)) return;
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev => prev.filter(p => p.id !== promo.id));
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  const activePromoCount = promotions.filter(p => p.active).length;

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">
              <ImageIcon size={20} className="text-gold" />
              <span>Holiday & Special Event Pop-up Manager</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Upload holiday discount posters or special event flyers here. Visitors to your salon website will automatically see your active poster as an announcement pop-up.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleOpenCreate}
          >
            <Upload size={16} />
            <span>Upload New Poster</span>
          </button>
        </div>

        {/* Status explanation pill */}
        <div style={{
          padding: '12px 16px',
          background: activePromoCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
          border: activePromoCount > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: activePromoCount > 0 ? '#10b981' : '#64748b'
            }} />
            <span style={{ color: activePromoCount > 0 ? '#34d399' : '#94a3b8' }}>
              {activePromoCount > 0
                ? 'ACTIVE: Website visitors will see this promotional pop-up banner.'
                : 'INACTIVE: No pop-up banner is currently displayed to visitors.'}
            </span>
          </div>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Total: {promotions.length} posters
          </span>
        </div>

        {/* Promotions Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading pop-up banners...
          </div>
        ) : promotions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '56px 20px',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#64748b'
          }}>
            <ImageIcon size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', color: '#fff', fontWeight: '600' }}>
              No pop-up banners uploaded yet
            </div>
            <p style={{ fontSize: '13px', margin: '6px auto 18px', maxWidth: '420px' }}>
              Click the button below to upload a holiday promotion flyer or discount poster from your device.
            </p>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleOpenCreate}
            >
              <Upload size={16} />
              <span>Upload Poster Now</span>
            </button>
          </div>
        ) : (
          <div className="admin-promos-grid">
            {promotions.map((p) => (
              <div key={p.id} className={`admin-promo-card ${p.active ? 'is-active' : ''}`}>
                {/* Poster Preview Thumb */}
                <div
                  className="admin-promo-card__thumb"
                  style={{ height: '230px', background: '#080a0f', cursor: 'pointer' }}
                  onClick={() => setPreviewPromo(p)}
                  title="Click to zoom in"
                >
                  <img
                    src={p.image_url}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Eye size={12} /> Preview
                  </div>
                </div>

                <div className="admin-promo-card__body" style={{ padding: '14px 16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '700' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Uploaded: {p.created_at ? new Date(p.created_at).toLocaleDateString('en-AU') : ''}
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
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}
                  >
                    {p.active ? (
                      <>
                        <ToggleRight size={24} /> ACTIVE POP-UP
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={24} /> INACTIVE
                      </>
                    )}
                  </button>

                  <div className="admin-action-btn-group">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => setPreviewPromo(p)}
                      title="Preview visitor pop-up"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn danger"
                      onClick={() => handleDeletePromotion(p)}
                      title="Delete image"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Image Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => !isUploading && setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: '700' }}>
                Upload Holiday / Discount Pop-up Poster
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

            <form onSubmit={handleUploadPromotion}>
              {/* Image Picker Dropzone */}
              <div className="admin-form-group">
                <label>Select image file from device (Poster / Flyer)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(212, 175, 55, 0.45)',
                    borderRadius: '14px',
                    padding: '24px 16px',
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
                        style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '13px', color: '#d4af37', marginTop: '10px', fontWeight: '600' }}>
                        Click to choose a different image
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={38} style={{ color: '#d4af37', margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>
                        Click or drag to select an image from your device
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                        Supports JPG, PNG, WEBP (auto-fits display modal nicely)
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
                <label>Promotion Title / Holiday Occasion</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Easter Special 2026, Lunar New Year, Mother's Day..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(212, 175, 55, 0.08)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#cbd5e1',
                lineHeight: '1.5'
              }}>
                ✨ Once uploaded, this poster will automatically be activated as the live pop-up for salon website visitors.
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
                  {isUploading ? 'Uploading Poster...' : 'Upload & Activate Pop-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Pop-up Preview Modal */}
      {previewPromo && (
        <div className="seasonal-promo-overlay" onClick={() => setPreviewPromo(null)}>
          <div className="seasonal-promo-poster-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="seasonal-promo-poster-close-btn"
              onClick={() => setPreviewPromo(null)}
              title="Close"
            >
              ✕
            </button>

            <div className="seasonal-promo-poster-wrap">
              <img
                src={previewPromo.image_url}
                alt={previewPromo.title}
                className="seasonal-promo-poster-img"
              />
            </div>

            <div className="seasonal-promo-poster-actions">
              <button
                type="button"
                className="seasonal-promo-poster-cta-btn"
                onClick={() => alert('Preview Mode: Clicking this button on the website opens the Appointment Booking form.')}
              >
                <Calendar size={18} />
                <span>Book an Appointment</span>
              </button>

              <button
                type="button"
                className="seasonal-promo-poster-dismiss-btn"
                onClick={() => setPreviewPromo(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotions;
