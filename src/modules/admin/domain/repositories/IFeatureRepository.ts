
import { Feature } from "../entities/Feature";

export interface IFeatureRepository {
    getAll(): Promise<Feature[]>;
    getById(id: string): Promise<Feature | null>;
    update(id: string, data: Partial<Feature>): Promise<Feature>;
}

export const IFeatureRepositoryToken = Symbol("IFeatureRepository");
