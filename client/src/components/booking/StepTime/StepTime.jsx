import './StepTime.css';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock, AlertCircle, Calendar, PhoneCall, Lock, Sparkles, Check, Sun, Moon, Info, ShieldAlert, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';
import {
  getEffectiveOperatingHours,
  normalizeSlotTime,
  parseSlotToMinutes,
  formatSlotTime,
  isSlotInPast,
  getPerthFormattedTime,
  getPerthDateString,
  getPerthNow
} from '../../../utils/perthTime';

// 60 full minutes for customer selection
const ALL_60_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
// Quick jump minute shortcuts
const QUICK_MINUTES = ['00', '15', '30', '45'];

/**
 * Computes available hours dynamically for AM or PM based on salon operating hours:
 * - AM: strictly from opening hour up to 11 AM (no 12 in AM, since 12 is noon).
 * - PM: starts with 12 PM (noon), then 1 PM, 2 PM, ... up to closing hour (e.g. 5 PM for 05:30 PM).
 */
export function getAvailableHoursForPeriod(period, openTimeStr, closeTimeStr, customAddedSlots = []) {
  let openMin = parseSlotToMinutes(openTimeStr || '09:00 AM');
  let closeMin = parseSlotToMinutes(closeTimeStr || '05:30 PM');

  if (Array.isArray(customAddedSlots) && customAddedSlots.length > 0) {
    for (const slot of customAddedSlots) {
      const sMin = parseSlotToMinutes(slot);
      if (sMin > 0) {
        if (sMin < openMin) openMin = sMin;
        if (sMin > closeMin) closeMin = sMin;
      }
    }
  }

  const openHour24 = Math.floor(openMin / 60);
  const closeHour24 = Math.floor(closeMin / 60);

  if (period === 'AM') {
    // Only from opening hour up to 11 AM (12 is noon so it is never shown in AM)
    const startH = Math.max(1, openHour24);
    const endH = Math.min(11, closeHour24);
    if (startH > endH || openHour24 > 11) return [];
    const hours = [];
    for (let h = startH; h <= endH; h++) {
      hours.push(String(h).padStart(2, '0'));
    }
    return hours;
  } else {
    // PM: 12 PM (noon) first, then 1 PM onwards up to closing hour
    const hours = [];
    if (openHour24 <= 12 && closeHour24 >= 12) {
      hours.push('12');
    }
    const startPM = Math.max(13, openHour24);
    const endPM = closeHour24;
    for (let h = startPM; h <= endPM; h++) {
      const h12 = h - 12;
      hours.push(String(h12).padStart(2, '0'));
    }
    return hours;
  }
}

