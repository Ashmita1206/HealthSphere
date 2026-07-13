function sanitizeMessage(message) {
  return message.trim().replace(/\s+/g, ' ');
}

module.exports = sanitizeMessage;
