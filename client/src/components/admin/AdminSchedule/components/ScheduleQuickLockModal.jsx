import React from 'react';
import { Lock, X } from 'lucide-react';
import { QUICK_REASONS } from '../constants';
import { formatSlotTime } from '../../../../utils/perthTime';

export default function ScheduleQuickLockModal({
  quickLockModal,
  setQuickLockModal,
  selectedDate,
  actionLoading,
  onSubmit
}) {
  if (!quickLockModal.isOpen) return null;

  return (
    <div className="admin-schedule-modal-overlay">
      <div className="admin-schedule-modal-box admin-schedule-modal-box--md">
        <div className="admin-schedule-modal-header">
          <div className="admin-schedule-modal-header-left">
            <Lock size={20} className="text-red-600" />
            <h3 className="admin-schedule-modal-title">
              Lock Specific Slot on {selectedDate.split('-').reverse().join('-')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setQuickLockModal(prev => ({ ...prev, isOpen: false }))}
            className="admin-schedule-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {/* Select Time Row */}
          <div className="admin-schedule-modal-time-picker-card--danger">
            <label className="admin-schedule-modal-label admin-schedule-modal-label-danger">
              Select Time Slot to Lock:
            </label>
            <div className="admin-schedule-modal-picker-row admin-schedule-modal-picker-row--gap">
              {/* Hour */}
              <select
                value={quickLockModal.hour}
                onChange={(e) => setQuickLockModal(prev => ({ ...prev, hour: e.target.value }))}
                className="admin-schedule-modal-picker-select--danger"
              >
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="admin-schedule-modal-picker-colon--danger">:</span>
              {/* Minute */}
              <select
                value={quickLockModal.minute}
                onChange={(e) => setQuickLockModal(prev => ({ ...prev, minute: e.target.value }))}
                className="admin-schedule-modal-picker-select--danger"
              >
                {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {/* AM/PM */}
              <div className="admin-schedule-modal-period-group">
                {['AM', 'PM'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setQuickLockModal(prev => ({ ...prev, period: p }))}
                    className={`admin-schedule-modal-period-btn--danger ${quickLockModal.period === p ? 'is-active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-schedule-modal-label-danger admin-schedule-target-slot-text">
              Target Slot: <strong className="admin-schedule-target-slot-value">{formatSlotTime(quickLockModal.hour, quickLockModal.minute, quickLockModal.period)}</strong>
            </div>
          </div>

          {/* Lock Reason Input */}
          <div className="admin-schedule-form-group">
            <label className="admin-schedule-modal-label">
              Lock Reason:
            </label>
            <input
              type="text"
              required
              value={quickLockModal.reason}
              onChange={(e) => setQuickLockModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Full slot, Reserved for walk-ins, Staff shortage"
              className="admin-schedule-modal-input"
            />
          </div>

          {/* Quick suggestions */}
          <div className="admin-schedule-form-group--lg">
            <div className="admin-schedule-subtitle admin-schedule-suggest-title--sm">Suggestions:</div>
            <div className="admin-schedule-modal-presets-grid">
              {QUICK_REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setQuickLockModal(prev => ({ ...prev, reason: r }))}
                  className={`admin-schedule-modal-chip-btn--danger ${quickLockModal.reason === r ? 'is-active' : ''}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-schedule-modal-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => setQuickLockModal(prev => ({ ...prev, isOpen: false }))}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-primary-btn admin-schedule-modal-danger-btn"
              disabled={actionLoading}
            >
              <Lock size={15} />
              <span>{actionLoading ? 'Locking Slot...' : 'Confirm & Lock Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
