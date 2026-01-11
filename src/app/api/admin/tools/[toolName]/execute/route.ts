/**
 * Tool Execution API
 * 
 * POST /api/admin/tools/[toolName]/execute - Execute tool with parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolRegistryService } from '@/services/tool-registry-service';

/**
 * POST /api/admin/tools/[toolName]/execute
 * Execute tool with provided parameters
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    const body = await request.json();
    const { parameters, timeout } = body;

    if (!parameters || typeof parameters !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameters object is required',
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await toolRegistryService.executeTool(
      params.toolName,
      parameters,
      timeout
    );
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      result,
      duration,
    });
  } catch (error) {
    console.error('Error executing tool:', error);
    
    const statusCode = error instanceof Error && error.name === 'ToolNotFoundError'
      ? 404
      : error instanceof Error && error.name === 'ToolTimeoutError'
      ? 408
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute tool',
      },
      { status: statusCode }
    );
  }
}
