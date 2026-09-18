import { config } from '../config/env.js';

/**
 * Dispatches booking payload to Make.com webhook
 * Never exposes the webhook URL to the client.
 */
export async function sendToMakeWebhook(bookingPayload) {
  const webhookUrl = config.makeWebhookUrl;

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.info('[Make.com Webhook] No valid MAKE_WEBHOOK_URL set in .env. Skipping external dispatch.');
    return { sent: false, reason: 'Webhook URL not configured' };
  }

  // Format payload specifically for Make.com / Google Sheets scenario
  const payload = {
    bookingId: bookingPayload.bookingId,
    serviceId: bookingPayload.serviceId,
    serviceName: bookingPayload.serviceName,
    date: bookingPayload.date,
    time: bookingPayload.time,
    fullName: bookingPayload.fullName,
    phone: bookingPayload.phone,
    notes: bookingPayload.notes || '',
    language: bookingPayload.language,
    status: bookingPayload.status || 'pending',
    createdAt: bookingPayload.createdAt,
    source: 'website'
  };

  try {
    console.info(`[Make.com Webhook] Dispatching booking ${bookingPayload.bookingId} to Make.com...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AtelierLumiere-BookingServer/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Make.com Webhook] Make.com returned HTTP ${response.status}`);
      return { sent: false, status: response.status };
    }

    console.info(`[Make.com Webhook] Successfully delivered booking ${bookingPayload.bookingId} to Make.com.`);
    return { sent: true };
  } catch (err) {
    console.warn(`[Make.com Webhook] Delivery failed or timed out: ${err.message}. Local booking remains safe.`);
    return { sent: false, error: err.message };
  }
}
