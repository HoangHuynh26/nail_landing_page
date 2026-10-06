import React from 'react';
import { Ticket, Clock, RefreshCw, Plus } from 'lucide-react';

export function VoucherHeader({ onRunCron, onRefresh, onOpenCreate, loading }) {
  return (
    <div className="admin-vouchers-header">
      <div>
        <div className="admin-vouchers-title-group">
          <div className="admin-vouchers-icon-badge">
            <Ticket size={22} />
          </div>
          <div>
            <h2 className="admin-vouchers-title">Vouchers & Promotions</h2>
            <p className="admin-vouchers-desc">
              Create promotional discount codes, set usage limits, configure expiry dates, and auto-expire via Cron
            </p>
          </div>
        </div>
      </div>

      <div className="admin-vouchers-header-actions">
        <button
          type="button"
          onClick={onRefresh}
          title="Reload voucher list"
          className="admin-vouchers-btn-refresh"
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreate}
          className="admin-vouchers-btn-create"
        >
          <Plus size={16} />
          <span>Create New Voucher</span>
        </button>
      </div>
    </div>
  );
}

export default VoucherHeader;
