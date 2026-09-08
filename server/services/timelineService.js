const HealthTimeline = require('../models/HealthTimeline');
const logger = require('../utils/logger');

/**
 * Helper to asynchronously record health timeline events across controllers
 * without interrupting the primary request flow.
 */
async function recordTimelineEvent({
  userId,
  eventType = 'general',
  title,
  description,
  category,
  metadata = {},
  relatedId = null,
}) {
  if (!userId || !title || !description) return null;

  try {
    const event = await HealthTimeline.create({
      userId,
      eventType,
      title: String(title).trim(),
      description: String(description).trim(),
      category: category || eventType || 'general',
      metadata,
      relatedId,
    });
    return event;
  } catch (err) {
    logger.warn('Failed to automatically record health timeline event', {
      userId,
      title,
      error: err.message,
    });
    return null;
  }
}

module.exports = {
  recordTimelineEvent,
};
