/**
 * Input sanitization helper to prevent XSS
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip < and >
    .trim();
}

/**
 * Validates incoming booking request payload
 */
export function validateBooking(req, res, next) {
  const { serviceId, serviceName, service, date, time, fullName, name, phone, email, guests, notes, message, voucher, language } = req.body;

  const errors = [];

  // Required checks
  const cleanService = sanitize(service || serviceName);
  if (!cleanService && (!serviceId || typeof serviceId !== 'string')) {
    errors.push('A service name or Service ID is required.');
  }

  if (!date || typeof date !== 'string') {
    errors.push('Booking date is required.');
  } else {
    // Check ISO format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      errors.push('Date must be in YYYY-MM-DD format.');
    } else {
      // Validate against Western Australia (Perth / AWST) current date
      const perthTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Perth' });

      if (date < perthTodayStr) {
        errors.push('Appointment date cannot be in the past.');
      } else {
        const [pY, pM, pD] = perthTodayStr.split('-').map(Number);
        const maxFuture = new Date(Date.UTC(pY, pM - 1, pD + 90));
        const maxFutureStr = maxFuture.toISOString().split('T')[0];
        if (date > maxFutureStr) {
          errors.push('Appointments cannot be booked more than 90 days in advance.');
        }
      }
    }
  }

  const perthTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Perth' });

  if (!time || typeof time !== 'string') {
    errors.push('Appointment time is required.');
  } else if (date === perthTodayStr) {
    const parts = time.trim().split(/\s+/);
    if (parts.length >= 2) {
      const [timePart, meridiem] = parts;
      const [hStr, mStr] = timePart.split(':');
      let hours = parseInt(hStr, 10);
      const minutes = parseInt(mStr, 10) || 0;
      if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      const slotMinutes = hours * 60 + minutes;

      const perthFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Australia/Perth',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const pParts = perthFormatter.formatToParts(new Date());
      const pHour = parseInt(pParts.find(p => p.type === 'hour')?.value || '0', 10);
      const pMinute = parseInt(pParts.find(p => p.type === 'minute')?.value || '0', 10);
      const perthTotalMinutes = pHour * 60 + pMinute;

      if (slotMinutes <= perthTotalMinutes) {
        errors.push('The selected appointment time has already passed in Western Australia. Please choose an upcoming time.');
      }
    }
  }

  const cleanName = sanitize(name || fullName);
  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    errors.push('Customer name is required (between 2 and 100 characters).');
  }

  const cleanPhone = sanitize(phone).replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 20) {
    errors.push('A valid Australian or international contact phone number is required.');
  }

  // Email is required, validate presence and format
  const cleanEmail = sanitize(email);
  if (!cleanEmail) {
    errors.push('A valid email address is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.push('Please enter a valid email address.');
  }

  // Number of guests: default to 1, accept 1 to 20
  const parsedGuests = parseInt(guests, 10);
  const cleanGuests = (!isNaN(parsedGuests) && parsedGuests >= 1 && parsedGuests <= 20) ? parsedGuests : 1;

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  const cleanMessage = sanitize(message !== undefined ? message : (notes || ''));
  const cleanVoucher = sanitize(voucher || '');
  const finalServiceName = cleanService || sanitize(serviceName) || sanitize(serviceId) || 'Gel Manicure';

  // Attach sanitized fields to req.sanitizedBooking
  req.sanitizedBooking = {
    type: 'appointment',
    name: cleanName,
    fullName: cleanName,
    phone: sanitize(phone),
    email: cleanEmail,
    service: finalServiceName,
    serviceName: finalServiceName,
    serviceId: sanitize(serviceId) || 'service-general',
    date: sanitize(date),
    time: sanitize(time),
    message: cleanMessage,
    notes: cleanMessage,
    voucher: cleanVoucher,
    guests: cleanGuests,
    language: language === 'en' ? 'en' : 'vi'
  };

  next();
}

