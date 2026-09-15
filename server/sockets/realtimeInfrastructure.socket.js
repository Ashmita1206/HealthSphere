const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt.config');
const { presenceService } = require('../services/presenceService');
const logger = require('../utils/logger');

function authenticateSocket(socket, next) {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      '';
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    if (!token) {
      // Support guest/public connections with anonymous presence
      socket.user = { id: `anon_${socket.id}`, name: 'Guest User', role: 'guest' };
      return next();
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded._id || decoded.userId;

    socket.user = {
      id: userId.toString(),
      _id: userId.toString(),
      email: decoded.email,
      role: decoded.role || 'patient',
      name: decoded.name || 'HealthSphere User',
    };

    next();
  } catch (_err) {
    socket.user = { id: `anon_${socket.id}`, name: 'Guest User', role: 'guest' };
    next();
  }
}

function registerRealtimeInfrastructureSocket(io) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.user;
    const userState = presenceService.registerConnection(socket.id, user);

    // Join private user room for direct push notifications
    socket.join(`user:${user.id}`);
    // Join hospital presence broadcast room
    socket.join('presence:hospital');
    // Join emergency broadcast channel
    socket.join('emergency:broadcast');

    logger.info('Real-time client connected', {
      socketId: socket.id,
      userId: user.id,
      role: user.role,
    });

    // Notify hospital presence of new doctor/staff arrival
    if (user.role === 'doctor') {
      io.to('presence:hospital').emit('doctor:presence:update', {
        doctorId: user.id,
        name: user.name,
        status: userState.status,
        timestamp: new Date().toISOString(),
      });
    }

    // Client heartbeat
    socket.on('presence:heartbeat', () => {
      presenceService.heartbeat(user.id);
      socket.emit('presence:heartbeat:ack', { timestamp: Date.now() });
    });

    // Update presence status (AVAILABLE, BUSY_IN_CONSULTATION, ON_CALL, WAITING_ROOM)
    socket.on('presence:status:update', (data) => {
      const updated = presenceService.updateStatus(user.id, data.status, data.metadata);
      if (updated) {
        if (user.role === 'doctor') {
          io.to('presence:hospital').emit('doctor:presence:update', {
            doctorId: user.id,
            name: user.name,
            status: data.status,
            metadata: data.metadata,
          });
        } else {
          io.to('presence:hospital').emit('patient:presence:update', {
            patientId: user.id,
            name: user.name,
            status: data.status,
            metadata: data.metadata,
          });
        }
      }
    });

    // Consultation Room Join
    socket.on('consultation:room:join', ({ consultationId }) => {
      if (!consultationId) return;
      const room = `consultation:${consultationId}`;
      socket.join(room);
      const members = presenceService.joinConsultation(consultationId, user.id);
      io.to(room).emit('consultation:participant:joined', {
        consultationId,
        userId: user.id,
        name: user.name,
        role: user.role,
        activeMembers: members,
      });
    });

    // Consultation Room Leave
    socket.on('consultation:room:leave', ({ consultationId }) => {
      if (!consultationId) return;
      const room = `consultation:${consultationId}`;
      socket.leave(room);
      const members = presenceService.leaveConsultation(consultationId, user.id);
      io.to(room).emit('consultation:participant:left', {
        consultationId,
        userId: user.id,
        activeMembers: members,
      });
    });

    // Typing Indicators
    socket.on('typing:start', ({ consultationId }) => {
      if (!consultationId) return;
      socket.to(`consultation:${consultationId}`).emit('typing:indicator', {
        consultationId,
        userId: user.id,
        name: user.name,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ consultationId }) => {
      if (!consultationId) return;
      socket.to(`consultation:${consultationId}`).emit('typing:indicator', {
        consultationId,
        userId: user.id,
        name: user.name,
        isTyping: false,
      });
    });

    // Emergency Broadcast
    socket.on('emergency:broadcast:trigger', (payload) => {
      const alert = {
        id: `EMG-${Date.now()}`,
        code: payload.code || 'CODE_BLUE',
        severity: payload.severity || 'CRITICAL',
        department: payload.department || 'Emergency Care',
        patientId: payload.patientId || null,
        message: payload.message || 'Medical Emergency Triggered',
        initiatedBy: { id: user.id, name: user.name, role: user.role },
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all sockets subscribed to emergency:broadcast
      io.to('emergency:broadcast').emit('emergency:broadcast:alert', alert);
      logger.error('CRITICAL EMERGENCY BROADCAST DISPATCHED', alert);
    });

    // Connection Recovery & Missed Events Replay
    socket.on('connection:recover', ({ lastEventId }) => {
      const missedEvents = presenceService.getMissedEvents(user.id, lastEventId);
      socket.emit('connection:recovered', {
        success: true,
        replayedCount: missedEvents.length,
        events: missedEvents,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const leftUser = presenceService.removeConnection(socket.id);
      if (leftUser) {
        if (leftUser.role === 'doctor') {
          io.to('presence:hospital').emit('doctor:presence:update', {
            doctorId: user.id,
            name: user.name,
            status: 'OFFLINE',
          });
        }
      }
      logger.info('Real-time client disconnected', { socketId: socket.id, userId: user.id });
    });
  });
}

module.exports = {
  registerRealtimeInfrastructureSocket,
};
