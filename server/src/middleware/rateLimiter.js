import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const bookingRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking requests from this IP. Please try again after 15 minutes.'
  }
});
