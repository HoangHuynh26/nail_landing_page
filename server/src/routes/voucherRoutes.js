import { Router } from 'express';
import {
  listVouchers,
  getVoucher,
  createVoucherHandler,
  updateVoucherHandler,
  toggleVoucherHandler,
  deleteVoucherHandler,
  validateVoucherHandler,
  runExpireCronHandler
} from '../controllers/voucherController.js';

const router = Router();

// Public route: Customer applies/validates voucher
router.post('/vouchers/validate', validateVoucherHandler);

// Admin routes: Voucher management
router.get('/vouchers', listVouchers);
router.get('/vouchers/:id', getVoucher);
router.post('/vouchers', createVoucherHandler);
router.put('/vouchers/:id', updateVoucherHandler);
router.patch('/vouchers/:id/toggle', toggleVoucherHandler);
router.delete('/vouchers/:id', deleteVoucherHandler);
router.post('/vouchers/run-cron', runExpireCronHandler);

export default router;
