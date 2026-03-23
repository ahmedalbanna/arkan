import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { userFingerprints } from "@/infrastructure/db/schema";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc } from "drizzle-orm";

@injectable()
export class GetUserFingerprintsUseCase {
    async execute(userId: string): Promise<Result<any[], UserError>> {
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
