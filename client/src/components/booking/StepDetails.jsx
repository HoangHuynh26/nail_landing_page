import React, { useState } from 'react';
import { User, Phone, FileText, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

export function StepDetails() {
  const { t } = useLanguage();
  const { formData, updateFormData, setStep } = useBooking();
  const [localErrors, setLocalErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errs.fullName = t('booking.errors.nameRequired');
    }

    // Australian / international phone validation
    // Matches: 0412345678, 0412 345 678, +61412345678, +84..., or at least 8 digits
    const cleanedPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 8) {
      errs.phone = t('booking.errors.phoneRequired');
    }

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setStep(5);
    }
  };

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

        {/* Special Notes Field */}
        <div className="booking-field">
          <label htmlFor="booking-notes-input" className="booking-field__label">
            <FileText size={15} />
            <span>{t('booking.notes')}</span>
          </label>
          <textarea
            id="booking-notes-input"
            rows="3"
            placeholder={t('booking.notesPlaceholder')}
            value={formData.notes}
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
              {t('booking.discountDesc') || 'Áp dụng giảm ngay 10% trên tổng hoá đơn khi xuất trình thẻ tại quầy.'}
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
