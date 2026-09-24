import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';
import { defaultPromotions } from '../data/defaultPromotions.js';

/**
 * Retrieves the currently active promotion for visitor popup display
 */
export async function getActivePromotion() {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM promotions WHERE active = true ORDER BY id DESC LIMIT 1'
      );
      if (res.rows.length > 0) return mapPostgresPromotion(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[DB] Failed to get active promotion from Neon, using fallback:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  const promos = store.promotions || defaultPromotions;
  const activePromo = promos.find(p => p.active === true);
  return activePromo || null;
}

/**
 * Retrieves all promotions for Admin management
 */
export async function getAllPromotions() {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('SELECT * FROM promotions ORDER BY id DESC');
      return res.rows.map(mapPostgresPromotion);
    } catch (err) {
      console.error('[DB] Failed to get all promotions from Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  return store.promotions || defaultPromotions;
}

/**
 * Creates a new promotion campaign
 */
export async function createPromotion(promoData) {
  const now = new Date().toISOString();

  // If this promo is set to active, optionally deactivate other promos if single-promo mode
  if (promoData.active) {
    await deactivateAllPromotions();
  }

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO promotions (
          title, subtitle, badge, image_url, voucher_code, discount_text, active, start_date, end_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        promoData.title || 'Special Celebration',
        promoData.subtitle || '',
        promoData.badge || '',
        promoData.image_url,
        (promoData.voucher_code || '').toUpperCase(),
        promoData.discount_text || '',
        promoData.active ?? true,
        promoData.start_date || '',
        promoData.end_date || '',
        now
      ];
      const res = await pool.query(query, values);
      return mapPostgresPromotion(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to create promotion in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.promotions = store.promotions || [];
  const newId = store.promotions.length > 0 ? Math.max(...store.promotions.map(p => p.id || 0)) + 1 : 1;
  const newPromo = {
    id: newId,
    title: promoData.title || 'Special Celebration',
    subtitle: promoData.subtitle || '',
    badge: promoData.badge || '',
    image_url: promoData.image_url,
    voucher_code: (promoData.voucher_code || '').toUpperCase(),
    discount_text: promoData.discount_text || '',
    active: promoData.active ?? true,
    start_date: promoData.start_date || '',
    end_date: promoData.end_date || '',
    created_at: now
  };
  store.promotions.unshift(newPromo);
  await writeFallbackStore(store);
  return newPromo;
}

/**
 * Updates an existing promotion
 */
export async function updatePromotion(id, updates) {
  const promoId = parseInt(id, 10);

  if (updates.active) {
    await deactivateAllPromotions(promoId);
  }

  if (!dbState.usingFallback && pool) {
    try {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(updates.title); }
      if (updates.subtitle !== undefined) { fields.push(`subtitle = $${idx++}`); values.push(updates.subtitle); }
      if (updates.badge !== undefined) { fields.push(`badge = $${idx++}`); values.push(updates.badge); }
      if (updates.image_url !== undefined) { fields.push(`image_url = $${idx++}`); values.push(updates.image_url); }
      if (updates.voucher_code !== undefined) { fields.push(`voucher_code = $${idx++}`); values.push(updates.voucher_code.toUpperCase()); }
      if (updates.discount_text !== undefined) { fields.push(`discount_text = $${idx++}`); values.push(updates.discount_text); }
      if (updates.active !== undefined) { fields.push(`active = $${idx++}`); values.push(Boolean(updates.active)); }
      if (updates.start_date !== undefined) { fields.push(`start_date = $${idx++}`); values.push(updates.start_date); }
      if (updates.end_date !== undefined) { fields.push(`end_date = $${idx++}`); values.push(updates.end_date); }

      values.push(promoId);
      const query = `UPDATE promotions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await pool.query(query, values);
      if (res.rows.length > 0) return mapPostgresPromotion(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to update promotion in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  const index = (store.promotions || []).findIndex(p => p.id === promoId);
  if (index !== -1) {
    store.promotions[index] = {
      ...store.promotions[index],
      ...updates,
      voucher_code: updates.voucher_code ? updates.voucher_code.toUpperCase() : store.promotions[index].voucher_code
    };
    await writeFallbackStore(store);
    return store.promotions[index];
  }
  return null;
}

/**
 * Toggles a promotion's active state
 */
export async function togglePromotionActive(id, active) {
  return updatePromotion(id, { active });
}

/**
 * Deletes a promotion
 */
export async function deletePromotion(id) {
  const promoId = parseInt(id, 10);
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('DELETE FROM promotions WHERE id = $1 RETURNING *', [promoId]);
      return res.rowCount > 0;
    } catch (err) {
      console.error('[DB] Failed to delete promotion in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  const len = (store.promotions || []).length;
  store.promotions = (store.promotions || []).filter(p => p.id !== promoId);
  if (store.promotions.length !== len) {
    await writeFallbackStore(store);
    return true;
  }
  return false;
}

/**
 * Helper to deactivate all promotions except optionally one
 */
async function deactivateAllPromotions(exceptId = null) {
  if (!dbState.usingFallback && pool) {
    try {
      if (exceptId) {
        await pool.query('UPDATE promotions SET active = false WHERE id != $1', [exceptId]);
      } else {
        await pool.query('UPDATE promotions SET active = false');
      }
    } catch (err) {
      console.warn('[DB] Could not bulk deactivate in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  if (store.promotions) {
    store.promotions.forEach(p => {
      if (!exceptId || p.id !== exceptId) p.active = false;
    });
    await writeFallbackStore(store);
  }
}

function mapPostgresPromotion(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    image_url: row.image_url,
    voucher_code: row.voucher_code,
    discount_text: row.discount_text,
    active: Boolean(row.active),
    start_date: row.start_date,
    end_date: row.end_date,
    created_at: row.created_at
  };
}
