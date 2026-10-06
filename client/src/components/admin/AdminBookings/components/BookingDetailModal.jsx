import React from 'react';
import {
  X, Phone, Mail, Users, Clock, Tag, CheckCircle2, MessageSquare, CheckCheck
} from 'lucide-react';
import { formatPrice } from '../../../../utils/priceFormatter';

export function BookingDetailModal({
  selectedBooking,
  onClose,
  allServices,
  allVouchers,
  allCategories,
  getCategoryDisplayName,
  computeBookingFinancials,
  cleanPhoneForWa,
  handleStatusChange,
  isUnviewed,
  markAsViewed
}) {
  if (!selectedBooking) return null;

  const modalFinancials = computeBookingFinancials(selectedBooking, allServices, allVouchers);
  const {
    guests,
    unitPrice,
    totalOriginalPrice,
    discountAmount,
    totalFinalPrice,
    hasVoucher,
    voucherInfo,
    duration
  } = modalFinancials;

  // Clean user personal message (removes internal [10% Discount: ...] or [Voucher: ...] prefixes)
  const cleanedNotes = (selectedBooking.message || '')
    .replace(/\[10% Discount:.*?\]\s*(-)?\s*/gi, '')
    .replace(/\[Voucher:.*?\]\s*(-)?\s*/gi, '')
    .trim();

  const partyText = guests > 1 ? ` (${guests} guests)` : '';
  const waText = hasVoucher && totalOriginalPrice > 0
    ? `Hi ${selectedBooking.name}, confirming your appointment for ${selectedBooking.service}${partyText} on ${selectedBooking.date} at ${selectedBooking.time}. Voucher ${voucherInfo.code} (${voucherInfo.badgeText}) applied! Discounted Total: $${formatPrice(totalFinalPrice)} (Original: $${formatPrice(totalOriginalPrice)}). See you soon at Fashion Nails Morley Galleria!`
    : `Hi ${selectedBooking.name}, confirming your appointment for ${selectedBooking.service}${partyText} on ${selectedBooking.date} at ${selectedBooking.time}${totalFinalPrice > 0 ? ` (Total: $${formatPrice(totalFinalPrice)})` : ''}. See you soon at Fashion Nails Morley Galleria!`;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box admin-booking-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-booking-modal-header">
          <div>
            <span className="admin-booking-modal-pretitle">
              Appointment Details
            </span>
            <h3 className="admin-booking-modal-title">
              {selectedBooking.bookingId || `#${selectedBooking.id}`}
            </h3>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="admin-booking-modal-body">
          {/* Client Info */}
          <div className="admin-booking-card-client">
            <div className="admin-booking-section-label">Client Information</div>
            <div className="admin-booking-section-title">
              {selectedBooking.name}
            </div>
            <div className="admin-booking-client-contacts">
              <a href={`tel:${selectedBooking.phone}`} className="admin-booking-phone-link">
                <Phone size={13} /> {selectedBooking.phone}
              </a>
              {selectedBooking.email && (
                <a href={`mailto:${selectedBooking.email}`} className="admin-booking-email-link">
                  <Mail size={13} /> {selectedBooking.email}
                </a>
              )}
            </div>
          </div>

          {/* Service & Detailed Pricing Breakdown Card */}
          <div className="admin-booking-card-service">
            <div className="admin-booking-card-service-row">
              <div>
                <div className="admin-booking-section-label">Service Booked</div>
                <div className="admin-booking-service-name">
                  {selectedBooking.service}
                </div>
                {(() => {
                  const catName = getCategoryDisplayName(selectedBooking.category, allCategories, selectedBooking.service, allServices);
                  return catName ? (
                    <div className="admin-booking-service-cat-pill">
                      Category: <strong>{catName}</strong>
                    </div>
                  ) : null;
                })()}
                <div className="admin-booking-service-meta-row">
                  <span className="admin-booking-service-duration">
                    <Clock size={12} /> Duration: ~{duration} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Price Breakdown Calculation Box (Unit Price × Guests = Subtotal, Voucher Applied) */}
            <div className="admin-booking-calc-breakdown-box">
              <div className="admin-booking-calc-breakdown-header">
                <span className="admin-booking-calc-breakdown-title">
                  PRICE BREAKDOWN
                </span>
              </div>

              <div className="admin-booking-calc-breakdown-grid">
                {/* Item 1: Service Unit Price */}
                <div className="admin-booking-calc-item">
                  <span className="admin-booking-calc-label">UNIT PRICE</span>
                  <div className="admin-booking-calc-value">
                    {unitPrice > 0 ? `$${formatPrice(unitPrice)}` : 'Custom'}
                    <span className="admin-booking-calc-sub"></span>
                  </div>
                </div>

                {/* Item 2: Number of People */}
                <div className="admin-booking-calc-item">
                  <span className="admin-booking-calc-label">PARTY SIZE</span>
                  <div className="admin-booking-calc-value">
                    {guests} {guests > 1 ? 'people' : 'person'}
                  </div>
                </div>

                {/* Item 3: Original Subtotal */}
                <div className="admin-booking-calc-item is-subtotal">
                  <span className="admin-booking-calc-label">SUBTOTAL</span>
                  <div className="admin-booking-calc-value admin-booking-calc-subtotal">
                    ${formatPrice(totalOriginalPrice)}
                  </div>
                </div>
              </div>

              {/* Voucher / Promo Code Row */}
              {hasVoucher && voucherInfo ? (
                <div className="admin-booking-calc-voucher-row is-applied">
                  <div className="admin-booking-calc-voucher-left">
                    <Tag size={13} className="admin-booking-calc-voucher-icon is-applied" />
                    <span className="admin-booking-calc-voucher-label">Discount / Promo Code:</span>
                    <span className="admin-booking-voucher-chip-code">{voucherInfo.code}</span>
                    {voucherInfo.discountType === 'percentage' && (
                      <span className="admin-booking-voucher-chip-pct">(-{voucherInfo.discountValue}%)</span>
                    )}
                  </div>
                  <div className="admin-booking-calc-voucher-discount">
                    - ${formatPrice(discountAmount)}
                  </div>
                </div>
              ) : (
                <div className="admin-booking-calc-voucher-row is-none">
                  <div className="admin-booking-calc-voucher-left">
                    <Tag size={13} className="admin-booking-calc-voucher-icon is-none" />
                    <span className="admin-booking-calc-voucher-label">Discount / Promo Code:</span>
                    <span className="admin-booking-voucher-none-badge">None</span>
                  </div>
                  <div className="admin-booking-calc-voucher-none-amt">
                    $0
                  </div>
                </div>
              )}

              {/* Final Total Row */}
              <div className="admin-booking-calc-total-row">
                <div className="admin-booking-calc-total-label">
                  <span>{hasVoucher && discountAmount > 0 ? 'Total Amount Payable (After Discount):' : 'Total Amount Payable:'}</span>
                </div>
                <div className="admin-booking-calc-total-amount">
                  {hasVoucher && discountAmount > 0 && (
                    <span className="admin-booking-calc-strike">${formatPrice(totalOriginalPrice)}</span>
                  )}
                  <span className="admin-booking-calc-final">${formatPrice(totalFinalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voucher & Promotion Applied Card */}
          {hasVoucher && voucherInfo && (
            <div className="admin-booking-voucher-banner">
              <div className="admin-booking-voucher-header">
                <div className="admin-booking-voucher-title">
                  <CheckCircle2 size={19} className="admin-booking-voucher-icon-lg" />
                  <span>Voucher & Promotion Applied</span>
                </div>
                <span className="admin-booking-voucher-tag-badge">
                  {voucherInfo.badgeText} DISCOUNT
                </span>
              </div>

              {/* Voucher Details Grid */}
              <div className="admin-booking-voucher-grid">
                <div>
                  <span className="admin-booking-field-label-sm">
                    Voucher Code
                  </span>
                  <span className="admin-booking-voucher-code-chip">
                    <Tag size={12} /> {voucherInfo.code}
                  </span>
                </div>

                <div>
                  <span className="admin-booking-field-label-sm">
                    Discount Type
                  </span>
                  <span className="admin-booking-voucher-type-val">
                    {voucherInfo.discountType === 'percentage'
                      ? `Percentage: -${voucherInfo.discountValue}%`
                      : voucherInfo.discountType === 'fixed'
                      ? `Fixed Amount: -$${voucherInfo.discountValue}`
                      : voucherInfo.typeLabel}
                  </span>
                </div>

                {(voucherInfo.minSpend > 0 || voucherInfo.maxDiscount > 0) && (
                  <div className="admin-booking-voucher-limits">
                    {voucherInfo.minSpend > 0 && (
                      <span>Min spend: <strong>${voucherInfo.minSpend}</strong></span>
                    )}
                    {voucherInfo.maxDiscount > 0 && (
                      <span>Max discount: <strong>${voucherInfo.maxDiscount}</strong></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="admin-booking-time-row">
            <div className="admin-booking-time-label">Scheduled Date & Time</div>
            <div className="admin-booking-section-title">
              {selectedBooking.date.split('-').reverse().join('-')} | {selectedBooking.time}
            </div>
          </div>

          {/* Special Request / Notes */}
          <div className="admin-booking-notes-section">
            <div className="admin-booking-notes-label">
              <MessageSquare size={13} />
              <span>Customer Note / Special Request:</span>
            </div>
            {cleanedNotes ? (
              <div className="admin-booking-notes-box">
                <div className="admin-booking-notes-content">
                  "{cleanedNotes}"
                </div>
              </div>
            ) : (
              <div className="admin-booking-notes-empty">
                No special notes or requests provided for this booking.
              </div>
            )}
          </div>

          {/* Status Selector */}
          <div className="admin-booking-status-row">
            <span className="admin-booking-status-label">Appointment Status:</span>
            <select
              value={selectedBooking.status || 'pending'}
              onChange={(e) => handleStatusChange(selectedBooking.bookingId || selectedBooking.id, e.target.value)}
              className={`status-badge ${(selectedBooking.status || 'pending').toLowerCase()}`}
            >
              <option value="pending">🟡 PENDING</option>
              <option value="confirmed">🔵 CONFIRMED</option>
              <option value="completed">🟢 COMPLETED</option>
              <option value="cancelled">🔴 CANCELLED</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="admin-booking-actions-row">
            {isUnviewed(selectedBooking.bookingId || selectedBooking.id) && (
              <button
                type="button"
                className="admin-secondary-btn admin-mark-viewed-btn"
                onClick={() => markAsViewed(selectedBooking.bookingId || selectedBooking.id)}
              >
                <CheckCheck size={15} />
                <span>Mark as Viewed</span>
              </button>
            )}
            <a
              href={`https://wa.me/${cleanPhoneForWa(selectedBooking.phone)}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-primary-btn admin-booking-wa-btn"
            >
              <MessageSquare size={16} />
              <span>Send WhatsApp Confirmation</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetailModal;
