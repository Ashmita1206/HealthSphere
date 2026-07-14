const MAX_HISTORY = Number(process.env.MAX_HISTORY) || 20;
const SESSION_TTL = Number(process.env.SESSION_TTL) || 30 * 60 * 1000; // 30 minutes

const sessionHistory = new Map();
const sessionTimers = new Map();

/**
 * Create a new in-memory session
 */
function createSession(conversationId) {
  if (!sessionHistory.has(conversationId)) {
    sessionHistory.set(conversationId, []);
  }

  refreshSession(conversationId);
}

/**
 * Refresh session expiry timer
 */
function refreshSession(conversationId) {
  if (sessionTimers.has(conversationId)) {
    clearTimeout(sessionTimers.get(conversationId));
  }

  const timer = setTimeout(() => {
    sessionHistory.delete(conversationId);
    sessionTimers.delete(conversationId);

    console.log(`🗑 Session expired: ${conversationId}`);
  }, SESSION_TTL);

  sessionTimers.set(conversationId, timer);
}

/**
 * Add message to short-term memory
 */
function addMessage(conversationId, message) {
  createSession(conversationId);

  const history = sessionHistory.get(conversationId);

  history.push(message);

  while (history.length > MAX_HISTORY) {
    history.shift();
  }

  sessionHistory.set(conversationId, history);

  refreshSession(conversationId);
}

/**
 * Get chat history
 */
function getHistory(conversationId) {
  refreshSession(conversationId);

  return sessionHistory.get(conversationId) || [];
}

/**
 * Load previous messages from MongoDB
 */
function loadHistory(conversationId, messages = []) {
  sessionHistory.set(conversationId, messages.slice(-MAX_HISTORY));

  refreshSession(conversationId);
}

/**
 * Clear session manually
 */
function clearHistory(conversationId) {
  sessionHistory.delete(conversationId);

  if (sessionTimers.has(conversationId)) {
    clearTimeout(sessionTimers.get(conversationId));
    sessionTimers.delete(conversationId);
  }
}

module.exports = {
  createSession,
  addMessage,
  getHistory,
  loadHistory,
  clearHistory,
};
