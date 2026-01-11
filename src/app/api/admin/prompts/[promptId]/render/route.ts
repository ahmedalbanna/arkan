/**
 * Prompt Rendering API
 * 
 * POST /api/admin/prompts/[promptId]/render - Render prompt with variables
 */

import { NextRequest, NextResponse } from 'next/server';
import { promptManagementService } from '@/services/prompt-management-service';

/**
 * POST /api/admin/prompts/[promptId]/render
 * Render prompt template with provided variables
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const body = await request.json();
    const { variables } = body;

    if (!variables || typeof variables !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Variables object is required',
        },
        { status: 400 }
      );
    }

    const result = await promptManagementService.renderPrompt(
      params.promptId,
      variables
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error rendering prompt:', error);
    
    const statusCode = error instanceof Error && error.name === 'PromptNotFoundError'
      ? 404
      : error instanceof Error && error.name === 'ValidationError'
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to render prompt',
      },
      { status: statusCode }
    );
  }
}
