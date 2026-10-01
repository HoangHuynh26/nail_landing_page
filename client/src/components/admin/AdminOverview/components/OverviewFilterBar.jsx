import React from 'react';
import { Calendar, RefreshCw, X } from 'lucide-react';
import AdminDateFilterPill from '../../common/AdminDateFilterPill';

export function OverviewFilterBar({
  selectedDay,
  setSelectedDay,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  dayOptions,
  monthOptions,
  yearOptions,
  todayDay,
  todayMonth,
  todayYear,
  isTodayFiltered,
  hasDateFilter,
  stats,
  loading,
  onRefresh,
  monthOptionsList
}) {
  return (
    <>
      {/* Top Filter Bar: Day, Month, Year */}
      <div className="admin-overview-filter-bar">
        <div className="admin-overview-header-left">
          <div className="admin-overview-header-icon">
            <Calendar size={18} />
          </div>
          <div>
            <div className="admin-overview-header-title">
              Statistics bookings
            </div>
          </div>
        </div>

        {/* 3 Select Boxes: Day, Month, Year + Quick Today & Reset */}
        <div className="admin-overview-filter-controls">
          <div className="admin-overview-date-group">
            <AdminDateFilterPill
              label="DAY:"
              value={selectedDay}
              onChange={setSelectedDay}
              options={dayOptions}
              title="Filter by Day"
              align="left"
            />

            <AdminDateFilterPill
              label="MONTH:"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={monthOptions}
              title="Filter by Month"
              align="center"
            />

            <AdminDateFilterPill
              label="YEAR:"
              value={selectedYear}
              onChange={setSelectedYear}
              options={yearOptions}
              title="Filter by Year"
              align="right"
            />
          </div>

          <div className="admin-overview-actions-group">
            {/* Quick "Today" Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedDay(todayDay);
                setSelectedMonth(todayMonth);
                setSelectedYear(todayYear);
              }}
              className={`admin-today-btn ${isTodayFiltered ? 'is-active' : ''}`}
              title="Statistics for today"
            >
              <Calendar size={13} />
              <span>Today</span>
            </button>

            {/* Reset / All Time button */}
            {hasDateFilter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDay('all');
                  setSelectedMonth('all');
                  setSelectedYear('all');
                }}
                className="admin-filter-reset-btn"
                title="View all appointments (All Time)"
              >
                <X size={13} />
                <span>All Time</span>
              </button>
            )}

            {/* Refresh button */}
            <button
              type="button"
              onClick={onRefresh}
              className="admin-overview-refresh-btn"
              title="Refresh data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator Badge */}
      <div className={`admin-filter-indicator ${isTodayFiltered ? 'admin-filter-indicator--today' : hasDateFilter ? 'admin-filter-indicator--filtered' : 'admin-filter-indicator--all'}`}>
        <Calendar size={14} />
        <span>
          {isTodayFiltered ? (
            <>📅 <strong>Today: {selectedDay}-{selectedMonth}-{selectedYear}</strong></>
          ) : hasDateFilter ? (
            <>
              Filtering: {selectedDay !== 'all' ? `${selectedDay} - ` : ''}
              {selectedMonth !== 'all' ? `${monthOptionsList?.find((m) => m.value === selectedMonth)?.value} - ` : ''}
              {selectedYear !== 'all' ? `${selectedYear}` : ''}
            </>
          ) : (
            <>📅 <strong>Filtering: All Time</strong></>
          )}
          {' '}— Total: <strong>{stats?.total ?? 0}</strong> bookings
        </span>
      </div>
    </>
  );
}

export default OverviewFilterBar;
