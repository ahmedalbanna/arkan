
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
const AGENTS_JSON_PATH = path.join(__dirname, 'seed-data', 'AllAgents.json');

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
    category: extractCategory(agentData),
    version: '1.0.0',
    author: 'System',
    tags: JSON.stringify(extractTags(agentData)),
    space_id: agentData.space_id,
    prompt: agentData.data.prompt || `You are an expert ${agentData.name}.`,
    guidelines: JSON.stringify(agentData.data.guidelines || [])
  };

  return { agent };
}


/**
 * Extract category from agent data
 */
function extractCategory(agentData) {
  const name = agentData.name.toLowerCase();
  const description = (agentData.data.description || '').toLowerCase();
  const content = `${name} ${description}`;

  // Featured/Popular categories first
  if (content.includes('featured') || content.includes('popular') || content.includes('top')) {
    return 'Featured';
  }

  // Business & Management
  if (content.includes('project') || content.includes('user stories') || content.includes('agile') || 
      content.includes('scrum') || content.includes('kanban')) {
    return 'Project Management';
  }
  
  if (content.includes('task') || content.includes('todo') || content.includes('schedule') || 
      content.includes('organize') || content.includes('plan')) {
    return 'Task Management';
  }

  if (content.includes('productivity') || content.includes('efficiency') || content.includes('workflow')) {
    return 'Productivity';
  }

  if (content.includes('meeting') || content.includes('standup') || content.includes('conference')) {
    return 'Meetings';
  }

  if (content.includes('crm') || content.includes('customer') || content.includes('client')) {
    return 'CRM';
  }

  if (content.includes('sales') || content.includes('lead') || content.includes('prospect') || 
      content.includes('revenue') || content.includes('deal')) {
    return 'Sales';
  }

  if (content.includes('finance') || content.includes('budget') || content.includes('accounting') || 
      content.includes('invoice') || content.includes('financial')) {
    return 'Finance';
  }

  if (content.includes('business') || content.includes('strategy') || content.includes('entrepreneur')) {
    return 'Business';
  }

  // Marketing & Content
  if (content.includes('marketing') || content.includes('campaign') || content.includes('promotion')) {
    return 'Marketing';
  }

  if (content.includes('social media') || content.includes('facebook') || content.includes('twitter') || 
      content.includes('linkedin') || content.includes('instagram')) {
    return 'Social Media';
  }

  if (content.includes('advertising') || content.includes('ads') || content.includes('ppc') || 
      content.includes('adword')) {
    return 'Digital Advertising';
  }

  if (content.includes('brand') || content.includes('identity') || content.includes('logo') || 
      content.includes('visual')) {
    return 'Branding';
  }

  if (content.includes('pr ') || content.includes('public relations') || content.includes('media relations') || 
      content.includes('press')) {
    return 'Public Relations';
  }

  if (content.includes('community') || content.includes('forum') || content.includes('moderation')) {
    return 'Community Management';
  }

  // Content & Creative
  if (content.includes('content') || content.includes('blog') || content.includes('article') || 
      content.includes('writing') || content.includes('copywriting')) {
    return 'Content';
  }

  if (content.includes('creative') || content.includes('design') || content.includes('art') || 
      content.includes('brainstorm')) {
    return 'Creativity';
  }

  if (content.includes('curation') || content.includes('curator') || content.includes('collect')) {
    return 'Content Curation';
  }

  // Technical & Development
  if (content.includes('program') || content.includes('code') || content.includes('develop') || 
      content.includes('software') || content.includes('api')) {
    return 'Programming';
  }

  if (content.includes('product') || content.includes('development') || content.includes('feature') || 
      content.includes('roadmap')) {
    return 'Product Development';
  }

  if (content.includes('automation') || content.includes('automate') || content.includes('script')) {
    return 'Task Automation';
  }

  // Research & Analysis
  if (content.includes('research') || content.includes('academic') || content.includes('study') || 
      content.includes('analysis')) {
    return 'Research';
  }

  if (content.includes('analytics') || content.includes('data') || content.includes('metrics') || 
      content.includes('report')) {
    return 'Analytics';
  }

  if (content.includes('knowledge') || content.includes('wiki') || content.includes('documentation') || 
      content.includes('library')) {
    return 'Knowledge Management';
  }

  // Language & Translation
  if (content.includes('translat') || content.includes('language') || content.includes('localiz')) {
    return 'Translator';
  }

  // Learning & Personal Development
  if (content.includes('learn') || content.includes('education') || content.includes('training') || 
      content.includes('course') || content.includes('tutorial')) {
    return 'Learning and Development';
  }

  if (content.includes('coach') || content.includes('mentor') || content.includes('guidance') || 
      content.includes('advice')) {
    return 'Coaching';
  }

  if (content.includes('personal') || content.includes('habit') || content.includes('goal') || 
      content.includes('lifestyle')) {
    return 'Personal';
  }

  // Default category
  return 'General';
}

/**
 * Extract tags from agent data
 */
