import {
  getAllServices,
  getServiceById,
  createService as insertService,
  updateService as modifyService,
  deleteService as removeService,
  resetServicesToDefault
} from '../services/serviceService.js';

/**
 * Lists all services
 * Public query ?active=true returns active only
 */
export async function listServices(req, res, next) {
  try {
    const activeOnly = req.query.active === 'true';
    const services = await getAllServices({ activeOnly });

    return res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets a service by ID
 */
export async function getService(req, res, next) {
  try {
    const { id } = req.params;
    const service = await getServiceById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      service
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new service
 */
export async function createService(req, res, next) {
  try {
    const { name_vi, name_en, category, price, duration, description_vi, description_en, price_prefix, featured, active, sort_order } = req.body;

    if (!name_vi && !name_en) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required'
      });
    }

    if (price === undefined || isNaN(parseFloat(price))) {
      return res.status(400).json({
        success: false,
        message: 'Valid price (AUD) is required'
      });
    }

    const created = await insertService({
      name_vi,
      name_en,
      category: category || 'extra',
      price: parseFloat(price),
      duration: duration ? parseInt(duration, 10) : 45,
      description_vi,
      description_en,
      price_prefix,
      featured: Boolean(featured),
      active: active !== undefined ? Boolean(active) : true,
      sort_order: sort_order ? parseInt(sort_order, 10) : 99
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing service (price, duration, titles, active flag)
 */
export async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await modifyService(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a service
 */
export async function deleteService(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await removeService(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Resets service catalog to default prices & list
 */
export async function resetServices(req, res, next) {
  try {
    const services = await resetServicesToDefault();
    return res.status(200).json({
      success: true,
      message: 'Service catalog restored to default settings',
      services
    });
  } catch (err) {
    next(err);
  }
}
