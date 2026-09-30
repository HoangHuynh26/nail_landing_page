import React from 'react';
import {
  MessageSquare, Phone, Mail, Tag, Eye, CheckCheck
} from 'lucide-react';
import { formatPrice } from '../../../../utils/priceFormatter';

export function BookingRow({
  booking,
  isUnviewed,
  isTarget,
  financials,
  allCategories,
  allServices,
  getCategoryDisplayName,
  onSelectBooking,
  onStatusChange,
  updatingId,
  onMarkAsViewed,
  cleanPhoneForWa
}) {
  const b = booking;
  const id = b.bookingId || b.id;
  const unviewed = isUnviewed(id);

  const {
    guests,
    unitPrice,
    totalOriginalPrice,
    totalFinalPrice,
    hasVoucher,
    voucherInfo
  } = financials;

  return (
    <tr
      id={`booking-row-${id}`}
      className={`${unviewed ? 'is-unread-booking' : ''} ${isTarget ? 'is-target-focused' : ''} admin-booking-row`}
      onClick={() => onSelectBooking(b)}
      title={unviewed ? 'New unviewed booking! Click to view details' : 'Click to view details'}
    >
      <td className="cell-nowrap">
        <div className="admin-booking-id-wrap">
          <span
            className={`admin-booking-id admin-booking-id-text ${unviewed ? 'is-unviewed' : ''}`}
          >
            {b.bookingId || `#${b.id}`}
          </span>
          {unviewed && (
            <span className="admin-unread-pill" title="New appointment received via socket">
              <span className="admin-pulse-dot admin-booking-pulse-dot" /> NEW
            </span>
          )}
        </div>
      </td>
      <td>
        <div className="admin-booking-client-name-row">
          <span className="admin-booking-client-name">{b.name}</span>
          {(() => {
            const noteText = (b.message || '')
              .replace(/\[10% Discount:.*?\]\s*(-)?\s*/gi, '')
              .replace(/\[Voucher:[^\]]*\]/gi, '')
              .trim();
            return noteText ? (
              <span
                className="admin-booking-has-note-badge"
                title={`Customer Note: "${noteText}" (Click to view details)`}
              >
                <MessageSquare size={11} />
                <span>Note</span>
              </span>
            ) : null;
          })()}
        </div>
      </td>
      <td className="cell-nowrap">
        <div className="admin-booking-contact-wrap">
          <a
            href={`tel:${b.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="admin-booking-phone-link"
          >
            <Phone size={12} /> {b.phone}
          </a>
          {b.email && (
            <a
              href={`mailto:${b.email}`}
              onClick={(e) => e.stopPropagation()}
              className="admin-booking-email-link"
            >
              <Mail size={12} /> {b.email}
            </a>
          )}
        </div>
      </td>
      <td>
        <div className="admin-booking-service-title">{b.service}</div>
        {(() => {
          const catName = getCategoryDisplayName(b.category, allCategories, b.service, allServices);
          return catName ? (
            <div className="admin-booking-service-category-sub">
              {catName}
            </div>
          ) : null;
        })()}
      </td>
      <td className="cell-nowrap">
        <span className={`admin-booking-party-pill ${guests > 1 ? 'is-group' : ''}`}>
          <span>{guests > 1 ? `${guests} Guests` : '1 Person'}</span>
        </span>
      </td>
      <td className="cell-nowrap">
        <div className="admin-booking-pricing-wrap">
          {totalOriginalPrice > 0 ? (
            hasVoucher && totalFinalPrice < totalOriginalPrice ? (
              <div className="admin-booking-price-col">
                <div className="admin-booking-price-compare">
                  <span className="admin-booking-price-strike">${formatPrice(totalOriginalPrice)}</span>
                  <span className="admin-booking-price-discount">${formatPrice(totalFinalPrice)}</span>
                </div>
                {voucherInfo && (
                  <span className="admin-booking-voucher-badge" title={voucherInfo.name}>
                    <Tag size={10} className="admin-booking-voucher-icon" />
                    <span>{voucherInfo.code}</span>
                  </span>
                )}
                {guests > 1 && (
                  <span className="admin-booking-price-calc-note">
                    (${formatPrice(unitPrice)} × {guests})
                  </span>
                )}
              </div>
            ) : (
              <div className="admin-booking-price-col">
                <span className="admin-booking-price-normal">${formatPrice(totalFinalPrice)}</span>
                {voucherInfo && (
                  <span className="admin-booking-voucher-badge" title={voucherInfo.name}>
                    <Tag size={10} className="admin-booking-voucher-icon" />
                    <span>{voucherInfo.code}</span>
                  </span>
                )}
                {guests > 1 && (
                  <span className="admin-booking-price-calc-note">
                    (${formatPrice(unitPrice)} × {guests})
                  </span>
                )}
              </div>
            )
          ) : (
            <div className="admin-booking-price-col">
              <span className="admin-booking-price-normal">
                {b.price != null && Number(b.price) > 0 ? `$${formatPrice(b.price)}` : '—'}
              </span>
              {voucherInfo && (
                <span className="admin-booking-voucher-badge" title={voucherInfo.name}>
                  <Tag size={10} className="admin-booking-voucher-icon" />
                  <span>{voucherInfo.code}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="cell-nowrap">
        <div className="admin-booking-date-text">{b.date.split('-').reverse().join('-')}</div>
        <div
          className={`admin-booking-time admin-booking-time-text ${unviewed ? 'is-unviewed' : ''}`}
        >
          {b.time}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()} className="cell-nowrap">
        <select
          value={b.status || 'pending'}
          onChange={(e) => onStatusChange(id, e.target.value)}
          disabled={updatingId === id}
          className={`status-badge ${(b.status || 'pending').toLowerCase()}`}
          title="Click to update status"
        >
          <option value="pending">PENDING</option>
          <option value="confirmed">CONFIRMED</option>
          <option value="completed">COMPLETED</option>
          <option value="cancelled">CANCELLED</option>
        </select>
      </td>
      <td onClick={(e) => e.stopPropagation()} className="cell-nowrap">
        <div className="admin-action-btn-group">
          {/* View details */}
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => onSelectBooking(b)}
            title="View appointment details"
          >
            <Eye size={14} />
          </button>

          {/* Explicit mark as viewed checkmark */}
          {unviewed && (
            <button
              type="button"
              className="admin-icon-btn is-unread-action admin-booking-icon-viewed"
              onClick={() => onMarkAsViewed(id)}
              title="Mark as viewed"
            >
              <CheckCheck size={14} />
            </button>
          )}

          {/* WhatsApp / SMS Direct */}
          <a
            href={`https://wa.me/${cleanPhoneForWa(b.phone)}?text=Hi%20${encodeURIComponent(b.name)},%20confirming%20your%20appointment%20at%20Fashion%20Nails%20Morley%20Galleria`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-icon-btn"
            title="Contact on WhatsApp"
          >
            <MessageSquare size={14} />
          </a>
        </div>
      </td>
    </tr>
  );
}

export default BookingRow;
