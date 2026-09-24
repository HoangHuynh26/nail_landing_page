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
export async function getBookings({ status = 'all', search = '', year = '', month = '', limit = 100, offset = 0 } = {}) {
  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM bookings WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) FROM bookings WHERE 1=1';
      const params = [];
      const countParams = [];

      if (status && status !== 'all') {
        params.push(status);
        query += ` AND status = $${params.length}`;
        countParams.push(status);
        countQuery += ` AND status = $${countParams.length}`;
      }

      if (search && search.trim()) {
        const s = `%${search.trim().toLowerCase()}%`;
        params.push(s);
        query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(booking_id) LIKE $${params.length} OR LOWER(service) LIKE $${params.length})`;
        countParams.push(s);
        countQuery += ` AND (LOWER(name) LIKE $${countParams.length} OR LOWER(phone) LIKE $${countParams.length} OR LOWER(email) LIKE $${countParams.length} OR LOWER(booking_id) LIKE $${countParams.length} OR LOWER(service) LIKE $${countParams.length})`;
      }

      // Year & Month Filter
      if (year && year !== 'all' && month && month !== 'all') {
        const ym = `${year}-${month.padStart(2, '0')}`;
        params.push(`${ym}%`, ym);
        query += ` AND (date LIKE $${params.length - 1} OR TO_CHAR(created_at, 'YYYY-MM') = $${params.length})`;
        countParams.push(`${ym}%`, ym);
        countQuery += ` AND (date LIKE $${countParams.length - 1} OR TO_CHAR(created_at, 'YYYY-MM') = $${countParams.length})`;
      } else if (year && year !== 'all') {
        const y = String(year);
        params.push(`${y}%`, y);
        query += ` AND (date LIKE $${params.length - 1} OR TO_CHAR(created_at, 'YYYY') = $${params.length})`;
        countParams.push(`${y}%`, y);
        countQuery += ` AND (date LIKE $${countParams.length - 1} OR TO_CHAR(created_at, 'YYYY') = $${countParams.length})`;
      } else if (month && month !== 'all') {
        const m = month.padStart(2, '0');
        params.push(`%-${m}-%`, m);
        query += ` AND (date LIKE $${params.length - 1} OR TO_CHAR(created_at, 'MM') = $${params.length})`;
        countParams.push(`%-${m}-%`, m);
        countQuery += ` AND (date LIKE $${countParams.length - 1} OR TO_CHAR(created_at, 'MM') = $${countParams.length})`;
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const res = await pool.query(query, params);
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

  if (year && year !== 'all' && month && month !== 'all') {
    const ym = `${year}-${month.padStart(2, '0')}`;
    list = list.filter(b => {
      const bDate = b.date || '';
      const bCreated = b.createdAt ? String(b.createdAt) : '';
      return bDate.startsWith(ym) || bCreated.startsWith(ym);
    });
  } else if (year && year !== 'all') {
    const y = String(year);
    list = list.filter(b => {
      const bDate = b.date || '';
      const bCreated = b.createdAt ? String(b.createdAt) : '';
      return bDate.startsWith(y) || bCreated.startsWith(y);
    });
  } else if (month && month !== 'all') {
    const m = month.padStart(2, '0');
    list = list.filter(b => {
      const bDate = b.date || '';
      const bCreated = b.createdAt ? String(b.createdAt) : '';
      const dateParts = bDate.split('-');
      const createdParts = bCreated.slice(0, 10).split('-');
      return (dateParts.length >= 2 && dateParts[1] === m) || (createdParts.length >= 2 && createdParts[1] === m);
    });
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
