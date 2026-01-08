/*
  # Add Public Read Access for Active Clinics

  ## Overview
  Adds a Row Level Security policy to allow unauthenticated users to view active clinics.
  This is needed for the public clinic directory and landing page.

  ## Changes
  - Add policy "Anyone can view active clinics" for SELECT on clinics table
  - Only allows viewing clinics with status = 'ACTIVE'

  ## Security
  - Read-only access for public users
  - Only exposes active clinics
  - Does not expose sensitive clinic data
*/

-- Add policy for public read access to active clinics
CREATE POLICY "Anyone can view active clinics"
  ON clinics FOR SELECT
  TO public
  USING (status = 'ACTIVE');
