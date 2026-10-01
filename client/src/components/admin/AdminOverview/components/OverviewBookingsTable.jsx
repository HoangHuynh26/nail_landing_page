import React from 'react';
import { Users, ArrowRight, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { formatPrice } from '../../../../utils/priceFormatter';

export function OverviewBookingsTable({
  isTodayFiltered,
  hasDateFilter,
  selectedDay,
  selectedMonth,
  selectedYear,
  recentBookings,
  loading,
  paginatedBookings,
  totalAppointments,
  totalPages,
  safeCurrentPage,
  startIndex,
  pageSize,
  setCurrentPage,
  setActiveTab,
  onSelectBooking,
  isUnviewed,
  liveServices,
  liveCategories,
  getCategoryDisplayName,
  periodFilter = 'ALL',
  onPeriodChange,
  allCount = 0,
  amCount = 0,
  pmCount = 0
}) {
  return (
    <div className="admin-card">
      <div className="admin-card__header admin-overview-table-header">
        <div className="admin-overview-header-left">
          <h3 className="admin-card__title">
            <Users size={18} className="text-gold" />
            <span>
              {isTodayFiltered ? "Today's Appointments" : (hasDateFilter ? "Filtered Appointments" : "Recent Appointment Requests")}
            </span>
          </h3>

          {/* AM / PM Segmented Filter */}
          <div className="admin-overview-period-group">
            <button
              type="button"
              className={`admin-overview-period-btn ${periodFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => onPeriodChange && onPeriodChange('ALL')}
              title="Show all appointments"
            >
              All ({allCount})
            </button>
            <button
              type="button"
              className={`admin-overview-period-btn ${periodFilter === 'AM' ? 'active' : ''}`}
              onClick={() => onPeriodChange && onPeriodChange('AM')}
              title="Show morning (AM) appointments"
            >
              <Sun size={12} className="admin-overview-period-icon" />
              <span>AM ({amCount})</span>
            </button>
            <button
              type="button"
              className={`admin-overview-period-btn ${periodFilter === 'PM' ? 'active' : ''}`}
              onClick={() => onPeriodChange && onPeriodChange('PM')}
              title="Show afternoon/evening (PM) appointments"
            >
              <Moon size={12} className="admin-overview-period-icon" />
              <span>PM ({pmCount})</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() => {
            setActiveTab('bookings');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="admin-table-wrap admin-overview-desktop-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Party Size</th>
              <th>Estimated Price</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="admin-table-loading-cell">
                  Loading recent appointments...
                </td>
              </tr>
            ) : totalAppointments === 0 ? (
              <tr>
                <td colSpan="6" className="admin-table-empty-cell">
                  {periodFilter !== 'ALL'
                    ? `No ${periodFilter} appointments scheduled for ${isTodayFiltered ? 'today' : 'selected filter'}.`
                    : (isTodayFiltered
                        ? `No appointments scheduled for today ${selectedDay}-${selectedMonth}-${selectedYear}`
                        : (hasDateFilter
                            ? `No appointments found matching the selected filter.`
                            : 'No appointment bookings received yet.'))}
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => {
                const id = b.bookingId || b.id;
                const unviewed = isUnviewed ? isUnviewed(id) : false;
                const guests = Number(b.guests) || 1;
                const foundService = (liveServices || []).find(s =>
                  (b.serviceId && s.id === b.serviceId) ||
                  (s.name && s.name.toLowerCase() === (b.service || '').toLowerCase()) ||
                  (s.name_en && s.name_en.toLowerCase() === (b.service || '').toLowerCase())
                );
                const unitPrice = foundService?.price != null ? Number(foundService.price) : null;
                const displayPrice = b.price != null
                  ? Number(b.price)
                  : (unitPrice != null ? unitPrice * guests : null);

                return (
                  <tr
                    key={id}
                    className={`${unviewed ? 'is-unread-booking' : ''} admin-clickable-row`}
                    onClick={() => {
                      if (onSelectBooking) {
                        onSelectBooking(id);
                      } else {
                        setActiveTab('bookings');
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={unviewed ? 'New unviewed booking! Click to view in Bookings' : 'Click to view in Bookings'}
                  >
                    <td>
                      <div className="admin-client-name-wrap">
                        <span className="admin-client-name">{b.name}</span>
                        {unviewed && (
                          <span className="admin-unread-pill" title="New appointment">
                            <span className="admin-pulse-dot admin-pulse-dot--white" /> NEW
                          </span>
                        )}
                      </div>
                      <div className="admin-client-phone">{b.phone}</div>
                    </td>
                    <td>
                      <div className="admin-service-name">{b.service}</div>
                      {(() => {
                        const catName = getCategoryDisplayName(b.category, liveCategories, b.service, liveServices);
                        return catName ? (
                          <div className="admin-booking-service-category-sub" style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                            {catName}
                          </div>
                        ) : null;
                      })()}
                      {b.voucher && (
                        <div className="admin-voucher-tag-wrap">
                          <span className="admin-voucher-tag">
                            🏷️ {(() => {
                              const vLow = (b.voucher || '').toLowerCase();
                              return (vLow.includes('10%') || vLow.includes('community') || vLow.includes('senior') || vLow.includes('student') || vLow.includes('staff'))
                                ? '10% Discount'
                                : b.voucher;
                            })()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="cell-nowrap">
                      <span className={`admin-booking-party-pill ${guests > 1 ? 'is-group' : ''}`}>
                        <Users size={11} />
                        <span>{guests > 1 ? `${guests} Guests` : '1 Person'}</span>
                      </span>
                    </td>
                    <td className="cell-nowrap">
                      <div className="admin-overview-price-wrap">
                        <span className="admin-overview-price-val">
                          {displayPrice != null ? `$${formatPrice(displayPrice)}` : '—'}
                        </span>
                        {guests > 1 && unitPrice != null && (
                          <span className="admin-overview-price-sub">
                            (${formatPrice(unitPrice)} × {guests})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="cell-nowrap">
                      <div className="admin-booking-date">{b.date.split('-').reverse().join('-')}</div>
                      <div className={`admin-booking-time ${unviewed ? 'admin-booking-time--unviewed' : ''}`}>
                        {b.time}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${(b.status || 'pending').toLowerCase()}`}>
                        {b.status === 'confirmed'
                          ? '🔵 CONFIRMED'
                          : b.status === 'completed'
                          ? '🟢 COMPLETED'
                          : b.status === 'cancelled'
                          ? '🔴 CANCELLED'
                          : '🟡 PENDING'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Appointments Card List (< 768px) */}
      <div className="admin-overview-mobile-bookings admin-overview-mobile-only">
        {loading ? (
          <div className="admin-table-loading-cell">Loading appointments...</div>
        ) : totalAppointments === 0 ? (
          <div className="admin-table-empty-cell">
            {periodFilter !== 'ALL'
              ? `No ${periodFilter} appointments scheduled for ${isTodayFiltered ? 'today' : 'selected filter'}.`
              : (isTodayFiltered
                  ? `No appointments scheduled for today ${selectedDay}-${selectedMonth}-${selectedYear}`
                  : (hasDateFilter
                      ? `No appointments found matching the selected filter.`
                      : 'No appointment bookings received yet.'))}
          </div>
        ) : (
          paginatedBookings.map((b) => {
            const id = b.bookingId || b.id;
            const unviewed = isUnviewed ? isUnviewed(id) : false;
            const guests = Number(b.guests) || 1;
            const foundService = (liveServices || []).find(s =>
              (b.serviceId && s.id === b.serviceId) ||
              (s.name && s.name.toLowerCase() === (b.service || '').toLowerCase()) ||
              (s.name_en && s.name_en.toLowerCase() === (b.service || '').toLowerCase())
            );
            const unitPrice = foundService?.price != null ? Number(foundService.price) : null;
            const displayPrice = b.price != null
              ? Number(b.price)
              : (unitPrice != null ? unitPrice * guests : null);
            const catName = getCategoryDisplayName(b.category, liveCategories, b.service, liveServices);

            return (
              <div
                key={id}
                className={`admin-overview-booking-card ${unviewed ? 'is-unread-booking' : ''}`}
                onClick={() => {
                  if (onSelectBooking) onSelectBooking(id);
                  else setActiveTab('bookings');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {/* Card Top: Client & Status */}
                <div className="admin-overview-card-top">
                  <div className="admin-overview-card-client">
                    <div className="admin-client-name-wrap">
                      <span className="admin-client-name">{b.name}</span>
                      {unviewed && (
                        <span className="admin-unread-pill" title="New appointment">
                          <span className="admin-pulse-dot admin-pulse-dot--white" /> NEW
                        </span>
                      )}
                    </div>
                    <div className="admin-client-phone">{b.phone}</div>
                  </div>
                  <span className={`status-badge ${(b.status || 'pending').toLowerCase()}`}>
                    {b.status === 'confirmed'
                      ? '🔵 CONFIRMED'
                      : b.status === 'completed'
                      ? '🟢 COMPLETED'
                      : b.status === 'cancelled'
                      ? '🔴 CANCELLED'
                      : '🟡 PENDING'}
                  </span>
                </div>

                {/* Service Details */}
                <div className="admin-overview-card-service-box">
                  <div className="admin-service-name">{b.service}</div>
                  {catName && <div className="admin-booking-service-category-sub">{catName}</div>}
                  {b.voucher && (
                    <div className="admin-voucher-tag-wrap">
                      <span className="admin-voucher-tag">
                        🏷️ {(() => {
                          const vLow = (b.voucher || '').toLowerCase();
                          return (vLow.includes('10%') || vLow.includes('community') || vLow.includes('senior') || vLow.includes('student') || vLow.includes('staff'))
                            ? '10% Discount'
                            : b.voucher;
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Meta details: Party, Price, Date & Time */}
                <div className="admin-overview-card-meta-row">
                  <div className="admin-overview-card-meta-left">
                    <span className={`admin-booking-party-pill ${guests > 1 ? 'is-group' : ''}`}>
                      <Users size={11} />
                      <span>{guests > 1 ? `${guests} Guests` : '1 Person'}</span>
                    </span>
                    <span className="admin-overview-price-val">
                      {displayPrice != null ? `$${formatPrice(displayPrice)}` : '—'}
                    </span>
                  </div>
                  <div className="admin-overview-card-meta-date">
                    <span>{b.date?.split('-').reverse().join('-')} • <strong>{b.time}</strong></span>
                  </div>
                </div>

                {/* Action Tap Hint */}
                <div className="admin-overview-card-tap-hint">
                  <span>View Details & Manage Booking</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls - 10 Bookings Per Page */}
      <div className="admin-overview-pagination-bar">
        <div className="admin-overview-pagination-info">
          Showing{' '}
          <strong>
            {totalAppointments === 0 ? 0 : startIndex + 1} -{' '}
            {Math.min(startIndex + pageSize, totalAppointments)}
          </strong>{' '}
          of <strong>{totalAppointments}</strong> appointments
          {periodFilter !== 'ALL' && (
            <span className="admin-overview-period-badge">
              {periodFilter === 'AM' ? '☀️ Morning (AM)' : '🌙 Afternoon (PM)'}
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-overview-pagination-nav">
            <button
              type="button"
              className="admin-overview-page-arrow"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              title="Previous page"
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <span className="admin-overview-page-indicator">
              Page <strong>{safeCurrentPage}</strong> / {totalPages}
            </span>

            <button
              type="button"
              className="admin-overview-page-arrow"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              title="Next page"
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewBookingsTable;
