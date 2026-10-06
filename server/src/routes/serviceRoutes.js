import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  resetServices
} from '../controllers/serviceController.js';

const router = Router();

// GET /api/services - List services (optional ?active=true)
router.get('/services', listServices);

// GET /api/services/:id - Get single service
router.get('/services/:id', getService);

// POST /api/services - Create new service
router.post('/services', authenticateAdmin, createService);

// PUT /api/services/:id - Update service (price, duration, titles, etc.)
router.put('/services/:id', authenticateAdmin, updateService);

// DELETE /api/services/:id - Delete service
router.delete('/services/:id', authenticateAdmin, deleteService);

// POST /api/services/reset - Reset to default salon catalog
router.post('/services/reset', authenticateAdmin, resetServices);

export default router;
