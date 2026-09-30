import './StepDate.css';
import React, { useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, Lock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';
import { getPerthDateString, getPerthFormattedTime, getPerthNow } from '../../../utils/perthTime';

export function StepDate() {
  const { language, t } = useLanguage();
  const {
    formData,
    updateFormData,
    setStep,
    lockedDates = [],
    dateHours = {},
    dateReasons = {},
    fetchScheduleLocks
  } = useBooking();

  // Re-fetch locks when StepDate mounts to ensure latest database locks
  useEffect(() => {
    if (typeof fetchScheduleLocks === 'function') {
      fetchScheduleLocks();
    }
  }, []);

  const perthTimeStr = getPerthFormattedTime();
  const perthNow = getPerthNow();
  const perthTodayIso = perthNow.isoDate;

  // Generate next 14 calendar days in Western Australia starting TODAY (i = 0)
  const quickDates = [];

  for (let i = 0; i < 14; i++) {
    const isoDate = getPerthDateString(i);
    const [y, m, d] = isoDate.split('-').map(n => parseInt(n, 10));
    // Midday UTC date object to avoid timezone boundary shifts
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 4 = Thu, 6 = Sat

    const isClosed = (Array.isArray(lockedDates) && lockedDates.includes(isoDate)) ||
      Boolean(dateHours?.[isoDate]?.isClosed);
    const lockReason = dateReasons?.[isoDate] || dateHours?.[isoDate]?.note || '';
    const isToday = (i === 0);
    const isSunday = (dayOfWeek === 0);
    const isThursday = (dayOfWeek === 4);

    const dayName = dateObj.toLocaleDateString('en-AU', {
      weekday: 'short',
      timeZone: 'UTC'
    });
    const dayNumber = d;
    const monthName = dateObj.toLocaleDateString('en-AU', {
      month: 'short',
      timeZone: 'UTC'
    });

    quickDates.push({
      isoDate,
      dayName,
      dayNumber,
      monthName,
      isToday,
      isSunday,
      isThursday,
      isClosed,
      lockReason
    });
  }

  // Selected date defaults to Today in Western Australia
  const selectedDate = formData.date || perthTodayIso;

  const isCurrentDateLocked = (Array.isArray(lockedDates) && lockedDates.includes(selectedDate)) ||
    Boolean(dateHours?.[selectedDate]?.isClosed);
  const currentLockReason = dateReasons?.[selectedDate] || dateHours?.[selectedDate]?.note || 'Salon Closed';

  // Auto-switch away if currently selected date is locked
  useEffect(() => {
    if (isCurrentDateLocked) {
      const firstAvailable = quickDates.find(d => !d.isClosed);
      if (firstAvailable && firstAvailable.isoDate !== selectedDate) {
        updateFormData({ date: firstAvailable.isoDate });
      }
    }
  }, [isCurrentDateLocked, selectedDate, lockedDates]);

  const handleSelectDate = (isoDate, isClosed) => {
    if (isClosed) return;
    updateFormData({ date: isoDate });
  };

  const handleNext = () => {
    if (isCurrentDateLocked) return;
    if (!formData.date) {
      updateFormData({ date: perthTodayIso });
    }
    setStep(3);
  };

  return (
    <div className="booking-step booking-step--date">
      <h3 className="booking-step__heading">{t('booking.step2')}</h3>
      <p className="booking-step__desc">{t('booking.selectDatePrompt')}</p>

      {/* 14-Day Quick Selection Strip Starting Today */}
      <div className="booking-date-grid" role="radiogroup" aria-label="Available appointment dates">
        {quickDates.map((item) => {
          const isSelected = selectedDate === item.isoDate && !item.isClosed;

          return (
            <button
              key={item.isoDate}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={item.isClosed}
              disabled={item.isClosed}
              className={`booking-date-card ${isSelected ? 'is-selected' : ''} ${item.isToday ? 'is-today' : ''} ${item.isClosed ? 'is-disabled is-locked' : ''}`}
              onClick={() => handleSelectDate(item.isoDate, item.isClosed)}
              title={item.isClosed ? (item.lockReason || 'Salon Closed / Date Locked') : undefined}
            >
              {item.isToday && (
                <span className="booking-date-card__badge-today">
                  {t('booking.todayBadge')}
                </span>
              )}
              <span className="booking-date-card__weekday">{item.dayName}</span>
              <span className="booking-date-card__day">{item.dayNumber}</span>
              <span className="booking-date-card__month">{item.monthName}</span>
              {item.isClosed ? (
                <span className="booking-date-card__hours-hint booking-date-card__hours-hint--locked">
                  <Lock size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                  Closed
                </span>
              ) : (
                <>

                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Manual HTML5 date picker for future dates */}
      <div className="booking-date-custom-wrap">
        <div className="booking-date-custom">
          <label htmlFor="custom-date-input" className="booking-date-custom__label">
            <CalendarIcon size={16} />
            <span>Or choose another date:</span>
          </label>
          <input
            id="custom-date-input"
            type="date"
            min={perthTodayIso}
            value={selectedDate}
            onChange={(e) => updateFormData({ date: e.target.value })}
            className={`booking-date-custom__input ${isCurrentDateLocked ? 'is-locked-input' : ''}`}
          />
        </div>

        {isCurrentDateLocked && (
          <div className="booking-date-locked-banner" role="alert">
            <Lock size={14} className="booking-date-locked-banner__icon" />
            <span>
              Date {selectedDate.split('-').reverse().join('-')} is closed / locked ({currentLockReason}). Please choose another date.
            </span>
          </div>
        )}
      </div>

      <div className="booking-step__nav">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setStep(1)}
        >
          ← {t('booking.backBtn')}
        </Button>
        <Button
          id="step2-next-btn"
          variant="primary"
          size="md"
          disabled={isCurrentDateLocked}
          onClick={handleNext}
        >
          {t('booking.nextBtn')} →
        </Button>
      </div>
    </div>
  );
}
