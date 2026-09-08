const logger = require('../utils/logger');

let ioInstance = null;

/**
 * Configure global Socket.IO server instance
 */
function setIO(io) {
  ioInstance = io;
  logger.info('RealtimeService Socket.IO instance configured');
}

/**
 * Retrieve global Socket.IO server instance
 */
function getIO() {
  return ioInstance;
}

/**
 * Broadcast event to a specific room on both default and notification namespaces
 */
function broadcastToRoom(room, event, data) {
  if (!ioInstance) return;

  try {
    ioInstance.to(room).emit(event, data);

    // Also broadcast to collaboration namespace if available
    const collabNs = ioInstance.of('/collaboration');
    if (collabNs) {
      collabNs.to(room).emit(event, data);
    }
  } catch (err) {
    logger.warn(`Failed to broadcast event ${event} to room ${room}`, { error: err.message });
  }
}

/**
 * Broadcast event directly to an isolated user room
 */
function broadcastToUser(userId, event, data) {
  if (!userId || !ioInstance) return;
  const userRoom = `user:${userId.toString()}`;
  broadcastToRoom(userRoom, event, data);
}

/**
 * Broadcast real-time notification to user
 */
function broadcastNotification(userId, notification) {
  if (!userId || !ioInstance) return;

  try {
    const userRoom = `user:${userId.toString()}`;
    const payload = {
      notification,
      timestamp: new Date().toISOString(),
    };

    // Broadcast on default namespace
    ioInstance.to(userRoom).emit('notification', payload);
    ioInstance.to(userRoom).emit('new_notification', payload);

    // Broadcast on /notifications namespace
    const notifNs = ioInstance.of('/notifications');
    if (notifNs) {
      notifNs.to(userRoom).emit('notification', payload);
    }
  } catch (err) {
    logger.warn(`Failed to broadcast notification to user ${userId}`, { error: err.message });
  }
}

/**
 * Broadcast real-time timeline live update to user
 */
function broadcastTimelineUpdate(userId, timelineEvent) {
  if (!userId || !ioInstance) return;

  try {
    const userRoom = `user:${userId.toString()}`;
    const payload = {
      event: timelineEvent,
      timestamp: new Date().toISOString(),
    };

    ioInstance.to(userRoom).emit('timeline_update', payload);

    const collabNs = ioInstance.of('/collaboration');
    if (collabNs) {
      collabNs.to(userRoom).emit('timeline_update', payload);
    }
  } catch (err) {
    logger.warn(`Failed to broadcast timeline update to user ${userId}`, { error: err.message });
  }
}

/**
 * Broadcast live consultation status change
 */
function broadcastConsultationStatus(consultationId, statusData) {
  if (!consultationId || !ioInstance) return;

  const room = `consultation:${consultationId.toString()}`;
  broadcastToRoom(room, 'consultation_status', {
    consultationId,
    ...statusData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast live prescription update to consultation room
 */
function broadcastPrescriptionUpdate(consultationId, prescriptionData) {
  if (!consultationId || !ioInstance) return;

  const room = `consultation:${consultationId.toString()}`;
  broadcastToRoom(room, 'prescription_updated', {
    consultationId,
    ...prescriptionData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast consultation message
 */
function broadcastConsultationMessage(consultationId, message) {
  if (!consultationId || !ioInstance) return;

  const room = `consultation:${consultationId.toString()}`;
  broadcastToRoom(room, 'new_message', message);
}

module.exports = {
  setIO,
  getIO,
  broadcastToRoom,
  broadcastToUser,
  broadcastNotification,
  broadcastTimelineUpdate,
  broadcastConsultationStatus,
  broadcastPrescriptionUpdate,
  broadcastConsultationMessage,
};
