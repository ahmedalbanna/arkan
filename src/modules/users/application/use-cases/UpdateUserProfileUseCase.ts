
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import { IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { UserProfile } from "../../domain/entities/User";

@injectable()
export class UpdateUserProfileUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, data: Partial<UserProfile>, currentEmail?: string): Promise<UserProfile> {
        // If email is being updated, update it in Auth as well
        if (data.email && data.email !== currentEmail) {
            await this.authRepository.updateEmail(userId, data.email);
        }

        return this.userRepository.update(userId, data);
    }
}
