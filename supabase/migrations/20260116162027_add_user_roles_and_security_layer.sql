/*
  # Add User Roles and Enhanced Security

  ## Overview
  Implements comprehensive role-based access control (RBAC) and security enhancements
  for the HairVis platform.

  ## Changes

  ### 1. User Role System
  - Create `user_role` enum: 'admin', 'clinic', 'patient'
  - Create `user_roles` table to manage user permissions
  - Add default role assignment trigger
  - Link to auth.users table

  ### 2. Enhanced Security Tables
  - Create `api_rate_limits` table for tracking API usage
  - Create `audit_logs` table for security event tracking
  - Add indexes for performance

  ### 3. Security Functions
  - `get_user_role(user_id)` - Get user's role
  - `is_admin(user_id)` - Check if user is admin
  - `is_clinic(user_id)` - Check if user is clinic
  - `can_access_lead(user_id, lead_id)` - Check lead access permission

  ## Security
  - All new tables have RLS enabled
  - Restrictive default policies
  - Audit trail for sensitive operations
*/

-- Create user role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'clinic', 'patient');
  END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'patient',
  clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_clinic_id ON user_roles(clinic_id) WHERE clinic_id IS NOT NULL;

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Create API rate limits table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  last_request_at timestamptz DEFAULT now(),
  blocked_until timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_or_anonymous CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

-- Create indexes for rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON api_rate_limits(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limits_anonymous_id ON api_rate_limits(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON api_rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON api_rate_limits(window_start);

-- Enable RLS on api_rate_limits
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_rate_limits (admin only)
CREATE POLICY "Admins can view rate limits"
  ON api_rate_limits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (admin only)
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Security Helper Functions

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(check_user_id uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result
  FROM user_roles
  WHERE user_id = check_user_id;
  
  RETURN COALESCE(user_role_result, 'patient'::user_role);
END;
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
END;
$$;

-- Check if user is clinic
CREATE OR REPLACE FUNCTION is_clinic(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id AND role = 'clinic'
  );
END;
$$;

-- Check if user can access lead
CREATE OR REPLACE FUNCTION can_access_lead(check_user_id uuid, check_lead_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_clinic_id uuid;
  lead_clinic_id uuid;
  user_is_admin boolean;
BEGIN
  -- Check if admin
  user_is_admin := is_admin(check_user_id);
  IF user_is_admin THEN
    RETURN true;
  END IF;

  -- Get user's clinic_id
  SELECT clinic_id INTO user_clinic_id
  FROM user_roles
  WHERE user_id = check_user_id;

  -- Get lead's clinic_id
  SELECT clinic_id INTO lead_clinic_id
  FROM leads
  WHERE id = check_lead_id;

  -- Check if clinic has purchased this lead
  IF lead_clinic_id IS NOT NULL AND user_clinic_id = lead_clinic_id THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Auto-assign default patient role on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'patient')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Update updated_at trigger for user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_success boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    success
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_success
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_clinic(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_lead(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, boolean) TO authenticated;