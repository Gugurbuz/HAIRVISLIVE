/*
  # Fix User Profile Trigger Schema

  ## Overview
  Fixes the schema reference issue in the user profile trigger function.
  The trigger needs to explicitly reference public.profiles when inserting.

  ## Changes
  1. Drop and recreate handle_new_user_profile function with explicit schema reference
  2. Recreate trigger on auth.users table

  ## Notes
  - Trigger runs in auth schema context, so public.profiles must be explicitly referenced
  - SECURITY DEFINER allows the function to write to public.profiles
*/

-- Recreate profile trigger function with explicit schema
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();