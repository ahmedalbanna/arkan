-- Agent Database Schema for SQLite

-- Main table for storing agent definitions
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    version TEXT,
    author TEXT,
    tags TEXT, -- Stored as a JSON array string
    space_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for agent commands, linked to the agents table
CREATE TABLE IF NOT EXISTS agent_commands (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    example TEXT,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- Table for agent capabilities, derived from commands
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    capability TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    UNIQUE(agent_id, capability)
);

-- Table for few-shot examples for agents/commands
CREATE TABLE IF NOT EXISTS agent_examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_id TEXT NOT NULL,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    FOREIGN KEY (command_id) REFERENCES agent_commands(id) ON DELETE CASCADE
);

-- Table for agent settings, like enabled status
CREATE TABLE IF NOT EXISTS agent_settings (
    agent_id TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agent_commands_agent_id ON agent_commands(agent_id);

-- Views for aggregated data
CREATE VIEW IF NOT EXISTS agents_with_stats AS
SELECT 
    a.*,
    (SELECT COUNT(*) FROM agent_commands WHERE agent_id = a.id) as command_count,
    (SELECT COUNT(*) FROM agent_examples WHERE command_id IN (SELECT id FROM agent_commands WHERE agent_id = a.id)) as example_count
FROM agents a;

CREATE VIEW IF NOT EXISTS agent_details AS
SELECT
    a.id as agent_id,
    a.name as agent_name,
    a.description as agent_description,
    a.icon,
    a.category,
    a.tags,
    json_group_array(
        json_object(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'prompt', c.prompt,
            'example', c.example
        )
    ) as commands
FROM agents a
LEFT JOIN agent_commands c ON a.id = c.agent_id
GROUP BY a.id;
