import { executeQuery as query, readFallbackStore, writeFallbackStore } from '../db/db.js';

/**
 * Returns current date in Western Australia (Perth / AWST: UTC+8) in 'YYYY-MM-DD' format
 */
export function getPerthTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Perth' });
}

/**
 * Checks if a voucher is expired based on end_date and Perth timezone.
 * Rule: If end_date is '2026-09-29', it is active throughout 2026-09-29.
 * It only expires when Perth date reaches '2026-09-30' (00:00:00 midnight).
 */
export function isVoucherExpired(endDate, currentPerthDate = null) {
  if (!endDate) return false;
  const today = currentPerthDate || getPerthTodayStr();
  return today > endDate;
}

/**
 * Normalizes DB row to camelCase JS object
 */
function mapVoucherRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: (row.code || '').trim().toUpperCase(),
    name: row.name,
    discountType: row.discount_type || row.discountType || 'percentage',
    discountValue: Number(row.discount_value ?? row.discountValue ?? 0),
    minSpend: Number(row.min_spend ?? row.minSpend ?? 0),
    maxDiscount: row.max_discount != null ? Number(row.max_discount) : (row.maxDiscount != null ? Number(row.maxDiscount) : null),
    usageLimit: row.usage_limit != null ? Number(row.usage_limit) : (row.usageLimit != null ? Number(row.usageLimit) : null),
    usedCount: Number(row.used_count ?? row.usedCount ?? 0),
    startDate: row.start_date || row.startDate || '',
    endDate: row.end_date || row.endDate || '',
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

/**
 * Get all vouchers
 */
export async function getAllVouchers() {
  try {
    const res = await query('SELECT * FROM vouchers ORDER BY id DESC');
    if (res && res.rows) {
      return res.rows.map(mapVoucherRow);
    }
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL error, fallback to JSON:', err.message);
  }

  const store = await readFallbackStore();
  const vouchers = store.vouchers || [];
  return vouchers.map(mapVoucherRow);
}

/**
 * Find voucher by ID
 */
export async function getVoucherById(id) {
  const numericId = Number(id);
  try {
    const res = await query('SELECT * FROM vouchers WHERE id = $1', [numericId]);
    if (res && res.rows && res.rows[0]) {
      return mapVoucherRow(res.rows[0]);
    }
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL error, fallback to JSON:', err.message);
  }

  const store = await readFallbackStore();
  const found = (store.vouchers || []).find(v => Number(v.id) === numericId);
  return found ? mapVoucherRow(found) : null;
}

/**
 * Find voucher by CODE (case-insensitive)
 */
export async function getVoucherByCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  try {
    const res = await query('SELECT * FROM vouchers WHERE UPPER(TRIM(code)) = $1', [cleanCode]);
    if (res && res.rows && res.rows[0]) {
      return mapVoucherRow(res.rows[0]);
    }
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL error, fallback to JSON:', err.message);
  }

  const store = await readFallbackStore();
  const found = (store.vouchers || []).find(v => (v.code || '').trim().toUpperCase() === cleanCode);
  return found ? mapVoucherRow(found) : null;
}

/**
 * Check if voucher code already exists in DB (for duplicate checking)
 */
export async function checkDuplicateCode(code, excludeId = null) {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();

  try {
    let sql = 'SELECT id FROM vouchers WHERE UPPER(TRIM(code)) = $1';
    const params = [cleanCode];
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(Number(excludeId));
    }
    const res = await query(sql, params);
    return res && res.rows && res.rows.length > 0;
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL error during duplicate check:', err.message);
  }

  const store = await readFallbackStore();
  const found = (store.vouchers || []).find(v => {
    const isSameCode = (v.code || '').trim().toUpperCase() === cleanCode;
    const isDifferentId = excludeId ? Number(v.id) !== Number(excludeId) : true;
    return isSameCode && isDifferentId;
  });

  return Boolean(found);
}

/**
 * Create a new voucher
 */
