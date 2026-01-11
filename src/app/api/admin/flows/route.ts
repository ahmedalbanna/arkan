/**
 * Flow Management API
 * 
 * GET /api/admin/flows - List all flows
 * POST /api/admin/flows - Create new flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { flowConfigService } from '@/services/flow-config-service';
import { FlowStatus } from '@/lib/models/flow-config';

/**
 * GET /api/admin/flows
 * List all flows with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as FlowStatus | null;
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (tags) filters.tags = tags;
    if (limit) filters.limit = limit;

    // Get flows
    const flows = await flowConfigService.listFlows(filters);

    return NextResponse.json({
      success: true,
      flows,
      total: flows.length,
    });
  } catch (error) {
    console.error('Error listing flows:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list flows',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/flows
 * Create a new flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    // Create flow
    const flow = await flowConfigService.createFlow(body, userId);

    return NextResponse.json({
      success: true,
      flow,
      message: 'Flow created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating flow:', error);
    
    const statusCode = error instanceof Error && error.name === 'ValidationError' 
      ? 400 
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create flow',
      },
      { status: statusCode }
    );
  }
}
