import React from 'react';
import { Calendar, Clock, DollarSign, User, Phone, Users, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

export function StepReview() {
  const { language, t } = useLanguage();
  const { formData, setStep, submitBooking, isSubmitting, error } = useBooking();

  // Format date nicely
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

  return (
    <div className="booking-step booking-step--review">
      <h3 className="booking-step__heading">{t('booking.step5')}</h3>
      <p className="booking-step__desc">{t('booking.summaryTitle')}</p>

      {/* Summary Card */}
      <div className="booking-summary-card">
        <div className="booking-summary-card__header">
          <span className="booking-summary-card__badge">Fashion Nails • Morley Galleria</span>
          <h4 className="booking-summary-card__title">{formData.serviceName}</h4>
        </div>

        <div className="booking-summary-card__grid">
          <div className="booking-summary-item">
            <Calendar size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">{t('booking.dateTime')}</span>
              <strong>{formatDateDisplay(formData.date)}</strong>
              <span className="booking-summary-item__time-val">{formData.time}</span>
            </div>
          </div>

          <div className="booking-summary-item">
            <Clock size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">{t('booking.duration')}</span>
              <strong>{formData.serviceDuration} {t('services.durationUnit')}</strong>
            </div>
          </div>

          <div className="booking-summary-item">
            <DollarSign size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">{t('booking.estimatedPrice')}</span>
              {formData.hasDiscount ? (
                <div>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', marginRight: '8px', fontSize: '0.9rem' }}>
                    ${formData.servicePrice} AUD
                  </span>
                  <strong className="booking-summary-item__price" style={{ color: 'var(--color-gold)' }}>
                    ${Math.round(formData.servicePrice * 0.9)} AUD
                  </strong>
                  <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '0.75rem', background: 'var(--color-gold)', color: '#000', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                    -10% Discount
                  </span>
                </div>
              ) : (
                <strong className="booking-summary-item__price">${formData.servicePrice} AUD</strong>
              )}
            </div>
          </div>

          <div className="booking-summary-item">
            <User size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">{t('booking.customer')}</span>
              <strong>{formData.fullName}</strong>
            </div>
          </div>

          <div className="booking-summary-item">
            <Phone size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">{t('booking.contactPhone')}</span>
              <strong>{formData.phone}</strong>
            </div>
          </div>

          <div className="booking-summary-item">
            <Users size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">Party Size</span>
              <strong>{Number(formData.guests) > 1 ? `${formData.guests} People` : '1 Person'}</strong>
            </div>
          </div>

          {formData.email && (
            <div className="booking-summary-item">
              <Mail size={16} className="booking-summary-item__icon" />
              <div className="booking-summary-item__text">
                <span className="booking-summary-item__label">Email</span>
                <strong style={{ wordBreak: 'break-all' }}>{formData.email}</strong>
              </div>
            </div>
          )}
        </div>

        {formData.notes && (
          <div className="booking-summary-notes">
            <span className="booking-summary-notes__label">{t('booking.notes')}:</span>
            <p className="booking-summary-notes__text">"{formData.notes}"</p>
          </div>
        )}

        <div className="booking-summary-policy">
          <ShieldCheck size={16} className="booking-summary-policy__icon" />
          <p>{t('booking.policyNotice')}</p>
        </div>
      </div>

      {error && (
        <div className="booking-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="booking-step__nav">
        <Button
          variant="secondary"
          size="md"
          disabled={isSubmitting}
          onClick={() => setStep(4)}
        >
          ← {t('booking.backBtn')}
        </Button>
        <Button
          id="confirm-booking-btn"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onClick={submitBooking}
        >
          {isSubmitting ? t('booking.submitting') : t('booking.confirmBtn')}
        </Button>
      </div>
    </div>
  );
}
