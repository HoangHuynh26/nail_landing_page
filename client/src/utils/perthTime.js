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
 * Returns formatted 12-hour local time in Western Australia (e.g. '12:30 PM')
 */
export function getPerthFormattedTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PERTH_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
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
 * Salon operating hours slots by day of week in Perth:
 * - Mon, Tue, Wed, Fri, Sat: 9:00 AM - 5:30 PM (slots: 09:30 AM - 04:45 PM)
 * - Thu: 9:00 AM - 7:00 PM (late night shopping, slots up to 06:15 PM)
 * - Sun: 11:00 AM - 4:30 PM (slots: 11:15 AM - 03:45 PM)
 */
export function getSalonSlotsForDate(isoDate) {
  if (!isoDate) return [];
  const [y, m, d] = isoDate.split('-').map(n => parseInt(n, 10));
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 4 = Thu, 6 = Sat

  if (dayOfWeek === 0) {
    // Sunday: 11:00 AM - 4:30 PM
    return [
      "11:15 AM",
      "12:00 PM",
      "12:45 PM",
      "01:30 PM",
      "02:15 PM",
      "03:00 PM",
      "03:45 PM"
    ];
  }

  if (dayOfWeek === 4) {
    // Thursday: 9:00 AM - 7:00 PM (Late Night)
    return [
      "09:30 AM",
      "10:15 AM",
      "11:00 AM",
      "11:45 AM",
      "01:00 PM",
      "01:45 PM",
      "02:30 PM",
      "03:15 PM",
      "04:00 PM",
      "04:45 PM",
      "05:30 PM",
      "06:15 PM"
    ];
  }

  // Mon, Tue, Wed, Fri, Sat: 9:00 AM - 5:30 PM
  return [
    "09:30 AM",
    "10:15 AM",
    "11:00 AM",
    "11:45 AM",
    "01:00 PM",
    "01:45 PM",
    "02:30 PM",
    "03:15 PM",
    "04:00 PM",
    "04:45 PM"
  ];
}

/**
 * Checks if a slot has passed relative to current Western Australia time
 * Buffer: 20 minutes buffer for customer travel / salon arrival prep
 */
export function isSlotInPast(slotStr, isoDate, bufferMinutes = 0) {
  const perth = getPerthNow();
  if (isoDate < perth.isoDate) return true;
  if (isoDate > perth.isoDate) return false;

  // Date is today in Perth
  const slotMinutes = parseSlotToMinutes(slotStr);
  return slotMinutes <= (perth.totalMinutes + bufferMinutes);
}
