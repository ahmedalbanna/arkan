-- ============================================================================
-- Row-Level Security (RLS) Policies
-- Phase 1: Schema & Database Enhancement
-- ============================================================================

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Note: Template tables (report_templates, docx_templates, pptx_templates) are public
-- Note: Agent tables are public for all authenticated users
-- Note: Settings and Features are read-only for users, writable by admins

-- ============================================================================
-- 2. CREATE HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get current user ID from JWT or session
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
    -- This will be populated by Hasura JWT claims or NextAuth session
    -- For now, returns the session user
    RETURN current_setting('app.current_user_id', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE id = current_user_id();
    
    RETURN user_role IN ('ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a resource
CREATE OR REPLACE FUNCTION owns_resource(resource_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN resource_user_id = current_user_id() OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY users_select_own
    ON users FOR SELECT
    USING (id = current_user_id() OR is_admin());

-- Users can update their own profile (except role and credits)
CREATE POLICY users_update_own
    ON users FOR UPDATE
    USING (id = current_user_id())
    WITH CHECK (
        id = current_user_id() 
        AND role = (SELECT role FROM users WHERE id = current_user_id())
        AND credits = (SELECT credits FROM users WHERE id = current_user_id())
    );

-- Only admins can insert users
CREATE POLICY users_insert_admin
    ON users FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can delete users
CREATE POLICY users_delete_admin
    ON users FOR DELETE
    USING (is_admin());

-- Admins can update any user
CREATE POLICY users_admin_update
    ON users FOR UPDATE
    USING (is_admin());

-- ============================================================================
-- 4. PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can view their own projects
CREATE POLICY projects_select_own
    ON projects FOR SELECT
    USING (user_id = current_user_id() OR is_admin());

-- Users can create their own projects
CREATE POLICY projects_insert_own
    ON projects FOR INSERT
    WITH CHECK (user_id = current_user_id());

-- Users can update their own projects
CREATE POLICY projects_update_own
    ON projects FOR UPDATE
    USING (user_id = current_user_id() OR is_admin())
    WITH CHECK (user_id = current_user_id() OR is_admin());

-- Users can delete their own projects
CREATE POLICY projects_delete_own
    ON projects FOR DELETE
    USING (user_id = current_user_id() OR is_admin());

-- ============================================================================
-- 5. TRANSACTIONS TABLE POLICIES (CRITICAL - FINANCIAL DATA)
-- ============================================================================

-- Users can view their own transactions only
CREATE POLICY transactions_select_own
    ON transactions FOR SELECT
    USING (user_id = current_user_id() OR is_admin());

-- Users can create their own transactions
CREATE POLICY transactions_insert_own
    ON transactions FOR INSERT
    WITH CHECK (user_id = current_user_id());

-- Users CANNOT update transactions (only admins can verify)
CREATE POLICY transactions_update_admin_only
    ON transactions FOR UPDATE
    USING (is_admin());

-- Users CANNOT delete transactions (audit trail)
CREATE POLICY transactions_delete_admin_only
    ON transactions FOR DELETE
    USING (is_admin());

-- ============================================================================
-- 6. CREDIT LEDGER POLICIES (AUDIT TRAIL - READ ONLY FOR USERS)
-- ============================================================================

-- Users can view their own credit history
CREATE POLICY credit_ledger_select_own
    ON credit_ledger FOR SELECT
    USING (user_id = current_user_id() OR is_admin());

-- Only system triggers can insert (no direct inserts by users)
CREATE POLICY credit_ledger_insert_system
    ON credit_ledger FOR INSERT
    WITH CHECK (is_admin());

-- No updates allowed (immutable audit log)
CREATE POLICY credit_ledger_no_update
    ON credit_ledger FOR UPDATE
    USING (false);

-- Only admins can delete (for corrections only)
CREATE POLICY credit_ledger_delete_admin
    ON credit_ledger FOR DELETE
    USING (is_admin());

-- ============================================================================
-- 7. NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY notifications_select_own
    ON notifications FOR SELECT
    USING (user_id = current_user_id() OR is_admin());

-- System/admins can create notifications for users
CREATE POLICY notifications_insert_system
    ON notifications FOR INSERT
    WITH CHECK (is_admin());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own
    ON notifications FOR UPDATE
    USING (user_id = current_user_id() OR is_admin())
    WITH CHECK (user_id = current_user_id() OR is_admin());

-- Users can delete their own notifications
CREATE POLICY notifications_delete_own
    ON notifications FOR DELETE
    USING (user_id = current_user_id() OR is_admin());

-- ============================================================================
-- 8. API TOKENS TABLE POLICIES
-- ============================================================================

-- Users can view their own API tokens
CREATE POLICY api_tokens_select_own
    ON api_tokens FOR SELECT
    USING (user_id = current_user_id() OR is_admin());

-- Users can create their own API tokens
CREATE POLICY api_tokens_insert_own
    ON api_tokens FOR INSERT
    WITH CHECK (user_id = current_user_id());

-- Users can update their own API tokens (revoke, rename)
CREATE POLICY api_tokens_update_own
    ON api_tokens FOR UPDATE
    USING (user_id = current_user_id() OR is_admin())
    WITH CHECK (user_id = current_user_id() OR is_admin());

-- Users can delete their own API tokens
CREATE POLICY api_tokens_delete_own
    ON api_tokens FOR DELETE
    USING (user_id = current_user_id() OR is_admin());

-- ============================================================================
-- 9. GENERATION LOGS POLICIES (PRIVACY & DEBUGGING)
-- ============================================================================

-- Users can view their own generation logs
CREATE POLICY generation_logs_select_own
    ON generation_logs FOR SELECT
    USING (user_id = current_user_id() OR is_admin() OR user_id IS NULL);

-- System can insert generation logs
CREATE POLICY generation_logs_insert_system
    ON generation_logs FOR INSERT
    WITH CHECK (true); -- Allow system to log all generations

-- No updates to logs (immutable)
CREATE POLICY generation_logs_no_update
    ON generation_logs FOR UPDATE
    USING (is_admin());

-- Only admins can delete logs
CREATE POLICY generation_logs_delete_admin
    ON generation_logs FOR DELETE
    USING (is_admin());

-- ============================================================================
-- 10. PUBLIC READ POLICIES FOR SHARED TABLES
-- ============================================================================

-- Report Templates (public read, admin write)
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_templates_select_all
    ON report_templates FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY report_templates_modify_admin
    ON report_templates FOR ALL
    USING (is_admin());

-- DOCX Templates (public read, admin write)
ALTER TABLE docx_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY docx_templates_select_all
    ON docx_templates FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY docx_templates_modify_admin
    ON docx_templates FOR ALL
    USING (is_admin());

-- PPTX Templates (public read, admin write)
ALTER TABLE pptx_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY pptx_templates_select_all
    ON pptx_templates FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY pptx_templates_modify_admin
    ON pptx_templates FOR ALL
    USING (is_admin());

-- Agent Categories (public read, admin write)
ALTER TABLE agent_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_categories_select_all
    ON agent_categories FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY agent_categories_modify_admin
    ON agent_categories FOR ALL
    USING (is_admin());

-- Agents (public read, admin write)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_select_all
    ON agents FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY agents_modify_admin
    ON agents FOR ALL
    USING (is_admin());

-- Settings (public read for isPublic, admin write)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_select_public
    ON settings FOR SELECT
    USING (is_public = true OR is_admin());

CREATE POLICY settings_modify_admin
    ON settings FOR ALL
    USING (is_admin());

-- Features (public read, admin write)
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY features_select_all
    ON features FOR SELECT
    USING (true); -- All users can check feature flags

CREATE POLICY features_modify_admin
    ON features FOR ALL
    USING (is_admin());

-- Indexed Documents (admin only for now)
ALTER TABLE indexed_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY indexed_documents_admin_only
    ON indexed_documents FOR ALL
    USING (is_admin());

-- ============================================================================
-- 11. SESSION AND AUTH TABLES (NextAuth)
-- ============================================================================

-- These tables are managed by NextAuth and don't need RLS
-- as they are accessed via server-side API routes only
-- accounts, sessions, verification_tokens remain without RLS

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View all RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test RLS policies (as regular user)
-- SET app.current_user_id = 'some-user-id';
-- SELECT * FROM projects; -- Should only see own projects
-- SELECT * FROM transactions; -- Should only see own transactions
-- RESET app.current_user_id;

-- Test RLS policies (as admin)
-- First, set a user as admin in database:
-- UPDATE users SET role = 'ADMIN' WHERE email = 'admin@arkan.dev';
-- Then set session:
-- SET app.current_user_id = 'admin-user-id';
-- SELECT * FROM projects; -- Should see all projects
-- RESET app.current_user_id;

-- ============================================================================
-- END OF ROW LEVEL SECURITY POLICIES
-- ============================================================================
