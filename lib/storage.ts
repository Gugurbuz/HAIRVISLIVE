/**
 * Supabase Storage Service
 *
 * Comprehensive storage management for scalp images:
 * - Upload with automatic compression
 * - Thumbnail generation
 * - WebP conversion
 * - Download and deletion
 * - CDN-optimized URLs
 */

import { supabase } from './supabase';
import {
  compressImage,
  generateThumbnail,
  base64ToBlob,
  supportsWebP,
  CompressedImage,
  CompressionOptions,
} from './utils/imageCompression';

export interface UploadResult {
  fullPath: string;
  thumbnailPath: string;
  fullUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export interface StorageBuckets {
  SCALP_IMAGES: 'scalp-images';
  THUMBNAILS: 'scalp-images-thumbnails';
  SIMULATIONS: 'simulation-results';
}

export const BUCKETS: StorageBuckets = {
  SCALP_IMAGES: 'scalp-images',
  THUMBNAILS: 'scalp-images-thumbnails',
  SIMULATIONS: 'simulation-results',
};

/**
 * Get public URL for storage object
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get signed URL for private storage object (1 hour expiry)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error in getSignedUrl:', error);
    return null;
  }
}

/**
 * Upload scalp image with automatic compression and thumbnail generation
 */
export async function uploadScalpImage(
  leadId: string,
  imageSource: string | Blob,
  imageType: 'front' | 'top' | 'left' | 'right',
  options: CompressionOptions = {}
): Promise<UploadResult | null> {
  try {
    const webpSupported = await supportsWebP();
    const mimeType = webpSupported ? 'image/webp' : 'image/jpeg';
    const extension = webpSupported ? 'webp' : 'jpg';

    const compressedFull = await compressImage(imageSource, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.85,
      mimeType,
      ...options,
    });

    const thumbnail = await generateThumbnail(imageSource, 300);

    const timestamp = Date.now();
    const fullPath = `${leadId}/${imageType}-${timestamp}.${extension}`;
    const thumbnailPath = `${leadId}/${imageType}-thumb-${timestamp}.${thumbnail.mimeType === 'image/webp' ? 'webp' : 'jpg'}`;

    const [fullUpload, thumbUpload] = await Promise.all([
      supabase.storage.from(BUCKETS.SCALP_IMAGES).upload(fullPath, compressedFull.blob, {
        contentType: compressedFull.mimeType,
        cacheControl: '3600',
        upsert: false,
      }),
      supabase.storage.from(BUCKETS.THUMBNAILS).upload(thumbnailPath, thumbnail.blob, {
        contentType: thumbnail.mimeType,
        cacheControl: '31536000',
        upsert: false,
      }),
    ]);

    if (fullUpload.error) {
      console.error('Error uploading full image:', fullUpload.error);
      return null;
    }

    if (thumbUpload.error) {
      console.error('Error uploading thumbnail:', thumbUpload.error);
    }

    const fullUrl = getPublicUrl(BUCKETS.SCALP_IMAGES, fullPath);
    const thumbnailUrl = getPublicUrl(BUCKETS.THUMBNAILS, thumbnailPath);

    return {
      fullPath,
      thumbnailPath,
      fullUrl,
      thumbnailUrl,
      mimeType: compressedFull.mimeType,
      sizeBytes: compressedFull.sizeBytes,
      width: compressedFull.width,
      height: compressedFull.height,
    };
  } catch (error) {
    console.error('Error in uploadScalpImage:', error);
    return null;
  }
}

/**
 * Upload simulation result image
 */
