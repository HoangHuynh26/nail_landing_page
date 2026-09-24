import {
  getActivePromotion as fetchActivePromotion,
  getAllPromotions,
  createPromotion as insertPromotion,
  updatePromotion as modifyPromotion,
  togglePromotionActive,
  deletePromotion as removePromotion
} from '../services/promotionService.js';

/**
 * Public endpoint: Retrieves active promotion for the landing page popup
 */
export async function getActivePromotion(req, res, next) {
  try {
    const promotion = await fetchActivePromotion();
    return res.status(200).json({
      success: true,
      hasActivePromotion: Boolean(promotion),
      promotion
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint: Retrieves all promotions
 */
export async function listPromotions(req, res, next) {
  try {
    const promotions = await getAllPromotions();
    return res.status(200).json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint: Creates a new promotion campaign with uploaded image
 */
export async function createPromotion(req, res, next) {
  try {
    const { title, subtitle, badge, voucher_code, discount_text, active, start_date, end_date } = req.body;

    if (!title || !voucher_code || !discount_text) {
      return res.status(400).json({
        success: false,
        message: 'Title, Voucher Code, and Discount Text are required'
      });
    }

    // Determine image URL: either uploaded file or custom URL
    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    if (!image_url) {
      // Default fallback banner
      image_url = '/images/hero-1.jpg';
    }

    const created = await insertPromotion({
      title,
      subtitle,
      badge: badge || 'HOLIDAY SPECIAL',
      image_url,
      voucher_code: voucher_code.trim().toUpperCase(),
      discount_text: discount_text.trim(),
      active: active === 'true' || active === true,
      start_date,
      end_date
    });

    return res.status(201).json({
      success: true,
      message: 'Promotion campaign created successfully',
      promotion: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint: Updates promotion
 */
export async function updatePromotion(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      updates.image_url = `/uploads/${req.file.filename}`;
    }

    if (updates.active !== undefined) {
      updates.active = updates.active === 'true' || updates.active === true;
    }

    const updated = await modifyPromotion(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion updated successfully',
      promotion: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint: Quick toggle active state
 */
export async function togglePromotion(req, res, next) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const updated = await togglePromotionActive(id, Boolean(active));

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Promotion active status set to ${Boolean(active)}`,
      promotion: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint: Deletes promotion
 */
export async function deletePromotion(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await removePromotion(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