export function StepTime() {
  const { language, t } = useLanguage();
  const {
    formData,
    updateFormData,
    setStep,
    lockedDates = [],
    lockedSlots = {},
    slotReasons = {},
    dateReasons = {},
    customSlots = {},
    dateHours = {}
  } = useBooking();

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

  // Selected appointment date
  const selectedDate = formData.date || perthTodayIso;
  const isTodayInPerth = selectedDate === perthTodayIso;

  // Effective operating hours for this date (incorporating any Admin override)
  const effectiveHours = useMemo(() => {
    return getEffectiveOperatingHours(selectedDate, dateHours);
  }, [selectedDate, dateHours]);

  // Whole date locked check
  const isDateLocked = (Array.isArray(lockedDates) && lockedDates.includes(selectedDate)) || effectiveHours.isClosed;
  const dayLockReason = (dateReasons && dateReasons[selectedDate]) ||
    effectiveHours.note ||
    'Closed / Locked';

  // Normalized locked & removed slots
  const lockedSlotsNormalized = useMemo(() => {
    return (lockedSlots[selectedDate] || []).map(normalizeSlotTime);
  }, [lockedSlots, selectedDate]);

  const removedSlotsNormalized = useMemo(() => {
    return (customSlots?.[selectedDate]?.removed || []).map(normalizeSlotTime);
  }, [customSlots, selectedDate]);

  // Dropdown open states
  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const dropdownWrapRef = useRef(null);
  const minuteListRef = useRef(null);

  // Auto-scroll to selected minute when dropdown opens
  useEffect(() => {
    if (isMinuteDropdownOpen && minuteListRef.current) {
      const activeEl = minuteListRef.current.querySelector('.is-selected');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isMinuteDropdownOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownWrapRef.current && !dropdownWrapRef.current.contains(e.target)) {
        setIsHourDropdownOpen(false);
        setIsMinuteDropdownOpen(false);
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Decompose initial time if present in formData.time
  const initialDecomposed = useMemo(() => {
    if (!formData.time) return null;
    const parts = formData.time.trim().split(/\s+/);
    if (parts.length < 2) return null;
    const [h, m] = parts[0].split(':');
    const p = parts[1].toUpperCase();
    return {
      hour: String(parseInt(h, 10)).padStart(2, '0'),
      minute: String(parseInt(m, 10)).padStart(2, '0'),
      period: p === 'AM' ? 'AM' : 'PM'
    };
  }, [formData.time]);

  // Determine initial period and hour based on Perth time or existing choice
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    if (initialDecomposed) return initialDecomposed.period;
    if (isTodayInPerth && perthNow.hour >= 12) return 'PM';
    return 'AM';
  });

  const [selectedHour, setSelectedHour] = useState(() => {
    if (initialDecomposed) return initialDecomposed.hour;
    const initPeriod = (isTodayInPerth && perthNow.hour >= 12) ? 'PM' : 'AM';
    const initHours = getAvailableHoursForPeriod(
      initPeriod,
      effectiveHours.openTime,
      effectiveHours.closeTime,
      customSlots?.[selectedDate]?.added
    );
    if (initHours.length > 0) {
      if (isTodayInPerth && perthNow.hour >= 12) {
        const h12 = String(perthNow.hour % 12 || 12).padStart(2, '0');
        if (initHours.includes(h12)) return h12;
      }
      return initHours[0];
    }
    return '09';
  });

  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (initialDecomposed) return initialDecomposed.minute;
    return '00';
  });

  // Helper to compute slot status
  const getSlotStatus = (hourStr, minuteStr, periodStr) => {
    const timeStr = formatSlotTime(hourStr, minuteStr, periodStr);
    const norm = normalizeSlotTime(timeStr);
    const slotMin = parseSlotToMinutes(timeStr);
    const openMin = parseSlotToMinutes(effectiveHours.openTime);
    const closeMin = parseSlotToMinutes(effectiveHours.closeTime);

    const isPast = isTodayInPerth && isSlotInPast(timeStr, selectedDate, 0);
    const isBeforeOpen = slotMin < openMin;
    const isAfterClose = slotMin > closeMin;
    const isLockedDirect = lockedSlotsNormalized.includes(norm) || removedSlotsNormalized.includes(norm);
    const isLockedByBlock = !isLockedDirect && lockedSlotsNormalized.some((lockedSlot) => {
      const lMin = parseSlotToMinutes(lockedSlot);
      return slotMin >= lMin && slotMin < lMin + 15;
    });
    const isLocked = isLockedDirect || isLockedByBlock;
    const reason = slotReasons[`${selectedDate}_${norm}`] || slotReasons[`${selectedDate}_${timeStr}`] || '';

    return {
      timeStr,
      norm,
      slotMin,
      isPast,
      isBeforeOpen,
      isAfterClose,
      isLocked,
      reason,
      isAvailable: !isDateLocked && !isPast && !isBeforeOpen && !isAfterClose && !isLocked
    };
  };

  // Helper to check if an hour has at least one valid minute
  const hourHasAvailableMinutes = (hourStr, periodStr) => {
    return ALL_60_MINUTES.some((m) => {
      const status = getSlotStatus(hourStr, m, periodStr);
      return status.isAvailable;
    });
  };

  // Available hours for currently selected period
  const currentPeriodHours = useMemo(() => {
    return getAvailableHoursForPeriod(
      selectedPeriod,
      effectiveHours.openTime,
      effectiveHours.closeTime,
      customSlots?.[selectedDate]?.added
    );
  }, [selectedPeriod, effectiveHours.openTime, effectiveHours.closeTime, customSlots, selectedDate]);

  // Helper to check if a period has at least one available hour
  const periodHasAvailableSlots = (periodStr) => {
    const hours = getAvailableHoursForPeriod(
      periodStr,
      effectiveHours.openTime,
      effectiveHours.closeTime,
      customSlots?.[selectedDate]?.added
    );
    return hours.some((h) => hourHasAvailableMinutes(h, periodStr));
  };

  const amAvailable = periodHasAvailableSlots('AM');
  const pmAvailable = periodHasAvailableSlots('PM');
  const hasNoSlotsLeftToday = !isDateLocked && isTodayInPerth && !amAvailable && !pmAvailable;
  const hasNoSlotsLeftFuture = !isDateLocked && !isTodayInPerth && !amAvailable && !pmAvailable;
  const hasNoSlots = hasNoSlotsLeftToday || hasNoSlotsLeftFuture;

  // Auto-switch period if currently selected period has no slots but other does
  useEffect(() => {
    if (isDateLocked || hasNoSlots) return;
    if (selectedPeriod === 'AM' && !amAvailable && pmAvailable) {
      setSelectedPeriod('PM');
    }
  }, [amAvailable, pmAvailable, selectedPeriod, isDateLocked, hasNoSlots]);

  // Auto-switch hour if current hour is not in currentPeriodHours or has no available minutes
  useEffect(() => {
    if (isDateLocked || hasNoSlots || currentPeriodHours.length === 0) return;
    const isHourInList = currentPeriodHours.includes(selectedHour);
    const currentHourValid = isHourInList && hourHasAvailableMinutes(selectedHour, selectedPeriod);
    if (!currentHourValid) {
      const firstValidHour = currentPeriodHours.find((h) => hourHasAvailableMinutes(h, selectedPeriod));
      if (firstValidHour) {
        setSelectedHour(firstValidHour);
      } else if (currentPeriodHours.length > 0) {
        setSelectedHour(currentPeriodHours[0]);
      }
    }
  }, [selectedHour, selectedPeriod, currentPeriodHours, isDateLocked, hasNoSlots, selectedDate, effectiveHours]);

  // Keep formData.time synchronized with valid hour + minute + period
  useEffect(() => {
    if (isDateLocked || hasNoSlots) {
      if (formData.time) updateFormData({ time: '' });
      return;
    }

    const currentStatus = getSlotStatus(selectedHour, selectedMinute, selectedPeriod);
    if (currentStatus.isAvailable) {
      if (formData.time !== currentStatus.timeStr) {
        updateFormData({ time: currentStatus.timeStr });
      }
    } else {
      // Find first available minute in current hour
      const firstAvailMin = ALL_60_MINUTES.find((m) => getSlotStatus(selectedHour, m, selectedPeriod).isAvailable);
      if (firstAvailMin) {
        setSelectedMinute(firstAvailMin);
        const newTime = formatSlotTime(selectedHour, firstAvailMin, selectedPeriod);
        updateFormData({ time: newTime });
      } else {
        // Clear time if current slot is invalid
        if (formData.time) updateFormData({ time: '' });
      }
    }
  }, [selectedHour, selectedMinute, selectedPeriod, selectedDate, isDateLocked, effectiveHours]);

  // Active slot status of currently selected (hour, minute, period)
  const currentSlotStatus = getSlotStatus(selectedHour, selectedMinute, selectedPeriod);

  // Formatted date string for user friendly preview (e.g. Wednesday, 30-09-2026)
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const [y, m, d] = parts.map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const weekday = dateObj.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU', {
      weekday: 'long',
      timeZone: 'UTC'
    });
    const dStr = String(d).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    return `${weekday}, ${dStr}-${mStr}-${y}`;
  }, [selectedDate, language]);

  // Dropdown toggle handlers
  const toggleHourDropdown = () => {
    setIsHourDropdownOpen((prev) => !prev);
    setIsMinuteDropdownOpen(false);
    setIsPeriodDropdownOpen(false);
  };

  const toggleMinuteDropdown = () => {
    setIsMinuteDropdownOpen((prev) => !prev);
    setIsHourDropdownOpen(false);
    setIsPeriodDropdownOpen(false);
  };

  const togglePeriodDropdown = () => {
    setIsPeriodDropdownOpen((prev) => !prev);
    setIsHourDropdownOpen(false);
    setIsMinuteDropdownOpen(false);
  };

  const handleSelectHour = (h) => {
    setSelectedHour(h);
    setIsHourDropdownOpen(false);
    // Smooth transition: automatically open minute dropdown so user picks minute next
    setIsMinuteDropdownOpen(true);
  };

  const handleSelectMinute = (m, isAvailable) => {
    if (!isAvailable) return;
    setSelectedMinute(m);
    setIsMinuteDropdownOpen(false);
    const newTime = formatSlotTime(selectedHour, m, selectedPeriod);
    updateFormData({ time: newTime });
  };

  const handleSelectPeriod = (p, isAvailable) => {
    if (!isAvailable) return;
    setSelectedPeriod(p);
    setIsPeriodDropdownOpen(false);

    // Switch selectedHour to valid hour in newly selected period
    const newHours = getAvailableHoursForPeriod(
      p,
      effectiveHours.openTime,
      effectiveHours.closeTime,
      customSlots?.[selectedDate]?.added
    );
    if (!newHours.includes(selectedHour) || !hourHasAvailableMinutes(selectedHour, p)) {
      const firstValid = newHours.find((h) => hourHasAvailableMinutes(h, p));
      if (firstValid) {
        setSelectedHour(firstValid);
      } else if (newHours.length > 0) {
        setSelectedHour(newHours[0]);
      }
    }
  };

  const handleNext = () => {
    if (!currentSlotStatus.isAvailable || !formData.time) return;
    setStep(4);
  };

  return (
    <div className="booking-step booking-step--time">
      <h3 className="booking-step__heading">{t('booking.step3')}</h3>
      <p className="booking-step__desc">{t('booking.selectTimePrompt')}</p>

      {/* Western Australia Live Info Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 14px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#475569'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} style={{ color: '#d97706' }} />
          <span>Opening Hours Today:</span>
          <strong style={{ color: '#b45309' }}>
            {effectiveHours.openTime} – {effectiveHours.closeTime}
          </strong>
        </div>
      </div>

      {/* Whole Date Locked Notice */}
      {isDateLocked && (
        <div className="booking-no-slots-box" role="alert">
          <Lock size={26} className="booking-no-slots-box__icon text-rose-500" />
          <div className="booking-no-slots-box__content">
            <h4 className="booking-no-slots-box__title text-rose-700">
              {selectedDate.split('-').reverse().join('-')} is closed for online bookings
            </h4>
            <p className="booking-no-slots-box__desc">
              {dayLockReason}
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
                <span>Choose another date</span>
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

      {/* If all slots for today have already passed */}
      {!isDateLocked && hasNoSlotsLeftToday && (
        <div className="booking-no-slots-box" role="alert">
          <AlertCircle size={26} className="booking-no-slots-box__icon" />
          <div className="booking-no-slots-box__content">
            <h4 className="booking-no-slots-box__title">
              'No online slots remaining for today'
            </h4>
            <p className="booking-no-slots-box__desc">
              {t('booking.noMoreSlotsToday')}
            </p>
            <div className="booking-no-slots-box__actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateFormData({ date: getPerthDateString(1), time: '' });
                }}
              >
                <Calendar size={14} aria-hidden="true" />
                <span>Book for Tomorrow</span>
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

      {/* If all slots for a future date are booked/unavailable */}
      {!isDateLocked && hasNoSlotsLeftFuture && (
        <div className="booking-no-slots-box" role="alert">
          <AlertCircle size={26} className="booking-no-slots-box__icon" />
          <div className="booking-no-slots-box__content">
            <h4 className="booking-no-slots-box__title">
              `No online slots available for ${selectedDate}`
            </h4>
            <p className="booking-no-slots-box__desc">
              'All appointment slots for this date are fully booked or locked. Please choose another date or call our hotline for assistance!'
            </p>
            <div className="booking-no-slots-box__actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(2)}
              >
                <Calendar size={14} aria-hidden="true" />
                <span>Choose another date</span>
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

      {/* 3-Column Dropdown Time Picker (Hour, Minute, Period AM/PM) */}
      {!isDateLocked && !hasNoSlots && (
        <div
          ref={dropdownWrapRef}
          className="booking-time-picker-3col booking-time-picker-dropdowns"
          role="group"
          aria-label="Time Selector Dropdown"
        >
          {/* COLUMN 1: HOURS LIST */}
          <div className="booking-time-dropdown-col">
            <div className="booking-time-dropdown-col__label">
              <span>Hour</span>
              <span className="booking-time-dropdown-col__badge">{selectedPeriod}</span>
            </div>

            <div className="booking-time-dropdown-box">
              {/* Trigger Button */}
              <button
                type="button"
                className={`booking-time-select-trigger ${isHourDropdownOpen ? 'is-open' : ''}`}
                onClick={toggleHourDropdown}
                aria-expanded={isHourDropdownOpen}
                aria-haspopup="listbox"
                id="booking-hour-dropdown-trigger"
              >
                <div className="booking-time-select-trigger__value">
                  <Clock size={16} style={{ color: '#d97706' }} />
                  <span className="booking-time-select-trigger__num">{parseInt(selectedHour, 10)}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`booking-time-select-chevron ${isHourDropdownOpen ? 'is-rotated' : ''}`}
                />
              </button>

              {/* Dropdown Menu: Available Hours in List View */}
              {isHourDropdownOpen && (
                <div
                  className="booking-time-dropdown-menu booking-time-dropdown-menu--hours"
                  role="listbox"
                  aria-labelledby="booking-hour-dropdown-trigger"
                >
                  <div className="booking-hour-list">
                    {currentPeriodHours.map((h) => {
                      const hasSlots = hourHasAvailableMinutes(h, selectedPeriod);
                      const isSelected = selectedHour === h;
                      const displayNum = parseInt(h, 10);

                      let badge = null;
                      if (!hasSlots) {
                        const isAllPast = isTodayInPerth && ALL_60_MINUTES.every((m) => {
                          const st = getSlotStatus(h, m, selectedPeriod);
                          return st.isPast;
                        });
                        badge = (
                          <span className="booking-minute-badge">
                            {isAllPast ? 'Passed' : 'Unavailable'}
                          </span>
                        );
                      } else {
                        badge = (
                          <span className="booking-minute-badge booking-minute-badge--avail">
                            Available
                          </span>
                        );
                      }

                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={!hasSlots}
                          className={`booking-hour-list-item ${isSelected ? 'is-selected' : ''} ${!hasSlots ? 'is-disabled' : ''}`}
                          onClick={() => handleSelectHour(h)}
                          title={
                            !hasSlots ? 'No available slots for this hour' : `${displayNum}:00 ${selectedPeriod}`
                          }
                        >
                          <div className="booking-hour-list-item__time">
                            <Clock size={14} className="booking-hour-list-item__icon" />
                            <span>{displayNum}:00 {selectedPeriod}</span>
                          </div>
                          {badge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: 60 MINUTES DROPDOWN */}
          <div className="booking-time-dropdown-col">
            <div className="booking-time-dropdown-col__label">
              <span>Minute</span>
              <span className="booking-time-dropdown-col__badge">
                60 mins
              </span>
            </div>

            <div className="booking-time-dropdown-box">
              {/* Trigger Button */}
              <button
                type="button"
                className={`booking-time-select-trigger ${isMinuteDropdownOpen ? 'is-open' : ''}`}
                onClick={toggleMinuteDropdown}
                aria-expanded={isMinuteDropdownOpen}
                aria-haspopup="listbox"
                id="booking-minute-dropdown-trigger"
              >
                <div className="booking-time-select-trigger__value">
                  <span className="booking-time-select-trigger__num">{selectedMinute}</span>
                  <span className="booking-time-select-trigger__unit">
                    Minute
                  </span>
                  {currentSlotStatus.isLocked && (
                    <span className="booking-minute-badge booking-minute-badge--locked">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={`booking-time-select-chevron ${isMinuteDropdownOpen ? 'is-rotated' : ''}`}
                />
              </button>

              {/* Dropdown Menu: ALL 60 MINUTES */}
              {isMinuteDropdownOpen && (
                <div
                  className="booking-time-dropdown-menu booking-time-dropdown-menu--minutes"
                  role="listbox"
                  aria-labelledby="booking-minute-dropdown-trigger"
                >
                  {/* Quick-pick bar at top */}
                  <div className="booking-time-dropdown-menu__quick">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                      <span className="booking-time-quick-label">
                        Quick:
                      </span>
                      <div className="booking-time-quick-pills">
                        {QUICK_MINUTES.map((qm) => {
                          const qSlot = getSlotStatus(selectedHour, qm, selectedPeriod);
                          const isQSelected = selectedMinute === qm && qSlot.isAvailable;
                          return (
                            <button
                              key={qm}
                              type="button"
                              disabled={!qSlot.isAvailable}
                              className={`booking-quick-pill ${isQSelected ? 'is-selected' : ''} ${qSlot.isLocked ? 'is-locked' : ''} ${qSlot.isPast ? 'is-past' : ''} ${qSlot.isAfterClose || qSlot.isBeforeOpen ? 'is-closed' : ''}`}
                              onClick={() => handleSelectMinute(qm, qSlot.isAvailable)}
                              title={
                                qSlot.isLocked
                                  ? `${qSlot.timeStr} - Slot locked`
                                  : `:${qm}`
                              }
                            >
                              {qSlot.isLocked && <Lock size={9} />}
                              :{qm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable List of all 60 minutes */}
                  <div className="booking-minute-list-60" ref={minuteListRef}>
                    {ALL_60_MINUTES.map((m) => {
                      const slotInfo = getSlotStatus(selectedHour, m, selectedPeriod);
                      const isSelected = slotInfo.isAvailable && selectedMinute === m;

                      let extraClass = '';
                      let badge = null;
                      if (slotInfo.isLocked) {
                        extraClass = 'is-locked';
                        badge = (
                          <span className="booking-minute-badge booking-minute-badge--locked">
                            <Lock size={10} /> Locked
                          </span>
                        );
                      } else if (slotInfo.isPast) {
                        extraClass = 'is-past';
                        badge = (
                          <span className="booking-minute-badge">
                            Passed
                          </span>
                        );
                      } else if (slotInfo.isAfterClose || slotInfo.isBeforeOpen) {
                        extraClass = 'is-closed';
                        badge = (
                          <span className="booking-minute-badge">
                            Closed
                          </span>
                        );
                      }

                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={!slotInfo.isAvailable}
                          className={`booking-minute-list-item ${isSelected ? 'is-selected' : ''} ${extraClass}`}
                          onClick={() => handleSelectMinute(m, slotInfo.isAvailable)}
                        >
                          <span className="booking-minute-list-item__time">
                            {selectedHour}:{m} {selectedPeriod}
                          </span>
                          {badge || (
                            <span className="booking-minute-badge booking-minute-badge--avail">
                              Available
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: PERIOD (AM/PM) DROPDOWN */}
          <div className="booking-time-dropdown-col booking-time-dropdown-col--period">
            <div className="booking-time-dropdown-col__label">
              <span>Period</span>
            </div>

            <div className="booking-time-dropdown-box">
              {/* Trigger Button */}
              <button
                type="button"
                className={`booking-time-select-trigger ${isPeriodDropdownOpen ? 'is-open' : ''}`}
                onClick={togglePeriodDropdown}
                aria-expanded={isPeriodDropdownOpen}
                aria-haspopup="listbox"
                id="booking-period-dropdown-trigger"
              >
                <div className="booking-time-select-trigger__value">
                  {selectedPeriod === 'AM' ? (
                    <Sun size={16} style={{ color: '#d97706' }} />
                  ) : (
                    <Moon size={16} style={{ color: '#6366f1' }} />
                  )}
                  <span className="booking-time-select-trigger__num">{selectedPeriod}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`booking-time-select-chevron ${isPeriodDropdownOpen ? 'is-rotated' : ''}`}
                />
              </button>

              {/* Dropdown Menu: AM / PM */}
              {isPeriodDropdownOpen && (
                <div
                  className="booking-time-dropdown-menu booking-time-dropdown-menu--period"
                  role="listbox"
                  aria-labelledby="booking-period-dropdown-trigger"
                >
                  {/* AM Option */}
                  <button
                    type="button"
                    disabled={!amAvailable}
                    className={`booking-period-item ${selectedPeriod === 'AM' ? 'is-selected' : ''} ${!amAvailable ? 'is-disabled' : ''}`}
                    onClick={() => handleSelectPeriod('AM', amAvailable)}
                  >
                    <div className="booking-period-item__main">
                      <Sun size={18} style={{ color: selectedPeriod === 'AM' ? '#ffffff' : '#d97706' }} />
                      <div className="booking-period-item__title">AM</div>
                    </div>
                  </button>

                  {/* PM Option */}
                  <button
                    type="button"
                    disabled={!pmAvailable}
                    className={`booking-period-item ${selectedPeriod === 'PM' ? 'is-selected' : ''} ${!pmAvailable ? 'is-disabled' : ''}`}
                    onClick={() => handleSelectPeriod('PM', pmAvailable)}
                  >
                    <div className="booking-period-item__main">
                      <Moon size={18} style={{ color: selectedPeriod === 'PM' ? '#ffffff' : '#6366f1' }} />
                      <div className="booking-period-item__title">PM</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Selected Time Summary Card */}
      {!isDateLocked && !hasNoSlots && (
        <div className="booking-time-summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentSlotStatus.isAvailable
                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentSlotStatus.isAvailable ? '#b45309' : '#94a3b8'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Selected Appointment Time:
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: currentSlotStatus.isAvailable ? '#0f172a' : '#dc2626' }}>
                {currentSlotStatus.isAvailable ? (
                  <span>{currentSlotStatus.timeStr} • {formattedSelectedDate}</span>
                ) : (
                  <span>
                    Please select an available time
                  </span>
                )}
              </div>
            </div>
          </div>

          {currentSlotStatus.isAvailable && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              fontSize: '12px',
              fontWeight: 700
            }}>
              <Check size={14} />
              Available
            </span>
          )}
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
        {!isDateLocked && !hasNoSlots && (
          <Button
            id="step3-next-btn"
            variant="primary"
            size="md"
            disabled={!currentSlotStatus.isAvailable || !formData.time}
            onClick={handleNext}
          >
            {t('booking.nextBtn')} →
          </Button>
        )}
      </div>
    </div>
  );
}

export default StepTime;
