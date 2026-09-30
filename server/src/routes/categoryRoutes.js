import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = Router();

// GET /api/categories - List all categories
router.get('/categories', listCategories);

// GET /api/categories/:id - Get single category
router.get('/categories/:id', getCategory);

// POST /api/categories - Create new category
router.post('/categories', createCategory);

// PUT /api/categories/:id - Update category
router.put('/categories/:id', updateCategory);

// DELETE /api/categories/:id - Delete category (cascades to delete all services in that category)
router.delete('/categories/:id', deleteCategory);

export default router;
