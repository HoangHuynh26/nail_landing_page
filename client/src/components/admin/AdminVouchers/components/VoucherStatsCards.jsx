import React from 'react';

export function VoucherStatsCards({ stats }) {
  return (
    <div className="admin-vouchers-stats-grid">
      {/* Card 1: Total */}
      <div className="admin-vouchers-stat-card admin-vouchers-stat-card--total">
        <div className="admin-vouchers-stat-label">Total Vouchers</div>
        <div className="admin-vouchers-stat-num">{stats.total}</div>
      </div>

      {/* Card 2: Active */}
      <div className="admin-vouchers-stat-card admin-vouchers-stat-card--active">
        <div className="admin-vouchers-stat-label admin-vouchers-stat-label--active">Active Vouchers</div>
        <div className="admin-vouchers-stat-num admin-vouchers-stat-num--active">{stats.active}</div>
      </div>

      {/* Card 3: Total Redemptions */}
      <div className="admin-vouchers-stat-card admin-vouchers-stat-card--used">
        <div className="admin-vouchers-stat-label admin-vouchers-stat-label--used">Total Redemptions</div>
        <div className="admin-vouchers-stat-num admin-vouchers-stat-num--used">
          {stats.totalUsed} <span className="admin-vouchers-stat-unit">uses</span>
        </div>
      </div>

      {/* Card 4: Inactive / Expired */}
      <div className="admin-vouchers-stat-card admin-vouchers-stat-card--expired">
        <div className="admin-vouchers-stat-label">Inactive / Expired</div>
        <div className="admin-vouchers-stat-num admin-vouchers-stat-num--expired">
          {stats.inactive + stats.expired}
        </div>
      </div>
    </div>
  );
}

export default VoucherStatsCards;
