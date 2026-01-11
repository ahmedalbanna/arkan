/**
 * Flow Testing API
 * 
 * POST /api/flows/test - Test a flow configuration without saving
 */

import { NextRequest, NextResponse } from 'next/server';
import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

/**
 * POST /api/flows/test
 * Test a flow configuration with sample input
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowConfig, payload } = body;

    if (!flowConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'Flow configuration is required',
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

    // Execute flow with temporary configuration
    // Create a temporary flow name for testing
    const tempFlowName = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Import flow config service to create temporary flow
    const { flowConfigService } = await import('@/services/flow-config-service');
    
    try {
      // Create temporary flow (will be used for testing only)
      const tempFlow = await flowConfigService.createFlow(
        {
          ...flowConfig,
          name: tempFlowName,
          status: 'draft' as const,
        },
        'test-user'
      );

      // Execute the test flow
      const result = await dynamicFlowExecutor({
        flowName: tempFlowName,
        payload,
        userId: 'test-user',
        requestId: `test_${Date.now()}`,
        enableTracing: true,
      });

      // Clean up temporary flow
      await flowConfigService.deleteFlow(tempFlow.id);

      return NextResponse.json({
        success: true,
        result,
        message: 'Flow test completed successfully',
      });
    } catch (testError) {
      // Try to clean up if flow was created
      try {
        const flows = await flowConfigService.listFlows({ name: tempFlowName });
        if (flows.length > 0) {
          await flowConfigService.deleteFlow(flows[0].id);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup test flow:', cleanupError);
      }

      throw testError;
    }
  } catch (error) {
    console.error('Error testing flow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test flow',
      },
      { status: 500 }
    );
  }
}
