/**
 * Admin Dashboard Stats Route - Migrated to New System
 *
 * هذا الملف يحتوي على route إحصائيات لوحة التحكم المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/core/api';
import { Analytics, PerformanceMonitor } from '@/core/performance';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Enhanced validation schema
const dashboardStatsQuerySchema = z.object({
    period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    includeCharts: z.boolean().default(true),
    includeActivity: z.boolean().default(true),
    includeUsage: z.boolean().default(true),
});

/**
 * Get summary counts with enhanced caching and error handling
 */
async function getSummaryCounts() {
    try {
        const [usersSnapshot, generationsSnapshot, pendingTransactionsSnapshot] = await Promise.all([
            adminDb.collection('users').count().get(),
            adminDb.collection('agent_generations').count().get(),
            adminDb.collection('transactions').where('status', '==', 'pending').count().get()
        ]);

        return {
            totalUsers: usersSnapshot.data().count,
            totalGenerations: generationsSnapshot.data().count,
            pendingPayments: pendingTransactionsSnapshot.data().count,
        };
    } catch (error) {
        console.error('Error getting summary counts:', error);
        return {
            totalUsers: 0,
            totalGenerations: 0,
            pendingPayments: 0,
        };
    }
}

/**
 * Get agent usage statistics with enhanced performance
 */
async function getAgentUsage(period: string = '30d') {
    try {
        // Calculate date range based on period
        const now = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        const agentGenerations = await adminDb.collection('agent_generations')
            .where('createdAt', '>=', startDate.toISOString())
            .get();

        const agentUsage: Record<string, number> = {};
        agentGenerations.forEach(doc => {
            const data = doc.data();
            const agentId = data.agentId;
            if (agentId) {
                agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
            }
        });

        // Get agent names and create usage data
        const agentUsagePromises = Object.entries(agentUsage)
            .map(async ([agentId, count]) => {
                try {
                    const agentDoc = await adminDb.collection('agents').doc(agentId).get();
                    const agentData = agentDoc.data();
                    return {
                        name: agentData?.name || 'Unknown Agent',
                        agentId,
                        count,
                        category: agentData?.category || 'unknown',
                    };
                } catch (error) {
                    console.warn(`Failed to get agent data for ${agentId}:`, error);
                    return {
                        name: 'Unknown Agent',
                        agentId,
                        count,
                        category: 'unknown',
                    };
                }
            });

        const agentUsageData = await Promise.all(agentUsagePromises);

        return agentUsageData
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Get top 10 most used agents

    } catch (error) {
        console.error('Error getting agent usage:', error);
        return [];
    }
}

/**
 * Get recent activity with enhanced user data
 */
async function getRecentActivity(limit: number = 5) {
    try {
        const recentGenerationsSnapshot = await adminDb.collection('agent_generations')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const activityPromises = recentGenerationsSnapshot.docs.map(async (doc) => {
            try {
                const data = doc.data();
                const userProfile = await getUserProfile(data.userId);

                return {
                    id: doc.id,
                    userName: userProfile?.name || 'Unknown User',
                    userEmail: userProfile?.email || 'unknown@example.com',
                    agentId: data.agentId,
                    creditCost: data.creditCost || 0,
                    createdAt: data.createdAt,
                    status: data.status || 'completed',
                };
            } catch (error) {
                console.warn(`Failed to get user data for generation ${doc.id}:`, error);
                return {
                    id: doc.id,
                    userName: 'Unknown User',
                    userEmail: 'unknown@example.com',
                    agentId: data.agentId,
                    creditCost: data.creditCost || 0,
                    createdAt: data.createdAt,
                    status: data.status || 'completed',
                };
            }
        });

        return Promise.all(activityPromises);
    } catch (error) {
        console.error('Error getting recent activity:', error);
        return [];
    }
}

/**
 * Get revenue statistics
 */
async function getRevenueStats(period: string = '30d') {
    try {
        const now = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        const transactionsSnapshot = await adminDb.collection('transactions')
            .where('createdAt', '>=', startDate.toISOString())
            .where('status', '==', 'completed')
            .get();

        const revenue = transactionsSnapshot.docs.reduce((sum, doc) => {
            const data = doc.data();
            return sum + (data.amount || 0);
        }, 0);

        const transactionCount = transactionsSnapshot.size;

        return {
            revenue,
            transactionCount,
            averageTransactionValue: transactionCount > 0 ? revenue / transactionCount : 0,
        };
    } catch (error) {
        console.error('Error getting revenue stats:', error);
        return {
            revenue: 0,
            transactionCount: 0,
            averageTransactionValue: 0,
        };
    }
}

/**
 * Get dashboard statistics with enhanced data and caching
 */
export const GET = withEnhancedAuth(async ({ request, user: requester, startTime }) => {
    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = dashboardStatsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleApiErrorEnhanced(
                new Error(`Query validation failed: ${queryValidation.error.message}`),
                'admin_dashboard_query_validation_failed',
                {
                    validationErrors: queryValidation.error.flatten().fieldErrors,
                    queryParams: Object.fromEntries(searchParams)
                }
            );
        }

        const { period, includeCharts, includeActivity, includeUsage } = queryValidation.data;

        // Execute all queries in parallel for better performance
        const [
            summaryCounts,
            agentUsageChartData,
            recentActivity,
            revenueStats
        ] = await Promise.all([
            getSummaryCounts(),
            includeUsage ? getAgentUsage(period) : Promise.resolve([]),
            includeActivity ? getRecentActivity(10) : Promise.resolve([]),
            getRevenueStats(period)
        ]);

        const stats = {
            ...summaryCounts,
            ...revenueStats,
            period,
            generatedAt: new Date().toISOString(),
            ...(includeCharts && { agentUsageChartData }),
            ...(includeActivity && { recentActivity }),
        };

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'admin_dashboard_stats_retrieved',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'admin/dashboard-stats',
                requesterId: requester.id,
                period,
                includeCharts,
                includeActivity,
                includeUsage,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            '/api/admin/dashboard-stats',
            'GET',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            stats,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'admin/dashboard-stats',
                requesterId: requester.id,
                period,
                dataPoints: {
                    summaryCounts: Object.keys(summaryCounts).length,
                    agentUsage: agentUsageChartData.length,
                    recentActivity: recentActivity.length,
                    revenueStats: Object.keys(revenueStats).length
                }
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'admin_dashboard_stats');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 20, // Allow frequent dashboard refreshes
        windowMs: 60000
    }
});

/**
 * Get real-time dashboard updates
 */
export const POST = withEnhancedAuth(async ({ request, user: requester, startTime }) => {
    try {
        const body = await request.json();
        const { refreshType } = body;

        let data = {};

        switch (refreshType) {
            case 'summary':
                data = await getSummaryCounts();
                break;
            case 'usage':
                data = await getAgentUsage('7d');
                break;
            case 'activity':
                data = await getRecentActivity(5);
                break;
            case 'revenue':
                data = await getRevenueStats('7d');
                break;
            default:
                return handleApiErrorEnhanced(
                    new Error(`Invalid refresh type: ${refreshType}`),
                    'admin_dashboard_invalid_refresh_type',
                    { refreshType }
                );
        }

        return createApiResponseEnhanced(
            {
                ...data,
                refreshType,
                timestamp: new Date().toISOString()
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'admin/dashboard-stats',
                requesterId: requester.id,
                refreshType
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'admin_dashboard_refresh');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 30, // Allow more frequent updates
        windowMs: 60000
    }
});
