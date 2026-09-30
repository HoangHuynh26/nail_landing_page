import cron from 'node-cron';
import { expireDueVouchers } from '../services/voucherService.js';

let cronJob = null;
let midnightJob = null;

/**
 * Starts the voucher expiration cron jobs
 */
export function startVoucherCron() {
  console.log('⏰ [Voucher Cron] Initializing automated voucher expiration scheduler...');

  // 1. Run check immediately on server startup
  expireDueVouchers().catch(err => {
    console.error('❌ [Voucher Cron] Initial startup check failed:', err.message);
  });

  try {
    // 2. Scheduled check every 10 minutes (safety fallback)
    cronJob = cron.schedule('*/10 * * * *', async () => {
      try {
        await expireDueVouchers();
      } catch (err) {
        console.error('❌ [Voucher Cron] 10-minute check error:', err.message);
      }
    });

    // 3. Exact midnight check at 00:01 AM in Australia/Perth time
    midnightJob = cron.schedule('1 0 * * *', async () => {
      console.log('🌙 [Voucher Cron] Midnight Australia/Perth trigger activated. Disabling expired vouchers...');
      try {
        await expireDueVouchers();
      } catch (err) {
        console.error('❌ [Voucher Cron] Midnight check error:', err.message);
      }
    }, {
      scheduled: true,
      timezone: 'Australia/Perth'
    });

    console.log('✅ [Voucher Cron] Scheduler running: Every 10m & daily at 00:01 AM (Australia/Perth)');
  } catch (err) {
    console.warn('⚠️ [Voucher Cron] node-cron setup failed, using native fallback interval:', err.message);
    // Native fallback: check every 15 minutes
    setInterval(async () => {
      try {
        await expireDueVouchers();
      } catch (e) {
        console.error('❌ [Voucher Cron] Fallback interval error:', e.message);
      }
    }, 15 * 60 * 1000);
  }
}

/**
 * Manually trigger expiration check
 */
export async function triggerManualVoucherCheck() {
  return await expireDueVouchers();
}