function extractTags(agentData) {
  const tags = [];
  const name = agentData.name.toLowerCase();
  const description = (agentData.data.description || '').toLowerCase();
  const content = `${name} ${description}`;

  // Core functionality tags
  if (content.includes('write') || content.includes('writing') || content.includes('author')) {
    tags.push('writing', 'content-creation');
  }
  if (content.includes('generate') || content.includes('creation') || content.includes('create')) {
    tags.push('generation', 'ai-powered');
  }
  if (content.includes('analyze') || content.includes('analysis') || content.includes('review')) {
    tags.push('analysis', 'insights');
  }
  if (content.includes('manage') || content.includes('management') || content.includes('organize')) {
    tags.push('management', 'organization');
  }
  if (content.includes('automate') || content.includes('automation') || content.includes('workflow')) {
    tags.push('automation', 'efficiency');
  }

  // Business tags
  if (content.includes('business') || content.includes('professional') || content.includes('corporate')) {
    tags.push('business', 'professional');
  }
  if (content.includes('startup') || content.includes('entrepreneur')) {
    tags.push('startup', 'entrepreneurship');
  }
  if (content.includes('team') || content.includes('collaboration') || content.includes('group')) {
    tags.push('teamwork', 'collaboration');
  }

  // Marketing & Sales tags
  if (content.includes('marketing') || content.includes('campaign') || content.includes('promotion')) {
    tags.push('marketing', 'digital-marketing');
  }
  if (content.includes('seo') || content.includes('search engine')) {
    tags.push('seo', 'search-optimization');
  }
  if (content.includes('social') || content.includes('facebook') || content.includes('twitter')) {
    tags.push('social-media', 'social-marketing');
  }
  if (content.includes('email') || content.includes('newsletter') || content.includes('outreach')) {
    tags.push('email-marketing', 'outreach');
  }
  if (content.includes('sales') || content.includes('lead') || content.includes('prospect')) {
    tags.push('sales', 'lead-generation');
  }

  // Content & Creative tags
  if (content.includes('blog') || content.includes('article') || content.includes('post')) {
    tags.push('blogging', 'articles');
  }
  if (content.includes('creative') || content.includes('design') || content.includes('art')) {
    tags.push('creative', 'design');
  }
  if (content.includes('story') || content.includes('narrative') || content.includes('storytelling')) {
    tags.push('storytelling', 'narrative');
  }
  if (content.includes('video') || content.includes('podcast') || content.includes('multimedia')) {
    tags.push('multimedia', 'video-content');
  }

  // Technical tags
  if (content.includes('code') || content.includes('programming') || content.includes('development')) {
    tags.push('programming', 'development');
  }
  if (content.includes('api') || content.includes('integration') || content.includes('webhook')) {
    tags.push('api', 'integration');
  }
  if (content.includes('data') || content.includes('database') || content.includes('analytics')) {
    tags.push('data', 'analytics');
  }

  // Language & Communication tags
  if (content.includes('translat') || content.includes('language') || content.includes('multilingual')) {
    tags.push('translation', 'multilingual');
  }
  if (content.includes('communication') || content.includes('messaging') || content.includes('chat')) {
    tags.push('communication', 'messaging');
  }

  // Industry-specific tags
  if (content.includes('healthcare') || content.includes('medical') || content.includes('health')) {
    tags.push('healthcare', 'medical');
  }
  if (content.includes('education') || content.includes('learning') || content.includes('training')) {
    tags.push('education', 'e-learning');
  }
  if (content.includes('finance') || content.includes('financial') || content.includes('accounting')) {
    tags.push('finance', 'fintech');
  }
  if (content.includes('legal') || content.includes('law') || content.includes('compliance')) {
    tags.push('legal', 'compliance');
  }
  if (content.includes('retail') || content.includes('ecommerce') || content.includes('shopping')) {
    tags.push('retail', 'ecommerce');
  }

  // Productivity & Organization tags
  if (content.includes('todo') || content.includes('task') || content.includes('checklist')) {
    tags.push('todo', 'task-management');
  }
  if (content.includes('calendar') || content.includes('schedule') || content.includes('appointment')) {
    tags.push('scheduling', 'calendar');
  }
  if (content.includes('note') || content.includes('documentation') || content.includes('wiki')) {
    tags.push('documentation', 'notes');
  }

  // User experience tags
  if (content.includes('beginner') || content.includes('simple') || content.includes('easy')) {
    tags.push('beginner-friendly', 'easy-to-use');
  }
  if (content.includes('advanced') || content.includes('expert') || content.includes('professional')) {
    tags.push('advanced', 'expert-level');
  }
  if (content.includes('quick') || content.includes('fast') || content.includes('instant')) {
    tags.push('quick-results', 'fast');
  }
  
  // Legacy data tags
  if (agentData.data.language) tags.push(`language-${agentData.data.language.toLowerCase()}`);
  if (agentData.data.tone) tags.push(`tone-${agentData.data.tone.toLowerCase()}`);

  // Platform tags
  tags.push('ai-assistant', 'arkan-platform');

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
        INSERT INTO agents (id, name, description, icon, category, version, author, tags, prompt, guidelines)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let processedCount = 0;
      let errorCount = 0;

      agentsData.forEach((agentData) => {
        try {
          const { agent } = transformAgentData(agentData);

          // Insert agent
          insertAgent.run(
            agent.id,
            agent.name,
            agent.description,
            agent.icon,
            agent.category,
            agent.version,
            agent.author,
            agent.tags,
            agent.prompt,
            agent.guidelines
          );

          processedCount++;
          console.log(`   ✅ Processed: ${agent.name}`);

        } catch (error) {
          errorCount++;
          console.error(`   ❌ Error processing agent ${agentData.name}:`, error.message);
        }
      });

      insertAgent.finalize();

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
      resolve();
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
