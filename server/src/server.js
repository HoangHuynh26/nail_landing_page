import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & Parsing Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://[IP_ADDRESS]'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Minimal Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Fashion Nails Morley Galleria API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`✨ Fashion Nails Morley Galleria API Server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
});

export default app;
