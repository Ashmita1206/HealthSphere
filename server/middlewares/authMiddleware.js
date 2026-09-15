const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { getJwtSecret } = require("../config/jwt.config");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch (_err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 * Allowed roles: 'super_admin', 'admin', 'doctor', 'patient', 'support'
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }

    const userRole = req.user.role || 'patient';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of [${allowedRoles.join(', ')}]`,
        currentRole: userRole,
      });
    }

    next();
  };
}

module.exports = { protect, authorizeRoles };


