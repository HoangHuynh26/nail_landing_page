import { saveBooking, getAllBookings } from '../services/bookingStore.js';
import { sendToMakeWebhook } from '../services/makeWebhook.js';

/**
 * Helper to generate a memorable, luxury booking code e.g. AURA-8492
 */
function generateBookingCode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `AURA-${randomNum}`;
}

/**
 * Controller for creating a new salon appointment
 */
export async function createBooking(req, res, next) {
  try {
    const rawData = req.sanitizedBooking;

    const bookingId = generateBookingCode();
    const createdAt = new Date().toISOString();

    const newBooking = {
      bookingId,
      ...rawData,
      status: 'pending',
      createdAt,
      source: 'website'
    };

    // 1. Save to local audit persistence
    await saveBooking(newBooking);

    // 2. Dispatch to Make.com asynchronously
    sendToMakeWebhook(newBooking).catch(err => {
      console.error('Make.com webhook dispatch error:', err);
    });

    const isEn = rawData.language === 'en';
    const message = isEn
      ? 'Appointment request received successfully! We will confirm via SMS shortly.'
      : 'Yêu cầu đặt lịch đã được tiếp nhận thành công! Chúng tôi sẽ gửi tin nhắn xác nhận sớm nhất.';

    return res.status(201).json({
      success: true,
      bookingId,
      message,
      data: {
        bookingId,
        serviceName: newBooking.serviceName,
        date: newBooking.date,
        time: newBooking.time,
        fullName: newBooking.fullName,
        createdAt
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for listing all bookings
 */
export async function listBookings(req, res, next) {
  try {
    const bookings = await getAllBookings();
    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
}
