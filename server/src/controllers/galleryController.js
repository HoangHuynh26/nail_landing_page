import {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  toggleGalleryItemActive,
  deleteGalleryItem,
  resetGalleryToDefault
} from '../services/galleryService.js';

/**
 * Helper to parse comma-separated or JSON array strings
 */
function parseHighlights(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If comma-separated
    return input.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * GET /api/gallery
 * Public and Admin listing
 * Optional query parameters: ?active=true, ?category=biab
 */
export async function listGallery(req, res, next) {
  try {
    const activeOnly = req.query.active === 'true';
    const category = req.query.category || null;

    const items = await getAllGalleryItems({ activeOnly, category });

    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/gallery/:id
 * Retrieve single gallery item
 */
export async function getGalleryItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = await getGalleryItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    return res.status(200).json({
      success: true,
      item
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/gallery
 * Create new showcase with optional uploaded image file
 */
export async function createGallery(req, res, next) {
  try {
    let src = '';
    if (req.file) {
      src = `/uploads/${req.file.filename}`;
    } else if (req.body.src || req.body.image_url) {
      src = req.body.src || req.body.image_url;
    }

    if (!src) {
      return res.status(400).json({
        success: false,
        message: 'Showcase image (file upload or image URL) is required'
      });
    }

    const {
      id,
      categoryKey,
      title,
      title_en,
      category,
      categoryName,
      category_name,
      category_en,
      serviceId,
      serviceName,
      service_name,
      serviceName_en,
      shape,
      shape_en,
      duration,
      duration_en,
      price,
      technique,
      technique_en,
      description,
      description_en,
      highlights,
      highlights_en,
      active,
      sort_order
    } = req.body;

    const itemTitle = title || title_en || 'Artisan Nail Design';
    const itemCat = categoryName || category || category_name || category_en || 'Builder Gel - BIAB';
    const itemService = serviceName || service_name || serviceName_en || '';
    const itemShape = shape || shape_en || '';
    const itemDuration = duration || duration_en || '';
    const itemTech = technique || technique_en || '';
    const itemDesc = description || description_en || '';
    const itemHl = parseHighlights(highlights || highlights_en);

    const created = await createGalleryItem({
      id: id || undefined,
      src,
      categoryKey: categoryKey || 'biab',
      title: itemTitle,
      title_en: itemTitle,
      categoryName: itemCat,
      category_name: itemCat,
      category_en: itemCat,
      serviceId: serviceId || '',
      serviceName: itemService,
      serviceName_en: itemService,
      shape: itemShape,
      shape_en: itemShape,
      duration: itemDuration,
      duration_en: itemDuration,
      price: price || '$60',
      technique: itemTech,
      technique_en: itemTech,
      description: itemDesc,
      description_en: itemDesc,
      highlights: itemHl,
      highlights_en: itemHl,
      active: active !== undefined ? (String(active) === 'true' || active === true) : true,
      sort_order: sort_order ? parseInt(sort_order, 10) : 99
    });

    return res.status(201).json({
      success: true,
      message: 'Gallery showcase created successfully',
      item: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/gallery/:id
 * Update an existing gallery item
 */
export async function updateGallery(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await getGalleryItemById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    let src = existing.src;
    if (req.file) {
      src = `/uploads/${req.file.filename}`;
    } else if (req.body.src || req.body.image_url) {
      src = req.body.src || req.body.image_url;
    }

    const {
      categoryKey,
      title,
      title_en,
      category,
      categoryName,
      category_name,
      category_en,
      serviceId,
      serviceName,
      service_name,
      serviceName_en,
      shape,
      shape_en,
      duration,
      duration_en,
      price,
      technique,
      technique_en,
      description,
      description_en,
      highlights,
      highlights_en,
      active,
      sort_order
    } = req.body;

    const payload = {
      src,
      categoryKey: categoryKey !== undefined ? categoryKey : existing.categoryKey,
      title: (title || title_en) !== undefined ? (title || title_en) : existing.title,
      title_en: (title_en || title) !== undefined ? (title_en || title) : existing.title_en,
      categoryName: (categoryName || category || category_name || category_en) !== undefined ? (categoryName || category || category_name || category_en) : existing.categoryName,
      category_en: (category_en || categoryName || category) !== undefined ? (category_en || categoryName || category) : existing.category_en,
      serviceId: serviceId !== undefined ? serviceId : existing.serviceId,
      serviceName: (serviceName || service_name || serviceName_en) !== undefined ? (serviceName || service_name || serviceName_en) : existing.serviceName,
      serviceName_en: (serviceName_en || serviceName || service_name) !== undefined ? (serviceName_en || serviceName || service_name) : existing.serviceName_en,
      shape: (shape || shape_en) !== undefined ? (shape || shape_en) : existing.shape,
      shape_en: (shape_en || shape) !== undefined ? (shape_en || shape) : existing.shape_en,
      duration: (duration || duration_en) !== undefined ? (duration || duration_en) : existing.duration,
      duration_en: (duration_en || duration) !== undefined ? (duration_en || duration) : existing.duration_en,
      price: price !== undefined ? price : existing.price,
      technique: (technique || technique_en) !== undefined ? (technique || technique_en) : existing.technique,
      technique_en: (technique_en || technique) !== undefined ? (technique_en || technique) : existing.technique_en,
      description: (description || description_en) !== undefined ? (description || description_en) : existing.description,
      description_en: (description_en || description) !== undefined ? (description_en || description) : existing.description_en,
      active: active !== undefined ? (String(active) === 'true' || active === true) : existing.active,
      sort_order: sort_order !== undefined ? parseInt(sort_order, 10) : existing.sort_order
    };

    if (highlights !== undefined || highlights_en !== undefined) {
      const hl = parseHighlights(highlights !== undefined ? highlights : highlights_en);
      payload.highlights = hl;
      payload.highlights_en = hl;
    }

    const updated = await updateGalleryItem(id, payload);

    return res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      item: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/gallery/:id/toggle
 * Toggle active status
 */
export async function toggleGallery(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await toggleGalleryItemActive(id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Gallery item ${updated.active ? 'activated' : 'hidden'}`,
      item: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/gallery/:id
 * Delete a gallery showcase
 */
export async function deleteGallery(req, res, next) {
  try {
    const { id } = req.params;
    const success = await deleteGalleryItem(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found or could not be deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/gallery/reset
 * Reset gallery catalog back to initial default portfolio
 */
export async function resetGallery(req, res, next) {
  try {
    const items = await resetGalleryToDefault();
    return res.status(200).json({
      success: true,
      message: 'Gallery reset to initial default showcase catalog',
      count: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
}
