const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { processAIRequest } = require('../services/ai/aiService');
const logger = require('../utils/logger');

/**
 * Get all chat sessions for user
 */
async function getSessions(req, res, next) {
  try {
    const userId = req.user._id;
    const sessions = await ChatSession.find({ userId }).sort({ isPinned: -1, lastActivityAt: -1 });
    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new chat session
 */
async function createSession(req, res, next) {
  try {
    const userId = req.user._id;
    const { title } = req.body;
    const session = await ChatSession.create({
      userId,
      title: title || 'New Medical Conversation',
    });
    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rename session
 */
async function renameSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId: req.user._id },
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete session
 */
async function deleteSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    await Promise.all([
      ChatSession.deleteOne({ _id: sessionId, userId: req.user._id }),
      ChatMessage.deleteMany({ sessionId }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search Chat messages or sessions
 */
async function searchChats(req, res, next) {
  try {
    const { query } = req.query;
    const userId = req.user._id;
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(query, 'i');
    const messages = await ChatMessage.find({ userId, content: regex }).populate('sessionId', 'title').limit(20);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get message history for a session
 */
async function getMessages(req, res, next) {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send Message & process AI response with streaming SSE support
 */
async function sendMessage(req, res, next) {
  try {
    const userId = req.user._id;
    const { sessionId, content, attachments = [] } = req.body;

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const newSession = await ChatSession.create({
        userId,
        title: content.substring(0, 30) + '...',
      });
      activeSessionId = newSession._id;
    }

    // Save user message
    const userMsg = await ChatMessage.create({
      sessionId: activeSessionId,
      userId,
      sender: 'user',
      content,
      attachments,
    });

    // Fetch previous history
    const history = await ChatMessage.find({ sessionId: activeSessionId }).sort({ createdAt: 1 }).limit(10);

    // Set SSE headers if client requested streaming response
    if (req.headers.accept === 'text/event-stream') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      res.write(`data: ${JSON.stringify({ type: 'start', userMessage: userMsg })}\n\n`);

      const aiResult = await processAIRequest({ userId, userPrompt: content, chatHistory: history });

      // Stream text chunks
      const chunkSize = 15;
      for (let i = 0; i < aiResult.text.length; i += chunkSize) {
        const chunk = aiResult.text.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }

      // Save assistant message
      const assistantMsg = await ChatMessage.create({
        sessionId: activeSessionId,
        userId,
        sender: 'assistant',
        content: aiResult.text,
        suggestedFollowUps: aiResult.suggestedFollowUps,
        tokensUsed: aiResult.tokensUsed,
      });

      // Update session last activity & title
      await ChatSession.findByIdAndUpdate(activeSessionId, {
        lastMessageText: aiResult.text.substring(0, 60),
        lastActivityAt: Date.now(),
      });

      res.write(`data: ${JSON.stringify({ type: 'done', assistantMessage: assistantMsg })}\n\n`);
      return res.end();
    } else {
      // Standard JSON response
      const aiResult = await processAIRequest({ userId, userPrompt: content, chatHistory: history });

      const assistantMsg = await ChatMessage.create({
        sessionId: activeSessionId,
        userId,
        sender: 'assistant',
        content: aiResult.text,
        suggestedFollowUps: aiResult.suggestedFollowUps,
        tokensUsed: aiResult.tokensUsed,
      });

      await ChatSession.findByIdAndUpdate(activeSessionId, {
        lastMessageText: aiResult.text.substring(0, 60),
        lastActivityAt: Date.now(),
      });

      return res.status(200).json({
        success: true,
        data: {
          sessionId: activeSessionId,
          userMessage: userMsg,
          assistantMessage: assistantMsg,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Message Feedback (like / dislike)
 */
async function feedbackMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const { feedback } = req.body; // 'like' | 'dislike' | null

    const updated = await ChatMessage.findByIdAndUpdate(messageId, { feedback }, { new: true });
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSessions,
  createSession,
  renameSession,
  deleteSession,
  searchChats,
  getMessages,
  sendMessage,
  feedbackMessage,
};
