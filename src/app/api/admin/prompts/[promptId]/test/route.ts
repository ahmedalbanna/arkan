/**
 * Prompt Testing API
 * 
 * POST /api/admin/prompts/[promptId]/test - Test prompt with test cases
 */

import { NextRequest, NextResponse } from 'next/server';
import { promptManagementService } from '@/services/prompt-management-service';

/**
 * POST /api/admin/prompts/[promptId]/test
 * Test prompt with configured test cases
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const results = await promptManagementService.testPrompt(params.promptId);

    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error testing prompt:', error);
    
    const statusCode = error instanceof Error && error.name === 'PromptNotFoundError'
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test prompt',
      },
      { status: statusCode }
    );
  }
}
