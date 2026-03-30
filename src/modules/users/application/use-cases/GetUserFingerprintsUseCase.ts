import { injectable, inject } from "tsyringe";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";

@injectable()
export class GetUserFingerprintsUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string): Promise<Result<any[], UserError>> {
        return this.authRepository.getUserFingerprints(userId);
    }
}
