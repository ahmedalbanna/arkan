-- Agent Database Schema
-- SQLite database for storing AI agents and their configurations
-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    version TEXT DEFAULT '1.0.0',
    author TEXT,
    tags TEXT,
    -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Create agent_commands table
CREATE TABLE IF NOT EXISTS agent_commands (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    example TEXT,
    input_schema TEXT,
    -- JSON schema for input validation
    output_format TEXT,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
-- Create agent_capabilities table
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    capability TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
-- Create agent_examples table
CREATE TABLE IF NOT EXISTS agent_examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    command_id TEXT,
    title TEXT NOT NULL,
    input_example TEXT,
    output_example TEXT,
    description TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (command_id) REFERENCES agent_commands(id) ON DELETE CASCADE
);
-- Create agent_settings table
CREATE TABLE IF NOT EXISTS agent_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    setting_type TEXT CHECK(
        setting_type IN ('string', 'number', 'boolean', 'json')
    ) DEFAULT 'string',
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    UNIQUE(agent_id, setting_key)
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_author ON agents(author);
CREATE INDEX IF NOT EXISTS idx_agent_commands_agent_id ON agent_commands(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_examples_agent_id ON agent_examples(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_examples_command_id ON agent_examples(command_id);
CREATE INDEX IF NOT EXISTS idx_agent_settings_agent_id ON agent_settings(agent_id);
-- Create trigger to update updated_at timestamp
-- CREATE TRIGGER IF NOT EXISTS update_agents_updated_at
--     AFTER UPDATE ON agents
--     FOR EACH ROW
-- BEGIN
--     UPDATE agents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
-- END;
-- Create view for agents with command count
CREATE VIEW IF NOT EXISTS agents_with_stats AS
SELECT a.*,
    COUNT(ac.id) as command_count,
    GROUP_CONCAT(DISTINCT ac.name) as command_names
FROM agents a
    LEFT JOIN agent_commands ac ON a.id = ac.agent_id
GROUP BY a.id;
-- Create view for full agent details
CREATE VIEW IF NOT EXISTS agent_details AS
SELECT a.id,
    a.name,
    a.description,
    a.icon,
    a.category,
    a.version,
    a.author,
    a.tags,
    a.created_at,
    a.updated_at,
    json_group_array(
        DISTINCT json_object(
            'id',
            ac.id,
            'name',
            ac.name,
            'description',
            ac.description,
            'prompt',
            ac.prompt,
            'example',
            ac.example,
            'temperature',
            ac.temperature,
            'max_tokens',
            ac.max_tokens
        )
    ) as commands,
    json_group_array(
        DISTINCT json_object(
            'capability',
            cap.capability,
            'description',
            cap.description
        )
    ) as capabilities
FROM agents a
    LEFT JOIN agent_commands ac ON a.id = ac.agent_id
    LEFT JOIN agent_capabilities cap ON a.id = cap.agent_id
GROUP BY a.id;
