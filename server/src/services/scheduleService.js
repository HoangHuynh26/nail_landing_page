import { pool, dbState, readFallbackStore, writeFallbackStore } from '../db/db.js';

/**
 * Normalizes time string to standard "hh:mm AM/PM" (e.g. "12:45 PM", "09:30 AM")
 */
export function normalizeSlotTime(str) {
  if (!str) return '';
  const clean = str.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return clean;
  const h = String(parseInt(match[1], 10)).padStart(2, '0');
  const m = match[2];
  const p = match[3].toUpperCase();
  return `${h}:${m} ${p}`;
}

/**
 * Converts a slot string like "09:30 AM" or "02:15 PM" to total minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length < 2) return 0;
  const [tPart, meridiem] = parts;
  const [hStr, mStr] = tPart.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  if (meridiem.toUpperCase() === 'PM' && h < 12) h += 12;
  if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Returns standard operating hours for Perth by day of week:
 * - Sunday: 11:00 AM - 04:30 PM
 * - Thursday: 09:00 AM - 07:00 PM (Late night shopping)
 * - Mon, Tue, Wed, Fri, Sat: 09:00 AM - 05:30 PM
 */
export function getStandardOperatingHours(dateStr) {
  if (!dateStr) return { openTime: '09:00 AM', closeTime: '05:30 PM' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun, 4 = Thu
  if (dayOfWeek === 0) {
    return { openTime: '11:00 AM', closeTime: '04:30 PM' };
  }
  if (dayOfWeek === 4) {
    return { openTime: '09:00 AM', closeTime: '07:00 PM' };
  }
  return { openTime: '09:00 AM', closeTime: '05:30 PM' };
}

/**
 * Normalizes PostgreSQL row for schedule_locks
 */
function mapLock(row) {
  return {
    id: row.id,
    date: row.date,
    slot: normalizeSlotTime(row.slot || ''),
    reason: row.reason || '',
    createdAt: row.created_at
  };
}

/**
 * Normalizes PostgreSQL row for schedule_custom_slots
 */
function mapCustomSlot(row) {
  return {
    id: row.id,
    date: row.date,
    slot: normalizeSlotTime(row.slot || ''),
    action: row.action || 'add',
    note: row.note || '',
    createdAt: row.created_at
  };
}

/**
 * Normalizes PostgreSQL row for schedule_date_hours
 */
function mapDateHours(row) {
  return {
    id: row.id,
    date: row.date,
    openTime: normalizeSlotTime(row.open_time),
    closeTime: normalizeSlotTime(row.close_time),
    isClosed: Boolean(row.is_closed),
    note: row.note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Get all customized date hours with optional date filter
 */
export async function getAllDateHours(dateFilter = null) {
  let rawHours = [];

  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM schedule_date_hours';
      const params = [];
      if (dateFilter) {
        query += ' WHERE date = $1';
        params.push(dateFilter);
      }
      query += ' ORDER BY date ASC';
      const res = await pool.query(query, params);
      rawHours = res.rows.map(mapDateHours);
    } catch (err) {
      console.error('[DB] Failed to query schedule_date_hours from Neon:', err.message);
    }
  }

  if (rawHours.length === 0 && dbState.usingFallback) {
    const store = await readFallbackStore();
    const list = store.schedule_date_hours || [];
    rawHours = dateFilter ? list.filter(h => h.date === dateFilter) : list;
  }

  return rawHours;
}

/**
 * Get effective operating hours for a date
 */
export async function getDateOperatingHours(dateStr) {
  const std = getStandardOperatingHours(dateStr);
  const allCustom = await getAllDateHours(dateStr);
  const custom = allCustom.find(c => c.date === dateStr);

  if (custom) {
    return {
      date: dateStr,
      openTime: custom.openTime,
      closeTime: custom.closeTime,
      isClosed: custom.isClosed,
      note: custom.note,
      isCustom: true
    };
  }

  return {
    date: dateStr,
    openTime: std.openTime,
    closeTime: std.closeTime,
    isClosed: false,
    note: '',
    isCustom: false
  };
}

/**
 * Set or adjust operating hours for a specific date (overtime or early open)
 */
export async function setDateOperatingHours(date, openTime, closeTime, note = '', isClosed = false) {
  const cleanDate = date.trim();
  const cleanOpen = normalizeSlotTime(openTime);
  const cleanClose = normalizeSlotTime(closeTime);
  const cleanNote = (note || '').trim();
  const cleanClosed = Boolean(isClosed);

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO schedule_date_hours (date, open_time, close_time, is_closed, note, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (date)
        DO UPDATE SET
          open_time = EXCLUDED.open_time,
          close_time = EXCLUDED.close_time,
          is_closed = EXCLUDED.is_closed,
          note = EXCLUDED.note,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const res = await pool.query(query, [cleanDate, cleanOpen, cleanClose, cleanClosed, cleanNote]);
      return mapDateHours(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to set date hours in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_date_hours = store.schedule_date_hours || [];
  const existingIdx = store.schedule_date_hours.findIndex(h => h.date === cleanDate);

  const obj = {
    id: existingIdx >= 0 ? store.schedule_date_hours[existingIdx].id : Date.now(),
    date: cleanDate,
    openTime: cleanOpen,
    closeTime: cleanClose,
    isClosed: cleanClosed,
    note: cleanNote,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    store.schedule_date_hours[existingIdx] = obj;
  } else {
    store.schedule_date_hours.push(obj);
  }

  await writeFallbackStore(store);
  return obj;
}

/**
 * Resets operating hours for a date back to standard defaults
 */
export async function resetDateOperatingHours(date) {
  const cleanDate = date.trim();

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query('DELETE FROM schedule_date_hours WHERE date = $1', [cleanDate]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to reset date hours in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_date_hours = (store.schedule_date_hours || []).filter(h => h.date !== cleanDate);
  await writeFallbackStore(store);
  return true;
}

/**
 * Get all customized slots (added / removed) with optional date filter
 * Formats data into:
 * { [date]: { added: ['08:30 AM', ...], removed: ['01:00 PM', ...], notes: { [slot]: 'note' } } }
 */
export async function getCustomSlots(dateFilter = null) {
  let rawCustom = [];

  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM schedule_custom_slots';
      const params = [];
      if (dateFilter) {
        query += ' WHERE date = $1';
        params.push(dateFilter);
      }
      query += ' ORDER BY date ASC, slot ASC';
      const res = await pool.query(query, params);
      rawCustom = res.rows.map(mapCustomSlot);
    } catch (err) {
      console.error('[DB] Failed to query schedule_custom_slots from Neon:', err.message);
    }
  }

  if (rawCustom.length === 0 && dbState.usingFallback) {
    const store = await readFallbackStore();
    const customList = store.schedule_custom_slots || [];
    rawCustom = dateFilter ? customList.filter(c => c.date === dateFilter) : customList;
  }

  const customSlots = {};

  for (const item of rawCustom) {
    const d = item.date;
    const s = normalizeSlotTime(item.slot || '');
    const action = item.action || 'add';

    if (!customSlots[d]) {
      customSlots[d] = { added: [], removed: [], notes: {} };
    }

    if (action === 'add') {
      if (!customSlots[d].added.includes(s)) customSlots[d].added.push(s);
    } else if (action === 'remove') {
      if (!customSlots[d].removed.includes(s)) customSlots[d].removed.push(s);
    }

    if (item.note) {
      customSlots[d].notes[s] = item.note;
    }
  }

  return customSlots;
}

/**
 * Adds a custom time slot for a specific date
 */
export async function addCustomSlot(date, slot, note = '') {
  const cleanDate = date.trim();
  const cleanSlot = normalizeSlotTime(slot);
  const cleanNote = (note || '').trim();

  if (!dbState.usingFallback && pool) {
    try {
      // If this slot was previously hidden, un-hide it
      await pool.query("DELETE FROM schedule_custom_slots WHERE date = $1 AND slot = $2 AND action = 'remove'", [cleanDate, cleanSlot]);

      const query = `
        INSERT INTO schedule_custom_slots (date, slot, action, note)
        VALUES ($1, $2, 'add', $3)
        ON CONFLICT (date, slot, action)
        DO UPDATE SET note = EXCLUDED.note, created_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const res = await pool.query(query, [cleanDate, cleanSlot, cleanNote]);
      return mapCustomSlot(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to add custom slot in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.schedule_custom_slots = (store.schedule_custom_slots || []).filter(
    c => !(c.date === cleanDate && normalizeSlotTime(c.slot) === cleanSlot)
  );

  const newObj = {
    id: Date.now(),
    date: cleanDate,
    slot: cleanSlot,
    action: 'add',
    note: cleanNote,
    createdAt: new Date().toISOString()
  };

  store.schedule_custom_slots.push(newObj);
  await writeFallbackStore(store);
  return newObj;
}

/**
 * Removes a custom added time slot
 */
export async function removeCustomSlot(date, slot) {
  const cleanDate = date.trim();
  const cleanSlot = normalizeSlotTime(slot);

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query("DELETE FROM schedule_custom_slots WHERE date = $1 AND slot = $2 AND action = 'add'", [cleanDate, cleanSlot]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to remove custom slot in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_custom_slots = (store.schedule_custom_slots || []).filter(
    c => !(c.date === cleanDate && normalizeSlotTime(c.slot) === cleanSlot && c.action === 'add')
  );
  await writeFallbackStore(store);
  return true;
}

/**
 * Hides / disables a default time slot for a specific date
 */
export async function hideDefaultSlot(date, slot, note = '') {
  const cleanDate = date.trim();
  const cleanSlot = normalizeSlotTime(slot);
  const cleanNote = (note || 'Hidden by salon owner').trim();

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query("DELETE FROM schedule_custom_slots WHERE date = $1 AND slot = $2 AND action = 'add'", [cleanDate, cleanSlot]);

      const query = `
        INSERT INTO schedule_custom_slots (date, slot, action, note)
        VALUES ($1, $2, 'remove', $3)
        ON CONFLICT (date, slot, action)
        DO UPDATE SET note = EXCLUDED.note, created_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const res = await pool.query(query, [cleanDate, cleanSlot, cleanNote]);
      return mapCustomSlot(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to hide default slot in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_custom_slots = (store.schedule_custom_slots || []).filter(
    c => !(c.date === cleanDate && normalizeSlotTime(c.slot) === cleanSlot)
  );

  const newObj = {
    id: Date.now(),
    date: cleanDate,
    slot: cleanSlot,
    action: 'remove',
    note: cleanNote,
    createdAt: new Date().toISOString()
  };

  store.schedule_custom_slots.push(newObj);
  await writeFallbackStore(store);
  return newObj;
}

/**
 * Restores a previously hidden default time slot
 */
export async function restoreDefaultSlot(date, slot) {
  const cleanDate = date.trim();
  const cleanSlot = normalizeSlotTime(slot);

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query("DELETE FROM schedule_custom_slots WHERE date = $1 AND slot = $2 AND action = 'remove'", [cleanDate, cleanSlot]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to restore default slot in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_custom_slots = (store.schedule_custom_slots || []).filter(
    c => !(c.date === cleanDate && normalizeSlotTime(c.slot) === cleanSlot && c.action === 'remove')
  );
  await writeFallbackStore(store);
  return true;
}

/**
 * Resets all custom slots (added or removed) for a date back to standard defaults
 */
export async function resetDateSlots(date) {
  const cleanDate = date.trim();

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query("DELETE FROM schedule_custom_slots WHERE date = $1", [cleanDate]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to reset date slots in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_custom_slots = (store.schedule_custom_slots || []).filter(
    c => c.date !== cleanDate
  );
  await writeFallbackStore(store);
  return true;
}

/**
 * Get all schedule locks & custom slots (with optional date filter)
 * Formats data into { locks, lockedDates, lockedSlots, dateReasons, slotReasons, customSlots, dateHours }
 */
export async function getScheduleLocks(dateFilter = null) {
  let rawLocks = [];

  if (!dbState.usingFallback && pool) {
    try {
      let query = 'SELECT * FROM schedule_locks';
      const params = [];
      if (dateFilter) {
        query += ' WHERE date = $1';
        params.push(dateFilter);
      }
      query += ' ORDER BY date ASC, slot ASC';
      const res = await pool.query(query, params);
      rawLocks = res.rows.map(mapLock);
    } catch (err) {
      console.error('[DB] Failed to query schedule_locks from Neon:', err.message);
    }
  }

  if (rawLocks.length === 0 && dbState.usingFallback) {
    const store = await readFallbackStore();
    const locks = store.schedule_locks || [];
    rawLocks = dateFilter ? locks.filter(l => l.date === dateFilter) : locks;
  }

  // Format into convenient structures for fast lookup
  const lockedDates = [];
  const lockedSlots = {}; // { '2026-09-26': ['09:30 AM', '10:15 AM'] }
  const slotReasons = {}; // { '2026-09-26_10:15 AM': 'Walk-in reserved' }
  const dateReasons = {}; // { '2026-09-26': 'Public Holiday' }

  for (const item of rawLocks) {
    const d = item.date;
    const s = normalizeSlotTime(item.slot || '');

    if (!s || s.toUpperCase() === 'ALL') {
      if (!lockedDates.includes(d)) lockedDates.push(d);
      dateReasons[d] = item.reason || 'Salon Closed / Locked';
    } else {
      if (!lockedSlots[d]) lockedSlots[d] = [];
      if (!lockedSlots[d].includes(s)) lockedSlots[d].push(s);
      slotReasons[`${d}_${s}`] = item.reason || 'Reserved / Locked';
    }
  }

  // Also query custom slots
  const customSlots = await getCustomSlots(dateFilter);

  // Also query date hours overrides
  const rawDateHours = await getAllDateHours(dateFilter);
  const dateHours = {};
  for (const dh of rawDateHours) {
    dateHours[dh.date] = {
      openTime: dh.openTime,
      closeTime: dh.closeTime,
      isClosed: dh.isClosed,
      note: dh.note,
      isCustom: true
    };
    if (dh.isClosed && !lockedDates.includes(dh.date)) {
      lockedDates.push(dh.date);
      dateReasons[dh.date] = dh.note || 'Closed by Salon';
    }
  }

  if (dateFilter && !dateHours[dateFilter]) {
    dateHours[dateFilter] = await getDateOperatingHours(dateFilter);
  }

  return {
    locks: rawLocks,
    lockedDates,
    lockedSlots,
    dateReasons,
    slotReasons,
    customSlots,
    dateHours
  };
}

/**
 * Check if a date or a specific slot on that date is locked or out of operating hours
 */
export async function isDateOrSlotLocked(date, slot = '') {
  if (!date) return false;
  const { lockedDates, lockedSlots, customSlots, dateHours } = await getScheduleLocks(date);

  // 1. Entire day is locked
  if (lockedDates.includes(date)) return true;
  if (dateHours[date]?.isClosed) return true;

  if (slot) {
    const cleanSlot = normalizeSlotTime(slot);

    // 2. Specific time slot is locked by admin
    const dayLocked = (lockedSlots[date] || []).map(normalizeSlotTime);
    if (dayLocked.includes(cleanSlot)) {
      return true;
    }

    // 3. Slot was hidden / removed by admin for this date
    const dayRemoved = (customSlots[date]?.removed || []).map(normalizeSlotTime);
    if (dayRemoved.includes(cleanSlot)) {
      return true;
    }

    // 4. Check if slot falls outside operating hours for this date
    const effectiveHours = dateHours[date] || await getDateOperatingHours(date);
    const slotMin = parseTimeToMinutes(cleanSlot);
    const openMin = parseTimeToMinutes(effectiveHours.openTime);
    const closeMin = parseTimeToMinutes(effectiveHours.closeTime);

    if (slotMin < openMin || slotMin > closeMin) {
      return true;
    }
  }

  return false;
}

/**
 * Locks an entire date
 */
export async function lockDate(date, reason = '') {
  const cleanDate = date.trim();
  const cleanReason = (reason || 'Closed / Locked by Salon').trim();

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO schedule_locks (date, slot, reason)
        VALUES ($1, '', $2)
        ON CONFLICT (date, slot)
        DO UPDATE SET reason = EXCLUDED.reason, created_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const res = await pool.query(query, [cleanDate, cleanReason]);
      return mapLock(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to lock date in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.schedule_locks = store.schedule_locks || [];
  const existingIdx = store.schedule_locks.findIndex(l => l.date === cleanDate && (!l.slot || l.slot === ''));

  const lockObj = {
    id: existingIdx >= 0 ? store.schedule_locks[existingIdx].id : Date.now(),
    date: cleanDate,
    slot: '',
    reason: cleanReason,
    createdAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    store.schedule_locks[existingIdx] = lockObj;
  } else {
    store.schedule_locks.push(lockObj);
  }

  await writeFallbackStore(store);
  return lockObj;
}

/**
 * Unlocks an entire date
 */
export async function unlockDate(date) {
  const cleanDate = date.trim();

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query("DELETE FROM schedule_locks WHERE date = $1 AND (slot = '' OR slot = 'ALL')", [cleanDate]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to unlock date in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_locks = (store.schedule_locks || []).filter(l => !(l.date === cleanDate && (!l.slot || l.slot === '' || l.slot === 'ALL')));
  await writeFallbackStore(store);
  return true;
}

/**
 * Locks a specific time slot on a date
 */
export async function lockSlot(date, slot, reason = '') {
  const cleanDate = date.trim();
  const cleanSlot = normalizeSlotTime(slot);
  const cleanReason = (reason || 'Reserved / Locked').trim();

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO schedule_locks (date, slot, reason)
        VALUES ($1, $2, $3)
        ON CONFLICT (date, slot)
        DO UPDATE SET reason = EXCLUDED.reason, created_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const res = await pool.query(query, [cleanDate, cleanSlot, cleanReason]);
      return mapLock(res.rows[0]);
    } catch (err) {
      console.error('[DB] Failed to lock slot in Neon:', err.message);
    }
  }

  // Fallback
  const store = await readFallbackStore();
  store.schedule_locks = store.schedule_locks || [];
  const existingIdx = store.schedule_locks.findIndex(l => l.date === cleanDate && normalizeSlotTime(l.slot) === cleanSlot);

  const lockObj = {
    id: existingIdx >= 0 ? store.schedule_locks[existingIdx].id : Date.now(),
    date: cleanDate,
    slot: cleanSlot,
    reason: cleanReason,
    createdAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    store.schedule_locks[existingIdx] = lockObj;
  } else {
    store.schedule_locks.push(lockObj);
  }

  await writeFallbackStore(store);
  return lockObj;
}

/**
 * Unlocks a specific time slot on a date
 */
export async function unlockSlot(date, slot) {
  const cleanDate = date.trim();
  const cleanSlot = normalizeSlotTime(slot);

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query('DELETE FROM schedule_locks WHERE date = $1 AND slot = $2', [cleanDate, cleanSlot]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to unlock slot in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_locks = (store.schedule_locks || []).filter(l => !(l.date === cleanDate && normalizeSlotTime(l.slot) === cleanSlot));
  await writeFallbackStore(store);
  return true;
}

/**
 * Batch locks multiple slots efficiently in a single query
 */
export async function lockSlotsBatch(date, slots, reason = '') {
  const cleanDate = date.trim();
  const cleanReason = (reason || 'Reserved / Locked').trim();
  const cleanSlots = Array.from(new Set(slots.map(normalizeSlotTime).filter(Boolean)));

  if (cleanSlots.length === 0) return [];

  if (!dbState.usingFallback && pool) {
    try {
      const query = `
        INSERT INTO schedule_locks (date, slot, reason)
        SELECT $1, unnest($2::text[]), $3
        ON CONFLICT (date, slot)
        DO UPDATE SET reason = EXCLUDED.reason, created_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(query, [cleanDate, cleanSlots, cleanReason]);
      return cleanSlots;
    } catch (err) {
      console.error('[DB] Failed to batch lock slots in Neon:', err.message);
    }
  }

  // Fallback store
  const store = await readFallbackStore();
  store.schedule_locks = store.schedule_locks || [];
  for (const cleanSlot of cleanSlots) {
    const existingIdx = store.schedule_locks.findIndex(l => l.date === cleanDate && normalizeSlotTime(l.slot) === cleanSlot);
    const lockObj = {
      id: existingIdx >= 0 ? store.schedule_locks[existingIdx].id : Date.now() + Math.random(),
      date: cleanDate,
      slot: cleanSlot,
      reason: cleanReason,
      createdAt: new Date().toISOString()
    };
    if (existingIdx >= 0) {
      store.schedule_locks[existingIdx] = lockObj;
    } else {
      store.schedule_locks.push(lockObj);
    }
  }
  await writeFallbackStore(store);
  return cleanSlots;
}

/**
 * Batch unlocks multiple slots efficiently in a single query
 */
export async function unlockSlotsBatch(date, slots) {
  const cleanDate = date.trim();
  const cleanSlots = Array.from(new Set(slots.map(normalizeSlotTime).filter(Boolean)));

  if (cleanSlots.length === 0) return true;

  if (!dbState.usingFallback && pool) {
    try {
      await pool.query('DELETE FROM schedule_locks WHERE date = $1 AND slot = ANY($2::text[])', [cleanDate, cleanSlots]);
      return true;
    } catch (err) {
      console.error('[DB] Failed to batch unlock slots in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  store.schedule_locks = (store.schedule_locks || []).filter(
    l => !(l.date === cleanDate && cleanSlots.includes(normalizeSlotTime(l.slot)))
  );
  await writeFallbackStore(store);
  return true;
}

/**
 * Toggles slot lock status
 */
export async function toggleSlotLock(date, slot, reason = '') {
  const isLocked = await isDateOrSlotLocked(date, slot);
  if (isLocked) {
    await unlockSlot(date, slot);
    return { locked: false, date, slot };
  } else {
    const locked = await lockSlot(date, slot, reason);
    return { locked: true, date, slot, reason: locked?.reason };
  }
}

/**
 * Toggles whole date lock status
 */
export async function toggleDateLock(date, reason = '') {
  const { lockedDates } = await getScheduleLocks(date);
  const isLocked = lockedDates.includes(date);

  if (isLocked) {
    await unlockDate(date);
    return { locked: false, date };
  } else {
    const locked = await lockDate(date, reason);
    return { locked: true, date, reason: locked?.reason };
  }
}

/**
 * Get active bookings for a date so Admin can view booked slots
 */
export async function getBookingsByDate(date) {
  if (!dbState.usingFallback && pool) {
    try {
      const res = await pool.query(
        "SELECT id, booking_id, name, phone, email, service, category, date, time, message, voucher, status, guests, price, original_price, created_at FROM bookings WHERE date = $1 AND status != 'cancelled' ORDER BY created_at DESC",
        [date]
      );
      return res.rows.map(row => ({
        id: row.id,
        booking_id: row.booking_id || row.id,
        bookingId: row.booking_id || row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        service: row.service,
        category: row.category,
        date: row.date,
        time: row.time,
        status: row.status,
        guests: row.guests != null ? parseInt(row.guests, 10) : 1,
        price: row.price != null ? (Number(row.price) % 1 === 0 ? Math.round(Number(row.price)) : parseFloat(row.price)) : null,
        originalPrice: row.original_price != null ? (Number(row.original_price) % 1 === 0 ? Math.round(Number(row.original_price)) : parseFloat(row.original_price)) : null,
        notes: row.message || '',
        message: row.message || '',
        voucher: row.voucher || '',
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || null)
      }));
    } catch (err) {
      console.error('[DB] Failed to query bookings by date in Neon:', err.message);
    }
  }

  const store = await readFallbackStore();
  return (store.bookings || [])
    .filter(b => b.date === date && b.status !== 'cancelled')
    .map(b => ({
      id: b.id,
      booking_id: b.bookingId || b.id,
      bookingId: b.bookingId || b.id,
      name: b.name,
      phone: b.phone,
      email: b.email,
      service: b.service,
      category: b.category,
      date: b.date,
      time: b.time,
      status: b.status,
      guests: b.guests != null ? parseInt(b.guests, 10) : 1,
      price: b.price != null ? (Number(b.price) % 1 === 0 ? Math.round(Number(b.price)) : parseFloat(b.price)) : null,
      originalPrice: b.originalPrice != null ? (Number(b.originalPrice) % 1 === 0 ? Math.round(Number(b.originalPrice)) : parseFloat(b.originalPrice)) : null,
      notes: b.notes || b.message || '',
      message: b.message || b.notes || '',
      voucher: b.voucher || b.discount_code || '',
      created_at: b.createdAt || b.created_at
    }));
}
