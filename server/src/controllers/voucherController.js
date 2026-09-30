import {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  toggleVoucherStatus,
  deleteVoucher,
  validateAndCalculateVoucher,
  expireDueVouchers,
  isVoucherExpired,
  getPerthTodayStr
} from '../services/voucherService.js';

/**
 * List all vouchers with stats, search & filter
 */
export async function listVouchers(req, res, next) {
  try {
    const { search, status } = req.query;
    let list = await getAllVouchers();
    const perthToday = getPerthTodayStr();

    // Enrich with computed status
    list = list.map(v => {
      const expired = isVoucherExpired(v.endDate, perthToday);
      let computedStatus = 'active';
      if (!v.isActive) {
        computedStatus = 'inactive';
      } else if (expired) {
        computedStatus = 'expired';
      } else if (v.startDate && perthToday < v.startDate) {
        computedStatus = 'upcoming';
      }

      return {
        ...v,
        isExpired: expired,
        computedStatus
      };
    });

    // Compute stats
    const total = list.length;
    const active = list.filter(v => v.computedStatus === 'active').length;
    const inactive = list.filter(v => v.computedStatus === 'inactive').length;
    const expired = list.filter(v => v.computedStatus === 'expired').length;
    const totalUsed = list.reduce((sum, v) => sum + (v.usedCount || 0), 0);

    // Apply Search Filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(v =>
        v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q)
      );
    }

    // Apply Status Filter
    if (status && status !== 'all') {
      if (status === 'active') {
        list = list.filter(v => v.computedStatus === 'active');
      } else if (status === 'inactive') {
        list = list.filter(v => v.computedStatus === 'inactive');
      } else if (status === 'expired') {
        list = list.filter(v => v.computedStatus === 'expired');
      }
    }

    return res.status(200).json({
      success: true,
      perthToday,
      stats: {
        total,
        active,
        inactive,
        expired,
        totalUsed
      },
      count: list.length,
      vouchers: list
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single voucher by ID
 */
export async function getVoucher(req, res, next) {
  try {
    const { id } = req.params;
    const voucher = await getVoucherById(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    return res.status(200).json({
      success: true,
      voucher: {
        ...voucher,
        isExpired: isVoucherExpired(voucher.endDate)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create new voucher (with duplicate check)
 */
export async function createVoucherHandler(req, res, next) {
  try {
    const {
      code,
      name,
      discountType,
      discountValue,
      minSpend,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Voucher code is required.'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Voucher name is required.'
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date is required.'
      });
    }

    const val = Number(discountValue);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than 0.'
      });
    }

    const voucher = await createVoucher({
      code,
      name,
      discountType: discountType || 'percentage',
      discountValue: val,
      minSpend: Number(minSpend) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      startDate: startDate || getPerthTodayStr(),
      endDate,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return res.status(201).json({
      success: true,
      message: `Voucher "${voucher.code}" created successfully!`,
      voucher
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_CODE') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
}

/**
 * Update existing voucher (with duplicate check)
 */
export async function updateVoucherHandler(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateVoucher(id, req.body);

    return res.status(200).json({
      success: true,
      message: `Voucher "${updated.code}" updated successfully!`,
      voucher: updated
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_CODE') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
}

/**
 * Toggle voucher active status
 */
export async function toggleVoucherHandler(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await toggleVoucherStatus(id);

    return res.status(200).json({
      success: true,
      message: `Voucher "${updated.code}" has been ${updated.isActive ? 'ENABLED' : 'DISABLED'} successfully!`,
      voucher: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete voucher
 */
export async function deleteVoucherHandler(req, res, next) {
  try {
    const { id } = req.params;
    await deleteVoucher(id);

    return res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully!'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Endpoint: Customer applies voucher in booking form
 * POST /api/vouchers/validate
 * Body: { code, servicePrice, bookingDate }
 */
export async function validateVoucherHandler(req, res, next) {
  try {
    const { code, servicePrice, bookingDate } = req.body;
    const result = await validateAndCalculateVoucher(code, servicePrice, bookingDate);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        ...result
      });
    }

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin manual trigger for expiration cron check
 * POST /api/vouchers/run-cron
 */
export async function runExpireCronHandler(req, res, next) {
  try {
    const result = await expireDueVouchers();
    return res.status(200).json({
      success: true,
      message: `Auto-scan completed. ${result.expiredCount} expired vouchers deactivated.`,
      result
    });
  } catch (err) {
    next(err);
  }
}
