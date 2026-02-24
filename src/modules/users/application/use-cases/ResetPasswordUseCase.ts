
import { inject, injectable } from "tsyringe";
import { IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

@injectable()
export class ResetPasswordUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, newPassword: string): Promise<void> {
        return this.authRepository.updatePassword(userId, newPassword);
    }
}
