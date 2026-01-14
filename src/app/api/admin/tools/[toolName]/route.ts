/**
 * Single Tool API
 * Week 3 - Day 4: Tools API
 * 
 * Endpoints:
 * - GET    /api/admin/tools/[toolName] - Get tool details
 * - PUT    /api/admin/tools/[toolName] - Update tool
 * - DELETE /api/admin/tools/[toolName] - Delete tool
 * - PATCH  /api/admin/tools/[toolName] - Enable/disable tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getTool, 
  updateTool, 
  deleteTool,
  setToolEnabled,
  getToolStats 
} from '@/services/tool-registry-service';

// ============================================================================
// GET /api/admin/tools/[toolName] - Get tool
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    const tool = await getTool(params.toolName);

    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found',
        },
        { status: 404 }
      );
    }

    // Include stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getToolStats(params.toolName);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tool,
        stats,
      },
    });

  } catch (error) {
    console.error('Error getting tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get tool',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/admin/tools/[toolName] - Update tool
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'system';

    // Prepare updates
    const updates = {
      ...body,
      metadata: {
        ...body.metadata,
        updatedBy: userId,
      },
    };

    // Update tool
    const tool = await updateTool(params.toolName, updates);

    return NextResponse.json({
      success: true,
      data: tool,
      message: 'Tool updated successfully',
    });

  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tool',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/admin/tools/[toolName] - Delete tool
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    await deleteTool(params.toolName);

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete tool',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/admin/tools/[toolName] - Enable/disable tool
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    const body = await request.json();

    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'enabled field is required and must be boolean',
        },
        { status: 400 }
      );
    }

    await setToolEnabled(params.toolName, body.enabled);

    return NextResponse.json({
      success: true,
      message: `Tool ${body.enabled ? 'enabled' : 'disabled'} successfully`,
    });

  } catch (error) {
    console.error('Error updating tool status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tool status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
