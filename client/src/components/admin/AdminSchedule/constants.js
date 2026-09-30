export const QUICK_REASONS = [
  'Full slot',
  'Fully Booked (Walk-ins)',
  'Direct Walk-in Client',
  'Staff Shortage',
  'Private Appointment',
  'Salon Maintenance',
  'Public Holiday',
  'Break / Cleaning'
];

export const HOURS_12 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
export const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const LOCK_DURATIONS = [
  { value: '15', label: 'Exact slot only (15 mins)' },
  { value: '30', label: '30 mins' },
  { value: '45', label: '45 mins' },
  { value: '60', label: '1 hour (60 mins)' },
  { value: '90', label: '1 hour 30 mins' },
  { value: '120', label: '2 hours (120 mins)' },
  { value: 'morning', label: 'Entire morning (08:00 AM – 12:00 PM)' },
  { value: 'afternoon', label: 'Entire afternoon (12:00 PM – 06:00 PM)' }
];

export const PRESET_HOURS = [
  { label: 'Standard Weekday (09:00 AM – 05:30 PM)', openHour: '09', openMinute: '00', openPeriod: 'AM', closeHour: '05', closeMinute: '30', closePeriod: 'PM', note: '' },
  { label: 'Early Open (08:00 AM – 05:30 PM)', openHour: '08', openMinute: '00', openPeriod: 'AM', closeHour: '05', closeMinute: '30', closePeriod: 'PM', note: 'Early opening' },
  { label: 'Early Open (08:30 AM – 05:30 PM)', openHour: '08', openMinute: '30', openPeriod: 'AM', closeHour: '05', closeMinute: '30', closePeriod: 'PM', note: 'Early opening' },
  { label: 'Overtime Late (09:00 AM – 07:00 PM)', openHour: '09', openMinute: '00', openPeriod: 'AM', closeHour: '07', closeMinute: '00', closePeriod: 'PM', note: 'Overtime late hours' },
  { label: 'Overtime Late (09:00 AM – 08:00 PM)', openHour: '09', openMinute: '00', openPeriod: 'AM', closeHour: '08', closeMinute: '00', closePeriod: 'PM', note: 'Overtime late hours' },
  { label: 'Sunday Standard (11:00 AM – 04:30 PM)', openHour: '11', openMinute: '00', openPeriod: 'AM', closeHour: '04', closeMinute: '30', closePeriod: 'PM', note: '' },
  { label: 'Sunday Extended (10:00 AM – 05:00 PM)', openHour: '10', openMinute: '00', openPeriod: 'AM', closeHour: '05', closeMinute: '00', closePeriod: 'PM', note: 'Extended Sunday hours' }
];

export const PRESET_CUSTOM_SLOTS = [
  { label: '08:00 AM (Early Open)', hour: '08', minute: '00', period: 'AM' },
  { label: '08:30 AM (Early Open)', hour: '08', minute: '30', period: 'AM' },
  { label: '09:00 AM (Early Open)', hour: '09', minute: '00', period: 'AM' },
  { label: '12:30 PM (Midday)', hour: '12', minute: '30', period: 'PM' },
  { label: '12:45 PM (Afternoon)', hour: '12', minute: '45', period: 'PM' },
  { label: '05:15 PM (Late Afternoon)', hour: '05', minute: '15', period: 'PM' },
  { label: '05:30 PM (Overtime)', hour: '05', minute: '30', period: 'PM' },
  { label: '06:00 PM (Overtime)', hour: '06', minute: '00', period: 'PM' },
  { label: '06:30 PM (Late Evening)', hour: '06', minute: '30', period: 'PM' },
  { label: '07:00 PM (Late Evening)', hour: '07', minute: '00', period: 'PM' },
  { label: '07:30 PM (Late Evening)', hour: '07', minute: '30', period: 'PM' }
];
