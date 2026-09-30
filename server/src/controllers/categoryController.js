import {
  getAllCategories,
  getCategoryById,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService
} from '../services/categoryService.js';

export async function listCategories(req, res, next) {
  try {
    const activeOnly = req.query.active === 'true';
    const categories = await getAllCategories({ activeOnly });
    res.status(200).json({
      success: true,
      categories,
      count: categories.length
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, label, name_en, id, description, description_en, sort_order } = req.body;
    const catName = name || name_en || label;
    if (!catName || !catName.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const created = await createCategoryService({
      id,
      name: catName.trim(),
      name_en: catName.trim(),
      description: (description || description_en || '').trim(),
      description_en: (description_en || description || '').trim(),
      sort_order
    });

    res.status(201).json({
      success: true,
      category: created,
      message: 'Category created successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateCategoryService(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({
      success: true,
      category: updated,
      message: 'Category updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await deleteCategoryService(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      message: `Category "${result.deletedCategory.name_en || id}" and ${result.deletedServicesCount} associated service(s) were permanently deleted. Existing bookings remain completely safe.`,
      deletedCategory: result.deletedCategory,
      deletedServicesCount: result.deletedServicesCount
    });
  } catch (err) {
    next(err);
  }
}
