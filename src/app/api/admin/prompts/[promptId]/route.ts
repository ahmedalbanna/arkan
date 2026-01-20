/**
 * Prompt Management API - Single Prompt Operations
 * Week 3 - Day 3: Prompt Management API
 * 
 * Endpoints:
 * - GET    /api/admin/prompts/[promptId] - Get prompt by ID
 * - PUT    /api/admin/prompts/[promptId] - Update prompt
 * - DELETE /api/admin/prompts/[promptId] - Delete prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getPromptById, 
  updatePrompt, 
  deletePrompt 
} from '@/services/prompt-management-service';
import type { PromptConfiguration } from '@/lib/models/prompt-config';

// ============================================================================
// GET /api/admin/prompts/[promptId] - Get prompt
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
    const { promptId } = await params;
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');

    const prompt = await getPromptById(promptId, version || undefined);

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prompt,
    });

  } catch (error) {
    console.error('Error getting prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/admin/prompts/[promptId] - Update prompt
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
    const { promptId } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'system';

    // Prepare updates
    const updates: Partial<PromptConfiguration> = {
      ...body,
      metadata: {
        ...body.metadata,
        updatedBy: userId,
      },
    };

    // Get change description
    const { searchParams } = new URL(request.url);
    const changeDescription = searchParams.get('changeDescription') || body.changeDescription;

    // Update prompt
    const prompt = await updatePrompt(
      promptId,
      updates,
      changeDescription || undefined
    );

    return NextResponse.json({
      success: true,
      data: prompt,
      message: 'Prompt updated successfully',
    });

  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/admin/prompts/[promptId] - Delete prompt
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
    const { promptId } = await params;
    await deletePrompt(promptId);

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
