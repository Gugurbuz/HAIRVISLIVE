/*
  # Fix Profile Trigger RLS Bypass Issue

  ## Problem
  The `handle_new_user_profile()` trigger function fails during user signup because:
  - RLS policies on profiles table require `auth.uid() = user_id`
  - During signup, auth context may not be fully established
  - Trigger needs to bypass RLS to create initial profile

  ## Solution
  1. Grant the trigger function permission to bypass RLS
  2. Add an INSERT policy that allows service role operations
  3. Set proper function ownership and security settings

  ## Changes
  - Add policy to allow anon/service role inserts during signup
  - Recreate trigger function with proper RLS bypass settings
  - Ensure trigger can execute even when auth.uid() is not yet set
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- Recreate the function with proper permissions to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with DEFINER privileges, bypassing RLS
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
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission to postgres and service roles
ALTER FUNCTION public.handle_new_user_profile() OWNER TO postgres;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Add a permissive policy for service role to insert during signup
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add policy for anon users during signup flow (they become authenticated immediately after)
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
