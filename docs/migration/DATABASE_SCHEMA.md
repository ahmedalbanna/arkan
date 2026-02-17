# PostgreSQL Database Schema Design

## Overview
Complete database schema design for migrating Arkan from Firebase Firestore to PostgreSQL. This schema maintains ACID compliance for financial transactions while providing JSONB flexibility for dynamic content.

## Design Principles

1. **ACID Compliance**: All financial operations (credits, transactions) use strict relational schema
2. **JSONB Flexibility**: Project content and dynamic data stored in JSONB columns
3. **Normalization**: Proper normalization to 3NF where appropriate
4. **Indexing Strategy**: Strategic indexes for query performance
5. **Referential Integrity**: Foreign key constraints for data consistency

---

## Core Tables

### 1. users
**Purpose**: User accounts, authentication, and credit management

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication & Identity
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    password_hash VARCHAR(255), -- For credential auth (NextAuth)
    name VARCHAR(255) NOT NULL,
    
    -- Profile
    bio TEXT,
    profile_picture_url TEXT,
    
    -- Authorization
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    
    -- Credits & Billing
    credits INTEGER DEFAULT 0 CHECK (credits >= 0),
    
    -- Onboarding & UX
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    
    -- API Keys (encrypted JSONB)
    api_keys JSONB DEFAULT '{}', -- { "gemini": "...", "chatgpt": "..." }
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Soft delete
    deleted_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

**Key Features**:
- UUID primary keys for security
- Check constraint ensures credits never go negative
- JSONB for flexible API key storage
- Soft delete support
- Email uniqueness constraint

---

### 2. accounts
**Purpose**: NextAuth OAuth provider accounts (Google, GitHub, etc.)

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Provider Information
    type VARCHAR(50) NOT NULL, -- 'oauth', 'email', 'credentials'
    provider VARCHAR(50) NOT NULL, -- 'google', 'github', 'credentials'
    provider_account_id VARCHAR(255) NOT NULL,
    
    -- OAuth Tokens
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for provider + account
    CONSTRAINT accounts_provider_account_unique UNIQUE (provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider, provider_account_id);
```

**NextAuth Integration**: This table follows NextAuth's Prisma adapter schema

---

### 3. sessions
**Purpose**: NextAuth session management

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Data
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);
```

---

### 4. verification_tokens
**Purpose**: Email verification and password reset tokens

```sql
CREATE TABLE verification_tokens (
    identifier VARCHAR(255) NOT NULL, -- email address
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    
    PRIMARY KEY (identifier, token)
);

CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
```

---

### 5. projects
**Purpose**: User projects with flexible JSONB content

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Metadata (structured)
    title VARCHAR(500) NOT NULL,
    description TEXT,
    project_type VARCHAR(100), -- 'report', 'presentation', 'thesis', etc.
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    
    -- Flexible Content (JSONB)
    -- Stores: chapters, sections, TOC, settings, formatting preferences
    content JSONB DEFAULT '{}',
    
    -- Metadata (JSONB for extensibility)
    meta JSONB DEFAULT '{}', -- author, language, word count, etc.
    
    -- Settings (JSONB)
    settings JSONB DEFAULT '{}', -- formatting, citation style, etc.
    
    -- Cover/Logo
    logo_url TEXT,
    cover_page_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP,
    
    -- Soft delete
    deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;

-- GIN index for JSONB content search
CREATE INDEX idx_projects_content_gin ON projects USING GIN (content);
CREATE INDEX idx_projects_meta_gin ON projects USING GIN (meta);
```

**JSONB Structure Example**:
```json
{
  "chapters": [
    {
      "id": "ch-1",
      "title": "Introduction",
      "sections": [...],
      "content": "..."
    }
  ],
  "toc": { ... },
  "references": [ ... ]
}
```

---

### 6. transactions
**Purpose**: Financial transactions for credit purchases (ACID critical)

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User & Plan
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plan_id VARCHAR(100) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    
    -- Financial Data (CRITICAL - ACID)
    credits INTEGER NOT NULL CHECK (credits > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- User Info Snapshot (denormalized for audit)
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    
    -- Transaction Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    
    -- Payment Proof
    proof_url TEXT NOT NULL,
    
    -- Admin Actions
    admin_notes TEXT,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_verified_by ON transactions(verified_by);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
```

