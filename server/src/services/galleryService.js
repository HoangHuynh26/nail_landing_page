import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';

/**
 * Normalizes PostgreSQL row to Gallery Item schema matching client conventions
 */
export function mapPostgresGallery(row) {
  let hl = [];
  try {
    hl = typeof row.highlights === 'string' ? JSON.parse(row.highlights) : (row.highlights || []);
  } catch {
    try {
      hl = typeof row.highlights_en === 'string' ? JSON.parse(row.highlights_en) : (row.highlights_en || []);
    } catch {
      hl = (row.highlights || row.highlights_en) ? String(row.highlights || row.highlights_en).split(',').map(s => s.trim()) : [];
    }
  }

  const title = row.title || row.title_en || '';
  const categoryName = row.category_name || row.category_en || '';
  const serviceName = row.service_name || row.service_name_en || '';
  const shape = row.shape || row.shape_en || '';
  const duration = row.duration || row.duration_en || '';
  const technique = row.technique || row.technique_en || '';
  const description = row.description || row.description_en || '';

  return {
    id: row.id,
    src: row.src,
    categoryKey: row.category_key,
    title,
    title_en: title,
    category: categoryName,
    categoryName,
    category_name: categoryName,
    category_en: categoryName,
    serviceId: row.service_id || '',
    serviceName,
    serviceName_en: serviceName,
    shape,
    shape_en: shape,
    duration,
    duration_en: duration,
    price: row.price || '',
    technique,
    technique_en: technique,
    description,
    description_en: description,
    highlights: Array.isArray(hl) ? hl : [],
    highlights_en: Array.isArray(hl) ? hl : [],
    active: row.active ?? true,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Retrieves all gallery showcase items
 * @param {Object} options - { activeOnly: boolean, category: string }
 */
export async function getAllGalleryItems({ activeOnly = false, category = null } = {}) {
  if (!dbState.usingFallback && pool) {
    try {
      const conditions = [];
      const params = [];

      if (activeOnly) {
        conditions.push(`active = true`);
      }
      if (category && category !== 'all') {
        params.push(category);
        conditions.push(`category_key = $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `SELECT * FROM gallery ${whereClause} ORDER BY sort_order ASC, id ASC`;
      const res = await pool.query(query, params);
      return res.rows.map(mapPostgresGallery);
    } catch (err) {
      console.error('[DB] Failed to get gallery items from Neon, using fallback:', err.message);
    }
  }

  // Local fallback
  const store = await readFallbackStore();
  let items = store.gallery && store.gallery.length > 0 ? store.gallery : [];

  if (activeOnly) {
    items = items.filter(item => item.active !== false);
  }
  if (category && category !== 'all') {
    items = items.filter(item => item.categoryKey === category);
  }

  return items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/**
 * Retrieves a single gallery item by ID
 */
export async function getGalleryItemById(id) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('SELECT * FROM gallery WHERE id = $1', [id]);
      if (res.rows.length > 0) return mapPostgresGallery(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[DB] Failed to get gallery item by id from Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  const items = store.gallery && store.gallery.length > 0 ? store.gallery : defaultGallery;
  return items.find(item => String(item.id) === String(id)) || null;
}

/**
 * Creates a new gallery showcase item
 */
export async function createGalleryItem(itemData) {
  const now = new Date().toISOString();
  const id = itemData.id || `case-${Date.now()}`;
  const rawHl = itemData.highlights || itemData.highlights_en || [];
  const hlArr = Array.isArray(rawHl) ? rawHl : [];
  const hlStr = JSON.stringify(hlArr);
  const title = itemData.title || itemData.title_en || 'Artisan Nail Design';
  const categoryName = itemData.categoryName || itemData.category || itemData.category_en || 'Builder Gel - BIAB';
  const serviceName = itemData.serviceName || itemData.serviceName_en || '';
  const shape = itemData.shape || itemData.shape_en || '';
  const duration = itemData.duration || itemData.duration_en || '';
  const technique = itemData.technique || itemData.technique_en || '';
  const desc = itemData.description || itemData.description_en || '';

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO gallery (
          id, src, category_key, title, title_en, category_name, category_en,
          service_id, service_name, service_name_en, shape, shape_en,
          duration, duration_en, price, technique, technique_en,
          description, description_en, highlights, highlights_en,
          active, sort_order, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23, $24, $25
        )
        RETURNING *;
      `;
      const values = [
        id,
        itemData.src,
        itemData.categoryKey || 'biab',
        title,
        title,
        categoryName,
        categoryName,
        itemData.serviceId || '',
        serviceName,
        serviceName,
        shape,
        shape,
        duration,
        duration,
        itemData.price || '$60',
        technique,
        technique,
        desc,
        desc,
        hlStr,
        hlStr,
        itemData.active !== undefined ? Boolean(itemData.active) : true,
        itemData.sort_order ? parseInt(itemData.sort_order, 10) : 99,
        now,
        now
      ];
      const res = await pool.query(query, values);
      return mapPostgresGallery(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to insert gallery item into Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.gallery = store.gallery && store.gallery.length > 0 ? store.gallery : [...defaultGallery];

  const newItem = {
    id,
    src: itemData.src,
    categoryKey: itemData.categoryKey || 'biab',
    title,
    title_en: title,
    categoryName,
    category_en: categoryName,
    serviceId: itemData.serviceId || '',
    serviceName,
    serviceName_en: serviceName,
    shape,
    shape_en: shape,
    duration,
    duration_en: duration,
    price: itemData.price || '$60',
    technique,
    technique_en: technique,
    description: desc,
    description_en: desc,
    highlights: hlArr,
    highlights_en: hlArr,
    active: itemData.active !== undefined ? Boolean(itemData.active) : true,
    sort_order: itemData.sort_order ? parseInt(itemData.sort_order, 10) : store.gallery.length + 1,
    created_at: now,
    updated_at: now
  };

  store.gallery.unshift(newItem);
  await writeFallbackStore(store);
  return newItem;
}

/**
 * Updates an existing gallery showcase item
 */
export async function updateGalleryItem(id, itemData) {
  const now = new Date().toISOString();

  if (!dbState.usingFallback && pool) {
    try {
      const existing = await getGalleryItemById(id);
      if (!existing) return null;

      const updated = {
        ...existing,
        ...itemData
      };

      const title = updated.title || updated.title_en || '';
      const categoryName = updated.categoryName || updated.category || updated.category_en || '';
      const serviceName = updated.serviceName || updated.serviceName_en || '';
      const shape = updated.shape || updated.shape_en || '';
      const duration = updated.duration || updated.duration_en || '';
      const technique = updated.technique || updated.technique_en || '';
      const desc = updated.description || updated.description_en || '';
      const rawHl = updated.highlights || updated.highlights_en || [];
      const hlArr = Array.isArray(rawHl) ? rawHl : [];
      const hlStr = JSON.stringify(hlArr);

      const query = `
        UPDATE gallery SET
          src = $1,
          category_key = $2,
          title = $3,
          title_en = $4,
          category_name = $5,
          category_en = $6,
          service_id = $7,
          service_name = $8,
          service_name_en = $9,
          shape = $10,
          shape_en = $11,
          duration = $12,
          duration_en = $13,
          price = $14,
          technique = $15,
          technique_en = $16,
          description = $17,
          description_en = $18,
          highlights = $19,
          highlights_en = $20,
          active = $21,
          sort_order = $22,
          updated_at = $23
        WHERE id = $24
        RETURNING *;
      `;
      const values = [
        updated.src,
        updated.categoryKey,
        title,
        title,
        categoryName,
        categoryName,
        updated.serviceId,
        serviceName,
        serviceName,
        shape,
        shape,
        duration,
        duration,
        updated.price,
        technique,
        technique,
        desc,
        desc,
        hlStr,
        hlStr,
        Boolean(updated.active),
        parseInt(updated.sort_order ?? 0, 10),
        now,
        id
      ];
      const res = await pool.query(query, values);
      if (res.rows.length > 0) return mapPostgresGallery(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to update gallery item in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.gallery = store.gallery && store.gallery.length > 0 ? store.gallery : [...defaultGallery];
  const idx = store.gallery.findIndex(item => String(item.id) === String(id));
  if (idx === -1) return null;

  store.gallery[idx] = {
    ...store.gallery[idx],
    ...itemData,
    updated_at: now
  };

  await writeFallbackStore(store);
  return store.gallery[idx];
}

/**
 * Toggles active visibility status
 */
export async function toggleGalleryItemActive(id) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        `UPDATE gallery SET active = NOT active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id]
      );
      if (res.rows.length > 0) return mapPostgresGallery(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to toggle gallery active in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.gallery = store.gallery && store.gallery.length > 0 ? store.gallery : [...defaultGallery];
  const idx = store.gallery.findIndex(item => String(item.id) === String(id));
  if (idx === -1) return null;

  store.gallery[idx].active = !store.gallery[idx].active;
  store.gallery[idx].updated_at = new Date().toISOString();
  await writeFallbackStore(store);
  return store.gallery[idx];
}

/**
 * Deletes a gallery item
 */
export async function deleteGalleryItem(id) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('DELETE FROM gallery WHERE id = $1 RETURNING id', [id]);
      return res.rowCount > 0;
    } catch (err) {
      console.error('[DB] Failed to delete gallery item from Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.gallery = store.gallery && store.gallery.length > 0 ? store.gallery : [...defaultGallery];
  const initialLen = store.gallery.length;
  store.gallery = store.gallery.filter(item => String(item.id) !== String(id));
  await writeFallbackStore(store);
  return store.gallery.length < initialLen;
}

/**
 * Resets gallery back to default initial showcase
 */
export async function resetGalleryToDefault() {
  if (!dbState.usingFallback && pool) {
    try {
      await pool.query('DELETE FROM gallery');
      for (const item of defaultGallery) {
        await createGalleryItem(item);
      }
      return await getAllGalleryItems();
    } catch (err) {
      console.error('[DB] Failed to reset gallery in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.gallery = [...defaultGallery];
  await writeFallbackStore(store);
  return store.gallery;
}
