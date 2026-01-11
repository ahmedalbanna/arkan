/**
 * Individual Flow Management API
 * 
 * GET /api/admin/flows/[flowId] - Get flow by ID
 * PUT /api/admin/flows/[flowId] - Update flow
 * DELETE /api/admin/flows/[flowId] - Delete flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { flowConfigService } from '@/services/flow-config-service';

/**
 * GET /api/admin/flows/[flowId]
 * Get flow by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const flow = await flowConfigService.getFlowById(params.flowId);

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
      flow,
    });
  } catch (error) {
    console.error('Error getting flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get flow',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/flows/[flowId]
 * Update flow
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    const versionMessage = body.versionMessage;
    delete body.versionMessage;

    // Update flow
    const flow = await flowConfigService.updateFlow(
      params.flowId,
      body,
      userId,
      versionMessage
    );

    return NextResponse.json({
      success: true,
      flow,
      message: 'Flow updated successfully',
    });
  } catch (error) {
    console.error('Error updating flow:', error);
    
    const statusCode = error instanceof Error && error.name === 'FlowNotFoundError'
      ? 404
      : error instanceof Error && error.name === 'ValidationError'
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update flow',
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/admin/flows/[flowId]
 * Delete flow (soft delete - archives it)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    await flowConfigService.deleteFlow(params.flowId);

    return NextResponse.json({
      success: true,
      message: 'Flow deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting flow:', error);
    
    const statusCode = error instanceof Error && error.name === 'FlowNotFoundError'
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete flow',
      },
      { status: statusCode }
    );
  }
}
