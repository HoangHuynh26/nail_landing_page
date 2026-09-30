import './StepReview.css';
import React from 'react';
import { Calendar, Clock, DollarSign, User, Phone, Users, Mail, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';

export function StepReview() {
  const { language, t } = useLanguage();
  const { formData, setStep, submitBooking, isSubmitting, error, appliedVoucher, categories, services } = useBooking();

  const OFFICIAL_CATEGORY_MAP = {
    biab: 'Builder Gel - BIAB',
    shellac: 'Shellac Nails',
    acrylic: 'Acrylic Nails',
    gelx: 'Gel X Extensions',
    sns: 'SNS Dipping',
    polish: 'Nail Polish',
    extra: 'Extra Services'
  };

  const getCategoryName = () => {
    const raw = formData.serviceCategory;
    if (raw) {
      const lower = String(raw).toLowerCase().trim();
      if (OFFICIAL_CATEGORY_MAP[lower]) return OFFICIAL_CATEGORY_MAP[lower];
      const matchedCat = (categories || []).find(c => (c.id || c.key || '').toLowerCase() === lower);
      if (matchedCat && (matchedCat.name_en || matchedCat.name || matchedCat.label)) {
        return matchedCat.name_en || matchedCat.name || matchedCat.label;
      }
      return raw;
    }
    const activeList = services && services.length > 0 ? services : [];
    const found = activeList.find(s => s.id === formData.serviceId || s.name_en === formData.serviceName || s.name === formData.serviceName);
    if (found && found.category) {
      const lower = found.category.toLowerCase().trim();
      return OFFICIAL_CATEGORY_MAP[lower] || found.category;
    }
    return '';
  };

  const categoryName = getCategoryName();

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
          <h4 className="booking-summary-card__title">{formData.serviceName}</h4>
          {categoryName && (
            <div className="booking-summary-card__category-sub">
              <Tag size={12} className="booking-summary-card__category-icon" />
              <strong>{categoryName}</strong>
            </div>
          )}
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
          <div className="booking-summary-item booking-summary-full-col">
            <DollarSign size={16} className="booking-summary-item__icon" />
            <div className="booking-summary-item__text booking-summary-full-width">
              <span className="booking-summary-item__label">{t('booking.estimatedPrice')}</span>
              {(() => {
                const guestsCount = Number(formData.guests) || 1;
                const unitPrice = Number(formData.servicePrice) || 0;
                const partySubtotal = unitPrice * guestsCount;

                if (appliedVoucher) {
                  return (
                    <div className="booking-voucher-box">
                      <div className="booking-voucher-header">
                        <span className="booking-voucher-title">
                          <Tag size={14} className="booking-voucher-icon" /> Voucher {appliedVoucher.voucher.code}
                        </span>
                        <span className="booking-voucher-badge">
                          {appliedVoucher.voucher.discountType === 'percentage'
                            ? `-${appliedVoucher.voucher.discountValue}%`
                            : `-$${appliedVoucher.voucher.discountValue} AUD`} APPLIED
                        </span>
                      </div>
                      <div className="booking-voucher-row">
                        <span className="booking-voucher-orig-text">
                          Original: <span className="booking-voucher-orig-strike">${appliedVoucher.originalPrice || partySubtotal} AUD</span>
                          {guestsCount > 1 && <span className="booking-summary-subdetail"> (${unitPrice} × {guestsCount} People)</span>}
                          {' '}(Save ${appliedVoucher.discountAmount} AUD)
                        </span>
                        <span className="booking-voucher-final-total">
                          Final Total: ${appliedVoucher.finalPrice} AUD
                        </span>
                      </div>
                    </div>
                  );
                }

                if (formData.hasDiscount) {
                  const discountAmount = Math.round(partySubtotal * 0.1);
                  const finalTotal = Math.max(0, partySubtotal - discountAmount);
                  return (
                    <div className="booking-voucher-box">
                      <div className="booking-voucher-header">
                        <span className="booking-voucher-title">
                          <Tag size={14} className="booking-voucher-icon" /> 10% Off for Seniors, Students & Morley Galleria Staff
                        </span>
                        <span className="booking-voucher-badge">
                          -10% APPLIED
                        </span>
                      </div>
                      <div className="booking-voucher-row">
                        <span className="booking-voucher-orig-text">
                          Original: <span className="booking-voucher-orig-strike">${partySubtotal} AUD</span>
                          {guestsCount > 1 && <span className="booking-summary-subdetail"> (${unitPrice} × {guestsCount} People)</span>}
                          {' '}(Save ${discountAmount} AUD)
                        </span>
                        <span className="booking-voucher-final-total">
                          Final Total: ${finalTotal} AUD
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="booking-summary-standard-price-wrap">
                    <strong className="booking-summary-item__price">${partySubtotal} AUD</strong>
                    {guestsCount > 1 && (
                      <span className="booking-summary-price-note">
                        (${unitPrice} AUD × {guestsCount} People)
                      </span>
                    )}
                  </div>
                );
              })()}
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
              <strong className="booking-summary-email-text">{formData.email || '—'}</strong>
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
