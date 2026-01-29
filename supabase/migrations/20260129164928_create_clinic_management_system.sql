/*
  # Clinic Management System - Comprehensive Schema

  1. New Tables
    - `clinic_images`: Multiple images per clinic (hero, gallery, before/after, certificates)
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `image_url` (text, storage URL)
      - `image_type` (text, category: hero, gallery, before_after, certificate, facility)
      - `caption` (text, image description)
      - `display_order` (integer, for ordering images)
      - `is_featured` (boolean, for hero images)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamptz)
      
    - `clinic_videos`: Video links (YouTube, Vimeo) with metadata
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `video_url` (text, YouTube/Vimeo URL)
      - `title` (text, video title)
      - `description` (text, video description)
      - `thumbnail_url` (text, video thumbnail)
      - `duration_seconds` (integer, video length)
      - `display_order` (integer, for ordering)
      - `created_at` (timestamptz)
      
    - `clinic_team_members`: Doctors and staff information
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `full_name` (text, name)
      - `title` (text, e.g., "Chief Surgeon")
      - `photo_url` (text, profile photo)
      - `specializations` (text[], areas of expertise)
      - `certifications` (jsonb, credentials and certificates)
      - `experience_years` (integer, years of experience)
      - `languages` (text[], spoken languages)
      - `bio` (text, biography)
      - `display_order` (integer, for ordering)
      - `is_active` (boolean, visibility control)
      - `created_at` (timestamptz)
      
    - `clinic_services`: Services offered with descriptions
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `service_name` (text, e.g., "FUE Hair Transplant")
      - `description` (text, detailed description)
      - `base_price` (numeric, starting price)
      - `currency` (text, default USD)
      - `duration_hours` (numeric, procedure duration)
      - `recovery_days` (integer, recovery time)
      - `is_featured` (boolean, highlight service)
      - `display_order` (integer, for ordering)
      - `created_at` (timestamptz)
      
    - `clinic_packages`: Treatment packages with detailed inclusions
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `package_name` (text, e.g., "Premium Package")
      - `tier` (text, Basic/Standard/Premium)
      - `price` (numeric, package price)
      - `currency` (text, default USD)
      - `graft_range_min` (integer, min grafts)
      - `graft_range_max` (integer, max grafts)
      - `inclusions` (jsonb, list of what's included)
      - `description` (text, package description)
      - `is_active` (boolean, availability)
      - `display_order` (integer, for ordering)
      - `created_at` (timestamptz)
      
    - `clinic_statistics`: Performance metrics
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics, unique)
      - `total_procedures` (integer, default 0)
      - `success_rate_percent` (numeric, default 0)
      - `average_rating` (numeric, default 0)
      - `total_reviews` (integer, default 0)
      - `years_established` (integer, years in business)
      - `updated_at` (timestamptz)
      
    - `clinic_facilities`: Amenities and facilities information
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `facility_name` (text, e.g., "Private Rooms")
      - `description` (text, facility description)
      - `icon` (text, icon name for UI)
      - `display_order` (integer, for ordering)
      - `created_at` (timestamptz)
      
    - `clinic_lead_views`: Track which leads clinics have viewed
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `lead_id` (uuid, foreign key to leads)
      - `viewed_at` (timestamptz, when viewed)
      - `is_purchased` (boolean, whether clinic purchased this lead)
      - `purchased_at` (timestamptz, when purchased)
      - `credits_spent` (numeric, cost of purchase)
      
  2. Clinics Table Enhancements
    - Add fields for richer clinic profiles
    - Add operating hours, social media, response time tracking
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for clinic owners to manage their own data
    - Add policies for public read access where appropriate
    - Add policies for authenticated users to view available leads
    
  4. Indexes
    - Add indexes for common query patterns
    - Foreign key indexes for performance
*/

