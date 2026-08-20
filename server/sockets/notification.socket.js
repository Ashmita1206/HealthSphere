const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function registerNotificationSocket(io) {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      // Allow unauthenticated connection for guest socket ping if needed, but mark unauthenticated
      socket.data = { authenticated: false };
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'healthsphere_secret');
      socket.data = { authenticated: true, userId: decoded.id || decoded.userId };
      next();
    } catch (_err) {
      socket.data = { authenticated: false };
      next();
    }
  });

  notificationNamespace.on('connection', (socket) => {
    const { authenticated, userId } = socket.data;

    if (authenticated && userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      logger.info(`Socket connected & joined room ${userRoom}`, { socketId: socket.id, userId });
    } else {
      logger.info(`Guest socket connected`, { socketId: socket.id });
    }

    socket.on('disconnect', () => {
      logger.info(`Notification socket disconnected`, { socketId: socket.id });
    });
  });

  return notificationNamespace;
}

module.exports = registerNotificationSocket;
