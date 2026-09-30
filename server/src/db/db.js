import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultServices } from '../data/defaultServices.js';
import { defaultCategories } from '../data/defaultCategories.js';
import { defaultPromotions } from '../data/defaultPromotions.js';
import { defaultGallery } from '../data/defaultGallery.js';
import { defaultVouchers } from '../data/defaultVouchers.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_FILE = path.join(__dirname, '../../data/fallback_db.json');

// Global DB State
export const dbState = {
  mode: 'uninitialized', // 'neon_postgresql' | 'local_fallback'
  connected: false,
  usingFallback: false,
  error: null,
  databaseUrl: process.env.DATABASE_URL || '',
  lastPingMs: null,
  initializedAt: null
};

let pool = null;

/**
 * Initializes fallback JSON file if not exists
 */
async function initFallbackStore() {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(FALLBACK_FILE);
    } catch {
      const initialData = {
        categories: defaultCategories,
        bookings: [],
        services: defaultServices,
        promotions: defaultPromotions,
        gallery: defaultGallery,
        schedule_locks: [],
        schedule_custom_slots: [],
        schedule_date_hours: [],
        vouchers: defaultVouchers
      };
      await fs.writeFile(FALLBACK_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[DB] Failed to init fallback store:', err.message);
  }
}

/**
 * Reads data from fallback store
 */
export async function readFallbackStore() {
  try {
    await initFallbackStore();
    const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = defaultCategories;
    }
    if (!parsed.gallery || parsed.gallery.length === 0) {
      parsed.gallery = defaultGallery;
    }
    if (!parsed.schedule_locks) {
      parsed.schedule_locks = [];
    }
    if (!parsed.schedule_custom_slots) {
      parsed.schedule_custom_slots = [];
    }
    if (!parsed.schedule_date_hours) {
      parsed.schedule_date_hours = [];
    }
    if (!parsed.vouchers || parsed.vouchers.length === 0) {
      parsed.vouchers = defaultVouchers;
    }
    return parsed;
  } catch (err) {
    console.error('[DB] Error reading fallback store:', err.message);
    return {
      bookings: [],
      services: defaultServices,
      promotions: defaultPromotions,
      gallery: defaultGallery,
      schedule_locks: [],
      schedule_custom_slots: [],
      schedule_date_hours: [],
      vouchers: defaultVouchers
    };
  }
}

/**
 * Writes data to fallback store
 */
export async function writeFallbackStore(data) {
  try {
    await initFallbackStore();
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing fallback store:', err.message);
  }
}

/**
 * Creates PostgreSQL tables for Neon
 */
