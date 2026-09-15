const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
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
    const user = new User({
      name: userName,
      email: email.toLowerCase(),
      password: hashed,
      role: role && ['patient', 'doctor', 'nurse', 'admin'].includes(role) ? role : 'patient',
    });

    const verificationToken = createEmailVerificationToken(user);
    await user.save();

    const accessToken = generateAccessToken(user);
    const { rawRefreshToken } = await createSession(user, req);

    res.status(201).json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: rawRefreshToken,
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
      await handleFailedLogin(null, req, 'User does not exist');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isAccountLocked()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      await handleFailedLogin(user, req, 'Account locked');
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to excessive failed attempts. Try again in ${minutesRemaining} minute(s).`,
        lockUntil: user.lockUntil,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await handleFailedLogin(user, req, 'Incorrect password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await handleSuccessfulLogin(user, req);

    const accessToken = generateAccessToken(user);
    const { rawRefreshToken } = await createSession(user, req);

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: rawRefreshToken,
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
    const combinedToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!combinedToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const result = await rotateRefreshToken(combinedToken);
    res.json({
      success: true,
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
}

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
    session.revokedReason = req.body.reason || 'User initiated manual revocation';
    await session.save();

    res.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'];
    if (token && token.includes('.')) {
      const [sessionId] = token.split('.');
      await Session.findByIdAndUpdate(sessionId, {
        isRevoked: true,
        revokedReason: 'User logged out',
      });
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
      // Return success to avoid email enumeration
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
      resetToken, // Returned for dev/test workflows; in prod sent via secure email
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

    // Revoke all existing sessions upon password reset
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
  refreshTokenHandler,
  getSessions,
  revokeSessionHandler,
  logout,
  getLoginHistory,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
