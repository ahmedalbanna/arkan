import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { securityAuditLogs } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class LogSecurityEventUseCase {
    async execute(params: {
        userId: string,
        action: 'lockdown' | 'restore' | 'session_revocation' | 'password_change',
        details?: string,
        adminId?: string,
        ip?: string
    }): Promise<Result<void, UserError>> {
        try {
            await db.insert(securityAuditLogs).values({
                ...params,
                timestamp: new Date().toISOString(),
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
