import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultServices } from '../data/defaultServices.js';
import { defaultPromotions } from '../data/defaultPromotions.js';

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
        bookings: [],
        services: defaultServices,
        promotions: defaultPromotions
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
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading fallback store:', err.message);
    return { bookings: [], services: defaultServices, promotions: defaultPromotions };
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
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      booking_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      service VARCHAR(255) NOT NULL,
      date VARCHAR(50) NOT NULL,
      time VARCHAR(50) NOT NULL,
      message TEXT,
      voucher VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(100) PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      name_vi VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      description_vi TEXT,
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
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      badge VARCHAR(100) DEFAULT 'Holiday Special',
      image_url TEXT NOT NULL,
      voucher_code VARCHAR(50) NOT NULL,
      discount_text VARCHAR(100) NOT NULL,
      active BOOLEAN DEFAULT true,
      start_date VARCHAR(50),
      end_date VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await client.query(ddl);
}

/**
 * Seeds initial services & promotions if empty in Neon Postgres
 */
async function seedPostgresIfEmpty(client) {
  // Check services
  const servRes = await client.query('SELECT COUNT(*) FROM services');
  if (parseInt(servRes.rows[0].count, 10) === 0) {
    console.log('[DB] Seeding default services into Neon PostgreSQL...');
    for (const s of defaultServices) {
      await client.query(
        `INSERT INTO services (id, category, name_vi, name_en, description_vi, description_en, duration, price, price_prefix, featured, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.category, s.name_vi, s.name_en, s.description_vi, s.description_en, s.duration, s.price, s.price_prefix || '', s.featured || false, s.active ?? true, s.sort_order || 0]
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
  let counts = { bookings: 0, services: 0, promotions: 0 };
  let pingMs = dbState.lastPingMs;

  if (!dbState.usingFallback && pool) {
    try {
      const start = Date.now();
      const [b, s, p] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM bookings'),
        pool.query('SELECT COUNT(*) FROM services'),
        pool.query('SELECT COUNT(*) FROM promotions')
      ]);
      pingMs = Date.now() - start;
      counts = {
        bookings: parseInt(b.rows[0].count, 10),
        services: parseInt(s.rows[0].count, 10),
        promotions: parseInt(p.rows[0].count, 10)
      };
    } catch (err) {
      console.warn('[DB] Failed to get Neon counts, falling back:', err.message);
    }
  } else {
    const store = await readFallbackStore();
    counts = {
      bookings: store.bookings.length,
      services: store.services.length,
      promotions: store.promotions.length
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
