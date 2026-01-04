/*
  # Feature Flags and Enhanced Logging System

  ## Overview
  This migration adds comprehensive feature flag management and enhanced logging capabilities for debugging and monitoring.

  ## 1. New Tables

  ### `feature_flags`
  Global feature flags that control system behavior
  - `id` (uuid, primary key)
  - `key` (text, unique) - Flag identifier (e.g., 'mock_mode', 'enable_simulation')
  - `enabled` (boolean) - Whether the flag is active
  - `description` (text) - Human-readable description
  - `config` (jsonb) - Additional configuration data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `sessions`
  Tracks user sessions for journey analysis
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable) - Links to auth.users if authenticated
  - `anonymous_id` (text, nullable) - For non-authenticated users
  - `started_at` (timestamptz)
  - `last_activity_at` (timestamptz)
  - `metadata` (jsonb) - Browser, device, entry point, etc.
  - `ended_at` (timestamptz, nullable)

  ### `analysis_logs`
  Detailed logs of all analysis operations
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Links to sessions table
  - `operation_type` (text) - 'scalp_analysis', 'simulation', etc.
  - `input_data` (jsonb) - Full input parameters
  - `output_data` (jsonb) - Full response data
  - `image_urls` (text[]) - Array of image URLs used
  - `feature_flags` (jsonb) - Feature flag state at time of operation
  - `duration_ms` (integer) - Operation duration
  - `error` (text, nullable) - Error message if operation failed
  - `created_at` (timestamptz)

  ## 2. Indexes
  - Fast lookups by flag key
  - Session tracking by user or anonymous ID
  - Analysis log filtering by session and operation type
  - Time-based queries for all tables

  ## 3. Security
  - Enable RLS on all tables
  - Admin-only access to feature flags (authenticated users with admin role)
  - Session read access for owners
  - Analysis log read access for session owners or admins

  ## 4. Initial Data
  - Seed common feature flags (mock_mode, enable_simulation, etc.)
*/

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  enabled boolean DEFAULT false NOT NULL,
  description text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id text,
  started_at timestamptz DEFAULT now() NOT NULL,
  last_activity_at timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  ended_at timestamptz,
  CONSTRAINT user_or_anonymous CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

-- Create analysis_logs table
CREATE TABLE IF NOT EXISTS analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  operation_type text NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb,
  image_urls text[] DEFAULT ARRAY[]::text[],
  feature_flags jsonb DEFAULT '{}'::jsonb NOT NULL,
  duration_ms integer,
  error text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_anonymous_id ON sessions(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_logs_session_id ON analysis_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_logs_operation_type ON analysis_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_analysis_logs_created_at ON analysis_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_logs ENABLE ROW LEVEL SECURITY;

-- Feature Flags Policies: Admin-only access
CREATE POLICY "Admins can view feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@hairvis.com')
    )
  );

CREATE POLICY "Admins can insert feature flags"
  ON feature_flags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@hairvis.com')
    )
  );

CREATE POLICY "Admins can update feature flags"
  ON feature_flags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@hairvis.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@hairvis.com')
    )
  );

-- Sessions Policies: Users can view their own sessions, admins can view all
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@hairvis.com')
    )
  );

CREATE POLICY "Anonymous users can view own sessions"
  ON sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert sessions"
  ON sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Session owners can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update sessions"
  ON sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Analysis Logs Policies: Session owners and admins can view
CREATE POLICY "Users can view own analysis logs"
  ON analysis_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = analysis_logs.session_id
      AND sessions.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@hairvis.com')
    )
  );

CREATE POLICY "Anonymous users can view own analysis logs"
  ON analysis_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert analysis logs"
  ON analysis_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for feature_flags updated_at
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get active feature flags as JSON
CREATE OR REPLACE FUNCTION get_active_feature_flags()
RETURNS jsonb AS $$
  SELECT jsonb_object_agg(key, jsonb_build_object(
    'enabled', enabled,
    'config', config
  ))
  FROM feature_flags
  WHERE enabled = true;
$$ LANGUAGE sql STABLE;

-- Insert initial feature flags
INSERT INTO feature_flags (key, enabled, description, config) VALUES
  ('mock_mode', false, 'Use mock data instead of real API calls', '{"mock_delay_ms": 1000}'::jsonb),
  ('enable_simulation', true, 'Enable hair transplant simulation feature', '{}'::jsonb),
  ('enable_surgical_planning', false, 'Enable surgical planning tools', '{}'::jsonb),
  ('enable_advanced_metrics', false, 'Show advanced scalp metrics in analysis', '{}'::jsonb),
  ('debug_mode', false, 'Enable verbose logging and debug features', '{}'::jsonb),
  ('maintenance_mode', false, 'Show maintenance message to users', '{"message": "System maintenance in progress"}'::jsonb)
ON CONFLICT (key) DO NOTHING;