**Critical Notes**:
- DELETE RESTRICT prevents accidental user deletion with pending transactions
- Denormalized user info for audit trail
- Decimal type for price to avoid floating-point errors

---

### 7. credit_ledger
**Purpose**: Immutable audit log of all credit changes (NEW - not in Firebase)

```sql
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Change Details
    amount INTEGER NOT NULL, -- Positive for addition, negative for deduction
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Reason & Source
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'purchase', 'gift', 'deduction', 'refund', 'adjustment'
    )),
    reference_id UUID, -- References transactions.id, or other source
    reference_type VARCHAR(50), -- 'transaction', 'ai_generation', 'admin_gift'
    
    -- Context
    description TEXT,
    performed_by UUID REFERENCES users(id), -- Admin who made the change (if applicable)
    
    -- Timestamp (immutable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_credit_ledger_user_id ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_created_at ON credit_ledger(created_at DESC);
CREATE INDEX idx_credit_ledger_reference ON credit_ledger(reference_type, reference_id);
CREATE INDEX idx_credit_ledger_user_created ON credit_ledger(user_id, created_at DESC);
```

**Audit Trail**: Every credit change creates an immutable ledger entry

---

### 8. agent_generations
**Purpose**: Logging of AI generation requests

```sql
CREATE TABLE agent_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User & Agent
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    agent_name VARCHAR(255),
    
    -- Request Details
    flow_name VARCHAR(100) NOT NULL,
    input_data JSONB,
    
    -- Response
    output_data JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    
    -- Metrics
    tokens_used INTEGER,
    execution_time_ms INTEGER,
    credits_consumed INTEGER DEFAULT 0,
    
    -- Model Info
    model_name VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_agent_generations_user_id ON agent_generations(user_id);
CREATE INDEX idx_agent_generations_agent_id ON agent_generations(agent_id);
CREATE INDEX idx_agent_generations_flow ON agent_generations(flow_name);
CREATE INDEX idx_agent_generations_created_at ON agent_generations(created_at DESC);
CREATE INDEX idx_agent_generations_user_agent ON agent_generations(user_id, agent_id, created_at DESC);
CREATE INDEX idx_agent_generations_status ON agent_generations(status);
```

---

## Configuration Tables

### 9. features
**Purpose**: Feature flags and configuration

```sql
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Feature Info
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- State
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Configuration (JSONB)
    config JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_features_key ON features(key);
CREATE INDEX idx_features_enabled ON features(enabled);
```

---

### 10. agents
**Purpose**: AI agent configurations

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agent Info
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES agent_categories(id),
    
    -- Configuration
    config JSONB DEFAULT '{}', -- prompts, parameters, etc.
    
    -- State
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Display
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agents_key ON agents(key);
CREATE INDEX idx_agents_category ON agents(category_id);
CREATE INDEX idx_agents_enabled ON agents(enabled);
CREATE INDEX idx_agents_order ON agents(order_index);
```

---

### 11. agent_categories
**Purpose**: Agent categorization

```sql
CREATE TABLE agent_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Category Info
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Display
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_categories_key ON agent_categories(key);
CREATE INDEX idx_agent_categories_order ON agent_categories(order_index);
```

---

### 12. sections
**Purpose**: Report/document section templates

```sql
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Section Info
    key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Configuration
    config JSONB DEFAULT '{}',
    prompt_template TEXT,
    
    -- Display
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sections_key ON sections(key);
CREATE INDEX idx_sections_enabled ON sections(enabled);
CREATE INDEX idx_sections_order ON sections(order_index);
```

---

### 13. templates
**Purpose**: Document templates (DOCX, PPTX, Report styles)

```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Info
    type VARCHAR(50) NOT NULL CHECK (type IN ('docx', 'pptx', 'report_style')),
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template Data
    config JSONB DEFAULT '{}', -- Styling, layout, formatting
    thumbnail_url TEXT,
    
    -- State
    enabled BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Display
    order_index INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per type
    CONSTRAINT templates_type_key_unique UNIQUE (type, key)
);

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_enabled ON templates(enabled);
CREATE INDEX idx_templates_type_enabled ON templates(type, enabled);
CREATE INDEX idx_templates_order ON templates(order_index);
```

---

### 14. settings
**Purpose**: Global application settings

```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Setting Info
    key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    
    -- Value (JSONB for flexibility)
    value JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Public settings (e.g., bank info)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_public ON settings(is_public);
