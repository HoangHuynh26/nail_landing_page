import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  CalendarDays,
  User,
  Phone,
  Sparkles,
  Users,
  ArrowDown,
  ArrowUp,
  Tag,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  RotateCcw
} from 'lucide-react';
import { parseSlotToMinutes, getPerth12HourParts } from '../../../../utils/perthTime';
import { formatPrice } from '../../../../utils/priceFormatter';
import { servicesData } from '../../../../data/services';
import { computeBookingFinancials, getCategoryDisplayName } from '../../AdminBookings/AdminBookings';
import ScheduleCustomSelect from './ScheduleCustomSelect';

export default function ScheduleBookedSlots({
  selectedDate,
  sortedBookings = [],
  onStatusUpdated
}) {
  // Sort mode: newest slot time first by default
  const [sortMode, setSortMode] = useState('newest_time'); // 'newest_time' | 'oldest_time' | 'newest_created'

  // Default period based on current Western Australia (Perth) time: AM or PM
  const [periodFilter, setPeriodFilter] = useState(() => {
    try {
      const parts = getPerth12HourParts(false);
      return parts.period === 'PM' ? 'PM' : 'AM';
    } catch {
      return 'AM';
    }
  }); // 'AM' | 'PM' | 'ALL'

  // Time slot dropdown filter (e.g. 'all' or '09:00 AM')
  const [timeSlotFilter, setTimeSlotFilter] = useState('all');

  // Pagination state: page size choices 10, 20, 30
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Status updating tracking
  const [updatingId, setUpdatingId] = useState(null);

  // Local optimistic state of bookings
  const [localBookings, setLocalBookings] = useState(sortedBookings);

  useEffect(() => {
    setLocalBookings(sortedBookings);
  }, [sortedBookings]);

  const [allServices, setAllServices] = useState(servicesData);
  const [allVouchers, setAllVouchers] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Fetch catalog services, vouchers, and categories for accurate financial & category matching
  useEffect(() => {
    fetch('/api/services?active=true')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.services) && d.services.length > 0) {
          setAllServices(d.services);
        }
      })
      .catch(() => {});

    fetch('/api/vouchers')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.vouchers)) {
          setAllVouchers(d.vouchers);
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.categories)) {
          setAllCategories(d.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Compute booked time slots with count for the active period filter
  const bookedSlotsInPeriod = useMemo(() => {
    const inPeriod = localBookings.filter(b => {
      if (!b.time) return false;
      const isAM = b.time.toUpperCase().includes('AM');
      if (periodFilter === 'AM') return isAM;
      if (periodFilter === 'PM') return !isAM;
      return true; // 'ALL'
    });

    const slotCounts = {};
    inPeriod.forEach(b => {
      const slot = b.time.trim();
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });

    return Object.keys(slotCounts)
      .sort((a, b) => parseSlotToMinutes(a) - parseSlotToMinutes(b))
      .map(slot => ({
        time: slot,
        count: slotCounts[slot]
      }));
  }, [localBookings, periodFilter]);

  // Total bookings matching the period filter
  const periodTotalCount = useMemo(() => {
    return bookedSlotsInPeriod.reduce((sum, item) => sum + item.count, 0);
  }, [bookedSlotsInPeriod]);

  // Options for Time Slot Dropdown Filter
  const timeSlotOptions = useMemo(() => {
    const allLabel = periodFilter === 'ALL'
      ? `All Time Slots (${periodTotalCount})`
      : `All ${periodFilter} Slots (${periodTotalCount})`;

    return [
      { value: 'all', label: allLabel },
      ...bookedSlotsInPeriod.map(s => ({
        value: s.time,
        label: `${s.time} (${s.count} ${s.count > 1 ? 'bookings' : 'booking'})`
      }))
    ];
  }, [periodFilter, periodTotalCount, bookedSlotsInPeriod]);

  // If period changes and current slot filter is not in the new period, reset slot filter
  useEffect(() => {
    if (timeSlotFilter !== 'all') {
      const exists = bookedSlotsInPeriod.some(s => s.time === timeSlotFilter);
      if (!exists) {
        setTimeSlotFilter('all');
      }
    }
  }, [periodFilter, bookedSlotsInPeriod, timeSlotFilter]);

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [periodFilter, timeSlotFilter, sortMode, pageSize]);

  // Filter & Sort pipeline
  const filteredBookings = useMemo(() => {
    // 1. Period filter
    let list = localBookings.filter(b => {
      if (!b.time) return false;
      const isAM = b.time.toUpperCase().includes('AM');
      if (periodFilter === 'AM') return isAM;
      if (periodFilter === 'PM') return !isAM;
      return true;
    });

    // 2. Specific time slot dropdown filter
    if (timeSlotFilter !== 'all') {
      list = list.filter(b => b.time && b.time.trim() === timeSlotFilter.trim());
    }

    // 3. Sorting
    return [...list].sort((a, b) => {
      if (sortMode === 'newest_time') {
        const timeDiff = parseSlotToMinutes(b.time) - parseSlotToMinutes(a.time);
        if (timeDiff !== 0) return timeDiff;

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;

        return (b.id || 0) - (a.id || 0);
      } else if (sortMode === 'oldest_time') {
        const timeDiff = parseSlotToMinutes(a.time) - parseSlotToMinutes(b.time);
        if (timeDiff !== 0) return timeDiff;

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;

        return (b.id || 0) - (a.id || 0);
      } else if (sortMode === 'newest_created') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;

        return (b.id || 0) - (a.id || 0);
      }
      return 0;
    });
  }, [localBookings, periodFilter, timeSlotFilter, sortMode]);

  // Pagination calculation
  const totalCount = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return filteredBookings.slice(startIdx, startIdx + pageSize);
  }, [filteredBookings, safeCurrentPage, pageSize]);

  // Handle status update (Completed / Cancelled)
  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setLocalBookings(prev =>
          prev.map(b => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status: newStatus } : b))
        );
        if (typeof onStatusUpdated === 'function') {
          onStatusUpdated(bookingId, newStatus);
        }
      } else {
        alert(data.message || 'Failed to update booking status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-schedule-booked-card">
      {/* Top Header Row */}
      <div className="admin-schedule-booked-header">
        <div className="admin-schedule-booked-left">
          <div className="admin-schedule-booked-icon-badge">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="admin-schedule-booked-title">
              Booked Appointment Slots ({localBookings.length})
            </h3>
          </div>
        </div>

        {/* Top Controls: Pagination on the left of Arrange */}
        {localBookings.length > 0 && (
          <div className="admin-schedule-controls-row">
            {/* Pagination Controls */}
            <div className="admin-schedule-pagination-control">
              {/* Page Size Selector Dropdown (10, 20, 30) */}
              <div className="admin-schedule-pagesize-group">
                <span className="admin-schedule-control-label">Show:</span>
                <ScheduleCustomSelect
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 30, label: '30' }
                  ]}
                  className="admin-schedule-pagesize-custom-select"
                  ariaLabel="Show bookings per page"
                />
              </div>

              {/* Prev / Page / Next */}
              <div className="admin-schedule-page-nav">
                <button
                  type="button"
                  className="admin-schedule-page-btn"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  title="Previous Page"
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Arrange Sort Group */}
            <div className="admin-schedule-sort-control">
              <span className="admin-schedule-sort-label">Arrange:</span>
              <div className="admin-schedule-sort-btn-group">
                <button
                  type="button"
                  className={`admin-schedule-sort-btn ${sortMode === 'newest_time' ? 'is-active' : ''}`}
                  onClick={() => setSortMode('newest_time')}
                  title="Khung giờ mới nhất đến cũ nhất"
                >
                  <ArrowDown size={13} />
                  <span>Latest</span>
                </button>

                <button
                  type="button"
                  className={`admin-schedule-sort-btn ${sortMode === 'oldest_time' ? 'is-active' : ''}`}
                  onClick={() => setSortMode('oldest_time')}
                  title="Khung giờ cũ nhất đến mới nhất"
                >
                  <ArrowUp size={13} />
                  <span>Oldest</span>
                </button>

                <button
                  type="button"
                  className={`admin-schedule-sort-btn ${sortMode === 'newest_created' ? 'is-active' : ''}`}
                  onClick={() => setSortMode('newest_created')}
                  title="Khách vừa đặt gần đây nhất"
                >
                  <span>Just placed</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subfilter Bar: AM / PM Period Filter & Booked Slots Dropdown Filter */}
      {localBookings.length > 0 && (
        <div className="admin-schedule-subfilter-bar">
          {/* Period Filter (AM / PM / All) */}
          <div className="admin-schedule-filter-group">
            <span className="admin-schedule-control-label">Period:</span>
            <div className="admin-schedule-period-filter-group">
              <button
                type="button"
                className={`admin-schedule-period-filter-btn ${periodFilter === 'AM' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('AM')}
                title="Filter morning appointments"
              >
                <Sun size={13} className="admin-schedule-period-icon" />
                <span>AM</span>
              </button>

              <button
                type="button"
                className={`admin-schedule-period-filter-btn ${periodFilter === 'PM' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('PM')}
                title="Filter afternoon appointments"
              >
                <Moon size={13} className="admin-schedule-period-icon" />
                <span>PM</span>
              </button>

              <button
                type="button"
                className={`admin-schedule-period-filter-btn ${periodFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setPeriodFilter('ALL')}
                title="Show all day appointments"
              >
                <span>All</span>
              </button>
            </div>
          </div>

          {/* Time Slot Dropdown Filter */}
          <div className="admin-schedule-filter-group admin-schedule-filter-group--timeslot">
            <span className="admin-schedule-control-label">Time Slot:</span>
            <div className="admin-schedule-slot-select-wrap">
              <ScheduleCustomSelect
                value={timeSlotFilter}
                onChange={(val) => setTimeSlotFilter(val)}
                options={timeSlotOptions}
                className="admin-schedule-timeslot-custom-select"
                ariaLabel="Filter bookings by time slot"
              />
            </div>
          </div>

          {/* Showing Count */}
          <div className="admin-schedule-filter-count">
            Showing <strong>{filteredBookings.length === 0 ? 0 : `${(safeCurrentPage - 1) * pageSize + 1}–${Math.min(safeCurrentPage * pageSize, filteredBookings.length)}`}</strong> of <strong>{filteredBookings.length}</strong> bookings
            {timeSlotFilter !== 'all' && (
              <button
                type="button"
                className="admin-schedule-clear-filter-btn"
                onClick={() => setTimeSlotFilter('all')}
                title="Clear time slot filter"
              >
                <RotateCcw size={11} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content: Empty State or Bookings Grid */}
      {localBookings.length === 0 ? (
        <div className="admin-schedule-empty-box">
          <CalendarDays size={32} className="admin-schedule-empty-icon" />
          <div className="admin-schedule-empty-title">
            No customer bookings scheduled for {selectedDate ? selectedDate.split('-').reverse().join('-') : 'today'}
          </div>
          <div className="admin-schedule-empty-subtitle">
            All available slots are open and ready for customer online reservations.
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="admin-schedule-empty-box">
          <CalendarDays size={30} className="admin-schedule-empty-icon" />
          <div className="admin-schedule-empty-title">
            No bookings found for the selected {periodFilter !== 'ALL' ? periodFilter : ''} filter
          </div>
          <div className="admin-schedule-empty-subtitle">
            Try switching between AM / PM or resetting the time slot dropdown.
          </div>
          <button
            type="button"
            className="admin-schedule-reset-filters-btn"
            onClick={() => {
              setPeriodFilter('ALL');
              setTimeSlotFilter('all');
            }}
          >
            Show All Bookings ({localBookings.length})
          </button>
        </div>
      ) : (
        <div className="admin-schedule-booked-grid">
          {paginatedBookings.map((b) => {
            const rawRef = b.bookingId || b.booking_id || b.id;
            const displayRef = rawRef
              ? (String(rawRef).startsWith('#') || String(rawRef).includes('-') ? String(rawRef) : `#${rawRef}`)
              : '';

            const catName = getCategoryDisplayName(b.category, allCategories, b.service, allServices);
            const financials = computeBookingFinancials(b, allServices, allVouchers);
            const guests = Math.max(1, Number(b.guests) || Number(financials.guests) || 1);
            const id = b.bookingId || b.booking_id || b.id;
            const isUpdatingThis = updatingId === id;

            return (
              <div
                key={b.id || b.booking_id || b.bookingId}
                className="admin-schedule-booking-item"
              >
                {/* Slot Time, Booking Ref & Status */}
                <div className="admin-schedule-booking-item-header">
                  <div className="admin-schedule-booking-header-left">
                    <div className="admin-schedule-booking-time-wrap">
                      <Clock size={16} className="admin-schedule-booking-clock-icon" />
                      <span className="admin-schedule-booking-time">
                        {b.time}
                      </span>
                    </div>
                    {displayRef && (
                      <span className="admin-schedule-booking-ref-badge" title="Booking Reference ID">
                        {displayRef}
                      </span>
                    )}
                  </div>
                  <span
                    className={`admin-schedule-booking-status-badge ${
                      b.status === 'confirmed'
                        ? 'is-confirmed'
                        : b.status === 'completed'
                        ? 'is-completed'
                        : b.status === 'cancelled'
                        ? 'is-cancelled'
                        : 'is-pending'
                    }`}
                  >
                    {b.status === 'confirmed'
                      ? '✓ Confirmed'
                      : b.status === 'completed'
                      ? '✓ Completed'
                      : b.status === 'cancelled'
                      ? '✕ Cancelled'
                      : '⏳ Pending'}
                  </span>
                </div>

                {/* Customer info: Who & What service */}
                <div className="admin-schedule-booking-inner-box">
                  <div className="admin-schedule-booking-row">
                    <User size={14} className="admin-schedule-booking-user-icon" />
                    <span className="admin-schedule-booking-customer-name">
                      {b.name}
                    </span>
                  </div>

                  <div className="admin-schedule-booking-row">
                    <Phone size={13} className="admin-schedule-booking-user-icon" />
                    <a href={`tel:${b.phone}`} className="admin-schedule-booking-phone-link">
                      {b.phone}
                    </a>
                  </div>

                  {/* Service, Category, Party Size and Price */}
                  <div className="admin-schedule-booking-service-row">
                    <div className="admin-schedule-booking-service-info">
                      <Sparkles size={13} className="admin-schedule-booking-sparkle-icon" />
                      <span className="admin-schedule-booking-service-name">
                        {b.service}
                      </span>
                      {catName && (
                        <span className="admin-schedule-booking-cat-badge" title="Category">
                          {catName}
                        </span>
                      )}
                      <span
                        className={`admin-schedule-booking-party-badge ${guests > 1 ? 'is-group' : ''}`}
                        title="Party Size"
                      >
                        <Users size={11} /> {guests > 1 ? `${guests} Guests` : '1 Person'}
                      </span>
                    </div>

                    {/* Pricing with Voucher Discount */}
                    <div className="admin-schedule-booking-pricing-wrap">
                      {financials.hasVoucher ? (
                        <div className="admin-schedule-booking-price-col">
                          <div className="admin-schedule-booking-price-compare">
                            {financials.totalOriginalPrice > financials.totalFinalPrice && (
                              <span className="admin-booking-price-strike admin-schedule-booking-price-strike">
                                ${formatPrice(financials.totalOriginalPrice)}
                              </span>
                            )}
                            <span className="admin-booking-price-discount admin-schedule-booking-price-discount">
                              ${formatPrice(financials.totalFinalPrice)}
                            </span>
                          </div>
                          {financials.voucherInfo && (
                            <span
                              className="admin-booking-voucher-badge admin-schedule-booking-voucher-badge"
                              title={financials.voucherInfo.name}
                            >
                              <Tag size={10} className="admin-booking-voucher-icon admin-schedule-booking-voucher-icon" />
                              <span>{financials.voucherInfo.code}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="admin-schedule-booking-price">
                          ${formatPrice(financials.totalFinalPrice != null ? financials.totalFinalPrice : (b.price || 0))}
                        </span>
                      )}
                    </div>
                  </div>

                  {b.notes && (
                    <div className="admin-schedule-booking-notes">
                      Notes: {b.notes}
                    </div>
                  )}

                  {/* Quick Action Buttons: Only show when not completed and not cancelled */}
                  {b.status !== 'completed' && b.status !== 'cancelled' && (
                    <div className="admin-schedule-booking-actions-row">
                      <button
                        type="button"
                        className="admin-schedule-btn-complete"
                        disabled={isUpdatingThis}
                        onClick={() => {
                          if (window.confirm(`Xác nhận hoàn tất dịch vụ cho khách "${b.name}"?`)) {
                            handleStatusChange(id, 'completed');
                          }
                        }}
                        title="Khách làm xong dịch vụ - chuyển sang Completed"
                      >
                        {isUpdatingThis ? (
                          <span className="admin-schedule-spin-loader" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        <span>Complete</span>
                      </button>

                      <button
                        type="button"
                        className="admin-schedule-btn-cancel"
                        disabled={isUpdatingThis}
                        onClick={() => {
                          if (window.confirm(`Xác nhận khách không đến / hủy lịch cho "${b.name}"?`)) {
                            handleStatusChange(id, 'cancelled');
                          }
                        }}
                        title="Khách không đến / Hủy lịch"
                      >
                        <XCircle size={13} />
                        <span>No Show / Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
