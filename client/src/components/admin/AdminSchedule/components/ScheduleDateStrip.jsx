import React from 'react';
import { Lock } from 'lucide-react';
import ScheduleCustomDatePicker from './ScheduleCustomDatePicker';

export default function ScheduleDateStrip({ dateStrip, selectedDate, onSelectDate }) {
  return (
    <div className="admin-schedule-strip-card">
      <div className="admin-schedule-strip-header">
        <div className="admin-schedule-strip-title">
          📅 Quick Date Navigation (Next 21 Days)
        </div>
        <div className="admin-schedule-custom-date-wrap">
          <span className="admin-schedule-custom-date-label">Custom Date:</span>
          <ScheduleCustomDatePicker
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </div>
      </div>

      <div className="admin-schedule-strip-scroll">
        {dateStrip.map((item) => {
          const isSelected = item.iso === selectedDate;
          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => onSelectDate(item.iso)}
              className={`admin-schedule-day-item ${isSelected ? 'is-selected' : ''} ${item.isDateLocked ? 'is-locked' : ''}`}
            >
              {/* Dedicated Top Badge Slot */}
              <div className="admin-schedule-day-badge-slot">
                {item.isToday && (
                  <span className="admin-schedule-day-today-badge">
                    TODAY
                  </span>
                )}
              </div>

              <div className={`admin-schedule-day-name ${isSelected ? 'is-selected' : ''}`}>
                {item.dayName}
              </div>
              <div className={`admin-schedule-day-num ${isSelected ? 'is-selected' : ''} ${item.isDateLocked ? 'is-locked' : ''}`}>
                {item.dayNum}
              </div>
              <div className="admin-schedule-day-month">
                {item.monthName}
              </div>

              {/* Status Badges */}
              <div className="admin-schedule-day-status-col">
                {item.isDateLocked ? (
                  <span className="admin-schedule-day-closed-badge">
                    <Lock size={9} /> CLOSED
                  </span>
                ) : item.lockedSlotCount > 0 ? (
                  <span className="admin-schedule-day-locked-badge">
                    🔒 {item.lockedSlotCount} locked
                  </span>
                ) : null}

                {item.bookedCount > 0 && (
                  <span className="admin-schedule-day-booked-badge">
                    👤 {item.bookedCount} booked
                  </span>
                )}

                {item.customAddedCount > 0 && (
                  <span className="admin-schedule-day-custom-badge">
                    ✨ +{item.customAddedCount} custom
                  </span>
                )}

                {item.customRemovedCount > 0 && (
                  <span className="admin-schedule-day-hidden-badge">
                    👁️ -{item.customRemovedCount} hidden
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
