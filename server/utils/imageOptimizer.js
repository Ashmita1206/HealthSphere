/**
 * Enterprise Image Optimization Utility
 */
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/avif',
];

function validateImageUpload(file, maxSizeBytes = 5 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'No image file provided' };
  }

  const mimeType = file.mimetype || file.type;
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image format: ${mimeType}. Allowed formats: JPG, PNG, WebP, SVG, AVIF`,
    };
  }

  const size = file.size || (file.buffer ? file.buffer.length : 0);
  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image size exceeds limit of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`,
    };
  }

  return { valid: true, mimeType, size };
}

function bufferToDataUri(buffer, mimeType = 'image/png') {
  if (!buffer) return null;
  const base64 = Buffer.isBuffer(buffer) ? buffer.toString('base64') : buffer;
  return `data:${mimeType};base64,${base64}`;
}

function computeOptimalDimensions(width, height, maxDimension = 1200) {
  if (!width || !height) return { width, height };
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const aspectRatio = width / height;
  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio),
    };
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension,
    };
  }
}

module.exports = {
  SUPPORTED_MIME_TYPES,
  validateImageUpload,
  bufferToDataUri,
  computeOptimalDimensions,
};
