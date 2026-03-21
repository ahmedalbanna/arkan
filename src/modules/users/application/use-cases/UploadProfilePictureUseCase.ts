
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IFileStorageService } from "@/modules/billing/domain/services/IFileStorageService";
import { IFileStorageServiceToken } from "@/modules/billing/domain/services/IFileStorageService";

import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class UploadProfilePictureUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IFileStorageServiceToken)
        private fileStorageService: IFileStorageService
    ) {}

    async execute(userId: string, file: Buffer, fileName: string, contentType: string): Promise<Result<string, UserError>> {
        try {
            const path = `profile_pictures/${userId}/${Date.now()}-${fileName}`;
            const url = await this.fileStorageService.upload(path, file, contentType);
            
            const updateResult = await this.userRepository.update(userId, { profilePictureUrl: url });
            if (updateResult.isFailure) return Result.fail(updateResult.error!);

            return Result.ok(url);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
