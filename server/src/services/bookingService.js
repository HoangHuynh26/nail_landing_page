import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';

const CATEGORY_NAME_MAP = {
  biab: 'Builder Gel - BIAB',
  shellac: 'Shellac Nails',
  acrylic: 'Acrylic Nails',
  gelx: 'Gel X Extensions',
  sns: 'SNS Dipping',
  polish: 'Nail Polish',
  extra: 'Extra Services'
};

export function resolveCategoryName(category, serviceName) {
  if (category && CATEGORY_NAME_MAP[category.toLowerCase()]) {
    return CATEGORY_NAME_MAP[category.toLowerCase()];
  }
  if (category && category.trim()) {
    return category.trim();
  }
  if (serviceName) {
    const lower = serviceName.toLowerCase();
    if (lower.includes('biab')) return 'Builder Gel - BIAB';
    if (lower.includes('shellac')) return 'Shellac Nails';
    if (lower.includes('acrylic')) return 'Acrylic Nails';
    if (lower.includes('gel x') || lower.includes('gelx')) return 'Gel X Extensions';
    if (lower.includes('sns')) return 'SNS Dipping';
    if (lower.includes('polish')) return 'Nail Polish';
    if (lower.includes('extra') || lower.includes('take off') || lower.includes('repair')) return 'Extra Services';
  }
  return '';
}

/**
 * Saves a new booking into Neon PostgreSQL or fallback store
 */
