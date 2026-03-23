import { inject, injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq } from "drizzle-orm";
import { type IAuthRepository, IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";

@injectable()
export class DisableUserUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(userId: string, isDisabled: boolean): Promise<Result<void, UserError>> {
        try {
            await db.update(users)
                .set({ isDisabled, updatedAt: new Date().toISOString() })
                .where(eq(users.id, userId));

            // If disabling, also force logout all devices
            if (isDisabled && this.authRepository instanceof SQLiteAuthRepository) {
                await this.authRepository.revokeAllSessions(userId);
            }

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
