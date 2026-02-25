import { inject, injectable } from "tsyringe";
import type { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { IFeatureRepositoryToken } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";

@injectable()
export class UpdateFeatureUseCase {
    constructor(
        @inject(IFeatureRepositoryToken)
        private featureRepository: IFeatureRepository
    ) {}

    async execute(id: string, data: Partial<Feature>): Promise<Feature> {
        return this.featureRepository.update(id, data);
    }
}
