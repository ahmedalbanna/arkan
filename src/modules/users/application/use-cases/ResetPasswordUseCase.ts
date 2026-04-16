import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class ResetPasswordUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userIdOrToken: string, newPassword: string, isToken: boolean = false): Promise<Result<void, UserError>> {
        if (isToken) {
            return this.authRepository.resetPasswordWithToken(userIdOrToken, newPassword);
        }
        
        return this.authRepository.updatePassword(userIdOrToken, newPassword);
    }
}
