const logger = require('../utils/logger');
const events = require('../utils/chatEvents');

const { success, failure } = require('../utils/responseFormatter');

const {
  createConversation,
  getConversation,
} = require('../services/conversation.service');

const {
  createSession,
  loadHistory,
  clearHistory,
} = require('../services/chatHistory.service');

const { validateUser } = require('../services/chatValidation.service');

const { handleUserMessage } = require('../services/chatHandler.service');

function registerChatSocket(io) {
  io.on(events.CONNECTION, (socket) => {
    logger.info('Socket Connected', {
      socketId: socket.id,
    });

    /*
    ==========================================
    START CONVERSATION
    ==========================================
    */

    socket.on(events.START_CONVERSATION, async ({ userId }) => {
      try {
        if (!userId) {
          return socket.emit(
            events.CHAT_ERROR,
            failure('User ID is required.'),
          );
        }

        await validateUser(userId);

        const conversation = await createConversation(userId);

        createSession(conversation._id.toString());

        socket.emit(
          events.CONVERSATION_STARTED,
          success({
            conversationId: conversation._id,
            title: conversation.title,
          }),
        );

        logger.info('Conversation Started', {
          socketId: socket.id,
          conversationId: conversation._id,
          userId,
        });
      } catch (error) {
        logger.error('Start Conversation Failed', {
          error: error.message,
        });

        socket.emit(
          events.CHAT_ERROR,
          failure(error.message || 'Unable to start conversation.'),
        );
      }
    });

    /*
    ==========================================
    LOAD CONVERSATION
    ==========================================
    */

    socket.on(events.LOAD_CONVERSATION, async ({ conversationId }) => {
      try {
        if (!conversationId) {
          return socket.emit(
            events.CHAT_ERROR,
            failure('Conversation ID is required.'),
          );
        }

        const conversation = await getConversation(conversationId);

        if (!conversation) {
          return socket.emit(
            events.CHAT_ERROR,
            failure('Conversation not found.'),
          );
        }

        loadHistory(conversationId, conversation.messages);

        socket.emit(events.CONVERSATION_LOADED, success(conversation));

        logger.info('Conversation Loaded', {
          conversationId,
          socketId: socket.id,
        });
      } catch (error) {
        logger.error('Load Conversation Failed', {
          error: error.message,
          conversationId,
        });

        socket.emit(events.CHAT_ERROR, failure('Unable to load conversation.'));
      }
    });

    /*
    ==========================================
    SEND MESSAGE
    ==========================================
    */

    socket.on(events.SEND_MESSAGE, async ({ conversationId, message }) => {
      try {
        if (!conversationId || !message) {
          return socket.emit(
            events.CHAT_ERROR,
            failure('Conversation ID and message are required.'),
          );
        }

        socket.emit(events.BOT_TYPING, {
          typing: true,
        });

        const aiResponse = await handleUserMessage({
          conversationId,
          userMessage: message,
        });

        socket.emit(events.RECEIVE_MESSAGE, success(aiResponse));

        socket.emit(events.BOT_TYPING, {
          typing: false,
        });

        logger.info('Message Processed', {
          conversationId,
          socketId: socket.id,
        });
      } catch (error) {
        logger.error('Message Processing Failed', {
          error: error.message,
          conversationId,
        });

        socket.emit(events.BOT_TYPING, {
          typing: false,
        });

        socket.emit(events.CHAT_ERROR, failure(error.message));
      }
    });

    /*
    ==========================================
    END CONVERSATION
    ==========================================
    */

    socket.on(events.END_CONVERSATION, ({ conversationId }) => {
      try {
        if (!conversationId) {
          return socket.emit(
            events.CHAT_ERROR,
            failure('Conversation ID is required.'),
          );
        }

        clearHistory(conversationId);

        logger.info('Conversation Ended', {
          conversationId,
          socketId: socket.id,
        });

        socket.emit(
          events.END_CONVERSATION,
          success({
            message: 'Conversation ended successfully.',
          }),
        );
      } catch (error) {
        logger.error('Failed to end conversation', {
          error: error.message,
          conversationId,
        });

        socket.emit(events.CHAT_ERROR, failure('Unable to end conversation.'));
      }
    });

    /*
    ==========================================
    DISCONNECT
    ==========================================
    */

    socket.on(events.DISCONNECT, () => {
      logger.info('Socket Disconnected', {
        socketId: socket.id,
      });
    });
  });
}

module.exports = registerChatSocket;
