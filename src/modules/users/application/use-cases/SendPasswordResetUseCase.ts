import { inject, injectable } from "tsyringe";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { type IEmailService, IEmailServiceToken } from "../../domain/services/IEmailService";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class SendPasswordResetUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository,
        @inject(IEmailServiceToken)
        private emailService: IEmailService
    ) {}

    async execute(email: string): Promise<Result<void, UserError>> {
        // Only SQLite support for now
        if (!(this.authRepository instanceof SQLiteAuthRepository)) {
            return Result.fail(UserError.internal("Password reset not supported for this provider."));
        }

        const tokenResult = await this.authRepository.generatePasswordResetToken(email);
        
        // Even if user not found, we don't return error for security, but we also won't send an email
        if (tokenResult.isFailure) {
            // Log it but return success to client
            console.warn(`Password reset requested for non-existent or error user: ${email}`);
            return Result.ok(); 
        }

        const { token } = tokenResult.getValue();
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/reset-password?token=${token}`;

        const emailResult = await this.emailService.sendPasswordResetEmail(email, resetLink);
        
        if (emailResult.isFailure) {
            return Result.fail(UserError.internal(emailResult.error?.message || "Failed to send reset email"));
        }

        return Result.ok();
    }
}
