import './StepDetails.css';
import React, { useState } from 'react';
import { User, Phone, Mail, Users, FileText, AlertCircle, Ticket, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';

export function StepDetails() {
  const { language, t } = useLanguage();
  const {
    formData,
    updateFormData,
    setStep,
    appliedVoucher,
    voucherError,
    setVoucherError,
    isApplyingVoucher,
    applyVoucher,
    removeVoucher
  } = useBooking();
  const [localErrors, setLocalErrors] = useState({});
  const [voucherInput, setVoucherInput] = useState(formData.voucher || '');

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    await applyVoucher(voucherInput.trim());
  };

  const handleRemoveVoucher = () => {
    removeVoucher();
    setVoucherInput('');
  };

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
              const isSelected = count < 5 ? currentGuests === count : currentGuests >= 5;
              const label = count === 1 ? '1 Person' : count === 5 ? '5+ Group' : `${count} People`;
              return (
                <button
                  key={count}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`booking-guest-pill ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    if (count < 5) {
                      updateFormData({ guests: count });
                    } else {
                      updateFormData({ guests: Math.max(5, currentGuests) });
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* If 5+ Group is selected, allow user to enter exact party size */}
          {currentGuests >= 5 && (
            <div className="booking-custom-guests-box">
              <div className="booking-custom-guests-header">
                <span className="booking-custom-guests-label">
                  Enter specific number of guests in group:
                </span>
                <span className="booking-custom-guests-badge">
                  Min 5 guests
                </span>
              </div>

              <div className="booking-custom-guests-input-row">
                <button
                  type="button"
                  className="booking-custom-guests-btn"
                  onClick={() => updateFormData({ guests: Math.max(5, currentGuests - 1) })}
                  disabled={currentGuests <= 5}
                  aria-label="Decrease guest count"
                >
                  −
                </button>

                <div className="booking-custom-guests-input-wrap">
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="1"
                    className="booking-custom-guests-input"
                    value={formData.guests || ''}
                    placeholder="5"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        updateFormData({ guests: '' });
                        return;
                      }
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        updateFormData({ guests: Math.min(50, Math.max(0, num)) });
                      }
                    }}
                    onBlur={() => {
                      const num = Number(formData.guests);
                      if (!num || num < 5) {
                        updateFormData({ guests: 5 });
                      } else if (num > 50) {
                        updateFormData({ guests: 50 });
                      }
                    }}
                  />
                  <span className="booking-custom-guests-unit">
                    Guests
                  </span>
                </div>

                <button
                  type="button"
                  className="booking-custom-guests-btn"
                  onClick={() => updateFormData({ guests: Math.min(50, currentGuests + 1) })}
                  aria-label="Increase guest count"
                >
                  +
                </button>
              </div>

              <div className="booking-custom-guests-hint">
                <Users size={13} className="booking-custom-guests-hint-icon" />
                <span>
                  Our salon will arrange dedicated nail artists and synchronized stations for your party!
                </span>
              </div>
            </div>
          )}
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

        {/* Voucher / Promo Code Field */}
        <div className="booking-field booking-field--voucher">
          <label htmlFor="booking-voucher-input" className="booking-field__label">
            <Ticket size={15} />
            <span>{t('booking.voucherLabel') || 'Voucher / Promo Code (Optional)'}</span>
          </label>

          {appliedVoucher ? (
            <div className="booking-voucher-success-card">
              <div className="booking-voucher-success-left">
                <div className="booking-voucher-code-badge">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <strong>{appliedVoucher.voucher.code}</strong>
                  <span className="booking-voucher-discount-pill">
                    {appliedVoucher.voucher.discountType === 'percentage'
                      ? `-${appliedVoucher.voucher.discountValue}%`
                      : `-$${appliedVoucher.voucher.discountValue} AUD`}
                  </span>
                </div>
                <div className="booking-voucher-desc-text">
                  <span>{appliedVoucher.voucher.name}</span>
                  {appliedVoucher.discountAmount > 0 && (
                    <span className="booking-voucher-saving-highlight">
                      • Save ${appliedVoucher.discountAmount} AUD
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="booking-voucher-remove-action"
                onClick={handleRemoveVoucher}
                title="Remove voucher"
              >
                <X size={14} />
                <span>{t('booking.removeBtn') || 'Remove'}</span>
              </button>
            </div>
          ) : (
            <div className="booking-voucher-input-wrap">
              <input
                id="booking-voucher-input"
                type="text"
                placeholder={t('booking.voucherPlaceholder') || 'e.g., WELCOME10, SUMMER20...'}
                value={voucherInput}
                onChange={(e) => {
                  setVoucherInput(e.target.value.toUpperCase());
                  if (voucherError && setVoucherError) setVoucherError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyVoucher();
                  }
                }}
                className="booking-field__input booking-voucher-input"
              />
              <button
                type="button"
                className="booking-voucher-apply-btn"
                onClick={handleApplyVoucher}
                disabled={isApplyingVoucher || !voucherInput.trim()}
              >
                {isApplyingVoucher ? 'Checking...' : (t('booking.applyBtn') || 'Apply')}
              </button>
            </div>
          )}

          {voucherError && (
            <div className="booking-field__error" role="alert">
              <AlertCircle size={14} />
              <span>{voucherError}</span>
            </div>
          )}
        </div>

        {/* 10% Discount Selector */}
        <label className="booking-discount-selector" htmlFor="booking-discount-checkbox">
          <input
            id="booking-discount-checkbox"
            type="checkbox"
            className="booking-discount-checkbox"
            checked={!!formData.hasDiscount}
            onChange={(e) => {
              const checked = e.target.checked;
              updateFormData({ hasDiscount: checked });
              if (checked && appliedVoucher) {
                removeVoucher();
                setVoucherInput('');
              }
            }}
          />
          <div className="booking-discount-content">
            <span className="booking-discount-title">
              10% Off for Seniors, Students, and Morley Galleria Staff
              <span className="booking-discount-badge">-10%</span>
            </span>
            <div className="booking-discount-desc">
              Applicable with valid Seniors Card, Student ID, or Morley Galleria Staff pass (present at checkout)
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
