import './AdminPromotions.css';
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

// Modular Sub-Components
import PromotionToast from './components/PromotionToast';
import PromotionHeader from './components/PromotionHeader';
import PromotionCard from './components/PromotionCard';
import PromotionUploadModal from './components/PromotionUploadModal';
import PromotionScheduleModal from './components/PromotionScheduleModal';
import PromotionPreviewModal from './components/PromotionPreviewModal';
import PromotionToolbar from './components/PromotionToolbar';

export function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPromo, setPreviewPromo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Edit schedule modal state
  const [editingPromo, setEditingPromo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Form state for creating new poster
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

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

      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/promotions/${editingPromo.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
        showToast('Promotion schedule updated successfully.', 'success');
      } else {
        showToast('Update failed: ' + data.message, 'error');
      }
    } catch (err) {
      showToast('Error updating dates: ' + err.message, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (promo) => {
    const newActive = !promo.active;
    const promoTitle = promo.title || 'Promotional poster';
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/promotions/${promo.id}/toggle`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newActive })
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev =>
          prev.map(p => (p.id === promo.id ? { ...p, active: newActive } : p))
        );
        showToast(
          newActive
            ? `Status updated: Holiday poster "${promoTitle}" is now ACTIVE on website.`
            : `Status updated: Holiday poster "${promoTitle}" is now INACTIVE.`,
          'success'
        );
      } else {
        showToast(data.message || 'Status update failed.', 'error');
      }
    } catch (err) {
      showToast('Status update error: ' + err.message, 'error');
    }
  };

  const handleDeletePromotion = async (promo) => {
    if (!window.confirm(`Are you sure you want to delete promotional image "${promo.title}"?`)) return;
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/promotions/${promo.id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev => prev.filter(p => p.id !== promo.id));
        showToast(`Promotion "${promo.title}" deleted successfully.`, 'success');
      } else {
        showToast(data.message || 'Failed to delete promotion.', 'error');
      }
    } catch (err) {
      showToast('Delete error: ' + err.message, 'error');
    }
  };

  const getPromoScheduleStatus = (p) => {
    if (!p.active) {
      return { status: 'inactive', label: 'INACTIVE', color: '#ffffff', bg: '#475569' };
    }
    const today = new Date().toISOString().split('T')[0];
    if (p.end_date && p.end_date < today) {
      return { status: 'expired', label: 'EXPIRED', color: '#ffffff', bg: '#dc2626' };
    }
    if (p.start_date && p.start_date > today) {
      return { status: 'scheduled', label: 'SCHEDULED', color: '#ffffff', bg: '#d97706' };
    }
    return { status: 'live', label: 'DISPLAYING', color: '#ffffff', bg: '#059669' };
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

  const liveCount = promotions.filter(p => getPromoScheduleStatus(p).status === 'live').length;
  const scheduledCount = promotions.filter(p => getPromoScheduleStatus(p).status === 'scheduled').length;
  const inactiveCount = promotions.filter(p => getPromoScheduleStatus(p).status === 'inactive').length;
  const expiredCount = promotions.filter(p => getPromoScheduleStatus(p).status === 'expired').length;

  const filteredPromotions = promotions.filter((p) => {
    const scheduleStatus = getPromoScheduleStatus(p);
    const matchStatus = statusFilter === 'all' || scheduleStatus.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.start_date && p.start_date.includes(q)) ||
      (p.end_date && p.end_date.includes(q)) ||
      scheduleStatus.label.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.id || 0) - (a.id || 0) || (b.created_at || '').localeCompare(a.created_at || '');
    }
    if (sortBy === 'oldest') {
      return (a.id || 0) - (b.id || 0) || (a.created_at || '').localeCompare(b.created_at || '');
    }
    if (sortBy === 'startDate') {
      return (a.start_date || '9999').localeCompare(b.start_date || '9999');
    }
    if (sortBy === 'endDate') {
      return (a.end_date || '9999').localeCompare(b.end_date || '9999');
    }
    return 0;
  });

  return (
    <div className="admin-promotions-container">
      {/* 1. Notification Toast */}
      <PromotionToast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-card">
        {/* 2. Header & Status Banner */}
        <PromotionHeader
          livePromoCount={liveCount}
          totalCount={promotions.length}
          onOpenCreate={handleOpenCreate}
        />

        {/* 3. Toolbar & Filters */}
        {promotions.length > 0 && (
          <PromotionToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalCount={promotions.length}
            liveCount={liveCount}
            scheduledCount={scheduledCount}
            inactiveCount={inactiveCount}
            expiredCount={expiredCount}
          />
        )}

        {/* 4. Promotions Grid / Empty / Loading State */}
        {loading ? (
          <div className="admin-promo-loading">
            Loading pop-up banners...
          </div>
        ) : promotions.length === 0 ? (
          <div className="admin-promo-empty">
            <ImageIcon size={44} className="admin-promo-empty-icon" />
            <div className="admin-promo-empty-title">
              No pop-up banners uploaded yet
            </div>
            <p className="admin-promo-empty-desc">
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
        ) : sortedPromotions.length === 0 ? (
          <div className="admin-promo-empty admin-promo-filter-empty">
            <ImageIcon size={40} className="admin-promo-empty-icon" />
            <div className="admin-promo-empty-title">
              No promotional posters match your filter
            </div>
            <p className="admin-promo-empty-desc">
              Try adjusting your search terms or clearing the status filter.
            </p>
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSortBy('newest');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="admin-promos-grid">
            {sortedPromotions.map((p) => {
              const scheduleStatus = getPromoScheduleStatus(p);
              return (
                <PromotionCard
                  key={p.id}
                  promo={p}
                  scheduleStatus={scheduleStatus}
                  formatDateDisplay={formatDateDisplay}
                  onPreview={setPreviewPromo}
                  onToggleActive={handleToggleActive}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeletePromotion}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Upload Image Modal */}
      <PromotionUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isUploading={isUploading}
        onSubmit={handleUploadPromotion}
        title={title}
        setTitle={setTitle}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        previewImageUrl={previewImageUrl}
        onFileChange={handleFileChange}
        getFutureDate={getFutureDate}
      />

      {/* 5. Edit Dates Modal */}
      <PromotionScheduleModal
        editingPromo={editingPromo}
        onClose={() => setEditingPromo(null)}
        isSavingEdit={isSavingEdit}
        onSubmit={handleSaveEdit}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editStartDate={editStartDate}
        setEditStartDate={setEditStartDate}
        editEndDate={editEndDate}
        setEditEndDate={setEditEndDate}
        getFutureDate={getFutureDate}
        todayStr={todayStr}
      />

      {/* 6. Visitor Pop-up Preview Modal */}
      <PromotionPreviewModal
        previewPromo={previewPromo}
        onClose={() => setPreviewPromo(null)}
      />
    </div>
  );
}

export default AdminPromotions;
