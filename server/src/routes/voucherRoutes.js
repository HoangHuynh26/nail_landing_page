import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
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
router.get('/vouchers', authenticateAdmin, listVouchers);
router.get('/vouchers/:id', authenticateAdmin, getVoucher);
router.post('/vouchers', authenticateAdmin, createVoucherHandler);
router.put('/vouchers/:id', authenticateAdmin, updateVoucherHandler);
router.patch('/vouchers/:id/toggle', authenticateAdmin, toggleVoucherHandler);
router.delete('/vouchers/:id', authenticateAdmin, deleteVoucherHandler);
router.post('/vouchers/run-cron', authenticateAdmin, runExpireCronHandler);

export default router;
