import { Router } from 'express';
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
router.post('/services', createService);

// PUT /api/services/:id - Update service (price, duration, titles, etc.)
router.put('/services/:id', updateService);

// DELETE /api/services/:id - Delete service
router.delete('/services/:id', deleteService);

// POST /api/services/reset - Reset to default salon catalog
router.post('/services/reset', resetServices);

export default router;
