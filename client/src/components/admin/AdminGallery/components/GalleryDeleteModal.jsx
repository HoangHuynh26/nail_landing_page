import React from 'react';
import { Trash2 } from 'lucide-react';

export function GalleryDeleteModal({
  deletingItem,
  onClose,
  isDeleting,
  onConfirmDelete
}) {
  if (!deletingItem) return null;

  return (
    <div className="admin-gallery-delete-overlay" onClick={() => !isDeleting && onClose()}>
      <div className="admin-gallery-delete-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-gallery-delete-icon">
          <Trash2 size={26} />
        </div>

        <h3 className="admin-gallery-delete-title">
          Delete Showcase?
        </h3>

        <p className="admin-gallery-delete-desc">
          Are you sure you want to delete <strong className="admin-gallery-delete-strong">"{deletingItem.title_en}"</strong>? This will permanently remove it from the 3D gallery carousel.
        </p>

        <div className="admin-gallery-delete-actions">
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-gallery-delete-confirm-btn"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Showcase'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GalleryDeleteModal;
