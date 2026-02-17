import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getUserProfile } from '@/services/userService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
    }

    // Fetch generation logs for this user
    const generationLogs = await prisma.generationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalGenerations = generationLogs.length;

    // Calculate agent usage
    const agentUsage: Record<string, number> = {};
    let creditsUsed = 0;

    generationLogs.forEach((log) => {
      const agentId = log.agentId || 'unknown';
      agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
      creditsUsed += log.creditsUsed || 0;
    });

    // Get agent details for chart data
    const agentUsageChartData = await Promise.all(
      Object.entries(agentUsage)
        .map(async ([agentId, count]) => {
          const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            select: { name: true },
          });
          return {
            name: agent?.name || 'Unknown',
            agentId,
            count,
          };
        })
    );

    // Sort by count and get top 10
    const topAgents = agentUsageChartData
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get recent activity (last 5 generations)
    const recentActivity = generationLogs.slice(0, 5).map((log) => ({
      id: log.id,
      agentId: log.agentId,
      createdAt: log.createdAt,
      creditsUsed: log.creditsUsed,
      status: log.status,
    }));

    return NextResponse.json(
      {
        totalGenerations,
        creditsUsed,
        agentUsageChartData: topAgents,
        recentActivity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
