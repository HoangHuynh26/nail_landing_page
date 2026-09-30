import { Router } from 'express';
import {
  getLocks,
  getScheduleForDate,
  handleLockDate,
  handleUnlockDate,
  handleToggleDate,
  handleLockSlot,
  handleUnlockSlot,
  handleToggleSlot,
  handleBatchLockSlots,
  handleAddCustomSlot,
  handleDeleteCustomSlot,
  handleHideDefaultSlot,
  handleRestoreDefaultSlot,
  handleResetDateSlots,
  handleSetDateHours,
  handleResetDateHours
} from '../controllers/scheduleController.js';

const router = Router();

// GET /api/schedule/locks - Get locked dates & slots
router.get('/schedule/locks', getLocks);

// GET /api/schedule/date/:date - Get locks and customer bookings for a specific date
router.get('/schedule/date/:date', getScheduleForDate);

// Operating Hours (Customize opening/closing hours per day)
router.post('/schedule/operating-hours', handleSetDateHours);
router.post('/schedule/date-hours', handleSetDateHours);
router.post('/schedule/operating-hours/reset', handleResetDateHours);
router.post('/schedule/date-hours/reset', handleResetDateHours);
router.delete('/schedule/operating-hours/:date', (req, res, next) => {
  req.body = { ...req.body, date: req.params.date };
  handleResetDateHours(req, res, next);
});
router.delete('/schedule/date-hours/:date', (req, res, next) => {
  req.body = { ...req.body, date: req.params.date };
  handleResetDateHours(req, res, next);
});

// POST /api/schedule/lock-date - Lock entire day
router.post('/schedule/lock-date', handleLockDate);

// POST & DELETE /api/schedule/unlock-date - Unlock entire day
router.post('/schedule/unlock-date', handleUnlockDate);
router.delete('/schedule/unlock-date/:date', (req, res, next) => {
  req.body = { ...req.body, date: req.params.date };
  handleUnlockDate(req, res, next);
});
router.delete('/schedule/unlock-date', handleUnlockDate);

// POST /api/schedule/toggle-date - Toggle entire day lock
router.post('/schedule/toggle-date', handleToggleDate);

// POST /api/schedule/lock-slot - Lock specific slot
router.post('/schedule/lock-slot', handleLockSlot);

// POST & DELETE /api/schedule/unlock-slot - Unlock specific slot
router.post('/schedule/unlock-slot', handleUnlockSlot);
router.delete('/schedule/unlock-slot', handleUnlockSlot);

// POST /api/schedule/toggle-slot - Toggle lock on single slot
router.post('/schedule/toggle-slot', handleToggleSlot);

// POST /api/schedule/batch-lock-slots - Lock or unlock multiple slots
router.post('/schedule/batch-lock-slots', handleBatchLockSlots);

// Custom Slots (Add, lock, or restore time slots per day)
router.post('/schedule/custom-slot', handleAddCustomSlot);
router.delete('/schedule/custom-slot', handleDeleteCustomSlot);
router.post('/schedule/custom-slot/delete', handleDeleteCustomSlot);
router.post('/schedule/hide-slot', handleHideDefaultSlot);
router.post('/schedule/restore-slot', handleRestoreDefaultSlot);
router.post('/schedule/reset-slots', handleResetDateSlots);

export default router;

