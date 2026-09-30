import React from 'react';
import { FolderPlus, Edit2, Plus, Trash2 } from 'lucide-react';

export function ServiceCategoryModals({
  isAddCatModalOpen,
  setIsAddCatModalOpen,
  newCatName,
  setNewCatName,
  handleSaveAddCategory,
  isEditCatModalOpen,
  setIsEditCatModalOpen,
  editingCatId,
  setEditingCatId,
  editingCatLabel,
  setEditingCatLabel,
  handleSaveEditCategory,
  handleDeleteCategory,
  categories,
  activeCategory
}) {
  return (
    <>
      {/* ADD CATEGORY MODAL */}
      {isAddCatModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddCatModalOpen(false)}>
          <div className="admin-modal-box admin-modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <FolderPlus size={18} className="text-gold" />
                <span>Add Service Category</span>
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setIsAddCatModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddCategory}>
              <div className="admin-form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Russian Manicure, Spa Nail Care"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  required
                />
                <span className="admin-form-help-text">
                  This name will appear on the category tabs and in service selection.
                </span>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setIsAddCatModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  <Plus size={15} />
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {isEditCatModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsEditCatModalOpen(false)}>
          <div className="admin-modal-box admin-modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <Edit2 size={18} className="text-gold" />
                <span>Edit Service Category</span>
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setIsEditCatModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory}>
              <div className="admin-form-group">
                <label>Select Category to Edit</label>
                <select
                  className="admin-form-input"
                  value={editingCatId}
                  onChange={(e) => {
                    const sel = categories.find((c) => c.id === e.target.value);
                    setEditingCatId(e.target.value);
                    if (sel) setEditingCatLabel(sel.label);
                  }}
                >
                  {categories.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} {cat.id === activeCategory ? '(Currently Selected)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Category Display Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={editingCatLabel}
                  onChange={(e) => setEditingCatLabel(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="admin-modal-actions admin-modal-actions--split">
                {editingCatId !== 'all' && (
                  <button
                    type="button"
                    className="admin-danger-outline-btn"
                    onClick={() => handleDeleteCategory(editingCatId)}
                    title="Remove this category tab"
                  >
                    <Trash2 size={14} />
                    <span>Delete Category</span>
                  </button>
                )}

                <div className="admin-modal-actions-right">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => setIsEditCatModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-primary-btn">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ServiceCategoryModals;
