/**
 * Client-Side Image Compression Utilities
 *
 * Provides comprehensive image processing:
 * - Resize to target dimensions
 * - Quality-based compression
 * - WebP conversion with fallbacks
 * - Thumbnail generation
 * - Progressive loading support
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
  maintainAspectRatio?: boolean;
}

export interface CompressedImage {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webpTestImage =
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = webpTestImage;
  });
}

/**
 * Calculate target dimensions maintaining aspect ratio
 */
function calculateDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = sourceWidth;
  let height = sourceHeight;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (maxHeight / height) * width;
    height = maxHeight;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Compress and resize image from base64 or blob
 */
export async function compressImage(
  source: string | Blob,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    mimeType = 'image/jpeg',
    maintainAspectRatio = true,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const dimensions = maintainAspectRatio
          ? calculateDimensions(img.width, img.height, maxWidth, maxHeight)
          : { width: maxWidth, height: maxHeight };

        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const dataUrl = canvas.toDataURL(mimeType, quality);

            resolve({
              blob,
              dataUrl,
              width: dimensions.width,
              height: dimensions.height,
              sizeBytes: blob.size,
              mimeType: blob.type,
            });
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Generate thumbnail (small, highly compressed version)
 */
export async function generateThumbnail(
  source: string | Blob,
  maxSize: number = 300
): Promise<CompressedImage> {
  const webpSupported = await supportsWebP();

  return compressImage(source, {
    maxWidth: maxSize,
    maxHeight: maxSize,
    quality: 0.7,
    mimeType: webpSupported ? 'image/webp' : 'image/jpeg',
    maintainAspectRatio: true,
  });
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  sources: (string | Blob)[],
  options: CompressionOptions = {}
): Promise<CompressedImage[]> {
  return Promise.all(sources.map((source) => compressImage(source, options)));
}

/**
 * Convert base64 to Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Get image dimensions from data URL
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Estimate compression savings
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): {
  ratio: number;
  percentageSaved: number;
  savedBytes: number;
} {
  const savedBytes = originalSize - compressedSize;
  const ratio = originalSize / compressedSize;
  const percentageSaved = (savedBytes / originalSize) * 100;

  return {
    ratio: Math.round(ratio * 100) / 100,
    percentageSaved: Math.round(percentageSaved * 100) / 100,
    savedBytes,
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
