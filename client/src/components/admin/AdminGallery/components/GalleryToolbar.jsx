import React from 'react';
import { Search, X } from 'lucide-react';
import GalleryCustomSelect from './GalleryCustomSelect';

export function GalleryToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
  activeCount,
  hiddenCount
}) {
  return (
    <div className="admin-toolbar admin-gallery-toolbar">
      <div className="admin-search-input-wrap admin-gallery-search-wrap">
        <Search size={16} className="admin-gallery-search-icon" />
        <input
          type="text"
          className="admin-search-input admin-gallery-search-input"
          placeholder="Search by title, technique, shape, price..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="admin-gallery-search-clear"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status Filter Segmented Control (Desktop) */}
      <div className="admin-segmented-control admin-gallery-desktop-filter" role="tablist" aria-label="Status filter">
        <button
          type="button"
          className={`admin-segmented-btn filter-all ${statusFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('all')}
          role="tab"
          aria-selected={statusFilter === 'all'}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          className={`admin-segmented-btn filter-active ${statusFilter === 'active' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('active')}
          role="tab"
          aria-selected={statusFilter === 'active'}
        >
          Published ({activeCount})
        </button>
        <button
          type="button"
          className={`admin-segmented-btn filter-hidden ${statusFilter === 'hidden' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('hidden')}
          role="tab"
          aria-selected={statusFilter === 'hidden'}
        >
          Hidden ({hiddenCount})
        </button>
      </div>

      {/* Status Filter Dropdown (Mobile Only) */}
      <div className="admin-gallery-mobile-filter-select-wrap admin-gallery-mobile-only">
        <label className="admin-gallery-mobile-filter-label" id="gallery-status-select-label">
          Filter by Status:
        </label>
        <GalleryCustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: `All Status (${totalCount})` },
            { value: 'active', label: `Published (${activeCount})` },
            { value: 'hidden', label: `Hidden (${hiddenCount})` }
          ]}
          ariaLabel="Filter by Status"
          className="admin-gallery-status-custom-select"
        />
      </div>
    </div>
  );
}

export default GalleryToolbar;
