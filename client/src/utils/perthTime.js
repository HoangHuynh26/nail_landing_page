/**
 * Western Australia (Perth / AWST: UTC+8) Timezone Utilities
 * Fashion Nails Morley Galleria operates according to Western Australia Standard Time.
 */

export const PERTH_TIMEZONE = 'Australia/Perth';

/**
 * Get current time and date parts in Western Australia
 */
export function getPerthNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PERTH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const get = (type) => parts.find(p => p.type === type)?.value || '0';

  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10); // 1 - 12
  const day = parseInt(get('day'), 10);
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const second = parseInt(get('second'), 10);

  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const totalMinutes = hour * 60 + minute;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    isoDate,
    totalMinutes
  };
}

/**
 * Returns ISO date string (YYYY-MM-DD) for Perth with day offset (0 = today, 1 = tomorrow, ...)
 */
export function getPerthDateString(offsetDays = 0) {
  const p = getPerthNow();
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays));
  return d.toISOString().split('T')[0];
}

/**
 * Returns formatted 12-hour local time in Western Australia (e.g. '03:42 PM' or '03:42:15 PM')
 */
export function getPerthFormattedTime(includeSeconds = false) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PERTH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true
  }).format(new Date());
}

/**
 * Returns the current time parts (hour 01-12, minute 00-59, period 'AM'/'PM') in Western Australia (Perth / AWST: UTC+8).
 * If roundTo15 is true, rounds minute to the nearest standard 15-minute slot (00, 15, 30, 45).
 */
