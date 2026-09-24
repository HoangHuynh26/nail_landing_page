import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Edit2, Trash2, Check, RefreshCw, Search,
  DollarSign, Clock, Tag, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'biab', label: 'BIAB Builder Gel' },
  { id: 'shellac', label: 'Shellac' },
  { id: 'acrylic', label: 'Acrylic' },
  { id: 'gelx', label: 'Gel X' },
  { id: 'sns', label: 'SNS Dipping' },
  { id: 'polish', label: 'Regular Polish' },
  { id: 'extra', label: 'Extra & Nail Art' }
];

export function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    category: 'biab',
    name_en: '',
    name_vi: '',
    price: '',
    price_prefix: '',
    duration: 45,
    description_en: '',
    description_vi: '',
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
  }, []);

  const filteredServices = services.filter((s) => {
    const matchCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      s.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name_vi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      category: activeCategory !== 'all' ? activeCategory : 'biab',
      name_en: '',
      name_vi: '',
      price: '',
      price_prefix: '',
      duration: 45,
      description_en: '',
      description_vi: '',
      active: true,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      category: service.category,
      name_en: service.name_en,
      name_vi: service.name_vi,
      price: service.price,
      price_prefix: service.price_prefix || service.pricePrefix || '',
      duration: service.duration,
      description_en: service.description_en || '',
      description_vi: service.description_vi || '',
      active: service.active ?? true,
      featured: service.featured || false
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.name_en && !formData.name_vi) {
      alert('Please enter a service name.');
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      alert('Please enter a valid price in AUD.');
      return;
    }

    try {
      if (editingService) {
        // Update existing
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? data.service : s))
          );
          setIsModalOpen(false);
        } else {
          alert('Update error: ' + data.message);
        }
      } else {
        // Create new
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) => [...prev, data.service]);
          setIsModalOpen(false);
        } else {
          alert('Create error: ' + data.message);
        }
      }
    } catch (err) {
      alert('Operation failed: ' + err.message);
    }
  };

  const handleInlinePriceSave = async (id, newPrice) => {
    if (isNaN(parseFloat(newPrice)) || parseFloat(newPrice) < 0) {
      alert('Please enter a valid price.');
      return;
    }

    setSavingPriceId(id);
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
        // Clear inline state
        setInlinePrices((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch (err) {
      alert('Failed to update price: ' + err.message);
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleToggleActive = async (service) => {
    const newActive = !service.active;
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
      }
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Permanently remove service "${service.name_en}"?`)) return;
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== service.id));
      }
    } catch (err) {
      alert('Failed to delete service: ' + err.message);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all service catalog prices & entries to official salon defaults?')) return;
    try {
      const res = await fetch('/api/services/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
        alert('Service catalog has been reset to defaults.');
      }
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  return (
    <div>
      {/* Category Tabs */}
      <div className="admin-tabs-nav" style={{ marginBottom: '16px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`admin-tab-btn ${activeCategory === cat.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="admin-card__title">
              <Sparkles size={20} className="text-gold" />
              <span>Services & Live Pricing Catalog</span>
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              ({filteredServices.length} services shown)
            </span>
          </div>

          <div className="admin-toolbar">
            <div className="admin-search-input-wrap">
              <Search size={16} />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleOpenAdd}
            >
              <Plus size={16} />
              <span>Add New Service</span>
            </button>

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={handleResetDefaults}
              title="Reset catalog to official salon defaults"
            >
              <RefreshCw size={14} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Services Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service Name (EN / VI)</th>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ color: '#94a3b8' }}>Loading service catalog...</div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ color: '#64748b' }}>No services found.</div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => {
                  const currentPrice =
                    inlinePrices[s.id] !== undefined ? inlinePrices[s.id] : s.price;
                  const hasPriceChanged =
                    inlinePrices[s.id] !== undefined &&
                    parseFloat(inlinePrices[s.id]) !== parseFloat(s.price);

                  return (
                    <tr key={s.id} style={{ opacity: s.active ? 1 : 0.55 }}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{s.name_en}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{s.name_vi}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          fontWeight: '700',
                          color: '#475569',
                          border: '1px solid #e2e8f0'
                        }}>
                          {s.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: '500' }}>
                          <Clock size={13} /> {s.duration} mins
                        </span>
                      </td>
                      <td>
                        {/* Live Price Adjuster */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#b45309', fontWeight: '800' }}>
                            {s.price_prefix || s.pricePrefix || '$'}
                          </span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={currentPrice}
                            onChange={(e) =>
                              setInlinePrices({ ...inlinePrices, [s.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInlinePriceSave(s.id, currentPrice);
                            }}
                            style={{
                              width: '75px',
                              padding: '6px 8px',
                              background: '#ffffff',
                              border: hasPriceChanged ? '2px solid #d97706' : '1.5px solid #cbd5e1',
                              borderRadius: '8px',
                              color: '#0f172a',
                              fontWeight: '700',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                          {hasPriceChanged && (
                            <button
                              type="button"
                              className="admin-icon-btn"
                              style={{ background: '#d4af37', color: '#000' }}
                              onClick={() => handleInlinePriceSave(s.id, currentPrice)}
                              disabled={savingPriceId === s.id}
                              title="Save new price"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(s)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: s.active ? '#10b981' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {s.active ? (
                            <>
                              <ToggleRight size={22} /> Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={22} /> Hidden
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="admin-action-btn-group">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Service Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn danger"
                            onClick={() => handleDeleteService(s)}
                            title="Delete Service"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Category</label>
                  <select
                    className="admin-form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="biab">BIAB Builder Gel</option>
                    <option value="shellac">Shellac</option>
                    <option value="acrylic">Acrylic</option>
                    <option value="gelx">Gel X</option>
                    <option value="sns">SNS Dipping</option>
                    <option value="polish">Regular Polish</option>
                    <option value="extra">Extra & Nail Art</option>
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
                <label>Service Name (English)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Builder Gel - BIAB (Full Set)"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Service Name (Vietnamese)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. FULL SET Builder Gel - BIAB"
                  value={formData.name_vi}
                  onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
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
                <label>Description (English)</label>
                <textarea
                  className="admin-form-textarea"
                  rows="2"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Description (Vietnamese)</label>
                <textarea
                  className="admin-form-textarea"
                  rows="2"
                  value={formData.description_vi}
                  onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', margin: '16px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Active & Bookable</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Featured / Popular</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;
