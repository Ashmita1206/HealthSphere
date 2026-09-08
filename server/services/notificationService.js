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
