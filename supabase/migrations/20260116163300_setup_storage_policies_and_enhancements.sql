/*
  # Supabase Storage Policies and Enhancements

  ## Overview
  Sets up RLS policies for storage buckets and adds performance-related columns.

  ## Required Buckets (Create via Dashboard)
  1. `scalp-images` - Private, 10MB limit
  2. `scalp-images-thumbnails` - Public, 1MB limit
  3. `simulation-results` - Private, 10MB limit

  ## Changes
  - Add thumbnail_path, file_size, mime_type columns to lead_images
  - Create comprehensive storage RLS policies
  - Add helper functions for path generation

  ## Security
  - All private buckets require authentication
  - Lead ownership verified via RLS
*/

-- Add new columns to lead_images table
ALTER TABLE lead_images ADD COLUMN IF NOT EXISTS thumbnail_path text;
ALTER TABLE lead_images ADD COLUMN IF NOT EXISTS file_size_bytes integer;
ALTER TABLE lead_images ADD COLUMN IF NOT EXISTS mime_type text DEFAULT 'image/jpeg';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lead_images_thumbnail ON lead_images(thumbnail_path) WHERE thumbnail_path IS NOT NULL;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload own scalp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view authorized scalp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own scalp images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload simulation results" ON storage.objects;
DROP POLICY IF EXISTS "Users can view authorized simulation results" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own simulation results" ON storage.objects;

-- Policies for scalp-images bucket (private)
CREATE POLICY "Users can upload own scalp images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scalp-images' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE l.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Users can view authorized scalp images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'scalp-images' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE can_access_lead(auth.uid(), l.id)
    )
    OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Users can delete own scalp images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'scalp-images' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE l.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    is_admin(auth.uid())
  )
);

-- Policies for scalp-images-thumbnails bucket (public)
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'scalp-images-thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'scalp-images-thumbnails');

CREATE POLICY "Users can delete own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'scalp-images-thumbnails' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE l.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    is_admin(auth.uid())
  )
);

-- Policies for simulation-results bucket
CREATE POLICY "Users can upload simulation results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'simulation-results' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE can_access_lead(auth.uid(), l.id)
    )
    OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Users can view authorized simulation results"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'simulation-results' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE can_access_lead(auth.uid(), l.id)
    )
    OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Users can delete own simulation results"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'simulation-results' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM leads l
      WHERE l.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    is_admin(auth.uid())
  )
);

-- Helper function to generate unique storage path
CREATE OR REPLACE FUNCTION generate_image_storage_path(
  p_lead_id uuid,
  p_image_type text,
  p_extension text DEFAULT 'jpg'
)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN p_lead_id::text || '/' || p_image_type || '-' || extract(epoch from now())::bigint || '.' || p_extension;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_image_storage_path(uuid, text, text) TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN lead_images.thumbnail_path IS 'Path to compressed thumbnail in scalp-images-thumbnails bucket';
COMMENT ON COLUMN lead_images.file_size_bytes IS 'Original file size in bytes for analytics';
COMMENT ON COLUMN lead_images.mime_type IS 'MIME type: image/jpeg, image/webp, etc';