async function createTables(client) {
  const ddl = `
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      sort_order INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      booking_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      service VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT '',
      date VARCHAR(50) NOT NULL,
      time VARCHAR(50) NOT NULL,
      message TEXT,
      voucher VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      guests INT DEFAULT 1,
      price NUMERIC(10, 2) DEFAULT 0,
      original_price NUMERIC(10, 2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT '';
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guests INT DEFAULT 1;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2) DEFAULT 0;

    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(100) PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      description TEXT,
      description_en TEXT,
      duration INT DEFAULT 45,
      price NUMERIC(10, 2) NOT NULL,
      price_prefix VARCHAR(50) DEFAULT '',
      featured BOOLEAN DEFAULT false,
      active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) DEFAULT '',
      subtitle TEXT DEFAULT '',
      badge VARCHAR(100) DEFAULT '',
      image_url TEXT NOT NULL,
      voucher_code VARCHAR(50) DEFAULT '',
      discount_text VARCHAR(100) DEFAULT '',
      active BOOLEAN DEFAULT true,
      start_date VARCHAR(50) DEFAULT '',
      end_date VARCHAR(50) DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id VARCHAR(100) PRIMARY KEY,
      src TEXT NOT NULL,
      category_key VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      title_en VARCHAR(255) NOT NULL,
      category_name VARCHAR(100) DEFAULT '',
      category_en VARCHAR(100) DEFAULT '',
      service_id VARCHAR(100) DEFAULT '',
      service_name VARCHAR(255) DEFAULT '',
      service_name_en VARCHAR(255) DEFAULT '',
      shape VARCHAR(100) DEFAULT '',
      shape_en VARCHAR(100) DEFAULT '',
      duration VARCHAR(50) DEFAULT '',
      duration_en VARCHAR(50) DEFAULT '',
      price VARCHAR(50) DEFAULT '$60',
      technique TEXT DEFAULT '',
      technique_en TEXT DEFAULT '',
      description TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      highlights TEXT DEFAULT '[]',
      highlights_en TEXT DEFAULT '[]',
      active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category_key);
    CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(active);
    CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery(sort_order ASC);

    CREATE TABLE IF NOT EXISTS schedule_locks (
      id SERIAL PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      slot VARCHAR(50) DEFAULT '',
      reason VARCHAR(255) DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, slot)
    );

    CREATE INDEX IF NOT EXISTS idx_schedule_locks_date ON schedule_locks(date);

    CREATE TABLE IF NOT EXISTS schedule_custom_slots (
      id SERIAL PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      slot VARCHAR(50) NOT NULL,
      action VARCHAR(20) NOT NULL DEFAULT 'add',
      note VARCHAR(255) DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, slot, action)
    );

    CREATE INDEX IF NOT EXISTS idx_custom_slots_date ON schedule_custom_slots(date);

    CREATE TABLE IF NOT EXISTS schedule_date_hours (
      id SERIAL PRIMARY KEY,
      date VARCHAR(50) UNIQUE NOT NULL,
      open_time VARCHAR(50) NOT NULL,
      close_time VARCHAR(50) NOT NULL,
      is_closed BOOLEAN DEFAULT false,
      note VARCHAR(255) DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_date_hours_date ON schedule_date_hours(date);

    CREATE TABLE IF NOT EXISTS vouchers (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
      discount_value NUMERIC(10, 2) NOT NULL,
      min_spend NUMERIC(10, 2) DEFAULT 0,
      max_discount NUMERIC(10, 2) DEFAULT NULL,
      usage_limit INT DEFAULT NULL,
      used_count INT DEFAULT 0,
      start_date VARCHAR(50) DEFAULT '',
      end_date VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code_upper ON vouchers(UPPER(code));
    CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
    CREATE INDEX IF NOT EXISTS idx_vouchers_end_date ON vouchers(end_date);
  `;

  await client.query(ddl);
}


/**
 * Seeds initial services, promotions & gallery if empty in Neon Postgres
 */
