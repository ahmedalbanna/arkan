
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";

import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class DeductCreditsUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string, amount: number): Promise<Result<number, UserError>> {
        return this.userRepository.deductCredits(userId, amount);
    }
}
