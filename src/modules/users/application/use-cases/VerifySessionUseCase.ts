
import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class VerifySessionUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(sessionCookie: string, checkRevoked?: boolean): Promise<Result<{ uid: string, email?: string }, UserError>> {
        return this.authRepository.verifySessionCookie(sessionCookie, checkRevoked);
    }
}
