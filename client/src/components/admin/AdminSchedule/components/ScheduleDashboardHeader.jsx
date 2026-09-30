import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, RotateCcw, Unlock, Lock, ShieldAlert } from 'lucide-react';
import { getPerthFormattedTime } from '../../../../utils/perthTime';

export default function ScheduleDashboardHeader({
  formattedSelectedDate,
  isToday,
  effectiveOperatingHours,
  slotsCount,
  hasCustomAdjustments,
  addedSlotsCount,
  removedSlotsCount,
  isWholeDayLocked,
  wholeDayReason,
  selectedDate,
  actionLoading,
  onOpenHoursModal,
  onResetDateSlots,
  onToggleWholeDay
}) {
  const [livePerthTime, setLivePerthTime] = useState(() => getPerthFormattedTime(true));

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePerthTime(getPerthFormattedTime(true));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="admin-schedule-dashboard-header">
        <div>
          <div className="admin-schedule-date-title-row">
            <h3 className="admin-schedule-date-title">
              {formattedSelectedDate}
            </h3>
            {isToday && (
              <span className="admin-schedule-today-pill">
                TODAY
              </span>
            )}
          </div>
          <div className="admin-schedule-hours-summary">
            <span>Operating Hours:</span>
            <strong className="admin-schedule-hours-bold">
              {effectiveOperatingHours.openTime} – {effectiveOperatingHours.closeTime} ({slotsCount} time slots)
            </strong>
            {effectiveOperatingHours.isCustom && (
              <span className="admin-schedule-custom-hours-badge">
                <Sparkles size={11} />
                {effectiveOperatingHours.note || 'Custom Hours / Overtime'}
              </span>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="admin-schedule-actions-row">
          {/* Adjust Operating Hours Button */}
          <button
            type="button"
            className={`admin-secondary-btn admin-schedule-adjust-hours-btn ${effectiveOperatingHours.isCustom ? 'is-custom' : ''}`}
            onClick={onOpenHoursModal}
            disabled={actionLoading || isWholeDayLocked}
            title="Adjust opening and closing hours for this date (early open / overtime)"
          >
            <Clock size={16} className={`admin-schedule-adjust-hours-icon ${effectiveOperatingHours.isCustom ? 'is-custom' : ''}`} />
            <span>{effectiveOperatingHours.isCustom ? 'Hours Adjusted' : 'Adjust Hours'}</span>
          </button>

          {/* Reset to defaults button if modified */}
          {hasCustomAdjustments && (
            <button
              type="button"
              className="admin-reset-slots-btn"
              onClick={onResetDateSlots}
              disabled={actionLoading}
              title="Reset to standard default schedule for this date"
            >
              <RotateCcw size={14} />
              <span>Reset to Default ({addedSlotsCount} added, {removedSlotsCount} hidden)</span>
            </button>
          )}

          {/* Toggle Entire Day Lock Button */}
          {isWholeDayLocked ? (
            <button
              type="button"
              className="admin-primary-btn admin-schedule-unlock-day-btn"
              onClick={onToggleWholeDay}
              disabled={actionLoading}
            >
              <Unlock size={16} />
              <span>Unlock Day</span>
            </button>
          ) : (
            <button
              type="button"
              className="admin-primary-btn admin-schedule-lock-day-btn"
              onClick={onToggleWholeDay}
              disabled={actionLoading}
            >
              <Lock size={16} />
              <span>Lock Entire Day</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner if Entire Day is Locked */}
      {isWholeDayLocked && (
        <div className="admin-schedule-day-locked-banner">
          <div className="admin-schedule-banner-left">
            <ShieldAlert size={22} className="admin-schedule-banner-icon" />
            <div>
              <div className="admin-schedule-banner-title">
                Entire Day is Locked ({selectedDate})
              </div>
              <div className="admin-schedule-banner-subtitle">
                Reason: <strong>{wholeDayReason}</strong> — Customers cannot book any appointments on this date.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleWholeDay}
            className="admin-schedule-banner-btn"
          >
            Unlock Now
          </button>
        </div>
      )}
    </>
  );
}