export async function uploadSimulationImage(
  leadId: string,
  imageSource: string | Blob
): Promise<{ path: string; url: string } | null> {
  try {
    const webpSupported = await supportsWebP();
    const mimeType = webpSupported ? 'image/webp' : 'image/jpeg';
    const extension = webpSupported ? 'webp' : 'jpg';

    const compressed = await compressImage(imageSource, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.9,
      mimeType,
    });

    const timestamp = Date.now();
    const path = `${leadId}/simulation-${timestamp}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKETS.SIMULATIONS)
      .upload(path, compressed.blob, {
        contentType: compressed.mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading simulation:', error);
      return null;
    }

    const url = getPublicUrl(BUCKETS.SIMULATIONS, path);

    return { path, url };
  } catch (error) {
    console.error('Error in uploadSimulationImage:', error);
    return null;
  }
}

/**
 * Delete all images for a lead
 */
export async function deleteLeadImages(leadId: string): Promise<boolean> {
  try {
    const [scalpFiles, thumbFiles, simFiles] = await Promise.all([
      supabase.storage.from(BUCKETS.SCALP_IMAGES).list(leadId),
      supabase.storage.from(BUCKETS.THUMBNAILS).list(leadId),
      supabase.storage.from(BUCKETS.SIMULATIONS).list(leadId),
    ]);

    const deletePromises: Promise<any>[] = [];

    if (scalpFiles.data && scalpFiles.data.length > 0) {
      const paths = scalpFiles.data.map((f) => `${leadId}/${f.name}`);
      deletePromises.push(supabase.storage.from(BUCKETS.SCALP_IMAGES).remove(paths));
    }

    if (thumbFiles.data && thumbFiles.data.length > 0) {
      const paths = thumbFiles.data.map((f) => `${leadId}/${f.name}`);
      deletePromises.push(supabase.storage.from(BUCKETS.THUMBNAILS).remove(paths));
    }

    if (simFiles.data && simFiles.data.length > 0) {
      const paths = simFiles.data.map((f) => `${leadId}/${f.name}`);
      deletePromises.push(supabase.storage.from(BUCKETS.SIMULATIONS).remove(paths));
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    return true;
  } catch (error) {
    console.error('Error deleting lead images:', error);
    return false;
  }
}

/**
 * Delete specific image
 */
export async function deleteImage(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
}

/**
 * List all images for a lead
 */
export async function listLeadImages(leadId: string): Promise<{
  scalpImages: string[];
  thumbnails: string[];
  simulations: string[];
}> {
  try {
    const [scalpFiles, thumbFiles, simFiles] = await Promise.all([
      supabase.storage.from(BUCKETS.SCALP_IMAGES).list(leadId),
      supabase.storage.from(BUCKETS.THUMBNAILS).list(leadId),
      supabase.storage.from(BUCKETS.SIMULATIONS).list(leadId),
    ]);

    return {
      scalpImages: scalpFiles.data?.map((f) => `${leadId}/${f.name}`) || [],
      thumbnails: thumbFiles.data?.map((f) => `${leadId}/${f.name}`) || [],
      simulations: simFiles.data?.map((f) => `${leadId}/${f.name}`) || [],
    };
  } catch (error) {
    console.error('Error listing lead images:', error);
    return { scalpImages: [], thumbnails: [], simulations: [] };
  }
}

/**
 * Get storage usage stats for a lead
 */
export async function getLeadStorageStats(leadId: string): Promise<{
  totalBytes: number;
  imageCount: number;
  thumbnailCount: number;
  simulationCount: number;
}> {
  try {
    const [scalpFiles, thumbFiles, simFiles] = await Promise.all([
      supabase.storage.from(BUCKETS.SCALP_IMAGES).list(leadId),
      supabase.storage.from(BUCKETS.THUMBNAILS).list(leadId),
      supabase.storage.from(BUCKETS.SIMULATIONS).list(leadId),
    ]);

    let totalBytes = 0;

    if (scalpFiles.data) {
      totalBytes += scalpFiles.data.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
    }

    if (thumbFiles.data) {
      totalBytes += thumbFiles.data.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
    }

    if (simFiles.data) {
      totalBytes += simFiles.data.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
    }

    return {
      totalBytes,
      imageCount: scalpFiles.data?.length || 0,
      thumbnailCount: thumbFiles.data?.length || 0,
      simulationCount: simFiles.data?.length || 0,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { totalBytes: 0, imageCount: 0, thumbnailCount: 0, simulationCount: 0 };
  }
}

/**
 * Legacy function for backward compatibility
 */
export const uploadLeadImage = async (
  leadId: string,
  imageData: string,
  imageType: 'thumbnail' | 'simulation' | 'planning' | 'front' | 'top' | 'left' | 'right'
): Promise<string | null> => {
  if (imageType === 'simulation') {
    const result = await uploadSimulationImage(leadId, imageData);
    return result?.url || null;
  }

  const result = await uploadScalpImage(leadId, imageData, imageType as any);
  return result?.fullUrl || null;
};
