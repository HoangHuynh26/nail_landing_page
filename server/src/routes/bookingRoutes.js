import { Router } from 'express';
import { createBooking, listBookings } from '../controllers/bookingController.js';
import { validateBooking } from '../middleware/validator.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/bookings - Rate limited and validated (appointment)
router.post('/bookings', bookingRateLimiter, validateBooking, createBooking);

// GET /api/bookings - List bookings
router.get('/bookings', listBookings);

export default router;

