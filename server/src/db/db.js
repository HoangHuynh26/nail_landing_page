import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/env.js';

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
        categories: [],
        bookings: [],
        services: [],
        promotions: [],
        gallery: [],
        schedule_locks: [],
        schedule_custom_slots: [],
        schedule_date_hours: [],
        vouchers: [],
        admins: []
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
    return {
      categories: parsed.categories || [],
      bookings: parsed.bookings || [],
      services: parsed.services || [],
      promotions: parsed.promotions || [],
      gallery: parsed.gallery || [],
      schedule_locks: parsed.schedule_locks || [],
      schedule_custom_slots: parsed.schedule_custom_slots || [],
      schedule_date_hours: parsed.schedule_date_hours || [],
      vouchers: parsed.vouchers || [],
      admins: parsed.admins || []
    };
  } catch (err) {
    console.error('[DB] Error reading fallback store:', err.message);
    return {
      categories: [],
      bookings: [],
      services: [],
      promotions: [],
      gallery: [],
      schedule_locks: [],
      schedule_custom_slots: [],
      schedule_date_hours: [],
      vouchers: [],
      admins: []
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
    throw err;
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

    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) DEFAULT 'Salon Administrator',
      role VARCHAR(50) DEFAULT 'admin',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_username_lower ON admins(LOWER(username));
  `;

  await client.query(ddl);
}


/**
 * Seeds initial services, promotions & gallery if empty in Neon Postgres
 */
async function seedPostgresIfEmpty(client) {
  // 1. Add Foreign Key on services -> categories with ON DELETE CASCADE if not exists
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

  // 2. Backfill categories in bookings if blank
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

  // 3. Ensure initial admin user exists in Neon PostgreSQL
  const adminRes = await client.query('SELECT COUNT(*) FROM admins');
  if (parseInt(adminRes.rows[0].count, 10) === 0) {
    console.log('[DB] Initializing default admin user in Neon PostgreSQL...');
    const isDefaultProvided = !!process.env.ADMIN_PASSWORD;
    const defaultPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    
    if (!isDefaultProvided) {
      console.warn(`[DB] WARNING: Created default admin account: ${username} / ${defaultPassword}`);
      console.warn('[DB] Please log in and change this password immediately.');
    }
    
    await client.query(
      `INSERT INTO admins (username, password_hash, full_name, role, active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      [username, passwordHash, 'Fashion Nails Administrator', 'superadmin', true]
    );
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
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
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
  let counts = { bookings: 0, services: 0, promotions: 0, gallery: 0, schedule_locks: 0, schedule_custom_slots: 0, categories: 0, admins: 0 };
  let pingMs = dbState.lastPingMs;

  if (!dbState.usingFallback && pool) {
    try {
      const start = Date.now();
      const [b, s, p, g, l, cs, cat, a] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM bookings'),
        pool.query('SELECT COUNT(*) FROM services'),
        pool.query('SELECT COUNT(*) FROM promotions'),
        pool.query('SELECT COUNT(*) FROM gallery'),
        pool.query('SELECT COUNT(*) FROM schedule_locks'),
        pool.query('SELECT COUNT(*) FROM schedule_custom_slots'),
        pool.query('SELECT COUNT(*) FROM categories'),
        pool.query('SELECT COUNT(*) FROM admins')
      ]);
      pingMs = Date.now() - start;
      counts = {
        bookings: parseInt(b.rows[0].count, 10),
        services: parseInt(s.rows[0].count, 10),
        promotions: parseInt(p.rows[0].count, 10),
        gallery: parseInt(g.rows[0].count, 10),
        schedule_locks: parseInt(l.rows[0].count, 10),
        schedule_custom_slots: parseInt(cs.rows[0].count, 10),
        categories: parseInt(cat.rows[0].count, 10),
        admins: parseInt(a.rows[0].count, 10)
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
      categories: (store.categories || defaultCategories).length,
      admins: (store.admins || defaultAdmins).length
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

/**
 * Finds an admin by username (case-insensitive)
 */
export async function findAdminByUsername(username) {
  if (!username) return null;
  const cleanUsername = String(username).trim().toLowerCase();

  // Try Neon PostgreSQL first if connected
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM admins WHERE LOWER(username) = $1 AND active = true LIMIT 1',
        [cleanUsername]
      );
      if (res.rows.length > 0) {
        return res.rows[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error('[DB] Failed to query admin from Neon:', err.message);
      throw new Error('Database connection failed during authentication');
    }
  }

  // Fallback store
  const store = await readFallbackStore();
  const list = store.admins || [];
  return list.find(a => (a.username || '').toLowerCase() === cleanUsername && a.active !== false) || null;
}

/**
 * Updates an admin's password hash in the database
 */
export async function updateAdminPassword(id, passwordHash) {
  if (!id || !passwordHash) return false;

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query(
        'UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, id]
      );
      return true;
    } catch (err) {
      console.warn('[DB] Failed to update admin password in Neon, trying fallback:', err.message);
    }
  }

  const store = await readFallbackStore();
  if (!store.admins) store.admins = [];
  const idx = store.admins.findIndex(a => a.id === id || String(a.id) === String(id));
  if (idx !== -1) {
    store.admins[idx].password_hash = passwordHash;
    store.admins[idx].updated_at = new Date().toISOString();
    await writeFallbackStore(store);
    return true;
  }
  return false;
}

/**
 * Creates a new admin account with hashed password
 */
export async function createAdminUser({ username, password, fullName = 'Administrator', role = 'admin' }) {
  if (!username || !password) throw new Error('Username and password are required');
  const cleanUser = String(username).trim();
  const hash = await bcrypt.hash(String(password).trim(), 10);

  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        `INSERT INTO admins (username, password_hash, full_name, role, active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, username, full_name, role, active, created_at`,
        [cleanUser, hash, fullName, role]
      );
      return res.rows[0];
    } catch (err) {
      console.warn('[DB] Failed to create admin in Neon, trying fallback:', err.message);
    }
  }

  const store = await readFallbackStore();
  if (!store.admins) store.admins = [];
  const newAdmin = {
    id: Date.now(),
    username: cleanUser,
    password_hash: hash,
    full_name: fullName,
    role,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  store.admins.push(newAdmin);
  await writeFallbackStore(store);
  return {
    id: newAdmin.id,
    username: newAdmin.username,
    full_name: newAdmin.full_name,
    role: newAdmin.role,
    active: newAdmin.active,
    created_at: newAdmin.created_at
  };
}

/**
 * Returns all admin accounts (passwords excluded)
 */
export async function getAdminAccounts() {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        'SELECT id, username, full_name, role, active, created_at, updated_at FROM admins ORDER BY id ASC'
      );
      return res.rows;
    } catch (err) {
      console.warn('[DB] Failed to get admin accounts from Neon, trying fallback:', err.message);
    }
  }

  const store = await readFallbackStore();
  const list = store.admins || [];
  return list.map(a => ({
    id: a.id,
    username: a.username,
    full_name: a.full_name || a.fullName || 'Administrator',
    role: a.role || 'admin',
    active: a.active !== false,
    created_at: a.created_at,
    updated_at: a.updated_at
  }));
}

export { pool };
