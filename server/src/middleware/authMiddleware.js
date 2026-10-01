import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { findAdminByUsername } from '../db/db.js';

/**
 * Authentication middleware that verifies JWT token signed with JWT_SECRET
 */
export async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token format.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Admin session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Invalid or forged authentication token.'
      });
    }

    // Verify admin still exists and is active in database
    const admin = await findAdminByUsername(decoded.username);
    if (!admin || admin.active === false) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or has been deactivated.'
      });
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      role: admin.role || 'admin',
      fullName: admin.full_name || admin.fullName || 'Administrator'
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    return res.status(500).json({
      success: false,
      message: 'System error during authorization.'
    });
  }
}
