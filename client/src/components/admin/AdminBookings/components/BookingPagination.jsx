import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BookingPagination({
  displayedBookingsCount,
  startIndex,
  endIndex,
  pageSize,
  setPageSize,
  safeCurrentPage,
  totalPages,
  setCurrentPage
}) {
  if (displayedBookingsCount === 0) return null;

  return (
    <div className="admin-bookings-bottom-pagination">
      <span className="admin-bookings-bottom-info">
        Showing <strong>{startIndex + 1}</strong> – <strong>{endIndex}</strong> of <strong>{displayedBookingsCount}</strong> bookings
      </span>

      <div className="admin-bookings-bottom-actions">
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
  );
}

export default BookingPagination;
