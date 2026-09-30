import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { parseSlotToMinutes, getPerth12HourParts } from '../../../../utils/perthTime';
import ScheduleCustomSelect from './ScheduleCustomSelect';

export default function ScheduleLockedSlots({
  selectedDate,
  currentLockedSlots = [],
  locksData,
  actionLoading,
  onUnlockSingle,
  onUnlockAll
}) {
  // AM / PM / ALL filter - default according to Western Australia time
  const [periodFilter, setPeriodFilter] = useState(() => {
    try {
      const parts = getPerth12HourParts(false);
      return parts.period === 'PM' ? 'PM' : 'AM';
    } catch {
      return 'ALL';
    }
  });

  // Pagination for locked slots (especially useful when full ranges are locked)
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);

  // Counts for each period
  const { amCount, pmCount } = useMemo(() => {
    let am = 0;
    let pm = 0;
    currentLockedSlots.forEach((slot) => {
      if (slot.toUpperCase().includes('AM')) am++;
      else pm++;
    });
    return { amCount: am, pmCount: pm };
  }, [currentLockedSlots]);

  // If initial period has 0 slots but the other period has slots, auto-switch to period with slots
  useEffect(() => {
    if (periodFilter === 'AM' && amCount === 0 && pmCount > 0) {
      setPeriodFilter('PM');
    } else if (periodFilter === 'PM' && pmCount === 0 && amCount > 0) {
      setPeriodFilter('AM');
    }
  }, [amCount, pmCount]);

  // Filter slots by active period
  const filteredSlots = useMemo(() => {
    return currentLockedSlots.filter((slot) => {
      const isAM = slot.toUpperCase().includes('AM');
      if (periodFilter === 'AM') return isAM;
      if (periodFilter === 'PM') return !isAM;
      return true; // 'ALL'
    });
  }, [currentLockedSlots, periodFilter]);

  // Reset page when filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [periodFilter, pageSize]);

  // Pagination calculation
  const totalCount = filteredSlots.length;
  const isAllPage = pageSize === 'all';
  const totalPages = isAllPage ? 1 : Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSlots = useMemo(() => {
    if (isAllPage) return filteredSlots;
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return filteredSlots.slice(startIdx, startIdx + pageSize);
  }, [filteredSlots, safeCurrentPage, pageSize, isAllPage]);

  return (
    <div className="admin-schedule-locked-card">
      {/* Top Header */}
      <div className="admin-schedule-locked-header">
        <div className="admin-schedule-locked-left">
          <div className="admin-schedule-locked-icon-badge">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="admin-schedule-locked-title">
              Locked Time Slots ({currentLockedSlots.length})
            </h3>
          </div>
        </div>

        {/* Right side controls: Unlock All button */}
        {currentLockedSlots.length > 0 && (
          <div className="admin-schedule-locked-header-actions">
            <button
              type="button"
              onClick={onUnlockAll}
              disabled={actionLoading}
              className="admin-schedule-unlock-all-btn"
            >
              <Unlock size={14} />
              <span>Unlock All ({currentLockedSlots.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* AM / PM Filter Bar & Pagination */}
      {currentLockedSlots.length > 0 && (
        <div className="admin-schedule-locked-filter-bar">
          {/* Period Filter Buttons */}
          <div className="admin-schedule-locked-filter-group">
            <span className="admin-schedule-control-label">Period:</span>
            <div className="admin-schedule-period-filter-group">
              <button
                type="button"
                className={`admin-schedule-period-filter-btn ${periodFilter === 'AM' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('AM')}
                title="Show morning locked slots"
              >
                <Sun size={13} className="admin-schedule-period-icon" />
                <span>AM ({amCount})</span>
              </button>

              <button
                type="button"
                className={`admin-schedule-period-filter-btn ${periodFilter === 'PM' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('PM')}
                title="Show afternoon locked slots"
              >
                <Moon size={13} className="admin-schedule-period-icon" />
                <span>PM ({pmCount})</span>
              </button>

              <button
                type="button"
                className={`admin-schedule-period-filter-btn ${periodFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('ALL')}
                title="Show all locked slots"
              >
                <span>All ({currentLockedSlots.length})</span>
              </button>
            </div>
          </div>

          {/* Pagination Controls if more than 24 slots */}
          {filteredSlots.length > 24 && (
            <div className="admin-schedule-locked-pagination">
              <div className="admin-schedule-pagesize-group">
                <span className="admin-schedule-control-label">Show:</span>
                <ScheduleCustomSelect
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(val === 'all' ? 'all' : Number(val));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 24, label: '24' },
                    { value: 48, label: '48' },
                    { value: 'all', label: 'All' }
                  ]}
                  className="admin-schedule-pagesize-custom-select"
                  ariaLabel="Show locked slots per page"
                />
              </div>

              {!isAllPage && totalPages > 1 && (
                <div className="admin-schedule-page-nav">
                  <button
                    type="button"
                    className="admin-schedule-page-btn"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span className="admin-schedule-page-indicator">
                    {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    className="admin-schedule-page-btn"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Showing count indicator */}
          <div className="admin-schedule-filter-count">
            Showing <strong>{filteredSlots.length === 0 ? 0 : isAllPage ? filteredSlots.length : `${(safeCurrentPage - 1) * pageSize + 1}–${Math.min(safeCurrentPage * pageSize, filteredSlots.length)}`}</strong> of <strong>{filteredSlots.length}</strong> locked slots
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {currentLockedSlots.length === 0 ? (
        <div className="admin-schedule-locked-empty">
          <CheckCircle2 size={18} />
          <span>No time slots are currently locked on this day.</span>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="admin-schedule-empty-box">
          <div className="admin-schedule-empty-title">
            No locked time slots found in {periodFilter === 'AM' ? 'Morning (AM)' : 'Afternoon (PM)'}
          </div>
          <div className="admin-schedule-empty-subtitle">
            There are {periodFilter === 'AM' ? pmCount : amCount} locked slots in {periodFilter === 'AM' ? 'PM' : 'AM'}.
          </div>
          <button
            type="button"
            className="admin-schedule-reset-filters-btn"
            onClick={() => setPeriodFilter('ALL')}
          >
            <RotateCcw size={13} style={{ marginRight: 6 }} />
            Show All Locked Slots ({currentLockedSlots.length})
          </button>
        </div>
      ) : (
        <div className="admin-schedule-locked-grid">
          {paginatedSlots.map((slot) => {
            const reason = locksData.slotReasons[`${selectedDate}_${slot}`] || 'Locked by Admin';
            return (
              <div
                key={slot}
                className="admin-schedule-locked-item"
              >
                <div>
                  <div className="admin-schedule-locked-item-header">
                    <div className="admin-schedule-locked-time-wrap">
                      <Lock size={15} />
                      <span className="admin-schedule-locked-time">
                        {slot}
                      </span>
                    </div>
                    <span className="admin-schedule-locked-pill">
                      LOCKED
                    </span>
                  </div>
                  <div className="admin-schedule-locked-reason">
                    Reason: <strong>{reason}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUnlockSingle(slot)}
                  disabled={actionLoading}
                  className="admin-schedule-unlock-single-btn"
                  title={`Unlock slot ${slot}`}
                >
                  <Unlock size={13} />
                  <span>Unlock this slot</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
