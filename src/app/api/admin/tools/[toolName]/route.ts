/**
 * Individual Tool API
 * 
 * GET /api/admin/tools/[toolName] - Get tool details and schema
 * PUT /api/admin/tools/[toolName] - Update tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolRegistryService } from '@/services/tool-registry-service';

/**
 * GET /api/admin/tools/[toolName]
 * Get tool details including schema and documentation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    const tool = await toolRegistryService.getToolByName(params.toolName);

    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found',
        },
        { status: 404 }
      );
    }

    // Get documentation
    const documentation = await toolRegistryService.getToolDocumentation(params.toolName);

    return NextResponse.json({
      success: true,
      tool,
      documentation,
    });
  } catch (error) {
    console.error('Error getting tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tool',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tools/[toolName]
 * Update tool configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    const tool = await toolRegistryService.updateTool(
      params.toolName,
      body,
      userId
    );

    return NextResponse.json({
      success: true,
      tool,
      message: 'Tool updated successfully',
    });
  } catch (error) {
    console.error('Error updating tool:', error);
    
    const statusCode = error instanceof Error && error.name === 'ToolNotFoundError'
      ? 404
      : error instanceof Error && error.name === 'ValidationError'
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tool',
      },
      { status: statusCode }
    );
  }
}
