import './AdminSchedule.css';
import React, { useState, useEffect, useMemo } from 'react';
import {
  getCustomizedSlotsForDate,
  getEffectiveOperatingHours,
  formatSlotTime,
  formatMinutesToTime,
  parseSlotToMinutes,
  normalizeSlotTime,
  getPerthDateString,
  getPerthNow,
  getPerth12HourParts,
  getPerthFormattedTime
} from '../../../utils/perthTime';

import {
  QUICK_REASONS
} from './constants';

import ScheduleToast from './components/ScheduleToast';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleDateStrip from './components/ScheduleDateStrip';
import ScheduleDashboardHeader from './components/ScheduleDashboardHeader';
import ScheduleLockTool from './components/ScheduleLockTool';
import ScheduleBookedSlots from './components/ScheduleBookedSlots';
import ScheduleLockedSlots from './components/ScheduleLockedSlots';
import ScheduleLockModal from './components/ScheduleLockModal';
import ScheduleAddSlotModal from './components/ScheduleAddSlotModal';
import ScheduleHoursModal from './components/ScheduleHoursModal';
import ScheduleQuickLockModal from './components/ScheduleQuickLockModal';

export default function AdminSchedule() {
  const [selectedDate, setSelectedDate] = useState(() => getPerthDateString(0));
  const [locksData, setLocksData] = useState({
    locks: [],
    lockedDates: [],
    lockedSlots: {},
    dateReasons: {},
    slotReasons: {},
    customSlots: {},
    dateHours: {}
  });
  const [bookingsForDate, setBookingsForDate] = useState([]);
  const [allUpcomingBookings, setAllUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Modal for lock reason
  const [lockModal, setLockModal] = useState({
    isOpen: false,
    type: 'slot', // 'slot' | 'date' | 'batch'
    slot: '',
    slots: [],
    reason: QUICK_REASONS[0]
  });

  // Modal for quick locking any specific slot (defaults to Western Australia Perth time slot)
  const [quickLockModal, setQuickLockModal] = useState(() => {
    const parts = getPerth12HourParts(true);
    return {
      isOpen: false,
      hour: parts.hour,
      minute: parts.minute,
      period: parts.period,
      reason: 'Fully Booked (Walk-ins)'
    };
  });

  // Dedicated 3-Box Lock Tool state: Hour, Minute, Period + duration + reason (defaults to Western Australia Perth time slot)
  const [lockTool, setLockTool] = useState(() => {
    const parts = getPerth12HourParts(true);
    return {
      hour: parts.hour,
      minute: parts.minute,
      period: parts.period,
      duration: '15',
      reason: ''
    };
  });

  // Modal for adjusting operating hours (early open or overtime)
  const [hoursModal, setHoursModal] = useState({
    isOpen: false,
    openHour: '09',
    openMinute: '00',
    openPeriod: 'AM',
    closeHour: '05',
    closeMinute: '30',
    closePeriod: 'PM',
    note: '',
    isClosed: false
  });

  // Modal for adding a custom time slot
  const [addSlotModal, setAddSlotModal] = useState({
    isOpen: false,
    hour: '08',
    minute: '30',
    period: 'AM',
    note: ''
  });

  const perthNow = getPerthNow();
  const perthTodayIso = perthNow.isoDate;
  const isToday = selectedDate === perthTodayIso;

  // Fetch locks from server
  const fetchLocks = async () => {
    try {
      const res = await fetch('/api/schedule/locks');
      const data = await res.json();
      if (data.success) {
        setLocksData({
          locks: data.locks || [],
          lockedDates: data.lockedDates || [],
          lockedSlots: data.lockedSlots || {},
          dateReasons: data.dateReasons || {},
          slotReasons: data.slotReasons || {},
          customSlots: data.customSlots || {},
          dateHours: data.dateHours || {}
        });
      }
    } catch (err) {
      console.error('Failed to fetch schedule locks:', err);
    }
  };

  // Fetch bookings for the selected date
  const fetchDateSchedule = async (date) => {
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/schedule/date/${date}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setBookingsForDate(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch schedule for date:', err);
    }
  };

  // Fetch all bookings for date strip badges
  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/bookings?limit=200', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setAllUpcomingBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchLocks(), fetchDateSchedule(selectedDate), fetchAllBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchDateSchedule(selectedDate);
  }, [selectedDate]);

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Generate 21 upcoming days for horizontal strip
  const dateStrip = useMemo(() => {
    const list = [];
    for (let i = 0; i < 21; i++) {
      const iso = getPerthDateString(i);
      const [y, m, d] = iso.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      const dayName = dateObj.toLocaleDateString('en-AU', { weekday: 'short', timeZone: 'UTC' });
      const monthName = dateObj.toLocaleDateString('en-AU', { month: 'short', timeZone: 'UTC' });
      const dayNum = d;
      const isSunday = dateObj.getUTCDay() === 0;
      const isThursday = dateObj.getUTCDay() === 4;

      const isDateLocked = locksData.lockedDates.includes(iso);
      const lockedSlotCount = (locksData.lockedSlots[iso] || []).length;
      const bookedCount = allUpcomingBookings.filter(b => b.date === iso && b.status !== 'cancelled').length;
      const customAddedCount = (locksData.customSlots?.[iso]?.added || []).length;
      const customRemovedCount = (locksData.customSlots?.[iso]?.removed || []).length;

      list.push({
        iso,
        dayName,
        dayNum,
        monthName,
        isSunday,
        isThursday,
        isToday: i === 0,
        isDateLocked,
        lockedSlotCount,
        bookedCount,
        customAddedCount,
        customRemovedCount
      });
    }
    return list;
  }, [locksData, allUpcomingBookings]);

  // Slots for the active date (taking into account custom added/removed slots and operating hours overrides)
  const slots = useMemo(() => {
    return getCustomizedSlotsForDate(selectedDate, locksData.customSlots, locksData.dateHours);
  }, [selectedDate, locksData.customSlots, locksData.dateHours]);

  // Effective operating hours for active date (open time, close time, isCustom, note)
  const effectiveOperatingHours = useMemo(() => {
    return getEffectiveOperatingHours(selectedDate, locksData.dateHours);
  }, [selectedDate, locksData.dateHours]);

  const dateCustomConfig = locksData.customSlots?.[selectedDate] || { added: [], removed: [], notes: {} };
  const addedSlotsForDate = dateCustomConfig.added || [];
  const removedSlotsForDate = dateCustomConfig.removed || [];
  const hasCustomAdjustments = addedSlotsForDate.length > 0 || removedSlotsForDate.length > 0;

  // Add custom time slot
  const handleAddCustomSlotSubmit = async (e) => {
    e.preventDefault();
    const formattedSlot = formatSlotTime(addSlotModal.hour, addSlotModal.minute, addSlotModal.period);

    // If slot is already active on this date, notify
    if (slots.includes(formattedSlot)) {
      showToast(`Time slot ${formattedSlot} already exists for this date`, 'error');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/schedule/custom-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: selectedDate,
          slot: formattedSlot,
          note: addSlotModal.note
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Added custom time slot ${formattedSlot} for ${selectedDate}`);
        setAddSlotModal({
          isOpen: false,
          hour: '08',
          minute: '30',
          period: 'AM',
          note: ''
        });
        await fetchLocks();
      } else {
        showToast(data.message || 'Failed to add custom time slot', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Hours Modal pre-filled with current effective hours
  const openHoursModal = () => {
    const parseTimeParts = (timeStr, defaultHour, defaultMin, defaultPeriod) => {
      if (!timeStr) return { hour: defaultHour, minute: defaultMin, period: defaultPeriod };
      const parts = timeStr.trim().split(/\s+/);
      if (parts.length < 2) return { hour: defaultHour, minute: defaultMin, period: defaultPeriod };
      const [h, m] = parts[0].split(':');
      return {
        hour: String(parseInt(h, 10)).padStart(2, '0'),
        minute: String(parseInt(m, 10)).padStart(2, '0'),
        period: parts[1].toUpperCase() === 'AM' ? 'AM' : 'PM'
      };
    };

    const openParsed = parseTimeParts(effectiveOperatingHours.openTime, '09', '00', 'AM');
    const closeParsed = parseTimeParts(effectiveOperatingHours.closeTime, '05', '30', 'PM');

    setHoursModal({
      isOpen: true,
      openHour: openParsed.hour,
      openMinute: openParsed.minute,
      openPeriod: openParsed.period,
      closeHour: closeParsed.hour,
      closeMinute: closeParsed.minute,
      closePeriod: closeParsed.period,
      note: effectiveOperatingHours.note || '',
      isClosed: Boolean(effectiveOperatingHours.isClosed)
    });
  };

  // Save custom operating hours (early open or overtime)
  const handleSaveHours = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const openTime = formatSlotTime(hoursModal.openHour, hoursModal.openMinute, hoursModal.openPeriod);
      const closeTime = formatSlotTime(hoursModal.closeHour, hoursModal.closeMinute, hoursModal.closePeriod);

      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/schedule/operating-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: selectedDate,
          openTime,
          closeTime,
          note: hoursModal.note,
          isClosed: hoursModal.isClosed
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Operating hours for ${selectedDate} updated: ${openTime} – ${closeTime}`);
        setHoursModal(prev => ({ ...prev, isOpen: false }));
        await Promise.all([fetchLocks(), fetchDateSchedule(selectedDate)]);
      } else {
        showToast(data.message || 'Failed to update operating hours', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset operating hours to standard defaults
  const handleResetHours = async () => {
    if (!window.confirm(`Reset operating hours for ${selectedDate} back to standard schedule?`)) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/schedule/operating-hours/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ date: selectedDate })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Operating hours for ${selectedDate} reset to standard defaults`);
        setHoursModal(prev => ({ ...prev, isOpen: false }));
        await Promise.all([fetchLocks(), fetchDateSchedule(selectedDate)]);
      } else {
        showToast(data.message || 'Failed to reset operating hours', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick lock specific time slot (e.g. 12:45 PM)
  const handleQuickLockSubmit = async (e) => {
    e.preventDefault();
    const formattedSlot = formatSlotTime(quickLockModal.hour, quickLockModal.minute, quickLockModal.period);

    setActionLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/schedule/lock-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: selectedDate,
          slot: formattedSlot,
          reason: quickLockModal.reason || 'Fully Booked (Walk-ins)'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Locked time slot ${formattedSlot} on ${selectedDate}`);
        setQuickLockModal(prev => ({ ...prev, isOpen: false }));
        await fetchLocks();
      } else {
        showToast(data.message || 'Failed to lock slot', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset all custom slots for this date to default
  const handleResetDateSlots = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/schedule/reset-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ date: selectedDate })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Restored all default time slots for ${selectedDate}`);
        await fetchLocks();
      } else {
        showToast(data.message || 'Failed to reset slots', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isWholeDayLocked = locksData.lockedDates.includes(selectedDate);
  const wholeDayReason = locksData.dateReasons[selectedDate] || 'Salon Closed / Locked by Admin';

  // Helper to calculate target slots for duration (1-minute resolution so all minutes in range are locked)
  const calculateTargetSlots = (hourStr, minuteStr, periodStr, durationStr) => {
    const startTimeStr = formatSlotTime(hourStr, minuteStr, periodStr);
    const startMin = parseSlotToMinutes(startTimeStr);

    if (durationStr === 'morning') {
      const openMin = parseSlotToMinutes('08:00 AM');
      const noonMin = parseSlotToMinutes('12:00 PM');
      const targetSlots = [];
      for (let m = openMin; m < noonMin; m += 1) {
        targetSlots.push(formatMinutesToTime(m));
      }
      return targetSlots;
    }

    if (durationStr === 'afternoon') {
      const noonMin = parseSlotToMinutes('12:00 PM');
      const closeMin = parseSlotToMinutes('06:00 PM');
      const targetSlots = [];
      for (let m = noonMin; m < closeMin; m += 1) {
        targetSlots.push(formatMinutesToTime(m));
      }
      return targetSlots;
    }

    const durationMinutes = parseInt(durationStr, 10) || 15;
    const targetSlots = [];

    // Lock every minute from startMin to startMin + durationMinutes (inclusive of endMin, e.g. 6:00 to 6:15)
    const endMin = startMin + durationMinutes;
    for (let curMin = startMin; curMin <= endMin; curMin += 1) {
      if (curMin < 24 * 60) {
        targetSlots.push(formatMinutesToTime(curMin));
      }
    }
    return targetSlots;
  };

  const selectedLockSlotStr = formatSlotTime(lockTool.hour, lockTool.minute, lockTool.period);
  const isSelectedSlotCurrentlyLocked = (locksData.lockedSlots[selectedDate] || [])
    .map(normalizeSlotTime)
    .includes(normalizeSlotTime(selectedLockSlotStr));

  // Lock slots using the 3-box tool
  const handleLockToolSubmit = async () => {
    const targetSlots = calculateTargetSlots(lockTool.hour, lockTool.minute, lockTool.period, lockTool.duration);
    if (targetSlots.length === 0) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      if (targetSlots.length === 1) {
        const slot = targetSlots[0];
        const res = await fetch('/api/schedule/lock-slot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            slot,
            reason: lockTool.reason || 'Full slot'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Time slot ${slot} locked successfully!`);
          await fetchLocks();
        } else {
          showToast(data.message || 'Failed to lock time slot', 'error');
        }
      } else {
        const res = await fetch('/api/schedule/batch-lock-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            slots: targetSlots,
            lockAction: 'lock',
            reason: lockTool.reason || 'Full slot'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Locked ${targetSlots.length} time slots (${targetSlots[0]} – ${targetSlots[targetSlots.length - 1]})`);
          await fetchLocks();
        } else {
          showToast(data.message || 'Failed to lock time slots', 'error');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Unlock slots using the 3-box tool
  const handleUnlockToolSubmit = async () => {
    const targetSlots = calculateTargetSlots(lockTool.hour, lockTool.minute, lockTool.period, lockTool.duration);
    if (targetSlots.length === 0) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      if (targetSlots.length === 1) {
        const slot = targetSlots[0];
        const res = await fetch('/api/schedule/unlock-slot', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            slot
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Time slot ${slot} unlocked successfully`);
          await fetchLocks();
        } else {
          showToast(data.message || 'Failed to unlock time slot', 'error');
        }
      } else {
        const res = await fetch('/api/schedule/batch-lock-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            slots: targetSlots,
            lockAction: 'unlock'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Unlocked ${targetSlots.length} time slots (${targetSlots[0]} – ${targetSlots[targetSlots.length - 1]})`);
          await fetchLocks();
        } else {
          showToast(data.message || 'Failed to unlock time slots', 'error');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Sorted bookings for the date (Default: Newest time to Oldest time)
  const sortedBookings = useMemo(() => {
    return [...bookingsForDate].sort((a, b) => {
      // Primary: Slot time descending (latest time in day first: e.g. 09:30 AM before 09:00 AM)
      const timeDiff = parseSlotToMinutes(b.time) - parseSlotToMinutes(a.time);
      if (timeDiff !== 0) return timeDiff;

      // Secondary: Newest created booking first (by created_at timestamp or id)
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;

      return (b.id || 0) - (a.id || 0);
    });
  }, [bookingsForDate]);

  // Current locked slots for date
  const currentLockedSlots = useMemo(() => {
    return (locksData.lockedSlots[selectedDate] || []).map(normalizeSlotTime).sort((a, b) => {
      return parseSlotToMinutes(a) - parseSlotToMinutes(b);
    });
  }, [locksData.lockedSlots, selectedDate]);

  // Lock entire day handler
  const handleToggleWholeDay = async () => {
    if (isWholeDayLocked) {
      // Unlock whole day
      setActionLoading(true);
      try {
        const token = localStorage.getItem('atelier_admin_token');
        const res = await fetch(`/api/schedule/unlock-date/${selectedDate}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Unlocked entire day: ${selectedDate}`);
          await fetchLocks();
        } else {
          showToast(data.message || 'Failed to unlock day', 'error');
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setActionLoading(false);
      }
    } else {
      // Open modal to specify reason
      setLockModal({
        isOpen: true,
        type: 'date',
        slot: '',
        slots: [],
        reason: 'Public Holiday'
      });
    }
  };

  // Toggle single slot
  const handleSlotClick = async (slot) => {
    const isSlotLocked = locksData.lockedSlots[selectedDate]?.includes(slot);

    if (isSlotLocked) {
      // Unlock immediately
      setActionLoading(true);
      try {
        const token = localStorage.getItem('atelier_admin_token');
        const res = await fetch('/api/schedule/unlock-slot', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ date: selectedDate, slot })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Unlocked slot: ${slot}`);
          await fetchLocks();
        } else {
          showToast(data.message || 'Failed to unlock slot', 'error');
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setActionLoading(false);
      }
    } else {
      // Prompt for lock reason
      setLockModal({
        isOpen: true,
        type: 'slot',
        slot,
        slots: [slot],
        reason: QUICK_REASONS[0]
      });
    }
  };

  // Batch lock / unlock
  const handleBatchAction = async (actionType) => {
    if (actionType === 'unlock-all') {
      setActionLoading(true);
      try {
        const token = localStorage.getItem('atelier_admin_token');
        // Unlock whole day and all slots for this date
        await Promise.all([
          fetch(`/api/schedule/unlock-date/${selectedDate}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          ...(locksData.lockedSlots[selectedDate] || []).map(s =>
            fetch('/api/schedule/unlock-slot', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ date: selectedDate, slot: s })
            })
          )
        ]);
        showToast(`All locks cleared for ${selectedDate}`);
        await fetchLocks();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    let targetSlots = [];
    if (actionType === 'lock-morning') {
      targetSlots = slots.filter(s => s.includes('AM'));
    } else if (actionType === 'lock-afternoon') {
      targetSlots = slots.filter(s => s.includes('PM'));
    }

    if (targetSlots.length === 0) return;

    setLockModal({
      isOpen: true,
      type: 'batch',
      slot: '',
      slots: targetSlots,
      reason: actionType === 'lock-morning' ? 'Morning Blocked' : 'Afternoon Blocked'
    });
  };

  // Submit modal action
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const token = localStorage.getItem('atelier_admin_token');

    try {
      if (lockModal.type === 'date') {
        const res = await fetch('/api/schedule/lock-date', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            reason: lockModal.reason
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Locked entire day ${selectedDate} (${lockModal.reason})`);
        } else {
          showToast(data.message || 'Failed to lock day', 'error');
        }
      } else if (lockModal.type === 'slot') {
        const res = await fetch('/api/schedule/lock-slot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            slot: lockModal.slot,
            reason: lockModal.reason
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Locked slot ${lockModal.slot}`);
        } else {
          showToast(data.message || 'Failed to lock slot', 'error');
        }
      } else if (lockModal.type === 'batch') {
        const res = await fetch('/api/schedule/batch-lock-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            date: selectedDate,
            slots: lockModal.slots,
            reason: lockModal.reason
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Locked ${lockModal.slots.length} slots for ${selectedDate}`);
        } else {
          showToast(data.message || 'Failed to batch lock slots', 'error');
        }
      }

      await fetchLocks();
      setLockModal({ isOpen: false, type: 'slot', slot: '', slots: [], reason: QUICK_REASONS[0] });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for formatted day header (e.g. Wednesday, 30-09-2026)
  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const [y, m, d] = parts.map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const weekday = dateObj.toLocaleDateString('en-AU', {
      weekday: 'long',
      timeZone: 'UTC'
    });
    const dStr = String(d).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    return `${weekday}, ${dStr}-${mStr}-${y}`;
  }, [selectedDate]);

  return (
    <div className="admin-content-section admin-schedule-container">
      {/* Toast Notification */}
      <ScheduleToast
        feedback={feedback}
        onClose={() => setFeedback(null)}
      />

      {/* Top Header Bar */}
      <ScheduleHeader
        loading={loading}
        actionLoading={actionLoading}
        onRefresh={loadAll}
      />

      {/* 21-Day Horizontal Scroll Strip */}
      <ScheduleDateStrip
        dateStrip={dateStrip}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Main Selected Date Dashboard Card */}
      <div className="admin-schedule-dashboard-card">
        {/* Date Title & Whole-Day Lock Banner */}
        <ScheduleDashboardHeader
          formattedSelectedDate={formattedSelectedDate}
          isToday={isToday}
          effectiveOperatingHours={effectiveOperatingHours}
          slotsCount={slots.length}
          hasCustomAdjustments={hasCustomAdjustments}
          addedSlotsCount={addedSlotsForDate.length}
          removedSlotsCount={removedSlotsForDate.length}
          isWholeDayLocked={isWholeDayLocked}
          wholeDayReason={wholeDayReason}
          selectedDate={selectedDate}
          actionLoading={actionLoading}
          onOpenHoursModal={openHoursModal}
          onResetDateSlots={() => {
            if (window.confirm(`Reset all custom time slots for ${selectedDate} back to default schedule?`)) {
              handleResetDateSlots();
            }
          }}
          onToggleWholeDay={handleToggleWholeDay}
        />

        {/* ADMIN 3-BOX TIME LOCK TOOL */}
        <ScheduleLockTool
          selectedDate={selectedDate}
          lockTool={lockTool}
          setLockTool={setLockTool}
          isSelectedSlotCurrentlyLocked={isSelectedSlotCurrentlyLocked}
          selectedLockSlotStr={selectedLockSlotStr}
          actionLoading={actionLoading}
          onLock={handleLockToolSubmit}
          onUnlock={handleUnlockToolSubmit}
        />

        {/* BOOKED APPOINTMENT SLOTS */}
        <ScheduleBookedSlots
          selectedDate={selectedDate}
          sortedBookings={sortedBookings}
          onStatusUpdated={(bookingId, newStatus) => {
            setBookingsForDate(prev =>
              prev.map(b => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status: newStatus } : b))
            );
          }}
        />

        {/* CURRENTLY LOCKED SLOTS */}
        <ScheduleLockedSlots
          selectedDate={selectedDate}
          currentLockedSlots={currentLockedSlots}
          locksData={locksData}
          actionLoading={actionLoading}
          onUnlockSingle={handleSlotClick}
          onUnlockAll={() => handleBatchAction('unlock-all')}
        />
      </div>

      {/* Modals */}
      <ScheduleLockModal
        lockModal={lockModal}
        setLockModal={setLockModal}
        selectedDate={selectedDate}
        actionLoading={actionLoading}
        onSubmit={handleModalSubmit}
      />

      <ScheduleAddSlotModal
        addSlotModal={addSlotModal}
        setAddSlotModal={setAddSlotModal}
        selectedDate={selectedDate}
        formattedSelectedDate={formattedSelectedDate}
        slots={slots}
        actionLoading={actionLoading}
        onSubmit={handleAddCustomSlotSubmit}
      />

      <ScheduleHoursModal
        hoursModal={hoursModal}
        setHoursModal={setHoursModal}
        effectiveOperatingHours={effectiveOperatingHours}
        selectedDate={selectedDate}
        actionLoading={actionLoading}
        onSubmit={handleSaveHours}
        onResetHours={handleResetHours}
      />

      <ScheduleQuickLockModal
        quickLockModal={quickLockModal}
        setQuickLockModal={setQuickLockModal}
        selectedDate={selectedDate}
        actionLoading={actionLoading}
        onSubmit={handleQuickLockSubmit}
      />
    </div>
  );
}