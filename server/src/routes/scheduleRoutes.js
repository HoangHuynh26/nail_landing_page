import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
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
router.get('/schedule/date/:date', authenticateAdmin, getScheduleForDate);

// Operating Hours (Customize opening/closing hours per day)
router.post('/schedule/operating-hours', authenticateAdmin, handleSetDateHours);
router.post('/schedule/date-hours', authenticateAdmin, handleSetDateHours);
router.post('/schedule/operating-hours/reset', authenticateAdmin, handleResetDateHours);
router.post('/schedule/date-hours/reset', authenticateAdmin, handleResetDateHours);
router.delete('/schedule/operating-hours/:date', authenticateAdmin, (req, res, next) => {
  req.body = { ...req.body, date: req.params.date };
  handleResetDateHours(req, res, next);
});
router.delete('/schedule/date-hours/:date', authenticateAdmin, (req, res, next) => {
  req.body = { ...req.body, date: req.params.date };
  handleResetDateHours(req, res, next);
});

// POST /api/schedule/lock-date - Lock entire day
router.post('/schedule/lock-date', authenticateAdmin, handleLockDate);

// POST & DELETE /api/schedule/unlock-date - Unlock entire day
router.post('/schedule/unlock-date', authenticateAdmin, handleUnlockDate);
router.delete('/schedule/unlock-date/:date', authenticateAdmin, (req, res, next) => {
  req.body = { ...req.body, date: req.params.date };
  handleUnlockDate(req, res, next);
});
router.delete('/schedule/unlock-date', authenticateAdmin, handleUnlockDate);

// POST /api/schedule/toggle-date - Toggle entire day lock
router.post('/schedule/toggle-date', authenticateAdmin, handleToggleDate);

// POST /api/schedule/lock-slot - Lock specific slot
router.post('/schedule/lock-slot', authenticateAdmin, handleLockSlot);

// POST & DELETE /api/schedule/unlock-slot - Unlock specific slot
router.post('/schedule/unlock-slot', authenticateAdmin, handleUnlockSlot);
router.delete('/schedule/unlock-slot', authenticateAdmin, handleUnlockSlot);

// POST /api/schedule/toggle-slot - Toggle lock on single slot
router.post('/schedule/toggle-slot', authenticateAdmin, handleToggleSlot);

// POST /api/schedule/batch-lock-slots - Lock or unlock multiple slots
router.post('/schedule/batch-lock-slots', authenticateAdmin, handleBatchLockSlots);

// Custom Slots (Add, lock, or restore time slots per day)
router.post('/schedule/custom-slot', authenticateAdmin, handleAddCustomSlot);
router.delete('/schedule/custom-slot', authenticateAdmin, handleDeleteCustomSlot);
router.post('/schedule/custom-slot/delete', authenticateAdmin, handleDeleteCustomSlot);
router.post('/schedule/hide-slot', authenticateAdmin, handleHideDefaultSlot);
router.post('/schedule/restore-slot', authenticateAdmin, handleRestoreDefaultSlot);
router.post('/schedule/reset-slots', authenticateAdmin, handleResetDateSlots);

export default router;

