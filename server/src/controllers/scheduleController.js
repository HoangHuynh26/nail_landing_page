import {
  getScheduleLocks,
  lockDate,
  unlockDate,
  lockSlot,
  unlockSlot,
  lockSlotsBatch,
  unlockSlotsBatch,
  toggleSlotLock,
  toggleDateLock,
  getBookingsByDate,
  getCustomSlots,
  addCustomSlot,
  removeCustomSlot,
  hideDefaultSlot,
  restoreDefaultSlot,
  resetDateSlots,
  getDateOperatingHours,
  setDateOperatingHours,
  resetDateOperatingHours,
  getAllDateHours
} from '../services/scheduleService.js';

/**
 * GET /api/schedule/locks
 * Public & Admin: Returns all locked dates, locked slots, custom slots, and date operating hours
 */
export async function getLocks(req, res, next) {
  try {
    const { date } = req.query;
    const schedule = await getScheduleLocks(date || null);
    return res.status(200).json({
      success: true,
      ...schedule
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/schedule/date/:date
 * Admin: Returns full schedule view for a specific date (locks, custom slots, operating hours, and customer appointments)
 */
export async function getScheduleForDate(req, res, next) {
  try {
    const { date } = req.params;
    const [locksData, bookings] = await Promise.all([
      getScheduleLocks(date),
      getBookingsByDate(date)
    ]);

    const operatingHours = locksData.dateHours?.[date] || await getDateOperatingHours(date);

    return res.status(200).json({
      success: true,
      date,
      isDateLocked: locksData.lockedDates.includes(date) || operatingHours.isClosed,
      dateReason: locksData.dateReasons[date] || (operatingHours.isClosed ? 'Salon Closed' : ''),
      lockedSlots: locksData.lockedSlots[date] || [],
      slotReasons: locksData.slotReasons || {},
      customSlots: locksData.customSlots?.[date] || { added: [], removed: [], notes: {} },
      operatingHours,
      bookings: bookings || []
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/lock-date
 * Lock an entire day
 */
export async function handleLockDate(req, res, next) {
  try {
    const { date, reason } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const lock = await lockDate(date, reason);
    return res.status(200).json({
      success: true,
      message: `Date ${date} has been locked successfully`,
      lock
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/unlock-date
 * Unlock an entire day
 */
export async function handleUnlockDate(req, res, next) {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    await unlockDate(date);
    return res.status(200).json({
      success: true,
      message: `Date ${date} has been reopened / unlocked`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/toggle-date
 * Toggle full day lock
 */
export async function handleToggleDate(req, res, next) {
  try {
    const { date, reason } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const result = await toggleDateLock(date, reason);
    return res.status(200).json({
      success: true,
      message: result.locked ? `Date ${date} is now locked` : `Date ${date} is now unlocked`,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/lock-slot
 * Lock a specific slot
 */
export async function handleLockSlot(req, res, next) {
  try {
    const { date, slot, reason } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    const lock = await lockSlot(date, slot, reason);
    return res.status(200).json({
      success: true,
      message: `Slot ${slot} on ${date} has been locked`,
      lock
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/unlock-slot
 * Unlock a specific slot
 */
export async function handleUnlockSlot(req, res, next) {
  try {
    const { date, slot } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    await unlockSlot(date, slot);
    return res.status(200).json({
      success: true,
      message: `Slot ${slot} on ${date} has been unlocked`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/toggle-slot
 * Toggle lock/unlock on a single slot
 */
export async function handleToggleSlot(req, res, next) {
  try {
    const { date, slot, reason } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    const result = await toggleSlotLock(date, slot, reason);
    return res.status(200).json({
      success: true,
      message: result.locked ? `Slot ${slot} locked` : `Slot ${slot} unlocked`,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/batch-lock-slots
 * Lock multiple slots at once
 */
export async function handleBatchLockSlots(req, res, next) {
  try {
    const { date, slots, lockAction, reason } = req.body; // lockAction: 'lock' | 'unlock'
    if (!date || !Array.isArray(slots)) {
      return res.status(400).json({ success: false, message: 'Date and slots array are required' });
    }

    if (lockAction === 'unlock') {
      await unlockSlotsBatch(date, slots);
      return res.status(200).json({
        success: true,
        message: `Unlocked ${slots.length} slots on ${date}`
      });
    } else {
      await lockSlotsBatch(date, slots, reason || 'Reserved by salon');
      return res.status(200).json({
        success: true,
        message: `Locked ${slots.length} slots on ${date}`
      });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/custom-slot
 * Add a custom time slot for a date
 */
export async function handleAddCustomSlot(req, res, next) {
  try {
    const { date, slot, note } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    const created = await addCustomSlot(date, slot, note);
    return res.status(200).json({
      success: true,
      message: `Time slot ${slot} added successfully for ${date}`,
      slot: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE & POST /api/schedule/custom-slot/delete
 * Remove a custom time slot
 */
export async function handleDeleteCustomSlot(req, res, next) {
  try {
    const date = req.body.date || req.query.date;
    const slot = req.body.slot || req.query.slot;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    await removeCustomSlot(date, slot);
    return res.status(200).json({
      success: true,
      message: `Time slot ${slot} removed for ${date}`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/hide-slot
 * Hide / disable a default time slot for a date
 */
export async function handleHideDefaultSlot(req, res, next) {
  try {
    const { date, slot, note } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    const result = await hideDefaultSlot(date, slot, note);
    return res.status(200).json({
      success: true,
      message: `Default slot ${slot} hidden for ${date}`,
      slot: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/restore-slot
 * Restore a hidden default time slot
 */
export async function handleRestoreDefaultSlot(req, res, next) {
  try {
    const { date, slot } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    await restoreDefaultSlot(date, slot);
    return res.status(200).json({
      success: true,
      message: `Slot ${slot} restored for ${date}`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/reset-slots
 * Revert all slots for a date back to standard defaults
 */
export async function handleResetDateSlots(req, res, next) {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    await resetDateSlots(date);
    return res.status(200).json({
      success: true,
      message: `All custom slots for ${date} have been reset to defaults`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/operating-hours
 * Set or adjust opening and closing hours for a specific date (overtime or early open)
 */
export async function handleSetDateHours(req, res, next) {
  try {
    const { date, openTime, closeTime, note, isClosed } = req.body;
    if (!date || !openTime || !closeTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, openTime, and closeTime are required'
      });
    }

    const result = await setDateOperatingHours(date, openTime, closeTime, note, isClosed);
    return res.status(200).json({
      success: true,
      message: `Operating hours for ${date} updated: ${result.openTime} – ${result.closeTime}`,
      operatingHours: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/schedule/operating-hours/reset or DELETE /api/schedule/operating-hours/:date
 * Reset operating hours for a date back to standard defaults
 */
export async function handleResetDateHours(req, res, next) {
  try {
    const date = req.body.date || req.params.date || req.query.date;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    await resetDateOperatingHours(date);
    const standard = await getDateOperatingHours(date);
    return res.status(200).json({
      success: true,
      message: `Operating hours for ${date} reset to standard defaults`,
      operatingHours: standard
    });
  } catch (err) {
    next(err);
  }
}


