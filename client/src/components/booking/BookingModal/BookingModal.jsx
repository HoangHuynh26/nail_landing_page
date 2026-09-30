import './BookingModal.css';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { StepService } from '../StepService/StepService';
import { StepDate } from '../StepDate/StepDate';
import { StepTime } from '../StepTime/StepTime';
import { StepDetails } from '../StepDetails/StepDetails';
import { StepReview } from '../StepReview/StepReview';
import { StepConfirmation } from '../StepConfirmation/StepConfirmation';

class StepErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[BookingModal Step Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
            An unexpected error occurred
          </h4>
          <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Unable to render this booking step. Please try again.
          </p>
          <button
            type="button"
            className="atelier-btn atelier-btn--primary atelier-btn--md"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reload Step
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function BookingModal() {
  const { t } = useLanguage();
  const { isBookingOpen, closeBooking, step, isSubmitting } = useBooking();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isBookingOpen && !isSubmitting) {
        closeBooking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBookingOpen, isSubmitting, closeBooking]);

  if (!isBookingOpen) return null;

  const steps = [
    { num: 1, label: t('booking.step1') },
    { num: 2, label: t('booking.step2') },
    { num: 3, label: t('booking.step3') },
    { num: 4, label: t('booking.step4') },
    { num: 5, label: t('booking.step5') }
  ];

  return (
    <div
      className="booking-modal-overlay"
      onClick={() => {
        if (!isSubmitting) closeBooking();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        className="booking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="booking-modal__header">
          <div className="booking-modal__brand-badge">
            <img
              src="/images/logo-icon.png"
              alt="Fashion Nails"
              className="booking-modal__logo"
              onError={(e) => {
                e.target.src = '/images/logo.png';
              }}
            />
            <div>
              <h2 id="booking-modal-title" className="booking-modal__title">
                {t('booking.title')}
              </h2>
              <span className="booking-modal__subtext">Fashion Nails Morley Galleria WA</span>
            </div>
          </div>

          <button
            type="button"
            id="close-booking-modal-btn"
            className="booking-modal__close"
            onClick={closeBooking}
            disabled={isSubmitting}
            aria-label={t('booking.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Indicators (Steps 1-5) */}
        {step <= 5 && (
          <div className="booking-modal__stepper" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
            <div className="booking-modal__stepper-track">
              <div
                className="booking-modal__stepper-fill"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
            <div className="booking-modal__stepper-labels">
              {steps.map(s => (
                <span
                  key={s.num}
                  className={`booking-modal__step-dot ${step === s.num ? 'is-current' : ''} ${step > s.num ? 'is-completed' : ''}`}
                >
                  {s.num}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active Step Content */}
        <div className="booking-modal__body">
          <StepErrorBoundary>
            {step === 1 && <StepService />}
            {step === 2 && <StepDate />}
            {step === 3 && <StepTime />}
            {step === 4 && <StepDetails />}
            {step === 5 && <StepReview />}
            {step === 6 && <StepConfirmation />}
          </StepErrorBoundary>
        </div>
      </div>
    </div>
  );
}
