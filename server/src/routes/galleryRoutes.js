import { Router } from 'express';
import {
  listGallery,
  getGalleryItem,
  createGallery,
  updateGallery,
  toggleGallery,
  deleteGallery,
  resetGallery
} from '../controllers/galleryController.js';
import { uploadGalleryImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// GET /api/gallery - List gallery showcase items (supports ?active=true&category=biab)
router.get('/gallery', listGallery);

// GET /api/gallery/:id - Get single gallery item
router.get('/gallery/:id', getGalleryItem);

// POST /api/gallery - Create new gallery item with optional image file upload
router.post('/gallery', uploadGalleryImage.single('image'), createGallery);

// PUT /api/gallery/:id - Update gallery item with optional new image file
router.put('/gallery/:id', uploadGalleryImage.single('image'), updateGallery);

// PATCH /api/gallery/:id/toggle - Toggle active status (publish/hide)
router.patch('/gallery/:id/toggle', toggleGallery);

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/gallery/:id', deleteGallery);

// POST /api/gallery/reset - Reset to default catalog
router.post('/gallery/reset', resetGallery);

export default router;
