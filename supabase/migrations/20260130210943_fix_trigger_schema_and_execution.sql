/*
  # Fix Trigger Schema and Execution Issues

  ## Problem
  Triggers are failing during user signup with "relation user_roles does not exist" error.
  The issue is likely related to:
  - Search path not being properly set in trigger functions
  - Trigger execution order
  - Schema qualification of table references

  ## Solution
  1. Drop and recreate both trigger functions with explicit schema qualification
  2. Ensure proper search_path is set
  3. Add comprehensive error handling
  4. Verify trigger order by using proper naming

  ## Changes
  - Recreate handle_new_user() with explicit public.user_roles reference
  - Recreate handle_new_user_profile() with explicit public.profiles reference
  - Set search_path to 'public, auth' for both functions
  - Add detailed error logging
  - Use SECURITY DEFINER with postgres ownership
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;

-- Recreate handle_new_user function with proper schema qualification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Explicitly reference public schema
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient'::public.user_role)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detailed error information
    RAISE WARNING 'handle_new_user failed for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    -- Don't fail user creation, just log the error
    RETURN NEW;
END;
$$;

-- Recreate handle_new_user_profile function with proper schema qualification
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Explicitly reference public schema
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detailed error information
    RAISE WARNING 'handle_new_user_profile failed for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    -- Don't fail user creation, just log the error
    RETURN NEW;
END;
$$;

-- Set function ownership to postgres to ensure proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.handle_new_user_profile() OWNER TO postgres;

-- Recreate triggers with proper naming to control execution order
-- Trigger names in alphabetical order: 1_roles comes before 2_profile
CREATE TRIGGER z_on_auth_user_created_1_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER z_on_auth_user_created_2_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user_profile() TO postgres, service_role;
