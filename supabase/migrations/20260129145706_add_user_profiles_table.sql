/*
  # Add User Profiles Table

  ## Overview
  Creates a comprehensive user profiles table to store additional user information
  beyond authentication data.

  ## Changes

  ### 1. Profiles Table
  - Create `profiles` table with user details
  - Links to auth.users via user_id
  - Stores name, email, avatar, phone, and metadata
  - Tracks creation and update timestamps

  ### 2. Automatic Profile Creation
  - Trigger automatically creates profile when user is created in auth.users
  - Can also be manually created/updated via upsert

  ### 3. Security
  - Enable RLS on profiles table
  - Users can view and update their own profile
  - Admins can view all profiles
  - Public users cannot access profiles

  ## Notes
  - Profile data is separate from auth.users for better data management
  - Metadata field allows for flexible additional data storage
  - Integrates with existing user_roles system
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Update trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user creation
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile
      AFTER INSERT OR UPDATE ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user_profile();
  END IF;
END $$;

-- Helper function to upsert user profile
CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id uuid,
  p_email text,
  p_full_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Only allow users to update their own profile or admins to update any
  IF p_user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO profiles (user_id, email, full_name, avatar_url, phone, metadata)
  VALUES (p_user_id, p_email, p_full_name, p_avatar_url, p_phone, p_metadata)
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    metadata = profiles.metadata || EXCLUDED.metadata,
    updated_at = now()
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upsert_user_profile(uuid, text, text, text, text, jsonb) TO authenticated;