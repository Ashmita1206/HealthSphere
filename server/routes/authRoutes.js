const router = require('express').Router();
const Joi = require('joi');
const {
  signup,
  login,
  refreshTokenHandler,
  getSessions,
  revokeSessionHandler,
  logout,
  getLoginHistory,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require('../controllers/authController');
const { validate } = require('../middlewares/validate');
const { authLimiter, sensitiveLimiter } = require('../middlewares/rateLimiters');
const { protect } = require('../middlewares/authMiddleware');

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  fullName: Joi.string().min(2).max(100).optional(),
  name: Joi.string().min(2).max(100).optional(),
  role: Joi.string().valid('patient', 'doctor', 'nurse', 'admin').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

// Primary auth endpoints
router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, validate(refreshSchema), refreshTokenHandler);
router.post('/logout', logout);

// Session and Device management (Protected)
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSessionHandler);
router.get('/login-history', protect, getLoginHistory);

// Password Reset & Verification (Protected by sensitiveLimiter)
router.post('/forgot-password', sensitiveLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', sensitiveLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/verify-email', sensitiveLimiter, validate(verifyEmailSchema), verifyEmail);

module.exports = router;
