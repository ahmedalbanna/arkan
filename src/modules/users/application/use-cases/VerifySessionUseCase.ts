
import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

@injectable()
export class VerifySessionUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(sessionCookie: string, checkRevoked?: boolean): Promise<{ uid: string, email?: string }> {
        return this.authRepository.verifySessionCookie(sessionCookie, checkRevoked);
    }
}
