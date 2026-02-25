
import { UserProfile } from "../entities/User";

export interface IUserRepository {
    getById(id: string): Promise<UserProfile | null>;
    save(user: UserProfile): Promise<UserProfile>;
    update(id: string, data: Partial<UserProfile>): Promise<UserProfile>;
    delete(id: string): Promise<void>;
    deductCredits(id: string, amount: number): Promise<number>;
    addCredits(id: string, amount: number): Promise<void>;
    getPaginated(options: { limit: number, lastVisibleId?: string }): Promise<{ users: UserProfile[], hasNextPage: boolean, lastVisibleId: string | null }>;
    getAdmins(): Promise<UserProfile[]>;
}

export const IUserRepositoryToken = Symbol("IUserRepository");
