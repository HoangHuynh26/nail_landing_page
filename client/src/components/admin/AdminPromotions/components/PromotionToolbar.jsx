import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import PromoCustomSelect from './PromoCustomSelect';

export function PromotionToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  totalCount,
  liveCount,
  scheduledCount,
  inactiveCount,
  expiredCount
}) {
  const statusOptions = [
    { value: 'all', label: `All Posters (${totalCount})` },
    { value: 'live', label: `Displaying / Live (${liveCount})`, dot: 'green' },
    { value: 'scheduled', label: `Scheduled (${scheduledCount})`, dot: 'amber' },
    { value: 'inactive', label: `Inactive (${inactiveCount})`, dot: 'gray' },
    ...(expiredCount > 0 ? [{ value: 'expired', label: `Expired (${expiredCount})`, dot: 'red' }] : [])
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Uploaded' },
    { value: 'oldest', label: 'Oldest Uploaded' },
    { value: 'startDate', label: 'Start Date (Earliest)' },
    { value: 'endDate', label: 'End Date (Ending Soon)' }
  ];

  return (
    <div className="admin-toolbar admin-promo-toolbar">
      {/* 1. Search Box */}
      <div className="admin-search-input-wrap admin-promo-search-wrap">
        <Search size={16} className="admin-promo-search-icon" />
        <input
          type="text"
          className="admin-search-input admin-promo-search-input"
          placeholder="Search posters by title, start or end date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="admin-gallery-search-clear admin-promo-search-clear"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Desktop Segmented Status Control */}
      <div className="admin-segmented-control admin-promo-desktop-filter" role="tablist" aria-label="Filter posters by status">
        <button
          type="button"
          className={`admin-segmented-btn ${statusFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          className={`admin-segmented-btn admin-segmented-btn--live ${statusFilter === 'live' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('live')}
        >
          <span className="admin-promo-status-dot admin-promo-status-dot--active" />
          Displaying ({liveCount})
        </button>
        <button
          type="button"
          className={`admin-segmented-btn admin-segmented-btn--scheduled ${statusFilter === 'scheduled' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('scheduled')}
        >
          Scheduled ({scheduledCount})
        </button>
        <button
          type="button"
          className={`admin-segmented-btn admin-segmented-btn--inactive ${statusFilter === 'inactive' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('inactive')}
        >
          Inactive ({inactiveCount})
        </button>
        {expiredCount > 0 && (
          <button
            type="button"
            className={`admin-segmented-btn admin-segmented-btn--expired ${statusFilter === 'expired' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('expired')}
          >
            Expired ({expiredCount})
          </button>
        )}
      </div>

      {/* 3. Mobile Status Dropdown (Active on phone screens) */}
      <div className="admin-promo-mobile-filter-wrap admin-promo-mobile-only">
        <label className="admin-promo-filter-label" htmlFor="promo-status-filter-mobile">
          Filter by Status:
        </label>
        <PromoCustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          ariaLabel="Filter posters by status"
        />
      </div>

      {/* 4. Sort Dropdown */}
      <div className="admin-promo-sort-wrap">
        <label className="admin-promo-filter-label admin-promo-mobile-only">
          Sort by:
        </label>
        <PromoCustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={sortOptions}
          icon={ArrowUpDown}
          ariaLabel="Sort posters"
        />
      </div>
    </div>
  );
}

export default PromotionToolbar;
