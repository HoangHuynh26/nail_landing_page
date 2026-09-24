import React from 'react';
import {
  CheckCircle2, Calendar, MapPin, Mail, Users, Download, ExternalLink,
  User, Phone, Sparkles, Tag
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

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
  const serviceName = bookingResult?.serviceName || bookingResult?.service || formData?.serviceName || 'Nail Treatment';
  const rawPrice = Number(bookingResult?.servicePrice ?? formData?.servicePrice ?? 0);
  const hasDiscount = Boolean(
    bookingResult?.hasDiscount ??
    formData?.hasDiscount ??
    (bookingResult?.voucher && String(bookingResult.voucher).toLowerCase().includes('10%'))
  );
  const discountAmount = hasDiscount && !isNaN(rawPrice) && rawPrice > 0 ? Math.round(rawPrice * 0.1) : 0;
  const finalPrice = hasDiscount && !isNaN(rawPrice) && rawPrice > 0 ? (rawPrice - discountAmount) : rawPrice;
  const apptDate = bookingResult?.date || formData?.date;
  const apptTime = bookingResult?.time || formData?.time;
  const guestsCount = Number(bookingResult?.guests || formData?.guests) || 1;

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

        <div className="booking-confirm-card__details" style={{ gap: '14px', marginTop: '16px' }}>
          {/* 1. Customer Information */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--color-surface, #f8fafc)',
            borderRadius: '10px',
            border: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #64748b)',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              Customer Information
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', fontSize: '14px' }}>
              <User size={15} style={{ color: 'var(--color-gold, #d4af37)', flexShrink: 0 }} />
              <span>{customerName}</span>
            </div>
            {customerPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary, #475569)' }}>
                <Phone size={15} style={{ color: 'var(--color-gold, #d4af37)', flexShrink: 0 }} />
                <span>{customerPhone}</span>
              </div>
            )}
            {customerEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary, #475569)' }}>
                <Mail size={15} style={{ color: 'var(--color-gold, #d4af37)', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-all' }}>{customerEmail}</span>
              </div>
            )}
          </div>

          {/* 2. Scheduled Date & Time */}
          <div className="booking-confirm-detail-row" style={{ alignItems: 'flex-start', gap: '10px' }}>
            <Calendar size={16} style={{ color: 'var(--color-gold, #d4af37)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-secondary, #64748b)', fontWeight: 700 }}>
                Scheduled Appointment
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', fontSize: '14px', marginTop: '2px' }}>
                {formatDateDisplay(apptDate)} • {apptTime}
              </div>
            </div>
          </div>

          {/* 3. Service Booked & Price Calculation */}
          <div className="booking-confirm-detail-row" style={{ alignItems: 'flex-start', gap: '10px' }}>
            <Sparkles size={16} style={{ color: 'var(--color-gold, #d4af37)', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-secondary, #64748b)', fontWeight: 700 }}>
                Service Booked & Price
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', fontSize: '14px', marginTop: '2px' }}>
                {serviceName}
                {guestsCount > 1 ? ` (${guestsCount} Guests)` : ''}
              </div>

              {/* 10% Voucher & Price Breakdown */}
              {hasDiscount ? (
                <div style={{
                  marginTop: '8px',
                  padding: '10px 12px',
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '8px',
                  fontSize: '12.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#166534', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={13} style={{ color: '#16a34a' }} /> 10% Community Voucher
                    </span>
                    <span style={{ background: '#16a34a', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800 }}>
                      -10% APPLIED
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #bbf7d0',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: '#166534' }}>
                      Original: <span style={{ textDecoration: 'line-through' }}>${rawPrice} AUD</span> (Save ${discountAmount} AUD)
                    </span>
                    <span style={{ fontWeight: 800, color: '#14532d', fontSize: '15px' }}>
                      Estimated Due: ${finalPrice} AUD
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
                  Price: ${rawPrice} AUD
                </div>
              )}
            </div>
          </div>

          {/* 4. Salon Location */}
          <div className="booking-confirm-detail-row" style={{ alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--color-gold, #d4af37)', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #475569)' }}>
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
