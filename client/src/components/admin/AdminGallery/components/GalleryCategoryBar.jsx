import React from 'react';
import { Edit2, Plus } from 'lucide-react';
import GalleryCustomSelect from './GalleryCustomSelect';

export function GalleryCategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
  items,
  onOpenEditCategory,
  onOpenAddCategory
}) {
  return (
    <div className="admin-gallery-categories-wrapper">
      {/* Desktop Tabs Bar */}
      <div className="admin-gallery-tabs-bar admin-gallery-desktop-filter">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const count = cat.key === 'all'
            ? items.length
            : items.filter((i) => i.categoryKey === cat.key).length;

          return (
            <button
              key={cat.key}
              type="button"
              className={`admin-gallery-pill-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectCategory(cat.key)}
            >
              <span>{cat.label}</span>
              <span className="admin-gallery-pill-count">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Category Dropdown Select */}
      <div className="admin-gallery-mobile-category-wrap admin-gallery-mobile-only">
        <label className="admin-gallery-mobile-filter-label" id="gallery-category-select-label">
          Filter by Art Category:
        </label>
        <GalleryCustomSelect
          value={selectedCategory}
          onChange={onSelectCategory}
          options={categories.map((cat) => {
            const count = cat.key === 'all'
              ? items.length
              : items.filter((i) => i.categoryKey === cat.key).length;
            return {
              value: cat.key,
              label: `${cat.label} (${count})`
            };
          })}
          ariaLabel="Filter by Art Category"
          className="admin-gallery-category-custom-select"
        />
      </div>

      {/* Category Action Buttons */}
      <div className="admin-gallery-category-actions">
        <button
          type="button"
          className="admin-gallery-cat-action-btn admin-gallery-cat-action-btn--edit"
          onClick={() => onOpenEditCategory(categories.find((c) => c.key === selectedCategory))}
          title="Edit Art Category name"
        >
          <Edit2 size={13} />
          <span>Edit Art Category</span>
        </button>

        <button
          type="button"
          className="admin-gallery-cat-action-btn admin-gallery-cat-action-btn--add"
          onClick={onOpenAddCategory}
          title="Add new Art Category"
        >
          <Plus size={14} />
          <span>Add Art Category</span>
        </button>
      </div>
    </div>
  );
}

export default GalleryCategoryBar;
