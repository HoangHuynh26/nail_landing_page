import {
  saveBooking as persistBooking,
  getBookings,
  updateBookingStatus as modifyBookingStatus,
  deleteBooking as removeBooking,
  getBookingStats
} from '../services/bookingService.js';
import { sendToMakeWebhook } from '../services/makeWebhook.js';

/**
 * Generates memorable luxury booking code e.g. AURA-8492
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
      type: rawData.type || 'appointment',
      ...rawData,
      status: 'pending',
      createdAt,
      source: 'website'
    };

    // 1. Save to Database (Neon PostgreSQL) & 2. Dispatch to Make.com webhook concurrently to send email
    const [saved, makeResult] = await Promise.all([
      persistBooking(newBooking),
      sendToMakeWebhook(newBooking)
    ]);

    console.info(`[Booking] ${bookingId} processed -> DB: ${saved ? 'SAVED' : 'FAIL'}, Make.com Webhook: ${makeResult?.sent ? 'SENT' : 'SKIPPED/ERROR'}`);

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
        name: newBooking.name,
        phone: newBooking.phone,
        email: newBooking.email,
        service: newBooking.service,
        date: newBooking.date,
        time: newBooking.time,
        message: newBooking.message,
        voucher: newBooking.voucher,
        createdAt
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for listing bookings with filter, search & pagination
 */
export async function listBookings(req, res, next) {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    const result = await getBookings({
      status: status || 'all',
      search: search || '',
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const stats = await getBookingStats();

    return res.status(200).json({
      success: true,
      count: result.bookings.length,
      total: result.total,
      stats,
      bookings: result.bookings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for updating booking status
 */
export async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await modifyBookingStatus(id, status.toLowerCase());
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for deleting a booking
 */
export async function deleteBooking(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await removeBooking(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for booking KPI stats
 */
export async function getStats(req, res, next) {
  try {
    const stats = await getBookingStats();
    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    next(err);
  }
}
