/**
 * HealthSphere Role & Permission Enforcement Middleware
 */

const { hasPermission } = require('../constants/permissions');

/**
 * Ensures user has at least one of the required roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const role = req.user.role || 'patient';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Ensures user's role has the designated granular permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const role = req.user.role || 'patient';
    if (!hasPermission(role, permission)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role "${role}" lacks permission "${permission}"`,
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requirePermission,
};
