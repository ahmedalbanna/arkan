import { inject, injectable } from "tsyringe";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
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
}
