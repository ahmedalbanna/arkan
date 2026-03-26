import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class LoginUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(email: string, password: string): Promise<Result<{ token: string, user: { uid: string, email: string, name: string } }, UserError>> {
        return this.authRepository.signIn(email, password);
    }
}
