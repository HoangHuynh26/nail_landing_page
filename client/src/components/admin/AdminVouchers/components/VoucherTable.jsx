import React from 'react';
import {
  Ticket, RefreshCw, Copy, Check, Users, Calendar, ArrowRight, Edit3, Trash2
} from 'lucide-react';
import SwitchToggle from './SwitchToggle';

export function VoucherTable({
  loading,
  filteredVouchers,
  search,
  onOpenCreate,
  onCopyCode,
  copiedCode,
  onToggle,
  onEdit,
  onDelete
}) {
  return (
    <div className="admin-vouchers-table-box">
      {loading ? (
        <div className="admin-vouchers-loading">
          <RefreshCw size={24} className="spin admin-vouchers-loading-icon" />
          <div>Loading vouchers...</div>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="admin-vouchers-empty">
          <Ticket size={36} className="admin-vouchers-empty-icon" />
          <div className="admin-vouchers-empty-title">
            No vouchers found
          </div>
          <p className="admin-vouchers-empty-desc">
            {search ? 'Try adjusting your search query or filters' : 'Click "+ Create New Voucher" to add your first promotion'}
          </p>
          <button
            type="button"
            onClick={onOpenCreate}
            className="admin-vouchers-empty-btn"
          >
            + Create New Voucher
          </button>
        </div>
      ) : (
        <div className="admin-vouchers-table-scroll">
          <table className="admin-vouchers-table">
            <thead>
              <tr className="admin-vouchers-thead-row">
                <th className="admin-vouchers-th">Voucher Code</th>
                <th className="admin-vouchers-th">Promotion Name</th>
                <th className="admin-vouchers-th">Discount</th>
                <th className="admin-vouchers-th">Redemptions / Limit</th>
                <th className="admin-vouchers-th">Validity Period</th>
                <th className="admin-vouchers-th admin-vouchers-th--center">Status</th>
                <th className="admin-vouchers-th admin-vouchers-th--right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((v) => {
                const isExpired = v.computedStatus === 'expired';
                const isInactive = v.computedStatus === 'inactive';
                const isUpcoming = v.computedStatus === 'upcoming';

                return (
                  <tr
                    key={v.id}
                    className={`admin-vouchers-tr ${isExpired ? 'admin-vouchers-tr--expired' : ''} ${isInactive ? 'admin-vouchers-tr--inactive' : ''}`}
                  >
                    {/* Voucher Code & Top Row on Mobile */}
                    <td className="admin-vouchers-td admin-vouchers-td--code">
                      <div className="admin-vouchers-card-top-row">
                        <div className="admin-vouchers-code-group">
                          <span className="admin-vouchers-code-chip">
                            {v.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => onCopyCode(v.code)}
                            title="Copy code"
                            className="admin-vouchers-btn-copy"
                          >
                            {copiedCode === v.code ? (
                              <Check size={14} className="admin-vouchers-check-icon" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>

                        {/* Mobile Status Toggle Switch in Card Header */}
                        <div className="admin-vouchers-mobile-status">
                          <SwitchToggle
                            checked={v.isActive}
                            onChange={() => onToggle(v)}
                            title={v.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Promotion Name & Mobile Discount */}
                    <td className="admin-vouchers-td admin-vouchers-td--name">
                      <div className="admin-vouchers-name-row">
                        <div className="admin-vouchers-name-text">
                          {v.name}
                        </div>
                        {/* Mobile Discount Tag */}
                        <span className="admin-vouchers-mobile-discount">
                          {v.discountType === 'percentage' ? `${v.discountValue}% OFF` : `$${v.discountValue} OFF`}
                        </span>
                      </div>
                      {v.minSpend > 0 && (
                        <div className="admin-vouchers-min-spend">
                          Min spend ${v.minSpend}
                        </div>
                      )}
                      {v.discountType === 'percentage' && v.maxDiscount && (
                        <div className="admin-vouchers-min-spend">
                          Max discount ${v.maxDiscount}
                        </div>
                      )}
                    </td>

                    {/* Discount (Desktop Only) */}
                    <td className="admin-vouchers-td admin-vouchers-td--discount admin-vouchers-desktop-only">
                      <div className="admin-vouchers-discount-val">
                        {v.discountType === 'percentage' ? `${v.discountValue}%` : `$${v.discountValue}`}
                      </div>
                      {v.discountType === 'percentage' && v.maxDiscount && (
                        <div className="admin-vouchers-min-spend">
                          Max discount ${v.maxDiscount}
                        </div>
                      )}
                    </td>

                    {/* Redemptions / Limit */}
                    <td className="admin-vouchers-td admin-vouchers-td--usage">
                      <div className="admin-vouchers-usage-wrap">
                        <Users size={14} className="admin-vouchers-usage-icon" />
                        <span>
                          {v.usedCount} {v.usageLimit ? `/ ${v.usageLimit} used` : 'used (Unlimited)'}
                        </span>
                      </div>
                      {v.usageLimit && (
                        <div className="admin-vouchers-progress-track">
                          <div
                            className={`admin-vouchers-progress-bar ${v.usedCount >= v.usageLimit ? 'is-maxed' : ''}`}
                            style={{ width: `${Math.min(100, Math.round((v.usedCount / v.usageLimit) * 100))}%` }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Validity Period */}
                    <td className="admin-vouchers-td admin-vouchers-td--validity">
                      <div className="admin-vouchers-validity-wrap">
                        <Calendar size={13} className="admin-vouchers-validity-icon" />
                        <span className="admin-vouchers-validity-text">
                          {v.startDate ? v.startDate.split('-').reverse().join('-') : 'Today'} <ArrowRight size={11} className="admin-vouchers-validity-arrow" /> {v.endDate.split('-').reverse().join('-')}
                        </span>
                      </div>
                      <div className="admin-vouchers-status-pill-wrap">
                        {isExpired ? (
                          <span className="admin-vouchers-status-pill admin-vouchers-status-pill--expired">Expired</span>
                        ) : isUpcoming ? (
                          <span className="admin-vouchers-status-pill admin-vouchers-status-pill--upcoming">Upcoming</span>
                        ) : isInactive ? (
                          <span className="admin-vouchers-status-pill admin-vouchers-status-pill--inactive">Inactive</span>
                        ) : (
                          <span className="admin-vouchers-status-pill admin-vouchers-status-pill--active">Active</span>
                        )}
                      </div>
                    </td>

                    {/* Modern iOS-Style Toggle Switch (Desktop Only) */}
                    <td className="admin-vouchers-td admin-vouchers-td--center admin-vouchers-desktop-only">
                      <SwitchToggle
                        checked={v.isActive}
                        onChange={() => onToggle(v)}
                        title={v.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      />
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="admin-vouchers-td admin-vouchers-td--right admin-vouchers-td--actions">
                      <div className="admin-vouchers-actions-group">
                        <button
                          type="button"
                          onClick={() => onEdit(v)}
                          title="Edit voucher"
                          className="admin-vouchers-action-edit"
                        >
                          <Edit3 size={15} />
                          <span className="admin-vouchers-btn-label">Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(v)}
                          title="Delete voucher"
                          className="admin-vouchers-action-delete"
                        >
                          <Trash2 size={15} />
                          <span className="admin-vouchers-btn-label">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VoucherTable;
