import { inject, injectable } from "tsyringe";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class LogoutAllDevicesUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string): Promise<Result<void, UserError>> {
        if (this.authRepository instanceof SQLiteAuthRepository) {
            return this.authRepository.revokeAllSessions(userId);
        }
        
        return Result.fail(UserError.internal("Global logout not supported for this provider."));
    }
}
