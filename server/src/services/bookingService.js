import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';

/**
 * Saves a new booking into Neon PostgreSQL or fallback store
 */
export async function saveBooking(booking) {
  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO bookings (
          booking_id, name, phone, email, service, date, time, message, voucher, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const values = [
        booking.bookingId,
        booking.name,
        booking.phone,
        booking.email,
        booking.service,
        booking.date,
        booking.time,
        booking.message || '',
        booking.voucher || '',
        booking.status || 'pending',
        booking.createdAt || new Date().toISOString()
      ];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error('[DB] Failed to insert booking into Neon, saving to fallback:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.bookings.unshift(booking);
  await writeFallbackStore(store);
  return booking;
}

/**
 * Retrieves bookings with optional filtering, search, and pagination
 */
export async function getBookings({ status = 'all', search = '', limit = 100, offset = 0 } = {}) {
  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM bookings WHERE 1=1';
      const params = [];

      if (status && status !== 'all') {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(booking_id) LIKE $${params.length} OR LOWER(service) LIKE $${params.length})`;
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const res = await pool.query(query, params);

      // Total count query
      let countQuery = 'SELECT COUNT(*) FROM bookings WHERE 1=1';
      const countParams = [];
      if (status && status !== 'all') {
        countParams.push(status);
        countQuery += ` AND status = $${countParams.length}`;
      }
      if (search && search.trim()) {
        countParams.push(`%${search.trim().toLowerCase()}%`);
        countQuery += ` AND (LOWER(name) LIKE $${countParams.length} OR LOWER(phone) LIKE $${countParams.length} OR LOWER(email) LIKE $${countParams.length} OR LOWER(booking_id) LIKE $${countParams.length} OR LOWER(service) LIKE $${countParams.length})`;
      }
      const countRes = await pool.query(countQuery, countParams);

      return {
        bookings: res.rows.map(mapPostgresBooking),
        total: parseInt(countRes.rows[0].count, 10)
      };
    } catch (err) {
      console.error('[DB] Failed to fetch bookings from Neon, using fallback:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  let list = store.bookings;

  if (status && status !== 'all') {
    list = list.filter(b => (b.status || 'pending').toLowerCase() === status.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(b =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
      (b.service && b.service.toLowerCase().includes(q))
    );
  }

  const total = list.length;
  const paginated = list.slice(offset, offset + limit);

  return {
    bookings: paginated,
    total
  };
}

/**
 * Updates booking status (pending, confirmed, completed, cancelled)
 */
export async function updateBookingStatus(bookingId, status) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        'UPDATE bookings SET status = $1 WHERE booking_id = $2 OR id::text = $2 RETURNING *',
        [status, bookingId]
      );
      if (res.rows.length > 0) {
        return mapPostgresBooking(res.rows[0]);
      }
    } catch (err) {
      console.error('[DB] Failed to update booking status in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  const index = store.bookings.findIndex(
    b => b.bookingId === bookingId || String(b.id) === String(bookingId)
  );
  if (index !== -1) {
    store.bookings[index].status = status;
    await writeFallbackStore(store);
    return store.bookings[index];
  }
  return null;
}

/**
 * Deletes a booking by ID
 */
export async function deleteBooking(bookingId) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        'DELETE FROM bookings WHERE booking_id = $1 OR id::text = $1 RETURNING *',
        [bookingId]
      );
      return res.rowCount > 0;
    } catch (err) {
      console.error('[DB] Failed to delete booking in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  const initialLength = store.bookings.length;
  store.bookings = store.bookings.filter(
    b => b.bookingId !== bookingId && String(b.id) !== String(bookingId)
  );
  if (store.bookings.length !== initialLength) {
    await writeFallbackStore(store);
    return true;
  }
  return false;
}

/**
 * Calculates high-level booking KPIs & metrics
 */
export async function getBookingStats() {
  const { bookings, total } = await getBookings({ limit: 10000 });
  const todayStr = new Date().toISOString().slice(0, 10);

  let pending = 0;
  let confirmed = 0;
  let completed = 0;
  let cancelled = 0;
  let todayCount = 0;

  bookings.forEach(b => {
    const s = (b.status || 'pending').toLowerCase();
    if (s === 'pending') pending++;
    else if (s === 'confirmed') confirmed++;
    else if (s === 'completed') completed++;
    else if (s === 'cancelled') cancelled++;

    const createdDateStr = b.createdAt instanceof Date
      ? b.createdAt.toISOString()
      : (b.createdAt ? String(b.createdAt) : '');

    if (b.date === todayStr || (createdDateStr && createdDateStr.startsWith(todayStr))) {
      todayCount++;
    }
  });

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    today: todayCount
  };
}

/**
 * Normalizes PostgreSQL row to match frontend camelCase format
 */
function mapPostgresBooking(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    service: row.service,
    date: row.date,
    time: row.time,
    message: row.message,
    voucher: row.voucher,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || null)
  };
}
