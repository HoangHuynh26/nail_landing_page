import React from 'react';
import { Edit2, Plus } from 'lucide-react';
import ServiceCustomSelect from './ServiceCustomSelect';

export function ServiceCategoryBar({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenEditCategory,
  onOpenAddCategory
}) {
  const activeCatObj = categories.find((c) => c.id === activeCategory);

  return (
    <div className="admin-services-categories-bar">
      {/* Horizontally scrollable tabs wrapper (Desktop) */}
      <div className="admin-services-categories-scroll-wrap admin-services-desktop-filter">
        <div className="admin-tabs-nav admin-services-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`admin-tab-btn ${activeCategory === cat.id ? 'is-active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Category Dropdown Select */}
      <div className="admin-services-mobile-category-wrap admin-services-mobile-only">
        <label className="admin-services-mobile-filter-label" id="service-category-select-label">
          Filter by Service Category:
        </label>
        <ServiceCustomSelect
          value={activeCategory}
          onChange={onSelectCategory}
          options={categories.map((cat) => ({
            value: cat.id,
            label: cat.label
          }))}
          ariaLabel="Filter by Service Category"
          className="admin-services-category-custom-select"
        />
      </div>

      {/* Action buttons (Edit & Add Category) */}
      <div className="admin-category-actions">
        <button
          type="button"
          className="admin-category-action-btn admin-category-action-btn--edit"
          onClick={() => onOpenEditCategory(activeCatObj)}
          title="Edit category name"
        >
          <Edit2 size={13} />
          <span>Edit Category</span>
        </button>

        <button
          type="button"
          className="admin-category-action-btn admin-category-action-btn--add"
          onClick={onOpenAddCategory}
          title="Add new service category"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>
    </div>
  );
}

export default ServiceCategoryBar;
