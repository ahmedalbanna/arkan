
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { IFileStorageService } from "@/modules/billing/domain/services/IFileStorageService";
import { IFileStorageServiceToken } from "@/modules/billing/domain/services/IFileStorageService";

@injectable()
export class UploadProfilePictureUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(IFileStorageServiceToken)
        private fileStorageService: IFileStorageService
    ) {}

    async execute(userId: string, file: Buffer, fileName: string, contentType: string): Promise<string> {
        const path = `profile_pictures/${userId}/${Date.now()}-${fileName}`;
        const url = await this.fileStorageService.upload(path, file, contentType);
        
        await this.userRepository.update(userId, { profilePictureUrl: url });
        return url;
    }
}
