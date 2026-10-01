import 'dotenv/config';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultCategories } from '../data/defaultCategories.js';
import { defaultServices } from '../data/defaultServices.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_FILE = path.join(__dirname, '../../data/fallback_db.json');

async function sync() {
  console.log('--- Starting Database Services & Categories Sync ---');

  // 1. Update fallback_db.json
  try {
    let fallbackData = {};
    try {
      const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
      fallbackData = JSON.parse(raw);
    } catch {
      fallbackData = {};
    }

    fallbackData.categories = defaultCategories;
    fallbackData.services = defaultServices;

    await fs.writeFile(FALLBACK_FILE, JSON.stringify(fallbackData, null, 2), 'utf-8');
    console.log(`[Fallback] Successfully wrote ${defaultCategories.length} categories and ${defaultServices.length} services to fallback_db.json`);
  } catch (err) {
    console.error('[Fallback] Error updating fallback_db.json:', err.message);
  }

  // 2. Update PostgreSQL (Neon) if DATABASE_URL is present
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('[Postgres] No DATABASE_URL found, skipping Postgres sync.');
    process.exit(0);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('[Postgres] Connected to PostgreSQL (Neon).');

    // Begin transaction
    await client.query('BEGIN');

    // 2a. Insert/update 6 new categories
    console.log('[Postgres] Upserting 6 categories...');
    for (const cat of defaultCategories) {
      await client.query(`
        INSERT INTO categories (id, name, name_en, description, description_en, sort_order, active, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          name_en = EXCLUDED.name_en,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          sort_order = EXCLUDED.sort_order,
          active = EXCLUDED.active,
          updated_at = CURRENT_TIMESTAMP;
      `, [cat.id, cat.name, cat.name_en, cat.description, cat.description, cat.sort_order, cat.active]);
    }

    // 2b. Re-link bookings that might have referenced old categories if needed
    await client.query(`
      UPDATE bookings
      SET category = 'Shellac & Manicure'
      WHERE category = 'Nail Polish' OR category = 'polish';
    `);

    // 2c. Delete services
    console.log('[Postgres] Replacing services table with 29 official services...');
    await client.query('DELETE FROM services;');

    // 2d. Delete obsolete categories (sns, polish)
    const newCatIds = defaultCategories.map(c => c.id);
    await client.query('DELETE FROM categories WHERE id NOT IN ($1, $2, $3, $4, $5, $6);', newCatIds);

    // 2e. Insert 29 services
    for (const svc of defaultServices) {
      await client.query(`
        INSERT INTO services (
          id, category, name, name_en, description, description_en,
          duration, price, price_prefix, featured, active, sort_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `, [
        svc.id,
        svc.category,
        svc.name,
        svc.name_en,
        svc.description,
        svc.description_en,
        svc.duration,
        svc.price,
        svc.price_prefix || '',
        Boolean(svc.featured),
        svc.active !== false,
        svc.sort_order
      ]);
    }

    await client.query('COMMIT');
    client.release();
    console.log(`[Postgres] Successfully committed ${defaultServices.length} services across ${defaultCategories.length} categories to Neon PostgreSQL!`);
  } catch (err) {
    console.error('[Postgres] Error syncing to PostgreSQL:', err.message);
    try {
      await pool.query('ROLLBACK');
    } catch {}
  } finally {
    await pool.end();
  }

  console.log('--- Sync Completed ---');
}

sync();
