/*
  # Add Prompt Management and AI Logging System
  
  ## Overview
  This migration adds comprehensive prompt versioning, usage tracking, and AI validation error logging.
  
  ## New Tables
  
  ### 1. `prompts`
  Stores versioned AI prompts with metadata for tracking and rollback capabilities.
  - `id` (uuid, primary key) - Unique identifier for each prompt version
  - `name` (text) - Prompt identifier (e.g., 'scalp_analysis', 'hair_simulation')
  - `version` (text) - Semantic version (e.g., 'v1.0.0', 'v1.1.0')
  - `prompt_text` (text) - The actual prompt content
  - `description` (text) - Human-readable description of the prompt purpose
  - `is_active` (boolean) - Whether this version is currently in use
  - `created_at` (timestamptz) - Creation timestamp
  - `created_by` (text) - User or system that created this version
  - `metadata` (jsonb) - Additional metadata (parameters, model configs, etc.)
  
  ### 2. `prompt_usage_logs`
  Tracks every AI prompt execution for analysis and debugging.
  - `id` (uuid, primary key) - Unique log entry identifier
  - `prompt_id` (uuid, foreign key) - References the prompt version used
  - `prompt_name` (text) - Denormalized prompt name for quick filtering
  - `prompt_version` (text) - Denormalized version for quick filtering
  - `execution_time_ms` (integer) - Time taken to execute the prompt
  - `token_count` (integer) - Number of tokens used (if available)
  - `model` (text) - AI model used (e.g., 'gemini-pro', 'gpt-4')
  - `success` (boolean) - Whether the execution succeeded
  - `error_message` (text, nullable) - Error details if failed
  - `input_hash` (text) - Hash of input data for deduplication analysis
  - `output_size_bytes` (integer) - Size of the output
  - `created_at` (timestamptz) - When the prompt was executed
  - `user_id` (uuid, nullable) - User who triggered this (if applicable)
  - `session_id` (text, nullable) - Session identifier for grouping related calls
  
  ### 3. `ai_validation_errors`
  Logs schema validation failures from AI responses.
  - `id` (uuid, primary key) - Unique error entry identifier
  - `usage_log_id` (uuid, foreign key) - References the prompt execution that failed
  - `prompt_name` (text) - Which prompt generated invalid output
  - `prompt_version` (text) - Version of the prompt
  - `validation_schema` (text) - Name of the validation schema used
  - `errors` (jsonb) - Structured validation error details
  - `raw_response` (text) - The actual invalid response from AI
  - `expected_format` (text) - Description of expected format
  - `created_at` (timestamptz) - When the error occurred
  - `resolved` (boolean) - Whether this error has been addressed
  - `resolution_notes` (text, nullable) - Notes about how it was fixed
  
  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Only authenticated users can read logs
  - Only service role can write to these tables (handled by edge functions)
  
  ## Indexes
  - Performance indexes on frequently queried columns
  - Composite indexes for common query patterns
  
  ## Notes
  1. The prompts table allows A/B testing by having multiple active versions
  2. Usage logs enable cost analysis and performance monitoring
  3. Validation error logs help identify prompt improvements needed
  4. All timestamps use timestamptz for proper timezone handling
*/

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL,
  prompt_text text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'system',
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT unique_prompt_version UNIQUE (name, version)
);

-- Create prompt_usage_logs table
CREATE TABLE IF NOT EXISTS prompt_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE SET NULL,
  prompt_name text NOT NULL,
  prompt_version text NOT NULL,
  execution_time_ms integer DEFAULT 0,
  token_count integer DEFAULT 0,
  model text NOT NULL DEFAULT 'unknown',
  success boolean DEFAULT false,
  error_message text,
  input_hash text,
  output_size_bytes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id uuid,
  session_id text
);

