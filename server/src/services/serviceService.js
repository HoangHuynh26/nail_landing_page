import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';
import { defaultServices } from '../data/defaultServices.js';

/**
 * Retrieves all services, optionally filtered by active status
 */
export async function getAllServices({ activeOnly = false } = {}) {
  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM services';
      const params = [];
      if (activeOnly) {
        query += ' WHERE active = true';
      }
      query += ' ORDER BY sort_order ASC, id ASC';

      const res = await pool.query(query, params);
      return res.rows.map(mapPostgresService);
    } catch (err) {
      console.error('[DB] Failed to fetch services from Neon, using fallback:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  let services = store.services || defaultServices;
  if (activeOnly) {
    services = services.filter(s => s.active !== false);
  }
  return services.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

/**
 * Gets a single service by ID
 */
export async function getServiceById(id) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
      if (res.rows.length > 0) return mapPostgresService(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[DB] Failed to fetch service by id from Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  return (store.services || []).find(s => s.id === id) || null;
}

/**
 * Creates a new service
 */
export async function createService(serviceData) {
  const id = serviceData.id || `custom-${Date.now()}`;
  const now = new Date().toISOString();

  const newService = {
    id,
    category: serviceData.category || 'extra',
    name_vi: serviceData.name_vi || serviceData.name_en || 'Dịch vụ mới',
    name_en: serviceData.name_en || serviceData.name_vi || 'New Service',
    description_vi: serviceData.description_vi || '',
    description_en: serviceData.description_en || '',
    duration: parseInt(serviceData.duration, 10) || 45,
    price: parseFloat(serviceData.price) || 0,
    price_prefix: serviceData.price_prefix || '',
    featured: Boolean(serviceData.featured),
    active: serviceData.active !== undefined ? Boolean(serviceData.active) : true,
    sort_order: parseInt(serviceData.sort_order, 10) || 99,
    created_at: now,
    updated_at: now
  };

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO services (
          id, category, name_vi, name_en, description_vi, description_en,
          duration, price, price_prefix, featured, active, sort_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
      `;
      const values = [
        newService.id, newService.category, newService.name_vi, newService.name_en,
        newService.description_vi, newService.description_en, newService.duration,
        newService.price, newService.price_prefix, newService.featured,
        newService.active, newService.sort_order, newService.created_at, newService.updated_at
      ];
      const res = await pool.query(query, values);
      return mapPostgresService(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to create service in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.services = store.services || [];
  store.services.push(newService);
  await writeFallbackStore(store);
  return newService;
}

/**
 * Updates a service (especially price, duration, titles, active flag)
 */
export async function updateService(id, updates) {
  const now = new Date().toISOString();

  if (!dbState.usingFallback && pool) {
    try {
      // Build dynamic update query
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.category !== undefined) { fields.push(`category = $${idx++}`); values.push(updates.category); }
      if (updates.name_vi !== undefined) { fields.push(`name_vi = $${idx++}`); values.push(updates.name_vi); }
      if (updates.name_en !== undefined) { fields.push(`name_en = $${idx++}`); values.push(updates.name_en); }
      if (updates.description_vi !== undefined) { fields.push(`description_vi = $${idx++}`); values.push(updates.description_vi); }
      if (updates.description_en !== undefined) { fields.push(`description_en = $${idx++}`); values.push(updates.description_en); }
      if (updates.duration !== undefined) { fields.push(`duration = $${idx++}`); values.push(parseInt(updates.duration, 10)); }
      if (updates.price !== undefined) { fields.push(`price = $${idx++}`); values.push(parseFloat(updates.price)); }
      if (updates.price_prefix !== undefined) { fields.push(`price_prefix = $${idx++}`); values.push(updates.price_prefix); }
      if (updates.featured !== undefined) { fields.push(`featured = $${idx++}`); values.push(Boolean(updates.featured)); }
      if (updates.active !== undefined) { fields.push(`active = $${idx++}`); values.push(Boolean(updates.active)); }
      if (updates.sort_order !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(parseInt(updates.sort_order, 10)); }

      fields.push(`updated_at = $${idx++}`);
      values.push(now);

      values.push(id);
      const query = `UPDATE services SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

      const res = await pool.query(query, values);
      if (res.rows.length > 0) return mapPostgresService(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to update service in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  const index = (store.services || []).findIndex(s => s.id === id);
  if (index !== -1) {
    store.services[index] = {
      ...store.services[index],
      ...updates,
      price: updates.price !== undefined ? parseFloat(updates.price) : store.services[index].price,
      duration: updates.duration !== undefined ? parseInt(updates.duration, 10) : store.services[index].duration,
      updated_at: now
    };
    await writeFallbackStore(store);
    return store.services[index];
  }
  return null;
}

/**
 * Deletes a service by ID
 */
export async function deleteService(id) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
      return res.rowCount > 0;
    } catch (err) {
      console.error('[DB] Failed to delete service in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  const len = store.services.length;
  store.services = (store.services || []).filter(s => s.id !== id);
  if (store.services.length !== len) {
    await writeFallbackStore(store);
    return true;
  }
  return false;
}

/**
 * Resets services back to default catalog
 */
export async function resetServicesToDefault() {
  if (!dbState.usingFallback && pool) {
    try {
      await pool.query('DELETE FROM services');
      for (const s of defaultServices) {
        await pool.query(
          `INSERT INTO services (id, category, name_vi, name_en, description_vi, description_en, duration, price, price_prefix, featured, active, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [s.id, s.category, s.name_vi, s.name_en, s.description_vi, s.description_en, s.duration, s.price, s.price_prefix || '', s.featured || false, s.active ?? true, s.sort_order || 0]
        );
      }
      return defaultServices;
    } catch (err) {
      console.error('[DB] Failed to reset services in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.services = [...defaultServices];
  await writeFallbackStore(store);
  return store.services;
}

function mapPostgresService(row) {
  return {
    id: row.id,
    category: row.category,
    name_vi: row.name_vi,
    name_en: row.name_en,
    description_vi: row.description_vi,
    description_en: row.description_en,
    duration: parseInt(row.duration, 10),
    price: parseFloat(row.price),
    pricePrefix: row.price_prefix || '',
    price_prefix: row.price_prefix || '',
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    sort_order: parseInt(row.sort_order, 10) || 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
