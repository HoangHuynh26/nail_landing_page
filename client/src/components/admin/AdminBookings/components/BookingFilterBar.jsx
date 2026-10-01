import React from 'react';
import {
  Calendar, CheckCheck, RefreshCw, Search, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import AdminDateFilterPill from '../../common/AdminDateFilterPill';

export function BookingFilterBar({
  unreadCount,
  onMarkAllAsViewed,
  onRefresh,
  loading,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  selectedDay,
  setSelectedDay,
  dayOptions,
  selectedMonth,
  setSelectedMonth,
  monthOptions,
  selectedYear,
  setSelectedYear,
  yearOptions,
  statusFilter,
  setStatusFilter,
  stats,
  totalBookingsCount,
  displayedBookingsCount,
  pageSize,
  setPageSize,
  safeCurrentPage,
  totalPages,
  setCurrentPage
}) {
  return (
    <>
      {/* Row 1: Top Header with Title, Badge, and Action Buttons */}
      <div className="admin-bookings-top-header">
        <div className="admin-bookings-header-title-wrap">
          <div className="admin-bookings-header-icon-box">
            <Calendar size={20} className="text-gold" />
          </div>
          <div>
            <div className="admin-bookings-title-row">
              <h2 className="admin-card__title admin-bookings-header-title">
                Appointment Bookings Management
              </h2>
              {unreadCount > 0 && (
                <span className="admin-tab-count-badge" title="Unviewed new bookings count">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <p className="admin-bookings-header-subtitle">
              Track, filter, and manage salon appointments, party pricing & vouchers
            </p>
          </div>
        </div>

        <div className="admin-bookings-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="admin-secondary-btn admin-mark-viewed-btn"
              onClick={onMarkAllAsViewed}
              title="Mark all new appointments as viewed"
            >
              <CheckCheck size={14} />
              <span>Mark All Viewed ({unreadCount})</span>
            </button>
          )}

          <button
            type="button"
            className="admin-secondary-btn admin-bookings-refresh-btn"
            onClick={onRefresh}
            title="Refresh bookings list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Row 2: Search & Date Filter Bar */}
      <div className="admin-bookings-filter-bar">
        {/* Search Box with Search Icon & Clear Button */}
        <form onSubmit={onSearchSubmit} className="admin-bookings-search-form">
          <Search size={16} className="admin-bookings-search-icon" />
          <input
            type="text"
            className="admin-bookings-search-input"
            placeholder="Search by client name, phone, code (#AURA), service, voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="admin-bookings-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search text"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Date Filter Group */}
        <div className="admin-bookings-date-group">
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

          {/* Reset Date Button */}
          {(selectedDay !== 'all' || selectedMonth !== 'all' || selectedYear !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedDay('all');
                setSelectedMonth('all');
                setSelectedYear('all');
              }}
              className="admin-filter-reset-btn"
              title="Reset Date filters"
            >
              <X size={13} />
              <span>Reset Date</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Filter Pills & Right-aligned Pagination Controls */}
      <div className="admin-status-filter-bar">
        <div className="admin-status-pills-group">
          <button
            type="button"
            className={`admin-status-pill-btn ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>All Bookings</span>
            <span className="admin-pill-counter">{stats?.total ?? totalBookingsCount}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn unviewed ${statusFilter === 'unviewed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('unviewed')}
          >
            <span className="status-dot unviewed" />
            <span>Unviewed / New</span>
            <span className="admin-pill-counter admin-pill-counter--unviewed">{unreadCount}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn pending ${statusFilter === 'pending' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <span className="status-dot pending" />
            <span>Pending</span>
            <span className="admin-pill-counter">{stats?.pending ?? 0}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn confirmed ${statusFilter === 'confirmed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            <span className="status-dot confirmed" />
            <span>Confirmed</span>
            <span className="admin-pill-counter">{stats?.confirmed ?? 0}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn completed ${statusFilter === 'completed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <span className="status-dot completed" />
            <span>Completed</span>
            <span className="admin-pill-counter">{stats?.completed ?? 0}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn cancelled ${statusFilter === 'cancelled' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            <span className="status-dot cancelled" />
            <span>Cancelled</span>
            <span className="admin-pill-counter">{stats?.cancelled ?? 0}</span>
          </button>

          {(selectedDay !== 'all' || selectedMonth !== 'all' || selectedYear !== 'all') && (
            <div className="admin-filter-badge" title="Active Date Filter">
              <Calendar size={13} />
              <span>
                {selectedDay !== 'all' ? `Day ${selectedDay} ` : ''}
                {selectedMonth !== 'all' ? `${monthOptions.find((m) => m.value === selectedMonth)?.label} ` : ''}
                {selectedYear !== 'all' ? selectedYear : ''} ({displayedBookingsCount} {displayedBookingsCount === 1 ? 'booking' : 'bookings'})
              </span>
            </div>
          )}
        </div>

        {/* Right-aligned Pagination Toolbar */}
        <div className="admin-bookings-pagination-toolbar">
          <div className="admin-bookings-per-page-box" title="Bookings per page">
            <span className="admin-bookings-per-page-label">Show:</span>
            <select
              className="admin-bookings-per-page-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="admin-bookings-per-page-unit">/ page</span>
          </div>

          <div className="admin-bookings-page-nav">
            <button
              type="button"
              className="admin-bookings-nav-arrow"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              title="Previous page"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="admin-bookings-page-counter" title={`Page ${safeCurrentPage} of ${totalPages}`}>
              <strong>{safeCurrentPage}</strong> / {totalPages}
            </span>

            <button
              type="button"
              className="admin-bookings-nav-arrow"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              title="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingFilterBar;
