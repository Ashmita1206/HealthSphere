const digitalTwinService = require('../services/digitalTwinService');
const DigitalTwin = require('../models/DigitalTwin');

/**
 * GET /api/ai/digital-twin
 * Retrieve user's active AI Digital Twin along with health narrative
 */
async function getDigitalTwin(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;

    let twin = await DigitalTwin.findOne({ userId });
    if (!twin) {
      twin = await digitalTwinService.buildDigitalTwin(userId);
    }

    const [narrative, nextEvent] = await Promise.all([
      digitalTwinService.generateHealthNarrative(userId, twin),
      digitalTwinService.predictNextHealthEvent(userId, twin),
    ]);

    res.status(200).json({
      success: true,
      data: {
        digitalTwin: twin,
        narrative: narrative.narrative,
        nextPredictedEvent: nextEvent.nextEvent,
        confidenceScore: twin.confidenceScore,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/digital-twin/rebuild
 * Force recalibration and rebuild of user's AI Digital Twin
 */
async function rebuildDigitalTwin(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const twin = await digitalTwinService.buildDigitalTwin(userId);

    res.status(200).json({
      success: true,
      message: 'AI Digital Twin successfully rebuilt and recalibrated',
      data: twin,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/health-copilot/chat
 * Multi-turn or single-turn conversational AI Health Copilot grounded in complete Digital Twin
 */
async function chatHealthCopilot(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required for Health Copilot',
      });
    }

    const response = await digitalTwinService.chatWithHealthCopilot(userId, message);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDigitalTwin,
  rebuildDigitalTwin,
  chatHealthCopilot,
};
