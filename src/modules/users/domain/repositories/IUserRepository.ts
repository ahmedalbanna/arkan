
import { User, UserProfile } from "../entities/User";

export interface IUserRepository {
    getById(id: string): Promise<User | null>;
    save(user: UserProfile): Promise<User>;
    update(id: string, data: Partial<UserProfile>): Promise<User>;
    delete(id: string): Promise<void>;
    deductCredits(id: string, amount: number): Promise<number>;
    addCredits(id: string, amount: number): Promise<void>;
    getPaginated(options: { limit: number, lastVisibleId?: string }): Promise<{ users: User[], hasNextPage: boolean, lastVisibleId: string | null }>;
    getAdmins(): Promise<User[]>;
}

export const IUserRepositoryToken = Symbol("IUserRepository");
