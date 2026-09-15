const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const {
  generateTokens,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../services/tokenService');
const {
  generateAccessToken,
  createSession,
  rotateRefreshToken,
  handleFailedLogin,
  handleSuccessfulLogin,
  createPasswordResetToken,
  createEmailVerificationToken,
  hashToken,
} = require('../services/authService');

let logAuditEvent = null;
try {
  logAuditEvent = require('../services/auditService').logAuditEvent;
} catch (_e) {}

async function signup(req, res, next) {
  try {
    const { email, password, fullName, name, role } = req.body;
    const userName = (fullName || name || '').trim();
    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = role && ['patient', 'doctor', 'nurse', 'admin'].includes(role) ? role : 'patient';
    const user = new User({
      name: userName,
      email: email.toLowerCase(),
      password: hashed,
      role: assignedRole,
    });

    let verificationToken = null;
    if (typeof createEmailVerificationToken === 'function') {
      verificationToken = createEmailVerificationToken(user);
    }
    await user.save();

    let rawRefreshToken = null;
    try {
      const sessionResult = await createSession(user, req);
      rawRefreshToken = sessionResult.rawRefreshToken;
    } catch (_e) {}

    const { accessToken, refreshToken: fallbackRefreshToken } = generateTokens(user._id, user.role || assignedRole);
    const finalRefreshToken = rawRefreshToken || fallbackRefreshToken;

    setAuthCookies(res, { accessToken, refreshToken: finalRefreshToken });

    if (logAuditEvent) {
      await logAuditEvent({
        userId: user._id,
        action: 'AUTH_SIGNUP_SUCCESS',
        resource: 'User',
        role: user.role || assignedRole,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success',
        details: { email: user.email },
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: finalRefreshToken,
      emailVerificationToken: verificationToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await handleFailedLogin(null, req, 'User does not exist').catch(() => {});
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isAccountLocked && user.isAccountLocked()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      await handleFailedLogin(user, req, 'Account locked').catch(() => {});
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to excessive failed attempts. Try again in ${minutesRemaining} minute(s).`,
        lockUntil: user.lockUntil,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await handleFailedLogin(user, req, 'Incorrect password').catch(() => {});
      if (logAuditEvent) {
        await logAuditEvent({
          userId: user._id,
          action: 'AUTH_LOGIN_FAILED',
          resource: 'User',
          role: user.role || 'patient',
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          status: 'failed',
          details: { reason: 'bad_password' },
        }).catch(() => {});
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await handleSuccessfulLogin(user, req).catch(() => {});

    let rawRefreshToken = null;
    try {
      const sessionResult = await createSession(user, req);
      rawRefreshToken = sessionResult.rawRefreshToken;
    } catch (_e) {}

    const { accessToken, refreshToken: fallbackRefreshToken } = generateTokens(user._id, user.role || 'patient');
    const finalRefreshToken = rawRefreshToken || fallbackRefreshToken;

    setAuthCookies(res, { accessToken, refreshToken: finalRefreshToken });

    if (logAuditEvent) {
      await logAuditEvent({
        userId: user._id,
        action: 'AUTH_LOGIN_SUCCESS',
        resource: 'User',
        role: user.role || 'patient',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success',
        details: { email: user.email },
      }).catch(() => {});
    }

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: finalRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function refreshTokenHandler(req, res, next) {
  try {
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    const incomingToken = req.body?.refreshToken || req.cookies?.refreshToken || req.headers?.['x-refresh-token'] || headerToken;

    if (!incomingToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    // Try rotateRefreshToken first if session token format
    if (incomingToken.includes('.')) {
      try {
        const result = await rotateRefreshToken(incomingToken);
        setAuthCookies(res, { accessToken: result.accessToken, refreshToken: result.refreshToken });
        return res.json({
          success: true,
          token: result.accessToken,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        });
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: err.message || 'Token refresh failed',
        });
      }
    }

    // Standard JWT refresh token
    const decoded = verifyRefreshToken(incomingToken);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role || 'patient');
    setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

    if (logAuditEvent) {
      await logAuditEvent({
        userId: user._id,
        action: 'AUTH_TOKEN_REFRESH_SUCCESS',
        resource: 'Session',
        role: user.role || 'patient',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success',
      }).catch(() => {});
    }

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role || 'patient' },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token', error: error.message });
  }
}

const refresh = refreshTokenHandler;

async function getSessions(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const sessions = await Session.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select('-refreshTokenHash -tokenFamily')
      .sort({ lastActive: -1 })
      .lean();

    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

async function revokeSessionHandler(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { sessionId } = req.params;

    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isRevoked = true;
    session.revokedReason = req.body?.reason || 'User initiated manual revocation';
    await session.save();

    res.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    clearAuthCookies(res);
    const token = req.body?.refreshToken || req.headers?.['x-refresh-token'];
    if (token && token.includes('.')) {
      const [sessionId] = token.split('.');
      await Session.findByIdAndUpdate(sessionId, {
        isRevoked: true,
        revokedReason: 'User logged out',
      }).catch(() => {});
    }

    if (req.user?._id && logAuditEvent) {
      await logAuditEvent({
        userId: req.user._id,
        action: 'AUTH_LOGOUT',
        resource: 'Session',
        role: req.user.role || 'patient',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success',
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

async function getLoginHistory(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const history = await LoginHistory.find({ userId })
      .sort({ attemptedAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists in our system, a password reset link has been dispatched.',
      });
    }

    const resetToken = createPasswordResetToken(user);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Valid token and new password (min 6 chars) required' });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await Session.updateMany({ userId: user._id }, { isRevoked: true, revokedReason: 'Password was changed' });

    res.json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification token is invalid or has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ success: true, message: 'Email address verified successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  refresh,
  refreshTokenHandler,
  getSessions,
  revokeSessionHandler,
  logout,
  getLoginHistory,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
