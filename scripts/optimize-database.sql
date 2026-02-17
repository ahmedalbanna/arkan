-- Database Optimization Script
-- Phase 5: Performance Optimization
-- Adds additional indexes and optimizations for production workloads

-- ====================
-- Additional Indexes
-- ====================

-- User lookup optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_credits ON users (role, credits);

-- Project search optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user_created ON projects (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user_updated ON projects (user_id, updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_title_trgm ON projects USING gin (title gin_trgm_ops);

-- Transaction analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_created ON transactions (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_status ON transactions (user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_status ON transactions (created_at DESC, status);

-- Credit ledger for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_ledger_user_created ON credit_ledger (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_ledger_transaction ON credit_ledger (transaction_id) WHERE transaction_id IS NOT NULL;

-- Feature flags for quick lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_features_key ON features (key) WHERE enabled = true;

-- ====================
-- Materialized Views
-- ====================

-- User statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_statistics AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.credits,
  u.total_spent,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT t.id) as total_transactions,
  COALESCE(SUM(t.amount), 0) as lifetime_spent,
  u.created_at as member_since,
  u.last_login_at
FROM users u
LEFT JOIN projects p ON p.user_id = u.id
LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'COMPLETED'
GROUP BY u.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_id ON user_statistics (id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_credits ON user_statistics (credits DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_spent ON user_statistics (lifetime_spent DESC);

-- Project analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS project_analytics AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.type,
  jsonb_array_length(COALESCE(p.content->'chapters', '[]'::jsonb)) as chapter_count,
  pg_column_size(p.content) as content_size_bytes,
  p.created_at,
  p.updated_at
FROM projects p;

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_analytics_id ON project_analytics (id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_user ON project_analytics (user_id, created_at DESC);

-- ====================
-- Database Functions
-- ====================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_analytics;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- Vacuum and Analyze
-- ====================

-- Full vacuum and analyze
VACUUM ANALYZE users;
VACUUM ANALYZE projects;
VACUUM ANALYZE transactions;
VACUUM ANALYZE credit_ledger;

-- ====================
-- Statistics Update
-- ====================

-- Update planner statistics
ANALYZE users;
ANALYZE projects;
ANALYZE transactions;
ANALYZE credit_ledger;

-- ====================
-- Connection Pooling Config
-- ====================

-- Set optimal PostgreSQL settings for connection pooling
-- Note: These may need adjustment based on your hardware

-- Show current settings
SELECT name, setting, unit, context 
FROM pg_settings 
WHERE name IN (
  'max_connections',
  'shared_buffers',
  'effective_cache_size',
  'work_mem',
  'maintenance_work_mem'
);

SELECT 'Database optimization completed!' as status;