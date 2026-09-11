const zlib = require('zlib');

/**
 * Native Node.js zlib HTTP response compression middleware
 * Compresses JSON and text payloads when client supports gzip or deflate.
 */
function compressionMiddleware(options = {}) {
  const threshold = options.threshold || 1024; // 1KB threshold

  return (_req, res, next) => {
    const acceptEncoding = _req.headers['accept-encoding'] || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsDeflate = acceptEncoding.includes('deflate');

    if (!supportsGzip && !supportsDeflate) {
      return next();
    }

    const originalSend = res.send.bind(res);

    res.send = (body) => {
      // Only compress strings or buffers
      let buffer;
      if (typeof body === 'string') {
        buffer = Buffer.from(body, 'utf8');
      } else if (Buffer.isBuffer(body)) {
        buffer = body;
      } else if (typeof body === 'object' && body !== null) {
        buffer = Buffer.from(JSON.stringify(body), 'utf8');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else {
        return originalSend(body);
      }

      if (buffer.length < threshold) {
        return originalSend(buffer);
      }

      res.setHeader('Vary', 'Accept-Encoding');

      if (supportsGzip) {
        try {
          const compressed = zlib.gzipSync(buffer);
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Content-Length', compressed.length);
          return originalSend(compressed);
        } catch (_e) {
          return originalSend(buffer);
        }
      } else if (supportsDeflate) {
        try {
          const compressed = zlib.deflateSync(buffer);
          res.setHeader('Content-Encoding', 'deflate');
          res.setHeader('Content-Length', compressed.length);
          return originalSend(compressed);
        } catch (_e) {
          return originalSend(buffer);
        }
      }

      return originalSend(buffer);
    };

    next();
  };
}

module.exports = { compressionMiddleware };
