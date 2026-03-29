import { inject, injectable } from "tsyringe";
import type { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { IFeatureRepositoryToken } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";

@injectable()
export class GetFeaturesUseCase {
    constructor(
        @inject(IFeatureRepositoryToken)
        private featureRepository: IFeatureRepository
    ) {}

    async execute(): Promise<Result<Feature[], AdminError>> {
        return this.featureRepository.getAll();
    }
}
