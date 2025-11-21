import { NextResponse } from 'next/server';
import { agentDb } from '@/lib/db/agent-db-service';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let agents;

    // Try to get agents from SQLite database first
    try {
      if (search) {
        agents = agentDb.searchAgents(search);
      } else if (category) {
        agents = agentDb.getAgentsByCategory(category);
      } else {
        agents = agentDb.getAllAgents();
      }

      return NextResponse.json(agents, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });
    } catch (dbError) {
      console.warn('Database not available, falling back to JSON file:', dbError);
      
      // Fallback to reading from AllAgents.json
      const filePath = join(process.cwd(), 'src', 'lib', 'AllAgents.json');
      const fileContents = readFileSync(filePath, 'utf8');
      const agentsData = JSON.parse(fileContents);
      
      // Transform JSON data to match expected Agent interface
      const transformedAgents = agentsData.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.data.description || '',
        icon: agent.data.avatar?.data?.value || '🤖',
        category: extractCategory(agent.name),
        version: '1.0.0',
        author: 'System',
        tags: extractTags(agent),
        commands: (agent.data.commands || []).map((cmd: any) => ({
          id: cmd.id,
          name: cmd.name,
          description: cmd.prompt?.substring(0, 200) + '...' || '',
          prompt: cmd.prompt || '',
          example: cmd.example || '',
          temperature: 0.7,
          max_tokens: 1000
        }))
      }));

      return NextResponse.json(transformedAgents, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
  } catch (error) {
    console.error('Error in agents API:', error);
    
    return NextResponse.json(
      { 
        message: 'Failed to load agents', 
        error: error instanceof Error ? error.message : 'Unknown error',
        agents: [] 
      },
      { 
        status: 500 
      }
    );
  }
}

// Helper functions for JSON fallback
function extractCategory(name: string): string {
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

function extractTags(agentData: any): string[] {
  const tags = [];
  
  if (agentData.name.includes('Academic')) tags.push('academic');
  if (agentData.name.includes('Blog')) tags.push('blogging');
  if (agentData.name.includes('User Stories')) tags.push('agile');
  if (agentData.data.language) tags.push(agentData.data.language);
  if (agentData.data.tone) tags.push(agentData.data.tone);
  
  return [...new Set(tags)];
}