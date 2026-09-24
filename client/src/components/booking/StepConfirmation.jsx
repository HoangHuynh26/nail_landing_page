import React from 'react';
import { CheckCircle2, Calendar, MapPin, Mail, Users, Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

export function StepConfirmation() {
  const { language, t } = useLanguage();
  const { bookingResult, closeBooking, resetBooking, downloadICS, getGoogleCalendarUrl } = useBooking();

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

        <div className="booking-confirm-card__details">
          <div className="booking-confirm-detail-row">
            <Calendar size={16} />
            <span>
              {formatDateDisplay(bookingResult?.date)} • {bookingResult?.time}
            </span>
          </div>

          <div className="booking-confirm-detail-row">
            <span className="booking-confirm-detail-dot" />
            <span>
              {bookingResult?.serviceName} (${bookingResult?.servicePrice} AUD)
              {Number(bookingResult?.guests) > 1 ? ` • ${bookingResult.guests} Guests` : ''}
            </span>
          </div>

          {bookingResult?.email && (
            <div className="booking-confirm-detail-row">
              <Mail size={16} />
              <span>Email: {bookingResult.email}</span>
            </div>
          )}

          <div className="booking-confirm-detail-row">
            <MapPin size={16} />
            <span>Morley Galleria Shopping Centre, Morley Western Australia 6062</span>
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
