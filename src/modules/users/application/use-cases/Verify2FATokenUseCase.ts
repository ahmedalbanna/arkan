import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { TwoFactorAuthService } from "../../infrastructure/services/TwoFactorAuthService";
import { eq } from "drizzle-orm";

@injectable()
export class Verify2FATokenUseCase {
    constructor(
        private tfaService: TwoFactorAuthService
    ) {}

    async execute(userId: string, token: string): Promise<Result<boolean, UserError>> {
        try {
            const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
            if (!user || !user.twoFactorSecret || !user.isTwoFactorEnabled) {
                return Result.fail(UserError.validation("2FA is not enabled for this user."));
            }

            const isValid = this.tfaService.verifyToken(token, user.twoFactorSecret);
            return Result.ok(isValid);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
