/**
 * Netlify Serverless Function: api.js
 * Handles /api/health and /api/bookings seamlessly on Netlify Serverless Architecture
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
}

function generateBookingCode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `AURA-${randomNum}`;
}

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  const path = event.path || '';

  // 1. Health Check Route: /api/health
  if (path.endsWith('/health') && event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: 'ok',
        service: 'Fashion Nails Morley Galleria (Netlify Serverless)',
        timestamp: new Date().toISOString()
      })
    };
  }

  // 2. Booking Submission Route: /api/bookings
  if ((path.endsWith('/bookings') || path.endsWith('/api')) && event.httpMethod === 'POST') {
    try {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Invalid JSON payload in request body.' })
        };
      }

      const { serviceId, serviceName, date, time, fullName, phone, notes, language } = body;
      const errors = [];

      if (!serviceId || typeof serviceId !== 'string') {
        errors.push('Service ID is required.');
      }

      if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push('A valid appointment date (YYYY-MM-DD) is required.');
      } else {
        const selected = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          errors.push('Appointment date cannot be in the past.');
        }
      }

      if (!time || typeof time !== 'string') {
        errors.push('Appointment time slot is required.');
      }

      const cleanName = sanitize(fullName);
      if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
        errors.push('Full name must be between 2 and 100 characters.');
      }

      const cleanPhone = sanitize(phone).replace(/[\s\-\(\)]/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        errors.push('A valid Australian or international phone number is required.');
      }

      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: errors[0], errors })
        };
      }

      // Generate Booking ID
      const bookingId = generateBookingCode();
      const createdAt = new Date().toISOString();

      const bookingRecord = {
        bookingId,
        serviceId: sanitize(serviceId),
        serviceName: sanitize(serviceName) || 'Atelier Treatment',
        date: sanitize(date),
        time: sanitize(time),
        fullName: cleanName,
        phone: sanitize(phone),
        notes: sanitize(notes),
        language: language === 'en' ? 'en' : 'vi',
        status: 'pending',
        createdAt,
        source: 'website-netlify'
      };

      // Asynchronously forward to Make.com Webhook if configured
      const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
      if (makeWebhookUrl && makeWebhookUrl.startsWith('http')) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4500);

          await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingRecord),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (webhookErr) {
          console.warn('[Netlify Function] Make.com dispatch error (ignored for client response):', webhookErr.message);
        }
      }

      const isEn = bookingRecord.language === 'en';
      const message = isEn
        ? 'Appointment request received successfully! We will confirm via SMS shortly.'
        : 'Yêu cầu đặt lịch đã được tiếp nhận thành công! Chúng tôi sẽ gửi tin nhắn xác nhận sớm nhất.';

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          bookingId,
          message,
          data: {
            bookingId,
            serviceName: bookingRecord.serviceName,
            date: bookingRecord.date,
            time: bookingRecord.time,
            fullName: bookingRecord.fullName,
            createdAt
          }
        })
      };
    } catch (err) {
      console.error('[Netlify Function Error]:', err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          message: 'Server error processing appointment. Please try again or call the atelier.'
        })
      };
    }
  }

  // Fallback 404
  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: false, message: 'Route not found' })
  };
}
