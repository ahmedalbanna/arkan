
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class DeleteUserUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string): Promise<Result<void, UserError>> {
        const authResult = await this.authRepository.deleteUser(userId);
        if (authResult.isFailure) return authResult;
        
        return this.userRepository.delete(userId);
    }
}
