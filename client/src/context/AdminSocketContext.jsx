import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const AdminSocketContext = createContext(null);

const STORAGE_KEY = 'atelier_unread_booking_ids';

let sharedAudioCtx = null;

/**
 * Plays a gentle luxury 2-tone audio chime (D5 -> A5)
 */
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    
    const ctx = sharedAudioCtx;
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

  const socketRef = React.useRef(null);
  
  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const token = localStorage.getItem('atelier_admin_token');
    if (!token) return;

    const socketInstance = io({
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));

    socketInstance.on('new_booking', (booking) => {
      const id = booking.bookingId || booking.id;
      playNotificationChime();
      setUnreadIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
      setRealtimeBookings((prev) => [booking, ...prev]);
      setLiveToast({ id, booking, timestamp: Date.now() });
    });

    setSocket(socketInstance);
    socketRef.current = socketInstance;
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
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
        realtimeBookings,
        connectSocket,
        disconnectSocket
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
