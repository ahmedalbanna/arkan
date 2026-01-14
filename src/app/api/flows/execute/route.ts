/**
 * Flow Execution API
 * Week 3 - Day 4: Execution API
 * 
 * Endpoints:
 * - POST /api/flows/execute - Execute a flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFlow } from '@/services/flow-config-service';
import { DynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

// ============================================================================
// POST /api/flows/execute - Execute flow
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.flowId) {
      return NextResponse.json(
        {
          success: false,
          error: 'flowId is required',
        },
        { status: 400 }
      );
    }

    if (!body.input) {
      return NextResponse.json(
        {
          success: false,
          error: 'input is required',
        },
        { status: 400 }
      );
    }

    // Get flow configuration
    const flow = await getFlow(body.flowId, body.version);

    if (!flow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Flow not found',
        },
        { status: 404 }
      );
    }

    // Check if flow is active
    if (flow.status !== 'active' && !body.ignoreStatus) {
      return NextResponse.json(
        {
          success: false,
          error: `Flow is not active (status: ${flow.status})`,
        },
        { status: 400 }
      );
    }

    // Create executor
    const executor = new DynamicFlowExecutor(flow);

    // Execute flow
    const result = await executor.execute(body.input);

    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          output: result.output,
          trace: body.includeTrace ? result.trace : undefined,
          executionTime: result.trace.duration,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Flow execution failed',
          message: result.error?.message,
          trace: body.includeTrace ? result.trace : undefined,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error executing flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute flow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/flows/execute - Not allowed
// ============================================================================

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'Use POST to execute flows',
    },
    { status: 405 }
  );
}
