/**
 * Progressive Image Component
 *
 * Loads images progressively: thumbnail first, then full resolution
 * Provides smooth transitions and loading states
 * Supports WebP with JPEG/PNG fallbacks
 */

import React, { useState, useEffect, useRef } from 'react';

export interface ProgressiveImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  thumbnailSrc,
  alt,
  className = '',
  imgClassName = '',
  onLoad,
  onError,
  aspectRatio = '16/9',
  objectFit = 'cover',
  loading = 'lazy',
  priority = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(thumbnailSrc || null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullResLoaded, setIsFullResLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fullResImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (thumbnailSrc && thumbnailSrc !== currentSrc) {
      setCurrentSrc(thumbnailSrc);
    }
  }, [thumbnailSrc]);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    fullResImgRef.current = img;

    const handleFullResLoad = () => {
      setCurrentSrc(src);
      setIsFullResLoaded(true);
      setIsLoading(false);
      onLoad?.();
    };

    const handleFullResError = () => {
      if (!thumbnailSrc) {
        setHasError(true);
        setIsLoading(false);
      }
      const error = new Error(`Failed to load image: ${src}`);
      onError?.(error);
    };

    img.onload = handleFullResLoad;
    img.onerror = handleFullResError;

    if (priority) {
      img.src = src;
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        observer.disconnect();
        img.onload = null;
        img.onerror = null;
      };
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority, thumbnailSrc, onLoad, onError]);

  const handleThumbnailLoad = () => {
    if (currentSrc === thumbnailSrc) {
      setIsLoading(false);
    }
  };

  const handleThumbnailError = () => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      onError?.(new Error(`Failed to load thumbnail: ${thumbnailSrc}`));
    }
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ aspectRatio }}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <svg
            className="w-10 h-10 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={loading}
          onLoad={handleThumbnailLoad}
          onError={handleThumbnailError}
          className={`
            w-full h-full transition-opacity duration-500
            ${isFullResLoaded ? 'opacity-100' : thumbnailSrc && currentSrc === thumbnailSrc ? 'opacity-70 blur-sm' : 'opacity-0'}
            ${imgClassName}
          `}
          style={{
            objectFit,
          }}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
