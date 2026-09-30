import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { getPerthNow } from '../../../../utils/perthTime';
import './ScheduleCustomDatePicker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function ScheduleCustomDatePicker({ selectedDate, onSelectDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Perth today reference
  const perthNow = useMemo(() => getPerthNow(), []);
  const perthTodayIso = perthNow.isoDate;

  // View year and month (0-indexed month)
  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) return parseInt(parts[0], 10);
    }
    return perthNow.year;
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) return parseInt(parts[1], 10) - 1;
    }
    return perthNow.month - 1;
  });

  // Keep view in sync when selectedDate changes externally and popup is closed
  useEffect(() => {
    if (!isOpen && selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [selectedDate, isOpen]);

  // Click outside & Escape key listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Jump to today
  const handleGoToday = (e) => {
    e.stopPropagation();
    setViewYear(perthNow.year);
    setViewMonth(perthNow.month - 1);
    onSelectDate(perthNow.isoDate);
    setIsOpen(false);
  };

  // Build calendar matrix
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month filler days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        month: m,
        year: y,
        iso,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        iso,
        isCurrentMonth: true
      });
    }

    // Next month filler days (grid to complete 35 or 42 cells)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        month: m,
        year: y,
        iso,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Formatted date string for button trigger: DD-MM-YYYY (e.g. 30-09-2026)
  const displayFormattedDate = useMemo(() => {
    if (!selectedDate) return 'Select date';
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return selectedDate;
  }, [selectedDate]);

  return (
    <div className="admin-datepicker-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`admin-datepicker-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarDays size={14} className="admin-datepicker-trigger-icon" />
        <span className="admin-datepicker-trigger-text">{displayFormattedDate}</span>
        <ChevronDown size={13} className={`admin-datepicker-trigger-chevron ${isOpen ? 'is-open' : ''}`} />
      </button>

      {isOpen && (
        <div className="admin-datepicker-popover" role="dialog" aria-modal="true">
          {/* Header: Month Year + Prev / Next Arrows */}
          <div className="admin-datepicker-header">
            <button
              type="button"
              className="admin-datepicker-nav-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="admin-datepicker-header-title">
              <span className="admin-datepicker-month-text">
                {MONTH_NAMES[viewMonth]}
              </span>
              <span className="admin-datepicker-year-text">
                {viewYear}
              </span>
            </div>

            <button
              type="button"
              className="admin-datepicker-nav-btn"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="admin-datepicker-weekdays">
            {WEEKDAY_NAMES.map((w, idx) => (
              <div key={idx} className="admin-datepicker-weekday">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="admin-datepicker-grid">
            {calendarCells.map((cell) => {
              const isSelected = cell.iso === selectedDate;
              const isToday = cell.iso === perthTodayIso;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={`admin-datepicker-day-cell ${
                    cell.isCurrentMonth ? 'is-current-month' : 'is-other-month'
                  } ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                  onClick={() => {
                    onSelectDate(cell.iso);
                    setIsOpen(false);
                  }}
                  title={cell.iso}
                >
                  <span className="admin-datepicker-day-number">{cell.day}</span>
                  {isToday && !isSelected && <span className="admin-datepicker-today-dot" />}
                </button>
              );
            })}
          </div>

          {/* Footer: Today button & Close button */}
          <div className="admin-datepicker-footer">
            <button
              type="button"
              className="admin-datepicker-footer-today-btn"
              onClick={handleGoToday}
            >
              Go to Today
            </button>
            <button
              type="button"
              className="admin-datepicker-footer-close-btn"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
