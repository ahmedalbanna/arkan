
import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

@injectable()
export class CreateSessionUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(idToken: string, expiresIn: number): Promise<string> {
        return this.authRepository.createSessionCookie(idToken, { expiresIn });
    }
}
