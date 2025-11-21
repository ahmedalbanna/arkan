import { NextResponse } from 'next/server';
import { agentDb } from '@/lib/db/agent-db-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = agentDb.getAgentById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { message: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(agent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error getting agent by ID:', error);
    
    return NextResponse.json(
      { 
        message: 'Failed to get agent',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500 
      }
    );
  }
}