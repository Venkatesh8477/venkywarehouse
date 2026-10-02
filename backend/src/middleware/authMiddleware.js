const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { errorResponse } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const [scheme, token] = (req.get('authorization') || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json(errorResponse('Authentication required'));
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json(errorResponse('Insufficient permissions'));
  }
  return next();
};

module.exports = { authMiddleware, requireRoles };