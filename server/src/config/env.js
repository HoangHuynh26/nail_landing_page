import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  adminPin: process.env.ADMIN_PIN || '8888',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 60,
  resendApiKey: (process.env.RESEND_API_KEY || process.env.RESEND || '')
    .replace(/^https?:\/\/.*?\//, '')
    .trim(),
  salonOwnerEmail: process.env.SALON_OWNER_EMAIL || process.env.OWNER_EMAIL || '',
  emailFrom: process.env.EMAIL_FROM || 'Fashion Nails Morley <onboarding@resend.dev>'
};
