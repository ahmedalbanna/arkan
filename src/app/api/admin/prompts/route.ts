/**
 * Prompt Management API - List and Create Prompts
 * Week 3 - Day 3: Prompt Management API
 * 
 * Endpoints:
 * - GET  /api/admin/prompts - List all prompts
 * - POST /api/admin/prompts - Create new prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  listPrompts, 
  createPrompt, 
  searchPrompts 
} from '@/services/prompt-management-service';
import type { PromptConfiguration, PromptStatus } from '@/lib/models/prompt-config';

// ============================================================================
// GET /api/admin/prompts - List prompts
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status') as PromptStatus | null;
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Search or list prompts
    let prompts: PromptConfiguration[];
    
    if (search) {
      prompts = await searchPrompts(search, limit);
    } else {
      prompts = await listPrompts({
        status: status || undefined,
        category: category || undefined,
        language: language || undefined,
        tags: tags || undefined,
        limit,
      });
    }

    return NextResponse.json({
      success: true,
      data: prompts,
      count: prompts.length,
    });

  } catch (error) {
    console.error('Error listing prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/prompts - Create prompt
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id || !body.name || !body.template || !body.version) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'name', 'template', 'version'],
        },
        { status: 400 }
      );
    }

    // Get user from auth
    const userId = request.headers.get('x-user-id') || 'system';

    // Prepare prompt data
    const promptData: Omit<PromptConfiguration, 'metadata'> = {
      id: body.id,
      name: body.name,
      description: body.description || '',
      version: body.version,
      tags: body.tags || [],
      status: body.status || 'draft',
      template: body.template,
      variables: body.variables || [],
      inputSchema: body.inputSchema,
      outputFormat: body.outputFormat || { type: 'text' },
      modelConfig: body.modelConfig,
      examples: body.examples || [],
      metadata: {
        createdBy: userId,
        updatedBy: userId,
      } as any,
    };

    // Create prompt
    const prompt = await createPrompt(promptData);

    return NextResponse.json(
      {
        success: true,
        data: prompt,
        message: 'Prompt created successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
