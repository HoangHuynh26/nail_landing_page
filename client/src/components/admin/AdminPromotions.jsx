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
      alert('Vui lòng chọn hình ảnh poster / banner khuyến mãi để tải lên!');
      return;
    }

    setIsUploading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', title.trim() || 'Ưu Đãi Lễ Hội');
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
        alert('Tải lên thất bại: ' + data.message);
      }
    } catch (err) {
      alert('Lỗi kết nối upload: ' + err.message);
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
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleDeletePromotion = async (promo) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hình ảnh khuyến mãi "${promo.title}"?`)) return;
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev => prev.filter(p => p.id !== promo.id));
      }
    } catch (err) {
      alert('Lỗi xóa: ' + err.message);
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
              <span>Quản Lý Hình Ảnh Pop-up Giảm Giá / Mùa Lễ</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Khi tới dịp lễ, Tết hoặc chương trình tri ân, tải lên hình ảnh poster giảm giá tại đây. Khách vào trang web sẽ tự động nhìn thấy hình ảnh poster này bật lên dạng Pop-up.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleOpenCreate}
          >
            <Upload size={16} />
            <span>Tải Lên Hình Ảnh Mới</span>
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
                ? 'Đang BẬT: Khách hàng truy cập website sẽ thấy hình ảnh pop-up khuyến mãi.'
                : 'Đang TẮT: Không có hình ảnh pop-up nào hiển thị cho khách hàng.'}
            </span>
          </div>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Tổng cộng: {promotions.length} hình ảnh
          </span>
        </div>

        {/* Promotions Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Đang tải danh sách hình ảnh...
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
              Chưa có hình ảnh pop-up nào được tải lên
            </div>
            <p style={{ fontSize: '13px', margin: '6px auto 18px', maxWidth: '420px' }}>
              Nhấn nút bên dưới để chọn hình ảnh poster hoặc flyer giảm giá nhân dịp lễ từ máy tính của bạn.
            </p>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleOpenCreate}
            >
              <Upload size={16} />
              <span>Tải Lên Hình Ảnh Ngay</span>
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
                  title="Bấm để xem ảnh phóng to"
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
                    <Eye size={12} /> Bấm xem thử
                  </div>
                </div>

                <div className="admin-promo-card__body" style={{ padding: '14px 16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '700' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Ngày tải lên: {p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : ''}
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
                        <ToggleRight size={24} /> ĐANG BẬT POP-UP
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={24} /> ĐANG TẮT
                      </>
                    )}
                  </button>

                  <div className="admin-action-btn-group">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => setPreviewPromo(p)}
                      title="Xem trước Pop-up khách hàng nhìn thấy"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn danger"
                      onClick={() => handleDeletePromotion(p)}
                      title="Xóa hình ảnh"
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
                Tải Lên Hình Ảnh Pop-up Giảm Giá / Dịp Lễ
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
                <label>Chọn file hình ảnh từ thiết bị (Poster / Flyer)</label>
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
                        Bấm để chọn hình ảnh khác
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={38} style={{ color: '#d4af37', margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>
                        Bấm vào đây để chọn hình ảnh từ máy tính
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                        Hỗ trợ ảnh JPG, PNG, WEBP (Tự động canh chỉnh vừa vặn màn hình)
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
                <label>Tên dịp lễ / Mô tả (để bạn dễ nhớ)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Ví dụ: Giảm giá Tết Âm Lịch 2026, Giáng Sinh, Easter..."
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
                ✨ Sau khi tải lên thành công, hình ảnh này sẽ được tự động kích hoạt làm Pop-up cho khách khi truy cập website salon.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={isUploading}
                >
                  {isUploading ? 'Đang Tải Ảnh Lên...' : 'Tải Lên & Bật Pop-up'}
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
              title="Đóng"
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
                onClick={() => alert('Chế độ xem trước: Khách hàng bấm nút này sẽ mở form Đặt Lịch Hẹn!')}
              >
                <Calendar size={18} />
                <span>Đặt Lịch Ngay / Book an Appointment</span>
              </button>

              <button
                type="button"
                className="seasonal-promo-poster-dismiss-btn"
                onClick={() => setPreviewPromo(null)}
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotions;
