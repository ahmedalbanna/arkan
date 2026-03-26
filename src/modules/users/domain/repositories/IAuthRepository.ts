
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../errors/UserErrors";

export interface IAuthRepository {
    create(data: { email: string, password?: string, name: string }): Promise<Result<{ uid: string, email?: string }, UserError>>;
    updateEmail(userId: string, email: string): Promise<Result<void, UserError>>;
    updatePassword(userId: string, password: string): Promise<Result<void, UserError>>;
    deleteUser(userId: string): Promise<Result<void, UserError>>;
    verifyToken(token: string): Promise<Result<{ uid: string, email?: string }, UserError>>;
    createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<Result<string, UserError>>;
    verifySessionCookie(sessionCookie: string, checkRevoked?: boolean): Promise<Result<{ uid: string, email?: string }, UserError>>;
    signIn(email: string, password: string): Promise<Result<{ token: string, user: { uid: string, email: string, name: string } }, UserError>>;
    generatePasswordResetToken(email: string): Promise<Result<{ token: string, userId: string }, UserError>>;
    resetPasswordWithToken(token: string, password: string): Promise<Result<void, UserError>>;
    revokeAllSessions(userId: string): Promise<Result<void, UserError>>;
}

export const IAuthRepositoryToken = Symbol("IAuthRepository");
