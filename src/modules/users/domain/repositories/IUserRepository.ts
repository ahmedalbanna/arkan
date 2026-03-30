
import { User, UserProfile } from "../entities/User";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../errors/UserErrors";

export interface IUserRepository {
    getById(id: string): Promise<Result<User, UserError>>;
    save(user: UserProfile): Promise<Result<User, UserError>>;
    update(id: string, data: Partial<UserProfile>): Promise<Result<User, UserError>>;
    delete(id: string): Promise<Result<void, UserError>>;
    deductCredits(id: string, amount: number): Promise<Result<number, UserError>>;
    addCredits(id: string, amount: number): Promise<Result<void, UserError>>;
    getPaginated(options: { limit: number, lastVisibleId?: string }): Promise<Result<{ users: User[], hasNextPage: boolean, lastVisibleId: string | null }, UserError>>;
    getAdmins(): Promise<Result<User[], UserError>>;
}

export const IUserRepositoryToken = Symbol("IUserRepository");
