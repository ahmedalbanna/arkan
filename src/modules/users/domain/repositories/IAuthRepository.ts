
export interface IAuthRepository {
    create(data: { email: string, password?: string, name: string }): Promise<{ uid: string, email?: string }>;
    updateEmail(userId: string, email: string): Promise<void>;
    updatePassword(userId: string, password: string): Promise<void>;
    deleteUser(userId: string): Promise<void>;
}

export const IAuthRepositoryToken = Symbol("IAuthRepository");
