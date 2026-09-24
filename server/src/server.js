import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { initDatabase, getDbStatus } from './db/db.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
app.use('/api', adminRoutes);

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

  app.listen(config.port, () => {
    console.log(`✨ Fashion Nails Morley Galleria API Server running on port ${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`📁 Uploads served at: http://localhost:${config.port}/uploads/`);
  });
}

startServer();

export default app;
