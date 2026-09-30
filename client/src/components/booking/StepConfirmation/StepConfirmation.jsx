import './StepConfirmation.css';
import React from 'react';
import {
  CheckCircle2, Calendar, MapPin, Mail, Users, Download, ExternalLink,
  User, Phone, Sparkles, Tag
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';

export function StepConfirmation() {
  const { language, t } = useLanguage();
  const { bookingResult, formData, closeBooking, resetBooking, downloadICS, getGoogleCalendarUrl } = useBooking();

  const handleDone = () => {
    resetBooking();
    closeBooking();
  };

  const formatDateDisplay = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr + 'T00:00:00');
      return d.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const refCode = bookingResult?.bookingId || 'AURA-8291';
  const customerName = bookingResult?.fullName || bookingResult?.name || formData?.fullName || 'Valued Guest';
  const customerPhone = bookingResult?.phone || formData?.phone || '';
  const customerEmail = bookingResult?.email || formData?.email || '';
  const serviceName = bookingResult?.serviceName || bookingResult?.service || formData?.serviceName || formData?.service || 'Nail Treatment';
  const rawCat = bookingResult?.category || bookingResult?.serviceCategory || formData?.serviceCategory || '';
  const OFFICIAL_CATEGORY_MAP = {
    biab: 'Builder Gel - BIAB',
    shellac: 'Shellac Nails',
    acrylic: 'Acrylic Nails',
    gelx: 'Gel X Extensions',
    sns: 'SNS Dipping',
    polish: 'Nail Polish',
    extra: 'Extra Services'
  };
  const categoryName = OFFICIAL_CATEGORY_MAP[rawCat?.toLowerCase()?.trim()] || rawCat;
  const guestsCount = Number(bookingResult?.guests || formData?.guests) || 1;
  const unitPrice = Number(bookingResult?.unitPrice ?? bookingResult?.servicePrice ?? formData?.servicePrice ?? 0);
  const calculatedSubtotal = unitPrice * guestsCount;
  const rawPrice = Number(bookingResult?.originalPrice ?? calculatedSubtotal);
  const appliedVoucher = bookingResult?.appliedVoucher;
  const hasDiscount = Boolean(
    appliedVoucher ||
    bookingResult?.hasDiscount ||
    formData?.hasDiscount ||
    (bookingResult?.voucher && String(bookingResult.voucher).toLowerCase().includes('10%'))
  );
  const discountAmount = appliedVoucher
    ? (appliedVoucher.discountAmount || 0)
    : hasDiscount && !isNaN(rawPrice) && rawPrice > 0 ? Math.round(rawPrice * 0.1) : 0;
  const finalPrice = appliedVoucher
    ? (appliedVoucher.finalPrice ?? Math.max(0, rawPrice - discountAmount))
    : bookingResult?.price != null
    ? Number(bookingResult.price)
    : hasDiscount && !isNaN(rawPrice) && rawPrice > 0 ? (rawPrice - discountAmount) : rawPrice;
  const voucherTitle = appliedVoucher
    ? `Voucher ${appliedVoucher.voucher.code}`
    : '10% Off for Seniors, Students & Morley Galleria Staff';
  const voucherBadge = appliedVoucher
    ? (appliedVoucher.voucher.discountType === 'percentage'
        ? `-${appliedVoucher.voucher.discountValue}%`
        : `-$${appliedVoucher.voucher.discountValue} AUD`)
    : '-10% APPLIED';
  const apptDate = bookingResult?.date || formData?.date;
  const apptTime = bookingResult?.time || formData?.time;

  return (
    <div className="booking-step booking-step--confirmation">
      <div className="booking-confirm-badge">
        <CheckCircle2 size={48} className="booking-confirm-badge__icon" />
      </div>

      <h3 className="booking-confirm__title">{t('booking.successTitle')}</h3>
      <p className="booking-confirm__subtitle">{t('booking.successSubtitle')}</p>

      {/* Reference Card */}
      <div className="booking-confirm-card">
        <div className="booking-confirm-card__ref-row">
          <span className="booking-confirm-card__ref-label">{t('booking.refCode')}</span>
          <strong className="booking-confirm-card__ref-value">{refCode}</strong>
        </div>

        <div className="booking-confirm-card__details booking-confirm-card-details-gap">
          {/* 1. Customer Information */}
          <div className="booking-confirm-customer-box">
            <div className="booking-confirm-section-label">
              Customer Information
            </div>
            <div className="booking-confirm-user-row">
              <User size={15} className="booking-confirm-gold-icon" />
              <span>{customerName}</span>
            </div>
            {customerPhone && (
              <div className="booking-confirm-meta-row">
                <Phone size={15} className="booking-confirm-gold-icon" />
                <span>{customerPhone}</span>
              </div>
            )}
            {customerEmail && (
              <div className="booking-confirm-meta-row">
                <Mail size={15} className="booking-confirm-gold-icon" />
                <span className="booking-summary-email-text">{customerEmail}</span>
              </div>
            )}
          </div>

          {/* 2. Scheduled Date & Time */}
          <div className="booking-confirm-detail-row booking-confirm-detail-row--top">
            <Calendar size={16} className="booking-confirm-gold-icon--top" />
            <div>
              <div className="booking-confirm-section-label">
                Scheduled Appointment
              </div>
              <div className="booking-confirm-value-bold">
                {formatDateDisplay(apptDate)} • {apptTime}
              </div>
            </div>
          </div>

          {/* 3. Service Booked & Price Calculation */}
          <div className="booking-confirm-detail-row booking-confirm-detail-row--top">
            <Sparkles size={16} className="booking-confirm-gold-icon--top" />
            <div className="booking-confirm-content-col">
              <div className="booking-confirm-section-label">
                Service Booked & Price
              </div>
              <div className="booking-confirm-value-bold">
                {serviceName}
                {guestsCount > 1 ? ` (${guestsCount} Guests)` : ''}
              </div>
              {categoryName && (
                <div className="booking-confirm-category-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <span>Category:</span>
                  <strong style={{ color: '#0f172a' }}>{categoryName}</strong>
                </div>
              )}

              {/* Voucher & Price Breakdown */}
              {hasDiscount ? (
                <div className="booking-voucher-box booking-voucher-box--success">
                  <div className="booking-voucher-header">
                    <span className="booking-voucher-title">
                      <Tag size={13} className="booking-voucher-icon" /> {voucherTitle}
                    </span>
                    <span className="booking-voucher-badge booking-voucher-badge--sm">
                      {voucherBadge}
                    </span>
                  </div>
                  <div className="booking-voucher-row booking-voucher-row--compact">
                    <span className="booking-voucher-orig-text">
                      Original: <span className="booking-voucher-orig-strike">${rawPrice} AUD</span>
                      {guestsCount > 1 && ` ($${unitPrice} × ${guestsCount} Guests)`} (Save ${discountAmount} AUD)
                    </span>
                    <span className="booking-voucher-final-total">
                      Estimated Due: ${finalPrice} AUD
                    </span>
                  </div>
                </div>
              ) : (
                <div className="booking-confirm-standard-price">
                  Price: ${finalPrice} AUD
                  {guestsCount > 1 && (
                    <span className="booking-confirm-standard-sub">
                      {' '}(${unitPrice} AUD × ${guestsCount} Guests)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Salon Location */}
          <div className="booking-confirm-detail-row booking-confirm-detail-row--top">
            <MapPin size={16} className="booking-confirm-gold-icon--top" />
            <div className="booking-confirm-location-text">
              Fashion Nails • Morley Galleria Shopping Centre, Morley WA 6062
            </div>
          </div>
        </div>

        {/* Add to Calendar buttons */}
        <div className="booking-confirm-calendar-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadICS}
            icon={Download}
          >
            {t('booking.addToCalendar')} (.ics)
          </Button>

          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="atelier-btn atelier-btn--ghost atelier-btn--sm"
          >
            <ExternalLink size={14} />
            <span>Google Calendar</span>
          </a>
        </div>
      </div>

      <div className="booking-confirm__nav">
        <Button
          id="booking-done-btn"
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleDone}
        >
          {t('booking.doneBtn')}
        </Button>
      </div>
    </div>
  );
}
