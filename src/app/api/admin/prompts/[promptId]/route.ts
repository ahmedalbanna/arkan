/**
 * Individual Prompt Management API
 * 
 * GET /api/admin/prompts/[promptId] - Get prompt by ID
 * PUT /api/admin/prompts/[promptId] - Update prompt
 * DELETE /api/admin/prompts/[promptId] - Delete prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { promptManagementService } from '@/services/prompt-management-service';

/**
 * GET /api/admin/prompts/[promptId]
 * Get prompt by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const prompt = await promptManagementService.getPromptById(params.promptId);

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
      prompt,
    });
  } catch (error) {
    console.error('Error getting prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get prompt',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/prompts/[promptId]
 * Update prompt
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    const versionMessage = body.versionMessage;
    delete body.versionMessage;

    const prompt = await promptManagementService.updatePrompt(
      params.promptId,
      body,
      userId,
      versionMessage
    );

    return NextResponse.json({
      success: true,
      prompt,
      message: 'Prompt updated successfully',
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    
    const statusCode = error instanceof Error && error.name === 'PromptNotFoundError'
      ? 404
      : error instanceof Error && error.name === 'ValidationError'
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prompt',
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/admin/prompts/[promptId]
 * Delete prompt (soft delete - archives it)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    await promptManagementService.deletePrompt(params.promptId);

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    
    const statusCode = error instanceof Error && error.name === 'PromptNotFoundError'
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete prompt',
      },
      { status: statusCode }
    );
  }
}
