import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  getDbStatus,
  initDatabase,
  findAdminByUsername,
  updateAdminPassword,
  createAdminUser,
  getAdminAccounts
} from '../db/db.js';
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
 * Verifies admin credentials using database lookup and bcrypt verification
 */
export async function verifyAdminPin(req, res, next) {
  try {
    const { username, password } = req.body;

    const cleanUser = String(username || '').trim();
    const rawPassword = String(password || '').trim();

    if (!cleanUser || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both username and password are required'
      });
    }

    // Query database for admin user
    const admin = await findAdminByUsername(cleanUser);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password with bcrypt
    const storedHash = admin.password_hash || admin.passwordHash || '';
    if (!storedHash || !storedHash.startsWith('$2')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(rawPassword, storedHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role || 'admin',
        fullName: admin.full_name || admin.fullName || 'Administrator'
      },
      config.jwtSecret + storedHash,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name || admin.fullName || 'Administrator',
        role: admin.role || 'admin'
      }
    });
  } catch (err) {
    console.error('[Admin Auth Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
}

/**
 * Changes admin password in database with bcrypt hashing
 */
export async function changeAdminPassword(req, res, next) {
  try {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, current password, and new password are required'
      });
    }

    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    // Verify current password with bcrypt
    const storedHash = admin.password_hash || '';
    let isCurrentValid = false;

    if (storedHash.startsWith('$2')) {
      isCurrentValid = await bcrypt.compare(String(currentPassword).trim(), storedHash);
    } else {
      isCurrentValid = String(currentPassword).trim() === storedHash;
    }

    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password with bcrypt (10 rounds)
    const newHash = await bcrypt.hash(String(newPassword).trim(), 10);
    const updated = await updateAdminPassword(admin.id, newHash);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password in database'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns list of admin accounts (without password hashes)
 */
export async function getAdminsList(req, res, next) {
  try {
    const admins = await getAdminAccounts();
    return res.status(200).json({
      success: true,
      data: admins
    });
  } catch (err) {
    next(err);
  }
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

/**
 * Verifies active session token from authMiddleware
 */
export async function verifyAdminSession(req, res) {
  return res.status(200).json({
    success: true,
    user: req.admin
  });
}
