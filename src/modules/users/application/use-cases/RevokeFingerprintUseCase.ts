import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { userFingerprints } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, and } from "drizzle-orm";

@injectable()
export class RevokeFingerprintUseCase {
    async execute(userId: string, fingerprintId: string): Promise<Result<void, UserError>> {
        try {
            await db.delete(userFingerprints)
                .where(and(
                    eq(userFingerprints.id, fingerprintId),
                    eq(userFingerprints.userId, userId)
                ));

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
