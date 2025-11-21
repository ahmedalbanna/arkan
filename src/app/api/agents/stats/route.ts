import { NextResponse } from 'next/server';
import { agentDb } from '@/lib/db/agent-db-service';

export async function GET() {
  try {
    const stats = agentDb.getStats();
    
    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
      },
    });
  } catch (error) {
    console.error('Error getting agent stats:', error);
    
    return NextResponse.json(
      { 
        message: 'Failed to get agent statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500 
      }
    );
  }
}