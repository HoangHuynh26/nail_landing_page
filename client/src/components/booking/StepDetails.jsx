import React, { useState } from 'react';
import { User, Phone, Mail, Users, FileText, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

export function StepDetails() {
  const { language, t } = useLanguage();
  const { formData, updateFormData, setStep } = useBooking();
  const [localErrors, setLocalErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errs.fullName = t('booking.errors.nameRequired');
    }

    // Australian / international phone validation
    const cleanedPhone = (formData.phone || '').replace(/[\s\-\(\)]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 8) {
      errs.phone = t('booking.errors.phoneRequired');
    }

    // Required email check
    const emailStr = (formData.email || '').trim();
    if (!emailStr) {
      errs.email = t('booking.errors.emailRequired') || 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) {
        errs.email = 'Please enter a valid email address (e.g., name@example.com).';
      }
    }

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setStep(5);
    }
  };

  const currentGuests = Number(formData.guests) || 1;

  return (
    <div className="booking-step booking-step--details">
      <h3 className="booking-step__heading">{t('booking.step4')}</h3>
      <p className="booking-step__desc">{t('booking.enterDetailsPrompt')}</p>

      <form className="booking-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        {/* Full Name Field */}
        <div className={`booking-field ${localErrors.fullName ? 'has-error' : ''}`}>
          <label htmlFor="booking-name-input" className="booking-field__label">
            <User size={15} />
            <span>{t('booking.fullName')} <abbr title="required">*</abbr></span>
          </label>
          <input
            id="booking-name-input"
            type="text"
            required
            autoComplete="name"
            placeholder={t('booking.fullNamePlaceholder')}
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className="booking-field__input"
          />
          {localErrors.fullName && (
            <div className="booking-field__error" role="alert">
              <AlertCircle size={14} />
              <span>{localErrors.fullName}</span>
            </div>
          )}
        </div>

        {/* Phone Number Field */}
        <div className={`booking-field ${localErrors.phone ? 'has-error' : ''}`}>
          <label htmlFor="booking-phone-input" className="booking-field__label">
            <Phone size={15} />
            <span>{t('booking.phone')} <abbr title="required">*</abbr></span>
          </label>
          <input
            id="booking-phone-input"
            type="tel"
            required
            autoComplete="tel"
            placeholder={t('booking.phonePlaceholder')}
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="booking-field__input"
          />
          {localErrors.phone && (
            <div className="booking-field__error" role="alert">
              <AlertCircle size={14} />
              <span>{localErrors.phone}</span>
            </div>
          )}
        </div>

        {/* Email Field (Required) */}
        <div className={`booking-field ${localErrors.email ? 'has-error' : ''}`}>
          <label htmlFor="booking-email-input" className="booking-field__label">
            <Mail size={15} />
            <span>{t('booking.email')} <abbr title="required">*</abbr></span>
          </label>
          <input
            id="booking-email-input"
            type="email"
            required
            autoComplete="email"
            placeholder={t('booking.emailPlaceholder')}
            value={formData.email || ''}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="booking-field__input"
          />
          {localErrors.email && (
            <div className="booking-field__error" role="alert">
              <AlertCircle size={14} />
              <span>{localErrors.email}</span>
            </div>
          )}
        </div>

        {/* Number of Guests / Party Size */}
        <div className="booking-field">
          <label className="booking-field__label">
            <Users size={15} />
            <span>{t('booking.guests')}</span>
          </label>
          <div className="booking-guests-selector" role="radiogroup" aria-label="Select number of guests">
            {[1, 2, 3, 4, 5].map((count) => {
              const isSelected = currentGuests === count;
              const label = count === 1 ? '1 Person' : count === 5 ? '5+ Group' : `${count} People`;
              return (
                <button
                  key={count}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`booking-guest-pill ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => updateFormData({ guests: count })}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Message / Notes Field (Completely Optional) */}
        <div className="booking-field">
          <label htmlFor="booking-notes-input" className="booking-field__label">
            <FileText size={15} />
            <span>{t('booking.notes')}</span>
          </label>
          <textarea
            id="booking-notes-input"
            rows="3"
            placeholder={t('booking.notesPlaceholder')}
            value={formData.notes || ''}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            className="booking-field__textarea"
          />
        </div>

        {/* 10% Discount Selector (Seniors, Students, Galleria Staff) */}
        <label className="booking-discount-selector" htmlFor="booking-discount-checkbox">
          <input
            id="booking-discount-checkbox"
            type="checkbox"
            className="booking-discount-checkbox"
            checked={!!formData.hasDiscount}
            onChange={(e) => updateFormData({ hasDiscount: e.target.checked })}
          />
          <div className="booking-discount-content">
            <div className="booking-discount-title">
              <span>{t('pricing.specialOffer2')}</span>
              <span className="booking-discount-badge">-10%</span>
            </div>
            <div className="booking-discount-desc">
              {t('booking.discountDesc')}
            </div>
          </div>
        </label>
      </form>

      <div className="booking-step__nav">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setStep(3)}
        >
          ← {t('booking.backBtn')}
        </Button>
        <Button
          id="step4-next-btn"
          variant="primary"
          size="md"
          onClick={handleNext}
        >
          {t('booking.nextBtn')} →
        </Button>
      </div>
    </div>
  );
}
