const assistantService = require('../services/assistantService');

/**
 * POST /api/assistant/chat
 * Multilingual conversational AI chat
 */
async function handleChat(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await assistantService.processChatMessage(userId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/assistant/voice
 * Voice STT -> AI Processing -> TTS response
 */
async function handleVoice(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await assistantService.processVoiceMessage(userId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/assistant/history/:sessionId
 * Conversation dialog history
 */
async function getHistory(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { sessionId } = req.params;
    const history = await assistantService.getConversationHistory(userId, sessionId);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleChat,
  handleVoice,
  getHistory,
};
