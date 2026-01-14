/**
 * Tools API
 * Week 3 - Day 4: Tools API
 * 
 * Endpoints:
 * - GET  /api/admin/tools - List all tools
 * - POST /api/admin/tools - Register new tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  listTools, 
  registerTool,
  searchTools 
} from '@/services/tool-registry-service';
import type { ToolConfiguration, ToolCategory } from '@/lib/models/tool-config';

// ============================================================================
// GET /api/admin/tools - List tools
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category') as ToolCategory | null;
    const enabled = searchParams.get('enabled');
    const isBuiltIn = searchParams.get('isBuiltIn');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Search or list tools
    let tools: ToolConfiguration[];
    
    if (search) {
      tools = await searchTools(search, limit);
    } else {
      tools = await listTools({
        category: category || undefined,
        enabled: enabled !== null ? enabled === 'true' : undefined,
        isBuiltIn: isBuiltIn !== null ? isBuiltIn === 'true' : undefined,
        tags: tags || undefined,
        limit,
      });
    }

    return NextResponse.json({
      success: true,
      data: tools,
      count: tools.length,
    });

  } catch (error) {
    console.error('Error listing tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list tools',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/tools - Register tool
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.displayName || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['name', 'displayName', 'category'],
        },
        { status: 400 }
      );
    }

    // Get user from auth
    const userId = request.headers.get('x-user-id') || 'system';

    // Prepare tool data
    const toolData: Omit<ToolConfiguration, 'metadata'> = {
      name: body.name,
      displayName: body.displayName,
      description: body.description || '',
      category: body.category,
      inputSchema: body.inputSchema,
      outputSchema: body.outputSchema,
      enabled: body.enabled !== false,
      isBuiltIn: false, // Custom tools are never built-in
      implementation: body.implementation,
      metadata: {
        createdBy: userId,
        updatedBy: userId,
        version: body.version || '1.0.0',
        tags: body.tags || [],
      } as any,
    };

    // Register tool
    const tool = await registerTool(toolData);

    return NextResponse.json(
      {
        success: true,
        data: tool,
        message: 'Tool registered successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error registering tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register tool',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
