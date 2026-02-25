import { inject, injectable } from "tsyringe";
import type { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { IFeatureRepositoryToken } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";

@injectable()
export class GetFeaturesUseCase {
    constructor(
        @inject(IFeatureRepositoryToken)
        private featureRepository: IFeatureRepository
    ) {}

    async execute(): Promise<Feature[]> {
        return this.featureRepository.getAll();
    }
}
