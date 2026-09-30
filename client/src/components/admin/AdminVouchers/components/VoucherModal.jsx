import React from 'react';
import { Ticket, AlertCircle, Sparkles } from 'lucide-react';
import SwitchToggle from './SwitchToggle';

export function VoucherModal({
  isOpen,
  onClose,
  editingVoucher,
  formData,
  setFormData,
  formError,
  isSubmitting,
  isDuplicateCode,
  onGenerateCode,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-vouchers-modal-overlay">
      <div className="admin-vouchers-modal-box">
        <div className="admin-vouchers-modal-header">
          <div className="admin-vouchers-modal-title-group">
            <Ticket size={20} className="admin-vouchers-modal-icon" />
            <h3 className="admin-vouchers-modal-title">
              {editingVoucher ? `Edit Voucher: ${editingVoucher.code}` : 'Create New Voucher'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-vouchers-modal-close"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="admin-vouchers-modal-error">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* Voucher Code & Generate Button */}
          <div className="admin-vouchers-form-group">
            <div className="admin-vouchers-label-row">
              <label className="admin-vouchers-label">
                Voucher Code <abbr title="Required" className="admin-vouchers-req-star">*</abbr>
              </label>
              <button
                type="button"
                onClick={onGenerateCode}
                className="admin-vouchers-btn-generate"
              >
                <Sparkles size={13} />
                <span>Generate Random Code</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER20, WELCOME10"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={`admin-vouchers-code-input ${isDuplicateCode ? 'is-duplicate' : ''}`}
            />
            {isDuplicateCode && (
              <div className="admin-vouchers-duplicate-warn">
                ⚠️ Voucher code "{formData.code.trim().toUpperCase()}" already exists! Please choose another code.
              </div>
            )}
          </div>

          {/* Promotion Name */}
          <div className="admin-vouchers-form-group">
            <label className="admin-vouchers-label">
              Promotion Name <abbr title="Required" className="admin-vouchers-req-star">*</abbr>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 20% Off Welcome New Clients"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-vouchers-input"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="admin-vouchers-form-group--half">
            <div>
              <label className="admin-vouchers-label">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="admin-vouchers-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (AU$)</option>
              </select>
            </div>

            <div>
              <label className="admin-vouchers-label">
                Discount Value ({formData.discountType === 'percentage' ? '%' : 'AU$'}) <abbr title="Required" className="admin-vouchers-req-star">*</abbr>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="admin-vouchers-input"
              />
            </div>
          </div>

          {/* Usage Limit & Min Spend */}
          <div className="admin-vouchers-form-group--half">
            <div>
              <label className="admin-vouchers-label">Usage Limit (Redemptions)</label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="admin-vouchers-input"
              />
            </div>

            <div>
              <label className="admin-vouchers-label">Minimum Spend ($)</label>
              <input
                type="number"
                min="0"
                placeholder="0 = No minimum required"
                value={formData.minSpend}
                onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                className="admin-vouchers-input"
              />
            </div>
          </div>

          {/* Validity: Start Date & End Date */}
          <div className="admin-vouchers-form-group--half">
            <div>
              <label className="admin-vouchers-label">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="admin-vouchers-input"
              />
            </div>

            <div>
              <label className="admin-vouchers-label">
                Expiration Date <abbr title="Required" className="admin-vouchers-req-star">*</abbr>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="admin-vouchers-input"
              />
            </div>
          </div>

          {/* Active Toggle Switch */}
          <div className="admin-vouchers-status-switch-box">
            <div>
              <div className="admin-vouchers-status-switch-title">Status</div>
            </div>
            <SwitchToggle
              checked={formData.isActive}
              onChange={(val) => setFormData({ ...formData, isActive: val })}
              size="lg"
              label={formData.isActive ? 'Active' : 'Inactive'}
            />
          </div>

          {/* Action Buttons */}
          <div className="admin-vouchers-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="admin-vouchers-btn-cancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isDuplicateCode}
              className="admin-vouchers-btn-submit"
            >
              {isSubmitting ? 'Saving...' : (editingVoucher ? 'Update Voucher' : 'Create Voucher')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoucherModal;
