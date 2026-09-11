const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/permissionMiddleware');
const c = require('../controllers/securityController');

// All security management endpoints require authentication
router.use(protect);

// Session Management
router.get('/sessions', c.getSessions);
router.delete('/sessions/:id', c.revokeSession);
router.post('/sessions/revoke-others', c.revokeOtherSessions);

// Device Management
router.get('/devices', c.getDevices);
router.delete('/devices/:id', c.untrustDevice);

// Login History & Alerts
router.get('/login-history', c.getLoginHistory);
router.get('/alerts', c.getSecurityAlerts);

// Two-Factor Authentication (TOTP)
router.post('/2fa/generate', c.generate2fa);
router.post('/2fa/verify', c.verifyAndEnable2fa);
router.post('/2fa/disable', c.disable2fa);

// Emergency Access Tokens (Doctors, Paramedics, Admins only)
router.post('/emergency-token', requireRole('doctor', 'paramedic', 'admin'), c.createEmergencyToken);

module.exports = router;
