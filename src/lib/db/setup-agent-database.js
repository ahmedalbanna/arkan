#!/usr/bin/env node

/**
 * Agent Database Setup Script
 * Creates SQLite database and imports data from AllAgents.json
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'agents.db');
const SCHEMA_PATH = path.join(__dirname, 'agent-database.sql');
const AGENTS_JSON_PATH = path.join(__dirname, '..', 'AllAgents.json');

/**
 * Create database and tables from schema file
 */
async function createDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🗄️  Creating SQLite database...');
    
    // Remove existing database
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log('   Removed existing database');
    }

    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('   Connected to SQLite database');
    });

    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('   Database schema created successfully');
      resolve(db);
    });
  });
}

/**
 * Load agents data from JSON file
 */
function loadAgentsData() {
  console.log('📄 Loading agents data...');
  
  if (!fs.existsSync(AGENTS_JSON_PATH)) {
    throw new Error(`AllAgents.json not found at ${AGENTS_JSON_PATH}`);
  }

  const agentsData = JSON.parse(fs.readFileSync(AGENTS_JSON_PATH, 'utf8'));
  console.log(`   Loaded ${agentsData.length} agents`);
  return agentsData;
}

/**
 * Transform AllAgents.json data to database format
 */
function transformAgentData(agentData) {
  const agent = {
    id: agentData.id,
    name: agentData.name,
    description: agentData.data.description || '',
    icon: agentData.data.avatar?.data?.value || '🤖',
    category: extractCategory(agentData.name),
    version: '1.0.0',
    author: 'System',
    tags: JSON.stringify(extractTags(agentData)),
    space_id: agentData.space_id
  };

  const commands = (agentData.data.commands || []).map(cmd => ({
    id: `${agentData.id}_${cmd.id}`,
    agent_id: agentData.id,
    name: cmd.name,
    description: cmd.prompt.substring(0, 200) + '...',
    prompt: cmd.prompt,
    example: cmd.example || '',
    temperature: 0.7,
    max_tokens: 1000,
    mode: cmd.mode || 'default'
  }));

  return { agent, commands };
}

/**
 * Extract category from agent name
 */
function extractCategory(name) {
  if (name.includes('Academic') || name.includes('Report') || name.includes('Research')) {
    return 'Academic';
  }
  if (name.includes('Blog') || name.includes('Content') || name.includes('Writing')) {
    return 'Content Creation';
  }
  if (name.includes('User Stories') || name.includes('Task') || name.includes('Project')) {
    return 'Project Management';
  }
  return 'General';
}

/**
 * Extract tags from agent data
 */
function extractTags(agentData) {
  const tags = [];
  
  if (agentData.name.includes('Academic')) tags.push('academic');
  if (agentData.name.includes('Blog')) tags.push('blogging');
  if (agentData.name.includes('User Stories')) tags.push('agile');
  if (agentData.data.language) tags.push(agentData.data.language);
  if (agentData.data.tone) tags.push(agentData.data.tone);
  
  // Add command-based tags
  (agentData.data.commands || []).forEach(cmd => {
    if (cmd.name.includes('Write') || cmd.name.includes('Generate')) {
      tags.push('generation');
    }
    if (cmd.name.includes('Analyze') || cmd.name.includes('Review')) {
      tags.push('analysis');
    }
  });

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Insert agent data into database
 */
async function insertAgentData(db, agentsData) {
  console.log('💾 Inserting agents data...');

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const insertAgent = db.prepare(`
        INSERT INTO agents (id, name, description, icon, category, version, author, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertCommand = db.prepare(`
        INSERT INTO agent_commands (id, agent_id, name, description, prompt, example, temperature, max_tokens)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertCapability = db.prepare(`
        INSERT INTO agent_capabilities (agent_id, capability, description)
        VALUES (?, ?, ?)
      `);

      let processedCount = 0;
      let errorCount = 0;

      agentsData.forEach((agentData) => {
        try {
          const { agent, commands } = transformAgentData(agentData);

          // Insert agent
          insertAgent.run([
            agent.id,
            agent.name,
            agent.description,
            agent.icon,
            agent.category,
            agent.version,
            agent.author,
            agent.tags
          ]);

          // Insert commands
          commands.forEach(cmd => {
            insertCommand.run([
              cmd.id,
              cmd.agent_id,
              cmd.name,
              cmd.description,
              cmd.prompt,
              cmd.example,
              cmd.temperature,
              cmd.max_tokens
            ]);
          });

          // Insert capabilities based on commands
          const capabilities = [...new Set(commands.map(cmd => 
            cmd.name.split(' ')[0].toLowerCase()
          ))];

          capabilities.forEach(capability => {
            insertCapability.run([
              agent.id,
              capability,
              `Can ${capability.toLowerCase()} content`
            ]);
          });

          processedCount++;
          console.log(`   ✅ Processed: ${agent.name}`);

        } catch (error) {
          errorCount++;
          console.error(`   ❌ Error processing agent ${agentData.name}:`, error.message);
        }
      });

      insertAgent.finalize();
      insertCommand.finalize();
      insertCapability.finalize();

      console.log(`\n📊 Import Summary:`);
      console.log(`   Successfully processed: ${processedCount} agents`);
      console.log(`   Errors: ${errorCount}`);

      if (errorCount === 0) {
        resolve();
      } else {
        reject(new Error(`Import completed with ${errorCount} errors`));
      }
    });
  });
}

/**
 * Verify database contents
 */
async function verifyDatabase(db) {
  console.log('🔍 Verifying database...');

  return new Promise((resolve) => {
    db.get('SELECT COUNT(*) as agent_count FROM agents', (err, row) => {
      if (err) {
        console.error('   Error verifying agents:', err);
      } else {
        console.log(`   Total agents: ${row.agent_count}`);
      }

      db.get('SELECT COUNT(*) as command_count FROM agent_commands', (err, row) => {
        if (err) {
          console.error('   Error verifying commands:', err);
        } else {
          console.log(`   Total commands: ${row.command_count}`);
        }

        db.get('SELECT COUNT(*) as capability_count FROM agent_capabilities', (err, row) => {
          if (err) {
            console.error('   Error verifying capabilities:', err);
          } else {
            console.log(`   Total capabilities: ${row.capability_count}`);
          }
          resolve();
        });
      });
    });
  });
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Agent Database Setup\n');

  try {
    // Create database and tables
    const db = await createDatabase();

    // Load agents data
    const agentsData = loadAgentsData();

    // Insert data
    await insertAgentData(db, agentsData);

    // Verify results
    await verifyDatabase(db);

    // Close database
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('\n✅ Database setup completed successfully!');
        console.log(`   Database file: ${DB_PATH}`);
      }
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { createDatabase, loadAgentsData, transformAgentData, main };