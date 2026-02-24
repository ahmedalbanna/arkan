
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import { IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

@injectable()
export class DeleteUserUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string): Promise<void> {
        await this.authRepository.deleteUser(userId);
        await this.userRepository.delete(userId);
    }
}
