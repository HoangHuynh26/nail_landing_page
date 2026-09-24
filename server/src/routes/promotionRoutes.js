import { Router } from 'express';
import {
  getActivePromotion,
  listPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion
} from '../controllers/promotionController.js';
import { uploadPromotionImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// GET /api/promotions/active - Public endpoint for visitor popup
router.get('/promotions/active', getActivePromotion);

// GET /api/promotions - List all promotions
router.get('/promotions', listPromotions);

// POST /api/promotions - Create new promotion with banner upload
router.post('/promotions', uploadPromotionImage.single('image'), createPromotion);

// PUT /api/promotions/:id - Update promotion with optional new banner
router.put('/promotions/:id', uploadPromotionImage.single('image'), updatePromotion);

// PATCH /api/promotions/:id/toggle - Toggle active status
router.patch('/promotions/:id/toggle', togglePromotion);

// DELETE /api/promotions/:id - Delete promotion
router.delete('/promotions/:id', deletePromotion);

export default router;