```

---

### 15. indexed_documents
**Purpose**: RAG system document tracking (Qdrant integration)

```sql
CREATE TABLE indexed_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Document Info
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'txt', etc.
    file_size BIGINT, -- bytes
    
    -- RAG Integration
    vector_count INTEGER DEFAULT 0, -- Number of chunks/vectors created
    collection_name VARCHAR(100) DEFAULT 'documents', -- Qdrant collection
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Ownership (optional - can be admin-only or user-specific)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Processing Stats
    processing_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    indexed_at TIMESTAMP
);

CREATE INDEX idx_indexed_documents_status ON indexed_documents(status);
CREATE INDEX idx_indexed_documents_user_id ON indexed_documents(user_id);
CREATE INDEX idx_indexed_documents_project_id ON indexed_documents(project_id);
CREATE INDEX idx_indexed_documents_created_at ON indexed_documents(created_at DESC);
CREATE INDEX idx_indexed_documents_file_type ON indexed_documents(file_type);
```

---

### 16. device_tokens
**Purpose**: Firebase Cloud Messaging (FCM) push notification tokens

```sql
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token
    token TEXT UNIQUE NOT NULL,
    
    -- Device Info
    device_type VARCHAR(50), -- 'web', 'android', 'ios'
    browser VARCHAR(100),
    os VARCHAR(100),
    
    -- State
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active);
```

---

### 17. notifications
**Purpose**: User notifications (NEW - not in current Firebase)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type VARCHAR(50) NOT NULL, -- 'transaction_verified', 'generation_complete', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Action
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- State
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Reference
    reference_id UUID,
    reference_type VARCHAR(50), -- 'transaction', 'project', etc.
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## Database Triggers & Functions

### Auto-update timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for other tables)
```

### Credit ledger automation

```sql
-- Function to log credit changes
CREATE OR REPLACE FUNCTION log_credit_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.credits != OLD.credits THEN
        INSERT INTO credit_ledger (
            user_id,
            amount,
            balance_before,
            balance_after,
            transaction_type,
            description
        ) VALUES (
            NEW.id,
            NEW.credits - OLD.credits,
            OLD.credits,
            NEW.credits,
            'adjustment',
            'Automatic ledger entry'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_user_credit_changes AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION log_credit_change();
```

---

## Migration Considerations

### Data Type Mapping

| Firestore | PostgreSQL | Notes |
|-----------|-----------|-------|
| string | VARCHAR/TEXT | Use VARCHAR with limit when possible |
| number | INTEGER/DECIMAL | Use DECIMAL for currency |
| boolean | BOOLEAN | Direct mapping |
| timestamp | TIMESTAMP | Convert Firestore Timestamp |
| map | JSONB | Flexible objects |
| array | JSONB | Or use PostgreSQL arrays |
| reference | UUID + FK | Convert document refs to UUIDs |

### JSONB vs Relational Trade-offs

**Use JSONB when**:
- Data structure varies significantly
- Rapid iteration needed
- Deeply nested objects
- Example: Project content, metadata

**Use Relational when**:
- Data integrity critical (financial)
- Complex queries needed
- Referential integrity required
- Example: Users, transactions, credits

---

## Performance Considerations

1. **Indexes**: Strategic indexing on foreign keys, timestamps, status fields
2. **JSONB GIN Indexes**: For efficient JSONB queries
3. **Partial Indexes**: For soft deletes (`WHERE deleted_at IS NULL`)
4. **Connection Pooling**: PgBouncer for production
5. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

---

## Security Considerations

1. **Row Level Security (RLS)**: Implement RLS policies similar to Firestore rules
2. **Encryption**: Encrypt sensitive fields (API keys) at application layer
3. **Prepared Statements**: Prisma handles this automatically
4. **Audit Logging**: credit_ledger provides financial audit trail
5. **Soft Deletes**: Preserve data for compliance

---

## Next Steps

1. Review and validate schema design
2. Create Prisma schema from this design
3. Setup migration scripts from Firestore
4. Implement RLS policies
5. Performance testing with realistic data volumes
