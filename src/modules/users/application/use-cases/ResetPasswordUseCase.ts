
import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class ResetPasswordUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, newPassword: string): Promise<Result<void, UserError>> {
        return this.authRepository.updatePassword(userId, newPassword);
    }
}
