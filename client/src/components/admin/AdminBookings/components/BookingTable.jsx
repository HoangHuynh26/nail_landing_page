import React from 'react';
import BookingRow from './BookingRow';

export function BookingTable({
  loading,
  displayedBookings,
  statusFilter,
  paginatedBookings,
  targetBookingId,
  allServices,
  allVouchers,
  allCategories,
  getCategoryDisplayName,
  computeBookingFinancials,
  isUnviewed,
  onSelectBooking,
  onStatusChange,
  updatingId,
  onMarkAsViewed,
  cleanPhoneForWa
}) {
  return (
    <div className="admin-table-container">
      <div className="admin-table-mobile-hint">
        <span>⟵ Swipe horizontally to view full booking details ⟶</span>
      </div>
      <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Booking Ref</th>
            <th>Client Name</th>
            <th>Contact</th>
            <th>Service</th>
            <th>Party Size</th>
            <th>Total Price</th>
            <th>Date & Time</th>
            <th>Status (Click to Change)</th>
            <th>Quick Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="admin-table-loading-cell">
                <div className="admin-table-loading-text">Loading bookings...</div>
              </td>
            </tr>
          ) : displayedBookings.length === 0 ? (
            <tr>
              <td colSpan="9" className="admin-table-empty-cell">
                <div className="admin-table-empty-text">
                  {statusFilter === 'unviewed'
                    ? 'No unviewed new bookings. All incoming bookings have been checked!'
                    : 'No appointments found matching the current filter.'}
                </div>
              </td>
            </tr>
          ) : (
            paginatedBookings.map((b) => {
              const id = b.bookingId || b.id;
              const isTarget = Boolean(
                targetBookingId && (
                  id === targetBookingId ||
                  String(b.bookingId) === String(targetBookingId) ||
                  String(b.id) === String(targetBookingId)
                )
              );

              const financials = computeBookingFinancials(b, allServices, allVouchers);

              return (
                <BookingRow
                  key={id}
                  booking={b}
                  isUnviewed={isUnviewed}
                  isTarget={isTarget}
                  financials={financials}
                  allCategories={allCategories}
                  allServices={allServices}
                  getCategoryDisplayName={getCategoryDisplayName}
                  onSelectBooking={onSelectBooking}
                  onStatusChange={onStatusChange}
                  updatingId={updatingId}
                  onMarkAsViewed={onMarkAsViewed}
                  cleanPhoneForWa={cleanPhoneForWa}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default BookingTable;
