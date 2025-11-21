import Database from 'better-sqlite3';
import path from 'path';
import type { Agent } from '@/types/agent';

/**
 * Agent Database Service
 * Provides methods to interact with the SQLite agents database
 */

interface DatabaseAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  author: string;
  tags: string; // JSON string
  created_at: string;
  updated_at: string;
}

interface DatabaseCommand {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  prompt: string;
  example: string;
  input_schema?: string;
  output_format?: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
}

interface DatabaseCapability {
  id: number;
  agent_id: string;
  capability: string;
  description: string;
}

export class AgentDatabaseService {
  private db: Database.Database;
  private static instance: AgentDatabaseService;

  constructor() {
    const dbPath = path.join(process.cwd(), 'src/lib/db/agents.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  static getInstance(): AgentDatabaseService {
    if (!AgentDatabaseService.instance) {
      AgentDatabaseService.instance = new AgentDatabaseService();
    }
    return AgentDatabaseService.instance;
  }

  /**
   * Get all agents with their commands
   */
  getAllAgents(): Agent[] {
    const query = `
      SELECT 
        a.*,
        json_group_array(
          CASE 
            WHEN ac.id IS NOT NULL THEN
              json_object(
                'id', ac.id,
                'name', ac.name,
                'description', ac.description,
                'prompt', ac.prompt,
                'example', ac.example,
                'temperature', ac.temperature,
                'max_tokens', ac.max_tokens
              )
            ELSE NULL
          END
        ) as commands
      FROM agents a
      LEFT JOIN agent_commands ac ON a.id = ac.agent_id
      GROUP BY a.id
      ORDER BY a.name
    `;

    const rows = this.db.prepare(query).all() as (DatabaseAgent & { commands: string })[];
    
    return rows.map(row => this.mapDatabaseAgentToAgent(row));
  }

  /**
   * Get agent by ID
   */
  getAgentById(id: string): Agent | null {
    const query = `
      SELECT 
        a.*,
        json_group_array(
          CASE 
            WHEN ac.id IS NOT NULL THEN
              json_object(
                'id', ac.id,
                'name', ac.name,
                'description', ac.description,
                'prompt', ac.prompt,
                'example', ac.example,
                'temperature', ac.temperature,
                'max_tokens', ac.max_tokens
              )
            ELSE NULL
          END
        ) as commands
      FROM agents a
      LEFT JOIN agent_commands ac ON a.id = ac.agent_id
      WHERE a.id = ?
      GROUP BY a.id
    `;

    const row = this.db.prepare(query).get(id) as (DatabaseAgent & { commands: string }) | undefined;
    
    return row ? this.mapDatabaseAgentToAgent(row) : null;
  }

  /**
   * Get agents by category
   */
  getAgentsByCategory(category: string): Agent[] {
    const query = `
      SELECT 
        a.*,
        json_group_array(
          CASE 
            WHEN ac.id IS NOT NULL THEN
              json_object(
                'id', ac.id,
                'name', ac.name,
                'description', ac.description,
                'prompt', ac.prompt,
                'example', ac.example,
                'temperature', ac.temperature,
                'max_tokens', ac.max_tokens
              )
            ELSE NULL
          END
        ) as commands
      FROM agents a
      LEFT JOIN agent_commands ac ON a.id = ac.agent_id
      WHERE a.category = ?
      GROUP BY a.id
      ORDER BY a.name
    `;

    const rows = this.db.prepare(query).all(category) as (DatabaseAgent & { commands: string })[];
    
    return rows.map(row => this.mapDatabaseAgentToAgent(row));
  }

  /**
   * Search agents by name or description
   */
  searchAgents(searchTerm: string): Agent[] {
    const query = `
      SELECT 
        a.*,
        json_group_array(
          CASE 
            WHEN ac.id IS NOT NULL THEN
              json_object(
                'id', ac.id,
                'name', ac.name,
                'description', ac.description,
                'prompt', ac.prompt,
                'example', ac.example,
                'temperature', ac.temperature,
                'max_tokens', ac.max_tokens
              )
            ELSE NULL
          END
        ) as commands
      FROM agents a
      LEFT JOIN agent_commands ac ON a.id = ac.agent_id
      WHERE a.name LIKE ? OR a.description LIKE ?
      GROUP BY a.id
      ORDER BY a.name
    `;

    const searchPattern = `%${searchTerm}%`;
    const rows = this.db.prepare(query).all(searchPattern, searchPattern) as (DatabaseAgent & { commands: string })[];
    
    return rows.map(row => this.mapDatabaseAgentToAgent(row));
  }

  /**
   * Get database statistics
   */
  getStats() {
    const agentCount = this.db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number };
    const commandCount = this.db.prepare('SELECT COUNT(*) as count FROM agent_commands').get() as { count: number };
    const categoryStats = this.db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM agents 
      GROUP BY category 
      ORDER BY count DESC
    `).all() as { category: string; count: number }[];

    return {
      totalAgents: agentCount.count,
      totalCommands: commandCount.count,
      categoriesBreakdown: categoryStats
    };
  }

  /**
   * Insert new agent
   */
  insertAgent(agent: Omit<Agent, 'created_at' | 'updated_at'>): void {
    const insertAgent = this.db.prepare(`
      INSERT INTO agents (id, name, description, icon, category, version, author, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCommand = this.db.prepare(`
      INSERT INTO agent_commands (id, agent_id, name, description, prompt, example, temperature, max_tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      // Insert agent
      insertAgent.run([
        agent.id,
        agent.name,
        agent.description || '',
        agent.icon || '🤖',
        agent.category || 'General',
        agent.version || '1.0.0',
        agent.author || 'Unknown',
        JSON.stringify(agent.tags || [])
      ]);

      // Insert commands
      agent.commands?.forEach((command, index) => {
        insertCommand.run([
          command.id || `${agent.id}_cmd_${index}`,
          agent.id,
          command.name,
          command.description || '',
          command.prompt,
          command.example || '',
          command.temperature || 0.7,
          command.max_tokens || 1000
        ]);
      });
    });

    transaction();
  }

  /**
   * Update agent
   */
  updateAgent(agent: Agent): void {
    const updateAgent = this.db.prepare(`
      UPDATE agents 
      SET name = ?, description = ?, icon = ?, category = ?, version = ?, author = ?, tags = ?
      WHERE id = ?
    `);

    updateAgent.run([
      agent.name,
      agent.description || '',
      agent.icon || '🤖',
      agent.category || 'General',
      agent.version || '1.0.0',
      agent.author || 'Unknown',
      JSON.stringify(agent.tags || []),
      agent.id
    ]);
  }

  /**
   * Delete agent and all related data
   */
  deleteAgent(agentId: string): void {
    const deleteAgent = this.db.prepare('DELETE FROM agents WHERE id = ?');
    deleteAgent.run(agentId);
    // Commands and other related data will be deleted by CASCADE
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Map database row to Agent type
   */
  private mapDatabaseAgentToAgent(row: DatabaseAgent & { commands: string }): Agent {
    let commands = [];
    
    try {
      const parsedCommands = JSON.parse(row.commands);
      commands = parsedCommands.filter((cmd: any) => cmd !== null);
    } catch (error) {
      console.error('Error parsing commands JSON:', error);
      commands = [];
    }

    let tags = [];
    try {
      tags = JSON.parse(row.tags);
    } catch (error) {
      console.error('Error parsing tags JSON:', error);
      tags = [];
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      category: row.category,
      version: row.version,
      author: row.author,
      tags,
      commands,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

// Export singleton instance
export const agentDb = AgentDatabaseService.getInstance();