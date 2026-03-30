import { inject, injectable } from "tsyringe";
import type { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { IFeatureRepositoryToken } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";
import { UpdateFeatureSchema } from "../../domain/schemas/FeatureSchema";

@injectable()
export class UpdateFeatureUseCase {
    constructor(
        @inject(IFeatureRepositoryToken)
        private featureRepository: IFeatureRepository
    ) {}

    async execute(id: string, data: Partial<Feature>): Promise<Result<Feature, AdminError>> {
        // 1. Validate
        const validation = UpdateFeatureSchema.safeParse({ ...data, id });
        if (!validation.success) {
            return Result.fail(AdminError.validation(`Validation failed: ${validation.error.message}`));
        }

        // 2. Persist
        const result = await this.featureRepository.update(id, data);
        if (result.isFailure) {
            return Result.fail(AdminError.saveError(`Failed to update feature ${id}: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
