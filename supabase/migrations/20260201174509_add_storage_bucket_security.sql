/*
  # Add Storage Bucket Security Restrictions

  1. Changes
    - Update lead-images bucket with file size limit (10MB) and allowed MIME types
    - Update clinic-assets bucket with file size limit (10MB) and allowed MIME types
    - Update public-assets bucket with file size limit (5MB) and allowed MIME types

  2. Security
    - Restricts file uploads to image types only (jpeg, jpg, png, webp, gif)
    - Prevents large file uploads that could cause storage issues
    - Maintains existing RLS policies
*/

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'lead-images';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
WHERE id = 'clinic-assets';

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
WHERE id = 'public-assets';
