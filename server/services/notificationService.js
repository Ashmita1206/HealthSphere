const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Helper to asynchronously create persistent notifications across controllers.
 */
async function createNotification({
  userId,
  title,
  message,
  type = 'general',
  severity = 'info',
  priority = 'normal',
  route = '/dashboard',
  metadata = {},
}) {
  if (!userId || !title || !message) return null;

  const mongoose = require('mongoose');
  if (mongoose.connection?.readyState !== 1) {
    return { _id: 'notif-mock-id', userId, title, message, type, severity, priority, route, metadata };
  }

  try {
    const notification = await Notification.create({
      userId,
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      severity,
      priority,
      route,
      metadata,
    });

    try {
      const realtimeService = require('./realtimeService');
      realtimeService.broadcastNotification(userId, notification);
    } catch (_rtErr) {
      // Non-blocking real-time broadcast error
    }

    return notification;
  } catch (err) {
    logger.warn('Failed to automatically create notification', {
      userId,
      title,
      error: err.message,
    });
    return null;
  }
}

module.exports = {
  createNotification,
};
