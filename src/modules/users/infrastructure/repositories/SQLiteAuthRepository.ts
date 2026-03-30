import { inject, injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users, passwordResets, userFingerprints } from "@/infrastructure/db/schema";
import { type IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { type IPasswordService, IPasswordServiceToken } from "../../domain/services/IPasswordService";
import { type ITokenService, ITokenServiceToken } from "../../domain/services/ITokenService";
import { eq, and, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SQLiteAuthRepository implements IAuthRepository {
    constructor(
        @inject(IPasswordServiceToken)
        private passwordService: IPasswordService,
        @inject(ITokenServiceToken)
        private tokenService: ITokenService
    ) {}

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
            const passwordHash = data.password ? await this.passwordService.hash(data.password) : null;
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
                isDisabled: false,
                tokenVersion: 1
            });

            return Result.ok({ uid, email: data.email });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async updateEmail(userId: string, email: string): Promise<Result<void, UserError>> {
        try {
            await db.update(users).set({ email, updatedAt: new Date().toISOString() }).where(eq(users.id, userId));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async updatePassword(userId: string, password: string): Promise<Result<void, UserError>> {
        try {
            const passwordHash = await this.passwordService.hash(password);
            await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, userId));
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
            const payload = await this.tokenService.verify<{ uid: string; email?: string; version?: number }>(token);
            if (!payload) {
                return Result.fail(UserError.unauthorized("Invalid or expired token"));
            }

            // SQLite specific: Check if token version matches the current user's version
            const user = await db.query.users.findFirst({
                where: eq(users.id, payload.uid),
            });

            if (!user || (payload.version !== undefined && user.tokenVersion !== payload.version)) {
                return Result.fail(UserError.unauthorized("Session has been invalidated. Please log in again."));
            }

            if (user.isDisabled) {
                return Result.fail(UserError.unauthorized("Your account has been disabled."));
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
            const payload = await this.tokenService.verify<any>(idToken);
            if (!payload) {
                return Result.fail(UserError.unauthorized("Invalid token for session creation"));
            }

            // Create a longer-lived session JWT
            const sessionToken = await this.tokenService.create(payload, options.expiresIn / 1000);
            return Result.ok(sessionToken);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async verifySessionCookie(sessionCookie: string, _checkRevoked: boolean = true): Promise<Result<{ uid: string, email?: string }, UserError>> {
        // In local auth, session cookie is just another JWT we verify same way
        return this.verifyToken(sessionCookie);
    }

    async generatePasswordResetToken(email: string): Promise<Result<{ token: string, userId: string }, UserError>> {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (!user) {
                return Result.fail(UserError.notFound("No user found with this email address."));
            }

            const token = uuidv4();
            const expiresAt = Date.now() + 3600000; // 1 hour

            await db.insert(passwordResets).values({
                userId: user.id,
                token,
                expiresAt,
                used: false,
            });

            return Result.ok({ token, userId: user.id });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async resetPasswordWithToken(token: string, password: string): Promise<Result<void, UserError>> {
        try {
            const reset = await db.query.passwordResets.findFirst({
                where: and(eq(passwordResets.token, token), eq(passwordResets.used, false)),
            });

            if (!reset || reset.expiresAt < Date.now()) {
                return Result.fail(UserError.unauthorized("Invalid or expired reset token."));
            }

            const passwordHash = await this.passwordService.hash(password);
            
            await db.transaction(async (tx) => {
                await tx.update(users)
                    .set({ passwordHash, updatedAt: new Date().toISOString() })
                    .where(eq(users.id, reset.userId));

                await tx.update(passwordResets)
                    .set({ used: true })
                    .where(eq(passwordResets.token, token));
            });

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async signIn(email: string, password: string): Promise<Result<{ token: string, user: { uid: string, email: string, name: string } }, UserError>> {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (!user || !user.passwordHash) {
                return Result.fail(UserError.unauthorized("Invalid email or password"));
            }

            if (user.isDisabled) {
                return Result.fail(UserError.unauthorized("Your account has been disabled. Please contact support."));
            }

            const isValid = await this.passwordService.compare(password, user.passwordHash);
            if (!isValid) {
                return Result.fail(UserError.unauthorized("Invalid email or password"));
            }

            const token = await this.tokenService.create({ 
                uid: user.id, 
                email: user.email, 
                version: user.tokenVersion ?? undefined
            });
            return Result.ok({
                token,
                user: { uid: user.id, email: user.email, name: user.name }
            });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async revokeAllSessions(userId: string): Promise<Result<void, UserError>> {
        try {
            await db.update(users)
                .set({ 
                    tokenVersion: sql`${users.tokenVersion} + 1`,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(users.id, userId));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getUserFingerprints(userId: string): Promise<Result<any[], UserError>> {
        try {
            const results = await db.query.userFingerprints.findMany({
                where: eq(userFingerprints.userId, userId),
                orderBy: [desc(userFingerprints.lastUsedAt)],
            });

            return Result.ok(results.map(f => ({
                ...f,
                metadata: f.metadata ? JSON.parse(f.metadata) : {}
            })));
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
