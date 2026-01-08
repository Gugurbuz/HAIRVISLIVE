/*
  # Enhance Lead Management System

  ## Overview
  Adds missing columns and tables to support comprehensive lead management with contact info,
  clinic details, and image storage.

  ## Changes

  ### 1. Enhance clinics table
  - Add `slug` (text, unique) - URL-friendly identifier
  - Add `location` (text) - Clinic location
  - Add `description` (text) - Clinic description
  - Add `contact_email` (text) - Contact email
  - Add `contact_phone` (text) - Contact phone
  - Add `logo_url` (text) - Logo image URL
  - Add `metadata` (jsonb) - Additional clinic data (if not exists)

  ### 2. Enhance leads table
  - Add `name` (text) - Lead name
  - Add `email` (text) - Lead email
  - Add `phone` (text) - Lead phone
  - Add `concerns` (text[]) - Array of hair concerns
  - Add `source` (text) - Lead source
  - Add `scan_data` (jsonb) - Scan analysis data
  - Add `metadata` (jsonb) - Additional lead data
  - Add `clinic_id` (uuid) - Associated clinic reference

  ### 3. Create lead_images table
  New table to store image references for leads
  - `id` (uuid, primary key)
  - `lead_id` (uuid, foreign key)
  - `storage_path` (text) - Path in Supabase storage
  - `image_type` (text) - Type of image
  - `metadata` (jsonb) - Image metadata
  - `created_at` (timestamptz)

  ### 4. Enhance proposals table
  - Add missing fields: title, description, details

  ## Security
  - Maintain existing RLS policies
  - Add RLS for new lead_images table
*/

-- Add missing columns to clinics table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'slug'
  ) THEN
    ALTER TABLE clinics ADD COLUMN slug text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'location'
  ) THEN
    ALTER TABLE clinics ADD COLUMN location text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'description'
  ) THEN
    ALTER TABLE clinics ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE clinics ADD COLUMN contact_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE clinics ADD COLUMN contact_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE clinics ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE clinics ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create unique index on slug after adding column
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_slug_unique ON clinics(slug) WHERE slug IS NOT NULL;

-- Add missing columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'name'
  ) THEN
    ALTER TABLE leads ADD COLUMN name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'email'
  ) THEN
    ALTER TABLE leads ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'phone'
  ) THEN
    ALTER TABLE leads ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'concerns'
  ) THEN
    ALTER TABLE leads ADD COLUMN concerns text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'source'
  ) THEN
    ALTER TABLE leads ADD COLUMN source text DEFAULT 'scanner';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'scan_data'
  ) THEN
    ALTER TABLE leads ADD COLUMN scan_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE leads ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for new lead columns
CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name) WHERE name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_email_new ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_clinic_id_new ON leads(clinic_id) WHERE clinic_id IS NOT NULL;

-- Create lead_images table
CREATE TABLE IF NOT EXISTS lead_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL,
  image_type text NOT NULL CHECK (image_type IN ('scalp', 'simulation', 'original', 'analysis')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for lead_images
CREATE INDEX IF NOT EXISTS idx_lead_images_lead_id ON lead_images(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_images_type ON lead_images(image_type);

-- Enable RLS on lead_images
ALTER TABLE lead_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_images table
CREATE POLICY "Authenticated users can view lead images"
  ON lead_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert lead images"
  ON lead_images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update lead images"
  ON lead_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete lead images"
  ON lead_images FOR DELETE
  TO authenticated
  USING (true);

-- Add missing columns to proposals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'title'
  ) THEN
    ALTER TABLE proposals ADD COLUMN title text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'description'
  ) THEN
    ALTER TABLE proposals ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'details'
  ) THEN
    ALTER TABLE proposals ADD COLUMN details jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE proposals ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add updated_at trigger for proposals if not exists
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();