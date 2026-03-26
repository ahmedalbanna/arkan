import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { securityAuditLogs, notifications, loginHistory } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { lt } from "drizzle-orm";

@injectable()
export class CleanupOldRecordsUseCase {
    /**
     * Deletes records older than the specified number of days.
     * Default is 90 days.
     */
    async execute(days: number = 90): Promise<Result<{ deletedLogs: number, deletedNotifications: number }, UserError>> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffStr = cutoffDate.toISOString();

            // 1. Cleanup Audit Logs
            const logsResult = await db.delete(securityAuditLogs)
                .where(lt(securityAuditLogs.timestamp, cutoffStr));

            // 2. Cleanup Notifications (only read ones or all?)
            // For now, let's clean up all notifications older than cutoff
            const notificationsResult = await db.delete(notifications)
                .where(lt(notifications.createdAt, cutoffStr));
            
            // 3. Cleanup Login History
            await db.delete(loginHistory)
                .where(lt(loginHistory.timestamp, cutoffStr));

            return Result.ok({
                deletedLogs: logsResult.changes,
                deletedNotifications: notificationsResult.changes
            });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
