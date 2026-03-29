import { inject, injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users, generationLogs, transactions, agents, userFingerprints, loginHistory } from "@/infrastructure/db/schema";
import { IAdminStatsRepository, DashboardStats } from "../../domain/repositories/IAdminStatsRepository";
import { count, eq, sql, desc, gte, and, like } from "drizzle-orm";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";
import { type INotificationService, INotificationServiceToken } from "@/modules/users/domain/services/INotificationService";

@injectable()
export class SQLiteAdminStatsRepository implements IAdminStatsRepository {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}
    async getDashboardStats(): Promise<Result<DashboardStats, AdminError>> {
        try {
            const [userCountResult] = await db.select({ count: count() }).from(users);
            const [genLogCountResult] = await db.select({ count: count() }).from(generationLogs);
            const [pendingPaymentsResult] = await db.select({ count: count() })
                .from(transactions)
                .where(eq(transactions.status, 'pending'));

            const agentUsage = await db.select({
                agentId: generationLogs.agentId,
                name: agents.name,
                count: count(generationLogs.id),
            })
            .from(generationLogs)
            .leftJoin(agents, eq(generationLogs.agentId, agents.id))
            .groupBy(generationLogs.agentId)
            .orderBy(desc(count(generationLogs.id)))
            .limit(10);

            // Retention Stats
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

            const [activeUsersResult] = await db.select({ count: sql`count(distinct ${generationLogs.userId})` })
                .from(generationLogs)
                .where(gte(generationLogs.timestamp, thirtyDaysAgoStr));

            const topSpendersResult = await db.select({
                userName: users.name,
                totalSpent: sql`sum(${generationLogs.creditCost})`,
                generationCount: count(generationLogs.id),
            })
            .from(generationLogs)
            .leftJoin(users, eq(generationLogs.userId, users.id))
            .groupBy(generationLogs.userId)
            .orderBy(desc(sql`sum(${generationLogs.creditCost})`))
            .limit(5);

            const dailyTrendResult = await db.select({
                date: sql`strftime('%Y-%m-%d', ${generationLogs.timestamp})`,
                count: count(generationLogs.id),
            })
            .from(generationLogs)
            .where(gte(generationLogs.timestamp, thirtyDaysAgoStr))
            .groupBy(sql`strftime('%Y-%m-%d', ${generationLogs.timestamp})`)
            .orderBy(sql`strftime('%Y-%m-%d', ${generationLogs.timestamp})`);

            // Account Sharing Report (Users with > 3 devices)
            const accountSharingResult = await db.select({
                userId: userFingerprints.userId,
                userName: users.name,
                deviceCount: sql`count(distinct ${userFingerprints.fingerprint})`,
                lastLogin: sql`max(${userFingerprints.lastUsedAt})`,
            })
            .from(userFingerprints)
            .leftJoin(users, eq(userFingerprints.userId, users.id))
            .groupBy(userFingerprints.userId)
            .having(sql`count(distinct ${userFingerprints.fingerprint}) > 3`)
            .orderBy(desc(sql`count(distinct ${userFingerprints.fingerprint})`))
            .limit(10);

            // Notify Admins about Critical Risks (> 10 devices)
            const criticalRiskUsers = accountSharingResult.filter(r => Number(r.deviceCount) > 10);
            if (criticalRiskUsers.length > 0) {
                const admins = await db.query.users.findMany({ where: eq(users.role, 'admin') });
                for (const admin of admins) {
                    await this.notificationService.send(admin.id, {
                        title: 'Security Alert: Critical Account Sharing',
                        description: `${criticalRiskUsers.length} user(s) detected with over 10 unique devices.`,
                        link: '/admin/account-sharing'
                    });
                }
            }

            // Multi-country logins report
            const multiCountryResult = await db.select({
                userId: loginHistory.userId,
                userName: users.name,
                countries: sql`group_concat(distinct substr(${loginHistory.location}, instr(${loginHistory.location}, ',') + 2))`,
                loginCount: count(loginHistory.id),
            })
            .from(loginHistory)
            .leftJoin(users, eq(loginHistory.userId, users.id))
            .where(like(loginHistory.location, '%, %')) // Ensure it's a "City, Country" format
            .groupBy(loginHistory.userId)
            .having(sql`count(distinct substr(${loginHistory.location}, instr(${loginHistory.location}, ',') + 2)) > 1`)
            .orderBy(desc(count(loginHistory.id)))
            .limit(10);

            // Fetch some recent activity
            const recentGenLogs = await db.query.generationLogs.findMany({
                orderBy: [desc(generationLogs.timestamp)],
                limit: 5,
            });

            const recentTransactions = await db.query.transactions.findMany({
                orderBy: [desc(transactions.createdAt)],
                limit: 5,
            });

            const recentActivity = [
                ...recentGenLogs.map(log => ({
                    id: `log-${log.id}`,
                    type: 'generation',
                    userId: log.userId,
                    timestamp: log.timestamp,
                    details: `Generated content with agent ${log.agentId}`
                })),
                ...recentTransactions.map(tx => ({
                    id: `tx-${tx.id}`,
                    type: 'transaction',
                    userId: tx.userId,
                    timestamp: tx.createdAt,
                    details: `Transaction ${tx.id} - ${tx.status}`
                }))
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

            return Result.ok({
                totalUsers: userCountResult.count,
                totalGenerations: genLogCountResult.count,
                pendingPayments: pendingPaymentsResult.count,
                agentUsageChartData: agentUsage.map(u => ({
                    name: u.name || 'Unknown Agent',
                    agentId: u.agentId,
                    count: u.count,
                })),
                recentActivity,
                userRetentionStats: {
                    activeUsersLast30Days: Number(activeUsersResult.count || 0),
                    topSpenders: topSpendersResult.map(s => ({
                        userName: s.userName || 'Unknown User',
                        totalSpent: Number(s.totalSpent || 0),
                        generationCount: Number(s.generationCount || 0),
                    })),
                    dailyGenerationTrend: dailyTrendResult.map(t => ({
                        date: t.date as string,
                        count: Number(t.count || 0),
                    })),
                },
                accountSharingReport: accountSharingResult.map(r => ({
                    userId: r.userId,
                    userName: r.userName || 'Unknown User',
                    deviceCount: Number(r.deviceCount || 0),
                    lastLogin: r.lastLogin as string,
                })),
                multiCountryLogins: multiCountryResult.map(r => ({
                    userId: r.userId,
                    userName: r.userName || 'Unknown User',
                    countries: (r.countries as string || '').split(','),
                    loginCount: Number(r.loginCount || 0),
                }))
            });
        } catch (error: any) {
            return Result.fail(AdminError.databaseError(error.message));
        }
    }
}
