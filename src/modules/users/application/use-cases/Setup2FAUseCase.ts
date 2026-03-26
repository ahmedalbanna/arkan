import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { TwoFactorAuthService } from "../../infrastructure/services/TwoFactorAuthService";
import { eq } from "drizzle-orm";

@injectable()
export class Setup2FAUseCase {
    constructor(
        private tfaService: TwoFactorAuthService
    ) {}

    async execute(userId: string): Promise<Result<{ secret: string, qrCode: string }, UserError>> {
        try {
            const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
            if (!user) return Result.fail(UserError.notFound());

            const secret = this.tfaService.generateSecret();
            const qrCode = await this.tfaService.generateQrCode(user.email, secret);

            // Store secret but don't enable yet
            await db.update(users)
                .set({ twoFactorSecret: secret, updatedAt: new Date().toISOString() })
                .where(eq(users.id, userId));

            return Result.ok({ secret, qrCode });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
