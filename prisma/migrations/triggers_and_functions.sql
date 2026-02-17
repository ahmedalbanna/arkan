-- ============================================================================
-- Database Triggers and Functions
-- Phase 1: Schema & Database Enhancement
-- ============================================================================

-- ============================================================================
-- 1. AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at 
    BEFORE UPDATE ON report_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docx_templates_updated_at 
    BEFORE UPDATE ON docx_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pptx_templates_updated_at 
    BEFORE UPDATE ON pptx_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_categories_updated_at 
    BEFORE UPDATE ON agent_categories
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indexed_documents_updated_at 
    BEFORE UPDATE ON indexed_documents
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at 
    BEFORE UPDATE ON features
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_tokens_updated_at 
    BEFORE UPDATE ON api_tokens
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. CREDIT LEDGER AUTOMATION (AUDIT TRAIL)
-- ============================================================================

-- Function to log credit changes automatically
CREATE OR REPLACE FUNCTION log_credit_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if credits actually changed
    IF NEW.credits != OLD.credits THEN
        INSERT INTO credit_ledger (
            user_id,
            type,
            amount,
            balance,
            reason,
            reference_type,
            created_at
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.credits > OLD.credits THEN 'credit'
                ELSE 'debit'
            END,
            ABS(NEW.credits - OLD.credits),
            NEW.credits,
            'Automatic credit adjustment',
            'user_update',
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log all credit changes
CREATE TRIGGER log_user_credit_changes 
    AFTER UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION log_credit_change();

-- ============================================================================
-- 3. TRANSACTION STATUS AUTOMATION
-- ============================================================================

-- Function to update user credits when transaction is verified
CREATE OR REPLACE FUNCTION process_verified_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process when status changes to VERIFIED or COMPLETED
    IF NEW.status IN ('VERIFIED', 'COMPLETED') AND OLD.status = 'PENDING' THEN
        -- Update user credits
        UPDATE users 
        SET credits = credits + NEW.credits
        WHERE id = NEW.user_id;
        
        -- Log the credit addition (will be caught by log_credit_change trigger)
        -- Add entry to credit ledger with transaction reference
        INSERT INTO credit_ledger (
            user_id,
            type,
            amount,
            balance,
            reason,
            reference_id,
            reference_type,
            metadata,
            created_at
        ) 
        SELECT 
            NEW.user_id,
            'credit',
            NEW.credits,
            u.credits,
            CONCAT('Transaction ', NEW.type, ' verified'),
            NEW.id,
            'transaction',
            jsonb_build_object(
                'transaction_type', NEW.type,
                'amount', NEW.amount,
                'payment_method', NEW.payment_method
            ),
            CURRENT_TIMESTAMP
        FROM users u
        WHERE u.id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for transaction verification
CREATE TRIGGER process_transaction_verification 
    AFTER UPDATE ON transactions
    FOR EACH ROW 
    EXECUTE FUNCTION process_verified_transaction();

-- ============================================================================
-- 4. USER ACTIVITY TRACKING
-- ============================================================================

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on session creation
CREATE TRIGGER track_user_login 
    AFTER INSERT ON sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_last_login();

-- ============================================================================
-- 5. DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate credit amounts are non-negative
CREATE OR REPLACE FUNCTION validate_credits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.credits < 0 THEN
        RAISE EXCEPTION 'Credits cannot be negative. User: %, Credits: %', NEW.id, NEW.credits;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate credits
CREATE TRIGGER validate_user_credits 
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION validate_credits();

-- ============================================================================
-- 6. SOFT DELETE SUPPORT (FUTURE ENHANCEMENT)
-- ============================================================================

-- Function for soft delete (sets deleted_at timestamp)
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder for future soft delete implementation
    -- Currently, we use Prisma's cascade deletes
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user's current credit balance
CREATE OR REPLACE FUNCTION get_user_credits(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_credits INTEGER;
BEGIN
    SELECT credits INTO user_credits
    FROM users
    WHERE id = user_uuid::text;
    
    RETURN COALESCE(user_credits, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total spent by user
CREATE OR REPLACE FUNCTION calculate_total_spent(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM transactions
    WHERE user_id = user_uuid::text
    AND status IN ('VERIFIED', 'COMPLETED')
    AND type = 'PURCHASE';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get credit ledger summary for a user
CREATE OR REPLACE FUNCTION get_credit_summary(user_uuid UUID)
RETURNS TABLE(
    total_credits INTEGER,
    total_debits INTEGER,
    current_balance INTEGER,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)::INTEGER as total_credits,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0)::INTEGER as total_debits,
        (SELECT credits FROM users WHERE id = user_uuid::text) as current_balance,
        COUNT(*) as transaction_count
    FROM credit_ledger
    WHERE user_id = user_uuid::text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. SEARCH AND INDEXING HELPERS
-- ============================================================================

-- Function to search projects by title or description
CREATE OR REPLACE FUNCTION search_projects(
    search_query TEXT,
    user_uuid UUID DEFAULT NULL
)
RETURNS TABLE(
    id TEXT,
    title TEXT,
    description TEXT,
    type TEXT,
    created_at TIMESTAMP,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.type,
        p.created_at,
        ts_rank(
            to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM projects p
    WHERE 
        (user_uuid IS NULL OR p.user_id = user_uuid::text)
        AND to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'user_id', user_uuid,
        'total_projects', (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid::text),
        'total_transactions', (SELECT COUNT(*) FROM transactions WHERE user_id = user_uuid::text),
        'total_spent', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = user_uuid::text AND status IN ('VERIFIED', 'COMPLETED')),
        'current_credits', (SELECT credits FROM users WHERE id = user_uuid::text),
        'total_notifications', (SELECT COUNT(*) FROM notifications WHERE user_id = user_uuid::text),
        'unread_notifications', (SELECT COUNT(*) FROM notifications WHERE user_id = user_uuid::text AND is_read = false),
        'member_since', (SELECT created_at FROM users WHERE id = user_uuid::text),
        'last_login', (SELECT last_login_at FROM users WHERE id = user_uuid::text)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all triggers are created
-- SELECT trigger_name, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- Verify all functions are created
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_type = 'FUNCTION'
-- ORDER BY routine_name;

-- ============================================================================
-- END OF TRIGGERS AND FUNCTIONS
-- ============================================================================
