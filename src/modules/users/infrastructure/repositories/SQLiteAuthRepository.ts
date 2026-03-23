import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { AuthCrypto } from "@/lib/utils/auth-crypto";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SQLiteAuthRepository implements IAuthRepository {
    async create(data: { email: string, password?: string, name: string }): Promise<Result<{ uid: string, email?: string }, UserError>> {
        try {
            // Check if user already exists
            const existing = await db.query.users.findFirst({
                where: eq(users.email, data.email),
            });

            if (existing) {
                return Result.fail(UserError.conflict("This email is already in use."));
            }

            const uid = uuidv4();
            const passwordHash = data.password ? await AuthCrypto.hashPassword(data.password) : null;
            const now = new Date().toISOString();

            await db.insert(users).values({
                id: uid,
                email: data.email,
                name: data.name,
                passwordHash,
                role: 'user',
                createdAt: now,
                updatedAt: now,
                credits: 10, // Default credits for new users
            });

            return Result.ok({ uid, email: data.email });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async updateEmail(userId: string, email: string): Promise<Result<void, UserError>> {
        try {
            await db.update(users)
                .set({ email, updatedAt: new Date().toISOString() })
                .where(eq(users.id, userId));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async updatePassword(userId: string, password: string): Promise<Result<void, UserError>> {
        try {
            const passwordHash = await AuthCrypto.hashPassword(password);
            await db.update(users)
                .set({ passwordHash, updatedAt: new Date().toISOString() })
                .where(eq(users.id, userId));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async deleteUser(userId: string): Promise<Result<void, UserError>> {
        try {
            await db.delete(users).where(eq(users.id, userId));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async verifyToken(token: string): Promise<Result<{ uid: string, email?: string }, UserError>> {
        try {
            const payload = await AuthCrypto.verifyToken(token);
            if (!payload) {
                return Result.fail(UserError.unauthorized("Invalid or expired token"));
            }
            return Result.ok({ uid: payload.uid, email: payload.email });
        } catch (error: any) {
            return Result.fail(UserError.unauthorized(error.message));
        }
    }

    async createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<Result<string, UserError>> {
        try {
            // In our SQLite implementation, the idToken IS already our JWT or a temporary code.
            // For simplicity, we'll verify the token first.
            const payload = await AuthCrypto.verifyToken(idToken);
            if (!payload) {
                return Result.fail(UserError.unauthorized("Invalid token for session creation"));
            }

            // Create a longer-lived session JWT
            const sessionToken = await AuthCrypto.createToken(payload, options.expiresIn / 1000);
            return Result.ok(sessionToken);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async verifySessionCookie(sessionCookie: string, _checkRevoked: boolean = true): Promise<Result<{ uid: string, email?: string }, UserError>> {
        return this.verifyToken(sessionCookie);
    }

    /**
     * SQLite specific: Sign in logic (not in interface, but needed for internal use)
     */
    async signIn(email: string, password: string): Promise<Result<{ token: string, user: { uid: string, email: string, name: string } }, UserError>> {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (!user || !user.passwordHash) {
                return Result.fail(UserError.unauthorized("Invalid email or password"));
            }

            const isValid = await AuthCrypto.comparePassword(password, user.passwordHash);
            if (!isValid) {
                return Result.fail(UserError.unauthorized("Invalid email or password"));
            }

            const token = await AuthCrypto.createToken({ uid: user.id, email: user.email });
            return Result.ok({
                token,
                user: { uid: user.id, email: user.email, name: user.name }
            });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
