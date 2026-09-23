import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Calendar, PhoneCall } from 'lucide-react';
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

  // Tick state to update live Perth time every 30 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const perthTimeStr = getPerthFormattedTime();
  const perthNow = getPerthNow();
  const perthTodayIso = perthNow.isoDate;

  // Current appointment date
  const selectedDate = formData.date || perthTodayIso;
  const isTodayInPerth = selectedDate === perthTodayIso;

  // Day-of-week appropriate slots for this date in Perth
  const slots = getSalonSlotsForDate(selectedDate);

  // Available upcoming slots: if today, only slots that haven't passed in Western Australia
  const availableSlots = slots.filter((time) => {
    if (isTodayInPerth) {
      return !isSlotInPast(time, selectedDate, 0);
    }
    return true;
  });

  const hasNoSlotsLeft = isTodayInPerth && availableSlots.length === 0;

  // Auto-align selected time if currently empty, locked, or not in available slots
  useEffect(() => {
    const isSelectedLocked = isTodayInPerth && isSlotInPast(formData.time, selectedDate, 0);
    const isCurrentTimeInvalid = !formData.time || !slots.includes(formData.time) || isSelectedLocked;

    if (isCurrentTimeInvalid) {
      if (availableSlots.length > 0) {
        updateFormData({ time: availableSlots[0] });
      } else {
        updateFormData({ time: '' });
      }
    }
  }, [selectedDate, isTodayInPerth, formData.time, slots.length, availableSlots.length]);

  const handleSelectTime = (time, isLocked) => {
    if (isLocked) return;
    updateFormData({ time });
  };

  const handleNext = () => {
    const isSelectedLocked = isTodayInPerth && isSlotInPast(formData.time, selectedDate, 0);
    if ((!formData.time || isSelectedLocked) && availableSlots.length > 0) {
      updateFormData({ time: availableSlots[0] });
    }
    if (!hasNoSlotsLeft && formData.time && !isSelectedLocked) {
      setStep(4);
    }
  };

  return (
    <div className="booking-step booking-step--time">
      <h3 className="booking-step__heading">{t('booking.step3')}</h3>
      <p className="booking-step__desc">{t('booking.selectTimePrompt')}</p>

      {/* Live Western Australia Timezone Banner */}
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
              ? '⚡ Khung giờ đã qua tại Tây Úc (Perth AWST) tự động khóa'
              : '⚡ Past slots in Western Australia (Perth AWST) are automatically locked'
          ) : (
            language === 'vi'
              ? '✨ Giờ hoạt động tiệm tại Morley Galleria'
              : '✨ Scheduled in Morley Galleria salon operating hours'
          )}
        </span>
      </div>

      {/* If all slots for today have already passed */}
      {hasNoSlotsLeft && (
        <div className="booking-no-slots-box" role="alert">
          <AlertCircle size={26} className="booking-no-slots-box__icon" />
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
      )}

      {/* Available time slots grid */}
      <div
        className="booking-time-grid"
        role="radiogroup"
        aria-label="Available appointment times"
      >
        {slots.map((time) => {
          const isLocked = isTodayInPerth && isSlotInPast(time, selectedDate, 0);
          const isSelected = !isLocked && formData.time === time;

          return (
            <button
              key={time}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isLocked}
              disabled={isLocked}
              className={`booking-time-slot ${isSelected ? 'is-selected' : ''} ${
                isLocked ? 'is-past is-locked' : ''
              }`}
              onClick={() => handleSelectTime(time, isLocked)}
              title={
                isLocked
                  ? (language === 'vi' ? 'Khung giờ này đã qua tại Tây Úc' : 'This time slot has already passed in Western Australia')
                  : time
              }
            >
              <Clock size={13} aria-hidden="true" />
              <span className="booking-time-slot__text">{time}</span>
              {isLocked && (
                <span className="booking-time-slot__badge booking-time-slot__badge--past">
                  {t('booking.passedBadge') || (language === 'vi' ? 'Đã qua' : 'Passed')}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
          disabled={hasNoSlotsLeft || !formData.time || (isTodayInPerth && isSlotInPast(formData.time, selectedDate, 0))}
          onClick={handleNext}
        >
          {t('booking.nextBtn')} →
        </Button>
      </div>
    </div>
  );
}

