
export interface IAuthRepository {
    create(data: { email: string, password?: string, name: string }): Promise<{ uid: string, email?: string }>;
    updateEmail(userId: string, email: string): Promise<void>;
    updatePassword(userId: string, password: string): Promise<void>;
    deleteUser(userId: string): Promise<void>;
    verifyToken(token: string): Promise<{ uid: string, email?: string }>;
    createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<string>;
    verifySessionCookie(sessionCookie: string, checkRevoked?: boolean): Promise<{ uid: string, email?: string }>;
}

export const IAuthRepositoryToken = Symbol("IAuthRepository");
