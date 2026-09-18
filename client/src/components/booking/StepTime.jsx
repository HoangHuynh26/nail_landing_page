import React, { useEffect } from 'react';
import { Clock, AlertCircle, Calendar, PhoneCall, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';
import {
  getSalonSlotsForDate,
  isSlotInPast,
  getPerthFormattedTime,
  getPerthDateString,
  getPerthNow
} from '../../utils/perthTime';

export function StepTime() {
  const { language, t } = useLanguage();
  const { formData, updateFormData, setStep } = useBooking();

  const perthTimeStr = getPerthFormattedTime();
  const perthNow = getPerthNow();
  const perthTodayIso = perthNow.isoDate;

  // Current appointment date
  const selectedDate = formData.date || perthTodayIso;
  const isTodayInPerth = selectedDate === perthTodayIso;

  // Day-of-week appropriate slots for this date in Perth
  const slots = getSalonSlotsForDate(selectedDate);

  // Realistic mock booked slots
  const bookedSlots = ['11:00 AM', '02:30 PM'];

  // Available upcoming slots (neither booked nor in the past in Western Australia)
  const availableUpcomingSlots = slots.filter((time) => {
    const isPast = isTodayInPerth && isSlotInPast(time, selectedDate, 20);
    const isBooked = bookedSlots.includes(time);
    return !isPast && !isBooked;
  });

  // Auto-align selected time if currently empty, in past, or invalid for date
  useEffect(() => {
    const isCurrentTimeInvalid =
      !formData.time ||
      !slots.includes(formData.time) ||
      bookedSlots.includes(formData.time) ||
      (isTodayInPerth && isSlotInPast(formData.time, selectedDate, 20));

    if (isCurrentTimeInvalid && availableUpcomingSlots.length > 0) {
      updateFormData({ time: availableUpcomingSlots[0] });
    }
  }, [selectedDate, formData.time, isTodayInPerth, slots.length]);

  const handleSelectTime = (time, isUnavailable) => {
    if (isUnavailable) return;
    updateFormData({ time });
  };

  const handleNext = () => {
    if (!formData.time && availableUpcomingSlots.length > 0) {
      updateFormData({ time: availableUpcomingSlots[0] });
    }
    setStep(4);
  };

  const hasNoSlotsLeft = availableUpcomingSlots.length === 0;

  return (
    <div className="booking-step booking-step--time">
      <h3 className="booking-step__heading">{t('booking.step3')}</h3>
      <p className="booking-step__desc">{t('booking.selectTimePrompt')}</p>

      {/* Live Western Australia Timezone Pill */}
      <div className="booking-timezone-banner" role="status" aria-live="polite">
        <div className="booking-timezone-pill">
          <span className="live-pulsing-dot" aria-hidden="true"></span>
          <Clock size={13} className="booking-timezone-icon" aria-hidden="true" />
          <span className="booking-timezone-text">
            {t('booking.perthCurrentTime')} <strong>{perthTimeStr}</strong>
          </span>
        </div>
        <span className="booking-timezone-note">
          {isTodayInPerth ? (
            language === 'vi'
              ? '⚡ Khung giờ hôm nay được cập nhật theo thời gian thực tại Perth'
              : '⚡ Today\'s slots dynamically updated in real-time Perth AWST'
          ) : (
            language === 'vi'
              ? '✨ Lịch hẹn theo giờ hoạt động của tiệm tại Morley Galleria'
              : '✨ Scheduled in Morley Galleria salon operating hours'
          )}
        </span>
      </div>

      {/* If all slots for today have already passed */}
      {hasNoSlotsLeft ? (
        <div className="booking-no-slots-box" role="alert">
          <AlertCircle size={28} className="booking-no-slots-box__icon" />
          <div className="booking-no-slots-box__content">
            <h4 className="booking-no-slots-box__title">
              {language === 'vi'
                ? 'Hôm nay đã hết khung giờ đặt trực tuyến'
                : 'No online slots remaining for today'}
            </h4>
            <p className="booking-no-slots-box__desc">
              {t('booking.noMoreSlotsToday')}
            </p>
            <div className="booking-no-slots-box__actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateFormData({ date: getPerthDateString(1) });
                  setStep(2);
                }}
              >
                <Calendar size={14} aria-hidden="true" />
                <span>{language === 'vi' ? 'Đặt lịch ngày mai' : 'Book for Tomorrow'}</span>
              </Button>
              <a
                href="tel:0893752888"
                className="booking-hotline-quick-btn"
                aria-label="Call salon hotline"
              >
                <PhoneCall size={14} aria-hidden="true" />
                <span>(08) 9375 2888</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Available time slots grid */
        <div
          className="booking-time-grid"
          role="radiogroup"
          aria-label="Available appointment times"
        >
          {slots.map((time) => {
            const isSelected = formData.time === time;
            const isPast = isTodayInPerth && isSlotInPast(time, selectedDate, 20);
            const isBooked = bookedSlots.includes(time);
            const isUnavailable = isPast || isBooked;

            return (
              <button
                key={time}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isUnavailable}
                className={`booking-time-slot ${isSelected ? 'is-selected' : ''} ${
                  isPast ? 'is-past' : ''
                } ${isBooked ? 'is-booked' : ''}`}
                onClick={() => handleSelectTime(time, isUnavailable)}
              >
                <Clock size={13} aria-hidden="true" />
                <span className="booking-time-slot__text">{time}</span>
                {isPast && (
                  <span className="booking-time-slot__badge booking-time-slot__badge--past">
                    {t('booking.passedBadge')}
                  </span>
                )}
                {isBooked && !isPast && (
                  <span className="booking-time-slot__badge booking-time-slot__badge--booked">
                    Kín / Booked
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="booking-step__nav">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setStep(2)}
        >
          ← {t('booking.backBtn')}
        </Button>
        <Button
          id="step3-next-btn"
          variant="primary"
          size="md"
          disabled={hasNoSlotsLeft || !formData.time}
          onClick={handleNext}
        >
          {t('booking.nextBtn')} →
        </Button>
      </div>
    </div>
  );
}
