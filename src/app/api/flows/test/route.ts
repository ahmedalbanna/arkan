/**
 * Flow Testing API
 * Week 3 - Day 4: Testing API
 * 
 * Endpoints:
 * - POST /api/flows/test - Test a flow configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { DynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';
import type { FlowConfiguration } from '@/lib/models/flow-config';

// ============================================================================
// POST /api/flows/test - Test flow
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.flow) {
      return NextResponse.json(
        {
          success: false,
          error: 'flow configuration is required',
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

    // Use provided flow configuration
    const flow: FlowConfiguration = body.flow;

    // Set status to active for testing
    flow.status = 'active';

    // Create executor
    const executor = new DynamicFlowExecutor(flow);

    // Execute flow
    const result = await executor.execute(body.input);

    // Return detailed result for testing
    return NextResponse.json({
      success: result.success,
      data: {
        output: result.output,
        trace: result.trace,
        context: result.context,
        executionTime: result.trace.duration,
        stepsExecuted: result.trace.steps.length,
        errors: result.trace.errors,
      },
      error: result.error ? {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
      } : undefined,
    });

  } catch (error) {
    console.error('Error testing flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test flow',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