export async function createVoucher(data) {
  const cleanCode = (data.code || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Voucher code is required');
  }
  if (!data.name || !data.name.trim()) {
    throw new Error('Voucher name is required');
  }
  if (!data.endDate) {
    throw new Error('Voucher expiration date (end_date) is required');
  }

  // 1. Check duplicate code in database
  const isDuplicate = await checkDuplicateCode(cleanCode);
  if (isDuplicate) {
    const error = new Error(`Voucher code "${cleanCode}" already exists. Please choose a different code.`);
    error.code = 'DUPLICATE_CODE';
    throw error;
  }

  const discountType = data.discountType === 'fixed' ? 'fixed' : 'percentage';
  const discountValue = Number(data.discountValue) || 0;
  const minSpend = Number(data.minSpend) || 0;
  const maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : null;
  const usageLimit = data.usageLimit ? Number(data.usageLimit) : null;
  const usedCount = 0;
  const startDate = data.startDate || getPerthTodayStr();
  const endDate = data.endDate;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
  const nowIso = new Date().toISOString();

  try {
    const sql = `
      INSERT INTO vouchers (
        code, name, discount_type, discount_value, min_spend, max_discount,
        usage_limit, used_count, start_date, end_date, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const params = [
      cleanCode, data.name.trim(), discountType, discountValue, minSpend, maxDiscount,
      usageLimit, usedCount, startDate, endDate, isActive, nowIso, nowIso
    ];
    const res = await query(sql, params);
    if (res && res.rows && res.rows[0]) {
      return mapVoucherRow(res.rows[0]);
    }
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error(`Voucher code "${cleanCode}" already exists.`);
      error.code = 'DUPLICATE_CODE';
      throw error;
    }
    console.warn('[VoucherService] PostgreSQL insert error, fallback to JSON:', err.message);
  }

  // Fallback Store
  const store = await readFallbackStore();
  const list = store.vouchers || [];
  const nextId = list.reduce((max, v) => Math.max(max, Number(v.id || 0)), 0) + 1;
  const newVoucher = {
    id: nextId,
    code: cleanCode,
    name: data.name.trim(),
    discountType,
    discountValue,
    minSpend,
    maxDiscount,
    usageLimit,
    usedCount,
    startDate,
    endDate,
    isActive,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  list.unshift(newVoucher);
  store.vouchers = list;
  await writeFallbackStore(store);
  return mapVoucherRow(newVoucher);
}

/**
 * Update an existing voucher
 */
export async function updateVoucher(id, data) {
  const numericId = Number(id);
  const cleanCode = data.code ? data.code.trim().toUpperCase() : undefined;

  // Check duplicate if code is updated
  if (cleanCode) {
    const isDuplicate = await checkDuplicateCode(cleanCode, numericId);
    if (isDuplicate) {
      const error = new Error(`Voucher code "${cleanCode}" already exists.`);
      error.code = 'DUPLICATE_CODE';
      throw error;
    }
  }

  const nowIso = new Date().toISOString();

  try {
    const current = await getVoucherById(numericId);
    if (!current) throw new Error('Voucher not found');

    const updatedObj = {
      code: cleanCode !== undefined ? cleanCode : current.code,
      name: data.name !== undefined ? data.name.trim() : current.name,
      discountType: data.discountType !== undefined ? data.discountType : current.discountType,
      discountValue: data.discountValue !== undefined ? Number(data.discountValue) : current.discountValue,
      minSpend: data.minSpend !== undefined ? Number(data.minSpend) : current.minSpend,
      maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? Number(data.maxDiscount) : null) : current.maxDiscount,
      usageLimit: data.usageLimit !== undefined ? (data.usageLimit ? Number(data.usageLimit) : null) : current.usageLimit,
      usedCount: data.usedCount !== undefined ? Number(data.usedCount) : current.usedCount,
      startDate: data.startDate !== undefined ? data.startDate : current.startDate,
      endDate: data.endDate !== undefined ? data.endDate : current.endDate,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : current.isActive
    };

    const sql = `
      UPDATE vouchers SET
        code = $1, name = $2, discount_type = $3, discount_value = $4,
        min_spend = $5, max_discount = $6, usage_limit = $7, used_count = $8,
        start_date = $9, end_date = $10, is_active = $11, updated_at = $12
      WHERE id = $13
      RETURNING *
    `;
    const params = [
      updatedObj.code, updatedObj.name, updatedObj.discountType, updatedObj.discountValue,
      updatedObj.minSpend, updatedObj.maxDiscount, updatedObj.usageLimit, updatedObj.usedCount,
      updatedObj.startDate, updatedObj.endDate, updatedObj.isActive, nowIso, numericId
    ];
    const res = await query(sql, params);
    if (res && res.rows && res.rows[0]) {
      return mapVoucherRow(res.rows[0]);
    }
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL update error, fallback to JSON:', err.message);
  }

  // Fallback Store
  const store = await readFallbackStore();
  const list = store.vouchers || [];
  const idx = list.findIndex(v => Number(v.id) === numericId);
  if (idx === -1) throw new Error('Voucher not found');

  const prev = list[idx];
  const updated = {
    ...prev,
    ...data,
    id: numericId,
    code: cleanCode !== undefined ? cleanCode : prev.code,
    name: data.name !== undefined ? data.name.trim() : prev.name,
    discountValue: data.discountValue !== undefined ? Number(data.discountValue) : prev.discountValue,
    minSpend: data.minSpend !== undefined ? Number(data.minSpend) : prev.minSpend,
    maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? Number(data.maxDiscount) : null) : prev.maxDiscount,
    usageLimit: data.usageLimit !== undefined ? (data.usageLimit ? Number(data.usageLimit) : null) : prev.usageLimit,
    usedCount: data.usedCount !== undefined ? Number(data.usedCount) : prev.usedCount,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : prev.isActive,
    updatedAt: nowIso
  };

  list[idx] = updated;
  store.vouchers = list;
  await writeFallbackStore(store);
  return mapVoucherRow(updated);
}

/**
 * Toggle voucher active status
 */
export async function toggleVoucherStatus(id) {
  const current = await getVoucherById(id);
  if (!current) throw new Error('Voucher not found');
  return updateVoucher(id, { isActive: !current.isActive });
}

/**
 * Delete a voucher
 */
export async function deleteVoucher(id) {
  const numericId = Number(id);
  try {
    const res = await query('DELETE FROM vouchers WHERE id = $1 RETURNING id', [numericId]);
    if (res && res.rows && res.rows.length > 0) {
      return { success: true, id: numericId };
    }
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL delete error, fallback to JSON:', err.message);
  }

  const store = await readFallbackStore();
  const list = store.vouchers || [];
  store.vouchers = list.filter(v => Number(v.id) !== numericId);
  await writeFallbackStore(store);
  return { success: true, id: numericId };
}

/**
 * Validates a voucher and calculates discount for given service price
 */
export async function validateAndCalculateVoucher(code, servicePrice = 0, bookingDate = null) {
  if (!code || !code.trim()) {
    return {
      valid: false,
      error: 'EMPTY_CODE',
      message: 'Please enter a voucher code.'
    };
  }

  const cleanCode = code.trim().toUpperCase();
  const voucher = await getVoucherByCode(cleanCode);

  if (!voucher) {
    return {
      valid: false,
      error: 'NOT_FOUND',
      message: `Voucher code "${cleanCode}" does not exist or has been removed.`
    };
  }

  if (!voucher.isActive) {
    return {
      valid: false,
      error: 'INACTIVE',
      message: `Voucher code "${cleanCode}" is currently inactive.`
    };
  }

  const perthToday = getPerthTodayStr();
  const checkDate = bookingDate || perthToday;

  // Check start_date
  if (voucher.startDate && checkDate < voucher.startDate) {
    return {
      valid: false,
      error: 'NOT_STARTED',
      message: `Voucher code "${cleanCode}" is valid starting from ${voucher.startDate}.`
    };
  }

  // Check end_date: rule is that the whole day of end_date is valid,
  // it only expires when checkDate is strictly greater than end_date (next day midnight).
  if (voucher.endDate && isVoucherExpired(voucher.endDate, checkDate)) {
    return {
      valid: false,
      error: 'EXPIRED',
      message: `Voucher code "${cleanCode}" expired on ${voucher.endDate}.`
    };
  }

  // Check usage limit
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    return {
      valid: false,
      error: 'USAGE_LIMIT_REACHED',
      message: `Voucher code "${cleanCode}" has reached its maximum usage limit.`
    };
  }

  const numericPrice = Number(servicePrice) || 0;

  // Check minimum spend
  if (voucher.minSpend > 0 && numericPrice > 0 && numericPrice < voucher.minSpend) {
    return {
      valid: false,
      error: 'MIN_SPEND_NOT_MET',
      message: `This voucher requires a minimum spend of ${voucher.minSpend} AUD (Current: ${numericPrice} AUD).`
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (voucher.discountType === 'percentage') {
    discountAmount = (numericPrice * voucher.discountValue) / 100;
    if (voucher.maxDiscount != null && voucher.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    }
  } else {
    // Fixed amount
    discountAmount = Math.min(voucher.discountValue, numericPrice > 0 ? numericPrice : voucher.discountValue);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalPrice = Math.max(0, Math.round((numericPrice - discountAmount) * 100) / 100);

  return {
    valid: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minSpend: voucher.minSpend,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      usedCount: voucher.usedCount,
      startDate: voucher.startDate,
      endDate: voucher.endDate
    },
    discountAmount,
    originalPrice: numericPrice,
    finalPrice,
    message: `Successfully applied voucher "${voucher.code}": ${voucher.name} (-$${discountAmount} AUD)`
  };
}

/**
 * Record voucher usage (called when booking is placed with voucher)
 */
export async function recordVoucherUsage(code) {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();

  try {
    const res = await query(
      `UPDATE vouchers 
       SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP 
       WHERE UPPER(TRIM(code)) = $1 
         AND (usage_limit IS NULL OR used_count < usage_limit)
         AND is_active = true
       RETURNING *`,
      [cleanCode]
    );
    if (res && res.rows) {
      if (res.rows.length === 0) {
        throw new Error('Voucher limit reached or inactive');
      }
      console.log(`[Voucher] Incremented usage for "${cleanCode}". New count: ${res.rows[0].used_count}`);
      return true;
    }
  } catch (err) {
    if (err.message === 'Voucher limit reached or inactive') throw err;
    console.warn('[VoucherService] PostgreSQL recordVoucherUsage error, fallback to JSON:', err.message);
  }

  const store = await readFallbackStore();
  const list = store.vouchers || [];
  const found = list.find(v => (v.code || '').trim().toUpperCase() === cleanCode);
  if (found) {
    if (found.isActive === false || (found.usageLimit != null && found.usedCount >= found.usageLimit)) {
      throw new Error('Voucher limit reached or inactive');
    }
    found.usedCount = (found.usedCount || 0) + 1;
    found.updatedAt = new Date().toISOString();
    await writeFallbackStore(store);
    console.log(`[Voucher] Incremented usage for "${cleanCode}". New count: ${found.usedCount}`);
    return true;
  }
  return false;
}

/**
 * Revert voucher usage (called when booking fails to save)
 */
export async function revertVoucherUsage(code) {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();

  try {
    const res = await query(
      `UPDATE vouchers 
       SET used_count = GREATEST(0, used_count - 1), updated_at = CURRENT_TIMESTAMP 
       WHERE UPPER(TRIM(code)) = $1 
       RETURNING *`,
      [cleanCode]
    );
    if (res && res.rows && res.rows[0]) {
      console.log(`[Voucher] Reverted usage for "${cleanCode}". New count: ${res.rows[0].used_count}`);
      return true;
    }
  } catch (err) {
    console.warn('[VoucherService] PostgreSQL revertVoucherUsage error, fallback to JSON:', err.message);
  }

  const store = await readFallbackStore();
  const list = store.vouchers || [];
  const found = list.find(v => (v.code || '').trim().toUpperCase() === cleanCode);
  if (found) {
    found.usedCount = Math.max(0, (found.usedCount || 0) - 1);
    found.updatedAt = new Date().toISOString();
    await writeFallbackStore(store);
    console.log(`[Voucher] Reverted usage for "${cleanCode}". New count: ${found.usedCount}`);
    return true;
  }
  return false;
}

/**
 * Cron Job worker:
 * Checks all active vouchers where end_date < Perth today date,
 * and automatically sets is_active = false.
 * Example: if end_date = 2026-09-29, on 2026-09-29 it is untouched.
 * When Perth clock hits 2026-09-30 00:00:00 (midnight), it is deactivated.
 */
export async function expireDueVouchers() {
  const perthToday = getPerthTodayStr();
  console.log(`[Voucher Cron] Checking expired vouchers against Perth date: ${perthToday}`);

  let expiredCodes = [];

  try {
    const res = await query(
      `UPDATE vouchers 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE is_active = true 
         AND end_date IS NOT NULL 
         AND end_date != '' 
         AND end_date < $1 
       RETURNING code, end_date`,
      [perthToday]
    );

    if (res && res.rows) {
      expiredCodes = res.rows.map(r => `${r.code} (expired on ${r.end_date})`);
    }
  } catch (err) {
    console.warn('[Voucher Cron] PostgreSQL error, checking fallback store:', err.message);
  }

  // Also check fallback store
  try {
    const store = await readFallbackStore();
    let storeChanged = false;
    (store.vouchers || []).forEach(v => {
      if (v.isActive && v.endDate && perthToday > v.endDate) {
        v.isActive = false;
        v.updatedAt = new Date().toISOString();
        storeChanged = true;
        if (!expiredCodes.some(c => c.startsWith(v.code))) {
          expiredCodes.push(`${v.code} (expired on ${v.endDate})`);
        }
      }
    });

    if (storeChanged) {
      await writeFallbackStore(store);
    }
  } catch (err) {
    console.error('[Voucher Cron] Fallback store expiration error:', err.message);
  }

  if (expiredCodes.length > 0) {
    console.log(`[Voucher Cron] ⏰ Auto-deactivated ${expiredCodes.length} expired vouchers:`, expiredCodes);
  } else {
    console.log(`[Voucher Cron] No expired vouchers found at this time.`);
  }

  return {
    checkedDate: perthToday,
    expiredCount: expiredCodes.length,
    expiredCodes
  };
}
