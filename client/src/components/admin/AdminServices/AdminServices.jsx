import './AdminServices.css';
import React, { useState, useEffect } from 'react';

// Modular Sub-Components
import ServiceToast from './components/ServiceToast';
import ServiceCategoryBar from './components/ServiceCategoryBar';
import ServiceHeader from './components/ServiceHeader';
import ServiceSearchBar from './components/ServiceSearchBar';
import ServiceCard from './components/ServiceCard';
import ServiceFormModal from './components/ServiceFormModal';
import ServiceCategoryModals from './components/ServiceCategoryModals';

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'biab', label: 'BIAB Builder Gel' },
  { id: 'shellac', label: 'Shellac' },
  { id: 'acrylic', label: 'Acrylic' },
  { id: 'gelx', label: 'Gel X' },
  { id: 'sns', label: 'SNS Dipping' },
  { id: 'polish', label: 'Regular Polish' },
  { id: 'extra', label: 'Extra & Nail Art' }
];

const getInitialCategories = () => {
  try {
    const saved = localStorage.getItem('atelier_service_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse service categories from localStorage', e);
  }
  return DEFAULT_CATEGORIES;
};

const ITEMS_PER_PAGE = 10;

export function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(getInitialCategories);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);

  // Category management modals
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState('');
  const [editingCatLabel, setEditingCatLabel] = useState('');

  const saveCategoriesState = (newCategories) => {
    setCategories(newCategories);
    try {
      localStorage.setItem('atelier_service_categories', JSON.stringify(newCategories));
    } catch (e) {
      console.warn('Failed to save service categories to localStorage', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const list = [
            { id: 'all', label: 'All Services' },
            ...data.categories.map(c => ({
              id: c.id,
              label: c.name_en || c.label || c.name_vi,
              name_en: c.name_en,
              name_vi: c.name_vi
            }))
          ];
          setCategories(list);
          try {
            localStorage.setItem('atelier_service_categories', JSON.stringify(list));
          } catch (_) {}
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load categories from API, using cached/default:', err);
    }
  };

  const handleOpenAddCategory = () => {
    setNewCatName('');
    setIsAddCatModalOpen(true);
  };

  const handleSaveAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      alert('Please enter a category name.');
      return;
    }
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `cat_${Date.now()}`;

    if (categories.some((c) => c.id === slug || c.label.toLowerCase() === trimmed.toLowerCase())) {
      alert('A category with this name or ID already exists.');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slug, name_en: trimmed, name_vi: trimmed })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create category');
      }

      await fetchCategories();
      setActiveCategory(slug);
      setIsAddCatModalOpen(false);
      showToast(`Category "${trimmed}" created successfully in database!`, 'success');
    } catch (err) {
      console.error('Error saving category to database:', err);
      const newCat = { id: slug, label: trimmed, custom: true };
      const updated = [...categories, newCat];
      saveCategoriesState(updated);
      setActiveCategory(slug);
      setIsAddCatModalOpen(false);
      showToast(`Category "${trimmed}" saved.`, 'success');
    }
  };

  const handleOpenEditCategory = (targetCat) => {
    const catToEdit =
      targetCat && targetCat.id !== 'all'
        ? targetCat
        : categories.find((c) => c.id === activeCategory && c.id !== 'all') ||
          categories.find((c) => c.id !== 'all');

    if (!catToEdit) return;
    setEditingCatId(catToEdit.id);
    setEditingCatLabel(catToEdit.label);
    setIsEditCatModalOpen(true);
  };

  const handleSaveEditCategory = async (e) => {
    e.preventDefault();
    const trimmed = editingCatLabel.trim();
    if (!trimmed) {
      alert('Please enter a category name.');
      return;
    }

    try {
      const res = await fetch(`/api/categories/${editingCatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_en: trimmed, name_vi: trimmed })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update category');
      }

      await fetchCategories();
      setIsEditCatModalOpen(false);
      showToast(`Category updated to "${trimmed}" in database!`, 'success');
    } catch (err) {
      console.error('Error updating category in database:', err);
      const updated = categories.map((c) =>
        c.id === editingCatId ? { ...c, label: trimmed } : c
      );
      saveCategoriesState(updated);
      setIsEditCatModalOpen(false);
      showToast(`Category updated to "${trimmed}"!`, 'success');
    }
  };

  const handleDeleteCategory = async (catId) => {
    const target = categories.find((c) => c.id === catId);
    if (!target) return;
    const catName = target.label || target.name || target.name_en || target.id;

    const message = `Are you sure you want to delete the category ${catName}?`;

    if (!window.confirm(message)) return;

    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category');
      }

      await fetchCategories();
      await fetchServices();
      if (activeCategory === catId) {
        setActiveCategory('all');
      }
      setIsEditCatModalOpen(false);
      showToast(`Category "${catName}" was deleted successfully.`, 'success');
    } catch (err) {
      console.error('Error deleting category from database:', err);
      showToast(`Failed to delete category: ${err.message}`, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    category: 'biab',
    name_en: '',
    price: '',
    price_prefix: '',
    duration: 45,
    description_en: '',
    active: true,
    featured: false
  });

  // Inline price editing state: { [id]: newPrice }
  const [inlinePrices, setInlinePrices] = useState({});
  const [savingPriceId, setSavingPriceId] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Reset to page 1 whenever category or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const filteredServices = services.filter((s) => {
    const matchCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      s.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name_vi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Pagination calculations (10 items per page)
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredServices.length);
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      category: activeCategory !== 'all' ? activeCategory : 'biab',
      name_en: '',
      price: '',
      price_prefix: '',
      duration: 45,
      description_en: '',
      active: true,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      category: service.category,
      name_en: service.name_en || service.name_vi || '',
      price: service.price,
      price_prefix: service.price_prefix || service.pricePrefix || '',
      duration: service.duration,
      description_en: service.description_en || service.description_vi || '',
      active: service.active ?? true,
      featured: service.featured || false
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.name_en?.trim()) {
      alert('Please enter a service name.');
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      alert('Please enter a valid price in AUD.');
      return;
    }

    const payload = {
      ...formData,
      name_en: formData.name_en.trim(),
      name_vi: formData.name_en.trim(),
      description_en: (formData.description_en || '').trim(),
      description_vi: (formData.description_en || '').trim()
    };

    try {
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? data.service : s))
          );
          setIsModalOpen(false);
          showToast(`Service "${payload.name_en}" updated successfully!`, 'success');
        } else {
          showToast('Update error: ' + data.message, 'error');
        }
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) => [...prev, data.service]);
          setIsModalOpen(false);
          showToast(`New service "${payload.name_en}" created successfully!`, 'success');
        } else {
          showToast('Create error: ' + data.message, 'error');
        }
      }
    } catch (err) {
      showToast('Operation failed: ' + err.message, 'error');
    }
  };

  const handleInlinePriceSave = async (id, newPrice) => {
    if (isNaN(parseFloat(newPrice)) || parseFloat(newPrice) < 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }

    setSavingPriceId(id);
    const targetService = services.find((s) => s.id === id);
    const sName = targetService?.name_en || targetService?.name_vi || 'Service';
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, price: parseFloat(newPrice) } : s))
        );
        setInlinePrices((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        showToast(`Price updated: "${sName}" is now AU$${newPrice}.`, 'success');
      }
    } catch (err) {
      showToast('Failed to update price: ' + err.message, 'error');
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleToggleActive = async (service) => {
    const newActive = !service.active;
    const serviceName = service.name_en || service.name_vi || 'Service';
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive })
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: newActive } : s))
        );
        showToast(
          newActive
            ? `Status updated: "${serviceName}" is now ACTIVE on website.`
            : `Status updated: "${serviceName}" is now HIDDEN from website.`,
          'success'
        );
      } else {
        showToast(data.message || 'Failed to update service status.', 'error');
      }
    } catch (err) {
      showToast('Failed to toggle status: ' + err.message, 'error');
    }
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Permanently remove service "${service.name_en}"?`)) return;
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== service.id));
        showToast(`Service "${service.name_en}" removed successfully.`, 'success');
      } else {
        showToast(data.message || 'Failed to delete service.', 'error');
      }
    } catch (err) {
      showToast('Failed to delete service: ' + err.message, 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all service catalog prices, entries & categories to official salon defaults?')) return;
    try {
      const res = await fetch('/api/services/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
        saveCategoriesState(DEFAULT_CATEGORIES);
        setActiveCategory('all');
        showToast('Service catalog and categories reset to defaults.', 'success');
      }
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  return (
    <div className="admin-services-root">
      {/* 1. Notification Toast */}
      <ServiceToast toast={toast} onClose={() => setToast(null)} />

      {/* 2. Category Bar */}
      <ServiceCategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenEditCategory={handleOpenEditCategory}
        onOpenAddCategory={handleOpenAddCategory}
      />

      <div className="admin-card">
        {/* 3. Header with Title & Action buttons */}
        <ServiceHeader
          totalServices={services.length}
          onResetDefaults={handleResetDefaults}
          onOpenAdd={handleOpenAdd}
        />

        {/* 4. Dedicated Search & Filter Bar */}
        <ServiceSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalPages={totalPages}
          safeCurrentPage={safeCurrentPage}
          setCurrentPage={setCurrentPage}
          getPageNumbers={getPageNumbers}
        />

        {/* 5. Services Table */}
        <div className="admin-table-wrap">
          <table className="admin-table admin-services-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Price ($ AUD)</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="admin-services-empty-td">
                    <div className="admin-services-loading-text">Loading service catalog...</div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-services-empty-td admin-services-empty-td--large">
                    <div className="admin-services-empty-text">No services found.</div>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    categories={categories}
                    inlinePrice={inlinePrices[s.id]}
                    onInlinePriceChange={(id, val) => setInlinePrices({ ...inlinePrices, [id]: val })}
                    onInlinePriceSave={handleInlinePriceSave}
                    savingPriceId={savingPriceId}
                    onToggleActive={handleToggleActive}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteService}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Add / Edit Service Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingService={editingService}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onSubmit={handleSaveModal}
      />

      {/* 7. Add & Edit Category Modals */}
      <ServiceCategoryModals
        isAddCatModalOpen={isAddCatModalOpen}
        setIsAddCatModalOpen={setIsAddCatModalOpen}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        handleSaveAddCategory={handleSaveAddCategory}
        isEditCatModalOpen={isEditCatModalOpen}
        setIsEditCatModalOpen={setIsEditCatModalOpen}
        editingCatId={editingCatId}
        setEditingCatId={setEditingCatId}
        editingCatLabel={editingCatLabel}
        setEditingCatLabel={setEditingCatLabel}
        handleSaveEditCategory={handleSaveEditCategory}
        handleDeleteCategory={handleDeleteCategory}
        categories={categories}
        activeCategory={activeCategory}
      />
    </div>
  );
}

export default AdminServices;
