
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { UserProfile } from "../../domain/entities/User";

@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(data: { email: string, password?: string, name: string, role: string, credits: number }): Promise<{ user: { uid: string, email?: string } }> {
        const authUser = await this.authRepository.create({
            email: data.email,
            password: data.password,
            name: data.name
        });

        const newUserProfile: UserProfile = {
            id: authUser.uid,
            name: data.name,
            email: data.email,
            credits: data.credits,
            role: data.role as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bio: '',
            profilePictureUrl: '',
            hasCompletedOnboarding: false,
            lastDailyCreditUpdate: new Date(0).toISOString(),
        };

        await this.userRepository.save(newUserProfile);

        return { user: { uid: authUser.uid, email: authUser.email } };
    }
}
