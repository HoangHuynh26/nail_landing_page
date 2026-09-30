import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Check, Clock, Zap } from 'lucide-react';
import { HOURS_12, MINUTES_60, LOCK_DURATIONS, QUICK_REASONS } from '../constants';
import ScheduleCustomSelect from './ScheduleCustomSelect';
import { getPerthFormattedTime, getPerth12HourParts } from '../../../../utils/perthTime';

export default function ScheduleLockTool({
  selectedDate,
  lockTool,
  setLockTool,
  isSelectedSlotCurrentlyLocked,
  selectedLockSlotStr,
  actionLoading,
  onLock,
  onUnlock
}) {
  const [livePerthTime, setLivePerthTime] = useState(() => getPerthFormattedTime(false));

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePerthTime(getPerthFormattedTime(false));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetCurrentPerthTime = (roundTo15 = true) => {
    const parts = getPerth12HourParts(roundTo15);
    setLockTool(prev => ({
      ...prev,
      hour: parts.hour,
      minute: parts.minute,
      period: parts.period
    }));
  };

  const reasonOptions = [
    { value: '', label: 'Default: Full slot' },
    ...QUICK_REASONS.map(r => ({ value: r, label: r }))
  ];

  return (
    <div className="admin-schedule-lock-tool-card">
      {/* Header with Title and Current Status Badge */}
      <div className="admin-schedule-lock-tool-header">
        <div className="admin-schedule-lock-tool-left">
          <div className="admin-schedule-lock-tool-icon-wrap">
            <Lock size={16} />
          </div>
          <div>
            <h4 className="admin-schedule-lock-tool-title">
              Lock Specific Slot or Range {selectedDate.split('-').reverse().join('-')}
            </h4>
          </div>
        </div>

        {/* Current selected slot lock status */}
        <div className={`admin-schedule-lock-tool-status ${isSelectedSlotCurrentlyLocked ? 'is-locked' : 'is-open'}`}>
          {isSelectedSlotCurrentlyLocked ? (
            <>
              <Lock size={12} />
              <span>Time slot {selectedLockSlotStr} is LOCKED</span>
            </>
          ) : (
            <>
              <Check size={12} />
              <span>Time slot {selectedLockSlotStr} is OPEN</span>
            </>
          )}
        </div>
      </div>

      {/* Responsive Controls Container */}
      <div className="admin-schedule-lock-tool-controls">
        {/* Field 1: Time Slot Picker Group (Hour : Minute | AM PM) */}
        <div className="admin-schedule-lock-tool-field admin-schedule-lock-tool-field--time">
          <div className="admin-schedule-lock-tool-label-row">
            <label className="admin-schedule-lock-tool-label">
              <Clock size={12} className="inline-icon" />
              <span>TIME SLOT</span>
            </label>
          </div>
          <div className="admin-schedule-lock-tool-time-row">
            {/* Hour Dropdown */}
            <div className="admin-schedule-time-box admin-schedule-time-box--hour">
              <ScheduleCustomSelect
                value={lockTool.hour}
                onChange={(h) => setLockTool(prev => ({ ...prev, hour: h }))}
                options={HOURS_12.map(h => ({ value: h, label: h }))}
                className="admin-schedule-select--hour"
                ariaLabel="Select Hour"
              />
            </div>

            <span className="admin-schedule-lock-tool-colon">:</span>

            {/* Minute Dropdown */}
            <div className="admin-schedule-time-box admin-schedule-time-box--minute">
              <ScheduleCustomSelect
                value={lockTool.minute}
                onChange={(m) => setLockTool(prev => ({ ...prev, minute: m }))}
                options={MINUTES_60.map(m => ({ value: m, label: m }))}
                className="admin-schedule-select--minute"
                ariaLabel="Select Minute"
              />
            </div>

            {/* AM / PM Segmented Toggle */}
            <div className="admin-schedule-lock-tool-period-toggle">
              <button
                type="button"
                className={`admin-schedule-period-btn ${lockTool.period === 'AM' ? 'is-active' : ''}`}
                onClick={() => setLockTool(prev => ({ ...prev, period: 'AM' }))}
              >
                AM
              </button>
              <button
                type="button"
                className={`admin-schedule-period-btn ${lockTool.period === 'PM' ? 'is-active' : ''}`}
                onClick={() => setLockTool(prev => ({ ...prev, period: 'PM' }))}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Options Group: Duration & Reason */}
        <div className="admin-schedule-lock-tool-options-grid">
          {/* Field 2: Lock Duration */}
          <div className="admin-schedule-lock-tool-field admin-schedule-lock-tool-field--duration">
            <label className="admin-schedule-lock-tool-label">
              LOCK DURATION
            </label>
            <ScheduleCustomSelect
              value={lockTool.duration}
              onChange={(d) => setLockTool(prev => ({ ...prev, duration: d }))}
              options={LOCK_DURATIONS.map(d => ({ value: d.value, label: d.label }))}
              className="admin-schedule-select--duration"
              ariaLabel="Select Lock Duration"
            />
          </div>

          {/* Field 3: Lock Reason */}
          <div className="admin-schedule-lock-tool-field admin-schedule-lock-tool-field--reason">
            <label className="admin-schedule-lock-tool-label">
              LOCK REASON
            </label>
            <ScheduleCustomSelect
              value={lockTool.reason}
              onChange={(r) => setLockTool(prev => ({ ...prev, reason: r }))}
              options={reasonOptions}
              placeholder="Suggestions"
              className="admin-schedule-select--reason"
              ariaLabel="Select Lock Reason"
              align="right"
            />
          </div>
        </div>

        {/* Field 4: Action Buttons */}
        <div className="admin-schedule-lock-tool-actions">
          <button
            type="button"
            onClick={onLock}
            disabled={actionLoading}
            className="admin-schedule-lock-btn"
          >
            <Lock size={15} />
            <span>Lock Slot</span>
          </button>

          <button
            type="button"
            onClick={onUnlock}
            disabled={actionLoading}
            className="admin-schedule-unlock-btn"
          >
            <Unlock size={15} />
            <span>Unlock Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
