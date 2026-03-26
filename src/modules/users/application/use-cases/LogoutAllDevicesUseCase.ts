import { inject, injectable } from "tsyringe";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { type LogSecurityEventUseCase } from "./LogSecurityEventUseCase";

@injectable()
export class LogoutAllDevicesUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository,
        private logSecurityEventUseCase: LogSecurityEventUseCase
    ) {}

    async execute(userId: string): Promise<Result<void, UserError>> {
        if (this.authRepository instanceof SQLiteAuthRepository) {
            const result = await this.authRepository.revokeAllSessions(userId);
            
            if (result.isSuccess) {
                await this.logSecurityEventUseCase.execute({
                    userId,
                    action: 'session_revocation',
                    details: 'User manually revoked all active sessions.'
                });
            }
            
            return result;
        }
        
        return Result.fail(UserError.internal("Global logout not supported for this provider."));
    }
}
