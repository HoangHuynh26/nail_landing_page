import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon, Plus, Eye, Trash2, ToggleLeft, ToggleRight,
  Upload, Sparkles, Check, AlertCircle, Calendar, Clock, Edit3
} from 'lucide-react';

export function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPromo, setPreviewPromo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit schedule modal state
  const [editingPromo, setEditingPromo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Form state for creating new poster
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const getFutureDate = (days, baseDate = todayStr) => {
    const d = new Date(baseDate || todayStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

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
    setStartDate(todayStr);
    setEndDate(getFutureDate(14)); // Default 14 days campaign
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

    if (startDate && endDate && startDate > endDate) {
      alert('End date cannot be earlier than start date!');
      return;
    }

    setIsUploading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', title.trim() || 'Holiday Special');
      formPayload.append('active', 'true');
      formPayload.append('start_date', startDate || '');
      formPayload.append('end_date', endDate || '');

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

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setEditTitle(promo.title || '');
    setEditStartDate(promo.start_date || '');
    setEditEndDate(promo.end_date || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPromo) return;

    if (editStartDate && editEndDate && editStartDate > editEndDate) {
      alert('End date cannot be earlier than start date!');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/promotions/${editingPromo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          start_date: editStartDate,
          end_date: editEndDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev =>
          prev.map(p => (p.id === editingPromo.id ? { ...p, title: editTitle.trim(), start_date: editStartDate, end_date: editEndDate } : p))
        );
        setEditingPromo(null);
      } else {
        alert('Update failed: ' + data.message);
      }
    } catch (err) {
      alert('Error updating dates: ' + err.message);
    } finally {
      setIsSavingEdit(false);
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

  const getPromoScheduleStatus = (p) => {
    if (!p.active) {
      return { status: 'inactive', label: 'INACTIVE', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' };
    }
    const today = new Date().toISOString().split('T')[0];
    if (p.end_date && p.end_date < today) {
      return { status: 'expired', label: 'EXPIRED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    }
    if (p.start_date && p.start_date > today) {
      return { status: 'scheduled', label: 'SCHEDULED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    }
    return { status: 'live', label: 'LIVE POP-UP NOW', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  const formatDateDisplay = (isoStr) => {
    if (!isoStr) return null;
    try {
      const [year, month, day] = isoStr.split('-');
      if (!year || !month || !day) return isoStr;
      return `${day}/${month}/${year}`;
    } catch {
      return isoStr;
    }
  };

  const livePromoCount = promotions.filter(p => {
    const s = getPromoScheduleStatus(p);
    return s.status === 'live';
  }).length;

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
              Upload holiday promotional posters and set the exact start date (to show) and end date (to auto-hide).
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

        {/* Status explanation banner */}
        <div style={{
          padding: '12px 16px',
          background: livePromoCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
          border: livePromoCount > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
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
              background: livePromoCount > 0 ? '#10b981' : '#64748b'
            }} />
            <span style={{ color: livePromoCount > 0 ? '#34d399' : '#94a3b8' }}>
              {livePromoCount > 0
                ? 'ACTIVE: Website visitors will see the scheduled promotional pop-up poster.'
                : 'NO LIVE POP-UP: No pop-up poster is currently running or within active dates.'}
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
              Click the button below to upload a holiday promotion flyer or discount poster from your device and schedule its display dates.
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
            {promotions.map((p) => {
              const scheduleStatus = getPromoScheduleStatus(p);
              return (
                <div key={p.id} className={`admin-promo-card ${scheduleStatus.status === 'live' ? 'is-active' : ''}`}>
                  {/* Poster Preview Thumb */}
                  <div
                    className="admin-promo-card__thumb"
                    style={{ height: '230px', background: '#080a0f', cursor: 'pointer', position: 'relative' }}
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
                      background: 'rgba(0,0,0,0.75)',
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

                    {/* Status badge pinned on card top left */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: scheduleStatus.bg,
                      color: scheduleStatus.color,
                      border: `1px solid ${scheduleStatus.color}40`,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {scheduleStatus.label}
                    </div>
                  </div>

                  <div className="admin-promo-card__body" style={{ padding: '14px 16px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </h3>

                    {/* Schedule Date Display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}>
                      <Calendar size={13} style={{ color: '#d4af37', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.start_date || p.end_date ? (
                          <>
                            <span style={{ color: '#94a3b8' }}>Show:</span> <strong>{formatDateDisplay(p.start_date) || 'Immediate'}</strong>
                            <span style={{ color: '#64748b', margin: '0 5px' }}>→</span>
                            <span style={{ color: '#94a3b8' }}>Hide:</span> <strong>{formatDateDisplay(p.end_date) || 'Indefinite'}</strong>
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>No dates set (Shows continuously)</span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
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
                          <ToggleRight size={24} /> ACTIVE
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={24} /> PAUSED
                        </>
                      )}
                    </button>

                    <div className="admin-action-btn-group">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit Display & Auto-hide Dates"
                      >
                        <Edit3 size={15} />
                      </button>
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
              );
            })}
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

              {/* Schedule Dates: Start Date & End Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} className="text-gold" />
                    <span>Start Date (Show Pop-up / Ngày hiện hình)</span>
                  </label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Pop-up starts appearing from 00:00 on this day.
                  </div>
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} className="text-gold" />
                    <span>End Date (Auto-hide / Ngày tắt đi)</span>
                  </label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Pop-up automatically stops after 23:59 on this day.
                  </div>
                </div>
              </div>

              {/* Quick schedule preset buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quick Presets:</span>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEndDate(getFutureDate(7, startDate))}
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEndDate(getFutureDate(14, startDate))}
                >
                  +14 Days (2 Weeks)
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEndDate(getFutureDate(30, startDate))}
                >
                  +30 Days (1 Month)
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEndDate('')}
                >
                  No Expiry
                </button>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(212, 175, 55, 0.08)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#cbd5e1',
                lineHeight: '1.5'
              }}>
                ✨ Pop-up will display to visitors between <strong>{startDate || 'Today'}</strong> and <strong>{endDate || 'indefinitely'}</strong>.
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
                  {isUploading ? 'Uploading Poster...' : 'Upload & Schedule Pop-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dates Modal */}
      {editingPromo && (
        <div className="admin-modal-overlay" onClick={() => !isSavingEdit && setEditingPromo(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: '700' }}>
                Edit Pop-up Schedule & Dates
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setEditingPromo(null)}
                disabled={isSavingEdit}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} className="text-gold" />
                    <span>Start Date (Show Pop-up)</span>
                  </label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Leave blank to show immediately.
                  </div>
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Leave blank for no expiration.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quick Adjust:</span>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEditEndDate(getFutureDate(7, editStartDate || todayStr))}
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEditEndDate(getFutureDate(14, editStartDate || todayStr))}
                >
                  +14 Days
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEditEndDate(getFutureDate(30, editStartDate || todayStr))}
                >
                  +30 Days
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setEditEndDate('')}
                >
                  Clear End Date
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setEditingPromo(null)}
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
