import { Router } from 'express';
import {
  createBooking,
  listBookings,
  updateBookingStatus,
  deleteBooking,
  getStats
} from '../controllers/bookingController.js';
import { validateBooking } from '../middleware/validator.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/bookings - Rate limited and validated (appointment creation)
router.post('/bookings', bookingRateLimiter, validateBooking, createBooking);

// GET /api/bookings - List bookings with filter & search
router.get('/bookings', listBookings);

// GET /api/bookings/stats - Booking KPIs
router.get('/bookings/stats', getStats);

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', updateBookingStatus);

// DELETE /api/bookings/:id - Delete booking
router.delete('/bookings/:id', deleteBooking);

export default router;
