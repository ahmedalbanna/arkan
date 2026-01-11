/**
 * Prompt Management API
 * 
 * GET /api/admin/prompts - List all prompts
 * POST /api/admin/prompts - Create new prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { promptManagementService } from '@/services/prompt-management-service';
import { PromptStatus } from '@/lib/models/prompt-config';

/**
 * GET /api/admin/prompts
 * List all prompts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as PromptStatus | null;
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const filters: any = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (tags) filters.tags = tags;
    if (limit) filters.limit = limit;

    const prompts = await promptManagementService.listPrompts(filters);

    return NextResponse.json({
      success: true,
      prompts,
      total: prompts.length,
    });
  } catch (error) {
    console.error('Error listing prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list prompts',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/prompts
 * Create a new prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    const prompt = await promptManagementService.createPrompt(body, userId);

    return NextResponse.json({
      success: true,
      prompt,
      message: 'Prompt created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    
    const statusCode = error instanceof Error && error.name === 'ValidationError' 
      ? 400 
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create prompt',
      },
      { status: statusCode }
    );
  }
}
