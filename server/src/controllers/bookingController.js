import {
  saveBooking as persistBooking,
  saveBookingWithTransaction,
  getBookings,
  updateBookingStatus as modifyBookingStatus,
  deleteBooking as removeBooking,
  getBookingStats
} from '../services/bookingService.js';
import { isDateOrSlotLocked } from '../services/scheduleService.js';
import { recordVoucherUsage, validateAndCalculateVoucher, revertVoucherUsage } from '../services/voucherService.js';
import {
  sendBookingEmails,
  sendBookingStatusEmail,
  buildConfirmedEmailHtml,
  buildCompletedEmailHtml,
  buildCancelledEmailHtml
} from '../services/emailService.js';
import { broadcastNewBooking, broadcastBookingStatusUpdate } from '../socket.js';
import { getServiceById } from '../services/serviceService.js';
import { executeQuery, readFallbackStore } from '../db/db.js';

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

    let voucherIncremented = false;

    // Calculate real price from database to prevent client tampering
    try {
      const service = await getServiceById(rawData.serviceId);
      if (!service || service.isActive === false || service.is_active === false || service.active === false) {
        return res.status(400).json({ success: false, message: 'Invalid or inactive service selected.' });
      }
      
      let realOriginalPrice = service.price * (rawData.guests || 1);
      let realPrice = realOriginalPrice;
      
      // Apply voucher logic if exists
      if (rawData.voucher) {
         const vResult = await validateAndCalculateVoucher(rawData.voucher, realOriginalPrice, rawData.date);
         if (vResult.valid) {
           realPrice = vResult.finalPrice;
         } else {
           return res.status(400).json({ success: false, message: vResult.message });
         }
      }
      
      newBooking.originalPrice = Math.round(realOriginalPrice * 100) / 100;
      newBooking.price = Math.round(realPrice * 100) / 100;
      newBooking.unitPrice = service.price; // Prevent client unitPrice tampering
      
      // Voucher will be incremented in the transaction with booking save.
    } catch (priceErr) {
      console.error('[Booking] Error calculating price or validating voucher:', priceErr);
      return res.status(500).json({ success: false, message: 'Internal server error during booking validation.' });
    }

    // 1. Save to Database with Transaction (Neon PostgreSQL)
    let saved = null;
    try {
      saved = await saveBookingWithTransaction(newBooking, rawData.voucher);
      if (!saved) throw new Error('DB save returned null or false');
    } catch (saveErr) {
      console.error('[Booking] Error saving booking to DB:', saveErr.message);
      if (saveErr.message.includes('Voucher')) {
         return res.status(400).json({ success: false, message: saveErr.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to save booking. Please try again later.' });
    }

    // 2. Dispatch confirmation emails via Resend (Customer thank-you & Owner alert concurrently)
    sendBookingEmails(newBooking)
      .then(emailResult => {
        console.info(`[Resend Email] Async concurrent email dispatch for ${bookingId}:`, emailResult);
      })
      .catch(err => {
        console.warn(`[Resend Email] Async email error for ${bookingId}:`, err.message);
      });

    // Email logic remains as-is

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

    // Dispatch status change notification email to customer
    const lowerStatus = status.toLowerCase();
    let emailDispatched = false;
    if (['confirmed', 'completed', 'cancelled'].includes(lowerStatus)) {
      emailDispatched = true;
      sendBookingStatusEmail(updated, lowerStatus)
        .then((emailRes) => {
          console.info(`[Resend Email] Status notification email (${lowerStatus}) dispatched for #${updated.bookingId || id}:`, emailRes);
        })
        .catch((err) => {
          console.warn(`[Resend Email] Failed to send status notification email (${lowerStatus}) for #${updated.bookingId || id}:`, err.message);
        });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updated,
      emailDispatched
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to preview HTML email templates for testing/visual inspection
 */
export async function previewStatusEmail(req, res, next) {
  try {
    const { status } = req.params;
    const lowerStatus = String(status || '').toLowerCase();

    const sampleBooking = {
      bookingId: 'AURA-8788',
      name: 'Monica Pham',
      phone: '+61 431 881 993',
      email: 'monicapham1993@gmail.com',
      service: 'Builder Gel - BIAB (natural nails)',
      category: 'Builder Gel - BIAB',
      duration: '50',
      date: '2026-10-07',
      time: '11:02 AM',
      guests: 1,
      price: 60,
      originalPrice: 60,
      voucher: '',
      message: 'Looking forward to my relaxing appointment!'
    };

    let html = '';
    if (lowerStatus === 'confirmed') {
      html = buildConfirmedEmailHtml(sampleBooking);
    } else if (lowerStatus === 'completed') {
      html = buildCompletedEmailHtml(sampleBooking);
    } else if (lowerStatus === 'cancelled') {
      html = buildCancelledEmailHtml(sampleBooking);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status for preview. Must be confirmed, completed, or cancelled.'
      });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
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
