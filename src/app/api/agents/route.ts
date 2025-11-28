import { NextResponse } from 'next/server';
import { agentDb } from '@/lib/db/agent-db-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let agents;

    // Use the agentDb service to fetch data from the SQLite database.
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
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Ensure fresh data on every request
      },
    });
  } catch (error) {
    console.error('Error in agents API:', error);
    
    return NextResponse.json(
      { 
        message: 'Failed to load agents from database', 
        error: error instanceof Error ? error.message : 'Unknown error',
        agents: [] 
      },
      { 
        status: 500 
      }
    );
  }
}