export async function saveBooking(booking) {
  const guests = parseInt(booking.guests, 10) || 1;
  const price = booking.price != null ? parseFloat(booking.price) : 0;
  const originalPrice = booking.originalPrice != null ? parseFloat(booking.originalPrice) : price;
  const category = resolveCategoryName(booking.category, booking.service);

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO bookings (
          booking_id, name, phone, email, service, category, date, time, message, voucher, status, guests, price, original_price, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *;
      `;
      const values = [
        booking.bookingId,
        booking.name,
        booking.phone,
        booking.email,
        booking.service,
        category,
        booking.date,
        booking.time,
        booking.message || '',
        booking.voucher || '',
        booking.status || 'pending',
        guests,
        price,
        originalPrice,
        booking.createdAt || new Date().toISOString()
      ];
      const res = await pool.query(query, values);
      return mapPostgresBooking(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to insert booking into Neon, saving to fallback:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  const fallbackBooking = {
    ...booking,
    category,
    guests,
    price,
    originalPrice
  };
  store.bookings.unshift(fallbackBooking);
  await writeFallbackStore(store);
  return fallbackBooking;
}

/**
 * Retrieves bookings with optional filtering, search, and pagination
 */
export async function getBookings({ status = 'all', search = '', year = '', month = '', day = '', limit = 100, offset = 0 } = {}) {
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

      // Year & Month & Day Filter (Strictly matches the Appointment Date `date`)
      const effectiveDateExpr = "TRIM(COALESCE(NULLIF(date, ''), TO_CHAR(created_at, 'YYYY-MM-DD')))";

      if (year && year !== 'all') {
        params.push(String(year));
        query += ` AND SUBSTRING(${effectiveDateExpr}, 1, 4) = $${params.length}`;
        countParams.push(String(year));
        countQuery += ` AND SUBSTRING(${effectiveDateExpr}, 1, 4) = $${countParams.length}`;
      }

      if (month && month !== 'all') {
        const m = String(month).padStart(2, '0');
        params.push(m);
        query += ` AND SUBSTRING(${effectiveDateExpr}, 6, 2) = $${params.length}`;
        countParams.push(m);
        countQuery += ` AND SUBSTRING(${effectiveDateExpr}, 6, 2) = $${countParams.length}`;
      }

      if (day && day !== 'all') {
        const d = String(day).padStart(2, '0');
        params.push(d);
        query += ` AND SUBSTRING(${effectiveDateExpr}, 9, 2) = $${params.length}`;
        countParams.push(d);
        countQuery += ` AND SUBSTRING(${effectiveDateExpr}, 9, 2) = $${countParams.length}`;
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

  if (year && year !== 'all') {
    const yStr = String(year);
    list = list.filter(b => {
      const parts = parseBookingDateParts(b.date) || parseBookingDateParts(b.createdAt);
      return parts && parts.year === yStr;
    });
  }

  if (month && month !== 'all') {
    const mStr = String(month).padStart(2, '0');
    list = list.filter(b => {
      const parts = parseBookingDateParts(b.date) || parseBookingDateParts(b.createdAt);
      return parts && parts.month === mStr;
    });
  }

  if (day && day !== 'all') {
    const dStr = String(day).padStart(2, '0');
    list = list.filter(b => {
      const parts = parseBookingDateParts(b.date) || parseBookingDateParts(b.createdAt);
      return parts && parts.day === dStr;
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
export async function getBookingStats({ day = '', month = '', year = '' } = {}) {
  const { bookings, total } = await getBookings({ day, month, year, limit: 10000 });
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  let pending = 0;
  let confirmed = 0;
  let completed = 0;
  let cancelled = 0;
  let todayCount = 0;

  let totalRevenue = 0;
  let completedRevenue = 0;
  let confirmedRevenue = 0;
  let pendingRevenue = 0;
  let todayRevenue = 0;
  let totalGuests = 0;

  bookings.forEach(b => {
    const s = (b.status || 'pending').toLowerCase();
    const guests = parseInt(b.guests, 10) || 1;

    let price = b.price != null && !isNaN(parseFloat(b.price)) ? parseFloat(b.price) : 0;
    if (price === 0 && b.service) {
      const found = defaultServices.find(ds =>
        ds.id === b.serviceId ||
        (ds.name && ds.name.toLowerCase() === b.service.toLowerCase()) ||
        (ds.name_en && ds.name_en.toLowerCase() === b.service.toLowerCase())
      );
      if (found && found.price) {
        price = parseFloat(found.price) * guests;
      }
    }

    if (s !== 'cancelled') {
      totalGuests += guests;
    }

    if (s === 'pending') {
      pending++;
      pendingRevenue += price;
      totalRevenue += price;
    } else if (s === 'confirmed') {
      confirmed++;
      confirmedRevenue += price;
      totalRevenue += price;
    } else if (s === 'completed') {
      completed++;
      completedRevenue += price;
      totalRevenue += price;
    } else if (s === 'cancelled') {
      cancelled++;
    }

    // Today's appointment is strictly based on appointment date (b.date)
    if (b.date === todayStr) {
      todayCount++;
      if (s !== 'cancelled') {
        todayRevenue += price;
      }
    }
  });

  const activeBookingsCount = pending + confirmed + completed;
  const avgBookingValue = activeBookingsCount > 0 ? Math.round((totalRevenue / activeBookingsCount) * 100) / 100 : 0;

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    today: todayCount,
    totalGuests,
    revenue: {
      total: Math.round(totalRevenue * 100) / 100,
      completed: Math.round(completedRevenue * 100) / 100,
      confirmed: Math.round(confirmedRevenue * 100) / 100,
      pending: Math.round(pendingRevenue * 100) / 100,
      today: Math.round(todayRevenue * 100) / 100,
      average: avgBookingValue
    }
  };
}

/**
 * Normalizes PostgreSQL row to match frontend camelCase format
 */
function mapPostgresBooking(row) {
  const category = resolveCategoryName(row.category, row.service);

  return {
    id: row.id,
    bookingId: row.booking_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    service: row.service,
    category,
    date: row.date,
    time: row.time,
    message: row.message,
    voucher: row.voucher,
    status: row.status,
    guests: row.guests != null ? parseInt(row.guests, 10) : 1,
    price: row.price != null ? (Number(row.price) % 1 === 0 ? Math.round(Number(row.price)) : parseFloat(row.price)) : null,
    originalPrice: row.original_price != null ? (Number(row.original_price) % 1 === 0 ? Math.round(Number(row.original_price)) : parseFloat(row.original_price)) : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || null)
  };
}

/**
 * Robustly parses a date string or timestamp into year, month, and day parts
 */
export function parseBookingDateParts(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    return {
      year: ymdMatch[1],
      month: ymdMatch[2].padStart(2, '0'),
      day: ymdMatch[3].padStart(2, '0')
    };
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return {
      year: dmyMatch[3],
      month: dmyMatch[2].padStart(2, '0'),
      day: dmyMatch[1].padStart(2, '0')
    };
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return {
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      day: String(d.getDate()).padStart(2, '0')
    };
  }
  return null;
}
