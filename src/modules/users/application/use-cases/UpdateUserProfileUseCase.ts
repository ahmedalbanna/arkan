
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { UserProfile } from "../../domain/entities/User";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { userUpdateSchema } from "../../domain/schemas/ProfileSchema";

@injectable()
export class UpdateUserProfileUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, data: Partial<UserProfile>, currentEmail?: string): Promise<Result<UserProfile, UserError>> {
        // 1. Validate
        const validation = userUpdateSchema.safeParse(data);
        if (!validation.success) {
            return Result.fail(UserError.validation(`Validation failed: ${validation.error.message}`));
        }

        // 2. Auth update (if email changed)
        if (data.email && data.email !== currentEmail) {
            const authResult = await this.authRepository.updateEmail(userId, data.email);
            if (authResult.isFailure) {
                return Result.fail(authResult.error!);
            }
        }

        // 3. Persist
        const result = await this.userRepository.update(userId, data);
        if (result.isFailure) {
            return Result.fail(UserError.saveError(`Failed to update profile: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
