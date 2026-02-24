
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";

@injectable()
export class DeductCreditsUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string, amount: number): Promise<number> {
        return this.userRepository.deductCredits(userId, amount);
    }
}
