import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/env.js';
import { findAdminByUsername } from './db/db.js';

let ioInstance = null;

/**
 * Initializes Socket.io attached to the HTTP server
 */
export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decodedPayload = jwt.decode(token);
      if (!decodedPayload || !decodedPayload.username) return next(new Error('Authentication error'));
      
      const admin = await findAdminByUsername(decodedPayload.username);
      if (!admin || admin.active === false) return next(new Error('Authentication error'));
      
      const storedHash = admin.password_hash || admin.passwordHash || '';
      jwt.verify(token, config.jwtSecret + storedHash);
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  ioInstance.on('connection', (socket) => {
    console.info(`[Socket.io] Admin client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.info(`[Socket.io] Admin client disconnected: ${socket.id} (${reason})`);
    });
  });

  return ioInstance;
}

/**
 * Returns current io instance
 */
export function getIO() {
  return ioInstance;
}

async function emitToValidSockets(event, data) {
  if (!ioInstance) return;
  const sockets = await ioInstance.fetchSockets();
  for (const socket of sockets) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) throw new Error('No token');
      const decodedPayload = jwt.decode(token);
      if (!decodedPayload || !decodedPayload.username) throw new Error('Invalid token payload');
      const admin = await findAdminByUsername(decodedPayload.username);
      if (!admin || admin.active === false) throw new Error('Admin not found or inactive');
      const storedHash = admin.password_hash || admin.passwordHash || '';
      jwt.verify(token, config.jwtSecret + storedHash);
      socket.emit(event, data);
    } catch (err) {
      console.warn(`[Socket.io] Token invalid or expired. Disconnecting socket: ${socket.id}`);
      socket.disconnect(true);
    }
  }
}

/**
 * Broadcasts newly created appointment booking in real-time
 */
export async function broadcastNewBooking(booking) {
  if (ioInstance) {
    console.info(`[Socket.io] Broadcasting new booking ${booking.bookingId} (${booking.name}) to valid admins`);
    await emitToValidSockets('new_booking', {
      ...booking,
      isNew: true,
      timestamp: Date.now()
    });
  }
}

/**
 * Broadcasts booking status updates
 */
export async function broadcastBookingStatusUpdate(bookingId, status) {
  if (ioInstance) {
    await emitToValidSockets('booking_status_updated', {
      bookingId,
      status,
      timestamp: Date.now()
    });
  }
}
