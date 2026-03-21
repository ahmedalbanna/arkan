
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { UserProfile } from "../../domain/entities/User";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(data: { email: string, password?: string, name: string, role: string, credits?: number }): Promise<Result<{ user: { uid: string, email?: string } }, UserError>> {
        const authResult = await this.authRepository.create({
            email: data.email,
            password: data.password,
            name: data.name
        });

        if (authResult.isFailure) {
            return Result.fail(authResult.error!);
        }

        const authUser = authResult.getValue();

        const newUserProfile: UserProfile = {
            id: authUser.uid,
            name: data.name,
            email: data.email,
            credits: data.credits ?? 10,
            role: data.role as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bio: '',
            profilePictureUrl: '',
            hasCompletedOnboarding: false,
            lastDailyCreditUpdate: new Date(0).toISOString(),
        };

        const saveResult = await this.userRepository.save(newUserProfile);
        if (saveResult.isFailure) {
            return Result.fail(saveResult.error!);
        }

        return Result.ok({ user: { uid: authUser.uid, email: authUser.email } });
    }
}
