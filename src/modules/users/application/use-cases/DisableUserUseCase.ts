import { inject, injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq } from "drizzle-orm";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";
import { type LogSecurityEventUseCase } from "./LogSecurityEventUseCase";

@injectable()
export class DisableUserUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository,
        private logSecurityEventUseCase: LogSecurityEventUseCase
    ) {}

    async execute(userId: string, isDisabled: boolean, adminId?: string): Promise<Result<void, UserError>> {
        try {
            await db.update(users)
                .set({ isDisabled, updatedAt: new Date().toISOString() })
                .where(eq(users.id, userId));

            // Record security audit log
            await this.logSecurityEventUseCase.execute({
                userId,
                action: isDisabled ? 'lockdown' : 'restore',
                details: `Account ${isDisabled ? 'locked down' : 'restored'} by admin.`,
                adminId
            });

            // If disabling, also force logout all devices
            if (isDisabled && this.authRepository instanceof SQLiteAuthRepository) {
                await this.authRepository.revokeAllSessions(userId);
                
                await this.logSecurityEventUseCase.execute({
                    userId,
                    action: 'session_revocation',
                    details: 'All active sessions revoked due to account lockdown.',
                    adminId
                });
            }

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
