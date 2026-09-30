import React from 'react';
import { Search } from 'lucide-react';
import VoucherCustomSelect from './VoucherCustomSelect';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Vouchers' },
  { value: 'active', label: 'Active Vouchers' },
  { value: 'inactive', label: 'Inactive Vouchers' },
  { value: 'expired', label: 'Expired Vouchers' }
];

export function VoucherFilterBar({ search, setSearch, statusFilter, setStatusFilter }) {
  return (
    <div className="admin-vouchers-filter-bar">
      {/* Search */}
      <div className="admin-vouchers-search-wrap">
        <Search size={16} className="admin-vouchers-search-icon" />
        <input
          type="text"
          placeholder="Search by voucher name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-vouchers-search-input"
        />
      </div>

      {/* Status Filter Buttons (Desktop) */}
      <div className="admin-vouchers-filter-pills admin-vouchers-desktop-filter">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'expired', label: 'Expired' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={`admin-vouchers-filter-btn ${statusFilter === f.id ? 'is-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Status Filter Dropdown (Mobile Only) */}
      <div className="admin-vouchers-mobile-filter-wrap admin-vouchers-mobile-only">
        <label className="admin-vouchers-filter-label">
          Filter by Status:
        </label>
        <VoucherCustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          ariaLabel="Filter by Status"
        />
      </div>
    </div>
  );
}

export default VoucherFilterBar;

