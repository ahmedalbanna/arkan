/**
 * Flow Versions API
 * 
 * GET /api/admin/flows/[flowId]/versions - Get flow version history
 * POST /api/admin/flows/[flowId]/versions/restore - Restore to specific version
 */

import { NextRequest, NextResponse } from 'next/server';
import { flowConfigService } from '@/services/flow-config-service';

/**
 * GET /api/admin/flows/[flowId]/versions
 * Get flow version history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    const versions = await flowConfigService.getFlowVersions(params.flowId, limit);

    return NextResponse.json({
      success: true,
      versions,
      total: versions.length,
    });
  } catch (error) {
    console.error('Error getting flow versions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get flow versions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/flows/[flowId]/versions/restore
 * Restore flow to specific version
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        {
          success: false,
          error: 'Version number is required',
        },
        { status: 400 }
      );
    }

    // TODO: Get authenticated user ID
    const userId = 'system'; // Replace with actual user ID from auth

    const flow = await flowConfigService.restoreFlowVersion(
      params.flowId,
      version,
      userId
    );

    return NextResponse.json({
      success: true,
      flow,
      message: `Flow restored to version ${version}`,
    });
  } catch (error) {
    console.error('Error restoring flow version:', error);
    
    const statusCode = error instanceof Error && error.name === 'FlowVersionNotFoundError'
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore flow version',
      },
      { status: statusCode }
    );
  }
}
