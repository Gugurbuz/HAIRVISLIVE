/*
  # Fix User Roles Trigger RLS Issue

  ## Problem
  The `handle_new_user()` trigger function fails during user signup because:
  - RLS policies on user_roles table only allow admins to insert
  - New users cannot be assigned the 'patient' role during signup
  - Trigger needs to bypass RLS to assign initial role

  ## Solution
  1. Recreate handle_new_user() function with proper RLS bypass
  2. Add policies to allow role assignment during signup
  3. Set proper function ownership and security settings

  ## Changes
  - Add service_role policy for user_roles inserts
  - Add policy to allow initial role assignment during signup
  - Recreate trigger function with exception handling
  - Ensure function can execute even when auth.uid() is not yet set
*/

-- Drop and recreate handle_new_user function with proper RLS bypass
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with proper permissions to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with DEFINER privileges, bypassing RLS
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create user role for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission and set owner to postgres
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add service_role policy for user_roles
DROP POLICY IF EXISTS "Service role can insert user roles" ON user_roles;
CREATE POLICY "Service role can insert user roles"
  ON user_roles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add policy for initial role assignment during signup
DROP POLICY IF EXISTS "Allow role assignment during signup" ON user_roles;
CREATE POLICY "Allow role assignment during signup"
  ON user_roles FOR INSERT
  TO anon, authenticated
  WITH CHECK (role = 'patient' AND (auth.uid() = user_id OR auth.uid() IS NULL));
