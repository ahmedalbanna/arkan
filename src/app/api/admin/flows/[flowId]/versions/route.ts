/**
 * Flow Version Management API
 * Week 3 - Day 1-2: Flow Management API
 * 
 * Endpoints:
 * - GET  /api/admin/flows/[flowId]/versions - List versions
 * - POST /api/admin/flows/[flowId]/versions - Rollback to version
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  listFlowVersions, 
  rollbackToVersion 
} from '@/services/flow-config-service';

// ============================================================================
// GET /api/admin/flows/[flowId]/versions - List versions
// ============================================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ flowId: string }> }
) {
  try {
    const params = await context.params;
    const versions = await listFlowVersions(params.flowId);

    return NextResponse.json({
      success: true,
      data: versions,
      count: versions.length,
    });

  } catch (error) {
    console.error('Error listing flow versions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list versions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/flows/[flowId]/versions - Rollback to version
// ============================================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ flowId: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    if (!body.version) {
      return NextResponse.json(
        {
          success: false,
          error: 'Version is required',
        },
        { status: 400 }
      );
    }

    const flow = await rollbackToVersion(params.flowId, body.version);

    return NextResponse.json({
      success: true,
      data: flow,
      message: `Rolled back to version ${body.version}`,
    });

  } catch (error) {
    console.error('Error rolling back version:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to rollback version',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
