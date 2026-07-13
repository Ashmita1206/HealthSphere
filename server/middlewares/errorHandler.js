const logger = require("../utils/logger");

function errorHandler(err, _req, res, _next) {
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || "Server error" });
}

module.exports = { errorHandler };
