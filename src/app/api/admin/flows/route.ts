/**
 * Flow Management API - List and Create Flows
 * Week 3 - Day 1-2: Flow Management API
 * 
 * Endpoints:
 * - GET  /api/admin/flows - List all flows
 * - POST /api/admin/flows - Create new flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  listFlows, 
  createFlow, 
  searchFlows 
} from '@/services/flow-config-service';
import type { FlowConfiguration, FlowStatus } from '@/lib/models/flow-config';

// ============================================================================
// GET /api/admin/flows - List flows
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status') as FlowStatus | null;
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Search or list flows
    let flows: FlowConfiguration[];
    
    if (search) {
      flows = await searchFlows(search, limit);
    } else {
      flows = await listFlows({
        status: status || undefined,
        category: category || undefined,
        tags: tags || undefined,
        limit,
      });
    }

    return NextResponse.json({
      success: true,
      data: flows,
      count: flows.length,
    });

  } catch (error) {
    console.error('Error listing flows:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list flows',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/flows - Create flow
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id || !body.name || !body.version) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'name', 'version'],
        },
        { status: 400 }
      );
    }

    // Get user from auth (simplified - you'll need to implement proper auth)
    const userId = request.headers.get('x-user-id') || 'system';

    // Prepare flow data
    const flowData: Omit<FlowConfiguration, 'metadata'> = {
      id: body.id,
      name: body.name,
      description: body.description || '',
      version: body.version,
      tags: body.tags || [],
      status: body.status || 'draft',
      inputSchema: body.inputSchema,
      outputSchema: body.outputSchema,
      steps: body.steps || [],
      config: body.config || {},
      metadata: {
        createdBy: userId,
        updatedBy: userId,
      } as any,
    };

    // Create flow
    const flow = await createFlow(flowData);

    return NextResponse.json(
      {
        success: true,
        data: flow,
        message: 'Flow created successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create flow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
