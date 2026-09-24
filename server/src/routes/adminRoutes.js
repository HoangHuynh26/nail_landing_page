import { Router } from 'express';
import {
  getSystemStatus,
  verifyAdminPin,
  updateDatabaseConnection
} from '../controllers/adminController.js';

const router = Router();

// GET /api/admin/status - DB & System Status
router.get('/admin/status', getSystemStatus);

// POST /api/admin/login - Verify PIN
router.post('/admin/login', verifyAdminPin);

// POST /api/admin/db-connect - Connect or test Neon URL dynamically
router.post('/admin/db-connect', updateDatabaseConnection);

export default router;