async function seedPostgresIfEmpty(client) {
  // 1. Seed categories first so services can reference them
  console.log('[DB] Ensuring default categories exist in Neon PostgreSQL...');
  for (const c of defaultCategories) {
    const catName = c.name || c.name_en;
    const catDesc = c.description || c.description_en || '';
    await client.query(
      `INSERT INTO categories (id, name, name_en, description, description_en, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         name_en = EXCLUDED.name_en,
         description = EXCLUDED.description,
         description_en = EXCLUDED.description_en,
         sort_order = EXCLUDED.sort_order;`,
      [c.id, catName, catName, catDesc, catDesc, c.sort_order || 0, c.active !== false]
    );
  }

  // 2. Add Foreign Key on services -> categories with ON DELETE CASCADE if not exists
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_services_category'
      ) THEN
        ALTER TABLE services
        ADD CONSTRAINT fk_services_category
        FOREIGN KEY (category) REFERENCES categories(id)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  // 3. Backfill categories in bookings if blank
  await client.query(`
    UPDATE bookings b
    SET category = COALESCE(
      (SELECT c.name FROM services s JOIN categories c ON s.category = c.id WHERE LOWER(s.name) = LOWER(b.service) OR LOWER(s.name_en) = LOWER(b.service) LIMIT 1),
      (SELECT name FROM categories WHERE id = 'biab' AND (LOWER(b.service) LIKE '%biab%' OR LOWER(b.service) LIKE '%natural%')),
      (SELECT name FROM categories WHERE id = 'shellac' AND (LOWER(b.service) LIKE '%shellac%' OR LOWER(b.service) LIKE '%pedicure%')),
      (SELECT name FROM categories WHERE id = 'gelx' AND LOWER(b.service) LIKE '%gel x%'),
      (SELECT name FROM categories WHERE id = 'acrylic' AND LOWER(b.service) LIKE '%acrylic%'),
      (SELECT name FROM categories WHERE id = 'sns' AND LOWER(b.service) LIKE '%sns%'),
      (SELECT name FROM categories WHERE id = 'polish' AND LOWER(b.service) LIKE '%polish%'),
      'Builder Gel - BIAB'
    )
    WHERE b.category IS NULL OR b.category = '' OR b.category IN ('biab', 'acrylic', 'shellac', 'gelx', 'sns', 'polish', 'extra');
  `);

  // 4. Check services
  const servRes = await client.query('SELECT COUNT(*) FROM services');
  if (parseInt(servRes.rows[0].count, 10) === 0) {
    console.log('[DB] Seeding default services into Neon PostgreSQL...');
    for (const s of defaultServices) {
      const sName = s.name || s.name_en;
      const sDesc = s.description || s.description_en || '';
      await client.query(
        `INSERT INTO services (id, category, name, name_en, description, description_en, duration, price, price_prefix, featured, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.category, s.name, s.name_en, sDesc, sDesc, s.duration, s.price, s.price_prefix || '', s.featured || false, s.active ?? true, s.sort_order || 0]
      );
    }
  }

  // Check promotions
  const promoRes = await client.query('SELECT COUNT(*) FROM promotions');
  if (parseInt(promoRes.rows[0].count, 10) === 0) {
    console.log('[DB] Seeding default promotions into Neon PostgreSQL...');
    for (const p of defaultPromotions) {
      await client.query(
        `INSERT INTO promotions (title, subtitle, badge, image_url, voucher_code, discount_text, active, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [p.title, p.subtitle, p.badge, p.image_url, p.voucher_code, p.discount_text, p.active, p.start_date, p.end_date]
      );
    }
  }

  // Check gallery
  const galRes = await client.query('SELECT COUNT(*) FROM gallery');
  if (parseInt(galRes.rows[0].count, 10) === 0) {
    console.log('[DB] Seeding default gallery showcases into Neon PostgreSQL...');
    for (const g of defaultGallery) {
      const gTitle = g.title || g.title_en;
      const gCat = g.category_name || g.category_en || '';
      const gServ = g.service_name || g.service_name_en || '';
      const gShape = g.shape || g.shape_en || '';
      const gDur = g.duration || g.duration_en || '';
      const gTech = g.technique || g.technique_en || '';
      const gDesc = g.description || g.description_en || '';
      const gHigh = JSON.stringify(g.highlights || g.highlights_en || []);

      await client.query(
        `INSERT INTO gallery (
          id, src, category_key, title, title_en, category_name, category_en,
          service_id, service_name, service_name_en, shape, shape_en,
          duration, duration_en, price, technique, technique_en,
          description, description_en, highlights, highlights_en, active, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        ) ON CONFLICT (id) DO NOTHING`,
        [
          g.id, g.src, g.categoryKey, gTitle, gTitle, gCat, gCat,
          g.serviceId || '', gServ, gServ, gShape, gShape,
          gDur, gDur, g.price || '$60', gTech, gTech,
          gDesc, gDesc, gHigh, gHigh,
          g.active ?? true, g.sort_order || 0
        ]
      );
    }
  }

  // Check vouchers
  const vouchRes = await client.query('SELECT COUNT(*) FROM vouchers');
  if (parseInt(vouchRes.rows[0].count, 10) === 0) {
    console.log('[DB] Seeding default vouchers into Neon PostgreSQL...');
    for (const v of defaultVouchers) {
      await client.query(
        `INSERT INTO vouchers (
          code, name, discount_type, discount_value, min_spend, max_discount,
          usage_limit, used_count, start_date, end_date, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) ON CONFLICT (code) DO NOTHING`,
        [
          v.code, v.name, v.discountType, v.discountValue, v.minSpend, v.maxDiscount,
          v.usageLimit, v.usedCount, v.startDate, v.endDate, v.isActive
        ]
      );
    }
  }
}

/**
 * Initializes Database connection
 */
