
import { Feature } from "../entities/Feature";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../errors/AdminErrors";

export interface IFeatureRepository {
    getAll(): Promise<Result<Feature[], AdminError>>;
    getById(id: string): Promise<Result<Feature, AdminError>>;
    update(id: string, data: Partial<Feature>): Promise<Result<Feature, AdminError>>;
}

export const IFeatureRepositoryToken = Symbol("IFeatureRepository");
