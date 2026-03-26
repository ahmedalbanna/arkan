
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import { UserProfile } from "../../domain/entities/User";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class GetPaginatedUsersUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(options: { limit: number, lastVisibleId?: string }): Promise<Result<{ users: UserProfile[], hasNextPage: boolean, lastVisibleId: string | null }, UserError>> {
        return this.userRepository.getPaginated(options);
    }
}