export async function initDatabase(customUrl = null) {
  const connUrl = customUrl || process.env.DATABASE_URL;
  dbState.databaseUrl = connUrl || '';
  dbState.initializedAt = new Date().toISOString();

  // Always ensure fallback file exists
  await initFallbackStore();

  if (!connUrl || !connUrl.trim().startsWith('postgres')) {
    console.warn('⚠️ [DB] No Neon DATABASE_URL provided. Operating in RESILIENT LOCAL FALLBACK mode.');
    dbState.mode = 'local_fallback';
    dbState.connected = true;
    dbState.usingFallback = true;
    dbState.error = 'No DATABASE_URL configured. Using local JSON store.';
    return { success: true, mode: 'local_fallback' };
  }

  try {
    console.log('🔄 [DB] Connecting to Neon PostgreSQL...');
    const start = Date.now();

    // Create Pool with SSL required for Neon
    if (pool) {
      await pool.end().catch(() => {});
    }

    pool = new Pool({
      connectionString: connUrl,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });

    const client = await pool.connect();
    dbState.lastPingMs = Date.now() - start;

    await createTables(client);
    await seedPostgresIfEmpty(client);

    client.release();

    dbState.mode = 'neon_postgresql';
    dbState.connected = true;
    dbState.usingFallback = false;
    dbState.error = null;
    console.log(`✅ [DB] Connected to Neon PostgreSQL successfully in ${dbState.lastPingMs}ms! Tables verified.`);
    return { success: true, mode: 'neon_postgresql', pingMs: dbState.lastPingMs };
  } catch (err) {
    console.error('❌ [DB] Error connecting to Neon PostgreSQL:', err.message);
    dbState.mode = 'local_fallback';
    dbState.connected = false;
    dbState.usingFallback = true;
    dbState.error = err.message;
    console.warn('⚠️ [DB] Switched to RESILIENT LOCAL FALLBACK mode. All app features remain active.');
    return { success: false, mode: 'local_fallback', error: err.message };
  }
}

/**
 * Generic query execution supporting Neon PostgreSQL with fallback
 */
export async function executeQuery(text, params = []) {
  if (!dbState.usingFallback && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('[DB Query Error]', err.message, text);
      throw err;
    }
  }
  throw new Error('Not using PostgreSQL engine');
}

/**
 * Gets the connection status and table counts
 */
export async function getDbStatus() {
  let counts = { bookings: 0, services: 0, promotions: 0, gallery: 0, schedule_locks: 0, schedule_custom_slots: 0 };
  let pingMs = dbState.lastPingMs;

  if (!dbState.usingFallback && pool) {
    try {
      const start = Date.now();
      const [b, s, p, g, l, cs, cat] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM bookings'),
        pool.query('SELECT COUNT(*) FROM services'),
        pool.query('SELECT COUNT(*) FROM promotions'),
        pool.query('SELECT COUNT(*) FROM gallery'),
        pool.query('SELECT COUNT(*) FROM schedule_locks'),
        pool.query('SELECT COUNT(*) FROM schedule_custom_slots'),
        pool.query('SELECT COUNT(*) FROM categories')
      ]);
      pingMs = Date.now() - start;
      counts = {
        bookings: parseInt(b.rows[0].count, 10),
        services: parseInt(s.rows[0].count, 10),
        promotions: parseInt(p.rows[0].count, 10),
        gallery: parseInt(g.rows[0].count, 10),
        schedule_locks: parseInt(l.rows[0].count, 10),
        schedule_custom_slots: parseInt(cs.rows[0].count, 10),
        categories: parseInt(cat.rows[0].count, 10)
      };
    } catch (err) {
      console.warn('[DB] Failed to get Neon counts, falling back:', err.message);
    }
  } else {
    const store = await readFallbackStore();
    counts = {
      bookings: (store.bookings || []).length,
      services: (store.services || []).length,
      promotions: (store.promotions || []).length,
      gallery: (store.gallery || defaultGallery).length,
      schedule_locks: (store.schedule_locks || []).length,
      schedule_custom_slots: (store.schedule_custom_slots || []).length,
      categories: (store.categories || defaultCategories).length
    };
  }

  // Mask database URL for security in UI
  const maskedUrl = dbState.databaseUrl
    ? dbState.databaseUrl.replace(/:\/\/(.*?):(.*?)@/, '://$1:••••••••@')
    : '';

  return {
    mode: dbState.mode,
    connected: dbState.connected,
    usingFallback: dbState.usingFallback,
    error: dbState.error,
    databaseUrlConfigured: Boolean(dbState.databaseUrl),
    maskedUrl,
    counts,
    pingMs,
    initializedAt: dbState.initializedAt
  };
}

export { pool };
