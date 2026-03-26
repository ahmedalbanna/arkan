
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { UserProfile } from "../../domain/entities/User";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class UpdateUserProfileUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, data: Partial<UserProfile>, currentEmail?: string): Promise<Result<UserProfile, UserError>> {
        // If email is being updated, update it in Auth as well
        if (data.email && data.email !== currentEmail) {
            const authResult = await this.authRepository.updateEmail(userId, data.email);
            if (authResult.isFailure) {
                return Result.fail(authResult.error!);
            }
        }

        return this.userRepository.update(userId, data);
    }
}
