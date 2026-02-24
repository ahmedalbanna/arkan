
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";

@injectable()
export class AddCreditsUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string, amount: number): Promise<void> {
        return this.userRepository.addCredits(userId, amount);
    }
}
