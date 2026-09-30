import React from 'react';
import { Lock, X } from 'lucide-react';
import { QUICK_REASONS } from '../constants';

export default function ScheduleLockModal({
  lockModal,
  setLockModal,
  selectedDate,
  actionLoading,
  onSubmit
}) {
  if (!lockModal.isOpen) return null;

  return (
    <div className="admin-schedule-modal-overlay">
      <div className="admin-schedule-modal-box admin-schedule-modal-box--sm">
        <div className="admin-schedule-modal-header">
          <div className="admin-schedule-modal-header-left">
            <Lock size={20} className="text-red-600" />
            <h3 className="admin-schedule-modal-title">
              {lockModal.type === 'date'
                ? `Lock Entire Day: ${selectedDate}`
                : lockModal.type === 'batch'
                ? `Lock ${lockModal.slots.length} Slots on ${selectedDate}`
                : `Lock Slot ${lockModal.slot} on ${selectedDate}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setLockModal(prev => ({ ...prev, isOpen: false }))}
            className="admin-schedule-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-schedule-form-group">
            <label className="admin-schedule-modal-label">
              Select or enter Lock Reason:
            </label>
            <input
              type="text"
              required
              value={lockModal.reason}
              onChange={(e) => setLockModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Public Holiday, Salon Maintenance, Walk-ins"
              className="admin-schedule-modal-input"
            />
          </div>

          {/* Quick Reason Chips */}
          <div className="admin-schedule-form-group--lg">
            <div className="admin-schedule-subtitle admin-schedule-suggest-title">Quick Suggestions:</div>
            <div className="admin-schedule-modal-presets-grid">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setLockModal(prev => ({ ...prev, reason: r }))}
                  className={`admin-schedule-modal-chip-btn ${lockModal.reason === r ? 'is-active' : ''}`}
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
              onClick={() => setLockModal(prev => ({ ...prev, isOpen: false }))}
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
              <span>{actionLoading ? 'Saving Lock...' : 'Confirm & Lock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
