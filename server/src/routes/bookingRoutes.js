import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import {
  createBooking,
  listBookings,
  updateBookingStatus,
  deleteBooking,
  getStats,
  previewStatusEmail
} from '../controllers/bookingController.js';
import { validateBooking } from '../middleware/validator.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// GET /api/bookings/preview-email/:status - Preview status emails (confirmed, completed, cancelled)
router.get('/bookings/preview-email/:status', authenticateAdmin, previewStatusEmail);

// POST /api/bookings - Rate limited and validated (appointment creation)
router.post('/bookings', bookingRateLimiter, validateBooking, createBooking);

// GET /api/bookings - List bookings with filter & search
router.get('/bookings', authenticateAdmin, listBookings);

// GET /api/bookings/stats - Booking KPIs
router.get('/bookings/stats', authenticateAdmin, getStats);

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', authenticateAdmin, updateBookingStatus);

// DELETE /api/bookings/:id - Delete booking
router.delete('/bookings/:id', authenticateAdmin, deleteBooking);


export default router;
