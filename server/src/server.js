import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { initDatabase, getDbStatus } from './db/db.js';
import { initSocket } from './socket.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { startVoucherCron } from './cron/voucherCron.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (Nginx) for rate-limiting and client IP
app.set('trust proxy', 1);

// Security & Parsing Middlewares
app.use(cors({
  origin: true, // Allow frontend dev & tunnels
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded promotional banners & media
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Minimal Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.originalUrl.startsWith('/uploads')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await getDbStatus();
  res.status(200).json({
    status: 'ok',
    service: 'Fashion Nails Morley Galleria API',
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api', bookingRoutes);
app.use('/api', serviceRoutes);
app.use('/api', promotionRoutes);
app.use('/api', galleryRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', adminRoutes);
app.use('/api', voucherRoutes);
app.use('/api', categoryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Initialize DB and Start Server
async function startServer() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('Initial DB bootstrap error:', err.message);
  }

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`✨ Fashion Nails Morley Galleria API Server running on port ${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`⚡ WebSocket / Socket.io active on port ${config.port}`);
    console.log(`📁 Uploads served at: http://localhost:${config.port}/uploads/`);

    // Start background cron jobs (e.g. auto-expire vouchers)
    startVoucherCron();
  });
}

startServer();

export default app;
