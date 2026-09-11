/**
 * HealthSphere HTTP Compression Middleware
 * Uses Node.js native zlib for zero-dependency gzip / deflate payload compression
 */

const zlib = require('zlib');

const COMPRESSION_THRESHOLD = 1024; // 1KB threshold

function compressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  if (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate')) {
    return next();
  }

  const originalSend = res.send.bind(res);

  res.send = function (body) {
    if (res.headersSent) {
      return originalSend(body);
    }

    // Convert strings/JSON to buffer
    let buffer;
    if (Buffer.isBuffer(body)) {
      buffer = body;
    } else if (typeof body === 'string') {
      buffer = Buffer.from(body, 'utf-8');
    } else if (typeof body === 'object' && body !== null) {
      buffer = Buffer.from(JSON.stringify(body), 'utf-8');
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
    } else {
      return originalSend(body);
    }

    // Check threshold
    if (buffer.length < COMPRESSION_THRESHOLD) {
      return originalSend(body);
    }

    try {
      if (acceptEncoding.includes('gzip')) {
        const compressed = zlib.gzipSync(buffer);
        res.setHeader('Content-Encoding', 'gzip');
        res.removeHeader('Content-Length');
        res.setHeader('Vary', 'Accept-Encoding');
        return originalSend(compressed);
      } else if (acceptEncoding.includes('deflate')) {
        const compressed = zlib.deflateSync(buffer);
        res.setHeader('Content-Encoding', 'deflate');
        res.removeHeader('Content-Length');
        res.setHeader('Vary', 'Accept-Encoding');
        return originalSend(compressed);
      }
    } catch (_err) {
      return originalSend(body);
    }

    return originalSend(body);
  };

  next();
}

module.exports = { compressionMiddleware, COMPRESSION_THRESHOLD };
