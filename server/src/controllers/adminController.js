import { getDbStatus, initDatabase, dbState } from '../db/db.js';
import { config } from '../config/env.js';

/**
 * Returns system and database status
 */
export async function getSystemStatus(req, res, next) {
  try {
    const status = await getDbStatus();
    return res.status(200).json({
      success: true,
      data: {
        status: 'online',
        service: 'Fashion Nails Morley Galleria Backend',
        environment: config.nodeEnv,
        database: status
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies admin PIN / Access key
 */
export async function verifyAdminPin(req, res) {
  const { pin } = req.body;
  const configuredPin = config.adminPin || '8888';

  if (!pin || String(pin).trim() !== String(configuredPin).trim()) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Admin Access PIN'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token: Buffer.from(`admin:${Date.now()}:${configuredPin}`).toString('base64')
  });
}

/**
 * Connects or re-tests Neon connection string dynamically
 */
export async function updateDatabaseConnection(req, res, next) {
  try {
    const { databaseUrl } = req.body;

    if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PostgreSQL connection URL. Must start with postgresql:// or postgres://'
      });
    }

    const result = await initDatabase(databaseUrl);

    if (result.success && result.mode === 'neon_postgresql') {
      return res.status(200).json({
        success: true,
        message: 'Connected to Neon PostgreSQL successfully!',
        database: await getDbStatus()
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Failed to connect to Neon: ${result.error || 'Connection error'}`,
        database: await getDbStatus()
      });
    }
  } catch (err) {
    next(err);
  }
}
