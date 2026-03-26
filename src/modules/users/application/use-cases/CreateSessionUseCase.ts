
import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class CreateSessionUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(idToken: string, expiresIn: number): Promise<Result<string, UserError>> {
        return this.authRepository.createSessionCookie(idToken, { expiresIn });
    }
}
