/*
  # Clinic Storage Buckets Setup

  1. Storage Buckets
    - `clinic-assets`: For clinic logos, images, videos, and other media
    
  2. Security
    - Public read access for all clinic assets
    - Authenticated clinics can upload to their own folders
    - RLS policies for secure uploads
*/

-- Create storage bucket for clinic assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-assets', 'clinic-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view clinic assets" ON storage.objects;
  DROP POLICY IF EXISTS "Clinics can upload their own assets" ON storage.objects;
  DROP POLICY IF EXISTS "Clinics can update their own assets" ON storage.objects;
  DROP POLICY IF EXISTS "Clinics can delete their own assets" ON storage.objects;
END $$;

-- Allow public to read clinic assets
CREATE POLICY "Public can view clinic assets"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'clinic-assets');

-- Allow authenticated clinic users to upload to their clinic folder
CREATE POLICY "Clinics can upload their own assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clinic-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT clinic_id::text
      FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'clinic'
    )
  );

-- Allow clinics to update their own assets
CREATE POLICY "Clinics can update their own assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'clinic-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT clinic_id::text
      FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'clinic'
    )
  );

-- Allow clinics to delete their own assets
CREATE POLICY "Clinics can delete their own assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'clinic-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT clinic_id::text
      FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'clinic'
    )
  );