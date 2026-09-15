/**
 * HealthSphere Image Optimization Utilities
 * Automated Cloudinary transformations (WebP/AVIF auto-format, quality optimization, responsive srcSets)
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
}

/**
 * Transforms Cloudinary image URLs to include automatic format, quality, and sizing parameters.
 * If the URL is not from Cloudinary, returns the original URL intact.
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';

  // Cloudinary optimization
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options;

    const transformations: string[] = [`f_${format}`, `q_${quality}`];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width && height) transformations.push(`c_${crop}`);

    const transformString = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  return url;
}

/**
 * Generates a responsive srcSet string for modern responsive images
 */
export function generateResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 480, 768, 1024, 1280]
): string {
  if (!url || !url.includes('cloudinary.com')) return '';

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}
