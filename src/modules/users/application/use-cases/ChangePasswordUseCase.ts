import { inject, injectable } from "tsyringe";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { AuthCrypto } from "@/lib/utils/auth-crypto";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

@injectable()
export class ChangePasswordUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, currentPassword: string, newPassword: string): Promise<Result<void, UserError>> {
        try {
            // Only SQLite support for now
            if (!(this.authRepository instanceof SQLiteAuthRepository)) {
                return Result.fail(UserError.internal("Password change not supported for this provider."));
            }

            // 1. Verify current password
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            });

            if (!user || !user.passwordHash) {
                return Result.fail(UserError.notFound("User credentials not found."));
            }

            const isPasswordValid = await AuthCrypto.comparePassword(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return Result.fail(UserError.unauthorized("The current password you entered is incorrect."));
            }

            // 2. Update to new password
            return await this.authRepository.updatePassword(userId, newPassword);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
