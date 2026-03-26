import { inject, injectable } from "tsyringe";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { type IPasswordService, IPasswordServiceToken } from "../../domain/services/IPasswordService";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";
import { type LogSecurityEventUseCase } from "./LogSecurityEventUseCase";

@injectable()
export class ChangePasswordUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository,
        @inject(IPasswordServiceToken)
        private passwordService: IPasswordService,
        private logSecurityEventUseCase: LogSecurityEventUseCase
    ) {}

    async execute(userId: string, currentPassword: string, newPassword: string): Promise<Result<void, UserError>> {
        try {
            // 1. Verify current password
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            });

            if (!user || !user.passwordHash) {
                return Result.fail(UserError.notFound("User credentials not found."));
            }

            const isPasswordValid = await this.passwordService.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return Result.fail(UserError.unauthorized("The current password you entered is incorrect."));
            }

            // 2. Update to new password
            const result = await this.authRepository.updatePassword(userId, newPassword);
            
            if (result.isSuccess) {
                await this.logSecurityEventUseCase.execute({
                    userId,
                    action: 'password_change',
                    details: 'User successfully updated their account password.'
                });
            }
            
            return result;
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
