import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { securityAuditLogs, users } from "@/infrastructure/db/schema";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc } from "drizzle-orm";

@injectable()
export class GetSecurityAuditLogsUseCase {
    async execute(): Promise<Result<any[], UserError>> {
        try {
            const results = await db.select({
                id: securityAuditLogs.id,
                userId: securityAuditLogs.userId,
                userName: users.name,
                action: securityAuditLogs.action,
                details: securityAuditLogs.details,
                adminId: securityAuditLogs.adminId,
                timestamp: securityAuditLogs.timestamp,
                ip: securityAuditLogs.ip
            })
            .from(securityAuditLogs)
            .leftJoin(users, eq(securityAuditLogs.userId, users.id))
            .orderBy(desc(securityAuditLogs.timestamp))
            .limit(100);

            return Result.ok(results);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
