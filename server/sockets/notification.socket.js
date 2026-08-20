const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function registerNotificationSocket(io) {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.use((socket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization || '';
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    if (!token) {
      return next(new Error('Authentication required for notification stream'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'healthsphere_secret');
      const userId = decoded.id || decoded._id || decoded.userId;
      if (!userId) {
        return next(new Error('Invalid token payload'));
      }
      socket.data = { authenticated: true, userId };
      next();
    } catch (_err) {
      return next(new Error('Invalid or expired authentication token'));
    }
  });

  notificationNamespace.on('connection', (socket) => {
    const { userId } = socket.data;

    if (userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      logger.info(`Notification socket authenticated & joined isolated room ${userRoom}`, {
        socketId: socket.id,
        userId,
      });
    }

    socket.on('disconnect', () => {
      logger.info(`Notification socket disconnected`, { socketId: socket.id });
    });
  });

  return notificationNamespace;
}

module.exports = registerNotificationSocket;
