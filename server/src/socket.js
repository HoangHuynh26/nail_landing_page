import { Server } from 'socket.io';

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

/**
 * Broadcasts newly created appointment booking in real-time
 */
export function broadcastNewBooking(booking) {
  if (ioInstance) {
    console.info(`[Socket.io] Broadcasting new booking ${booking.bookingId} (${booking.name}) to all connected admins`);
    ioInstance.emit('new_booking', {
      ...booking,
      isNew: true,
      timestamp: Date.now()
    });
  }
}

/**
 * Broadcasts booking status updates
 */
export function broadcastBookingStatusUpdate(bookingId, status) {
  if (ioInstance) {
    ioInstance.emit('booking_status_updated', {
      bookingId,
      status,
      timestamp: Date.now()
    });
  }
}