-- ============================================
-- EXTEND CLINICS TABLE
-- ============================================
DO $$
BEGIN
  -- Add new fields to clinics table if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'founding_year'
  ) THEN
    ALTER TABLE clinics ADD COLUMN founding_year integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'languages_spoken'
  ) THEN
    ALTER TABLE clinics ADD COLUMN languages_spoken text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'response_time_hours'
  ) THEN
    ALTER TABLE clinics ADD COLUMN response_time_hours numeric DEFAULT 24;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'social_media'
  ) THEN
    ALTER TABLE clinics ADD COLUMN social_media jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'operating_hours'
  ) THEN
    ALTER TABLE clinics ADD COLUMN operating_hours jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'tier'
  ) THEN
    ALTER TABLE clinics ADD COLUMN tier text DEFAULT 'FREE_PARTNER';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE clinics ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
END $$;

-- ============================================
-- CREATE CLINIC_IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text NOT NULL CHECK (image_type IN ('hero', 'gallery', 'before_after', 'certificate', 'facility', 'team')),
  caption text DEFAULT '',
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their own images"
  ON clinic_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_images.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view clinic images"
  ON clinic_images
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- CREATE CLINIC_VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  thumbnail_url text DEFAULT '',
  duration_seconds integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their own videos"
  ON clinic_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_videos.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view clinic videos"
  ON clinic_videos
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- CREATE CLINIC_TEAM_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  title text DEFAULT '',
  photo_url text DEFAULT '',
  specializations text[] DEFAULT ARRAY[]::text[],
  certifications jsonb DEFAULT '[]'::jsonb,
  experience_years integer DEFAULT 0,
  languages text[] DEFAULT ARRAY[]::text[],
  bio text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their team members"
  ON clinic_team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_team_members.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view active team members"
  ON clinic_team_members
  FOR SELECT
  TO public
  USING (is_active = true);

-- ============================================
-- CREATE CLINIC_SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text DEFAULT '',
  base_price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  duration_hours numeric DEFAULT 0,
  recovery_days integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their services"
  ON clinic_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_services.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view clinic services"
  ON clinic_services
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- CREATE CLINIC_PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  package_name text NOT NULL,
  tier text DEFAULT 'Standard' CHECK (tier IN ('Basic', 'Standard', 'Premium')),
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  graft_range_min integer DEFAULT 0,
  graft_range_max integer DEFAULT 0,
  inclusions jsonb DEFAULT '[]'::jsonb,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their packages"
  ON clinic_packages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_packages.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view active packages"
  ON clinic_packages
  FOR SELECT
  TO public
  USING (is_active = true);

-- ============================================
-- CREATE CLINIC_STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid UNIQUE NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  total_procedures integer DEFAULT 0,
  success_rate_percent numeric DEFAULT 0,
  average_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  years_established integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their statistics"
  ON clinic_statistics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_statistics.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view clinic statistics"
  ON clinic_statistics
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- CREATE CLINIC_FACILITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  facility_name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'check',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their facilities"
  ON clinic_facilities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_facilities.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Public can view clinic facilities"
  ON clinic_facilities
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- CREATE CLINIC_LEAD_VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic_lead_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  is_purchased boolean DEFAULT false,
  purchased_at timestamptz,
  credits_spent numeric DEFAULT 0,
  UNIQUE(clinic_id, lead_id)
);

ALTER TABLE clinic_lead_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can view their own lead views"
  ON clinic_lead_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_lead_views.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Clinics can create lead views"
  ON clinic_lead_views
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_lead_views.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

CREATE POLICY "Clinics can update their lead views"
  ON clinic_lead_views
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_lead_views.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.clinic_id = clinic_lead_views.clinic_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role = 'clinic'
    )
  );

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clinic_images_clinic_id ON clinic_images(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_images_type ON clinic_images(image_type);
CREATE INDEX IF NOT EXISTS idx_clinic_videos_clinic_id ON clinic_videos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_team_clinic_id ON clinic_team_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_team_active ON clinic_team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_services_clinic_id ON clinic_services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_packages_clinic_id ON clinic_packages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_packages_active ON clinic_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_facilities_clinic_id ON clinic_facilities(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_lead_views_clinic ON clinic_lead_views(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_lead_views_lead ON clinic_lead_views(lead_id);
CREATE INDEX IF NOT EXISTS idx_clinic_lead_views_purchased ON clinic_lead_views(is_purchased);