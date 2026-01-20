/**
 * Flow Management API - Single Flow Operations
 * Week 3 - Day 1-2: Flow Management API
 * 
 * Endpoints:
 * - GET    /api/admin/flows/[flowId] - Get flow by ID
 * - PUT    /api/admin/flows/[flowId] - Update flow
 * - DELETE /api/admin/flows/[flowId] - Delete flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getFlow, 
  updateFlow, 
  deleteFlow 
} from '@/services/flow-config-service';
import type { FlowConfiguration } from '@/lib/models/flow-config';

// ============================================================================
// GET /api/admin/flows/[flowId] - Get flow
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await params;
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');

    const flow = await getFlow(flowId, version || undefined);

    if (!flow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Flow not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: flow,
    });

  } catch (error) {
    console.error('Error getting flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get flow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/admin/flows/[flowId] - Update flow
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'system';

    // Prepare updates
    const updates: Partial<FlowConfiguration> = {
      ...body,
      metadata: {
        ...body.metadata,
        updatedBy: userId,
      },
    };

    // Get change description from query or body
    const { searchParams } = new URL(request.url);
    const changeDescription = searchParams.get('changeDescription') || body.changeDescription;

    // Update flow
    const flow = await updateFlow(
      flowId,
      updates,
      changeDescription || undefined
    );

    return NextResponse.json({
      success: true,
      data: flow,
      message: 'Flow updated successfully',
    });

  } catch (error) {
    console.error('Error updating flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update flow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/admin/flows/[flowId] - Delete flow
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await params;
    await deleteFlow(flowId);

    return NextResponse.json({
      success: true,
      message: 'Flow deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete flow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