-- Create ai_validation_errors table
CREATE TABLE IF NOT EXISTS ai_validation_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_log_id uuid REFERENCES prompt_usage_logs(id) ON DELETE SET NULL,
  prompt_name text NOT NULL,
  prompt_version text NOT NULL,
  validation_schema text NOT NULL,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_response text NOT NULL,
  expected_format text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolution_notes text
);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_validation_errors ENABLE ROW LEVEL SECURITY;

-- Policies for prompts table
CREATE POLICY "Authenticated users can read prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage prompts"
  ON prompts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for prompt_usage_logs table
CREATE POLICY "Authenticated users can read usage logs"
  ON prompt_usage_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can create usage logs"
  ON prompt_usage_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policies for ai_validation_errors table
CREATE POLICY "Authenticated users can read validation errors"
  ON ai_validation_errors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage validation errors"
  ON ai_validation_errors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_name_version ON prompts(name, version);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_logs_prompt_name ON prompt_usage_logs(prompt_name);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON prompt_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_success ON prompt_usage_logs(success);
CREATE INDEX IF NOT EXISTS idx_usage_logs_session ON prompt_usage_logs(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_validation_errors_prompt_name ON ai_validation_errors(prompt_name);
CREATE INDEX IF NOT EXISTS idx_validation_errors_created_at ON ai_validation_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_errors_resolved ON ai_validation_errors(resolved) WHERE resolved = false;

-- Insert initial prompt versions
INSERT INTO prompts (name, version, prompt_text, description, is_active, created_by)
VALUES 
  (
    'scalp_analysis',
    'v1.0.0',
    'You are an expert dermatologist and hair restoration specialist analyzing scalp photographs.

TASK: Analyze the provided scalp images and provide a comprehensive hair loss assessment.

INPUT: You will receive 1-4 images showing:
- Front view (hairline)
- Top view (crown)
- Left side view
- Right side view

OUTPUT REQUIRED (JSON format):
{
  "norwoodScale": "string (1-7 or I-VII for pattern baldness, or descriptive text for other patterns)",
  "hairLossPattern": "string (Androgenetic Alopecia, Diffuse Thinning, Alopecia Areata, etc.)",
  "severity": "string (Minimal, Mild, Moderate, Severe, Advanced)",
  "affectedAreas": ["string array of affected regions"],
  "estimatedGrafts": "number (100-5000)",
  "graftsRange": {
    "min": "number",
    "max": "number"
  },
  "confidence": "number (0-100)",
  "recommendations": {
    "primary": "string (FUE, FUT, Combined, Medical Treatment, etc.)",
    "alternative": ["array of alternative options"],
    "medicalTreatment": ["array of recommended medications/treatments"],
    "lifestyle": ["array of lifestyle recommendations"]
  },
  "analysis": {
    "hairDensity": "string (Very Low, Low, Medium, High, Very High)",
    "scalpHealth": "string (Excellent, Good, Fair, Poor)",
    "donorAreaQuality": "string (Excellent, Good, Fair, Poor, Limited)",
    "candidacy": "string (Excellent, Good, Fair, Poor)",
    "notes": "string (additional clinical observations)"
  }
}

Return ONLY valid JSON. No additional text or formatting.',
    'Analyzes scalp images to determine hair loss severity and treatment recommendations',
    true,
    'system'
  ),
  (
    'hair_simulation',
    'v1.0.0',
    'You are an expert medical illustrator specializing in hair restoration visualization.

TASK: Generate a photorealistic "after" simulation image showing expected hair restoration results.

Generate the image with natural lighting, realistic density, and professional medical quality.',
    'Generates photorealistic simulation of hair restoration results',
    true,
    'system'
  ),
  (
    'medical_timeline',
    'v1.0.0',
    'You are a medical visualization specialist creating patient education materials.

TASK: Generate a timeline visualization showing hair restoration progression over 12-15 months.

Create a composite timeline image suitable for patient education.',
    'Generates visual timeline showing progressive hair restoration results',
    true,
    'system'
  )
ON CONFLICT (name, version) DO NOTHING;
