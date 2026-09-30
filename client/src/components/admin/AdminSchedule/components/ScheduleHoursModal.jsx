import React from 'react';
import { Clock, X, RotateCcw, Check } from 'lucide-react';
import { PRESET_HOURS } from '../constants';
import { formatSlotTime } from '../../../../utils/perthTime';

export default function ScheduleHoursModal({
  hoursModal,
  setHoursModal,
  effectiveOperatingHours,
  selectedDate,
  actionLoading,
  onSubmit,
  onResetHours
}) {
  if (!hoursModal.isOpen) return null;

  return (
    <div className="admin-schedule-modal-overlay">
      <div className="admin-schedule-modal-box admin-schedule-modal-box--xl">
        <div className="admin-schedule-modal-header admin-schedule-modal-header--lg">
          <div className="admin-schedule-modal-header-left admin-schedule-modal-header-left--lg">
            <div className="admin-schedule-modal-icon-badge">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="admin-schedule-modal-title">
                Adjust Operating Hours
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHoursModal(prev => ({ ...prev, isOpen: false }))}
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
            {PRESET_HOURS.map((p) => {
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setHoursModal(prev => ({
                    ...prev,
                    openHour: p.openHour,
                    openMinute: p.openMinute,
                    openPeriod: p.openPeriod,
                    closeHour: p.closeHour,
                    closeMinute: p.closeMinute,
                    closePeriod: p.closePeriod,
                    note: p.note
                  }))}
                  className="admin-schedule-modal-preset-btn"
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {/* Open & Close Time Controls */}
          <div className="admin-schedule-modal-time-picker-card">
            <div className="admin-schedule-modal-label admin-schedule-modal-label--bold-lg">
              Set Open & Close Hours:
            </div>

            {/* Open Time Row */}
            <div className="admin-schedule-form-group">
              <span className="admin-schedule-modal-picker-label admin-schedule-modal-picker-label--open">
                🟢 Opening Time:
              </span>
              <div className="admin-schedule-modal-picker-row admin-schedule-modal-picker-row--gap">
                <select
                  value={hoursModal.openHour}
                  onChange={(e) => setHoursModal(prev => ({ ...prev, openHour: e.target.value }))}
                  className="admin-schedule-modal-picker-select admin-schedule-modal-picker-select--auto"
                >
                  {['06','07','08','09','10','11','12'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={hoursModal.openMinute}
                  onChange={(e) => setHoursModal(prev => ({ ...prev, openMinute: e.target.value }))}
                  className="admin-schedule-modal-picker-select admin-schedule-modal-picker-select--auto"
                >
                  {['00','15','30','45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="admin-schedule-modal-period-group">
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setHoursModal(prev => ({ ...prev, openPeriod: p }))}
                      className={`admin-schedule-modal-period-btn--hours ${hoursModal.openPeriod === p ? 'admin-schedule-modal-period-btn--hours-open is-active' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Time Row */}
            <div>
              <span className="admin-schedule-modal-picker-label admin-schedule-modal-picker-label--close">
                🔴 Closing Time:
              </span>
              <div className="admin-schedule-modal-picker-row admin-schedule-modal-picker-row--gap">
                <select
                  value={hoursModal.closeHour}
                  onChange={(e) => setHoursModal(prev => ({ ...prev, closeHour: e.target.value }))}
                  className="admin-schedule-modal-picker-select admin-schedule-modal-picker-select--auto"
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={hoursModal.closeMinute}
                  onChange={(e) => setHoursModal(prev => ({ ...prev, closeMinute: e.target.value }))}
                  className="admin-schedule-modal-picker-select admin-schedule-modal-picker-select--auto"
                >
                  {['00','15','30','45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="admin-schedule-modal-period-group">
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setHoursModal(prev => ({ ...prev, closePeriod: p }))}
                      className={`admin-schedule-modal-period-btn--hours ${hoursModal.closePeriod === p ? 'admin-schedule-modal-period-btn--hours-close is-active' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Badge */}
            <div className="admin-schedule-modal-preview-badge--amber">
              <span className="admin-schedule-subtitle">Hours for {selectedDate.split('-').reverse().join('-')}:</span>
              <strong className="admin-schedule-preview-bold-time">
                {formatSlotTime(hoursModal.openHour, hoursModal.openMinute, hoursModal.openPeriod)} – {formatSlotTime(hoursModal.closeHour, hoursModal.closeMinute, hoursModal.closePeriod)}
              </strong>
            </div>
          </div>  

          {/* Note / Reason */}
          <div className="admin-schedule-form-group--md">
            <label className="admin-schedule-modal-label">
              Note / Reason:
            </label>
            <input
              type="text"
              value={hoursModal.note}
              onChange={(e) => setHoursModal(prev => ({ ...prev, note: e.target.value }))}
              placeholder="e.g. Early opening for wedding group..."
              className="admin-schedule-modal-input"
            />
          </div>

          {/* Actions */}
          <div className="admin-schedule-modal-actions-between">
            {effectiveOperatingHours.isCustom && (
              <button
                type="button"
                onClick={onResetHours}
                disabled={actionLoading}
                className="admin-schedule-modal-reset-btn"
              >
                <RotateCcw size={13} />
                <span>Reset to Default</span>
              </button>
            )}

            <div className="admin-schedule-modal-actions admin-schedule-modal-actions--end">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setHoursModal(prev => ({ ...prev, isOpen: false }))}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-primary-btn"
                disabled={actionLoading}
              >
                <Check size={16} />
                <span>{actionLoading ? 'Saving...' : 'Save Operating Hours'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
