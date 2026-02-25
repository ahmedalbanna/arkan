import "reflect-metadata";

import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

@injectable()
export class ResetPasswordUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, newPassword: string): Promise<void> {
        return this.authRepository.updatePassword(userId, newPassword);
    }
}
