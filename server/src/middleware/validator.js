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
  const { serviceId, serviceName, date, time, fullName, phone, notes, language } = req.body;

  const errors = [];

  // Required checks
  if (!serviceId || typeof serviceId !== 'string') {
    errors.push('Service ID is required and must be a valid string.');
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

  if (!time || typeof time !== 'string') {
    errors.push('Appointment time is required.');
  }

  const cleanName = sanitize(fullName);
  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    errors.push('Full name must be between 2 and 100 characters.');
  }

  const cleanPhone = sanitize(phone).replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 20) {
    errors.push('A valid Australian or international contact phone number is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  // Attach sanitized fields to req.sanitizedBooking
  req.sanitizedBooking = {
    serviceId: sanitize(serviceId),
    serviceName: sanitize(serviceName) || 'Atelier Treatment',
    date: sanitize(date),
    time: sanitize(time),
    fullName: cleanName,
    phone: sanitize(phone),
    notes: sanitize(notes),
    language: language === 'en' ? 'en' : 'vi'
  };

  next();
}
