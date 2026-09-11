const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateTokens, verifyRefreshToken, setAuthCookies, clearAuthCookies } = require("../services/tokenService");
const { logAuditEvent } = require("../services/auditService");

async function signup(req, res, next) {
  try {
    const { email, password, fullName, name } = req.body;
    const userName = (fullName || name || "").trim();
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: userName, email, password: hashed });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role || 'patient');
    setAuthCookies(res, { accessToken, refreshToken });

    await logAuditEvent({
      userId: user._id,
      action: 'AUTH_SIGNUP_SUCCESS',
      resource: 'User',
      role: user.role || 'patient',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success',
      details: { email: user.email },
    });

    res.status(201).json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role || 'patient' },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      await logAuditEvent({
        userId: user._id,
        action: 'AUTH_LOGIN_FAILED',
        resource: 'User',
        role: user.role || 'patient',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'failed',
        details: { reason: 'bad_password' },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role || 'patient');
    setAuthCookies(res, { accessToken, refreshToken });

    await logAuditEvent({
      userId: user._id,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'User',
      role: user.role || 'patient',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success',
      details: { email: user.email },
    });

    res.json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role || 'patient' },
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const incomingToken = req.body?.refreshToken || req.cookies?.refreshToken || headerToken;

    if (!incomingToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    const decoded = verifyRefreshToken(incomingToken);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User session not found" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role || 'patient');
    setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

    await logAuditEvent({
      userId: user._id,
      action: 'AUTH_TOKEN_REFRESH_SUCCESS',
      resource: 'Session',
      role: user.role || 'patient',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role || 'patient' },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token", error: error.message });
  }
}

async function logout(req, res, next) {
  try {
    clearAuthCookies(res);
    if (req.user?._id) {
      await logAuditEvent({
        userId: req.user._id,
        action: 'AUTH_LOGOUT',
        resource: 'Session',
        role: req.user.role || 'patient',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success',
      });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login, refresh, logout };
