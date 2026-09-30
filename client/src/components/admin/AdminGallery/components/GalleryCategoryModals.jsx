import React from 'react';
import { FolderPlus, Edit2, Plus, Trash2 } from 'lucide-react';

export function GalleryCategoryModals({
  isAddCatModalOpen,
  setIsAddCatModalOpen,
  newCatLabel,
  setNewCatLabel,
  handleSaveAddCategory,
  isEditCatModalOpen,
  setIsEditCatModalOpen,
  editingCatKey,
  setEditingCatKey,
  editingCatLabel,
  setEditingCatLabel,
  handleSaveEditCategory,
  handleDeleteCategory,
  categories,
  selectedCategory
}) {
  return (
    <>
      {/* ADD ART CATEGORY MODAL */}
      {isAddCatModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddCatModalOpen(false)}>
          <div className="admin-modal-box admin-modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <FolderPlus size={18} className="text-gold" />
                <span>Add Art Gallery Category</span>
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
                <label>Art Category Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Cat Eye & Chrome Art"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  autoFocus
                  required
                />
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
                  <span>Create Art Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ART CATEGORY MODAL */}
      {isEditCatModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsEditCatModalOpen(false)}>
          <div className="admin-modal-box admin-modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <Edit2 size={18} className="text-gold" />
                <span>Edit Art Gallery Category</span>
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
                  value={editingCatKey}
                  onChange={(e) => {
                    const sel = categories.find((c) => c.key === e.target.value);
                    setEditingCatKey(e.target.value);
                    if (sel) {
                      setEditingCatLabel(sel.label);
                    }
                  }}
                >
                  {categories.filter((c) => c.key !== 'all').map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label} {cat.key === selectedCategory ? '(Currently Selected)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Art Category Name</label>
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
                {editingCatKey !== 'all' && (
                  <button
                    type="button"
                    className="admin-danger-outline-btn"
                    onClick={() => handleDeleteCategory(editingCatKey)}
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

export default GalleryCategoryModals;
