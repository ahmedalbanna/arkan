/**
 * Flow Execution API
 * 
 * POST /api/flows/execute - Execute a dynamic flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

/**
 * POST /api/flows/execute
 * Execute a flow with provided input
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowName, payload, userId, enableTracing } = body;

    if (!flowName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Flow name is required',
        },
        { status: 400 }
      );
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload object is required',
        },
        { status: 400 }
      );
    }

    // TODO: Get authenticated user ID from session
    const authenticatedUserId = userId || 'anonymous';

    // Execute flow
    const result = await dynamicFlowExecutor({
      flowName,
      payload,
      userId: authenticatedUserId,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      enableTracing: enableTracing ?? true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute flow',
      },
      { status: 500 }
    );
  }
}
