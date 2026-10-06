import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import './AdminGallery.css';

// Modular Sub-Components
import GalleryToast from './components/GalleryToast';
import GalleryStatsCards from './components/GalleryStatsCards';
import GalleryCategoryBar from './components/GalleryCategoryBar';
import GalleryCategoryModals from './components/GalleryCategoryModals';
import GalleryToolbar from './components/GalleryToolbar';
import GalleryCard from './components/GalleryCard';
import GalleryFormModal from './components/GalleryFormModal';
import GalleryLightboxModal from './components/GalleryLightboxModal';
import GalleryDeleteModal from './components/GalleryDeleteModal';

const DEFAULT_GALLERY_CATEGORIES = [
  { key: 'all', label: 'All Categories' },
  { key: 'biab', label: 'Natural & BIAB' },
  { key: 'luxury', label: 'Luxury Crystals' },
  { key: '3d-art', label: '3D Sculpting & Art' },
  { key: 'pedicure', label: 'Deluxe Pedicure' }
];

const getInitialGalleryCategories = () => {
  try {
    const saved = localStorage.getItem('atelier_gallery_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c) => ({
          key: c.key,
          label: c.label || c.name || c.key,
          custom: c.custom
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse gallery categories from localStorage', e);
  }
  return DEFAULT_GALLERY_CATEGORIES;
};

export function AdminGallery() {
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(getInitialGalleryCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden'

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Art Category Management Modals
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [editingCatKey, setEditingCatKey] = useState('');
  const [editingCatLabel, setEditingCatLabel] = useState('');

  const saveGalleryCategoriesState = (newCategories) => {
    setCategories(newCategories);
    try {
      localStorage.setItem('atelier_gallery_categories', JSON.stringify(newCategories));
    } catch (e) {
      console.warn('Failed to save gallery categories to localStorage', e);
    }
  };

  const handleOpenAddCategory = () => {
    setNewCatLabel('');
    setIsAddCatModalOpen(true);
  };

  const handleSaveAddCategory = (e) => {
    e.preventDefault();
    const trimmedEn = newCatLabel.trim();
    if (!trimmedEn) {
      alert('Please enter an art category name.');
      return;
    }
    const slug = trimmedEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `art_${Date.now()}`;

    if (categories.some((c) => c.key === slug || c.label.toLowerCase() === trimmedEn.toLowerCase())) {
      alert('An art category with this name or key already exists.');
      return;
    }

    const newCat = {
      key: slug,
      label: trimmedEn,
      custom: true
    };
    const updated = [...categories, newCat];
    saveGalleryCategoriesState(updated);
    setSelectedCategory(slug);
    setIsAddCatModalOpen(false);
    showToast(`Art category "${trimmedEn}" created successfully!`, 'success');
  };

  const handleOpenEditCategory = (targetCat) => {
    const catToEdit =
      targetCat && targetCat.key !== 'all'
        ? targetCat
        : categories.find((c) => c.key === selectedCategory && c.key !== 'all') ||
          categories.find((c) => c.key !== 'all');

    if (!catToEdit) return;
    setEditingCatKey(catToEdit.key);
    setEditingCatLabel(catToEdit.label);
    setIsEditCatModalOpen(true);
  };

  const handleSaveEditCategory = (e) => {
    e.preventDefault();
    const trimmedEn = editingCatLabel.trim();
    if (!trimmedEn) {
      alert('Please enter an art category name.');
      return;
    }

    const updated = categories.map((c) =>
      c.key === editingCatKey
        ? {
            ...c,
            label: trimmedEn
          }
        : c
    );
    saveGalleryCategoriesState(updated);
    setIsEditCatModalOpen(false);
    showToast(`Art category updated to "${trimmedEn}"!`, 'success');
  };

  const handleDeleteCategory = (catKey) => {
    const target = categories.find((c) => c.key === catKey);
    if (!target) return;
    const catName = target.label || target.name || catKey;

    if (!window.confirm(`Are you sure you want to delete the category ${catName}?`)) return;

    const updated = categories.filter((c) => c.key !== catKey);
    saveGalleryCategoriesState(updated);
    if (selectedCategory === catKey) {
      setSelectedCategory('all');
    }
    setIsEditCatModalOpen(false);
    showToast(`Category "${catName}" was deleted successfully.`, 'success');
  };

  // Lightbox Preview Modal
  const [previewItem, setPreviewItem] = useState(null);

  // Delete Confirmation Modal
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    categoryKey: 'biab',
    title_en: '',
    category_en: 'Builder Gel - BIAB',
    serviceId: '',
    serviceName_en: '',
    shape_en: 'Slim Almond',
    duration_en: '55 mins',
    price: '$60',
    technique_en: '',
    description_en: '',
    highlights_en: '',
    active: true,
    sort_order: 1
  });

  // Fetch gallery items
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch gallery items');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      showToast('Error loading gallery items: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch services for linking dropdown
  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.services)) {
          setServices(data.services);
        }
      }
    } catch (err) {
      console.warn('Failed to load services for gallery linking:', err);
    }
  };

  useEffect(() => {
    fetchGallery();
    fetchServices();
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.categoryKey === selectedCategory;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.active !== false) ||
      (statusFilter === 'hidden' && item.active === false);

    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.title_en?.toLowerCase().includes(q) ||
      item.title_vi?.toLowerCase().includes(q) ||
      item.technique_en?.toLowerCase().includes(q) ||
      item.technique_vi?.toLowerCase().includes(q) ||
      item.category_en?.toLowerCase().includes(q) ||
      item.shape_en?.toLowerCase().includes(q) ||
      item.price?.toLowerCase().includes(q);

    return matchCategory && matchStatus && matchQuery;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setSelectedFile(null);
    setPreviewImage('');
    setFormData({
      id: '',
      categoryKey: selectedCategory !== 'all' ? selectedCategory : 'biab',
      title_en: '',
      category_en: categories.find((c) => c.key === (selectedCategory !== 'all' ? selectedCategory : 'biab'))?.label || 'Builder Gel - BIAB',
      serviceId: '',
      serviceName_en: '',
      shape_en: 'Slim Almond',
      duration_en: '55 mins',
      price: '$60',
      technique_en: '',
      description_en: '',
      highlights_en: '',
      active: true,
      sort_order: items.length + 1
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setSelectedFile(null);
    setPreviewImage(item.src || '');
    setFormData({
      id: item.id,
      categoryKey: item.categoryKey || 'biab',
      title_en: item.title_en || '',
      category_en: item.category_en || 'Builder Gel - BIAB',
      serviceId: item.serviceId || '',
      serviceName_en: item.serviceName_en || '',
      shape_en: item.shape_en || 'Slim Almond',
      duration_en: item.duration_en || '55 mins',
      price: item.price || '$60',
      technique_en: item.technique_en || '',
      description_en: item.description_en || '',
      highlights_en: Array.isArray(item.highlights_en) ? item.highlights_en.join(', ') : (item.highlights_en || ''),
      active: item.active !== false,
      sort_order: item.sort_order || 1
    });
    setIsModalOpen(true);
  };

  // Handle service select in form
  const handleSelectLinkedService = (e) => {
    const sId = e.target.value;
    if (!sId) {
      setFormData((prev) => ({
        ...prev,
        serviceId: '',
        serviceName_en: ''
      }));
      return;
    }
    const serv = services.find((s) => s.id === sId);
    if (serv) {
      setFormData((prev) => ({
        ...prev,
        serviceId: serv.id,
        serviceName_en: serv.name_en || '',
        price: `$${serv.price}`
      }));
    }
  };

  // Handle file picker change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      if (!formData.title_en) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFormData((prev) => ({
          ...prev,
          title_en: cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
        }));
      }
    }
  };

  // Toggle active status
  const handleToggleActive = async (item, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/gallery/${item.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, active: data.item.active } : i))
        );
        showToast(
          `Showcase "${item.title_en || item.id}" ${data.item.active ? 'published' : 'hidden'}!`,
          'success'
        );
      } else {
        showToast(data.message || 'Failed to toggle status', 'error');
      }
    } catch (err) {
      showToast('Connection error: ' + err.message, 'error');
    }
  };

  // Handle form submit (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!selectedFile && !previewImage) {
      alert('Please upload an image file!');
      return;
    }

    if (!formData.title_en?.trim()) {
      alert('Please enter a showcase title!');
      return;
    }

    setIsSaving(true);
    try {
      const formPayload = new FormData();
      if (selectedFile) {
        formPayload.append('image', selectedFile);
      } else if (previewImage) {
        formPayload.append('src', previewImage);
      }

      formPayload.append('categoryKey', formData.categoryKey);
      formPayload.append('title_en', formData.title_en.trim());
      formPayload.append('title_vi', formData.title_en.trim());
      formPayload.append('category_en', (formData.category_en || 'Builder Gel - BIAB').trim());
      formPayload.append('category_vi', (formData.category_en || 'Builder Gel - BIAB').trim());
      formPayload.append('serviceId', (formData.serviceId || '').trim());
      formPayload.append('serviceName_en', (formData.serviceName_en || '').trim());
      formPayload.append('serviceName_vi', (formData.serviceName_en || '').trim());
      formPayload.append('shape_en', (formData.shape_en || 'Slim Almond').trim());
      formPayload.append('shape_vi', (formData.shape_en || 'Slim Almond').trim());
      formPayload.append('duration_en', (formData.duration_en || '55 mins').trim());
      formPayload.append('duration_vi', (formData.duration_en || '55 mins').trim());
      formPayload.append('price', (formData.price || '$60').trim());
      formPayload.append('technique_en', (formData.technique_en || '').trim());
      formPayload.append('technique_vi', (formData.technique_en || '').trim());
      formPayload.append('description_en', (formData.description_en || '').trim());
      formPayload.append('description_vi', (formData.description_en || '').trim());
      formPayload.append('highlights_en', formData.highlights_en || '');
      formPayload.append('highlights_vi', formData.highlights_en || '');
      formPayload.append('active', String(formData.active));
      formPayload.append('sort_order', String(formData.sort_order || 99));

      const isEditing = Boolean(editingItem);
      const url = isEditing ? `/api/gallery/${editingItem.id}` : '/api/gallery';
      const method = isEditing ? 'PUT' : 'POST';

      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        await fetchGallery();
        showToast(
          isEditing ? 'Showcase updated successfully!' : 'New showcase added to portfolio!',
          'success'
        );
      } else {
        alert('Action failed: ' + data.message);
      }
    } catch (err) {
      alert('Connection error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/gallery/${deletingItem.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
        setDeletingItem(null);
        showToast('Showcase deleted successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to delete showcase', 'error');
      }
    } catch (err) {
      showToast('Connection error: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset to default
  const handleResetCatalog = async () => {
    const ok = window.confirm(
      'Are you sure you want to reset the portfolio to the initial 17 showcase sets? Any custom uploads will be overwritten.'
    );
    if (!ok) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/gallery/reset', { 
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        saveGalleryCategoriesState(DEFAULT_GALLERY_CATEGORIES);
        setSelectedCategory('all');
        showToast('Gallery portfolio and art categories reset to defaults!', 'success');
      } else {
        showToast('Reset failed: ' + data.message, 'error');
      }
    } catch (err) {
      showToast('Error resetting: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalCount = items.length;
  const activeCount = items.filter((i) => i.active !== false).length;
  const hiddenCount = items.filter((i) => i.active === false).length;

  return (
    <div>
      {/* 1. Toast Notification */}
      <GalleryToast toastMessage={toastMessage} />

      {/* 2. KPI Stats Grid */}
      <GalleryStatsCards
        totalCount={totalCount}
        activeCount={activeCount}
        hiddenCount={hiddenCount}
        categoriesCount={categories.filter((c) => c.key !== 'all').length}
      />

      {/* 3. Main Container Card */}
      <div className="admin-card">
        {/* Header & Primary Actions */}
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">
              <Layers size={20} className="text-gold" />
              <span>Gallery & Portfolio Showcase Management</span>
            </h2>
            <p className="admin-gallery-desc">
              Manage high-definition nail art photographs, specifications, and 3D showcase items displayed on the client landing page.
            </p>
          </div>

          <div className="admin-gallery-header-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={handleResetCatalog}
              title="Reset gallery back to default 17 official salon sets"
            >
              <RefreshCw size={14} />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleOpenCreate}
            >
              <Plus size={16} />
              <span>Add New Showcase</span>
            </button>
          </div>
        </div>

        {/* 4. Toolbar & Filters */}
        <GalleryToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={totalCount}
          activeCount={activeCount}
          hiddenCount={hiddenCount}
        />

        {/* 5. Category Filter Tabs Bar */}
        <GalleryCategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          items={items}
          onOpenEditCategory={handleOpenEditCategory}
          onOpenAddCategory={handleOpenAddCategory}
        />

        {/* 6. Gallery Items Grid */}
        {loading ? (
          <div className="admin-gallery-loading">
            <RefreshCw size={28} className="admin-spin admin-gallery-loading-icon" />
            <p className="admin-gallery-loading-text">Loading gallery showcase items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="admin-gallery-empty">
            <ImageIcon size={40} className="admin-gallery-empty-icon" />
            <h4 className="admin-gallery-empty-title">No showcase items found</h4>
            <p className="admin-gallery-empty-desc">
              {searchQuery ? 'Try changing your search terms or filters.' : 'Click "Add New Showcase" to upload real nail artwork.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setStatusFilter('all'); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="admin-gallery-grid">
            {filteredItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onPreview={setPreviewItem}
                onToggleActive={handleToggleActive}
                onEdit={handleOpenEdit}
                onDelete={setDeletingItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* 7. Create / Edit Showcase Modal */}
      <GalleryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSaving}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        services={services}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onFileChange={handleFileChange}
        onSelectLinkedService={handleSelectLinkedService}
        onSubmit={handleSubmitForm}
      />

      {/* 8. Lightbox HD Preview Modal */}
      <GalleryLightboxModal
        previewItem={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={handleOpenEdit}
      />

      {/* 9. Delete Confirmation Modal */}
      <GalleryDeleteModal
        deletingItem={deletingItem}
        onClose={() => setDeletingItem(null)}
        isDeleting={isDeleting}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* 10. Add & Edit Category Modals */}
      <GalleryCategoryModals
        isAddCatModalOpen={isAddCatModalOpen}
        setIsAddCatModalOpen={setIsAddCatModalOpen}
        newCatLabel={newCatLabel}
        setNewCatLabel={setNewCatLabel}
        handleSaveAddCategory={handleSaveAddCategory}
        isEditCatModalOpen={isEditCatModalOpen}
        setIsEditCatModalOpen={setIsEditCatModalOpen}
        editingCatKey={editingCatKey}
        setEditingCatKey={setEditingCatKey}
        editingCatLabel={editingCatLabel}
        setEditingCatLabel={setEditingCatLabel}
        handleSaveEditCategory={handleSaveEditCategory}
        handleDeleteCategory={handleDeleteCategory}
        categories={categories}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}

export default AdminGallery;
