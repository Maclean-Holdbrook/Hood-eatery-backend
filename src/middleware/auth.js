import jwt from 'jsonwebtoken';
import { sql } from '../config/database.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const users = await sql`
        SELECT * FROM users WHERE id = ${decoded.id}
      `;

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = users[0];
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Optional authentication - sets req.user if token exists, but doesn't require it
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, continue as guest
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const users = await sql`
        SELECT * FROM users WHERE id = ${decoded.id}
      `;

      if (users.length > 0) {
        req.user = users[0];
      }

      next();
    } catch (err) {
      // If token is invalid, continue as guest
      next();
    }
  } catch (error) {
    // On any error, continue as guest
    next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
