import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';
import { defaultCategories } from '../data/defaultCategories.js';

/**
 * Normalizes PostgreSQL row to match frontend camelCase/object format
 */
function mapPostgresCategory(row) {
  if (!row) return null;
  const name = row.name || row.name_en || 'Category';
  const desc = row.description || row.description_en || '';
  return {
    id: row.id,
    name: name,
    name_en: name,
    label: name,
    description: desc,
    description_en: desc,
    sort_order: parseInt(row.sort_order, 10) || 0,
    active: row.active !== false,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Retrieves all categories
 */
export async function getAllCategories({ activeOnly = false } = {}) {
  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM categories';
      if (activeOnly) {
        query += ' WHERE active = true';
      }
      query += ' ORDER BY sort_order ASC, id ASC';

      const res = await pool.query(query);
      return res.rows.map(mapPostgresCategory);
    } catch (err) {
      console.error('[DB] Failed to fetch categories from Neon, using fallback:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  let categories = store.categories || defaultCategories;
  if (activeOnly) {
    categories = categories.filter(c => c.active !== false);
  }
  return categories
    .map(c => ({ ...c, label: c.name || c.name_en || c.label }))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

/**
 * Gets a category by ID
 */
export async function getCategoryById(id) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
      if (res.rows.length > 0) return mapPostgresCategory(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[DB] Failed to fetch category by id from Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  const found = (store.categories || []).find(c => c.id === id);
  return found ? { ...found, label: found.name || found.name_en || found.label } : null;
}

/**
 * Creates a new category
 */
export async function createCategory(catData) {
  const trimmedName = (catData.name || catData.name_en || catData.label || '').trim();
  const slug = catData.id || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `cat_${Date.now()}`;
  const now = new Date().toISOString();

  const newCat = {
    id: slug,
    name: trimmedName || 'New Category',
    name_en: trimmedName || 'New Category',
    description: catData.description || catData.description_en || '',
    description_en: catData.description || catData.description_en || '',
    sort_order: parseInt(catData.sort_order, 10) || 99,
    active: catData.active !== undefined ? Boolean(catData.active) : true,
    created_at: now,
    updated_at: now
  };

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO categories (
          id, name, name_en, description, description_en, sort_order, active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const values = [
        newCat.id, newCat.name, newCat.name_en,
        newCat.description, newCat.description_en,
        newCat.sort_order, newCat.active, newCat.created_at, newCat.updated_at
      ];
      const res = await pool.query(query, values);
      return mapPostgresCategory(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to insert category into Neon:', err.message);
      throw err;
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.categories = store.categories || [];
  store.categories.push(newCat);
  await writeFallbackStore(store);
  return { ...newCat, label: newCat.name_en };
}

/**
 * Updates an existing category
 */
export async function updateCategory(id, catData) {
  const now = new Date().toISOString();
  const catName = catData.name || catData.name_en || catData.label;
  const catDesc = catData.description !== undefined ? catData.description : catData.description_en;

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        UPDATE categories SET
          name = COALESCE($1, name),
          name_en = COALESCE($1, name_en),
          description = COALESCE($2, description),
          description_en = COALESCE($2, description_en),
          sort_order = COALESCE($3, sort_order),
          active = COALESCE($4, active),
          updated_at = $5
        WHERE id = $6
        RETURNING *;
      `;
      const values = [
        catName,
        catDesc,
        catData.sort_order != null ? parseInt(catData.sort_order, 10) : null,
        catData.active != null ? Boolean(catData.active) : null,
        now,
        id
      ];
      const res = await pool.query(query, values);
      if (res.rows.length > 0) return mapPostgresCategory(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[DB] Failed to update category in Neon:', err.message);
      throw err;
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.categories = store.categories || [];
  const index = store.categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  store.categories[index] = {
    ...store.categories[index],
    ...catData,
    updated_at: now
  };
  await writeFallbackStore(store);
  return {
    ...store.categories[index],
    label: store.categories[index].name_en || store.categories[index].label
  };
}

/**
 * Deletes a category by ID.
 * Due to FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE,
 * all services under this category in PostgreSQL are automatically deleted!
 */
export async function deleteCategory(id) {
  if (!dbState.usingFallback && pool) {
    try {
      // Find count of services that will be deleted
      const svcRes = await pool.query('SELECT COUNT(*) FROM services WHERE category = $1', [id]);
      const deletedServicesCount = parseInt(svcRes.rows[0].count, 10) || 0;

      // Delete category (CASCADE removes child services automatically in Postgres)
      const res = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
      if (res.rows.length === 0) return null;

      return {
        deletedCategory: mapPostgresCategory(res.rows[0]),
        deletedServicesCount
      };
    } catch (err) {
      console.error('[DB] Failed to delete category in Neon:', err.message);
      throw err;
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.categories = store.categories || [];
  store.services = store.services || [];

  const catIndex = store.categories.findIndex(c => c.id === id);
  if (catIndex === -1) return null;

  const deletedCat = store.categories.splice(catIndex, 1)[0];
  const initialSvcCount = store.services.length;
  // Cascade delete services in fallback store
  store.services = store.services.filter(s => s.category !== id);
  const deletedServicesCount = initialSvcCount - store.services.length;

  await writeFallbackStore(store);
  return {
    deletedCategory: { ...deletedCat, label: deletedCat.name_en },
    deletedServicesCount
  };
}
