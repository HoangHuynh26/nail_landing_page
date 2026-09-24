import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const AdminSocketContext = createContext(null);

const STORAGE_KEY = 'atelier_unread_booking_ids';

/**
 * Plays a gentle luxury 2-tone audio chime (D5 -> A5)
 */
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: 880.00 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Autoplay restrictions may suppress audio until user interacts with the page
  }
}

export function AdminSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadIds, setUnreadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [liveToast, setLiveToast] = useState(null);
  const [realtimeBookings, setRealtimeBookings] = useState([]);

  // Save unread IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unreadIds));
    } catch (e) {
      console.warn('Failed to save unread booking IDs:', e);
    }
  }, [unreadIds]);

  // Connect socket.io
  useEffect(() => {
    // Connect to current origin, Vite proxies /socket.io to backend
    const socketInstance = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.info('[AdminSocket] Connected to real-time notification socket:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.info('[AdminSocket] Disconnected from socket');
      setIsConnected(false);
    });

    // Listen for incoming new bookings
    socketInstance.on('new_booking', (booking) => {
      console.info('[AdminSocket] Received new real-time booking:', booking);

      const id = booking.bookingId || booking.id;

      // 1. Play pleasant luxury audio chime
      playNotificationChime();

      // 2. Add to unread IDs list so it glows with distinctive color
      setUnreadIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));

      // 3. Keep in realtime queue
      setRealtimeBookings((prev) => [booking, ...prev]);

      // 4. Trigger luxury toast notification
      setLiveToast({
        id,
        booking,
        timestamp: Date.now()
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Mark single booking as read / viewed
  const markAsViewed = useCallback((bookingId) => {
    if (!bookingId) return;
    setUnreadIds((prev) => prev.filter((id) => id !== bookingId && id !== String(bookingId)));
  }, []);

  // Mark all bookings as read / viewed
  const markAllAsViewed = useCallback(() => {
    setUnreadIds([]);
  }, []);

  // Check if booking is unviewed
  const isUnviewed = useCallback(
    (bookingId) => {
      if (!bookingId) return false;
      return unreadIds.includes(bookingId) || unreadIds.includes(String(bookingId));
    },
    [unreadIds]
  );

  const dismissToast = useCallback(() => {
    setLiveToast(null);
  }, []);

  return (
    <AdminSocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadIds,
        unreadCount: unreadIds.length,
        isUnviewed,
        markAsViewed,
        markAllAsViewed,
        liveToast,
        dismissToast,
        realtimeBookings
      }}
    >
      {children}
    </AdminSocketContext.Provider>
  );
}

export function useAdminSocket() {
  const context = useContext(AdminSocketContext);
  if (!context) {
    throw new Error('useAdminSocket must be used within an AdminSocketProvider');
  }
  return context;
}

export default AdminSocketContext;
