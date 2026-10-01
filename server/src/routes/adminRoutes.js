import { Router } from 'express';
import {
  getSystemStatus,
  verifyAdminPin,
  updateDatabaseConnection,
  changeAdminPassword,
  getAdminsList,
  verifyAdminSession
} from '../controllers/adminController.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/admin/status - DB & System Status
router.get('/admin/status', getSystemStatus);

// POST /api/admin/login - Verify credentials with DB & bcrypt (rate limited)
router.post('/admin/login', adminLoginLimiter, verifyAdminPin);

// GET /api/admin/verify - Verify active JWT session token
router.get('/admin/verify', authenticateAdmin, verifyAdminSession);

// GET /api/admin/accounts - Get list of admin accounts (protected)
router.get('/admin/accounts', authenticateAdmin, getAdminsList);

// PUT /api/admin/change-password - Change admin password (protected)
router.put('/admin/change-password', authenticateAdmin, changeAdminPassword);

// POST /api/admin/db-connect - Connect or test Neon URL dynamically (protected)
router.post('/admin/db-connect', authenticateAdmin, updateDatabaseConnection);

export default router;
