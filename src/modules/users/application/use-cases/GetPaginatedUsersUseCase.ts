
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import { UserProfile } from "../../domain/entities/User";

@injectable()
export class GetPaginatedUsersUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(options: { limit: number, lastVisibleId?: string }): Promise<{ users: UserProfile[], hasNextPage: boolean, lastVisibleId: string | null }> {
        return this.userRepository.getPaginated(options);
    }
}
