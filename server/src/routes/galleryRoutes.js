import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import {
  listGallery,
  getGalleryItem,
  createGallery,
  updateGallery,
  toggleGallery,
  deleteGallery,
  resetGallery
} from '../controllers/galleryController.js';
import { uploadGalleryImage, verifyImageSignature } from '../middleware/uploadMiddleware.js';

const router = Router();

// GET /api/gallery - List gallery showcase items (supports ?active=true&category=biab)
router.get('/gallery', listGallery);

// GET /api/gallery/:id - Get single gallery item
router.get('/gallery/:id', getGalleryItem);

// POST /api/gallery - Create new gallery item with optional image file upload
router.post('/gallery', authenticateAdmin, uploadGalleryImage.single('image'), verifyImageSignature, createGallery);

// PUT /api/gallery/:id - Update gallery item with optional new image file
router.put('/gallery/:id', authenticateAdmin, uploadGalleryImage.single('image'), verifyImageSignature, updateGallery);

// PATCH /api/gallery/:id/toggle - Toggle active status (publish/hide)
router.patch('/gallery/:id/toggle', authenticateAdmin, toggleGallery);

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/gallery/:id', authenticateAdmin, deleteGallery);

// POST /api/gallery/reset - Reset to default catalog
router.post('/gallery/reset', authenticateAdmin, resetGallery);

export default router;
