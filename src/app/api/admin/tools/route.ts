/**
 * Tool Registry API
 * 
 * GET /api/admin/tools - List all available tools
 * POST /api/admin/tools - Register new tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolRegistryService } from '@/services/tool-registry-service';
import { ToolType, ToolStatus } from '@/lib/models/tool-config';

/**
 * GET /api/admin/tools
 * List all available tools with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as ToolType | null;
    const category = searchParams.get('category');
    const status = searchParams.get('status') as ToolStatus | null;
    const tags = searchParams.get('tags')?.split(',');

    const filters: any = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (tags) filters.tags = tags;

    const tools = await toolRegistryService.listTools(filters);

    return NextResponse.json({
      success: true,
      tools,
      total: tools.length,
    });
  } catch (error) {
    console.error('Error listing tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list tools',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tools
 * Register a new tool
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    const tool = await toolRegistryService.registerTool(body, userId);

    return NextResponse.json({
      success: true,
      tool,
      message: 'Tool registered successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering tool:', error);
    
    const statusCode = error instanceof Error && error.name === 'ValidationError' 
      ? 400 
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register tool',
      },
      { status: statusCode }
    );
  }
}
