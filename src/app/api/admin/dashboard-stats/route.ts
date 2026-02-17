// src/app/api/admin/dashboard-stats/route.ts

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { prisma } from '@/lib/db/prisma';
import { getUserProfile } from '@/services/userService';

async function getSummaryCounts() {
  const [usersCount, generationsCount, pendingTransactionsCount] = await Promise.all([
    prisma.user.count(),
    prisma.generationLog.count(),
    prisma.transaction.count({
      where: { status: 'PENDING' },
    }),
  ]);

  return {
    totalUsers: usersCount,
    totalGenerations: generationsCount,
    pendingPayments: pendingTransactionsCount,
  };
}

async function getAgentUsage() {
  // Fetch logs from the last 30 days for agent usage stats to improve performance
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const agentGenerations = await prisma.generationLog.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      agentId: true,
    },
  });

  // Count usage by agent
  const agentUsage: Record<string, number> = {};
  agentGenerations.forEach((log) => {
    const agentId = log.agentId || 'unknown';
    agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
  });

  // Fetch agent details
  const agentUsageData = await Promise.all(
    Object.entries(agentUsage).map(async ([agentId, count]) => {
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

  return agentUsageData
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Get top 10 most used agents
}

async function getRecentActivity() {
  const recentGenerations = await prisma.generationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      userId: true,
      agentId: true,
      createdAt: true,
      status: true,
      creditsUsed: true,
    },
  });

  // Fetch user names for recent activity
  const activityData = await Promise.all(
    recentGenerations.map(async (log) => {
      const userProfile = await getUserProfile(log.userId);
      return {
        id: log.id,
        userName: userProfile?.name || 'Unknown User',
        userId: log.userId,
        agentId: log.agentId,
        createdAt: log.createdAt.toISOString(),
        status: log.status,
        creditsUsed: log.creditsUsed,
      };
    })
  );

  return activityData;
}

/**
 * GET /api/admin/dashboard-stats
 * Admin-only endpoint to fetch dashboard statistics
 */
export const GET = withAuth(
  async () => {
    try {
      const [summaryCounts, agentUsageChartData, recentActivity] = await Promise.all([
        getSummaryCounts(),
        getAgentUsage(),
        getRecentActivity(),
      ]);

      const stats = {
        ...summaryCounts,
        agentUsageChartData,
        recentActivity,
      };

      return createApiResponse(stats, 200);
    } catch (error) {
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
