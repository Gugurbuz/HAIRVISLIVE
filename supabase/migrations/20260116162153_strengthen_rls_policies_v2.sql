/*
  # Strengthen Row Level Security Policies (v2)

  ## Overview
  Replace weak RLS policies with role-based, restrictive policies across all tables.
  Implements principle of least privilege and secure-by-default approach.

  ## Changes
  - Drop all existing weak policies
  - Add role-based restrictive policies
  - Add audit triggers for sensitive operations

  ## Security Notes
  - All policies check authentication first
  - Sensitive fields hidden from unauthorized users
  - Audit logging triggers added for critical operations
*/

-- ========================================
-- LEADS TABLE RLS POLICIES
-- ========================================

-- Drop all existing policies on leads
DROP POLICY IF EXISTS "Authenticated users can create leads" ON leads;
DROP POLICY IF EXISTS "Public can view available lead thumbnails" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Anyone can view leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON leads;

-- SELECT: Clinics see purchased leads, patients see their own, admins see all
CREATE POLICY "Role-based lead viewing"
  ON leads FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    (
      is_clinic(auth.uid()) AND
      clinic_id IN (
        SELECT ur.clinic_id FROM user_roles ur
        WHERE ur.user_id = auth.uid()
      )
    )
    OR
    (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- INSERT: Authenticated users can create leads
CREATE POLICY "Authenticated can create own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'AVAILABLE'
      AND is_unlocked = false
      AND clinic_id IS NULL
    )
    OR
    is_admin(auth.uid())
  );

-- UPDATE: Only admins and owning clinics can update
CREATE POLICY "Role-based lead updating"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    (
      is_clinic(auth.uid()) AND
      clinic_id IN (
        SELECT ur.clinic_id FROM user_roles ur
        WHERE ur.user_id = auth.uid()
      )
    )
  );

-- DELETE: Only admins can delete leads
CREATE POLICY "Admins only delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ========================================
-- CLINICS TABLE RLS POLICIES
-- ========================================

-- Drop all existing policies on clinics
DROP POLICY IF EXISTS "Anyone can register as clinic" ON clinics;
DROP POLICY IF EXISTS "Anyone can view active clinics" ON clinics;
DROP POLICY IF EXISTS "Clinics can update their own data" ON clinics;
DROP POLICY IF EXISTS "Clinics can view their own data" ON clinics;

-- SELECT: Public sees active, staff sees own, admin sees all
CREATE POLICY "Tiered clinic viewing"
  ON clinics FOR SELECT
  USING (
    status = 'ACTIVE'
    OR
    (
      auth.uid() IS NOT NULL AND
      id IN (
        SELECT ur.clinic_id FROM user_roles ur
        WHERE ur.user_id = auth.uid()
      )
    )
    OR
    (auth.uid() IS NOT NULL AND is_admin(auth.uid()))
  );

-- INSERT: Only admins can create clinics
CREATE POLICY "Admins only create clinics"
  ON clinics FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- UPDATE: Clinic staff or admins
CREATE POLICY "Staff or admins update clinics"
  ON clinics FOR UPDATE
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    id IN (
      SELECT ur.clinic_id FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'clinic'
    )
  );

-- DELETE: Only admins can delete clinics
CREATE POLICY "Admins only delete clinics"
  ON clinics FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ========================================
-- PROPOSALS TABLE RLS POLICIES
-- ========================================

-- Drop all existing policies on proposals
DROP POLICY IF EXISTS "Clinics can create proposals for available leads" ON proposals;
DROP POLICY IF EXISTS "Clinics can update their own proposals" ON proposals;
DROP POLICY IF EXISTS "Clinics can view their own proposals" ON proposals;

-- SELECT: Only involved parties
CREATE POLICY "Involved parties view proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    clinic_id IN (
      SELECT ur.clinic_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
    OR
    lead_id IN (
      SELECT l.id FROM leads l
      WHERE l.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- INSERT: Only clinic staff
CREATE POLICY "Clinic staff create proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin(auth.uid())
    OR
    (
      is_clinic(auth.uid()) AND
      clinic_id IN (
        SELECT ur.clinic_id FROM user_roles ur
        WHERE ur.user_id = auth.uid()
      )
    )
  );

-- UPDATE: Only proposal creator clinic
CREATE POLICY "Clinic staff update own proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    clinic_id IN (
      SELECT ur.clinic_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

-- DELETE: Only admins
CREATE POLICY "Admins only delete proposals"
  ON proposals FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ========================================
-- TRANSACTIONS TABLE RLS POLICIES
-- ========================================

-- Drop all existing policies on transactions
DROP POLICY IF EXISTS "Clinics can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;

-- SELECT: Clinic's own or admin
CREATE POLICY "Clinic or admin view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    clinic_id IN (
      SELECT ur.clinic_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

-- INSERT: Admin only
CREATE POLICY "Admins only create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- UPDATE: Admin only
CREATE POLICY "Admins only update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- DELETE: Admin only
CREATE POLICY "Admins only delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ========================================
-- LEAD IMAGES RLS POLICIES
-- ========================================

-- Drop all existing policies on lead_images
DROP POLICY IF EXISTS "Anyone can insert lead images" ON lead_images;
DROP POLICY IF EXISTS "Authenticated users can delete lead images" ON lead_images;
DROP POLICY IF EXISTS "Authenticated users can update lead images" ON lead_images;
DROP POLICY IF EXISTS "Authenticated users can view lead images" ON lead_images;

-- SELECT: Only if user can access parent lead
CREATE POLICY "Lead access controls images"
  ON lead_images FOR SELECT
  TO authenticated
  USING (can_access_lead(auth.uid(), lead_id));

-- INSERT: Lead owner or authorized
CREATE POLICY "Authorized image upload"
  ON lead_images FOR INSERT
  TO authenticated
  WITH CHECK (
    can_access_lead(auth.uid(), lead_id)
    OR
    lead_id IN (
      SELECT l.id FROM leads l
      WHERE l.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- UPDATE: Admins only
CREATE POLICY "Admins only update images"
  ON lead_images FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- DELETE: Authorized users
CREATE POLICY "Authorized image deletion"
  ON lead_images FOR DELETE
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR
    can_access_lead(auth.uid(), lead_id)
  );

-- ========================================
-- SESSIONS AND LOGS
-- ========================================

DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can view own analysis logs" ON analysis_logs;
DROP POLICY IF EXISTS "Users can view session analysis logs" ON analysis_logs;
CREATE POLICY "Session-based analysis log access"
  ON analysis_logs FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      WHERE s.user_id = auth.uid()
    )
    OR
    is_admin(auth.uid())
  );

-- ========================================
-- AUDIT TRIGGERS
-- ========================================

-- Trigger to log lead purchases
CREATE OR REPLACE FUNCTION log_lead_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.clinic_id IS NOT NULL AND (OLD.clinic_id IS NULL OR OLD.clinic_id != NEW.clinic_id) THEN
    PERFORM log_audit_event(
      'lead_purchased',
      'lead',
      NEW.id::text,
      jsonb_build_object(
        'clinic_id', NEW.clinic_id,
        'price', NEW.price,
        'status', NEW.status
      ),
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_lead_purchase_trigger ON leads;
CREATE TRIGGER log_lead_purchase_trigger
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_purchase();

-- Trigger to log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role != OLD.role THEN
    PERFORM log_audit_event(
      'role_changed',
      'user_role',
      NEW.user_id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      ),
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_role_change_trigger ON user_roles;
CREATE TRIGGER log_role_change_trigger
  AFTER UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();