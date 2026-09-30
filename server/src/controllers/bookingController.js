import {
  saveBooking as persistBooking,
  getBookings,
  updateBookingStatus as modifyBookingStatus,
  deleteBooking as removeBooking,
  getBookingStats
} from '../services/bookingService.js';
import { isDateOrSlotLocked } from '../services/scheduleService.js';
import { recordVoucherUsage } from '../services/voucherService.js';
import { sendBookingEmails } from '../services/emailService.js';
import { broadcastNewBooking, broadcastBookingStatusUpdate } from '../socket.js';

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

    // Check if date or slot is locked by Salon Admin
    const isLocked = await isDateOrSlotLocked(rawData.date, rawData.time);
    if (isLocked) {
      const isVi = rawData.language === 'vi';
      return res.status(400).json({
        success: false,
        message: isVi
          ? `The selected time slot (${rawData.time}) on ${rawData.date} is fully booked or locked. Please choose another time.`
          : `The requested time slot (${rawData.time}) on ${rawData.date} is currently locked or unavailable. Please choose another slot.`
      });
    }

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

    // 1. Save to Database (Neon PostgreSQL)
    const saved = await persistBooking(newBooking);

    // 2. Dispatch confirmation emails via Resend (Customer thank-you & Owner alert concurrently)
    sendBookingEmails(newBooking)
      .then(emailResult => {
        console.info(`[Resend Email] Async concurrent email dispatch for ${bookingId}:`, emailResult);
      })
      .catch(err => {
        console.warn(`[Resend Email] Async email error for ${bookingId}:`, err.message);
      });

    // Record voucher usage if a voucher was applied
    if (newBooking.voucher && !newBooking.voucher.includes('Community Discount') && !newBooking.voucher.includes('10% Discount')) {
      try {
        await recordVoucherUsage(newBooking.voucher);
      } catch (err) {
        console.warn(`[Booking] Could not increment voucher usage for ${newBooking.voucher}:`, err.message);
      }
    }

    console.info(`[Booking] ${bookingId} saved to DB: ${saved ? 'SUCCESS' : 'FAIL'}`);

    // 3. Broadcast real-time event to all connected admin clients
    broadcastNewBooking({
      ...newBooking,
      id: saved?.id || bookingId,
      isNew: true
    });

    const isVi = rawData.language === 'vi';
    const message = isVi
      ? 'Your appointment booking has been received successfully! A confirmation has been scheduled.'
      : 'Appointment request received successfully! We will confirm via SMS shortly.';

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
        guests: newBooking.guests,
        price: newBooking.price,
        originalPrice: newBooking.originalPrice,
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
    const { status, search, year, month, day, limit = 100, offset = 0 } = req.query;

    const result = await getBookings({
      status: status || 'all',
      search: search || '',
      year: year || '',
      month: month || '',
      day: day || '',
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const stats = await getBookingStats({ year, month, day });

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

    broadcastBookingStatusUpdate(id, status.toLowerCase());

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
 * Controller for deleting a booking (Disallowed - Bookings cannot be deleted)
 */
export async function deleteBooking(req, res) {
  return res.status(403).json({
    success: false,
    message: 'Booking deletion is prohibited. All customer booking records must be permanently preserved for salon audit and transaction history. Please set booking status to CANCELLED instead.'
  });
}

/**
 * Controller for booking KPI stats
 */
export async function getStats(req, res, next) {
  try {
    const { year, month, day } = req.query;
    const stats = await getBookingStats({ year, month, day });
    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    next(err);
  }
}