export function getPerth12HourParts(roundTo15 = true) {
  const p = getPerthNow();
  let hour = p.hour;
  let minute = p.minute;

  if (roundTo15) {
    const roundedMin = Math.round(minute / 15) * 15;
    if (roundedMin === 60) {
      hour = (hour + 1) % 24;
      minute = 0;
    } else {
      minute = roundedMin;
    }
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  let h12 = hour % 12;
  if (h12 === 0) h12 = 12;

  const exactPeriod = p.hour >= 12 ? 'PM' : 'AM';
  let exactH12 = p.hour % 12;
  if (exactH12 === 0) exactH12 = 12;

  return {
    hour: String(h12).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
    period,
    exactHour: String(exactH12).padStart(2, '0'),
    exactMinute: String(p.minute).padStart(2, '0'),
    exactPeriod,
    formatted: `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`,
    exactFormatted: `${String(exactH12).padStart(2, '0')}:${String(p.minute).padStart(2, '0')} ${exactPeriod}`
  };
}

/**
 * Converts a slot string like "09:30 AM" or "02:15 PM" to total minutes from midnight (0 - 1439)
 */
export function parseSlotToMinutes(slotStr) {
  if (!slotStr) return 0;
  const parts = slotStr.trim().split(/\s+/);
  if (parts.length < 2) return 0;
  const [timePart, meridiem] = parts;
  const [hStr, mStr] = timePart.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10) || 0;

  if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Normalizes time string to standard "hh:mm AM/PM" (e.g. "12:45 PM", "09:30 AM")
 */
export function normalizeSlotTime(str) {
  if (!str) return '';
  const clean = str.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return clean;
  const h = String(parseInt(match[1], 10)).padStart(2, '0');
  const m = match[2];
  const p = match[3].toUpperCase();
  return `${h}:${m} ${p}`;
}

/**
 * Formats minutes from midnight (0-1439) into standard "hh:mm AM/PM" string
 */
export function formatMinutesToTime(minutes) {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
}

/**
 * Standard operating hours in Perth by day of week:
 * - Sunday (0): 11:00 AM – 04:30 PM
 * - Thursday (4): 09:00 AM – 07:00 PM (Late Night Shopping)
 * - Mon, Tue, Wed, Fri, Sat: 09:00 AM – 05:30 PM
 */
export function getStandardHoursForDate(isoDate) {
  if (!isoDate) {
    return { openTime: '09:00 AM', closeTime: '05:30 PM', label: 'Standard Hours' };
  }
  const [y, m, d] = isoDate.split('-').map(n => parseInt(n, 10));
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = dateObj.getUTCDay();

  if (dayOfWeek === 0) {
    return { openTime: '11:00 AM', closeTime: '04:30 PM', label: 'Sunday Hours' };
  }
  if (dayOfWeek === 4) {
    return { openTime: '09:00 AM', closeTime: '07:00 PM', label: 'Thursday Late Night' };
  }
  return { openTime: '09:00 AM', closeTime: '05:30 PM', label: 'Standard Hours' };
}

/**
 * Gets effective operating hours for a date, applying any custom admin overrides
 */
export function getEffectiveOperatingHours(isoDate, dateHoursData = {}) {
  const std = getStandardHoursForDate(isoDate);
  const custom = dateHoursData?.[isoDate];

  if (custom && custom.openTime && custom.closeTime) {
    return {
      openTime: normalizeSlotTime(custom.openTime),
      closeTime: normalizeSlotTime(custom.closeTime),
      isClosed: Boolean(custom.isClosed),
      isCustom: true,
      note: custom.note || 'Special Salon Hours',
      label: custom.note || 'Custom Hours'
    };
  }

  return {
    ...std,
    isClosed: false,
    isCustom: false,
    note: ''
  };
}

/**
 * Generates slots at intervals (default 15 mins) between open and close times
 */
export function generateSlotsForOperatingHours(openTimeStr, closeTimeStr, stepMinutes = 15) {
  const openMin = parseSlotToMinutes(openTimeStr);
  const closeMin = parseSlotToMinutes(closeTimeStr);
  const slots = [];

  for (let m = openMin; m <= closeMin; m += stepMinutes) {
    slots.push(formatMinutesToTime(m));
  }

  return slots;
}

/**
 * Salon operating hours slots by day of week in Perth (dynamic from operating hours)
 */
export function getSalonSlotsForDate(isoDate, dateHoursData = {}) {
  if (!isoDate) return [];
  const hours = getEffectiveOperatingHours(isoDate, dateHoursData);
  if (hours.isClosed) return [];
  return generateSlotsForOperatingHours(hours.openTime, hours.closeTime, 15);
}

/**
 * Checks if a slot has passed relative to current Western Australia time
 */
export function isSlotInPast(slotStr, isoDate, bufferMinutes = 0) {
  const perth = getPerthNow();
  if (isoDate < perth.isoDate) return true;
  if (isoDate > perth.isoDate) return false;

  // Date is today in Perth
  const slotMinutes = parseSlotToMinutes(slotStr);
  return slotMinutes <= (perth.totalMinutes + bufferMinutes);
}

/**
 * Checks if a slot is before opening time or after closing time
 */
export function isSlotOutOfOperatingHours(slotStr, openTime, closeTime) {
  if (!slotStr || !openTime || !closeTime) return false;
  const slotMin = parseSlotToMinutes(slotStr);
  const openMin = parseSlotToMinutes(openTime);
  const closeMin = parseSlotToMinutes(closeTime);
  return slotMin < openMin || slotMin > closeMin;
}

/**
 * Formats hour, minute, and AM/PM into standard slot string e.g. "08:30 AM"
 */
export function formatSlotTime(hours, minutes, period = 'AM') {
  const h = String(parseInt(hours, 10) || 0).padStart(2, '0');
  const m = String(parseInt(minutes, 10) || 0).padStart(2, '0');
  const p = (period || 'AM').toUpperCase();
  return `${h}:${m} ${p}`;
}

/**
 * Returns customized salon slots for a date by applying custom added and removed overrides.
 * Results are sorted chronologically.
 */
export function getCustomizedSlotsForDate(isoDate, customSlotsData = {}, dateHoursData = {}) {
  const defaultSlots = getSalonSlotsForDate(isoDate, dateHoursData);
  if (!customSlotsData || !customSlotsData[isoDate]) {
    return defaultSlots;
  }

  const { added = [], removed = [] } = customSlotsData[isoDate];
  const normalizedRemoved = removed.map(normalizeSlotTime);

  // Filter out removed default slots
  let activeSlots = defaultSlots.filter(s => !normalizedRemoved.includes(normalizeSlotTime(s)));

  // Add custom added slots if not already in list
  for (const s of added) {
    const norm = normalizeSlotTime(s);
    if (!activeSlots.map(normalizeSlotTime).includes(norm)) {
      activeSlots.push(norm);
    }
  }

  // Sort chronologically using parseSlotToMinutes
  activeSlots.sort((a, b) => parseSlotToMinutes(a) - parseSlotToMinutes(b));

  return activeSlots;
}

