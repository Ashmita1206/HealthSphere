const zlib = require('zlib');

const COMPRESSION_THRESHOLD = 1024; // 1KB threshold

function createCompressionHandler(options = {}) {
  const threshold = options.threshold !== undefined ? options.threshold : COMPRESSION_THRESHOLD;

  return (req, res, next) => {
    const acceptEncoding = (req.headers && req.headers['accept-encoding']) || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsDeflate = acceptEncoding.includes('deflate');

    if (!supportsGzip && !supportsDeflate) {
      return next();
    }

    const originalSend = res.send.bind(res);

    res.send = function (body) {
      if (res.headersSent) {
        return originalSend(body);
      }

      let buffer;
      if (Buffer.isBuffer(body)) {
        buffer = body;
      } else if (typeof body === 'string') {
        buffer = Buffer.from(body, 'utf-8');
      } else if (typeof body === 'object' && body !== null) {
        buffer = Buffer.from(JSON.stringify(body), 'utf-8');
        if (typeof res.setHeader === 'function' && (!res.getHeader || !res.getHeader('Content-Type'))) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
      } else {
        return originalSend(body);
      }

      if (buffer.length < threshold) {
        return originalSend(body);
      }

      if (typeof res.setHeader === 'function') {
        res.setHeader('Vary', 'Accept-Encoding');
      }

      if (supportsGzip) {
        try {
          const compressed = zlib.gzipSync(buffer);
          if (typeof res.setHeader === 'function') {
            res.setHeader('Content-Encoding', 'gzip');
            if (typeof res.removeHeader === 'function') {
              res.removeHeader('Content-Length');
            } else {
              res.setHeader('Content-Length', compressed.length);
            }
          }
          return originalSend(compressed);
        } catch (_e) {
          return originalSend(buffer);
        }
      } else if (supportsDeflate) {
        try {
          const compressed = zlib.deflateSync(buffer);
          if (typeof res.setHeader === 'function') {
            res.setHeader('Content-Encoding', 'deflate');
            if (typeof res.removeHeader === 'function') {
              res.removeHeader('Content-Length');
            } else {
              res.setHeader('Content-Length', compressed.length);
            }
          }
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

/**
 * Dual-interface compression middleware:
 * Can be used directly: app.use(compressionMiddleware)
 * Or invoked as a factory: app.use(compressionMiddleware({ threshold: 500 }))
 */
function compressionMiddleware(reqOrOptions, res, next) {
  if (res && typeof next === 'function') {
    return createCompressionHandler({})(reqOrOptions, res, next);
  }
  const options = (typeof reqOrOptions === 'object' && reqOrOptions !== null) ? reqOrOptions : {};
  return createCompressionHandler(options);
}

module.exports = {
  compressionMiddleware,
  COMPRESSION_THRESHOLD,
};
