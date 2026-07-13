function generateConversationTitle(message) {
  if (!message) return 'New Chat';

  const cleaned = message.replace(/[^\w\s]/g, '').trim();

  const words = cleaned.split(/\s+/);

  return words.slice(0, 6).join(' ');
}

module.exports = {
  generateConversationTitle,
};
