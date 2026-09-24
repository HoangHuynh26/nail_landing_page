import React from 'react';
import { Calendar, Clock, DollarSign, User, Phone, Users, Mail, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
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

          {/* Service & Price */}
          <div className="booking-summary-item" style={{ gridColumn: '1 / -1' }}>
            <DollarSign size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text" style={{ width: '100%' }}>
              <span className="booking-summary-item__label">{t('booking.estimatedPrice')}</span>
              {formData.hasDiscount ? (
                <div style={{
                  marginTop: '6px',
                  padding: '10px 14px',
                  background: 'var(--color-surface, #f8fafc)',
                  border: '1.5px solid #86efac',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#166534', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={14} style={{ color: '#16a34a' }} /> 10% Community Voucher
                    </span>
                    <span style={{ background: '#16a34a', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                      -10% APPLIED
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px dashed #bbf7d0',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: '#166534' }}>
                      Original: <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>${formData.servicePrice} AUD</span> (Save ${Math.round(Number(formData.servicePrice || 0) * 0.1)} AUD)
                    </span>
                    <span style={{ fontWeight: 800, color: '#14532d', fontSize: '15px' }}>
                      Final Total: ${Math.round(Number(formData.servicePrice || 0) * 0.9)} AUD
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '2px' }}>
                  <strong className="booking-summary-item__price">${formData.servicePrice} AUD</strong>
                </div>
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
            <Mail size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">{t('booking.email') || 'Email'}</span>
              <strong style={{ wordBreak: 'break-all' }}>{formData.email || '—'}</strong>
            </div>
          </div>

          <div className="booking-summary-item">
            <Users size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text">
              <span className="booking-summary-item__label">Party Size</span>
              <strong>{Number(formData.guests) > 1 ? `${formData.guests} People` : '1 Person'}</strong>
            </div>
          </div>
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
