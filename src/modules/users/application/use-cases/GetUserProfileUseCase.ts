
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import { UserProfile } from "../../domain/entities/User";

@injectable()
export class GetUserProfileUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string): Promise<UserProfile | null> {
        return this.userRepository.getById(userId);
    }
}
