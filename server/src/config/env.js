import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  adminPin: process.env.ADMIN_PIN,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 60,
  resendApiKey: (process.env.RESEND_API_KEY || process.env.RESEND || '')
    .replace(/^https?:\/\/.*?\//, '')
    .trim(),
  salonOwnerEmail: process.env.SALON_OWNER_EMAIL || process.env.OWNER_EMAIL || '',
  emailFrom: process.env.EMAIL_FROM || 'Fashion Nail Morley <onboarding@resend.dev>',
  adminDashboardUrl: process.env.ADMIN_DASHBOARD_URL || 'https://fashionnailmorley.com.au/admin'
};
