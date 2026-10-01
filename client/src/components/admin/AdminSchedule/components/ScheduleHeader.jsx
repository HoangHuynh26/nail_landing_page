import React, { useState, useEffect } from 'react';
import { CalendarDays, RefreshCw, Clock } from 'lucide-react';
import { getPerthFormattedTime } from '../../../../utils/perthTime';

export default function ScheduleHeader({ loading, actionLoading, onRefresh }) {
  const [perthTime, setPerthTime] = useState(() => getPerthFormattedTime(true));

  useEffect(() => {
    const timer = setInterval(() => {
      setPerthTime(getPerthFormattedTime(true));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="admin-schedule-header">
      <div>
        <div className="admin-schedule-header-left">
          <div className="admin-schedule-icon-badge">
            <CalendarDays size={22} />
          </div>
          <div>
            <h2 className="admin-schedule-title">
              Schedule & Time Slot Management
            </h2>
          </div>
        </div>
      </div>

      <div className="admin-schedule-header-actions">
        <button
          type="button"
          className="admin-secondary-btn admin-schedule-refresh-btn"
          onClick={onRefresh}
          disabled={loading || actionLoading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
