import React from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';
import { getPerthDateString, getPerthFormattedTime, getPerthNow } from '../../utils/perthTime';

export function StepDate() {
  const { language, t } = useLanguage();
  const { formData, updateFormData, setStep } = useBooking();

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

    // Fashion Nails Morley Galleria is open 7 days a week!
    // Mon - Wed, Fri - Sat: 9:00 - 17:30
    // Thu: 9:00 - 19:00 (late night)
    // Sun: 11:00 - 16:30
    const isClosed = false;
    const isToday = (i === 0);
    const isSunday = (dayOfWeek === 0);
    const isThursday = (dayOfWeek === 4);

    const dayName = dateObj.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU', {
      weekday: 'short',
      timeZone: 'UTC'
    });
    const dayNumber = d;
    const monthName = dateObj.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU', {
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
      isClosed
    });
  }

  // Selected date defaults to Today in Western Australia
  const selectedDate = formData.date || perthTodayIso;

  const handleSelectDate = (isoDate) => {
    updateFormData({ date: isoDate });
  };

  const handleNext = () => {
    if (!formData.date) {
      updateFormData({ date: perthTodayIso });
    }
    setStep(3);
  };

  return (
    <div className="booking-step booking-step--date">
      <h3 className="booking-step__heading">{t('booking.step2')}</h3>
      <p className="booking-step__desc">{t('booking.selectDatePrompt')}</p>

      {/* Live Western Australia Timezone Indicator */}
      <div className="booking-timezone-banner" role="status" aria-live="polite">
        <div className="booking-timezone-pill">
          <span className="live-pulsing-dot" aria-hidden="true"></span>
          <Clock size={13} className="booking-timezone-icon" aria-hidden="true" />
          <span className="booking-timezone-text">
            {t('booking.perthCurrentTime')} <strong>{perthTimeStr}</strong>
          </span>
        </div>
        <span className="booking-timezone-note">
          <Sparkles size={12} className="booking-sparkle-icon" aria-hidden="true" />
          {language === 'vi'
            ? 'Nhận hẹn hôm nay & mở cửa phục vụ cả tuần (7 ngày)'
            : 'Same-day booking available & open full 7 days'}
        </span>
      </div>

      {/* 14-Day Quick Selection Strip Starting Today */}
      <div className="booking-date-grid" role="radiogroup" aria-label="Available appointment dates">
        {quickDates.map((item) => {
          const isSelected = selectedDate === item.isoDate;

          return (
            <button
              key={item.isoDate}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`booking-date-card ${isSelected ? 'is-selected' : ''} ${item.isToday ? 'is-today' : ''}`}
              onClick={() => handleSelectDate(item.isoDate)}
            >
              {item.isToday && (
                <span className="booking-date-card__badge-today">
                  {t('booking.todayBadge')}
                </span>
              )}
              <span className="booking-date-card__weekday">{item.dayName}</span>
              <span className="booking-date-card__day">{item.dayNumber}</span>
              <span className="booking-date-card__month">{item.monthName}</span>
              {item.isSunday && (
                <span className="booking-date-card__hours-hint">11h - 16h30</span>
              )}
              {item.isThursday && (
                <span className="booking-date-card__hours-hint booking-date-card__hours-hint--late">
                  {language === 'vi' ? 'Tới 19h' : 'Till 7pm'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Manual HTML5 date picker for future dates */}
      <div className="booking-date-custom">
        <label htmlFor="custom-date-input" className="booking-date-custom__label">
          <CalendarIcon size={16} />
          <span>{language === 'vi' ? 'Hoặc chọn ngày khác:' : 'Or choose another date:'}</span>
        </label>
        <input
          id="custom-date-input"
          type="date"
          min={perthTodayIso}
          value={selectedDate}
          onChange={(e) => updateFormData({ date: e.target.value })}
          className="booking-date-custom__input"
        />
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
          onClick={handleNext}
        >
          {t('booking.nextBtn')} →
        </Button>
      </div>
    </div>
  );
}
