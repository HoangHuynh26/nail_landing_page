import React from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { PRESET_CUSTOM_SLOTS } from '../constants';
import { formatSlotTime } from '../../../../utils/perthTime';

export default function ScheduleAddSlotModal({
  addSlotModal,
  setAddSlotModal,
  selectedDate,
  formattedSelectedDate,
  slots,
  actionLoading,
  onSubmit
}) {
  if (!addSlotModal.isOpen) return null;

  const currentFormattedSlot = formatSlotTime(addSlotModal.hour, addSlotModal.minute, addSlotModal.period);
  const isConflict = slots.includes(currentFormattedSlot);

  return (
    <div className="admin-schedule-modal-overlay">
      <div className="admin-schedule-modal-box admin-schedule-modal-box--lg">
        <div className="admin-schedule-modal-header admin-schedule-modal-header--lg">
          <div className="admin-schedule-modal-header-left admin-schedule-modal-header-left--lg">
            <div className="admin-schedule-modal-icon-badge">
              <Plus size={22} />
            </div>
            <div>
              <h3 className="admin-schedule-modal-title">
                Add Custom Time Slot
              </h3>
              <div className="admin-schedule-modal-subtitle">
                Custom schedule for: <strong className="text-amber-700">{selectedDate}</strong> ({formattedSelectedDate})
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddSlotModal(prev => ({ ...prev, isOpen: false }))}
            className="admin-schedule-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="admin-schedule-modal-presets-wrap">
          <div className="admin-schedule-modal-presets-label">
            ⚡ Quick Presets:
          </div>
          <div className="admin-schedule-modal-presets-grid">
            {PRESET_CUSTOM_SLOTS.map((p) => {
              const isCurrent = addSlotModal.hour === p.hour && addSlotModal.minute === p.minute && addSlotModal.period === p.period;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAddSlotModal(prev => ({
                    ...prev,
                    hour: p.hour,
                    minute: p.minute,
                    period: p.period
                  }))}
                  className={`admin-schedule-modal-preset-btn ${isCurrent ? 'is-active' : ''}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {/* Custom Time Picker */}
          <div className="admin-schedule-modal-time-picker-card">
            <label className="admin-schedule-modal-label admin-schedule-modal-label--bold">
              Customize Hour, Minute & Period (AM / PM):
            </label>
            
            <div className="admin-schedule-modal-picker-row">
              {/* Hour */}
              <div className="admin-schedule-modal-picker-col">
                <span className="admin-schedule-modal-picker-label">Hour (01-12)</span>
                <select
                  value={addSlotModal.hour}
                  onChange={(e) => setAddSlotModal(prev => ({ ...prev, hour: e.target.value }))}
                  className="admin-schedule-modal-picker-select"
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <span className="admin-schedule-modal-picker-colon">:</span>

              {/* Minute */}
              <div className="admin-schedule-modal-picker-col">
                <span className="admin-schedule-modal-picker-label">Minute (00-55)</span>
                <select
                  value={addSlotModal.minute}
                  onChange={(e) => setAddSlotModal(prev => ({ ...prev, minute: e.target.value }))}
                  className="admin-schedule-modal-picker-select"
                >
                  {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Period AM / PM */}
              <div className="admin-schedule-modal-picker-col--period">
                <span className="admin-schedule-modal-picker-label">Period (AM / PM)</span>
                <div className="admin-schedule-modal-period-group">
                  <button
                    type="button"
                    onClick={() => setAddSlotModal(prev => ({ ...prev, period: 'AM' }))}
                    className={`admin-schedule-modal-period-btn ${addSlotModal.period === 'AM' ? 'is-active' : ''}`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddSlotModal(prev => ({ ...prev, period: 'PM' }))}
                    className={`admin-schedule-modal-period-btn ${addSlotModal.period === 'PM' ? 'is-active' : ''}`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Badge */}
            <div className="admin-schedule-modal-preview-badge">
              <span className="admin-schedule-subtitle">New slot to create:</span>
              <span className="admin-schedule-modal-preview-slot">
                {currentFormattedSlot}
              </span>
            </div>

            {/* Conflict warning */}
            {isConflict && (
              <div className="admin-schedule-modal-conflict-warning">
                <AlertCircle size={14} /> This time slot already exists in schedule for {selectedDate}.
              </div>
            )}
          </div>

          {/* Note / Reason */}
          <div className="admin-schedule-form-group--lg">
            <label className="admin-schedule-modal-label">
              Reason / Private appointment note (optional):
            </label>
            <input
              type="text"
              value={addSlotModal.note}
              onChange={(e) => setAddSlotModal(prev => ({ ...prev, note: e.target.value }))}
              placeholder="e.g. VIP client early booking, overtime evening, private event..."
              className="admin-schedule-modal-input"
            />
          </div>

          {/* Actions */}
          <div className="admin-schedule-modal-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => setAddSlotModal(prev => ({ ...prev, isOpen: false }))}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-primary-btn admin-schedule-modal-primary-btn"
              disabled={actionLoading || isConflict}
            >
              <Plus size={16} />
              <span>{actionLoading ? 'Adding Slot...' : 'Confirm Add Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
