
import { injectable } from "tsyringe";
import { adminAuth } from "@/infrastructure/firebase/server-init";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class FirebaseAuthRepository implements IAuthRepository {
    async create(data: { email: string, password?: string, name: string }): Promise<Result<{ uid: string, email?: string }, UserError>> {
        try {
            const userRecord = await adminAuth.createUser({ 
                email: data.email, 
                password: data.password, 
                displayName: data.name 
            });
            return Result.ok({ uid: userRecord.uid, email: userRecord.email });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return Result.fail(UserError.conflict("This email is already in use."));
            }
            return Result.fail(UserError.internal(error.message));
        }
    }

    async updateEmail(userId: string, email: string): Promise<Result<void, UserError>> {
        try {
            await adminAuth.updateUser(userId, { email });
            return Result.ok();
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return Result.fail(UserError.conflict("This email is already in use."));
            }
            return Result.fail(UserError.internal(error.message));
        }
    }

    async updatePassword(userId: string, password: string): Promise<Result<void, UserError>> {
        try {
            await adminAuth.updateUser(userId, { password });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async deleteUser(userId: string): Promise<Result<void, UserError>> {
        try {
            await adminAuth.deleteUser(userId);
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async verifyToken(token: string): Promise<Result<{ uid: string, email?: string }, UserError>> {
        try {
            const decodedToken = await adminAuth.verifyIdToken(token, true);
            return Result.ok({ uid: decodedToken.uid, email: decodedToken.email });
        } catch (error: any) {
            return Result.fail(UserError.unauthorized(error.message));
        }
    }

    async createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<string> {
        return adminAuth.createSessionCookie(idToken, options);
    }

    async verifySessionCookie(sessionCookie: string, checkRevoked: boolean = true): Promise<{ uid: string, email?: string }> {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
        return { uid: decodedToken.uid, email: decodedToken.email };
    }
}
