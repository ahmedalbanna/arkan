import { inject, injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { type ITwoFactorAuthService, ITwoFactorAuthServiceToken } from "../../domain/services/ITwoFactorAuthService";
import { eq } from "drizzle-orm";

@injectable()
export class VerifyAndEnable2FAUseCase {
    constructor(
        @inject(ITwoFactorAuthServiceToken)
        private readonly tfaService: ITwoFactorAuthService
    ) {}

    async execute(userId: string, token: string): Promise<Result<void, UserError>> {
        try {
            const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
            if (!user || !user.twoFactorSecret) {
                return Result.fail(UserError.validation("2FA setup not initiated."));
            }

            const isValid = this.tfaService.verifyToken(token, user.twoFactorSecret);
            if (!isValid) {
                return Result.fail(UserError.unauthorized("Invalid 2FA code."));
            }

            await db.update(users)
                .set({ isTwoFactorEnabled: true, updatedAt: new Date().toISOString() })
                .where(eq(users.id, userId));

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
