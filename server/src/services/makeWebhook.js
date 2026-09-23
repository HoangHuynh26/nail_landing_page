import { config } from '../config/env.js';

/**
 * Helper to format 12-hour AM/PM time slot to 24-hour "HH:MM" format
 * e.g., "02:00 PM" -> "14:00", "09:30 AM" -> "09:30"
 */
function formatTimeTo24h(timeStr) {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const meridiem = (match[3] || '').toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }
  return trimmed;
}

/**
 * Helper to format Australian phone numbers into international +61 format
 * e.g., "0412 345 678" -> "+61412345678"
 */
function formatAustralianPhone(phoneStr) {
  if (!phoneStr) return '';
  const cleaned = phoneStr.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+61${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('61') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Dispatches appointment booking payload to Make.com webhook
 * Sends strictly and only the requested appointment fields:
 * {
 *   "name": "Customer Name",
 *   "phone": "+61XXXXXXXXX",
 *   "email": "customer@email.com",
 *   "service": "Gel Manicure",
 *   "date": "2026-10-01",
 *   "time": "14:00",
 *   "message": "...",
 *   "voucher": "..."
 * }
 */
export async function sendToMakeWebhook(bookingPayload) {
  const webhookUrl = config.makeWebhookUrl;

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.info('[Make.com Webhook] No valid MAKE_WEBHOOK_URL set in .env. Skipping external dispatch.');
    return { sent: false, reason: 'Webhook URL not configured' };
  }

  // Exactly and only the 8 fields requested for book an appointment
  const payload = {
    name: bookingPayload.name || bookingPayload.fullName || '',
    phone: formatAustralianPhone(bookingPayload.phone),
    email: bookingPayload.email || '',
    service: bookingPayload.service || bookingPayload.serviceName || '',
    date: bookingPayload.date || '',
    time: formatTimeTo24h(bookingPayload.time),
    message: bookingPayload.message !== undefined ? bookingPayload.message : (bookingPayload.notes || ''),
    voucher: bookingPayload.voucher || ''
  };

  try {
    console.info(`[Make.com Webhook] Dispatching booking for ${payload.name} (${payload.service}) to Make.com...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'FashionNails-BookingServer/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Make.com Webhook] Make.com returned HTTP ${response.status}`);
      return { sent: false, status: response.status };
    }

    console.info(`[Make.com Webhook] Successfully delivered appointment for ${payload.name} to Make.com.`);
    return { sent: true };
  } catch (err) {
    console.warn(`[Make.com Webhook] Delivery failed or timed out: ${err.message}. Local booking remains safe.`);
    return { sent: false, error: err.message };
  }
}

