import { NextRequest, NextResponse } from 'next/server';
import { googleSearchTool } from '@/ai/tools/google-search';
import type { GoogleSearchToolInput } from '@/ai/tools/schemas';

export async function POST(request: NextRequest) {
  try {
    const body: GoogleSearchToolInput = await request.json();

    // Validate input
    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Perform the search
    const results = await googleSearchTool(body);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Google search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
